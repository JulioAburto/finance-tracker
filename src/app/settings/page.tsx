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
import {
  updatePaymentMethodAction,
  updateSettingsAction,
} from "@/features/management/actions";
import { getSettingsData } from "@/features/management/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const data = await getSettingsData();

  return (
    <Stack spacing={3}>
      <PageHeader title="Configuración" description="Valores predeterminados para registrar transacciones." />
      {params.status === "saved" ? <Alert severity="success">Cambios guardados.</Alert> : null}
      {params.status === "invalid" ? <Alert severity="error">Revisa los valores ingresados.</Alert> : null}
      <Alert severity="warning">Cambiar la tasa predeterminada no recalcula transacciones históricas.</Alert>

      <Paper component="form" action={updateSettingsAction} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Valores generales</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField select name="defaultCurrency" label="Moneda predeterminada" defaultValue={data.settings?.defaultCurrency ?? "USD"}>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="NIO">NIO</MenuItem>
          </TextField>
          <TextField name="defaultExchangeRate" label="Tasa predeterminada (1 USD a NIO)" type="number" defaultValue={data.settings?.defaultExchangeRate ?? "36.6243"} slotProps={{ htmlInput: { min: 0.0001, step: 0.0001 } }} required />
          <FormControlLabel control={<Checkbox name="creditCardModeEnabled" defaultChecked={data.settings?.creditCardModeEnabled ?? false} />} label="Activar modo tarjeta de crédito" />
          <Button type="submit" variant="contained">Guardar configuración</Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        <Typography variant="h6">Tarjetas de crédito</Typography>
        {data.paymentMethods.filter((method) => method.type === "credit_card").map((method) => (
          <Paper key={method.id} component="form" action={updatePaymentMethodAction.bind(null, method.id)} sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="Método" value={method.name} disabled />
              <TextField name="creditLimitUsd" label="Límite USD" type="number" defaultValue={method.creditLimitUsd ?? ""} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
              <TextField name="statementCutDay" label="Día de corte" type="number" defaultValue={method.statementCutDay ?? ""} slotProps={{ htmlInput: { min: 1, max: 31 } }} />
              <TextField name="paymentDueDay" label="Día de pago" type="number" defaultValue={method.paymentDueDay ?? ""} slotProps={{ htmlInput: { min: 1, max: 31 } }} />
              <FormControlLabel control={<Checkbox name="isActive" defaultChecked={method.isActive} />} label="Activa" />
              <Button type="submit" variant="outlined">Guardar tarjeta</Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
