# Finance Tracker

Aplicación personal para registrar gastos, convertir montos entre USD y NIO y comparar el consumo mensual contra presupuestos por categoría.

## Estado actual

Implementado:

- Conexión con Supabase Postgres mediante Drizzle ORM.
- Migración y seed inicial.
- Conversión USD/NIO con tasa histórica por transacción.
- Creación, listado, filtrado, edición y eliminación de transacciones.
- Dashboard mensual con uso por categoría, alertas y gastos sin categoría.
- Pruebas unitarias con Jest.

Pendiente dentro del MVP:

- Gestión de categorías y presupuestos.
- Gestión de reglas de comercios.
- Configuración editable desde la interfaz.

Consulta el alcance completo en [docs/MVP.md](./docs/MVP.md).

## Stack

- Next.js App Router y TypeScript.
- React y MUI.
- Supabase Postgres.
- Drizzle ORM y `postgres`.
- Jest.
- pnpm.

## Requisitos

- Node.js compatible con Next.js 16.
- pnpm.
- Proyecto de Supabase con una base Postgres.
- `DATABASE_URL` del transaction pooler de Supabase.

## Configuración local

1. Instala las dependencias:

   ```powershell
   pnpm install
   ```

2. Copia `.env.example` como `.env.local` y reemplaza los placeholders:

   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:6543/postgres"
   ```

3. Aplica la migración y carga los datos iniciales:

   ```powershell
   pnpm db:migrate
   pnpm db:seed
   ```

4. Inicia el servidor:

   ```powershell
   pnpm dev
   ```

   También puedes usar HTTPS local:

   ```powershell
   pnpm run dev:https
   ```

El certificado HTTPS es autofirmado. El navegador puede solicitar confirmación la primera vez.

## Rutas disponibles

| Ruta | Función |
| --- | --- |
| `/dashboard` | Resumen mensual, presupuesto y alertas |
| `/transactions` | Listado y filtros |
| `/transactions/new` | Registro de transacciones |
| `/transactions/[id]/edit` | Edición de una transacción |

La ruta `/` redirige a `/dashboard`.

## Comandos

| Comando | Propósito |
| --- | --- |
| `pnpm dev` | Desarrollo local con Turbopack |
| `pnpm run dev:https` | Desarrollo HTTPS con Webpack |
| `pnpm test` | Pruebas unitarias |
| `pnpm lint` | ESLint |
| `pnpm build` | Build y validación de TypeScript |
| `pnpm db:generate` | Generar migraciones desde el esquema |
| `pnpm db:migrate` | Aplicar migraciones pendientes |
| `pnpm db:seed` | Insertar o sincronizar datos iniciales |
| `pnpm db:studio` | Abrir Drizzle Studio |

## Reglas financieras esenciales

- Una categoría indica en qué se gastó el dinero.
- Un método de pago indica cómo se pagó.
- Una compra con tarjeta de crédito es un gasto.
- El pago de la tarjeta es una transferencia, no un segundo gasto.
- Cada transacción conserva su monto, moneda y tipo de cambio originales.
- El ahorro no se cuenta como gasto normal.

## Documentación

- [Alcance del MVP](./docs/MVP.md)
- [Esquema de base de datos](./docs/DATABASE_SCHEMA.md)
- [Configuración y comandos](./docs/SETUP_NOTES.md)
- [Contexto y decisiones vigentes](./docs/PROJECT_CONTEXT.md)
- [Instrucciones para agentes](./AGENTS.md)

## Seguridad

No confirmes ni publiques:

- `.env.local`
- `DATABASE_URL`
- Contraseñas de Supabase
- API keys, JWT secrets o service-role keys

La aplicación no tiene autenticación. Antes de desplegarla públicamente, habilita al menos Vercel Deployment Protection u otra protección aprobada.
