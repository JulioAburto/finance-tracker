# Configuración local

> Instalación, conexión con Supabase y comandos operativos.

## Stack

```txt
Next.js App Router
TypeScript
MUI
Supabase Postgres
Drizzle ORM
Jest
pnpm
```

Las decisiones de producto están en [`MVP.md`](./MVP.md) y el esquema en [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

## Requisitos

- Node.js compatible con Next.js 16.
- pnpm.
- Proyecto de Supabase.
- Cadena de conexión del transaction pooler.

## Instalar dependencias

```powershell
pnpm install
```

No agregues dependencias de producción sin comprobar primero si el proyecto ya resuelve la necesidad.

## Variables de entorno

Crea `.env.local` a partir de `.env.example`:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:6543/postgres"
```

Requisitos de la URL:

- Protocolo `postgresql://` o `postgres://`.
- Usuario del pooler de Supabase.
- Puerto `6543`.
- Base `/postgres`.
- Contraseña codificada como URL si contiene caracteres especiales.

Reglas:

- No confirmes `.env.local` en Git.
- No uses el prefijo `NEXT_PUBLIC_`.
- No imprimas la URL completa en logs.
- Usa valores distintos por entorno.

## Conexión a la base

`src/lib/db/index.ts`:

- Valida que exista `DATABASE_URL`.
- Añade `sslmode=require`.
- Crea el cliente `postgres`.
- Usa `prepare: false` para el transaction pooler.
- Expone la instancia tipada de Drizzle.

`drizzle.config.ts`:

- Carga `.env.local`.
- Usa `src/lib/db/schema.ts`.
- Escribe migraciones en `drizzle/`.
- Fuerza conexión TLS.

Toda importación del cliente debe permanecer en código de servidor.

## Preparar la base de datos

La migración inicial ya está generada. En una base nueva:

```powershell
pnpm db:migrate
pnpm db:seed
```

El seed es idempotente: usa upserts para evitar duplicar registros principales.

Cuando cambie deliberadamente `src/lib/db/schema.ts`:

```powershell
pnpm db:generate
pnpm db:migrate
```

Revisa siempre el SQL generado antes de aplicarlo. No uses `db:push` sobre una base con datos importantes sin evaluar el cambio.

## Ejecutar la aplicación

Desarrollo HTTP con Turbopack:

```powershell
pnpm dev
```

Desarrollo HTTPS con certificado autofirmado:

```powershell
pnpm run dev:https
```

El script HTTPS usa Webpack:

```txt
next dev --webpack --experimental-https
```

Esto evita un error de React Client Manifest observado con Turbopack y HTTPS en Windows. El navegador puede mostrar una advertencia por el certificado local.

## Validación

Ejecuta primero la validación más específica y después la general:

```powershell
pnpm test
pnpm lint
pnpm build
```

`pnpm build` valida compilación y TypeScript. El proyecto no usa un script separado de `typecheck`.

## Scripts disponibles

| Script | Función |
| --- | --- |
| `pnpm dev` | Servidor HTTP de desarrollo |
| `pnpm run dev:https` | Servidor HTTPS de desarrollo |
| `pnpm test` | Jest |
| `pnpm test:watch` | Jest en modo watch |
| `pnpm lint` | ESLint |
| `pnpm build` | Build de producción |
| `pnpm start` | Ejecutar el build |
| `pnpm db:generate` | Generar migraciones |
| `pnpm db:migrate` | Aplicar migraciones |
| `pnpm db:push` | Sincronización directa; usar con cautela |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm db:seed` | Cargar datos iniciales |

## Archivos principales

```txt
drizzle.config.ts
drizzle/
src/lib/db/index.ts
src/lib/db/schema.ts
src/lib/db/seed.ts
src/lib/money/
src/lib/budget/
src/features/transactions/
src/features/dashboard/
```

## PowerShell

PowerShell usa el acento grave para continuar una línea, no `\`:

```powershell
pnpm create next-app@latest finance-tracker `
  --ts `
  --eslint `
  --app `
  --src-dir `
  --import-alias "@/*" `
  --no-tailwind `
  --use-pnpm
```

El acento grave debe ser el último carácter de la línea.

## Problemas comunes

### `password authentication failed`

- Vuelve a copiar la cadena desde Supabase.
- Comprueba usuario, contraseña, host y puerto.
- Codifica caracteres especiales de la contraseña.
- Confirma que no haya comillas adicionales dentro del valor.

### `spawn EPERM`

Windows o el sandbox puede bloquear procesos auxiliares de Next, `tsx` o `esbuild`. Ejecuta el comando desde una terminal normal o concede únicamente el permiso necesario.

### Puerto ocupado

Detén el servidor anterior antes de iniciar otro. Next solo permite un servidor de desarrollo activo por directorio debido al lock de `.next/dev`.

### Presupuesto vacío en el dashboard

El seed inicial crea julio de 2026. Selecciona `2026-07` o crea el presupuesto del mes correspondiente cuando exista la interfaz de gestión.

## Seguridad antes de desplegar

La aplicación aún no tiene autenticación. Antes de publicar:

- Habilita Vercel Deployment Protection, o
- Implementa una protección aprobada explícitamente.

No agregues autenticación, multiusuario ni Row Level Security como cambio incidental.
