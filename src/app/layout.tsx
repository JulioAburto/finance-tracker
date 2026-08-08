import type {Metadata, Viewport} from 'next';
import './globals.css';
import {Providers} from './providers';
import {AppShell} from '@/components/layout/app-shell';
import {getCurrentUser} from '@/lib/auth/dal';

export const metadata: Metadata = {
  title: {
    default: 'Finance Tracker',
    template: '%s | Finance Tracker',
  },
  description: 'Control personal de gastos, presupuestos y ahorro.',
};

export const viewport: Viewport = {
  themeColor: '#F5F7F8',
  colorScheme: 'light',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="es">
      <body className="google-sans">
        <Providers>
          {user ? <AppShell>{children}</AppShell> : children}
        </Providers>
      </body>
    </html>
  );
}
