import {
  buildRecurringTransactionDraft,
  planRecurringTransactionGeneration,
  resolveRecurringDate,
  validateRecurringTemplateInput,
} from './schemas';
import type {RecurringTemplateForGeneration} from './types';

const activeTemplate: RecurringTemplateForGeneration = {
  id: '00000000-0000-4000-8000-000000000201',
  name: 'Netflix',
  amount: 9.99,
  currency: 'USD',
  dayOfMonth: 7,
  categoryId: '00000000-0000-4000-8000-000000000301',
  categoryIsActive: true,
  paymentMethodId: '00000000-0000-4000-8000-000000000401',
  paymentMethodIsActive: true,
  note: 'Streaming',
  isActive: true,
};

describe('recurring templates', () => {
  it('resuelve el último día cuando el día configurado no existe', () => {
    expect(resolveRecurringDate('2026-02', 30)).toBe('2026-02-28');
    expect(resolveRecurringDate('2028-02', 30)).toBe('2028-02-29');
  });

  it('rechaza activar una plantilla sin categoría ni método de pago', () => {
    const result = validateRecurringTemplateInput({
      name: 'ChatGPT',
      amount: '20',
      currency: 'USD',
      dayOfMonth: '3',
      categoryId: '',
      paymentMethodId: '',
      note: '',
      isActive: 'on',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.categoryId).toBeDefined();
      expect(result.fieldErrors.paymentMethodId).toBeDefined();
    }
  });

  it('permite guardar una plantilla inactiva incompleta', () => {
    const result = validateRecurringTemplateInput({
      name: 'Spotify',
      amount: '6.49',
      currency: 'USD',
      dayOfMonth: '30',
      categoryId: '',
      paymentMethodId: '',
      note: '',
      isActive: '',
    });

    expect(result).toEqual({
      success: true,
      data: {
        name: 'Spotify',
        amount: 6.49,
        currency: 'USD',
        dayOfMonth: 30,
        categoryId: null,
        paymentMethodId: null,
        note: null,
        isActive: false,
      },
    });
  });

  it('construye transacciones USD usando la tasa actual', () => {
    const draft = buildRecurringTransactionDraft({
      template: activeTemplate,
      month: '2026-08',
      exchangeRate: 36.6243,
    });

    expect(draft).toMatchObject({
      templateId: activeTemplate.id,
      scheduledDate: '2026-08-07',
      transaction: {
        name: 'Netflix',
        amount: '9.99',
        currency: 'USD',
        exchangeRate: '36.6243',
        amountUsd: '9.99',
        amountNio: '365.88',
        date: '2026-08-07',
        type: 'expense',
        categoryId: activeTemplate.categoryId,
        paymentMethodId: activeTemplate.paymentMethodId,
        note: 'Streaming',
        rawInput: `recurring:${activeTemplate.id}:2026-08`,
      },
    });
  });

  it('construye transacciones NIO usando la tasa actual', () => {
    const draft = buildRecurringTransactionDraft({
      template: {...activeTemplate, amount: 219, currency: 'NIO'},
      month: '2026-08',
      exchangeRate: 36.5,
    });

    expect(draft.transaction).toMatchObject({
      amount: '219.00',
      currency: 'NIO',
      exchangeRate: '36.5000',
      amountUsd: '6.00',
      amountNio: '219.00',
    });
  });

  it('omite duplicados cuando ya existe run para la plantilla y el mes', () => {
    const plan = planRecurringTransactionGeneration({
      templates: [activeTemplate],
      existingRunTemplateIds: new Set([activeTemplate.id]),
      month: '2026-08',
      exchangeRate: 36.6243,
    });

    expect(plan.candidates).toHaveLength(0);
    expect(plan.skipped).toEqual([
      {templateId: activeTemplate.id, reason: 'duplicate'},
    ]);
  });

  it('genera todas las plantillas activas del mes aunque la fecha sea futura', () => {
    const plan = planRecurringTransactionGeneration({
      templates: [
        {...activeTemplate, id: '00000000-0000-4000-8000-000000000202'},
        {
          ...activeTemplate,
          id: '00000000-0000-4000-8000-000000000203',
          dayOfMonth: 31,
        },
      ],
      existingRunTemplateIds: new Set(),
      month: '2026-08',
      exchangeRate: 36.6243,
    });

    expect(plan.candidates.map(candidate => candidate.scheduledDate)).toEqual([
      '2026-08-07',
      '2026-08-31',
    ]);
    expect(plan.skipped).toHaveLength(0);
  });

  it('omite plantillas inactivas e incompletas', () => {
    const inactiveTemplate = {...activeTemplate, isActive: false};
    const incompleteTemplate = {
      ...activeTemplate,
      id: '00000000-0000-4000-8000-000000000204',
      categoryId: null,
      categoryIsActive: null,
    };
    const plan = planRecurringTransactionGeneration({
      templates: [inactiveTemplate, incompleteTemplate],
      existingRunTemplateIds: new Set(),
      month: '2026-08',
      exchangeRate: 36.6243,
    });

    expect(plan.candidates).toHaveLength(0);
    expect(plan.skipped).toEqual([
      {templateId: inactiveTemplate.id, reason: 'inactive'},
      {templateId: incompleteTemplate.id, reason: 'incomplete'},
    ]);
  });
});
