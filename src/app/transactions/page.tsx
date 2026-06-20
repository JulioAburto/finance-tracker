import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { PageHeader } from "@/components/layout/page-header";
import { DeleteTransactionButton } from "@/features/transactions/components/delete-transaction-button";
import {
  getTransactionFormOptions,
  getTransactions,
} from "@/features/transactions/queries";
import { normalizeMonth } from "@/lib/date/month";
import { formatDisplayDate } from "@/lib/date/month";
import { formatNio, formatUsd } from "@/lib/money/format";

export const dynamic = "force-dynamic";

const transactionTypeLabels = {
  expense: "Gasto",
  income: "Ingreso",
  transfer: "Transferencia",
} as const;

type SearchParams = Promise<{
  month?: string;
  categoryId?: string;
  paymentMethodId?: string;
}>;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const categoryId = params.categoryId || undefined;
  const paymentMethodId = params.paymentMethodId || undefined;
  const [rows, options] = await Promise.all([
    getTransactions({ month, categoryId, paymentMethodId }),
    getTransactionFormOptions(),
  ]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Transacciones"
        description="Montos convertidos con la tasa guardada en cada registro."
        action={
          <Button href="/transactions/new" variant="contained">
            Agregar transacción
          </Button>
        }
      />

      <Paper component="form" method="get" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            name="month"
            label="Mes"
            type="month"
            defaultValue={month}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            name="categoryId"
            label="Categoría"
            defaultValue={categoryId ?? ""}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {options.categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="paymentMethodId"
            label="Método de pago"
            defaultValue={paymentMethodId ?? ""}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {options.paymentMethods.map((method) => (
              <MenuItem key={method.id} value={method.id}>
                {method.name}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="outlined">
            Filtrar
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Método</TableCell>
              <TableCell align="right">USD</TableCell>
              <TableCell align="right">NIO</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <Stack spacing={1} sx={{ alignItems: "center" }}>
                      <span>No hay transacciones para estos filtros.</span>
                      <Button href="/transactions/new" variant="contained">
                        Agregar transacción
                      </Button>
                    </Stack>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{formatDisplayDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.name}</TableCell>
                  <TableCell>{transactionTypeLabels[transaction.type]}</TableCell>
                  <TableCell>
                    {transaction.categoryName ?? "Sin categoría"}
                  </TableCell>
                  <TableCell>
                    {transaction.paymentMethodName ?? "Sin método"}
                  </TableCell>
                  <TableCell align="right">
                    {formatUsd(Number(transaction.amountUsd))}
                  </TableCell>
                  <TableCell align="right">
                    {formatNio(Number(transaction.amountNio))}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      href={`/transactions/${transaction.id}/edit`}
                      size="small"
                    >
                      Editar
                    </Button>
                    <DeleteTransactionButton
                      transactionId={transaction.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
