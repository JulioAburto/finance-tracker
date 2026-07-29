export type LogLevel = 'info' | 'warn' | 'error';

export type SafeErrorDetails = {
  code: string;
  name: string;
};

export type StructuredLogEntry = {
  timestamp: string;
  level: LogLevel;
  event: string;
  operation: string;
  durationMs: number;
  error: SafeErrorDetails;
  incidentId: string;
};

export const SLOW_DATABASE_OPERATION_MS = 1_500;

const SAFE_ERROR_NAMES = new Set([
  'AggregateError',
  'Error',
  'PostgresError',
  'TypeError',
]);

const DIRECT_DATABASE_CODES = new Set([
  'CONNECT_TIMEOUT',
  'CONNECTION_CLOSED',
  'CONNECTION_DESTROYED',
  'CONNECTION_ENDED',
  'ECONNRESET',
]);

const UNAVAILABLE_DATABASE_CODES = new Set([
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ENETUNREACH',
  'ENOTFOUND',
]);

type UnknownErrorRecord = {
  code?: unknown;
  message?: unknown;
  name?: unknown;
};

function asErrorRecord(error: unknown): UnknownErrorRecord {
  return typeof error === 'object' && error !== null
    ? (error as UnknownErrorRecord)
    : {};
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getSafeErrorName(error: unknown, fallback: string): string {
  const name = readString(asErrorRecord(error).name);
  return SAFE_ERROR_NAMES.has(name) ? name : fallback;
}

function normalizeLogToken(value: string, fallback: string): string {
  const normalized = value.trim();
  return /^[a-zA-Z0-9._:/()[\]-]{1,160}$/.test(normalized)
    ? normalized
    : fallback;
}

export function classifyDatabaseError(error: unknown): SafeErrorDetails {
  const record = asErrorRecord(error);
  const originalCode = readString(record.code).toUpperCase();
  const message = readString(record.message).toLowerCase();
  const name = getSafeErrorName(error, 'DatabaseError');

  if (DIRECT_DATABASE_CODES.has(originalCode)) {
    return {code: originalCode, name};
  }

  if (originalCode === 'ETIMEDOUT') {
    return {code: 'CONNECT_TIMEOUT', name};
  }

  if (UNAVAILABLE_DATABASE_CODES.has(originalCode)) {
    return {code: 'CONNECTION_UNAVAILABLE', name};
  }

  if (
    originalCode === '28P01' ||
    originalCode === '28000' ||
    /authentication failed|password authentication failed|sasl/.test(message)
  ) {
    return {code: 'AUTHENTICATION_FAILED', name};
  }

  if (
    originalCode === '53300' ||
    /max client connections|too many connections|remaining connection slots/.test(
      message,
    )
  ) {
    return {code: 'CONNECTION_LIMIT_REACHED', name};
  }

  if (/connection (?:was )?closed|socket hang up/.test(message)) {
    return {code: 'CONNECTION_CLOSED', name};
  }

  return {code: 'DATABASE_ERROR', name};
}

export function classifyUnhandledError(error: unknown): SafeErrorDetails {
  const databaseError = classifyDatabaseError(error);
  const record = asErrorRecord(error);
  const originalCode = readString(record.code);
  const originalName = readString(record.name);

  if (
    databaseError.code !== 'DATABASE_ERROR' ||
    originalName === 'PostgresError' ||
    /^\d{5}$/.test(originalCode)
  ) {
    return databaseError;
  }

  return {
    code: 'UNHANDLED_SERVER_ERROR',
    name: getSafeErrorName(error, 'Error'),
  };
}

export function createStructuredLogEntry(input: {
  timestamp: string;
  level: LogLevel;
  event: string;
  operation: string;
  durationMs: number;
  error: SafeErrorDetails;
  incidentId: string;
}): StructuredLogEntry {
  return {
    timestamp: input.timestamp,
    level: input.level,
    event: normalizeLogToken(input.event, 'unknown.event'),
    operation: normalizeLogToken(input.operation, 'unknown.operation'),
    durationMs: Math.max(0, Math.round(input.durationMs)),
    error: {
      code: normalizeLogToken(input.error.code, 'UNKNOWN_ERROR'),
      name: normalizeLogToken(input.error.name, 'Error'),
    },
    incidentId: input.incidentId,
  };
}
