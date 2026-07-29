import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {PageHeader} from '@/components/layout/page-header';
import {EmptyState} from '@/components/ui/empty-state';
import {DeleteTransactionButton} from '@/features/transactions/components/delete-transaction-button';
import {TransactionFilters} from '@/features/transactions/components/transaction-filters';
import {
  getTransactionFormOptions,
  getTransactions,
} from '@/features/transactions/queries';
import {normalizeMonth} from '@/lib/date/month';
import {formatDisplayDate} from '@/lib/date/month';
import {formatNio, formatUsd} from '@/lib/money/format';

export const dynamic = 'force-dynamic';

const transactionTypeLabels = {
  expense: 'Gasto',
  income: 'Ingreso',
  transfer: 'Transferencia',
} as const;

const transactionTypeColors = {
  expense: 'error',
  income: 'success',
  transfer: 'info',
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
    getTransactions({month, categoryId, paymentMethodId}),
    getTransactionFormOptions(),
  ]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Transacciones"
        description="Montos convertidos con la tasa guardada en cada registro."
        action={
          <Button
            href="/transactions/new"
            variant="contained"
            sx={{width: {xs: '100%', sm: 'auto'}}}
          >
            Agregar gasto
          </Button>
        }
      />

      <TransactionFilters
        month={month}
        categoryId={categoryId}
        paymentMethodId={paymentMethodId}
        categories={options.categories}
        paymentMethods={options.paymentMethods}
      />

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            title="No hay transacciones"
            description="No encontramos movimientos para los filtros seleccionados."
            actionHref="/transactions/new"
            actionLabel="Agregar gasto"
          />
        </Card>
      ) : (
        <>
          <Typography color="text.secondary" variant="body2">
            {rows.length} {rows.length === 1 ? 'movimiento' : 'movimientos'}
          </Typography>

          <Stack spacing={1.5} sx={{display: {xs: 'flex', md: 'none'}}}>
            {rows.map(transaction => (
              <Card key={transaction.id}>
                <CardContent sx={{p: 2, '&:last-child': {pb: 2}}}>
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        minWidth: 0,
                      }}
                    >
                      <Box sx={{minWidth: 0}}>
                        <Typography
                          variant="h6"
                          sx={{lineHeight: 1.25, overflowWrap: 'anywhere'}}
                        >
                          {transaction.name}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {formatDisplayDate(transaction.date)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={transactionTypeLabels[transaction.type]}
                        color={transactionTypeColors[transaction.type]}
                        sx={{flexShrink: 0}}
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        minWidth: 0,
                      }}
                    >
                      <Box sx={{minWidth: 0}}>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                          sx={{overflowWrap: 'anywhere'}}
                        >
                          {transaction.categoryName ?? 'Sin categoría'}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="caption"
                          sx={{display: 'block', overflowWrap: 'anywhere'}}
                        >
                          {transaction.paymentMethodName ?? 'Sin método'}
                        </Typography>
                      </Box>
                      <Box sx={{flexShrink: 0, textAlign: 'right'}}>
                        <Typography
                          sx={{fontWeight: 800, whiteSpace: 'nowrap'}}
                        >
                          {transaction.currency === 'USD'
                            ? formatUsd(Number(transaction.amount))
                            : formatNio(Number(transaction.amount))}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          {formatUsd(Number(transaction.amountUsd))} en USD
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        href={`/transactions/${transaction.id}/edit`}
                        variant="outlined"
                        fullWidth
                      >
                        Editar
                      </Button>
                      <Box sx={{flex: 1}}>
                        <DeleteTransactionButton
                          transactionId={transaction.id}
                          fullWidth
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <TableContainer
            component={Card}
            sx={{display: {xs: 'none', md: 'block'}}}
          >
            <Table size="small" sx={{minWidth: 900}}>
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
                {rows.map(transaction => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{formatDisplayDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.name}</TableCell>
                    <TableCell>
                      {transactionTypeLabels[transaction.type]}
                    </TableCell>
                    <TableCell>
                      {transaction.categoryName ?? 'Sin categoría'}
                    </TableCell>
                    <TableCell>
                      {transaction.paymentMethodName ?? 'Sin método'}
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
                      <DeleteTransactionButton transactionId={transaction.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Stack>
  );
}
