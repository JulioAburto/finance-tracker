"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="contained"
      disabled={pending}
      sx={{ width: { xs: "100%", sm: "auto" } }}
    >
      {pending ? "Guardando..." : label}
    </Button>
  );
}
