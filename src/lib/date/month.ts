const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const APP_TIME_ZONE = 'America/Managua';

export function getCurrentMonth(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;

  if (!year || !month) {
    throw new Error('Could not determine the current month');
  }

  return `${year}-${month}`;
}

export function normalizeMonth(value: string | undefined): string {
  return value && MONTH_PATTERN.test(value) ? value : getCurrentMonth();
}

// Solo el mes en curso admite recomendaciones basadas en el día actual.
export function getCurrentDayOfMonth(
  month: string,
  now = new Date(),
): number | null {
  if (month !== getCurrentMonth(now)) return null;

  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: APP_TIME_ZONE,
      day: 'numeric',
    }).format(now),
  );
}

export function getMonthRange(month: string): {
  startDate: string;
  endDate: string;
  budgetDate: string;
} {
  const [year, monthNumber] = month.split('-').map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1));

  return {
    startDate: `${month}-01`,
    endDate: nextMonth.toISOString().slice(0, 10),
    budgetDate: `${month}-01`,
  };
}

export function formatDisplayDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-NI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
