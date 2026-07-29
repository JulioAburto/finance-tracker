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
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", gap: 1, minWidth: 0 }}
          >
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ minWidth: 0, overflowWrap: "anywhere" }}
            >
              {label}
            </Typography>
            {indicator}
          </Stack>
          <Typography
            variant="h5"
            sx={{ lineHeight: 1.25, overflowWrap: "anywhere" }}
          >
            {value}
          </Typography>
          {context ? (
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ overflowWrap: "anywhere" }}
            >
              {context}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
