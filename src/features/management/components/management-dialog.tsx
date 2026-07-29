"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { ButtonProps } from "@mui/material";
import type { ReactNode } from "react";
import { useId, useState } from "react";

type ManagementDialogProps = {
  triggerLabel: string;
  title: string;
  description?: string;
  triggerVariant?: ButtonProps["variant"];
  children: ReactNode;
};

export function ManagementDialog({
  triggerLabel,
  title,
  description,
  triggerVariant = "outlined",
  children,
}: ManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const titleId = useId();

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        onClick={() => setOpen(true)}
        sx={{ width: { xs: "100%", sm: "auto" }, flexShrink: 0 }}
      >
        {triggerLabel}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
        aria-labelledby={titleId}
        slotProps={{
          paper: {
            sx: {
              m: { xs: 0, sm: 2 },
              maxHeight: {
                sm: "calc(100dvh - 32px)",
              },
            },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            pt: { xs: "max(16px, env(safe-area-inset-top))", sm: 2.5 },
            px: { xs: 2, sm: 3 },
            pb: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography id={titleId} variant="h6" component="h2">
                {title}
              </Typography>
              {description ? (
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ mt: 0.5, overflowWrap: "anywhere" }}
                >
                  {description}
                </Typography>
              ) : null}
            </Box>
            <Button
              type="button"
              color="inherit"
              onClick={() => setOpen(false)}
              sx={{ flexShrink: 0 }}
            >
              Cerrar
            </Button>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            pb: {
              xs: "max(24px, env(safe-area-inset-bottom))",
              sm: 3,
            },
            overscrollBehavior: "contain",
          }}
        >
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
