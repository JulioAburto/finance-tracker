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
import { ManagementDialog } from "@/features/management/components/management-dialog";
import { getCategoryManagementData } from "@/features/management/queries";
import { normalizeMonth } from "@/lib/date/month";
import { formatUsd } from "@/lib/money/format";

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
        action={
          <ManagementDialog
            triggerLabel="Nueva categoría"
            triggerVariant="contained"
            title="Crear categoría"
            description="Configura el nombre y presupuesto predeterminado. Podrás ajustar sus umbrales después."
          >
            <Box component="form" action={createCategoryAction}>
              <Stack spacing={2.5}>
                <TextField name="name" label="Nombre" required fullWidth />
                <TextField
                  name="monthlyBudgetUsd"
                  label="Presupuesto predeterminado (USD)"
                  type="number"
                  required
                  fullWidth
                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                />
                <TextField
                  name="sortOrder"
                  label="Orden"
                  type="number"
                  defaultValue="0"
                  fullWidth
                />
                <FormControlLabel
                  control={<Checkbox name="isEssential" />}
                  label="Esencial"
                />
                <Button type="submit" variant="contained" fullWidth>
                  Crear categoría
                </Button>
              </Stack>
            </Box>
          </ManagementDialog>
        }
      />

      {params.status === "saved" ? (
        <Alert severity="success">Cambios guardados.</Alert>
      ) : null}
      {params.status === "invalid" ? (
        <Alert severity="error">Revisa los valores ingresados.</Alert>
      ) : null}

      <Card component="form" method="get">
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: { sm: "center" } }}
          >
            <TextField
              name="month"
              label="Mes a administrar"
              type="month"
              defaultValue={month}
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ maxWidth: { sm: 260 } }}
            />
            <Button
              type="submit"
              variant="outlined"
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Ver mes
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {!data.budget ? (
        <Alert severity="warning">
          Crea el presupuesto de {month} antes de guardar asignaciones mensuales
          por categoría.
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6">Presupuesto mensual</Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                {data.budget
                  ? `${formatUsd(Number(data.budget.salaryUsd))} disponibles · ${formatUsd(Number(data.budget.expectedSavingsUsd))} de ahorro esperado`
                  : `Todavía no hay presupuesto para ${month}.`}
              </Typography>
            </Box>
            <ManagementDialog
              triggerLabel={data.budget ? "Editar presupuesto" : "Crear presupuesto"}
              title={`Presupuesto de ${month}`}
              description="Estos valores definen el ingreso disponible y el ahorro esperado del mes."
            >
              <Box component="form" action={saveMonthlyBudgetAction}>
                <Stack spacing={2.5}>
                  <TextField
                    name="month"
                    label="Mes"
                    type="month"
                    defaultValue={month}
                    required
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    name="salaryUsd"
                    label="Ingreso disponible (USD)"
                    type="number"
                    defaultValue={data.budget?.salaryUsd ?? ""}
                    required
                    fullWidth
                    slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                  />
                  <TextField
                    name="expectedSavingsUsd"
                    label="Ahorro esperado (USD)"
                    type="number"
                    defaultValue={data.budget?.expectedSavingsUsd ?? "0"}
                    required
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                  />
                  <Button type="submit" variant="contained" fullWidth>
                    Guardar presupuesto
                  </Button>
                </Stack>
              </Box>
            </ManagementDialog>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6">Categorías</Typography>
          <Typography color="text.secondary" variant="body2">
            {data.categories.length} {data.categories.length === 1 ? "categoría" : "categorías"}
          </Typography>
        </Box>

        {data.categories.map((category) => (
          <Card key={category.id}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ overflowWrap: "anywhere" }}>
                      {category.name}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}
                    >
                      <Chip
                        size="small"
                        label={category.isActive ? "Activa" : "Inactiva"}
                        color={category.isActive ? "success" : "default"}
                      />
                      {category.isEssential ? (
                        <Chip size="small" label="Esencial" color="info" />
                      ) : null}
                    </Stack>
                  </Box>
                  <ManagementDialog
                    triggerLabel="Editar"
                    title={`Editar ${category.name}`}
                    description="Actualiza el presupuesto, los umbrales y la disponibilidad de esta categoría."
                  >
                    <Box
                      component="form"
                      action={updateCategoryAction.bind(null, category.id)}
                    >
                      <input type="hidden" name="month" value={month} />
                      <Stack spacing={2.5}>
                        <TextField
                          name="name"
                          label="Categoría"
                          defaultValue={category.name}
                          required
                          fullWidth
                        />
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 2,
                          }}
                        >
                          <TextField
                            name="monthlyBudgetUsd"
                            label="Predeterminado USD"
                            type="number"
                            defaultValue={category.monthlyBudgetUsd}
                            fullWidth
                            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                          />
                          <TextField
                            name="selectedMonthBudgetUsd"
                            label={`Presupuesto ${month}`}
                            type="number"
                            defaultValue={category.selectedMonthBudgetUsd}
                            fullWidth
                            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                          />
                          <TextField
                            name="sortOrder"
                            label="Orden"
                            type="number"
                            defaultValue={category.sortOrder}
                            fullWidth
                          />
                        </Box>
                        <Divider />
                        <Typography variant="subtitle2">Umbrales de alerta</Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                            gap: 2,
                          }}
                        >
                          <TextField
                            name="warningThreshold"
                            label="Cuidado %"
                            type="number"
                            defaultValue={category.warningThreshold}
                            fullWidth
                          />
                          <TextField
                            name="dangerThreshold"
                            label="Alerta %"
                            type="number"
                            defaultValue={category.dangerThreshold}
                            fullWidth
                          />
                          <TextField
                            name="exceededThreshold"
                            label="Excedido %"
                            type="number"
                            defaultValue={category.exceededThreshold}
                            fullWidth
                          />
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="isEssential"
                                defaultChecked={category.isEssential}
                              />
                            }
                            label="Esencial"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="isActive"
                                defaultChecked={category.isActive}
                              />
                            }
                            label="Activa"
                          />
                        </Stack>
                        <Button type="submit" variant="contained" fullWidth>
                          Guardar categoría
                        </Button>
                      </Stack>
                    </Box>
                  </ManagementDialog>
                </Stack>

                <Divider />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      Presupuesto {month}
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {formatUsd(Number(category.selectedMonthBudgetUsd))}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="caption">
                      Predeterminado
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {formatUsd(Number(category.monthlyBudgetUsd))}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}>
                    <Typography color="text.secondary" variant="caption">
                      Umbrales
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {category.warningThreshold}% · {category.dangerThreshold}% ·{" "}
                      {category.exceededThreshold}%
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
