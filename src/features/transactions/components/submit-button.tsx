"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="contained" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}
