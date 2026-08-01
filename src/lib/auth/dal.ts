import {eq} from 'drizzle-orm';
import {redirect} from 'next/navigation';
import {cache} from 'react';
import {auth} from '@/auth';
import {db} from '@/lib/db';
import {appUsers} from '@/lib/db/schema';

export const getCurrentUser = cache(async () => {
  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser?.id || !Number.isInteger(sessionUser.sessionVersion)) {
    return null;
  }

  const rows = await db
    .select({
      id: appUsers.id,
      email: appUsers.email,
      name: appUsers.name,
      isActive: appUsers.isActive,
      sessionVersion: appUsers.sessionVersion,
    })
    .from(appUsers)
    .where(eq(appUsers.id, sessionUser.id))
    .limit(1);
  const user = rows[0] ?? null;

  if (!user?.isActive || user.sessionVersion !== sessionUser.sessionVersion) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
