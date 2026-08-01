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

function createDatabaseClient() {
  const isProduction = process.env.NODE_ENV === 'production';

  // postgres-js administra un pool de conexiones. `prepare: false` es
  // necesario para el pooler de Supabase. En desarrollo mantenemos tres
  // conexiones para que Promise.all sea realmente paralelo y evitamos cerrar
  // el pool entre navegaciones. En serverless conservamos una conexión por
  // instancia para no multiplicar sesiones durante escalamiento horizontal.
  return postgres(connectionUrl.toString(), {
    prepare: false,
    max: isProduction ? 1 : 3,
    idle_timeout: isProduction ? 20 : 300,
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
