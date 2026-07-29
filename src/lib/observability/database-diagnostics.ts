import 'server-only';

import {classifyDatabaseError, SLOW_DATABASE_OPERATION_MS} from './log-entry';
import {
  createIncidentId,
  getOrCreateIncidentId,
  logStructuredEvent,
} from './logger';

type DatabaseDiagnosticsOptions = {
  incidentId?: string;
  slowThresholdMs?: number;
};

export async function withDatabaseDiagnostics<T>(
  operation: string,
  execute: () => PromiseLike<T>,
  options: DatabaseDiagnosticsOptions = {},
): Promise<T> {
  const startedAt = performance.now();
  const slowThresholdMs = options.slowThresholdMs ?? SLOW_DATABASE_OPERATION_MS;

  try {
    const result = await execute();
    const durationMs = performance.now() - startedAt;

    if (durationMs >= slowThresholdMs) {
      logStructuredEvent({
        level: 'warn',
        event: 'database.operation.slow',
        operation,
        durationMs,
        error: {
          code: 'SLOW_QUERY',
          name: 'DatabaseSlowOperation',
        },
        incidentId: options.incidentId ?? createIncidentId(),
      });
    }

    return result;
  } catch (error) {
    logStructuredEvent({
      level: 'error',
      event: 'database.operation.failed',
      operation,
      durationMs: performance.now() - startedAt,
      error: classifyDatabaseError(error),
      incidentId: options.incidentId ?? getOrCreateIncidentId(error),
    });
    throw error;
  }
}
