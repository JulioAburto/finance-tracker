'use client';

import {Button, type ButtonProps} from '@mui/material';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {deleteTransactionAction} from '../actions';

export function DeleteTransactionButton({
  transactionId,
  fullWidth = false,
  size = 'small',
}: {
  transactionId: string;
  fullWidth?: boolean;
  size?: ButtonProps['size'];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm('¿Eliminar esta transacción permanentemente?')) return;

    startTransition(async () => {
      await deleteTransactionAction(transactionId);
      router.refresh();
    });
  }

  return (
    <Button
      color="error"
      size={size}
      onClick={handleDelete}
      disabled={pending}
      fullWidth={fullWidth}
    >
      {pending ? 'Eliminando...' : 'Eliminar'}
    </Button>
  );
}
