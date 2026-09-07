'use server';

import {and, eq} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {requireCurrentUser} from '@/lib/auth/dal';
import {db} from '@/lib/db';
import {
  appSettings,
  categories,
  paymentMethods,
  recurringTransactionRuns,
  recurringTransactionTemplates,
  transactions,
} from '@/lib/db/schema';
import {withDatabaseDiagnostics} from '@/lib/observability/database-diagnostics';
import {isSavingsCategoryName} from '@/features/transactions/schemas';
import {
  isUuid,
  isValidRecurringMonth,
  planRecurringTransactionGeneration,
  readRecurringTemplateFormData,
  validateRecurringTemplateInput,
} from './schemas';
import type {
  RecurringTemplateForGeneration,
  RecurringTemplateInput,
} from './types';

function recurringPath(month: string): string {
  return isValidRecurringMonth(month)
    ? `/recurring?month=${month}`
    : '/recurring';
}

function finish(path: string, params: Record<string, string | number>): never {
  const [pathname] = path.split('?');
  const searchParams = new URLSearchParams(
    path.includes('?') ? path.split('?')[1] : '',
  );

  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }

  revalidatePath(pathname);
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  redirect(`${pathname}?${searchParams.toString()}`);
}

async function validateActiveReferences(
  input: RecurringTemplateInput,
): Promise<boolean> {
  if (!input.isActive) return true;
  if (!input.categoryId || !input.paymentMethodId) return false;

  const [categoryRows, paymentRows] = await Promise.all([
    db
      .select({id: categories.id, name: categories.name})
      .from(categories)
      .where(
        and(eq(categories.id, input.categoryId), eq(categories.isActive, true)),
      )
      .limit(1),
    db
      .select({id: paymentMethods.id})
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, input.paymentMethodId),
          eq(paymentMethods.isActive, true),
        ),
      )
      .limit(1),
  ]);

  return (
    categoryRows.length === 1 &&
    !isSavingsCategoryName(categoryRows[0].name) &&
    paymentRows.length === 1
  );
}

async function parseAndValidateTemplate(
  formData: FormData,
): Promise<
  | {success: true; data: RecurringTemplateInput}
  | {success: false; month: string}
> {
  const month = String(formData.get('month') ?? '');
  const validation = validateRecurringTemplateInput(
    readRecurringTemplateFormData(formData),
  );

  if (!validation.success) return {success: false, month};

  const referencesAreValid = await validateActiveReferences(validation.data);
  if (!referencesAreValid) return {success: false, month};

  return {success: true, data: validation.data};
}

function toTemplateDatabaseValues(input: RecurringTemplateInput) {
  return {
    name: input.name,
    amount: input.amount.toFixed(2),
    currency: input.currency,
    dayOfMonth: input.dayOfMonth,
    categoryId: input.categoryId,
    paymentMethodId: input.paymentMethodId,
    note: input.note,
    isActive: input.isActive,
    updatedAt: new Date(),
  };
}

export async function createRecurringTemplateAction(formData: FormData) {
  await requireCurrentUser();

  const result = await parseAndValidateTemplate(formData);
  if (!result.success) {
    finish(recurringPath(result.month), {status: 'invalid'});
  }

  await withDatabaseDiagnostics('recurring.template.create', () =>
    db
      .insert(recurringTransactionTemplates)
      .values(toTemplateDatabaseValues(result.data)),
  );

  finish(recurringPath(String(formData.get('month') ?? '')), {status: 'saved'});
}

export async function updateRecurringTemplateAction(
  id: string,
  formData: FormData,
) {
  await requireCurrentUser();

  const month = String(formData.get('month') ?? '');
  const result = await parseAndValidateTemplate(formData);
  if (!isUuid(id) || !result.success) {
    finish(recurringPath(month), {status: 'invalid'});
  }

  const updated = await withDatabaseDiagnostics(
    'recurring.template.update',
    () =>
      db
        .update(recurringTransactionTemplates)
        .set(toTemplateDatabaseValues(result.data))
        .where(eq(recurringTransactionTemplates.id, id))
        .returning({id: recurringTransactionTemplates.id}),
  );

  finish(recurringPath(month), {
    status: updated.length === 1 ? 'saved' : 'invalid',
  });
}

export async function generateRecurringTransactionsAction(formData: FormData) {
  await requireCurrentUser();

  const month = String(formData.get('month') ?? '');
  if (!isValidRecurringMonth(month)) {
    finish('/recurring', {status: 'invalid'});
  }

  const result = await withDatabaseDiagnostics('recurring.generate', () =>
    db.transaction(async tx => {
      const targetMonth = `${month}-01`;
      const [templateRows, runRows, settingsRows] = await Promise.all([
        tx
          .select({
            id: recurringTransactionTemplates.id,
            name: recurringTransactionTemplates.name,
            amount: recurringTransactionTemplates.amount,
            currency: recurringTransactionTemplates.currency,
            dayOfMonth: recurringTransactionTemplates.dayOfMonth,
            categoryId: recurringTransactionTemplates.categoryId,
            categoryIsActive: categories.isActive,
            categoryName: categories.name,
            paymentMethodId: recurringTransactionTemplates.paymentMethodId,
            paymentMethodIsActive: paymentMethods.isActive,
            note: recurringTransactionTemplates.note,
            isActive: recurringTransactionTemplates.isActive,
          })
          .from(recurringTransactionTemplates)
          .leftJoin(
            categories,
            eq(recurringTransactionTemplates.categoryId, categories.id),
          )
          .leftJoin(
            paymentMethods,
            eq(
              recurringTransactionTemplates.paymentMethodId,
              paymentMethods.id,
            ),
          ),
        tx
          .select({templateId: recurringTransactionRuns.templateId})
          .from(recurringTransactionRuns)
          .where(eq(recurringTransactionRuns.targetMonth, targetMonth)),
        tx
          .select({defaultExchangeRate: appSettings.defaultExchangeRate})
          .from(appSettings)
          .limit(1),
      ]);
      const templates: RecurringTemplateForGeneration[] = templateRows.map(
        template => ({
          ...template,
          amount: Number(template.amount),
        }),
      );
      const plan = planRecurringTransactionGeneration({
        templates,
        existingRunTemplateIds: new Set(runRows.map(run => run.templateId)),
        month,
        exchangeRate: Number(settingsRows[0]?.defaultExchangeRate ?? '36.6243'),
      });
      let created = 0;
      let duplicateRace = 0;

      for (const candidate of plan.candidates) {
        const [run] = await tx
          .insert(recurringTransactionRuns)
          .values({
            templateId: candidate.templateId,
            targetMonth,
            scheduledDate: candidate.scheduledDate,
          })
          .onConflictDoNothing({
            target: [
              recurringTransactionRuns.templateId,
              recurringTransactionRuns.targetMonth,
            ],
          })
          .returning({id: recurringTransactionRuns.id});

        if (!run) {
          duplicateRace += 1;
          continue;
        }

        const [transaction] = await tx
          .insert(transactions)
          .values(candidate.transaction)
          .returning({id: transactions.id});

        await tx
          .update(recurringTransactionRuns)
          .set({transactionId: transaction.id, updatedAt: new Date()})
          .where(eq(recurringTransactionRuns.id, run.id));

        created += 1;
      }

      const duplicate =
        plan.skipped.filter(skip => skip.reason === 'duplicate').length +
        duplicateRace;
      const inactive = plan.skipped.filter(
        skip => skip.reason === 'inactive',
      ).length;
      const incomplete = plan.skipped.filter(
        skip => skip.reason === 'incomplete',
      ).length;
      const invalid = plan.skipped.filter(
        skip => skip.reason === 'invalid',
      ).length;

      return {created, duplicate, inactive, incomplete, invalid};
    }),
  );

  finish(recurringPath(month), {
    status: 'generated',
    created: result.created,
    duplicate: result.duplicate,
    inactive: result.inactive,
    incomplete: result.incomplete,
    invalid: result.invalid,
  });
}
