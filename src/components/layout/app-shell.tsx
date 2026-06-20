"use client";

import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transacciones" },
  { href: "/transactions/new", label: "Nuevo gasto" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Finance Tracker
          </Typography>
          {navigation.map((item) => (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              color="inherit"
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ py: 4, flexGrow: 1 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </>
  );
}
