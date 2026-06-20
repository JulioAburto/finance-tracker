"use client";

import { Alert, Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card sx={{ maxWidth: 640 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            No se pudo cargar esta pantalla
          </Typography>
          <Alert severity="error">
            Ocurrió un problema al consultar la información. Intenta nuevamente.
          </Alert>
          <Button
            variant="contained"
            onClick={reset}
            sx={{ alignSelf: "flex-start" }}
          >
            Reintentar
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
