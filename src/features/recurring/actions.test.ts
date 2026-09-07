import {db} from '@/lib/db';
import {
  createRecurringTemplateAction,
  updateRecurringTemplateAction,
} from './actions';

jest.mock('@/lib/auth/dal', () => ({requireCurrentUser: jest.fn()}));
jest.mock('@/lib/db', () => ({
  db: {select: jest.fn(), insert: jest.fn(), update: jest.fn()},
}));
jest.mock('next/cache', () => ({revalidatePath: jest.fn()}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
jest.mock('@/lib/observability/database-diagnostics', () => ({
  withDatabaseDiagnostics: (_name: string, operation: () => unknown) =>
    operation(),
}));

describe('recurring template mutations', () => {
  it.each(['create', 'update'])(
    'rechaza Ahorro activo en %s sin escribir',
    async action => {
      const select = jest.mocked(db.select);
      select.mockReset();
      for (const rows of [
        [{id: '00000000-0000-4000-8000-000000000301', name: ' AHORRO '}],
        [{id: '00000000-0000-4000-8000-000000000401'}],
      ]) {
        select.mockReturnValueOnce({
          from: () => ({where: () => ({limit: () => Promise.resolve(rows)})}),
        } as unknown as ReturnType<typeof db.select>);
      }

      const formData = new FormData();
      for (const [key, value] of Object.entries({
        name: 'Aporte mensual',
        amount: '50',
        currency: 'USD',
        dayOfMonth: '7',
        categoryId: '00000000-0000-4000-8000-000000000301',
        paymentMethodId: '00000000-0000-4000-8000-000000000401',
        isActive: 'on',
        month: '2026-09',
      }))
        formData.set(key, value);

      const result =
        action === 'create'
          ? createRecurringTemplateAction(formData)
          : updateRecurringTemplateAction(
              '00000000-0000-4000-8000-000000000201',
              formData,
            );
      await expect(result).rejects.toThrow(
        'redirect:/recurring?month=2026-09&status=invalid',
      );
      expect(db.insert).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    },
  );
});
