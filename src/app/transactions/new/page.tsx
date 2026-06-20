import { Card, CardContent, Stack } from "@mui/material";
import { PageHeader } from "@/components/layout/page-header";
import { createTransactionAction } from "@/features/transactions/actions";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { getTransactionFormOptions } from "@/features/transactions/queries";

export const dynamic = "force-dynamic";

function getTodayInNicaragua(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Managua",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function NewTransactionPage() {
  const options = await getTransactionFormOptions();

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Agregar transacción"
        description="Registra un gasto, ingreso o transferencia con su tasa histórica."
      />
      <Card sx={{ maxWidth: 760 }}>
        <CardContent sx={{ p: { xs: 2, md: 3.5 } }}>
          <TransactionForm
            action={createTransactionAction}
            categories={options.categories}
            paymentMethods={options.paymentMethods}
            initialValues={{
              name: "",
              amount: "",
              currency: options.settings.defaultCurrency,
              exchangeRate: options.settings.defaultExchangeRate,
              date: getTodayInNicaragua(),
              type: "expense",
              categoryId: "",
              paymentMethodId: "",
              note: "",
            }}
            submitLabel="Guardar transacción"
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
