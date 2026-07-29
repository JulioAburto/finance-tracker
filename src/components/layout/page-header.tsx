import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: { sm: "center" },
        minWidth: 0,
      }}
    >
      <Box sx={{ maxWidth: 720, minWidth: 0 }}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {description ? (
          <Typography
            color="text.secondary"
            sx={{ mt: 0.75, overflowWrap: "anywhere" }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? (
        <Box sx={{ width: { xs: "100%", sm: "auto" }, flexShrink: 0, minWidth: 0 }}>
          {action}
        </Box>
      ) : null}
    </Stack>
  );
}
