import {
  classifyDatabaseError,
  classifyUnhandledError,
  createStructuredLogEntry,
} from "./log-entry";

function databaseError({
  code,
  message = "Database operation failed",
}: {
  code?: string;
  message?: string;
}) {
  return Object.assign(new Error(message), {
    code,
    name: "PostgresError",
  });
}

describe("structured observability logs", () => {
  it("crea un evento con una estructura estable y duración redondeada", () => {
    const entry = createStructuredLogEntry({
      timestamp: "2026-07-28T20:00:00.000Z",
      level: "error",
      event: "database.operation.failed",
      operation: "dashboard.load",
      durationMs: 42.7,
      error: {
        code: "CONNECT_TIMEOUT",
        name: "PostgresError",
      },
      incidentId: "1f6a1869-a913-4580-a68f-92610275be65",
    });

    expect(entry).toEqual({
      timestamp: "2026-07-28T20:00:00.000Z",
      level: "error",
      event: "database.operation.failed",
      operation: "dashboard.load",
      durationMs: 43,
      error: {
        code: "CONNECT_TIMEOUT",
        name: "PostgresError",
      },
      incidentId: "1f6a1869-a913-4580-a68f-92610275be65",
    });
  });

  it.each([
    ["CONNECT_TIMEOUT", "CONNECT_TIMEOUT"],
    ["ETIMEDOUT", "CONNECT_TIMEOUT"],
    ["ECONNRESET", "ECONNRESET"],
    ["CONNECTION_CLOSED", "CONNECTION_CLOSED"],
    ["28P01", "AUTHENTICATION_FAILED"],
    ["28000", "AUTHENTICATION_FAILED"],
    ["53300", "CONNECTION_LIMIT_REACHED"],
    ["ECONNREFUSED", "CONNECTION_UNAVAILABLE"],
  ])("clasifica el código %s como %s", (code, expectedCode) => {
    expect(classifyDatabaseError(databaseError({ code }))).toEqual({
      code: expectedCode,
      name: "PostgresError",
    });
  });

  it("clasifica autenticación y límite aun cuando el driver no entrega código", () => {
    expect(
      classifyDatabaseError(
        databaseError({
          message: "password authentication failed for user postgres",
        }),
      ).code,
    ).toBe("AUTHENTICATION_FAILED");

    expect(
      classifyDatabaseError(
        databaseError({
          message: "Max client connections reached",
        }),
      ).code,
    ).toBe("CONNECTION_LIMIT_REACHED");
  });

  it("no copia mensajes, consultas, parámetros ni nombres arbitrarios al log", () => {
    const sensitiveError = {
      code: "28P01",
      name: "ComercioSecreto",
      message:
        'password authentication failed DATABASE_URL=postgres://secret "Mercado privado" amount=999',
      query: "select * from transactions where name = $1",
      parameters: ["Mercado privado"],
    };

    const serializedDetails = JSON.stringify(
      classifyDatabaseError(sensitiveError),
    );

    expect(serializedDetails).toBe(
      '{"code":"AUTHENTICATION_FAILED","name":"DatabaseError"}',
    );
    expect(serializedDetails).not.toContain("postgres://");
    expect(serializedDetails).not.toContain("Mercado privado");
    expect(serializedDetails).not.toContain("999");
  });

  it("no permite datos dinámicos dentro de event u operation", () => {
    const entry = createStructuredLogEntry({
      timestamp: "2026-07-28T20:00:00.000Z",
      level: "warn",
      event: "database operation for Mercado privado",
      operation: "dashboard.load?merchant=Mercado privado",
      durationMs: -10,
      error: { code: "SLOW_QUERY", name: "DatabaseSlowOperation" },
      incidentId: "e6014440-5d95-4a6f-a1e9-a8213843470a",
    });

    expect(entry.event).toBe("unknown.event");
    expect(entry.operation).toBe("unknown.operation");
    expect(entry.durationMs).toBe(0);
  });

  it("distingue un error de servidor genérico de un error Postgres", () => {
    expect(classifyUnhandledError(new TypeError("Render failed"))).toEqual({
      code: "UNHANDLED_SERVER_ERROR",
      name: "TypeError",
    });

    expect(
      classifyUnhandledError(databaseError({ code: "23505" })),
    ).toEqual({
      code: "DATABASE_ERROR",
      name: "PostgresError",
    });
  });
});
