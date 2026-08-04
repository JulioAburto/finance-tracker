import {asc, eq} from 'drizzle-orm';
import {requireCurrentUser} from '@/lib/auth/dal';
import {db} from '@/lib/db';
import {
  appSettings,
  categories,
  paymentMethods,
  recurringTransactionRuns,
  recurringTransactionTemplates,
} from '@/lib/db/schema';
import {withDatabaseDiagnostics} from '@/lib/observability/database-diagnostics';

export async function getRecurringPageData(month: string) {
  await requireCurrentUser();

  return withDatabaseDiagnostics('recurring.page.load', async () => {
    const targetMonth = `${month}-01`;
    const [
      templateRows,
      categoryRows,
      paymentMethodRows,
      runRows,
      settingsRows,
    ] = await Promise.all([
      db
        .select({
          id: recurringTransactionTemplates.id,
          name: recurringTransactionTemplates.name,
          amount: recurringTransactionTemplates.amount,
          currency: recurringTransactionTemplates.currency,
          dayOfMonth: recurringTransactionTemplates.dayOfMonth,
          categoryId: recurringTransactionTemplates.categoryId,
          categoryName: categories.name,
          categoryIsActive: categories.isActive,
          paymentMethodId: recurringTransactionTemplates.paymentMethodId,
          paymentMethodName: paymentMethods.name,
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
          eq(recurringTransactionTemplates.paymentMethodId, paymentMethods.id),
        )
        .orderBy(
          asc(recurringTransactionTemplates.dayOfMonth),
          asc(recurringTransactionTemplates.name),
        ),
      db
        .select({id: categories.id, name: categories.name})
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(categories.sortOrder, categories.name),
      db
        .select({id: paymentMethods.id, name: paymentMethods.name})
        .from(paymentMethods)
        .where(eq(paymentMethods.isActive, true))
        .orderBy(paymentMethods.name),
      db
        .select({
          templateId: recurringTransactionRuns.templateId,
          scheduledDate: recurringTransactionRuns.scheduledDate,
          transactionId: recurringTransactionRuns.transactionId,
        })
        .from(recurringTransactionRuns)
        .where(eq(recurringTransactionRuns.targetMonth, targetMonth)),
      db
        .select({defaultExchangeRate: appSettings.defaultExchangeRate})
        .from(appSettings)
        .limit(1),
    ]);

    const runByTemplateId = new Map(
      runRows.map(run => [run.templateId, run] as const),
    );

    return {
      templates: templateRows.map(template => ({
        ...template,
        run: runByTemplateId.get(template.id) ?? null,
      })),
      categories: categoryRows,
      paymentMethods: paymentMethodRows,
      defaultExchangeRate: settingsRows[0]?.defaultExchangeRate ?? '36.6243',
    };
  });
}
