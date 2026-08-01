'use client';

import {TextField, type SxProps, type Theme} from '@mui/material';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useOptimistic, useTransition} from 'react';

type MonthSelectorProps = {
  month: string;
  label: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
};

export function MonthSelector({
  month,
  label,
  fullWidth = false,
  sx,
}: MonthSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMonth, setSelectedMonth] = useOptimistic(month);
  const [pending, startTransition] = useTransition();

  function changeMonth(nextMonth: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(nextMonth)) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('month', nextMonth);
    params.delete('status');

    startTransition(() => {
      setSelectedMonth(nextMonth);
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <TextField
      name="month"
      label={label}
      type="month"
      value={selectedMonth}
      onChange={event => changeMonth(event.target.value)}
      disabled={pending}
      fullWidth={fullWidth}
      size="small"
      slotProps={{inputLabel: {shrink: true}}}
      sx={sx}
    />
  );
}
