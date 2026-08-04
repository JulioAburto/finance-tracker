# Configuración local

> Instalación, conexión con Supabase y comandos operativos.

## Stack

```txt
Next.js App Router
TypeScript
MUI
Supabase Postgres
Drizzle ORM
Auth.js
Jest
pnpm
```

Las decisiones de producto están en [`MVP.md`](./MVP.md) y el esquema en [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

## Requisitos

- Node.js compatible con Next.js 16.
- pnpm.
- Proyecto de Supabase.
- Cadena de conexión del transaction pooler.
- Herramientas cliente de PostgreSQL (`pg_dump` y `pg_restore`) o Docker
  Desktop en ejecución para cambios de producción.

## Instalar dependencias

```powershell
pnpm install
```

No agregues dependencias de producción sin comprobar primero si el proyecto ya resuelve la necesidad.

## Variables de entorno

Crea `.env.local` a partir de `.env.example`:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:6543/postgres"
# DATABASE_BACKUP_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[SESSION_POOLER_HOST]:5432/postgres"
AUTH_SECRET="[RANDOM_SECRET_WITH_AT_LEAST_32_CHARACTERS]"
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

`DATABASE_BACKUP_URL` es opcional para el funcionamiento de la aplicación y
solo se usa en tareas administrativas. Debe apuntar al mismo proyecto y base de
datos que `DATABASE_URL`, mediante conexión directa o session pooler en el
puerto `5432`. El script seguro puede derivarla de un transaction pooler de
Supabase válido; nunca imprime la URL ni la contraseña.

## Cambios seguros en la base de datos de producción

Todo cambio de datos o esquema de producción debe vivir en
[`scripts/database/`](../scripts/database/) y seguir este orden bloqueante:

1. Confirmar explícitamente la operación.
2. Generar un respaldo lógico local del esquema de aplicación `public`.
3. Validar el respaldo con `pg_restore --list`, comprobar los datos afectados y
   calcular su checksum SHA-256.
4. Ejecutar una operación idempotente dentro de una transacción cuando sea
   posible.
5. Consultar el estado final y abortar con error si no coincide con lo esperado.

Si el respaldo o una validación falla, el script no puede modificar producción.
Los archivos quedan en `scripts/database/backups/`, están ignorados por Git y
deben tratarse como datos financieros sensibles. No restaures un respaldo sobre
producción sin aprobación separada y sin validar primero un destino aislado.

Para agregar las categorías iniciales pendientes:

```powershell
pnpm db:add-default-categories
```

El comando crea y valida el respaldo antes de insertar de forma idempotente
`Pulpería`, `Regalo` y `Pago de préstamos (deudas)`. No reemplaza valores de
una categoría que ya exista. Requisitos y detalles:
[`scripts/database/README.md`](../scripts/database/README.md).

Genera `AUTH_SECRET` desde PowerShell y copia el resultado a `.env.local`:

```powershell
[Convert]::ToBase64String(
  [Security.Cryptography.RandomNumberGenerator]::GetBytes(48)
)
```

No uses `NEXT_PUBLIC_` para este secreto, no lo compartas ni lo reutilices en
otros proyectos. En Vercel debe configurarse para Production y, si corresponde,
Preview.

## Conexión a la base

`src/lib/db/index.ts`:

- Valida que exista `DATABASE_URL`.
- Añade `sslmode=require`.
- Crea el cliente `postgres` con hasta cuatro conexiones reutilizables por
  instancia para que las consultas independientes se ejecuten en paralelo.
- Conserva conexiones inactivas durante cinco minutos para evitar repetir el
  handshake TLS durante una sesión normal de navegación.
- Usa `prepare: false` para el transaction pooler.
- Expone la instancia tipada de Drizzle.

El límite de cuatro conexiones está pensado para esta aplicación de un solo
usuario y para el transaction pooler de Supabase. Antes de aumentarlo, revisa
las conexiones activas y el límite del plan en **Supabase > Observability**.

## Región de producción

`vercel.json` ejecuta las funciones en Portland (`pdx1`), la región de Vercel
correspondiente a `us-west-2`, donde está alojado el proyecto actual de
Supabase. Mantener la función y PostgreSQL en la misma región evita que cada
consulta cruce Estados Unidos.

Si se crea otra base o se cambia su región, actualiza `regions` en
`vercel.json` antes de desplegar. La región configurada debe ser la más cercana
a la base, no necesariamente la más cercana al navegador.

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

### Crear la cuenta de acceso

Después de aplicar la migración que crea `app_users`, provisiona la única cuenta
desde PowerShell. La contraseña se enmascara y solo permanece en variables del
proceso durante el comando:

```powershell
$env:AUTH_USER_EMAIL = "tu-correo@example.com"
$env:AUTH_USER_NAME = "Tu nombre"
$env:AUTH_USER_PASSWORD = Read-Host "Contraseña nueva (12-128 caracteres)" -MaskInput

try {
  pnpm auth:create-user
} finally {
  Remove-Item Env:AUTH_USER_EMAIL
  Remove-Item Env:AUTH_USER_NAME
  Remove-Item Env:AUTH_USER_PASSWORD
}
```

Reemplaza los valores de ejemplo del correo y el nombre. El texto pasado a
`Read-Host` es solo la etiqueta del prompt; escribe la contraseña cuando
PowerShell la solicite y no dentro del comando.

La contraseña debe tener entre 12 y 128 caracteres. El comando rechaza crear
una segunda cuenta distinta. Si se ejecuta con el mismo correo, reemplaza la
contraseña e invalida las sesiones anteriores.

No agregues estas variables temporales a `.env.local`, Vercel ni Git. El seed
financiero no crea usuarios.

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

El script HTTP usa el Turbopack predeterminado de Next.js 16. Si cambias entre
los dos modos, detén primero el servidor anterior.

## Validación

Ejecuta primero la validación más específica y después la general:

```powershell
pnpm test
pnpm lint
pnpm build
```

`pnpm build` valida compilación y TypeScript. El proyecto no usa un script separado de `typecheck`.

## Scripts disponibles

| Script                  | Función                                         |
| ----------------------- | ----------------------------------------------- |
| `pnpm dev`              | Servidor HTTP de desarrollo                     |
| `pnpm run dev:https`    | Servidor HTTPS de desarrollo                    |
| `pnpm test`             | Jest                                            |
| `pnpm test:watch`       | Jest en modo watch                              |
| `pnpm lint`             | ESLint                                          |
| `pnpm build`            | Build de producción                             |
| `pnpm start`            | Ejecutar el build                               |
| `pnpm db:generate`      | Generar migraciones                             |
| `pnpm db:migrate`       | Aplicar migraciones                             |
| `pnpm db:push`          | Sincronización directa; usar con cautela        |
| `pnpm db:studio`        | Drizzle Studio                                  |
| `pnpm db:seed`          | Cargar catálogos iniciales y transacciones mock |
| `pnpm db:add-apolo-category` | Agregar la categoría Apolo con respaldo seguro |
| `pnpm db:update-august-2026-category-budgets` | Actualizar presupuestos de agosto 2026 con respaldo seguro |
| `pnpm auth:create-user` | Crear o reemplazar la única cuenta de acceso    |

## Archivos principales

```txt
drizzle.config.ts
drizzle/
src/lib/db/index.ts
src/lib/db/schema.ts
src/lib/db/seed.ts
src/lib/auth/
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

El seed inicial crea julio de 2026 y también transacciones mock para ese mes. Selecciona `2026-07` o crea el presupuesto del mes correspondiente cuando exista la interfaz de gestión.

### `MissingSecret` o redirección continua a `/login`

- Confirma que `AUTH_SECRET` exista en el entorno que ejecuta la aplicación.
- Usa el mismo valor durante la vida de un deployment; cambiarlo invalida sus
  cookies.
- Confirma que la migración de `app_users` esté aplicada y que la cuenta haya
  sido creada con `pnpm auth:create-user`.

## Seguridad antes de desplegar

La aplicación exige login mediante Auth.js y no ofrece registro público. Antes
de publicar:

- Configura `DATABASE_URL` y `AUTH_SECRET` en Vercel.
- Aplica la migración y crea la única cuenta antes del primer acceso.
- Comprueba en una ventana privada que `/dashboard` redirija a `/login`.
- Mantén Vercel Deployment Protection para previews cuando esté disponible.

Sigue el procedimiento completo en
[`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md).

La autenticación protege el dataset global, pero no convierte el proyecto en
multiusuario: las tablas financieras no incluyen `user_id` ni aislamiento entre
cuentas. No habilites una segunda cuenta sin diseñar primero ese aislamiento.
