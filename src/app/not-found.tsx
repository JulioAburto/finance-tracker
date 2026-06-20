import { Button, Stack, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Stack spacing={2} sx={{ maxWidth: 640 }}>
      <Typography variant="h4" component="h1">
        Página no encontrada
      </Typography>
      <Typography color="text.secondary">
        La página solicitada no existe o la transacción ya no está disponible.
      </Typography>
      <Button href="/dashboard" variant="contained" sx={{ alignSelf: "flex-start" }}>
        Volver al resumen
      </Button>
    </Stack>
  );
}
