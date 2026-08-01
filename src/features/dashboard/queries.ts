import {and, desc, eq, gte, lt} from 'drizzle-orm';
import {requireCurrentUser} from '@/lib/auth/dal';
import {db} from '@/lib/db';
import {
  categories,
  monthlyBudgetCategories,
  monthlyBudgets,
  transactions,
} from '@/lib/db/schema';
import {getMonthRange} from '@/lib/date/month';
import {withDatabaseDiagnostics} from '@/lib/observability/database-diagnostics';
import {calculateDashboardSummary} from './calculations';

export async function getDashboardData(month: string) {
  await requireCurrentUser();

  return withDatabaseDiagnostics('dashboard.load', async () => {
    const {startDate, endDate, budgetDate} = getMonthRange(month);

    const [budgetRows, categoryBudgetRows, transactionRows] = await Promise.all(
      [
        db
          .select({
            id: monthlyBudgets.id,
            salaryUsd: monthlyBudgets.salaryUsd,
            expectedSavingsUsd: monthlyBudgets.expectedSavingsUsd,
          })
          .from(monthlyBudgets)
          .where(eq(monthlyBudgets.month, budgetDate))
          .limit(1),
        db
          .select({
            categoryId: categories.id,
            categoryName: categories.name,
            amountUsd: monthlyBudgetCategories.amountUsd,
            warningThreshold: categories.warningThreshold,
            dangerThreshold: categories.dangerThreshold,
            exceededThreshold: categories.exceededThreshold,
          })
          .from(monthlyBudgetCategories)
          .innerJoin(
            monthlyBudgets,
            eq(monthlyBudgetCategories.monthlyBudgetId, monthlyBudgets.id),
          )
          .innerJoin(
            categories,
            eq(monthlyBudgetCategories.categoryId, categories.id),
          )
          .where(eq(monthlyBudgets.month, budgetDate))
          .orderBy(categories.sortOrder),
        db
          .select({
            id: transactions.id,
            name: transactions.name,
            date: transactions.date,
            type: transactions.type,
            amountUsd: transactions.amountUsd,
            categoryId: transactions.categoryId,
            categoryName: categories.name,
          })
          .from(transactions)
          .leftJoin(categories, eq(transactions.categoryId, categories.id))
          .where(
            and(
              gte(transactions.date, startDate),
              lt(transactions.date, endDate),
            ),
          )
          .orderBy(desc(transactions.date), desc(transactions.createdAt)),
      ],
    );
    const budget = budgetRows[0] ?? null;

    const transactionData = transactionRows.map(transaction => ({
      ...transaction,
      amountUsd: Number(transaction.amountUsd),
    }));
    const summary = calculateDashboardSummary({
      budget: budget
        ? {
            salaryUsd: Number(budget.salaryUsd),
            expectedSavingsUsd: Number(budget.expectedSavingsUsd),
          }
        : null,
      budgetCategories: categoryBudgetRows.map(category => ({
        ...category,
        amountUsd: Number(category.amountUsd),
      })),
      transactions: transactionData,
      dayOfMonth: new Date().getDate(),
    });

    return {
      summary,
      latestTransactions: transactionData.slice(0, 5),
      uncategorizedTransactions: transactionData.filter(
        transaction =>
          transaction.type === 'expense' && transaction.categoryId === null,
      ),
      hasBudget: budget !== null,
    };
  });
}
