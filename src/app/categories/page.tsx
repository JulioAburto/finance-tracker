import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PageHeader } from "@/components/layout/page-header";
import {
  createCategoryAction,
  saveMonthlyBudgetAction,
  updateCategoryAction,
} from "@/features/management/actions";
import { getCategoryManagementData } from "@/features/management/queries";
import { normalizeMonth } from "@/lib/date/month";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; status?: string }>;
}) {
  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const data = await getCategoryManagementData(month);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Categorías y presupuestos"
        description="Define en qué se usa el dinero y cuánto puede gastarse por mes."
      />
      {params.status === "saved" ? <Alert severity="success">Cambios guardados.</Alert> : null}
      {params.status === "invalid" ? <Alert severity="error">Revisa los valores ingresados.</Alert> : null}

      <Stack component="form" method="get" direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignSelf: "flex-start" }}>
        <TextField name="month" label="Mes a administrar" type="month" defaultValue={month} slotProps={{ inputLabel: { shrink: true } }} />
        <Button type="submit" variant="outlined">Ver mes</Button>
      </Stack>

      <Paper component="form" action={saveMonthlyBudgetAction} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Presupuesto mensual</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField name="month" label="Mes" type="month" defaultValue={month} required slotProps={{ inputLabel: { shrink: true } }} />
          <TextField name="salaryUsd" label="Ingreso disponible (USD)" type="number" defaultValue={data.budget?.salaryUsd ?? ""} required slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
          <TextField name="expectedSavingsUsd" label="Ahorro esperado (USD)" type="number" defaultValue={data.budget?.expectedSavingsUsd ?? "0"} required slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
          <Button type="submit" variant="contained">Guardar presupuesto</Button>
        </Stack>
      </Paper>

      <Paper component="form" action={createCategoryAction} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Nueva categoría</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField name="name" label="Nombre" required fullWidth />
          <TextField name="monthlyBudgetUsd" label="Presupuesto predeterminado (USD)" type="number" required slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
          <TextField name="sortOrder" label="Orden" type="number" defaultValue="0" />
          <FormControlLabel control={<Checkbox name="isEssential" />} label="Esencial" />
          <Button type="submit" variant="contained">Crear categoría</Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {data.categories.map((category) => (
          <Paper key={category.id} component="form" action={updateCategoryAction.bind(null, category.id)} sx={{ p: 2 }}>
            <input type="hidden" name="month" value={month} />
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField name="name" label="Categoría" defaultValue={category.name} required fullWidth />
                <TextField name="monthlyBudgetUsd" label="Predeterminado USD" type="number" defaultValue={category.monthlyBudgetUsd} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
                <TextField name="selectedMonthBudgetUsd" label={`Presupuesto ${month}`} type="number" defaultValue={category.selectedMonthBudgetUsd} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
                <TextField name="sortOrder" label="Orden" type="number" defaultValue={category.sortOrder} />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField name="warningThreshold" label="Cuidado %" type="number" defaultValue={category.warningThreshold} />
                <TextField name="dangerThreshold" label="Alerta %" type="number" defaultValue={category.dangerThreshold} />
                <TextField name="exceededThreshold" label="Excedido %" type="number" defaultValue={category.exceededThreshold} />
                <FormControlLabel control={<Checkbox name="isEssential" defaultChecked={category.isEssential} />} label="Esencial" />
                <FormControlLabel control={<Checkbox name="isActive" defaultChecked={category.isActive} />} label="Activa" />
                <Button type="submit" variant="outlined">Guardar</Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
