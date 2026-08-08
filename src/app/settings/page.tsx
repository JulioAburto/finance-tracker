import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {PageHeader} from '@/components/layout/page-header';
import {
  updatePaymentMethodAction,
  updateSettingsAction,
} from '@/features/management/actions';
import {ManagementDialog} from '@/features/management/components/management-dialog';
import {getSettingsData} from '@/features/management/queries';
import {formatUsd} from '@/lib/money/format';
import {
  getPaymentMethodLabel,
  getVisiblePaymentMethods,
} from '@/lib/payment-methods';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{status?: string}>;
}) {
  const params = await searchParams;
  const data = await getSettingsData();
  const creditCardModeEnabled = data.settings?.creditCardModeEnabled ?? false;
  const visiblePaymentMethods = getVisiblePaymentMethods(
    data.paymentMethods,
    creditCardModeEnabled,
  );
  const standardMethods = visiblePaymentMethods.filter(
    method => method.type !== 'credit_card',
  );
  const creditCards = visiblePaymentMethods.filter(
    method => method.type === 'credit_card',
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Configuración"
        description="Valores predeterminados para registrar transacciones."
      />

      {params.status === 'saved' ? (
        <Alert severity="success">Cambios guardados.</Alert>
      ) : null}
      {params.status === 'invalid' ? (
        <Alert severity="error">Revisa los valores ingresados.</Alert>
      ) : null}
      <Alert severity="warning">
        Cambiar la tasa predeterminada no recalcula transacciones históricas.
      </Alert>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{xs: 'column', sm: 'row'}}
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: {sm: 'flex-start'},
              }}
            >
              <Box sx={{minWidth: 0}}>
                <Typography variant="h6">Valores generales</Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{mt: 0.5}}
                >
                  Moneda y tasa utilizadas al comenzar una nueva transacción.
                </Typography>
              </Box>
              <ManagementDialog
                triggerLabel="Editar configuración"
                title="Valores generales"
                description="Estos valores solo se aplican a transacciones nuevas."
              >
                <Box component="form" action={updateSettingsAction}>
                  <Stack spacing={2.5}>
                    <TextField
                      select
                      name="defaultCurrency"
                      label="Moneda predeterminada"
                      defaultValue={data.settings?.defaultCurrency ?? 'USD'}
                      fullWidth
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="NIO">NIO</MenuItem>
                    </TextField>
                    <TextField
                      name="defaultExchangeRate"
                      label="Tasa predeterminada (1 USD a NIO)"
                      type="number"
                      defaultValue={
                        data.settings?.defaultExchangeRate ?? '36.6243'
                      }
                      slotProps={{htmlInput: {min: 0.0001, step: 0.0001}}}
                      required
                      fullWidth
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="creditCardModeEnabled"
                          defaultChecked={
                            data.settings?.creditCardModeEnabled ?? false
                          }
                        />
                      }
                      label="Activar modo tarjeta de crédito"
                    />
                    <Button type="submit" variant="contained" fullWidth>
                      Guardar configuración
                    </Button>
                  </Stack>
                </Box>
              </ManagementDialog>
            </Stack>

            <Divider />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {xs: '1fr 1fr', md: 'repeat(3, 1fr)'},
                gap: 2,
              }}
            >
              <Box>
                <Typography color="text.secondary" variant="caption">
                  Moneda
                </Typography>
                <Typography sx={{fontWeight: 800}}>
                  {data.settings?.defaultCurrency ?? 'USD'}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="caption">
                  Tasa USD/NIO
                </Typography>
                <Typography sx={{fontWeight: 800}}>
                  {data.settings?.defaultExchangeRate ?? '36.6243'}
                </Typography>
              </Box>
              <Box sx={{gridColumn: {xs: '1 / -1', md: 'auto'}}}>
                <Typography color="text.secondary" variant="caption">
                  Modo tarjeta
                </Typography>
                <Typography sx={{fontWeight: 800}}>
                  {data.settings?.creditCardModeEnabled ? 'Activo' : 'Inactivo'}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6">Métodos de pago</Typography>
          <Typography color="text.secondary" variant="body2">
            {creditCardModeEnabled
              ? 'El modo tarjeta está activo; se muestran todos los métodos configurados.'
              : 'Activa el modo tarjeta para mostrar métodos adicionales.'}
          </Typography>
        </Box>

        {visiblePaymentMethods.length === 0 ? (
          <Alert severity="info">No hay métodos de pago configurados.</Alert>
        ) : null}

        {standardMethods.map(method => (
          <Card key={method.id}>
            <CardContent
              sx={{
                p: {xs: 2, md: 2.5},
                '&:last-child': {pb: {xs: 2, md: 2.5}},
              }}
            >
              <Stack
                direction={{xs: 'column', sm: 'row'}}
                spacing={1.5}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: {sm: 'center'},
                }}
              >
                <Box sx={{minWidth: 0}}>
                  <Typography variant="h6" sx={{overflowWrap: 'anywhere'}}>
                    {getPaymentMethodLabel(method)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Disponible para registrar y filtrar transacciones.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={method.isActive ? 'Activo' : 'Inactivo'}
                  color={method.isActive ? 'success' : 'default'}
                  sx={{alignSelf: {xs: 'flex-start', sm: 'center'}}}
                />
              </Stack>
            </CardContent>
          </Card>
        ))}

        {creditCards.length === 0 ? (
          <Alert severity="info">
            {creditCardModeEnabled
              ? 'No hay tarjetas de crédito configuradas.'
              : 'Los métodos adicionales están ocultos mientras el modo tarjeta está inactivo.'}
          </Alert>
        ) : (
          creditCards.map(method => (
            <Card key={method.id}>
              <CardContent
                sx={{
                  p: {xs: 2, md: 2.5},
                  '&:last-child': {pb: {xs: 2, md: 2.5}},
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{xs: 'column', sm: 'row'}}
                    spacing={1.5}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: {sm: 'flex-start'},
                    }}
                  >
                    <Box sx={{minWidth: 0}}>
                      <Typography variant="h6" sx={{overflowWrap: 'anywhere'}}>
                        {method.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={method.isActive ? 'Activa' : 'Inactiva'}
                        color={method.isActive ? 'success' : 'default'}
                        sx={{mt: 1}}
                      />
                    </Box>
                    <ManagementDialog
                      triggerLabel="Editar tarjeta"
                      title={method.name}
                      description="Ajusta el límite y las fechas de corte y pago."
                    >
                      <Box
                        component="form"
                        action={updatePaymentMethodAction.bind(null, method.id)}
                      >
                        <Stack spacing={2.5}>
                          <TextField
                            label="Método"
                            value={method.name}
                            disabled
                            fullWidth
                          />
                          <TextField
                            name="creditLimitUsd"
                            label="Límite USD"
                            type="number"
                            defaultValue={method.creditLimitUsd ?? ''}
                            fullWidth
                            slotProps={{htmlInput: {min: 0, step: 0.01}}}
                          />
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'},
                              gap: 2,
                            }}
                          >
                            <TextField
                              name="statementCutDay"
                              label="Día de corte"
                              type="number"
                              defaultValue={method.statementCutDay ?? ''}
                              fullWidth
                              slotProps={{htmlInput: {min: 1, max: 31}}}
                            />
                            <TextField
                              name="paymentDueDay"
                              label="Día de pago"
                              type="number"
                              defaultValue={method.paymentDueDay ?? ''}
                              fullWidth
                              slotProps={{htmlInput: {min: 1, max: 31}}}
                            />
                          </Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="isActive"
                                defaultChecked={method.isActive}
                              />
                            }
                            label="Tarjeta activa"
                          />
                          <Button type="submit" variant="contained" fullWidth>
                            Guardar tarjeta
                          </Button>
                        </Stack>
                      </Box>
                    </ManagementDialog>
                  </Stack>

                  <Divider />

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        sm: 'repeat(3, minmax(0, 1fr))',
                      },
                      gap: 2,
                    }}
                  >
                    <Box sx={{gridColumn: {xs: '1 / -1', sm: 'auto'}}}>
                      <Typography color="text.secondary" variant="caption">
                        Límite
                      </Typography>
                      <Typography
                        sx={{fontWeight: 800, overflowWrap: 'anywhere'}}
                      >
                        {method.creditLimitUsd
                          ? formatUsd(Number(method.creditLimitUsd))
                          : 'Sin definir'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Corte
                      </Typography>
                      <Typography sx={{fontWeight: 800}}>
                        {method.statementCutDay ?? '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Pago
                      </Typography>
                      <Typography sx={{fontWeight: 800}}>
                        {method.paymentDueDay ?? '—'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}
