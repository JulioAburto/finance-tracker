"use client";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useActionState } from "react";
import type {
  TransactionFormOption,
  TransactionFormState,
  TransactionFormValues,
} from "../types";
import { SubmitButton } from "./submit-button";

const initialState: TransactionFormState = { status: "idle" };

type TransactionFormProps = {
  action: (
    state: TransactionFormState,
    formData: FormData,
  ) => Promise<TransactionFormState>;
  categories: TransactionFormOption[];
  paymentMethods: TransactionFormOption[];
  initialValues: TransactionFormValues;
  submitLabel: string;
};

export function TransactionForm({
  action,
  categories,
  paymentMethods,
  initialValues,
  submitLabel,
}: TransactionFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const error = (field: keyof NonNullable<typeof state.fieldErrors>) =>
    state.fieldErrors?.[field];

  return (
    <Box component="form" action={formAction} noValidate>
      <Stack spacing={2}>
        {state.status === "error" && state.message ? (
          <Alert severity="error">{state.message}</Alert>
        ) : null}

        <TextField
          name="name"
          label="Nombre"
          defaultValue={initialValues.name}
          required
          error={Boolean(error("name"))}
          helperText={error("name")}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            name="amount"
            label="Monto"
            type="number"
            defaultValue={initialValues.amount}
            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
            required
            fullWidth
            error={Boolean(error("amount"))}
            helperText={error("amount")}
          />
          <TextField
            select
            name="currency"
            label="Moneda"
            defaultValue={initialValues.currency}
            required
            fullWidth
            error={Boolean(error("currency"))}
            helperText={error("currency")}
          >
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="NIO">NIO</MenuItem>
          </TextField>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            name="exchangeRate"
            label="Tipo de cambio (1 USD a NIO)"
            type="number"
            defaultValue={initialValues.exchangeRate}
            slotProps={{ htmlInput: { min: 0.0001, step: 0.0001 } }}
            required
            fullWidth
            error={Boolean(error("exchangeRate"))}
            helperText={error("exchangeRate")}
          />
          <TextField
            name="date"
            label="Fecha"
            type="date"
            defaultValue={initialValues.date}
            slotProps={{ inputLabel: { shrink: true } }}
            required
            fullWidth
            error={Boolean(error("date"))}
            helperText={error("date")}
          />
        </Stack>

        <TextField
          select
          name="type"
          label="Tipo"
          defaultValue={initialValues.type}
          required
          error={Boolean(error("type"))}
          helperText={
            error("type") ??
            "Los pagos de tarjeta y ahorros deben registrarse como transferencias."
          }
        >
          <MenuItem value="expense">Gasto</MenuItem>
          <MenuItem value="income">Ingreso</MenuItem>
          <MenuItem value="transfer">Transferencia</MenuItem>
        </TextField>

        <TextField
          select
          name="categoryId"
          label="Categoría"
          defaultValue={initialValues.categoryId}
          error={Boolean(error("categoryId"))}
          helperText={error("categoryId")}
        >
          <MenuItem value="">Sin categoría</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          name="paymentMethodId"
          label="Método de pago"
          defaultValue={initialValues.paymentMethodId}
          error={Boolean(error("paymentMethodId"))}
          helperText={error("paymentMethodId")}
        >
          <MenuItem value="">Sin método de pago</MenuItem>
          {paymentMethods.map((method) => (
            <MenuItem key={method.id} value={method.id}>
              {method.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="note"
          label="Nota"
          defaultValue={initialValues.note}
          multiline
          minRows={3}
          error={Boolean(error("note"))}
          helperText={error("note")}
        />

        <Stack direction="row" spacing={1}>
          <SubmitButton label={submitLabel} />
          <Button component={Link} href="/transactions">
            Cancelar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
