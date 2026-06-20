# Finance Tracker

Aplicación personal para registrar transacciones, conservar su tasa de cambio histórica y comparar los gastos mensuales contra presupuestos por categoría.

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

El alcance y estado detallados están en [docs/MVP.md](./docs/MVP.md).

## Stack

- Next.js App Router y TypeScript.
- React y MUI.
- Supabase Postgres.
- Drizzle ORM y `postgres`.
- Jest.
- pnpm.

## Inicio rápido

1. Instala las dependencias:

   ```powershell
   pnpm install
   ```

2. Copia `.env.example` como `.env.local` y reemplaza los placeholders:

   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:6543/postgres"
   ```

3. Prepara la base:

   ```powershell
   pnpm db:migrate
   pnpm db:seed
   ```

4. Inicia la aplicación:

   ```powershell
   pnpm dev
   ```

Para requisitos, HTTPS local, scripts y solución de problemas, consulta [docs/SETUP_NOTES.md](./docs/SETUP_NOTES.md).

## Rutas disponibles

| Ruta | Función |
| --- | --- |
| `/dashboard` | Resumen mensual, presupuesto y alertas |
| `/transactions` | Listado y filtros |
| `/transactions/new` | Registro de transacciones |
| `/transactions/[id]/edit` | Edición de una transacción |

La ruta `/` redirige a `/dashboard`.

## Reglas financieras esenciales

- Una categoría indica en qué se gastó el dinero.
- Un método de pago indica cómo se pagó.
- Una compra con tarjeta de crédito es un gasto.
- El pago de la tarjeta es una transferencia, no un segundo gasto.
- Cada transacción conserva monto original, moneda, tasa, USD y NIO.
- Solo los gastos consumen presupuesto.
- El ahorro no se cuenta como gasto normal.
- Las reglas de comercios se evalúan antes que cualquier IA opcional.

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
