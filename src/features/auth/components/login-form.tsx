'use client';

import {Alert, Box, Button, TextField} from '@mui/material';
import {useActionState} from 'react';
import {initialLoginActionState, loginAction} from '@/features/auth/actions';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginActionState,
  );

  return (
    <Box component="form" action={formAction} sx={{display: 'grid', gap: 2}}>
      <TextField
        id="email"
        name="email"
        label="Correo"
        type="email"
        autoComplete="email"
        required
        fullWidth
        disabled={isPending}
      />
      <TextField
        id="password"
        name="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        fullWidth
        disabled={isPending}
      />

      {state.status === 'error' ? (
        <Alert severity="error">{state.message}</Alert>
      ) : null}

      <Button type="submit" variant="contained" disabled={isPending}>
        {isPending ? 'Verificando…' : 'Iniciar sesión'}
      </Button>
    </Box>
  );
}
