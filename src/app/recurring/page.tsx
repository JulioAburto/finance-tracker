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
import {MonthSelector} from '@/components/ui/month-selector';
import {
  createRecurringTemplateAction,
  generateRecurringTransactionsAction,
  updateRecurringTemplateAction,
} from '@/features/recurring/actions';
import {ManagementDialog} from '@/features/management/components/management-dialog';
import {getRecurringPageData} from '@/features/recurring/queries';
import {normalizeMonth, formatDisplayDate} from '@/lib/date/month';
import {formatNio, formatUsd} from '@/lib/money/format';
import {isSavingsCategoryName} from '@/features/transactions/schemas';

export const dynamic = 'force-dynamic';

type RecurringTemplate = Awaited<
  ReturnType<typeof getRecurringPageData>
>['templates'][number];
type SelectOption = {id: string; name: string};

function formatTemplateAmount(amount: string, currency: 'USD' | 'NIO'): string {
  const numericAmount = Number(amount);
  return currency === 'USD'
    ? formatUsd(numericAmount)
    : formatNio(numericAmount);
}

function getTemplateStatus(template: RecurringTemplate): {
  label: string;
  color: 'success' | 'warning' | 'default';
} {
  if (!template.isActive) return {label: 'Inactiva', color: 'default'};

  if (template.categoryName && isSavingsCategoryName(template.categoryName)) {
    return {label: 'Categoría no válida para gastos', color: 'warning'};
  }

  if (
    !template.categoryId ||
    !template.paymentMethodId ||
    template.categoryIsActive !== true ||
    template.paymentMethodIsActive !== true
  ) {
    return {label: 'Incompleta', color: 'warning'};
  }

  return {label: 'Activa', color: 'success'};
}

function hasOption(options: SelectOption[], id: string | null): boolean {
  return Boolean(id && options.some(option => option.id === id));
}

function TemplateForm({
  template,
  month,
  categories,
  paymentMethods,
  action,
  submitLabel,
}: {
  template?: RecurringTemplate;
  month: string;
  categories: SelectOption[];
  paymentMethods: SelectOption[];
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  const categoryHasOption = hasOption(categories, template?.categoryId ?? null);
  const paymentMethodHasOption = hasOption(
    paymentMethods,
    template?.paymentMethodId ?? null,
  );

  return (
    <Box component="form" action={action}>
      <input type="hidden" name="month" value={month} />
      <Stack spacing={2.5}>
        <TextField
          name="name"
          label="Nombre"
          defaultValue={template?.name ?? ''}
          required
          fullWidth
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr 1fr'},
            gap: 2,
          }}
        >
          <TextField
            name="amount"
            label="Monto"
            type="number"
            defaultValue={template?.amount ?? ''}
            required
            fullWidth
            slotProps={{htmlInput: {min: 0.01, step: 0.01}}}
          />
          <TextField
            name="currency"
            label="Moneda"
            select
            defaultValue={template?.currency ?? 'USD'}
            required
            fullWidth
          >
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="NIO">NIO</MenuItem>
          </TextField>
          <TextField
            name="dayOfMonth"
            label="Día del mes"
            type="number"
            defaultValue={template?.dayOfMonth ?? 1}
            required
            fullWidth
            slotProps={{htmlInput: {min: 1, max: 31, step: 1}}}
          />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'},
            gap: 2,
          }}
        >
          <TextField
            name="categoryId"
            label="Categoría"
            select
            defaultValue={template?.categoryId ?? ''}
            fullWidth
          >
            <MenuItem value="">Sin categoría</MenuItem>
            {template?.categoryId && !categoryHasOption ? (
              <MenuItem value={template.categoryId} disabled>
                {template.categoryName ?? 'Categoría no disponible'}
              </MenuItem>
            ) : null}
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="paymentMethodId"
            label="Método de pago"
            select
            defaultValue={template?.paymentMethodId ?? ''}
            fullWidth
          >
            <MenuItem value="">Sin método</MenuItem>
            {template?.paymentMethodId && !paymentMethodHasOption ? (
              <MenuItem value={template.paymentMethodId} disabled>
                {template.paymentMethodName ?? 'Método no disponible'}
              </MenuItem>
            ) : null}
            {paymentMethods.map(paymentMethod => (
              <MenuItem key={paymentMethod.id} value={paymentMethod.id}>
                {paymentMethod.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <TextField
          name="note"
          label="Nota"
          defaultValue={template?.note ?? ''}
          multiline
          minRows={2}
          fullWidth
        />
        <FormControlLabel
          control={
            <Checkbox
              name="isActive"
              defaultChecked={template?.isActive ?? false}
            />
          }
          label="Activa"
        />
        <Button type="submit" variant="contained" fullWidth>
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}

export default async function RecurringPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const month = normalizeMonth(params.month);
  const data = await getRecurringPageData(month);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Gastos recurrentes"
        description="Genera manualmente los gastos mensuales configurados como plantillas activas."
        action={
          <ManagementDialog
            triggerLabel="Nueva plantilla"
            triggerVariant="contained"
            title="Crear plantilla"
            description="Una plantilla inactiva puede guardarse sin categoría ni método."
          >
            <TemplateForm
              month={month}
              categories={data.categories}
              paymentMethods={data.paymentMethods}
              action={createRecurringTemplateAction}
              submitLabel="Crear plantilla"
            />
          </ManagementDialog>
        }
      />

      {params.status === 'saved' ? (
        <Alert severity="success">Cambios guardados.</Alert>
      ) : null}
      {params.status === 'invalid' ? (
        <Alert severity="error">
          Revisa los valores. Para activar una plantilla, la categoría y el
          método deben estar activos. Ahorro debe registrarse como
          transferencia.
        </Alert>
      ) : null}
      {params.status === 'generated' ? (
        <Alert severity="success">
          Generación de {month}: {params.created ?? 0} creadas,{' '}
          {params.duplicate ?? 0} duplicadas omitidas, {params.inactive ?? 0}{' '}
          inactivas omitidas y {params.incomplete ?? 0} incompletas omitidas.
        </Alert>
      ) : null}
      {params.status === 'generated' && Number(params.invalid) > 0 ? (
        <Alert severity="warning">
          {params.invalid} plantillas no válidas omitidas. Revisa sus montos y
          la tasa de cambio. Ahorro no puede generarse como gasto.
        </Alert>
      ) : null}

      <Card>
        <CardContent sx={{p: 2, '&:last-child': {pb: 2}}}>
          <Stack
            direction={{xs: 'column', md: 'row'}}
            spacing={1.5}
            sx={{alignItems: {md: 'center'}, justifyContent: 'space-between'}}
          >
            <MonthSelector
              month={month}
              label="Mes a generar"
              fullWidth
              sx={{maxWidth: {md: 260}}}
            />
            <Box component="form" action={generateRecurringTransactionsAction}>
              <input type="hidden" name="month" value={month} />
              <Button
                type="submit"
                variant="contained"
                sx={{width: {xs: '100%', md: 'auto'}}}
              >
                Generar gastos recurrentes de {month}
              </Button>
            </Box>
          </Stack>
          <Typography color="text.secondary" variant="body2" sx={{mt: 1.5}}>
            Tasa actual para nuevas transacciones: {data.defaultExchangeRate}{' '}
            NIO por 1 USD.
          </Typography>
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6">Plantillas</Typography>
          <Typography color="text.secondary" variant="body2">
            {data.templates.length}{' '}
            {data.templates.length === 1 ? 'plantilla' : 'plantillas'}
          </Typography>
        </Box>

        {data.templates.length === 0 ? (
          <Alert severity="info">Todavía no hay plantillas recurrentes.</Alert>
        ) : null}

        {data.templates.map(template => {
          const status = getTemplateStatus(template);

          return (
            <Card key={template.id}>
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
                        {template.name}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{mt: 1, flexWrap: 'wrap', rowGap: 1}}
                      >
                        <Chip
                          size="small"
                          label={status.label}
                          color={status.color}
                        />
                        {template.run ? (
                          <Chip
                            size="small"
                            label={
                              template.run.transactionId
                                ? `Generada ${formatDisplayDate(template.run.scheduledDate)}`
                                : `Run registrado ${formatDisplayDate(template.run.scheduledDate)}`
                            }
                            color="info"
                          />
                        ) : null}
                      </Stack>
                    </Box>
                    <ManagementDialog
                      triggerLabel="Editar"
                      title={`Editar ${template.name}`}
                      description="Actualiza el monto, fecha, categoría, método y estado."
                    >
                      <TemplateForm
                        template={template}
                        month={month}
                        categories={data.categories}
                        paymentMethods={data.paymentMethods}
                        action={updateRecurringTemplateAction.bind(
                          null,
                          template.id,
                        )}
                        submitLabel="Guardar plantilla"
                      />
                    </ManagementDialog>
                  </Stack>

                  <Divider />

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr 1fr',
                        md: 'repeat(4, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Monto
                      </Typography>
                      <Typography sx={{fontWeight: 800}}>
                        {formatTemplateAmount(
                          template.amount,
                          template.currency,
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Día
                      </Typography>
                      <Typography sx={{fontWeight: 800}}>
                        {template.dayOfMonth}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Categoría
                      </Typography>
                      <Typography
                        sx={{fontWeight: 800, overflowWrap: 'anywhere'}}
                      >
                        {template.categoryName ?? 'Sin categoría'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        Método
                      </Typography>
                      <Typography
                        sx={{fontWeight: 800, overflowWrap: 'anywhere'}}
                      >
                        {template.paymentMethodName ?? 'Sin método'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
