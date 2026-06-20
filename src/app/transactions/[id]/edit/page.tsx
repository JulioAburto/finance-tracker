import { Paper, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { updateTransactionAction } from "@/features/transactions/actions";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import {
  getTransactionById,
  getTransactionFormOptions,
} from "@/features/transactions/queries";
import { isUuid } from "@/features/transactions/schemas";

export const dynamic = "force-dynamic";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [transaction, options] = await Promise.all([
    getTransactionById(id),
    getTransactionFormOptions(),
  ]);

  if (!transaction) notFound();

  const action = updateTransactionAction.bind(null, transaction.id);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Editar transacción
      </Typography>
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 720 }}>
        <TransactionForm
          action={action}
          categories={options.categories}
          paymentMethods={options.paymentMethods}
          initialValues={{
            name: transaction.name,
            amount: transaction.amount,
            currency: transaction.currency,
            exchangeRate: transaction.exchangeRate,
            date: transaction.date,
            type: transaction.type,
            categoryId: transaction.categoryId ?? "",
            paymentMethodId: transaction.paymentMethodId ?? "",
            note: transaction.note ?? "",
          }}
          submitLabel="Actualizar transacción"
        />
      </Paper>
    </Stack>
  );
}
