import {
  isSavingsCategoryName,
  validateTransactionInput,
} from "./schemas";

const validExpense = {
  name: "La Colonia",
  amount: "850",
  currency: "NIO",
  exchangeRate: "36.6243",
  date: "2026-07-05",
  type: "expense",
  categoryId: "00000000-0000-4000-8000-000000000002",
  paymentMethodId: "00000000-0000-4000-8000-000000000003",
  note: "",
};

describe("transaction validation", () => {
  it("acepta un gasto válido y convierte campos numéricos", () => {
    const result = validateTransactionInput(validExpense);

    expect(result).toEqual({
      success: true,
      data: {
        name: "La Colonia",
        amount: 850,
        currency: "NIO",
        exchangeRate: 36.6243,
        date: "2026-07-05",
        type: "expense",
        categoryId: validExpense.categoryId,
        paymentMethodId: validExpense.paymentMethodId,
        note: null,
      },
    });
  });

  it("exige categoría y método de pago para gastos", () => {
    const result = validateTransactionInput({
      ...validExpense,
      categoryId: "",
      paymentMethodId: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.categoryId).toBeDefined();
      expect(result.fieldErrors.paymentMethodId).toBeDefined();
    }
  });

  it("permite una transferencia sin categoría", () => {
    const result = validateTransactionInput({
      ...validExpense,
      type: "transfer",
      categoryId: "",
    });

    expect(result.success).toBe(true);
  });

  it("acepta un movimiento válido en USD", () => {
    const result = validateTransactionInput({
      ...validExpense,
      amount: "24.99",
      currency: "USD",
      type: "transfer",
      categoryId: "",
      paymentMethodId: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("USD");
      expect(result.data.amount).toBe(24.99);
      expect(result.data.type).toBe("transfer");
    }
  });

  it("rechaza montos, tasas y fechas inválidas", () => {
    const result = validateTransactionInput({
      ...validExpense,
      amount: "0",
      exchangeRate: "-1",
      date: "2026-02-30",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.amount).toBeDefined();
      expect(result.fieldErrors.exchangeRate).toBeDefined();
      expect(result.fieldErrors.date).toBeDefined();
    }
  });

  it("rechaza nombres demasiado largos", () => {
    const result = validateTransactionInput({
      ...validExpense,
      name: "a".repeat(181),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.name).toBeDefined();
    }
  });

  it("identifica la categoría de ahorro sin depender de mayúsculas", () => {
    expect(isSavingsCategoryName(" Ahorro ")).toBe(true);
    expect(isSavingsCategoryName("AHORRO")).toBe(true);
    expect(isSavingsCategoryName("Supermercado")).toBe(false);
  });
});
