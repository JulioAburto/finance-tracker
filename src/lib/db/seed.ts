import { db, databaseClient } from "./index";
import {
  appSettings,
  categories,
  merchantRules,
  monthlyBudgetCategories,
  monthlyBudgets,
  paymentMethods,
} from "./schema";

const categorySeed = [
  { name: "Ahorro", monthlyBudgetUsd: "450.00", isEssential: true },
  { name: "Servicios", monthlyBudgetUsd: "60.00", isEssential: true },
  {
    name: "Productividad",
    monthlyBudgetUsd: "25.00",
    isEssential: true,
  },
  { name: "Entretenimiento", monthlyBudgetUsd: "45.00", isEssential: false },
  {
    name: "Supermercado",
    monthlyBudgetUsd: "165.00",
    isEssential: true,
  },
  { name: "Delivery", monthlyBudgetUsd: "70.00", isEssential: false },
  {
    name: "Novia / salidas / regalos",
    monthlyBudgetUsd: "110.00",
    isEssential: false,
  },
  {
    name: "Amazon / agencias",
    monthlyBudgetUsd: "70.00",
    isEssential: false,
  },
  { name: "Ropa", monthlyBudgetUsd: "45.00", isEssential: false },
  { name: "Salud", monthlyBudgetUsd: "55.00", isEssential: true },
  { name: "Transporte", monthlyBudgetUsd: "35.00", isEssential: false },
  {
    name: "Efectivo operativo",
    monthlyBudgetUsd: "100.00",
    isEssential: false,
  },
  { name: "Varios", monthlyBudgetUsd: "70.00", isEssential: false },
] as const;

const paymentMethodSeed = [
  { name: "Efectivo", type: "cash" },
  { name: "Débito", type: "debit" },
  { name: "Tarjeta de crédito", type: "credit_card" },
  { name: "Transferencia", type: "bank_transfer" },
  { name: "Prepago", type: "prepaid" },
  { name: "Agencia", type: "agency" },
  { name: "Otro", type: "other" },
] as const;

const merchantRuleSeed = [
  { pattern: "la colonia", categoryName: "Supermercado", priority: 10 },
  {
    pattern: "mandaditos|sisu|sorbetes|la placita|glorieta|ambros",
    categoryName: "Delivery",
    priority: 20,
  },
  {
    pattern: "openai|chatgpt",
    categoryName: "Productividad",
    priority: 30,
  },
  {
    pattern: "netflix|max|hbo|spotify|youtube|disney",
    categoryName: "Entretenimiento",
    priority: 40,
  },
  {
    pattern: "amazon|amzn|agencia",
    categoryName: "Amazon / agencias",
    priority: 50,
  },
  { pattern: "farmacia", categoryName: "Salud", priority: 60 },
  {
    pattern: "claro|tigo|internet|gas|cable",
    categoryName: "Servicios",
    priority: 70,
  },
] as const;

async function seed() {
  // Los upserts permiten repetir el seed sin duplicar datos. También sincronizan
  // cambios deliberados en los valores iniciales del proyecto.
  await db
    .insert(appSettings)
    .values({
      id: "00000000-0000-4000-8000-000000000001",
      defaultCurrency: "USD",
      defaultExchangeRate: "36.6243",
      creditCardModeEnabled: false,
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        defaultCurrency: "USD",
        defaultExchangeRate: "36.6243",
        updatedAt: new Date(),
      },
    });

  const categoryIds = new Map<string, string>();

  // Conservamos los UUID devueltos por PostgreSQL para crear después las
  // relaciones de presupuesto y reglas sin depender de IDs hardcodeados.
  for (const [sortOrder, category] of categorySeed.entries()) {
    const [savedCategory] = await db
      .insert(categories)
      .values({ ...category, sortOrder })
      .onConflictDoUpdate({
        target: categories.name,
        set: {
          monthlyBudgetUsd: category.monthlyBudgetUsd,
          isEssential: category.isEssential,
          sortOrder,
          updatedAt: new Date(),
        },
      })
      .returning({ id: categories.id, name: categories.name });

    categoryIds.set(savedCategory.name, savedCategory.id);
  }

  for (const paymentMethod of paymentMethodSeed) {
    await db
      .insert(paymentMethods)
      .values(paymentMethod)
      .onConflictDoUpdate({
        target: paymentMethods.name,
        set: {
          type: paymentMethod.type,
          updatedAt: new Date(),
        },
      });
  }

  const [monthlyBudget] = await db
    .insert(monthlyBudgets)
    .values({
      month: "2026-07-01",
      salaryUsd: "1300.00",
      expectedSavingsUsd: "450.00",
    })
    .onConflictDoUpdate({
      target: monthlyBudgets.month,
      set: {
        salaryUsd: "1300.00",
        expectedSavingsUsd: "450.00",
        updatedAt: new Date(),
      },
    })
    .returning({ id: monthlyBudgets.id });

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
      throw new Error(`Merchant rule category was not found: ${rule.categoryName}`);
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
}

seed()
  .then(() => {
    console.log("Database seed completed.");
  })
  .catch((error: unknown) => {
    console.error("Database seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await databaseClient.end();
  });
