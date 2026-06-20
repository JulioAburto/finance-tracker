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
      <div>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      </div>
      {actionHref && actionLabel ? (
        <Button href={actionHref} variant="contained" size="small">
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
