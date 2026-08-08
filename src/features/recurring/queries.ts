import {and, asc, eq} from 'drizzle-orm';
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
    const templateRows = await db
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
        runScheduledDate: recurringTransactionRuns.scheduledDate,
        runTransactionId: recurringTransactionRuns.transactionId,
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
      .leftJoin(
        recurringTransactionRuns,
        and(
          eq(
            recurringTransactionRuns.templateId,
            recurringTransactionTemplates.id,
          ),
          eq(recurringTransactionRuns.targetMonth, targetMonth),
        ),
      )
      .orderBy(
        asc(recurringTransactionTemplates.dayOfMonth),
        asc(recurringTransactionTemplates.name),
      );

    const categoryRows = await db
      .select({id: categories.id, name: categories.name})
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder, categories.name);

    const paymentMethodRows = await db
      .select({id: paymentMethods.id, name: paymentMethods.name})
      .from(paymentMethods)
      .where(eq(paymentMethods.isActive, true))
      .orderBy(paymentMethods.name);

    const settingsRows = await db
      .select({defaultExchangeRate: appSettings.defaultExchangeRate})
      .from(appSettings)
      .limit(1);

    return {
      templates: templateRows.map(template => ({
        id: template.id,
        name: template.name,
        amount: template.amount,
        currency: template.currency,
        dayOfMonth: template.dayOfMonth,
        categoryId: template.categoryId,
        categoryName: template.categoryName,
        categoryIsActive: template.categoryIsActive,
        paymentMethodId: template.paymentMethodId,
        paymentMethodName: template.paymentMethodName,
        paymentMethodIsActive: template.paymentMethodIsActive,
        note: template.note,
        isActive: template.isActive,
        run: template.runScheduledDate
          ? {
              scheduledDate: template.runScheduledDate,
              transactionId: template.runTransactionId,
            }
          : null,
      })),
      categories: categoryRows,
      paymentMethods: paymentMethodRows,
      defaultExchangeRate: settingsRows[0]?.defaultExchangeRate ?? '36.6243',
    };
  });
}
