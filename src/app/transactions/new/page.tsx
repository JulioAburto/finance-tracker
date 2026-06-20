import { Paper, Stack, Typography } from "@mui/material";
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
      <div>
        <Typography variant="h4" component="h1">
          Nueva transacción
        </Typography>
        <Typography color="text.secondary">
          El servidor validará y convertirá el monto antes de guardarlo.
        </Typography>
      </div>
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 720 }}>
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
      </Paper>
    </Stack>
  );
}
