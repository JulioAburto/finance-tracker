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
  Typography,
} from "@mui/material";
import { DeleteTransactionButton } from "@/features/transactions/components/delete-transaction-button";
import {
  getTransactionFormOptions,
  getTransactions,
} from "@/features/transactions/queries";
import { normalizeMonth } from "@/lib/date/month";
import { formatNio, formatUsd } from "@/lib/money/format";

export const dynamic = "force-dynamic";

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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <div>
          <Typography variant="h4" component="h1">
            Transacciones
          </Typography>
          <Typography color="text.secondary">
            Montos convertidos con la tasa guardada en cada registro.
          </Typography>
        </div>
        <Button href="/transactions/new" variant="contained">
          Nueva transacción
        </Button>
      </Stack>

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
        <Table>
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
                    No hay transacciones para estos filtros.
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.name}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
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
