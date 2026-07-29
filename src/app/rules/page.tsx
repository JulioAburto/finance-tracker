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
} from "@mui/material";
import { PageHeader } from "@/components/layout/page-header";
import { createRuleAction, updateRuleAction } from "@/features/management/actions";
import { ManagementDialog } from "@/features/management/components/management-dialog";
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
      <PageHeader
        title="Reglas de comercios"
        description="Clasifica gastos repetidos antes de recurrir a cualquier sugerencia de IA."
        action={
          <ManagementDialog
            triggerLabel="Nueva regla"
            triggerVariant="contained"
            title="Crear regla"
            description="Las prioridades menores se evalúan primero. El patrón debe coincidir con el nombre del comercio."
          >
            <Box component="form" action={createRuleAction}>
              <Stack spacing={2.5}>
                <TextField
                  name="pattern"
                  label="Patrón"
                  helperText="Ejemplo: netflix|max|spotify"
                  required
                  fullWidth
                />
                <TextField
                  select
                  name="categoryId"
                  label="Categoría destino"
                  defaultValue={data.categories[0]?.id ?? ""}
                  required
                  fullWidth
                >
                  {data.categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="priority"
                  label="Prioridad"
                  type="number"
                  defaultValue="100"
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" fullWidth>
                  Crear regla
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
        <Alert severity="error">El patrón o los valores no son válidos.</Alert>
      ) : null}

      <Alert severity="info">
        Las reglas activas se evalúan por prioridad. Ninguna regla ejecuta código
        arbitrario ni reemplaza una categoría elegida manualmente.
      </Alert>

      {data.rules.length === 0 ? (
        <Alert severity="info">
          No hay reglas. Crea una para clasificar comercios repetidos.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6">Reglas configuradas</Typography>
            <Typography color="text.secondary" variant="body2">
              {data.rules.length} {data.rules.length === 1 ? "regla" : "reglas"}
            </Typography>
          </Box>

          {data.rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: { sm: "flex-start" },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" sx={{ overflowWrap: "anywhere" }}>
                        {rule.pattern}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ mt: 0.5, overflowWrap: "anywhere" }}
                      >
                        Clasifica como {rule.categoryName}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}
                      >
                        <Chip
                          size="small"
                          label={rule.isActive ? "Activa" : "Inactiva"}
                          color={rule.isActive ? "success" : "default"}
                        />
                        <Chip size="small" label={`Prioridad ${rule.priority}`} />
                      </Stack>
                    </Box>

                    <ManagementDialog
                      triggerLabel="Editar"
                      title="Editar regla"
                      description="Actualiza el patrón, la categoría de destino o su orden de evaluación."
                    >
                      <Box
                        component="form"
                        action={updateRuleAction.bind(null, rule.id)}
                      >
                        <Stack spacing={2.5}>
                          <TextField
                            name="pattern"
                            label="Patrón"
                            defaultValue={rule.pattern}
                            required
                            fullWidth
                          />
                          <TextField
                            select
                            name="categoryId"
                            label="Categoría"
                            defaultValue={rule.categoryId}
                            required
                            fullWidth
                          >
                            {data.categories.map((category) => (
                              <MenuItem key={category.id} value={category.id}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            name="priority"
                            label="Prioridad"
                            type="number"
                            defaultValue={rule.priority}
                            required
                            fullWidth
                          />
                          <Divider />
                          <FormControlLabel
                            control={
                              <Checkbox name="isActive" defaultChecked={rule.isActive} />
                            }
                            label="Regla activa"
                          />
                          <Button type="submit" variant="contained" fullWidth>
                            Guardar regla
                          </Button>
                        </Stack>
                      </Box>
                    </ManagementDialog>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
