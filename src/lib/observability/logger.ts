import "server-only";

import {
  createStructuredLogEntry,
  type LogLevel,
  type SafeErrorDetails,
} from "./log-entry";

const incidentByError = new WeakMap<object, string>();

export function createIncidentId(): string {
  return crypto.randomUUID();
}

export function getOrCreateIncidentId(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return createIncidentId();
  }

  const existingIncidentId = incidentByError.get(error);
  if (existingIncidentId) return existingIncidentId;

  const incidentId = createIncidentId();
  incidentByError.set(error, incidentId);
  return incidentId;
}

export function logStructuredEvent(input: {
  level: LogLevel;
  event: string;
  operation: string;
  durationMs: number;
  error: SafeErrorDetails;
  incidentId: string;
}): void {
  const entry = createStructuredLogEntry({
    ...input,
    timestamp: new Date().toISOString(),
  });
  const serializedEntry = JSON.stringify(entry);

  if (entry.level === "error") {
    console.error(serializedEntry);
    return;
  }

  if (entry.level === "warn") {
    console.warn(serializedEntry);
    return;
  }

  console.info(serializedEntry);
}
