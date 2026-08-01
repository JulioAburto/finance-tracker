import {drizzle} from 'drizzle-orm/postgres-js';
import postgres, {type Sql} from 'postgres';
import * as schema from './schema';

// DATABASE_URL solo se lee en el servidor. Nunca debe usar el prefijo
// NEXT_PUBLIC_, porque eso expondría las credenciales al navegador.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const connectionUrl = new URL(databaseUrl);
connectionUrl.searchParams.set('sslmode', 'require');

declare global {
  var __financeTrackerDbClient: Sql | undefined;
}

const MAX_CONNECTIONS_PER_INSTANCE = 4;
const IDLE_TIMEOUT_SECONDS = 300;

function createDatabaseClient() {
  // postgres-js administra un pool de conexiones. `prepare: false` es
  // necesario para el transaction pooler de Supabase. Cuatro conexiones
  // permiten ejecutar en paralelo los grupos de consultas más grandes de la
  // aplicación. El timeout conserva conexiones TLS durante una sesión de uso
  // normal y evita pagar una reconexión en cada navegación.
  return postgres(connectionUrl.toString(), {
    prepare: false,
    max: MAX_CONNECTIONS_PER_INSTANCE,
    idle_timeout: IDLE_TIMEOUT_SECONDS,
    connect_timeout: 10,
  });
}

export const databaseClient =
  globalThis.__financeTrackerDbClient ?? createDatabaseClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__financeTrackerDbClient = databaseClient;
}

// Drizzle agrega tipado TypeScript sobre postgres-js usando las tablas
// declaradas en schema.ts. Esta instancia solo debe importarse desde código
// ejecutado en el servidor.
export const db = drizzle(databaseClient, {schema});
