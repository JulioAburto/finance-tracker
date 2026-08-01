'use client';

import {
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import {useState} from 'react';
import {MonthSelector} from '@/components/ui/month-selector';
import {
  getPaymentMethodLabel,
  getVisiblePaymentMethods,
} from '@/lib/payment-methods';
import type {PaymentMethodFormOption} from '../types';

type FilterOption = {
  id: string;
  name: string;
};

type TransactionFiltersProps = {
  month: string;
  categoryId?: string;
  paymentMethodId?: string;
  categories: FilterOption[];
  paymentMethods: PaymentMethodFormOption[];
  creditCardModeEnabled: boolean;
};

type FilterFieldsProps = TransactionFiltersProps & {
  mobile?: boolean;
};

function FilterFields({
  month,
  categoryId,
  paymentMethodId,
  categories,
  paymentMethods,
  creditCardModeEnabled,
  mobile = false,
}: FilterFieldsProps) {
  const visiblePaymentMethods = getVisiblePaymentMethods(
    paymentMethods,
    creditCardModeEnabled,
    paymentMethodId,
  );

  return (
    <>
      <MonthSelector month={month} label="Mes" fullWidth={mobile} />
      <TextField
        select
        name="categoryId"
        label="Categoría"
        defaultValue={categoryId ?? ''}
        fullWidth
        size="small"
        sx={{minWidth: {md: 220}}}
      >
        <MenuItem value="">Todas</MenuItem>
        {categories.map(category => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        name="paymentMethodId"
        label="Método de pago"
        defaultValue={paymentMethodId ?? ''}
        fullWidth
        size="small"
        sx={{minWidth: {md: 220}}}
      >
        <MenuItem value="">Todos</MenuItem>
        {visiblePaymentMethods.map(method => (
          <MenuItem key={method.id} value={method.id}>
            {getPaymentMethodLabel(method)}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}

export function TransactionFilters({
  month,
  categoryId,
  paymentMethodId,
  categories,
  paymentMethods,
  creditCardModeEnabled,
}: TransactionFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const activeFilterCount =
    Number(Boolean(categoryId)) + Number(Boolean(paymentMethodId));
  const clearHref = `/transactions?month=${encodeURIComponent(month)}`;

  return (
    <>
      <Card
        component="form"
        method="get"
        sx={{display: {xs: 'none', md: 'block'}, p: 2}}
      >
        <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
          <FilterFields
            month={month}
            categoryId={categoryId}
            paymentMethodId={paymentMethodId}
            categories={categories}
            paymentMethods={paymentMethods}
            creditCardModeEnabled={creditCardModeEnabled}
          />
          <Button type="submit" variant="outlined" sx={{flexShrink: 0}}>
            Filtrar
          </Button>
          {activeFilterCount > 0 ? (
            <Button component={Link} href={clearHref} color="inherit">
              Limpiar
            </Button>
          ) : null}
        </Stack>
      </Card>

      <Card sx={{display: {xs: 'block', md: 'none'}, p: 1.5}}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{alignItems: 'center', justifyContent: 'space-between'}}
        >
          <Box sx={{minWidth: 0}}>
            <Typography variant="body2" sx={{fontWeight: 800}}>
              Mes {month}
            </Typography>
            <Typography
              color="text.secondary"
              variant="caption"
              sx={{display: 'block', overflowWrap: 'anywhere'}}
            >
              {activeFilterCount === 0
                ? 'Sin filtros adicionales'
                : `${activeFilterCount} ${
                    activeFilterCount === 1
                      ? 'filtro activo'
                      : 'filtros activos'
                  }`}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setMobileFiltersOpen(true)}
            aria-haspopup="dialog"
            sx={{flexShrink: 0}}
          >
            {activeFilterCount > 0
              ? `Filtros (${activeFilterCount})`
              : 'Filtros'}
          </Button>
        </Stack>
      </Card>

      <Drawer
        anchor="bottom"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 'calc(100dvh - env(safe-area-inset-top) - 16px)',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box
          component="form"
          method="get"
          aria-labelledby="transaction-filters-title"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Box sx={{px: 2, pt: 2, pb: 1.5}}>
            <Typography id="transaction-filters-title" variant="h6">
              Filtrar transacciones
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Ajusta el mes, la categoría o el método de pago.
            </Typography>
          </Box>
          <Divider />
          <Stack
            spacing={2}
            sx={{
              p: 2,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
            }}
          >
            <FilterFields
              month={month}
              categoryId={categoryId}
              paymentMethodId={paymentMethodId}
              categories={categories}
              paymentMethods={paymentMethods}
              creditCardModeEnabled={creditCardModeEnabled}
              mobile
            />
          </Stack>
          <Divider />
          <Stack
            direction="row"
            spacing={1}
            sx={{
              p: 2,
              pb: 'max(16px, env(safe-area-inset-bottom))',
              bgcolor: 'background.paper',
            }}
          >
            {activeFilterCount > 0 ? (
              <Button
                component={Link}
                href={clearHref}
                color="inherit"
                fullWidth
              >
                Limpiar
              </Button>
            ) : (
              <Button
                type="button"
                color="inherit"
                fullWidth
                onClick={() => setMobileFiltersOpen(false)}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="contained" fullWidth>
              Aplicar
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
