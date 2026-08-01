'use client';

import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import {useActionState, useCallback, useEffect, useId, useState} from 'react';
import {
  getPaymentMethodLabel,
  getVisiblePaymentMethods,
} from '@/lib/payment-methods';
import {isSavingsCategoryName} from '../schemas';
import type {
  TransactionField,
  PaymentMethodFormOption,
  TransactionFormOption,
  TransactionFormState,
  TransactionFormValues,
  TransactionType,
} from '../types';
import {SubmitButton} from './submit-button';

const initialState: TransactionFormState = {status: 'idle'};
const MOBILE_FIELD_SX = {
  '& .MuiInputBase-input': {
    fontSize: 16,
  },
  '& .MuiInputBase-inputMultiline': {
    fontSize: 16,
  },
  '& .MuiSelect-select': {
    fontSize: 16,
  },
} as const;

const FIELD_ID_SUFFIX: Record<TransactionField, string> = {
  amount: 'amount',
  currency: 'currency',
  name: 'name',
  categoryId: 'category',
  paymentMethodId: 'payment-method',
  date: 'date',
  type: 'type',
  exchangeRate: 'exchange-rate',
  note: 'note',
};

type TransactionFormProps = {
  action: (
    state: TransactionFormState,
    formData: FormData,
  ) => Promise<TransactionFormState>;
  categories: TransactionFormOption[];
  paymentMethods: PaymentMethodFormOption[];
  creditCardModeEnabled: boolean;
  initialValues: TransactionFormValues;
  submitLabel: string;
};

export function TransactionForm({
  action,
  categories,
  paymentMethods,
  creditCardModeEnabled,
  initialValues,
  submitLabel,
}: TransactionFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [transactionType, setTransactionType] = useState<TransactionType>(
    initialValues.type,
  );
  const [currency, setCurrency] = useState(initialValues.currency);
  const [paymentMethodId, setPaymentMethodId] = useState(
    initialValues.paymentMethodId,
  );
  const fieldIdPrefix = useId();
  const error = (field: keyof NonNullable<typeof state.fieldErrors>) =>
    state.fieldErrors?.[field];
  const isExpense = transactionType === 'expense';
  const selectedPaymentMethod = paymentMethods.find(
    method => method.id === paymentMethodId,
  );
  const visiblePaymentMethods = getVisiblePaymentMethods(
    paymentMethods,
    creditCardModeEnabled,
    paymentMethodId,
  );
  const isCreditCard = selectedPaymentMethod?.type === 'credit_card';
  const hasFieldErrors = Boolean(
    state.status === 'error' &&
    state.fieldErrors &&
    Object.keys(state.fieldErrors).length > 0,
  );

  const getFieldId = useCallback(
    (field: TransactionField): string =>
      `${fieldIdPrefix}-${FIELD_ID_SUFFIX[field]}`,
    [fieldIdPrefix],
  );

  useEffect(() => {
    if (!state.fieldErrors) return;

    const fieldOrder: TransactionField[] = [
      'amount',
      'currency',
      'name',
      'categoryId',
      'paymentMethodId',
      'date',
      'type',
      'exchangeRate',
      'note',
    ];
    const firstInvalidField = fieldOrder.find(
      field => state.fieldErrors?.[field],
    );
    if (!firstInvalidField) return;

    const target = document.getElementById(getFieldId(firstInvalidField));
    if (target instanceof HTMLElement) {
      target.focus();
      target.scrollIntoView({block: 'center', behavior: 'smooth'});
    }
  }, [getFieldId, state.fieldErrors]);

  return (
    <Box component="form" action={formAction} noValidate>
      <Stack spacing={3} sx={{minWidth: 0}}>
        {state.status === 'error' && state.message ? (
          <Alert severity="error">{state.message}</Alert>
        ) : null}

        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle1" sx={{fontWeight: 800}}>
              Datos principales
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Registra el monto y una descripción fácil de reconocer.
            </Typography>
          </div>

          <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
            <TextField
              id={getFieldId('amount')}
              name="amount"
              label="Monto"
              type="number"
              defaultValue={initialValues.amount}
              slotProps={{
                htmlInput: {min: 0.01, step: 0.01, inputMode: 'decimal'},
              }}
              required
              fullWidth
              error={Boolean(error('amount'))}
              helperText={
                error('amount') ?? 'Ingresa el monto exacto del movimiento.'
              }
              sx={MOBILE_FIELD_SX}
            />
            <TextField
              id={getFieldId('currency')}
              select
              name="currency"
              label="Moneda"
              value={currency}
              onChange={event =>
                setCurrency(event.target.value as 'USD' | 'NIO')
              }
              required
              fullWidth
              error={Boolean(error('currency'))}
              helperText={error('currency')}
              sx={MOBILE_FIELD_SX}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="NIO">NIO</MenuItem>
            </TextField>
          </Stack>

          <TextField
            id={getFieldId('name')}
            name="name"
            label="Nombre o comercio"
            defaultValue={initialValues.name}
            required
            fullWidth
            error={Boolean(error('name'))}
            helperText={error('name') ?? 'Ejemplo: La Colonia'}
            sx={MOBILE_FIELD_SX}
          />
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle1" sx={{fontWeight: 800}}>
              Clasificación y pago
            </Typography>
            <Typography color="text.secondary" variant="body2">
              La categoría indica en qué se usó el dinero; el método indica cómo
              se pagó.
            </Typography>
          </div>

          <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
            <TextField
              id={getFieldId('categoryId')}
              select
              name="categoryId"
              label="Categoría"
              defaultValue={initialValues.categoryId}
              required={isExpense}
              fullWidth
              error={Boolean(error('categoryId'))}
              helperText={
                error('categoryId') ??
                (isExpense
                  ? 'Indica en qué se utilizó el dinero.'
                  : 'Opcional para ingresos y transferencias.')
              }
              sx={MOBILE_FIELD_SX}
            >
              <MenuItem value="">
                {isExpense ? 'Selecciona una categoría' : 'Sin categoría'}
              </MenuItem>
              {categories.map(category => (
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
              id={getFieldId('paymentMethodId')}
              select
              name="paymentMethodId"
              label="Método de pago"
              value={paymentMethodId}
              onChange={event => setPaymentMethodId(event.target.value)}
              required={isExpense}
              fullWidth
              error={Boolean(error('paymentMethodId'))}
              helperText={
                error('paymentMethodId') ??
                (isExpense
                  ? 'Indica cómo se pagó.'
                  : 'Opcional para ingresos y transferencias.')
              }
              sx={MOBILE_FIELD_SX}
            >
              <MenuItem value="">
                {isExpense
                  ? 'Selecciona un método de pago'
                  : 'Sin método de pago'}
              </MenuItem>
              {visiblePaymentMethods.map(method => (
                <MenuItem key={method.id} value={method.id}>
                  {getPaymentMethodLabel(method)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
            <TextField
              id={getFieldId('date')}
              name="date"
              label="Fecha"
              type="date"
              defaultValue={initialValues.date}
              slotProps={{inputLabel: {shrink: true}}}
              required
              fullWidth
              error={Boolean(error('date'))}
              helperText={error('date')}
              sx={MOBILE_FIELD_SX}
            />
            <TextField
              id={getFieldId('type')}
              select
              name="type"
              label="Tipo de transacción"
              value={transactionType}
              onChange={event =>
                setTransactionType(event.target.value as TransactionType)
              }
              required
              fullWidth
              error={Boolean(error('type'))}
              helperText={
                error('type') ?? 'Elige si es gasto, ingreso o transferencia.'
              }
              sx={MOBILE_FIELD_SX}
            >
              <MenuItem value="expense">Gasto</MenuItem>
              <MenuItem value="income">Ingreso</MenuItem>
              <MenuItem value="transfer">Transferencia</MenuItem>
            </TextField>
          </Stack>

          <Typography color="text.secondary" variant="body2">
            Una compra es un gasto. Los pagos de tarjeta y el ahorro se
            registran como transferencias.
          </Typography>

          {isCreditCard ? (
            <Alert severity="info">
              {isExpense
                ? 'Esta compra contará como gasto. Cuando pagues la tarjeta, registra el pago como transferencia.'
                : 'El pago de la tarjeta no contará como un gasto nuevo.'}
            </Alert>
          ) : null}
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <div>
            <Typography variant="subtitle1" sx={{fontWeight: 800}}>
              Conversión y nota
            </Typography>
            <Typography color="text.secondary" variant="body2">
              La tasa queda guardada con esta transacción y no cambia después.
            </Typography>
          </div>

          <TextField
            id={getFieldId('exchangeRate')}
            name="exchangeRate"
            label="Tipo de cambio (1 USD a NIO)"
            type="number"
            defaultValue={initialValues.exchangeRate}
            slotProps={{
              htmlInput: {min: 0.0001, step: 0.0001, inputMode: 'decimal'},
            }}
            required
            fullWidth
            error={Boolean(error('exchangeRate'))}
            helperText={
              error('exchangeRate') ??
              (currency === 'USD'
                ? 'Aunque registres USD, la tasa se guarda para conservar el valor histórico en NIO.'
                : 'Se usa para guardar los valores históricos en USD y NIO.')
            }
            sx={MOBILE_FIELD_SX}
          />

          <TextField
            id={getFieldId('note')}
            name="note"
            label="Nota opcional"
            defaultValue={initialValues.note}
            multiline
            minRows={3}
            fullWidth
            error={Boolean(error('note'))}
            helperText={
              error('note') ??
              'Opcional. Úsala para un detalle que quieras recordar.'
            }
            sx={MOBILE_FIELD_SX}
          />
        </Stack>

        <Box
          sx={{
            position: {xs: 'sticky', sm: 'static'},
            bottom: 0,
            zIndex: 1,
            mt: 1,
            mx: {xs: -2, md: 0},
            px: {xs: 2, md: 0},
            pt: 2,
            pb: {
              xs: 'max(16px, env(safe-area-inset-bottom))',
              sm: 0,
            },
            borderTop: '1px solid',
            borderColor: {xs: 'divider', sm: 'transparent'},
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={1.25}>
            {hasFieldErrors ? (
              <Typography color="error.main" variant="body2">
                Revisa los campos marcados antes de guardar.
              </Typography>
            ) : null}

            <Stack direction={{xs: 'column', sm: 'row'}} spacing={1}>
              <SubmitButton label={submitLabel} fullWidth />
              <Button
                component={Link}
                href="/transactions"
                variant="text"
                sx={{width: {xs: '100%', sm: 'auto'}, minHeight: 44}}
              >
                Cancelar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
