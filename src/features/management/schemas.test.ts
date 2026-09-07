import {
  areValidThresholds,
  isValidRulePattern,
  readNonNegativeNumber,
  readPositiveNumber,
  readExchangeRate,
} from './schemas';

describe('management validation', () => {
  it.each(['', '0.001', '10.005', '10000000000', 'Infinity'])(
    'rechaza montos no persistibles en presupuestos: %s',
    value => {
      const formData = new FormData();
      formData.set('amount', value);
      expect(readNonNegativeNumber(formData, 'amount')).toBeNull();
      expect(readPositiveNumber(formData, 'amount')).toBeNull();
    },
  );

  it.each(['0.00001', '36.62431', '100000000', 'NaN'])(
    'rechaza tasas no persistibles en configuración: %s',
    value => {
      const formData = new FormData();
      formData.set('rate', value);
      expect(readExchangeRate(formData, 'rate')).toBeNull();
    },
  );

  it('conserva los cuatro decimales de la tasa configurada', () => {
    const formData = new FormData();
    formData.set('rate', '36.6243');
    expect(readExchangeRate(formData, 'rate')).toBe(36.6243);
  });
  it('acepta montos no negativos', () => {
    const formData = new FormData();
    formData.set('amount', '0');

    expect(readNonNegativeNumber(formData, 'amount')).toBe(0);
  });

  it('valida el orden de umbrales', () => {
    expect(areValidThresholds(70, 80, 100)).toBe(true);
    expect(areValidThresholds(80, 70, 100)).toBe(false);
  });

  it('rechaza expresiones regulares inválidas', () => {
    expect(isValidRulePattern('amazon|amzn')).toBe(true);
    expect(isValidRulePattern('[')).toBe(false);
  });
});
