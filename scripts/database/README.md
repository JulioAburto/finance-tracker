# Cambios seguros de base de datos

Esta carpeta concentra operaciones administrativas explícitas sobre la base de
datos de Finance Tracker. Un cambio de producción debe quedar bloqueado si no
puede crear y verificar primero un respaldo lógico.

## Política obligatoria

1. Usa un script dedicado y revisable por operación.
2. Respalda el esquema de aplicación `public` antes de escribir.
3. Usa una conexión directa o session pooler en el puerto `5432` para
   `pg_dump`; el transaction pooler del puerto `6543` queda reservado para la
   aplicación serverless.
4. Valida el respaldo con `pg_restore --list`, comprueba que incluya los datos
   afectados y genera un checksum SHA-256.
5. Cancela la operación si falla cualquiera de esas comprobaciones.
6. Haz la modificación idempotente y transaccional cuando sea posible.
7. Verifica el estado final antes de reportar éxito.

Los respaldos contienen información financiera. Se guardan en `backups/`, que
está ignorada por Git; no deben compartirse ni confirmarse. Una restauración no
es automática: requiere aprobación separada y debe probarse primero sobre una
base aislada.

Referencias oficiales:

- [Supabase: Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase: Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase: Backup and restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)

## Requisitos

- `.env.local` con `DATABASE_URL` del transaction pooler de producción.
- `pg_dump.exe` y `pg_restore.exe` instalados, o Docker Desktop en ejecución.
  El script prioriza las herramientas nativas y, si faltan, usa temporalmente la
  imagen oficial `postgres:17-alpine` fijada por digest.
- `pnpm` y las dependencias del proyecto.
- Opcionalmente, `DATABASE_BACKUP_URL` para el mismo proyecto Supabase mediante
  conexión directa o session pooler en el puerto `5432`. Si no existe y
  `DATABASE_URL` es un pooler compartido válido en `6543`, el script deriva de
  forma local la conexión de sesión correspondiente.

Ninguna URL ni contraseña se imprime en la consola. El script verifica que las
conexiones de respaldo y ejecución pertenezcan al mismo proyecto Supabase y a la
misma base de datos.

## Agregar categorías predeterminadas

Ejecuta desde la raíz del repositorio:

```powershell
pnpm db:add-default-categories
```

El flujo:

1. Crea `backups/finance-tracker-pre-add-categories-<UTC>.dump`.
2. Verifica el contenido del respaldo y crea el archivo `.sha256` asociado.
3. Inserta, solo si no existen, las categorías `Pulpería`, `Regalo` y
   `Pago de préstamos (deudas)`.
4. Consulta las tres categorías dentro de la misma transacción antes de
   confirmarla.

Las nuevas categorías parten con presupuesto `0.00 USD`. `Pulpería` y
`Pago de préstamos (deudas)` se marcan esenciales; `Regalo`, no esencial. El
script no sobrescribe categorías existentes ni modifica transacciones,
presupuestos, usuarios o reglas.

## Agregar categoría Apolo

Ejecuta desde la raíz del repositorio:

```powershell
pnpm db:add-apolo-category
```

El flujo:

1. Crea `backups/finance-tracker-pre-add-apolo-category-<UTC>.dump`.
2. Verifica el contenido del respaldo y crea el archivo `.sha256` asociado.
3. Inserta `Apolo` si no existe, con presupuesto predeterminado `0.00 USD` y
   marcada como esencial.
4. Crea asignaciones mensuales `0.00 USD` para los presupuestos existentes que
   todavía no tengan esa categoría.
5. Inserta o actualiza la regla `apolo -> Apolo`.
6. Consulta la categoría, sus asignaciones mensuales y la regla dentro de la
   misma transacción antes de confirmarla.

El script no modifica transacciones existentes. Si hay gastos ya registrados
relacionados con Apolo, deben reclasificarse desde `/transactions`.
