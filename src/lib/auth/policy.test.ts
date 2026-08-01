import {
  LOGIN_LOCK_MINUTES,
  MAX_FAILED_LOGIN_ATTEMPTS,
  getNextLoginFailureState,
} from './policy';

describe('login attempt policy', () => {
  const now = new Date('2026-07-30T12:00:00.000Z');

  test('does not lock before the maximum failed attempt', () => {
    expect(
      getNextLoginFailureState(MAX_FAILED_LOGIN_ATTEMPTS - 2, now),
    ).toEqual({
      failedLoginAttempts: MAX_FAILED_LOGIN_ATTEMPTS - 1,
      lockedUntil: null,
    });
  });

  test('locks the account on the maximum failed attempt', () => {
    const result = getNextLoginFailureState(MAX_FAILED_LOGIN_ATTEMPTS - 1, now);

    expect(result.failedLoginAttempts).toBe(MAX_FAILED_LOGIN_ATTEMPTS);
    expect(result.lockedUntil).toEqual(
      new Date(now.getTime() + LOGIN_LOCK_MINUTES * 60 * 1000),
    );
  });
});
