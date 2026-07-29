import type { Instrumentation } from "next";
import { classifyUnhandledError } from "@/lib/observability/log-entry";
import {
  getOrCreateIncidentId,
  logStructuredEvent,
} from "@/lib/observability/logger";

export const onRequestError: Instrumentation.onRequestError = (
  error,
  _request,
  context,
) => {
  logStructuredEvent({
    level: "error",
    event: "server.request.failed",
    operation: `next.${context.routeType}:${context.routePath}`,
    durationMs: 0,
    error: classifyUnhandledError(error),
    incidentId: getOrCreateIncidentId(error),
  });
};
