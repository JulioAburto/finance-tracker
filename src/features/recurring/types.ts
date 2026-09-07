import type {Currency} from '@/lib/money/convert';

export type RecurringTemplateInput = {
  name: string;
  amount: number;
  currency: Currency;
  dayOfMonth: number;
  categoryId: string | null;
  paymentMethodId: string | null;
  note: string | null;
  isActive: boolean;
};

export type RecurringTemplateField =
  | 'name'
  | 'amount'
  | 'currency'
  | 'dayOfMonth'
  | 'categoryId'
  | 'paymentMethodId'
  | 'note'
  | 'isActive';

export type RecurringTemplateForGeneration = {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  dayOfMonth: number;
  categoryId: string | null;
  categoryIsActive: boolean | null;
  categoryName: string | null;
  paymentMethodId: string | null;
  paymentMethodIsActive: boolean | null;
  note: string | null;
  isActive: boolean;
};

export type RecurringTransactionDraft = {
  name: string;
  amount: string;
  currency: Currency;
  exchangeRate: string;
  amountUsd: string;
  amountNio: string;
  date: string;
  type: 'expense';
  categoryId: string;
  paymentMethodId: string;
  note: string | null;
  rawInput: string;
};

export type PlannedRecurringTransaction = {
  templateId: string;
  scheduledDate: string;
  transaction: RecurringTransactionDraft;
};

export type SkippedRecurringTemplateReason =
  'duplicate' | 'inactive' | 'incomplete' | 'invalid';

export type SkippedRecurringTemplate = {
  templateId: string;
  reason: SkippedRecurringTemplateReason;
};

export type RecurringGenerationPlan = {
  candidates: PlannedRecurringTransaction[];
  skipped: SkippedRecurringTemplate[];
};
