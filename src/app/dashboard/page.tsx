import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
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
import { PageHeader } from "@/components/layout/page-header";
import { BudgetStatusChip } from "@/components/ui/budget-status-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { getDashboardData } from "@/features/dashboard/queries";
import { normalizeMonth } from "@/lib/date/month";
import { formatDisplayDate } from "@/lib/date/month";
import { formatUsd } from "@/lib/money/format";

export const dynamic = "force-dynamic";

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

  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      <PageHeader
        title="Resumen"
        description="Entiende cuánto gastaste, qué categorías necesitan atención y cuánto presupuesto queda."
        action={
          <Button
            href="/transactions/new"
            variant="contained"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Agregar gasto
          </Button>
        }
      />

      <Card
        component="form"
        method="get"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          alignItems: { sm: "center" },
          p: 2,
        }}
      >
        <TextField
          name="month"
          label="Mes"
          type="month"
          defaultValue={month}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: { sm: 190 } }}
        />
        <Button type="submit" variant="outlined">
          Ver mes
        </Button>
      </Card>

      {!data.hasBudget ? (
        <Alert severity="warning">
          No existe un presupuesto para {month}. El seed inicial corresponde a
          julio de 2026.
        </Alert>
      ) : null}

      <Card
        sx={{
          color: "primary.contrastText",
          bgcolor: "primary.main",
          border: 0,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, "&:last-child": { pb: { xs: 2.5, md: 3.5 } } }}>
          <Stack spacing={3}>
            <div>
              <Typography sx={{ opacity: 0.78 }} variant="body2">
                Gastado este mes
              </Typography>
              <Typography
                component="p"
                sx={{
                  mt: 0.5,
                  fontSize: "clamp(2rem, 7vw, 3.25rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                }}
              >
                {formatUsd(summary.totalSpentUsd)}
              </Typography>
              <Typography sx={{ mt: 0.75, opacity: 0.82 }}>
                de {formatUsd(summary.totalBudgetUsd)} presupuestados
              </Typography>
            </div>

            <div>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Presupuesto usado
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {summary.usagePercent.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(summary.usagePercent, 100)}
                color="secondary"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.18)" }}
              />
            </div>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <div>
                <Typography variant="body2" sx={{ opacity: 0.72 }}>
                  Disponible
                </Typography>
                <Typography variant="h6">
                  {formatUsd(summary.remainingBudgetUsd)}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" sx={{ opacity: 0.72 }}>
                  Ahorro esperado
                </Typography>
                <Typography variant="h6">
                  {formatUsd(summary.expectedSavingsUsd)}
                </Typography>
              </div>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <SummaryCard
          label="Presupuesto usado"
          value={`${summary.usagePercent.toFixed(1)}%`}
          context={`${formatUsd(summary.totalSpentUsd)} de ${formatUsd(summary.totalBudgetUsd)}`}
        />
        <SummaryCard
          label="Monto restante"
          value={formatUsd(summary.remainingBudgetUsd)}
          context="Disponible para el resto del mes"
        />
        <SummaryCard
          label="Categorías en alerta"
          value={String(summary.alerts.length)}
          context="Requieren revisión o reducción"
        />
        <SummaryCard
          label="Sin clasificar"
          value={String(summary.uncategorizedCount)}
          context="Gastos pendientes de categoría"
        />
      </Box>

      {summary.uncategorizedCount > 0 ? (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" href="/transactions" size="small">
              Revisar
            </Button>
          }
        >
          Gastos sin categoría: {summary.uncategorizedCount}.
        </Alert>
      ) : null}

      {summary.alerts.length > 0 ? (
        <Stack spacing={1.5}>
          <Typography variant="h6">Atención este mes</Typography>
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
      ) : (
        <Alert severity="success">
          No hay alertas de presupuesto. Tus categorías están dentro de sus
          límites.
        </Alert>
      )}

      <Stack spacing={1.5}>
        <Typography variant="h6">
          Uso por categoría
        </Typography>

        <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
          {summary.categoryUsage.length === 0 ? (
            <Card>
              <EmptyState
                title="Sin categorías presupuestadas"
                description="Todavía no hay categorías configuradas para este mes."
              />
            </Card>
          ) : (
            summary.categoryUsage.map((category) => (
              <Card key={category.categoryId}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "space-between", alignItems: "center" }}
                    >
                      <Typography fontWeight={700}>
                        {category.categoryName}
                      </Typography>
                      <BudgetStatusChip status={category.status} />
                    </Stack>
                    <div>
                      <Typography variant="body2" color="text.secondary">
                        {formatUsd(category.spentUsd)} de{" "}
                        {formatUsd(category.budgetUsd)}
                      </Typography>
                      <Typography variant="h6">
                        {category.usagePercent.toFixed(1)}%
                      </Typography>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(category.usagePercent, 100)}
                      color={statusColors[category.status]}
                    />
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Restante
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {formatUsd(category.remainingUsd)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">
                      {category.recommendation}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>

        <TableContainer component={Card} sx={{ display: { xs: "none", md: "block" } }}>
          <Table size="small">
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
                      <BudgetStatusChip status={category.status} />
                    </TableCell>
                    <TableCell>{category.recommendation}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Últimas transacciones
            </Typography>
          {data.latestTransactions.length === 0 ? (
              <EmptyState
                title="No hay transacciones"
                description="Registra tu primer gasto para comenzar a ver el resumen."
                actionHref="/transactions/new"
                actionLabel="Agregar gasto"
              />
          ) : (
            data.latestTransactions.map((transaction) => (
              <Stack
                key={transaction.id}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={0.5}
                sx={{
                    py: 1.25,
                  justifyContent: "space-between",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <span>
                  {formatDisplayDate(transaction.date)} · {transaction.name}
                </span>
                <strong>{formatUsd(transaction.amountUsd)}</strong>
              </Stack>
            ))
          )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Sin clasificar
            </Typography>
          {data.uncategorizedTransactions.length === 0 ? (
              <EmptyState
                title="Todo está clasificado"
                description="No hay gastos pendientes de categoría."
              />
          ) : (
            data.uncategorizedTransactions.map((transaction) => (
              <Stack
                key={transaction.id}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={0.5}
                sx={{
                    py: 1.25,
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
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
