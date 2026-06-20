import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PageHeader } from "@/components/layout/page-header";
import { createRuleAction, updateRuleAction } from "@/features/management/actions";
import { getRulesManagementData } from "@/features/management/queries";

export const dynamic = "force-dynamic";

export default async function RulesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const data = await getRulesManagementData();

  return (
    <Stack spacing={3}>
      <PageHeader title="Reglas de comercios" description="Clasifica gastos repetidos antes de recurrir a cualquier sugerencia de IA." />
      {params.status === "saved" ? <Alert severity="success">Cambios guardados.</Alert> : null}
      {params.status === "invalid" ? <Alert severity="error">El patrón o los valores no son válidos.</Alert> : null}

      <Paper component="form" action={createRuleAction} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Nueva regla</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField name="pattern" label="Patrón" helperText="Ejemplo: netflix|max|spotify" required fullWidth />
          <TextField select name="categoryId" label="Categoría destino" required sx={{ minWidth: 220 }}>
            {data.categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
          </TextField>
          <TextField name="priority" label="Prioridad" type="number" defaultValue="100" required />
          <Button type="submit" variant="contained">Crear regla</Button>
        </Stack>
      </Paper>

      {data.rules.length === 0 ? (
        <Alert severity="info">No hay reglas. Crea una para clasificar comercios repetidos.</Alert>
      ) : (
        <Stack spacing={2}>
          {data.rules.map((rule) => (
            <Paper key={rule.id} component="form" action={updateRuleAction.bind(null, rule.id)} sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField name="pattern" label="Patrón" defaultValue={rule.pattern} required fullWidth />
                <TextField select name="categoryId" label="Categoría" defaultValue={rule.categoryId} sx={{ minWidth: 220 }}>
                  {data.categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
                </TextField>
                <TextField name="priority" label="Prioridad" type="number" defaultValue={rule.priority} />
                <FormControlLabel control={<Checkbox name="isActive" defaultChecked={rule.isActive} />} label="Activa" />
                <Button type="submit" variant="outlined">Guardar</Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
