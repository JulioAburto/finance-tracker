import {
  isValidNewPassword,
  normalizeEmail,
  readLoginCredentials,
} from './credentials';

describe('authentication credentials', () => {
  test('normalizes the email without changing the password', () => {
    expect(
      readLoginCredentials({
        email: '  Julio@Example.COM ',
        password: ' exact password ',
      }),
    ).toEqual({
      email: 'julio@example.com',
      password: ' exact password ',
    });
  });

  test('rejects malformed input', () => {
    expect(readLoginCredentials({email: 'invalid', password: 'secret'})).toBe(
      null,
    );
    expect(readLoginCredentials({email: 'julio@example.com'})).toBe(null);
  });

  test('requires a strong minimum length only when creating a password', () => {
    expect(isValidNewPassword('short')).toBe(false);
    expect(isValidNewPassword('a secure passphrase')).toBe(true);
    expect(normalizeEmail(' TEST@EXAMPLE.COM ')).toBe('test@example.com');
  });
});
