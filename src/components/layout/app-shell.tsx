'use client';

import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import type {ReactNode} from 'react';
import {useState} from 'react';
import {logoutAction} from '@/features/auth/actions';

const navigation = [
  {href: '/dashboard', label: 'Resumen'},
  {href: '/transactions', label: 'Transacciones'},
  {href: '/recurring', label: 'Recurrentes'},
  {href: '/categories', label: 'Categorías'},
  {href: '/rules', label: 'Reglas'},
  {href: '/settings', label: 'Configuración'},
];

const shellWidthSx = {
  width: '100%',
  maxWidth: 1200,
  mx: 'auto',
  pl: {
    xs: 'calc(env(safe-area-inset-left) + 16px)',
    sm: 'calc(env(safe-area-inset-left) + 20px)',
    lg: 'calc(env(safe-area-inset-left) + 24px)',
  },
  pr: {
    xs: 'calc(env(safe-area-inset-right) + 16px)',
    sm: 'calc(env(safe-area-inset-right) + 20px)',
    lg: 'calc(env(safe-area-inset-right) + 24px)',
  },
} as const;

export function AppShell({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === '/transactions') {
      return (
        pathname === href ||
        (/^\/transactions\/[^/]+\/edit$/.test(pathname) &&
          pathname !== '/transactions/new')
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const currentSectionLabel =
    pathname === '/transactions/new'
      ? 'Agregar transacción'
      : /^\/transactions\/[^/]+\/edit$/.test(pathname)
        ? 'Editar transacción'
        : (navigation.find(item => isActive(item.href))?.label ??
          'Finance Tracker');

  const hasPageLevelAddExpenseAction =
    pathname === '/dashboard' || pathname === '/transactions';

  const showGlobalQuickAdd =
    pathname !== '/transactions/new' && !hasPageLevelAddExpenseAction;

  const showQuickAdd =
    pathname !== '/transactions/new' &&
    (pathname === '/categories' ||
      pathname === '/rules' ||
      pathname === '/settings' ||
      /^\/transactions\/[^/]+\/edit$/.test(pathname));

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  function prefetchRoute(href: string) {
    if (!isActive(href)) router.prefetch(href);
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <Box sx={shellWidthSx}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: {xs: 64, md: 72},
              gap: 1.5,
              minWidth: 0,
            }}
          >
            <Box
              component={Link}
              href="/dashboard"
              onPointerEnter={() => prefetchRoute('/dashboard')}
              onFocus={() => prefetchRoute('/dashboard')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                FT
              </Box>
              <Box sx={{minWidth: 0}}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Finance Tracker
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{
                    display: {xs: 'none', md: 'block'},
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Control financiero personal
                </Typography>
              </Box>
            </Box>

            <Box
              component="nav"
              aria-label="Navegación principal"
              sx={{
                display: {xs: 'none', lg: 'flex'},
                gap: 0.5,
                minWidth: 0,
              }}
            >
              {navigation.map(item => {
                const active = isActive(item.href);

                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    onPointerEnter={() => prefetchRoute(item.href)}
                    onFocus={() => prefetchRoute(item.href)}
                    aria-current={active ? 'page' : undefined}
                    color="inherit"
                    sx={{
                      color: active ? 'primary.dark' : 'text.secondary',
                      bgcolor: active ? 'primary.light' : 'transparent',
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {showGlobalQuickAdd ? (
              <Button
                component={Link}
                href="/transactions/new"
                variant="contained"
                sx={{display: {xs: 'none', sm: 'inline-flex'}}}
              >
                Agregar gasto
              </Button>
            ) : null}

            <form action={logoutAction}>
              <Button
                type="submit"
                color="inherit"
                sx={{display: {xs: 'none', lg: 'inline-flex'}}}
              >
                Salir
              </Button>
            </form>

            <Button
              variant="outlined"
              onClick={() => setMobileNavOpen(true)}
              sx={{
                display: {xs: 'inline-flex', lg: 'none'},
                minHeight: 44,
                flexShrink: 0,
              }}
            >
              Menú
            </Button>
          </Toolbar>

          <Box
            sx={{
              display: {xs: 'flex', lg: 'none'},
              flexDirection: {xs: 'column', sm: 'row'},
              alignItems: {sm: 'center'},
              justifyContent: 'space-between',
              gap: 1,
              pb: 1.5,
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                minWidth: 0,
                overflowWrap: 'anywhere',
              }}
            >
              {currentSectionLabel}
            </Typography>

            {showQuickAdd ? (
              <Button
                component={Link}
                href="/transactions/new"
                variant="contained"
                sx={{width: {xs: '100%', sm: 'auto'}}}
              >
                Agregar gasto
              </Button>
            ) : null}
          </Box>
        </Box>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileNavOpen}
        onClose={closeMobileNav}
        slotProps={{
          paper: {
            sx: {
              width: 'min(100%, 320px)',
              p: 2,
              pt: 'calc(env(safe-area-inset-top) + 16px)',
              pb: 'calc(env(safe-area-inset-bottom) + 16px)',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{fontWeight: 800}}>
              Navegación
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accede rápido a tus pantallas principales.
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/transactions/new"
            variant="contained"
            fullWidth
            onClick={closeMobileNav}
          >
            Agregar gasto
          </Button>

          <Divider />

          <List disablePadding sx={{display: 'grid', gap: 0.5}}>
            {navigation.map(item => {
              const active = isActive(item.href);

              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  onPointerEnter={() => prefetchRoute(item.href)}
                  onFocus={() => prefetchRoute(item.href)}
                  onClick={closeMobileNav}
                  selected={active}
                  aria-current={active ? 'page' : undefined}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: active ? 800 : 600,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.label}
                  </Typography>
                </ListItemButton>
              );
            })}
          </List>

          <Box component="form" action={logoutAction} sx={{mt: 'auto'}}>
            <Button type="submit" variant="outlined" fullWidth>
              Cerrar sesión
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          py: {xs: 3, md: 5},
          pb: {
            xs: 'calc(env(safe-area-inset-bottom) + 24px)',
            md: 'calc(env(safe-area-inset-bottom) + 40px)',
          },
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Box sx={{...shellWidthSx, minWidth: 0}}>{children}</Box>
      </Box>
    </Box>
  );
}
