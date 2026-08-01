export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCK_MINUTES = 15;

export type LoginFailureState = {
  failedLoginAttempts: number;
  lockedUntil: Date | null;
};

export function getNextLoginFailureState(
  currentFailedAttempts: number,
  now: Date,
): LoginFailureState {
  const failedLoginAttempts = currentFailedAttempts + 1;
  const lockedUntil =
    failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS
      ? new Date(now.getTime() + LOGIN_LOCK_MINUTES * 60 * 1000)
      : null;

  return {failedLoginAttempts, lockedUntil};
}
