import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {readLoginCredentials} from '@/lib/auth/credentials';

const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

export const {auth, handlers, signIn, signOut} = NextAuth({
  pages: {signIn: '/login'},
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  providers: [
    Credentials({
      credentials: {
        email: {label: 'Correo', type: 'email'},
        password: {label: 'Contraseña', type: 'password'},
      },
      async authorize(credentials) {
        const parsedCredentials = readLoginCredentials(credentials);
        if (!parsedCredentials) return null;

        // La importación diferida evita inicializar el pool de PostgreSQL en
        // cada ejecución de proxy; la base solo se consulta durante el login.
        const {authenticateUser} = await import('@/lib/auth/user-service');
        return authenticateUser(parsedCredentials);
      },
    }),
  ],
  callbacks: {
    jwt({token, user}) {
      if (user) {
        token.id = user.id;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    session({session, token}) {
      if (
        typeof token.id === 'string' &&
        typeof token.sessionVersion === 'number'
      ) {
        session.user.id = token.id;
        session.user.sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
});
