"use client";

import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/transactions", label: "Transacciones" },
  { href: "/transactions/new", label: "Agregar" },
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
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            component={Link}
            href="/dashboard"
            variant="h6"
            sx={{ flexGrow: 1, whiteSpace: "nowrap" }}
          >
            Finance Tracker
          </Typography>
          <Box
            component="nav"
            aria-label="Navegación principal"
            sx={{
              display: { xs: "none", lg: "flex" },
              gap: 0.5,
            }}
          >
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color="inherit"
                  aria-current={active ? "page" : undefined}
                  sx={{
                    bgcolor: active ? "action.selected" : "transparent",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
        <Box
          component="nav"
          aria-label="Navegación principal móvil"
          sx={{
            display: { xs: "flex", lg: "none" },
            overflowX: "auto",
            px: 1,
            pb: 1,
            gap: 0.5,
          }}
        >
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                color="inherit"
                aria-current={active ? "page" : undefined}
                size="small"
                sx={{
                  flexShrink: 0,
                  bgcolor: active ? "action.selected" : "transparent",
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </AppBar>
      <Box component="main" sx={{ py: { xs: 3, md: 4 }, flexGrow: 1 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </>
  );
}
