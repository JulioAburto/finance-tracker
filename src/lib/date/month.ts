const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function normalizeMonth(value: string | undefined): string {
  return value && MONTH_PATTERN.test(value) ? value : getCurrentMonth();
}

export function getMonthRange(month: string): {
  startDate: string;
  endDate: string;
  budgetDate: string;
} {
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1));

  return {
    startDate: `${month}-01`,
    endDate: nextMonth.toISOString().slice(0, 10),
    budgetDate: `${month}-01`,
  };
}
