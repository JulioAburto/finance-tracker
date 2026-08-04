import {convertMoney} from '@/lib/money/convert';
import type {
  PlannedRecurringTransaction,
  RecurringGenerationPlan,
  RecurringTemplateField,
  RecurringTemplateForGeneration,
  RecurringTemplateInput,
  SkippedRecurringTemplateReason,
} from './types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

type RawRecurringTemplateInput = Record<RecurringTemplateField, string>;

export type RecurringTemplateValidationResult =
  | {success: true; data: RecurringTemplateInput}
  | {
      success: false;
      fieldErrors: Partial<Record<RecurringTemplateField, string>>;
    };

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isValidRecurringMonth(value: string): boolean {
  return MONTH_PATTERN.test(value);
}

function optionalUuid(value: string): string | null {
  return value.trim() || null;
}

function readBoolean(value: string): boolean {
  return value === 'on' || value === 'true';
}

export function readRecurringTemplateFormData(
  formData: FormData,
): RawRecurringTemplateInput {
  return {
    name: String(formData.get('name') ?? ''),
    amount: String(formData.get('amount') ?? ''),
    currency: String(formData.get('currency') ?? ''),
    dayOfMonth: String(formData.get('dayOfMonth') ?? ''),
    categoryId: String(formData.get('categoryId') ?? ''),
    paymentMethodId: String(formData.get('paymentMethodId') ?? ''),
    note: String(formData.get('note') ?? ''),
    isActive: String(formData.get('isActive') ?? ''),
  };
}

export function validateRecurringTemplateInput(
  raw: RawRecurringTemplateInput,
): RecurringTemplateValidationResult {
  const fieldErrors: Partial<Record<RecurringTemplateField, string>> = {};
  const name = raw.name.trim();
  const amount = Number(raw.amount);
  const dayOfMonth = Number(raw.dayOfMonth);
  const categoryId = optionalUuid(raw.categoryId);
  const paymentMethodId = optionalUuid(raw.paymentMethodId);
  const note = raw.note.trim() || null;
  const isActive = readBoolean(raw.isActive);

  if (!name) fieldErrors.name = 'El nombre es obligatorio.';
  else if (name.length > 180)
    fieldErrors.name = 'El nombre no puede superar 180 caracteres.';

  if (!Number.isFinite(amount) || amount <= 0)
    fieldErrors.amount = 'El monto debe ser mayor que cero.';

  if (raw.currency !== 'USD' && raw.currency !== 'NIO')
    fieldErrors.currency = 'Selecciona USD o NIO.';

  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    fieldErrors.dayOfMonth = 'El día debe estar entre 1 y 31.';
  }

  if (categoryId && !isUuid(categoryId)) {
    fieldErrors.categoryId = 'La categoría no es válida.';
  }

  if (paymentMethodId && !isUuid(paymentMethodId)) {
    fieldErrors.paymentMethodId = 'El método de pago no es válido.';
  }

  if (isActive) {
    if (!categoryId) fieldErrors.categoryId = 'La categoría es obligatoria.';
    if (!paymentMethodId)
      fieldErrors.paymentMethodId = 'El método de pago es obligatorio.';
  }

  if (note && note.length > 1000)
    fieldErrors.note = 'La nota no puede superar 1000 caracteres.';

  if (Object.keys(fieldErrors).length > 0) {
    return {success: false, fieldErrors};
  }

  return {
    success: true,
    data: {
      name,
      amount,
      currency: raw.currency as 'USD' | 'NIO',
      dayOfMonth,
      categoryId,
      paymentMethodId,
      note,
      isActive,
    },
  };
}

export function resolveRecurringDate(
  month: string,
  dayOfMonth: number,
): string {
  if (!MONTH_PATTERN.test(month)) {
    throw new Error('Month must use YYYY-MM format');
  }

  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error('Day of month must be between 1 and 31');
  }

  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const scheduledDay = Math.min(dayOfMonth, lastDay);

  return `${month}-${String(scheduledDay).padStart(2, '0')}`;
}

export function buildRecurringTransactionDraft({
  template,
  month,
  exchangeRate,
}: {
  template: RecurringTemplateForGeneration;
  month: string;
  exchangeRate: number;
}): PlannedRecurringTransaction {
  if (!template.categoryId || !template.paymentMethodId) {
    throw new Error('Recurring template must have category and payment method');
  }

  const {amountUsd, amountNio} = convertMoney({
    amount: template.amount,
    currency: template.currency,
    exchangeRate,
  });
  const scheduledDate = resolveRecurringDate(month, template.dayOfMonth);

  return {
    templateId: template.id,
    scheduledDate,
    transaction: {
      name: template.name,
      amount: template.amount.toFixed(2),
      currency: template.currency,
      exchangeRate: exchangeRate.toFixed(4),
      amountUsd: amountUsd.toFixed(2),
      amountNio: amountNio.toFixed(2),
      date: scheduledDate,
      type: 'expense',
      categoryId: template.categoryId,
      paymentMethodId: template.paymentMethodId,
      note: template.note,
      rawInput: `recurring:${template.id}:${month}`,
    },
  };
}

function getSkipReason(
  template: RecurringTemplateForGeneration,
): SkippedRecurringTemplateReason | null {
  if (!template.isActive) return 'inactive';

  if (
    !template.categoryId ||
    !template.paymentMethodId ||
    template.categoryIsActive !== true ||
    template.paymentMethodIsActive !== true
  ) {
    return 'incomplete';
  }

  return null;
}

export function planRecurringTransactionGeneration({
  templates,
  existingRunTemplateIds,
  month,
  exchangeRate,
}: {
  templates: RecurringTemplateForGeneration[];
  existingRunTemplateIds: Set<string>;
  month: string;
  exchangeRate: number;
}): RecurringGenerationPlan {
  const candidates: PlannedRecurringTransaction[] = [];
  const skipped: RecurringGenerationPlan['skipped'] = [];

  for (const template of templates) {
    if (existingRunTemplateIds.has(template.id)) {
      skipped.push({templateId: template.id, reason: 'duplicate'});
      continue;
    }

    const reason = getSkipReason(template);
    if (reason) {
      skipped.push({templateId: template.id, reason});
      continue;
    }

    candidates.push(
      buildRecurringTransactionDraft({template, month, exchangeRate}),
    );
  }

  return {candidates, skipped};
}
