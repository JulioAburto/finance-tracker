import {db, databaseClient} from './index';
import {convertMoney} from '../money/convert';
import {
  appSettings,
  categories,
  merchantRules,
  monthlyBudgetCategories,
  monthlyBudgets,
  paymentMethods,
  transactions,
} from './schema';

const categorySeed = [
  {name: 'Ahorro', monthlyBudgetUsd: '450.00', isEssential: true},
  {name: 'Servicios', monthlyBudgetUsd: '60.00', isEssential: true},
  {
    name: 'Productividad',
    monthlyBudgetUsd: '25.00',
    isEssential: true,
  },
  {name: 'Entretenimiento', monthlyBudgetUsd: '45.00', isEssential: false},
  {
    name: 'Supermercado',
    monthlyBudgetUsd: '165.00',
    isEssential: true,
  },
  {name: 'Delivery', monthlyBudgetUsd: '70.00', isEssential: false},
  {
    name: 'Novia / salidas / regalos',
    monthlyBudgetUsd: '110.00',
    isEssential: false,
  },
  {
    name: 'Amazon / agencias',
    monthlyBudgetUsd: '70.00',
    isEssential: false,
  },
  {name: 'Ropa', monthlyBudgetUsd: '45.00', isEssential: false},
  {name: 'Salud', monthlyBudgetUsd: '55.00', isEssential: true},
  {name: 'Transporte', monthlyBudgetUsd: '35.00', isEssential: false},
  {
    name: 'Efectivo operativo',
    monthlyBudgetUsd: '100.00',
    isEssential: false,
  },
  {name: 'Varios', monthlyBudgetUsd: '70.00', isEssential: false},
] as const;

const paymentMethodSeed = [
  {name: 'Efectivo', type: 'cash'},
  {name: 'Débito', type: 'debit'},
  {name: 'Tarjeta de crédito', type: 'credit_card'},
  {name: 'Transferencia', type: 'bank_transfer'},
  {name: 'Prepago', type: 'prepaid'},
  {name: 'Agencia', type: 'agency'},
  {name: 'Otro', type: 'other'},
] as const;

const merchantRuleSeed = [
  {pattern: 'la colonia', categoryName: 'Supermercado', priority: 10},
  {
    pattern: 'mandaditos|sisu|sorbetes|la placita|glorieta|ambros',
    categoryName: 'Delivery',
    priority: 20,
  },
  {
    pattern: 'openai|chatgpt',
    categoryName: 'Productividad',
    priority: 30,
  },
  {
    pattern: 'netflix|max|hbo|spotify|youtube|disney',
    categoryName: 'Entretenimiento',
    priority: 40,
  },
  {
    pattern: 'amazon|amzn|agencia',
    categoryName: 'Amazon / agencias',
    priority: 50,
  },
  {pattern: 'farmacia', categoryName: 'Salud', priority: 60},
  {
    pattern: 'claro|tigo|internet|gas|cable',
    categoryName: 'Servicios',
    priority: 70,
  },
] as const;

type MockTransactionSeed = {
  id: string;
  name: string;
  amount: number;
  currency: 'USD' | 'NIO';
  exchangeRate: number;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  categoryName?: string;
  paymentMethodName?: string;
  note?: string;
};

const mockTransactionSeed: MockTransactionSeed[] = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    name: 'Salario julio',
    amount: 1300,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-01',
    type: 'income',
    paymentMethodName: 'Transferencia',
    note: 'Ingreso base del mes para el dashboard.',
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    name: 'Internet hogar Tigo',
    amount: 1950,
    currency: 'NIO',
    exchangeRate: 36.6243,
    date: '2026-07-02',
    type: 'expense',
    categoryName: 'Servicios',
    paymentMethodName: 'Débito',
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    name: 'Supermercado La Colonia',
    amount: 2550,
    currency: 'NIO',
    exchangeRate: 36.6243,
    date: '2026-07-04',
    type: 'expense',
    categoryName: 'Supermercado',
    paymentMethodName: 'Tarjeta de crédito',
  },
  {
    id: '00000000-0000-4000-8000-000000000104',
    name: 'Netflix julio',
    amount: 15,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-05',
    type: 'expense',
    categoryName: 'Entretenimiento',
    paymentMethodName: 'Tarjeta de crédito',
  },
  {
    id: '00000000-0000-4000-8000-000000000105',
    name: 'ChatGPT Plus',
    amount: 28,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-06',
    type: 'expense',
    categoryName: 'Productividad',
    paymentMethodName: 'Tarjeta de crédito',
  },
  {
    id: '00000000-0000-4000-8000-000000000106',
    name: 'Mandaditos almuerzo',
    amount: 340,
    currency: 'NIO',
    exchangeRate: 36.6243,
    date: '2026-07-08',
    type: 'expense',
    categoryName: 'Delivery',
    paymentMethodName: 'Débito',
  },
  {
    id: '00000000-0000-4000-8000-000000000107',
    name: 'Farmacia familiar',
    amount: 620,
    currency: 'NIO',
    exchangeRate: 36.6243,
    date: '2026-07-10',
    type: 'expense',
    categoryName: 'Salud',
    paymentMethodName: 'Tarjeta de crédito',
  },
  {
    id: '00000000-0000-4000-8000-000000000108',
    name: 'Caja chica semanal',
    amount: 90,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-12',
    type: 'expense',
    categoryName: 'Efectivo operativo',
    paymentMethodName: 'Efectivo',
  },
  {
    id: '00000000-0000-4000-8000-000000000109',
    name: 'Cena y regalo aniversario',
    amount: 98,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-15',
    type: 'expense',
    categoryName: 'Novia / salidas / regalos',
    paymentMethodName: 'Tarjeta de crédito',
  },
  {
    id: '00000000-0000-4000-8000-000000000110',
    name: 'Gasolina quincena',
    amount: 1200,
    currency: 'NIO',
    exchangeRate: 36.6243,
    date: '2026-07-18',
    type: 'expense',
    categoryName: 'Transporte',
    paymentMethodName: 'Débito',
  },
  {
    id: '00000000-0000-4000-8000-000000000111',
    name: 'Amazon accesorios home office',
    amount: 52,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-20',
    type: 'expense',
    categoryName: 'Amazon / agencias',
    paymentMethodName: 'Tarjeta de crédito',
  },
  {
    id: '00000000-0000-4000-8000-000000000112',
    name: 'Camisa oficina',
    amount: 42,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-21',
    type: 'expense',
    categoryName: 'Ropa',
    paymentMethodName: 'Débito',
  },
  {
    id: '00000000-0000-4000-8000-000000000113',
    name: 'Aporte ahorro julio',
    amount: 200,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-23',
    type: 'transfer',
    categoryName: 'Ahorro',
    paymentMethodName: 'Transferencia',
    note: 'Transferencia hacia ahorro planificado.',
  },
  {
    id: '00000000-0000-4000-8000-000000000114',
    name: 'Pago tarjeta principal',
    amount: 350,
    currency: 'USD',
    exchangeRate: 36.6243,
    date: '2026-07-25',
    type: 'transfer',
    paymentMethodName: 'Transferencia',
    note: 'Pago de tarjeta registrado como transferencia.',
  },
  {
    id: '00000000-0000-4000-8000-000000000115',
    name: 'Ferreteria y varios hogar',
    amount: 650,
    currency: 'NIO',
    exchangeRate: 36.6243,
    date: '2026-07-27',
    type: 'expense',
    categoryName: 'Varios',
    paymentMethodName: 'Efectivo',
  },
];

function toStoredMoneyValues(transaction: MockTransactionSeed) {
  const {amountUsd, amountNio} = convertMoney({
    amount: transaction.amount,
    currency: transaction.currency,
    exchangeRate: transaction.exchangeRate,
  });

  return {
    amount: transaction.amount.toFixed(2),
    exchangeRate: transaction.exchangeRate.toFixed(4),
    amountUsd: amountUsd.toFixed(2),
    amountNio: amountNio.toFixed(2),
  };
}

async function seed() {
  // Los upserts permiten repetir el seed sin duplicar datos. También sincronizan
  // cambios deliberados en los valores iniciales del proyecto.
  await db
    .insert(appSettings)
    .values({
      id: '00000000-0000-4000-8000-000000000001',
      defaultCurrency: 'USD',
      defaultExchangeRate: '36.6243',
      creditCardModeEnabled: false,
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        defaultCurrency: 'USD',
        defaultExchangeRate: '36.6243',
        updatedAt: new Date(),
      },
    });

  const categoryIds = new Map<string, string>();
  const paymentMethodIds = new Map<string, string>();

  // Conservamos los UUID devueltos por PostgreSQL para crear después las
  // relaciones de presupuesto y reglas sin depender de IDs hardcodeados.
  for (const [sortOrder, category] of categorySeed.entries()) {
    const [savedCategory] = await db
      .insert(categories)
      .values({...category, sortOrder})
      .onConflictDoUpdate({
        target: categories.name,
        set: {
          monthlyBudgetUsd: category.monthlyBudgetUsd,
          isEssential: category.isEssential,
          sortOrder,
          updatedAt: new Date(),
        },
      })
      .returning({id: categories.id, name: categories.name});

    categoryIds.set(savedCategory.name, savedCategory.id);
  }

  for (const paymentMethod of paymentMethodSeed) {
    const [savedPaymentMethod] = await db
      .insert(paymentMethods)
      .values(paymentMethod)
      .onConflictDoUpdate({
        target: paymentMethods.name,
        set: {
          type: paymentMethod.type,
          updatedAt: new Date(),
        },
      })
      .returning({id: paymentMethods.id, name: paymentMethods.name});

    paymentMethodIds.set(savedPaymentMethod.name, savedPaymentMethod.id);
  }

  const [monthlyBudget] = await db
    .insert(monthlyBudgets)
    .values({
      month: '2026-07-01',
      salaryUsd: '1300.00',
      expectedSavingsUsd: '450.00',
    })
    .onConflictDoUpdate({
      target: monthlyBudgets.month,
      set: {
        salaryUsd: '1300.00',
        expectedSavingsUsd: '450.00',
        updatedAt: new Date(),
      },
    })
    .returning({id: monthlyBudgets.id});

  // Cada combinación presupuesto-categoría es única en la base de datos.
  for (const category of categorySeed) {
    const categoryId = categoryIds.get(category.name);

    if (!categoryId) {
      throw new Error(`Seed category was not found: ${category.name}`);
    }

    await db
      .insert(monthlyBudgetCategories)
      .values({
        monthlyBudgetId: monthlyBudget.id,
        categoryId,
        amountUsd: category.monthlyBudgetUsd,
      })
      .onConflictDoUpdate({
        target: [
          monthlyBudgetCategories.monthlyBudgetId,
          monthlyBudgetCategories.categoryId,
        ],
        set: {
          amountUsd: category.monthlyBudgetUsd,
          updatedAt: new Date(),
        },
      });
  }

  for (const rule of merchantRuleSeed) {
    const categoryId = categoryIds.get(rule.categoryName);

    if (!categoryId) {
      throw new Error(
        `Merchant rule category was not found: ${rule.categoryName}`,
      );
    }

    await db
      .insert(merchantRules)
      .values({
        pattern: rule.pattern,
        categoryId,
        priority: rule.priority,
      })
      .onConflictDoUpdate({
        target: merchantRules.pattern,
        set: {
          categoryId,
          priority: rule.priority,
          isActive: true,
          updatedAt: new Date(),
        },
      });
  }

  for (const transaction of mockTransactionSeed) {
    const categoryId = transaction.categoryName
      ? categoryIds.get(transaction.categoryName)
      : null;
    const paymentMethodId = transaction.paymentMethodName
      ? paymentMethodIds.get(transaction.paymentMethodName)
      : null;

    if (transaction.categoryName && !categoryId) {
      throw new Error(
        `Mock transaction category was not found: ${transaction.categoryName}`,
      );
    }

    if (transaction.paymentMethodName && !paymentMethodId) {
      throw new Error(
        `Mock transaction payment method was not found: ${transaction.paymentMethodName}`,
      );
    }

    await db
      .insert(transactions)
      .values({
        id: transaction.id,
        name: transaction.name,
        currency: transaction.currency,
        date: transaction.date,
        type: transaction.type,
        categoryId,
        paymentMethodId,
        note: transaction.note,
        rawInput: 'seed:mock-july-2026',
        ...toStoredMoneyValues(transaction),
      })
      .onConflictDoUpdate({
        target: transactions.id,
        set: {
          name: transaction.name,
          currency: transaction.currency,
          date: transaction.date,
          type: transaction.type,
          categoryId,
          paymentMethodId,
          note: transaction.note,
          rawInput: 'seed:mock-july-2026',
          ...toStoredMoneyValues(transaction),
          updatedAt: new Date(),
        },
      });
  }
}

seed()
  .then(() => {
    console.log('Database seed completed.');
  })
  .catch((error: unknown) => {
    console.error('Database seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await databaseClient.end();
  });
