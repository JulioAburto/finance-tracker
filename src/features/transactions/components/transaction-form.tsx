"use client";

import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useActionState, useState } from "react";
import { isSavingsCategoryName } from "../schemas";
import type {
  PaymentMethodFormOption,
  TransactionFormOption,
  TransactionFormState,
  TransactionFormValues,
  TransactionType,
} from "../types";
import { SubmitButton } from "./submit-button";

const initialState: TransactionFormState = { status: "idle" };

type TransactionFormProps = {
  action: (
    state: TransactionFormState,
    formData: FormData,
  ) => Promise<TransactionFormState>;
  categories: TransactionFormOption[];
  paymentMethods: PaymentMethodFormOption[];
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
  const [transactionType, setTransactionType] = useState<TransactionType>(
    initialValues.type,
  );
  const [paymentMethodId, setPaymentMethodId] = useState(
    initialValues.paymentMethodId,
  );
  const error = (field: keyof NonNullable<typeof state.fieldErrors>) =>
    state.fieldErrors?.[field];
  const isExpense = transactionType === "expense";
  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.id === paymentMethodId,
  );
  const isCreditCard = selectedPaymentMethod?.type === "credit_card";

  return (
    <Box component="form" action={formAction} noValidate>
      <Stack spacing={3}>
        {state.status === "error" && state.message ? (
          <Alert severity="error">{state.message}</Alert>
        ) : null}

        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle1" fontWeight={800}>
              Datos principales
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Registra el monto y una descripción fácil de reconocer.
            </Typography>
          </div>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="amount"
              label="Monto"
              type="number"
              defaultValue={initialValues.amount}
              slotProps={{
                htmlInput: { min: 0.01, step: 0.01, inputMode: "decimal" },
              }}
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

          <TextField
            name="name"
            label="Nombre o comercio"
            defaultValue={initialValues.name}
            required
            error={Boolean(error("name"))}
            helperText={error("name") ?? "Ejemplo: La Colonia"}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
            <TextField
              select
              name="type"
              label="Tipo"
              value={transactionType}
              onChange={(event) =>
                setTransactionType(event.target.value as TransactionType)
              }
              required
              fullWidth
              error={Boolean(error("type"))}
              helperText={error("type")}
            >
              <MenuItem value="expense">Gasto</MenuItem>
              <MenuItem value="income">Ingreso</MenuItem>
              <MenuItem value="transfer">Transferencia</MenuItem>
            </TextField>
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle1" fontWeight={800}>
              Clasificación y pago
            </Typography>
            <Typography color="text.secondary" variant="body2">
              La categoría indica en qué se usó el dinero; el método indica
              cómo se pagó.
            </Typography>
          </div>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              name="categoryId"
              label="Categoría"
              defaultValue={initialValues.categoryId}
              required={isExpense}
              fullWidth
              error={Boolean(error("categoryId"))}
              helperText={
                error("categoryId") ??
                (isExpense
                  ? "Indica en qué se utilizó el dinero."
                  : "Opcional para ingresos y transferencias.")
              }
            >
              <MenuItem value="">
                {isExpense ? "Selecciona una categoría" : "Sin categoría"}
              </MenuItem>
              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  value={category.id}
                  disabled={isExpense && isSavingsCategoryName(category.name)}
                >
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              name="paymentMethodId"
              label="Método de pago"
              value={paymentMethodId}
              onChange={(event) => setPaymentMethodId(event.target.value)}
              required={isExpense}
              fullWidth
              error={Boolean(error("paymentMethodId"))}
              helperText={
                error("paymentMethodId") ??
                (isExpense
                  ? "Indica cómo se pagó."
                  : "Opcional para ingresos y transferencias.")
              }
            >
              <MenuItem value="">
                {isExpense
                  ? "Selecciona un método de pago"
                  : "Sin método de pago"}
              </MenuItem>
              {paymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Typography color="text.secondary" variant="body2">
            Una compra es un gasto. Los pagos de tarjeta y el ahorro se
            registran como transferencias.
          </Typography>

          {isCreditCard ? (
            <Alert severity="info">
              {isExpense
                ? "Esta compra contará como gasto. Cuando pagues la tarjeta, registra el pago como transferencia."
                : "El pago de la tarjeta no contará como un gasto nuevo."}
            </Alert>
          ) : null}
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle1" fontWeight={800}>
              Conversión y nota
            </Typography>
            <Typography color="text.secondary" variant="body2">
              La tasa queda guardada con esta transacción y no cambia después.
            </Typography>
          </div>

          <TextField
            name="exchangeRate"
            label="Tipo de cambio (1 USD a NIO)"
            type="number"
            defaultValue={initialValues.exchangeRate}
            slotProps={{ htmlInput: { min: 0.0001, step: 0.0001 } }}
            required
            fullWidth
            error={Boolean(error("exchangeRate"))}
            helperText={
              error("exchangeRate") ??
              "Se usa para guardar los valores históricos en USD y NIO."
            }
          />

          <TextField
            name="note"
            label="Nota opcional"
            defaultValue={initialValues.note}
            multiline
            minRows={3}
            error={Boolean(error("note"))}
            helperText={error("note")}
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <SubmitButton label={submitLabel} />
          <Button
            component={Link}
            href="/transactions"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancelar
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
