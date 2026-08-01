import {Box, Card, CardContent, Typography} from '@mui/material';
import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {auth} from '@/auth';
import {LoginForm} from '@/features/auth/components/login-form';

export const metadata: Metadata = {title: 'Iniciar sesión'};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{width: '100%', maxWidth: 440}}>
        <CardContent sx={{p: {xs: 3, sm: 4}, display: 'grid', gap: 3}}>
          <Box>
            <Typography variant="h4" component="h1" sx={{fontWeight: 800}}>
              Finance Tracker
            </Typography>
            <Typography color="text.secondary" sx={{mt: 1}}>
              Inicia sesión para acceder a tus datos financieros.
            </Typography>
          </Box>

          <LoginForm />
        </CardContent>
      </Card>
    </Box>
  );
}
