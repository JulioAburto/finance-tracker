import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Stack spacing={3} aria-label="Cargando contenido">
      <Stack spacing={1}>
        <Skeleton variant="text" width={220} height={48} />
        <Skeleton variant="text" width="min(100%, 360px)" />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {[0, 1, 2, 3].map((item) => (
          <Card key={item}>
            <CardContent>
              <Skeleton variant="text" width="55%" />
              <Skeleton variant="text" width="75%" height={40} />
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={44} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
