import {
  getCurrentDayOfMonth,
  getCurrentMonth,
  getMonthRange,
  normalizeMonth,
} from './month';

describe('month utilities', () => {
  it.each([
    ['2026-09', '2026-09-20T05:59:59.000Z', 19],
    ['2026-09', '2026-09-20T06:00:00.000Z', 20],
    ['2026-08', '2026-09-01T05:59:59.000Z', 31],
    ['2026-09', '2026-09-01T06:00:00.000Z', 1],
    ['2026-08', '2026-09-06T12:00:00.000Z', null],
    ['2026-10', '2026-09-06T12:00:00.000Z', null],
    ['2026-12', '2027-01-01T05:59:59.000Z', 31],
    ['2026-12', '2027-01-01T06:00:00.000Z', null],
  ] as const)(
    'resuelve el día local de %s en %s',
    (month, timestamp, expected) => {
      expect(getCurrentDayOfMonth(month, new Date(timestamp))).toBe(expected);
    },
  );
  it('uses the Nicaragua month when UTC is already in the next month', () => {
    const utcDate = new Date('2026-08-01T00:30:00.000Z');

    expect(getCurrentMonth(utcDate)).toBe('2026-07');
  });

  it('changes month after midnight in Nicaragua', () => {
    const utcDate = new Date('2026-08-01T06:30:00.000Z');

    expect(getCurrentMonth(utcDate)).toBe('2026-08');
  });

  it('keeps a valid selected month', () => {
    expect(normalizeMonth('2026-07')).toBe('2026-07');
  });

  it('builds an exclusive range for December', () => {
    expect(getMonthRange('2026-12')).toEqual({
      startDate: '2026-12-01',
      endDate: '2027-01-01',
      budgetDate: '2026-12-01',
    });
  });
});
