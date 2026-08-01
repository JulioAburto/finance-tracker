import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';

const ALGORITHM = 'scrypt';
const COST = 65_536;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MAX_MEMORY = 128 * 1024 * 1024;

type PasswordHashParts = {
  salt: Buffer;
  expectedHash: Buffer;
};

const dummyHashParts: PasswordHashParts = {
  salt: Buffer.alloc(SALT_LENGTH),
  expectedHash: Buffer.alloc(KEY_LENGTH),
};

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      KEY_LENGTH,
      {
        cost: COST,
        blockSize: BLOCK_SIZE,
        parallelization: PARALLELIZATION,
        maxmem: MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

function parsePasswordHash(
  encodedHash: string | null,
): PasswordHashParts | null {
  if (!encodedHash) return null;

  const [algorithm, cost, blockSize, parallelization, saltHex, hashHex] =
    encodedHash.split('$');

  if (
    algorithm !== ALGORITHM ||
    Number(cost) !== COST ||
    Number(blockSize) !== BLOCK_SIZE ||
    Number(parallelization) !== PARALLELIZATION ||
    !/^[a-f0-9]+$/i.test(saltHex ?? '') ||
    !/^[a-f0-9]+$/i.test(hashHex ?? '')
  ) {
    return null;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const expectedHash = Buffer.from(hashHex, 'hex');
  if (salt.length !== SALT_LENGTH || expectedHash.length !== KEY_LENGTH) {
    return null;
  }

  return {salt, expectedHash};
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await derivePassword(password, salt);

  return [
    ALGORITHM,
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString('hex'),
    hash.toString('hex'),
  ].join('$');
}

export async function verifyPassword(
  password: string,
  encodedHash: string | null,
): Promise<boolean> {
  const parsedHash = parsePasswordHash(encodedHash);
  const parts = parsedHash ?? dummyHashParts;
  const actualHash = await derivePassword(password, parts.salt);
  const matches = timingSafeEqual(actualHash, parts.expectedHash);

  return parsedHash !== null && matches;
}
