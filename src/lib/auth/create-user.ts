import {eq, sql} from 'drizzle-orm';
import {db, databaseClient} from '@/lib/db';
import {appUsers} from '@/lib/db/schema';
import {isValidEmail, isValidNewPassword, normalizeEmail} from './credentials';
import {hashPassword} from './password';

const email = normalizeEmail(process.env.AUTH_USER_EMAIL ?? '');
const name = (process.env.AUTH_USER_NAME ?? '').trim();
const password = process.env.AUTH_USER_PASSWORD ?? '';

async function createOrReplaceSingleUser() {
  if (!isValidEmail(email)) {
    throw new Error('AUTH_USER_EMAIL must contain a valid email address.');
  }

  if (!name || name.length > 120) {
    throw new Error(
      'AUTH_USER_NAME must contain between 1 and 120 characters.',
    );
  }

  if (!isValidNewPassword(password)) {
    throw new Error(
      'AUTH_USER_PASSWORD must contain between 12 and 128 characters.',
    );
  }

  const existingUsers = await db
    .select({id: appUsers.id, email: appUsers.email})
    .from(appUsers)
    .limit(2);
  const sameUser = existingUsers.find(user => user.email === email);

  if (existingUsers.length > 0 && !sameUser) {
    throw new Error(
      'Single-user mode already has a different account. No user was created.',
    );
  }

  const passwordHash = await hashPassword(password);
  const now = new Date();

  if (sameUser) {
    await db
      .update(appUsers)
      .set({
        name,
        passwordHash,
        isActive: true,
        sessionVersion: sql`${appUsers.sessionVersion} + 1`,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: now,
      })
      .where(eq(appUsers.id, sameUser.id));
    return 'User credentials updated.';
  }

  await db.insert(appUsers).values({email, name, passwordHash});
  return 'Single application user created.';
}

async function main() {
  try {
    const result = await createOrReplaceSingleUser();
    console.log(result);
  } finally {
    await databaseClient.end();
  }
}

void main().catch(error => {
  console.error(
    error instanceof Error ? error.message : 'Unable to create the user.',
  );
  process.exitCode = 1;
});
