import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {appUsers} from '@/lib/db/schema';
import {withDatabaseDiagnostics} from '@/lib/observability/database-diagnostics';
import type {LoginCredentials} from './credentials';
import {verifyPassword} from './password';
import {getNextLoginFailureState} from './policy';

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  sessionVersion: number;
};

export async function authenticateUser(
  credentials: LoginCredentials,
): Promise<AuthenticatedUser | null> {
  return withDatabaseDiagnostics('auth.credentials.verify', async () => {
    const rows = await db
      .select({
        id: appUsers.id,
        email: appUsers.email,
        name: appUsers.name,
        passwordHash: appUsers.passwordHash,
        isActive: appUsers.isActive,
        sessionVersion: appUsers.sessionVersion,
        failedLoginAttempts: appUsers.failedLoginAttempts,
        lockedUntil: appUsers.lockedUntil,
      })
      .from(appUsers)
      .where(eq(appUsers.email, credentials.email))
      .limit(1);
    const user = rows[0] ?? null;

    // También ejecutamos scrypt cuando el correo no existe para reducir la
    // diferencia temporal que permitiría enumerar cuentas.
    const passwordMatches = await verifyPassword(
      credentials.password,
      user?.passwordHash ?? null,
    );
    const now = new Date();
    const isLocked = user?.lockedUntil
      ? user.lockedUntil.getTime() > now.getTime()
      : false;

    if (!user || !passwordMatches || !user.isActive || isLocked) {
      if (user && !passwordMatches && !isLocked) {
        const nextFailure = getNextLoginFailureState(
          user.failedLoginAttempts,
          now,
        );
        await db
          .update(appUsers)
          .set({...nextFailure, updatedAt: now})
          .where(eq(appUsers.id, user.id));
      }

      return null;
    }

    await db
      .update(appUsers)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
        updatedAt: now,
      })
      .where(eq(appUsers.id, user.id));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      sessionVersion: user.sessionVersion,
    };
  });
}
