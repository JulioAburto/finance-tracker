import { Box, Button, Stack, Typography } from "@mui/material";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        alignItems: "center",
        py: 4,
        px: 2,
        textAlign: "center",
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: "primary.light",
          border: "1px solid",
          borderColor: "divider",
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ overflowWrap: "anywhere" }}
        >
          {description}
        </Typography>
      </Box>
      {actionHref && actionLabel ? (
        <Button
          href={actionHref}
          variant="contained"
          size="small"
          sx={{ minHeight: 44, width: { xs: "100%", sm: "auto" } }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
