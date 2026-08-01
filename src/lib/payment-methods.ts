export type PaymentMethodType =
  | 'cash'
  | 'debit'
  | 'credit_card'
  | 'bank_transfer'
  | 'prepaid'
  | 'agency'
  | 'other';

const CORE_PAYMENT_METHOD_TYPES = new Set<PaymentMethodType>([
  'cash',
  'debit',
  'prepaid',
]);

const CORE_PAYMENT_METHOD_LABELS: Partial<Record<PaymentMethodType, string>> = {
  cash: 'Efectivo',
  debit: 'Tarjeta de débito',
  prepaid: 'Tarjeta prepago',
};

export function getVisiblePaymentMethods<
  T extends {id: string; type: PaymentMethodType},
>(
  methods: T[],
  creditCardModeEnabled: boolean,
  selectedMethodId?: string,
): T[] {
  if (creditCardModeEnabled) return methods;

  return methods.filter(
    method =>
      CORE_PAYMENT_METHOD_TYPES.has(method.type) ||
      method.id === selectedMethodId,
  );
}

export function getPaymentMethodLabel(method: {
  name: string;
  type: PaymentMethodType;
}): string {
  return CORE_PAYMENT_METHOD_LABELS[method.type] ?? method.name;
}
