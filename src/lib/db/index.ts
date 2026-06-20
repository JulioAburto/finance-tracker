import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL solo se lee en el servidor. Nunca debe usar el prefijo
// NEXT_PUBLIC_, porque eso expondría las credenciales al navegador.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const connectionUrl = new URL(databaseUrl);
connectionUrl.searchParams.set("sslmode", "require");

// postgres-js administra un pool de conexiones. `prepare: false` es necesario
// para el transaction pooler de Supabase, que no garantiza una misma conexión
// física entre consultas.
export const databaseClient = postgres(connectionUrl.toString(), {
  prepare: false,
});

// Drizzle agrega tipado TypeScript sobre postgres-js usando las tablas
// declaradas en schema.ts. Esta instancia solo debe importarse desde código
// ejecutado en el servidor.
export const db = drizzle(databaseClient, { schema });
