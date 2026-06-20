"use client";

import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/transactions", label: "Transacciones" },
  { href: "/categories", label: "Categorías" },
  { href: "/rules", label: "Reglas" },
  { href: "/settings", label: "Configuración" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/transactions") {
      return (
        pathname === href ||
        (/^\/transactions\/[^/]+\/edit$/.test(pathname) &&
          pathname !== "/transactions/new")
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
            <Box
              component={Link}
              href="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                flexGrow: 1,
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                FT
              </Box>
              <div>
                <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>
                  Finance Tracker
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  Control financiero personal
                </Typography>
              </div>
            </Box>

            <Box
              component="nav"
              aria-label="Navegación principal"
              sx={{ display: { xs: "none", lg: "flex" }, gap: 0.25 }}
            >
              {navigation.map((item) => {
                const active = isActive(item.href);

                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    color="inherit"
                    sx={{
                      color: active ? "primary.dark" : "text.secondary",
                      bgcolor: active ? "primary.light" : "transparent",
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            <Button
              component={Link}
              href="/transactions/new"
              variant="contained"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Agregar gasto
            </Button>
          </Toolbar>

          <Box
            component="nav"
            aria-label="Navegación principal móvil"
            sx={{
              display: { xs: "flex", lg: "none" },
              overflowX: "auto",
              pb: 1.25,
              gap: 0.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Button
              component={Link}
              href="/transactions/new"
              variant="contained"
              size="small"
              sx={{ display: { sm: "none" }, flexShrink: 0 }}
            >
              Agregar gasto
            </Button>
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  size="small"
                  sx={{
                    flexShrink: 0,
                    color: active ? "primary.dark" : "text.secondary",
                    bgcolor: active ? "primary.light" : "transparent",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Container>
      </AppBar>
      <Box component="main" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </>
  );
}
