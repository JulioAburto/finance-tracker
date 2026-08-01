'use server';

import {AuthError} from 'next-auth';
import {signIn, signOut} from '@/auth';
import {readLoginCredentials} from '@/lib/auth/credentials';

export type LoginActionState = {
  status: 'idle' | 'error';
  message?: string;
};

export const initialLoginActionState: LoginActionState = {status: 'idle'};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const credentials = readLoginCredentials({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!credentials) {
    return {
      status: 'error',
      message: 'Ingresa un correo y una contraseña válidos.',
    };
  }

  try {
    await signIn('credentials', {
      ...credentials,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: 'error',
        message: 'Correo o contraseña incorrectos.',
      };
    }
    throw error;
  }

  return initialLoginActionState;
}

export async function logoutAction(): Promise<void> {
  await signOut({redirectTo: '/login'});
}
