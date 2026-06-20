import { Chip } from "@mui/material";
import type { BudgetStatus } from "@/lib/budget/status";

const statusConfig = {
  safe: { label: "Sano", color: "success" },
  warning: { label: "Cuidado", color: "warning" },
  danger: { label: "Alerta", color: "error" },
  exceeded: { label: "Excedido", color: "error" },
} as const;

export function BudgetStatusChip({
  status,
}: {
  status: BudgetStatus;
}) {
  const config = statusConfig[status];

  return <Chip size="small" label={config.label} color={config.color} />;
}
