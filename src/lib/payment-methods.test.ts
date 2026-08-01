import {
  getPaymentMethodLabel,
  getVisiblePaymentMethods,
  type PaymentMethodType,
} from './payment-methods';

const methods: {id: string; name: string; type: PaymentMethodType}[] = [
  {id: 'cash', name: 'Efectivo', type: 'cash'},
  {id: 'debit', name: 'Débito', type: 'debit'},
  {id: 'prepaid', name: 'Prepago', type: 'prepaid'},
  {id: 'credit', name: 'Tarjeta principal', type: 'credit_card'},
  {id: 'transfer', name: 'Transferencia', type: 'bank_transfer'},
];

describe('payment method visibility', () => {
  it('shows only cash, debit and prepaid when card mode is disabled', () => {
    expect(
      getVisiblePaymentMethods(methods, false).map(method => method.id),
    ).toEqual(['cash', 'debit', 'prepaid']);
  });

  it('shows every method when card mode is enabled', () => {
    expect(getVisiblePaymentMethods(methods, true)).toEqual(methods);
  });

  it('keeps a previously selected hidden method visible while editing', () => {
    expect(
      getVisiblePaymentMethods(methods, false, 'credit').map(
        method => method.id,
      ),
    ).toEqual(['cash', 'debit', 'prepaid', 'credit']);
  });

  it('uses explicit labels for the three base methods', () => {
    expect(getPaymentMethodLabel(methods[0])).toBe('Efectivo');
    expect(getPaymentMethodLabel(methods[1])).toBe('Tarjeta de débito');
    expect(getPaymentMethodLabel(methods[2])).toBe('Tarjeta prepago');
    expect(getPaymentMethodLabel(methods[3])).toBe('Tarjeta principal');
  });
});
