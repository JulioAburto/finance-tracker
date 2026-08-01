const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

export type LoginCredentials = {
  email: string;
  password: string;
};

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);

  return (
    email.length > 0 &&
    email.length <= MAX_EMAIL_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

export function isValidNewPassword(value: string): boolean {
  return (
    value.length >= MIN_PASSWORD_LENGTH && value.length <= MAX_PASSWORD_LENGTH
  );
}

export function readLoginCredentials(
  input: Partial<Record<string, unknown>>,
): LoginCredentials | null {
  const emailValue = input.email;
  const passwordValue = input.password;

  if (typeof emailValue !== 'string' || typeof passwordValue !== 'string') {
    return null;
  }

  const email = normalizeEmail(emailValue);
  if (
    !isValidEmail(email) ||
    passwordValue.length === 0 ||
    passwordValue.length > MAX_PASSWORD_LENGTH
  ) {
    return null;
  }

  return {email, password: passwordValue};
}
