import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type SummaryCardProps = {
  label: string;
  value: string;
  context?: string;
  indicator?: ReactNode;
};

export function SummaryCard({
  label,
  value,
  context,
  indicator,
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
            {indicator}
          </Stack>
          <Typography variant="h5">{value}</Typography>
          {context ? (
            <Typography color="text.secondary" variant="body2">
              {context}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
