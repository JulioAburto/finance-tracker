import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Card sx={{ maxWidth: 640 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            Página no encontrada
          </Typography>
          <Typography color="text.secondary">
            La página solicitada no existe o la transacción ya no está
            disponible.
          </Typography>
          <Button
            href="/dashboard"
            variant="contained"
            sx={{ alignSelf: "flex-start" }}
          >
            Volver al resumen
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
