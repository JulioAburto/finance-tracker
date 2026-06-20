"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Stack spacing={2} sx={{ maxWidth: 640 }}>
      <Typography variant="h4" component="h1">
        No se pudo cargar esta pantalla
      </Typography>
      <Alert severity="error">
        Ocurrió un problema al consultar la información. Intenta nuevamente.
      </Alert>
      <Button variant="contained" onClick={reset} sx={{ alignSelf: "flex-start" }}>
        Reintentar
      </Button>
    </Stack>
  );
}
