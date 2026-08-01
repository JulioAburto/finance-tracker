import {hashPassword, verifyPassword} from './password';

jest.setTimeout(30_000);

describe('password hashing', () => {
  test('stores a salted hash and verifies only the original password', async () => {
    const password = 'a long and unique test passphrase';
    const encodedHash = await hashPassword(password);

    expect(encodedHash).toMatch(/^scrypt\$/);
    expect(encodedHash).not.toContain(password);
    await expect(verifyPassword(password, encodedHash)).resolves.toBe(true);
    await expect(verifyPassword('wrong password', encodedHash)).resolves.toBe(
      false,
    );
  });

  test('rejects missing and malformed hashes', async () => {
    await expect(verifyPassword('password', null)).resolves.toBe(false);
    await expect(verifyPassword('password', 'invalid')).resolves.toBe(false);
  });
});
