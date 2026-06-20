import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
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
import { getDashboardData } from "@/features/dashboard/queries";
import { normalizeMonth } from "@/lib/date/month";
import { formatUsd } from "@/lib/money/format";

export const dynamic = "force-dynamic";

const statusLabels = {
  safe: "Saludable",
  warning: "Advertencia",
  danger: "Peligro",
  exceeded: "Excedido",
} as const;

const statusColors = {
  safe: "success",
  warning: "warning",
  danger: "error",
  exceeded: "error",
} as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const data = await getDashboardData(month);
  const { summary } = data;

  const cards = [
    { label: "Gastado", value: formatUsd(summary.totalSpentUsd) },
    { label: "Presupuesto de gastos", value: formatUsd(summary.totalBudgetUsd) },
    {
      label: "Uso del presupuesto",
      value: `${summary.usagePercent.toFixed(1)}%`,
    },
    { label: "Ahorro esperado", value: formatUsd(summary.expectedSavingsUsd) },
  ];

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <div>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Typography color="text.secondary">
            Salud financiera del mes seleccionado.
          </Typography>
        </div>
        <Box component="form" method="get" sx={{ display: "flex", gap: 1 }}>
          <TextField
            name="month"
            label="Mes"
            type="month"
            defaultValue={month}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button type="submit" variant="outlined">
            Ver
          </Button>
        </Box>
      </Stack>

      {!data.hasBudget ? (
        <Alert severity="warning">
          No existe un presupuesto para {month}. El seed inicial corresponde a
          julio de 2026.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {cards.map((card) => (
          <Paper key={card.label} sx={{ p: 2 }}>
            <Typography color="text.secondary" variant="body2">
              {card.label}
            </Typography>
            <Typography variant="h5">{card.value}</Typography>
          </Paper>
        ))}
      </Box>

      {summary.uncategorizedCount > 0 ? (
        <Alert severity="warning">
          Hay {summary.uncategorizedCount} gasto(s) sin categoría.
        </Alert>
      ) : null}

      {summary.alerts.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="h6">Alertas</Typography>
          {summary.alerts.map((alert) => (
            <Alert
              key={alert.categoryId}
              severity={alert.status === "warning" ? "warning" : "error"}
            >
              {alert.categoryName}: {alert.usagePercent.toFixed(1)}%.{" "}
              {alert.recommendation}
            </Alert>
          ))}
        </Stack>
      ) : null}

      <div>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Uso por categoría
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Categoría</TableCell>
                <TableCell align="right">Presupuesto</TableCell>
                <TableCell align="right">Gastado</TableCell>
                <TableCell align="right">Restante</TableCell>
                <TableCell>Uso</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Recomendación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.categoryUsage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay categorías presupuestadas para este mes.
                  </TableCell>
                </TableRow>
              ) : (
                summary.categoryUsage.map((category) => (
                  <TableRow key={category.categoryId}>
                    <TableCell>{category.categoryName}</TableCell>
                    <TableCell align="right">
                      {formatUsd(category.budgetUsd)}
                    </TableCell>
                    <TableCell align="right">
                      {formatUsd(category.spentUsd)}
                    </TableCell>
                    <TableCell align="right">
                      {formatUsd(category.remainingUsd)}
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Typography variant="body2">
                        {category.usagePercent.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(category.usagePercent, 100)}
                        color={statusColors[category.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statusLabels[category.status]}
                        color={statusColors[category.status]}
                      />
                    </TableCell>
                    <TableCell>{category.recommendation}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Últimas transacciones
          </Typography>
          {data.latestTransactions.length === 0 ? (
            <Typography color="text.secondary">No hay transacciones.</Typography>
          ) : (
            data.latestTransactions.map((transaction) => (
              <Stack
                key={transaction.id}
                direction="row"
                sx={{
                  py: 1,
                  justifyContent: "space-between",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <span>
                  {transaction.date} · {transaction.name}
                </span>
                <strong>{formatUsd(transaction.amountUsd)}</strong>
              </Stack>
            ))
          )}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Sin categoría
          </Typography>
          {data.uncategorizedTransactions.length === 0 ? (
            <Typography color="text.secondary">
              No hay gastos pendientes de clasificar.
            </Typography>
          ) : (
            data.uncategorizedTransactions.map((transaction) => (
              <Stack
                key={transaction.id}
                direction="row"
                sx={{
                  py: 1,
                  justifyContent: "space-between",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <span>{transaction.name}</span>
                <strong>{formatUsd(transaction.amountUsd)}</strong>
              </Stack>
            ))
          )}
        </Paper>
      </Box>
    </Stack>
  );
}
