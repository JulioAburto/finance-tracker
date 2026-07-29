'use client';

import {Button} from '@mui/material';
import {useFormStatus} from 'react-dom';

export function SubmitButton({
  label,
  fullWidth = false,
}: {
  label: string;
  fullWidth?: boolean;
}) {
  const {pending} = useFormStatus();

  return (
    <Button
      type="submit"
      variant="contained"
      disabled={pending}
      fullWidth={fullWidth}
      sx={{width: fullWidth ? '100%' : {xs: '100%', sm: 'auto'}}}
    >
      {pending ? 'Guardando...' : label}
    </Button>
  );
}
