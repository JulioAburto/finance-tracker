import {getCurrentMonth, getMonthRange, normalizeMonth} from './month';

describe('month utilities', () => {
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
