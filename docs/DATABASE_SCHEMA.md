# Esquema de base de datos

> Contrato de datos del MVP v1.

## Tecnología

```txt
Supabase Postgres
Drizzle ORM
postgres-js
drizzle-kit
```

Archivos:

```txt
drizzle.config.ts
drizzle/
src/lib/db/index.ts
src/lib/db/schema.ts
src/lib/db/seed.ts
```

## Conexión

La aplicación usa `DATABASE_URL` desde `.env.local`.

Para el transaction pooler de Supabase:

- Puerto `6543`.
- `sslmode=require`.
- `prepare: false`.
- La URL solo se utiliza en el servidor.

`drizzle.config.ts` carga `.env.local` y también fuerza TLS para migraciones.

## Principios

- UUID como clave primaria.
- Restricciones de base para invariantes críticos.
- Valores monetarios almacenados como `numeric`.
- Sin `user_id` durante MVP v1.
- Desactivación lógica para categorías y métodos.
- Tasa histórica almacenada por transacción.
- Relaciones explícitas entre presupuestos, categorías y transacciones.

## Enums

### `currency`

```txt
USD
NIO
```

### `transaction_type`

```txt
income
expense
transfer
```

### `payment_method_type`

```txt
cash
debit
credit_card
bank_transfer
prepaid
agency
other
```

### `alert_level`

```txt
info
warning
danger
exceeded
```

## Tablas

### `app_settings`

Configuración global. El seed mantiene una fila conocida.

| Columna | Tipo | Reglas |
| --- | --- | --- |
| `id` | uuid | PK |
| `default_currency` | currency | requerido, `USD` |
| `default_exchange_rate` | numeric(12,4) | requerido, mayor que 0 |
| `credit_card_mode_enabled` | boolean | requerido, `false` |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

La tasa representa cuántos NIO equivalen a 1 USD.

### `categories`

Describe en qué se utilizó el dinero.

| Columna | Tipo | Reglas |
| --- | --- | --- |
| `id` | uuid | PK |
| `name` | varchar(120) | requerido, único |
| `monthly_budget_usd` | numeric(12,2) | requerido, no negativo |
| `is_essential` | boolean | requerido |
| `is_active` | boolean | requerido |
| `warning_threshold` | integer | mayor que 0 |
| `danger_threshold` | integer | mayor que warning |
| `exceeded_threshold` | integer | mayor o igual que danger |
| `sort_order` | integer | requerido |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

Índice adicional sobre `is_active`.

`monthly_budget_usd` conserva el valor predeterminado de la categoría. El presupuesto histórico por mes vive en `monthly_budget_categories`.

### `payment_methods`

Describe cómo se pagó.

| Columna | Tipo | Reglas |
| --- | --- | --- |
| `id` | uuid | PK |
| `name` | varchar(120) | requerido, único |
| `type` | payment_method_type | requerido |
| `is_active` | boolean | requerido |
| `credit_limit_usd` | numeric(12,2) | opcional, no negativo |
| `statement_cut_day` | integer | opcional, 1–31 |
| `payment_due_day` | integer | opcional, 1–31 |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

Índices sobre `type` e `is_active`.

### `monthly_budgets`

Cabecera de un presupuesto mensual.

| Columna | Tipo | Reglas |
| --- | --- | --- |
| `id` | uuid | PK |
| `month` | date | requerido, único |
| `salary_usd` | numeric(12,2) | mayor que 0 |
| `expected_savings_usd` | numeric(12,2) | no negativo |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

`month` debe ser el primer día del mes.

### `monthly_budget_categories`

Distribución del presupuesto entre categorías.

| Columna | Tipo | Reglas |
| --- | --- | --- |
| `id` | uuid | PK |
| `monthly_budget_id` | uuid | FK, cascade al eliminar presupuesto |
| `category_id` | uuid | FK, restrict al eliminar categoría |
| `amount_usd` | numeric(12,2) | requerido, no negativo |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

La combinación `(monthly_budget_id, category_id)` es única.

Índices sobre ambas claves foráneas.

### `transactions`

Ingresos, gastos y transferencias.

| Columna | Tipo | Reglas |
| --- | --- | --- |
| `id` | uuid | PK |
| `name` | varchar(180) | requerido |
| `amount` | numeric(12,2) | mayor que 0 |
| `currency` | currency | requerido |
| `exchange_rate` | numeric(12,4) | mayor que 0 |
| `amount_usd` | numeric(12,2) | no negativo |
| `amount_nio` | numeric(12,2) | no negativo |
| `date` | date | requerido |
| `type` | transaction_type | requerido |
| `category_id` | uuid | opcional, FK con `set null` |
| `payment_method_id` | uuid | opcional, FK con `set null` |
| `note` | text | opcional |
| `raw_input` | text | reservado |
| `classification_confidence` | numeric(5,4) | opcional, 0–1 |
| `classification_reason` | text | opcional |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

Índices:

```txt
date
type
category_id
payment_method_id
currency
```

Reglas de aplicación:

- Categoría y método son obligatorios para `expense`.
- Solo `expense` consume presupuesto.
- El pago de tarjeta debe registrarse como `transfer`.
- `amount`, `currency` y `exchange_rate` son históricos.

### `merchant_rules`

Reglas determinísticas de clasificación.

| Columna | Tipo | Reglas |
| --- | --- | --- |
| `id` | uuid | PK |
| `pattern` | varchar(240) | requerido, único |
| `category_id` | uuid | FK, cascade |
| `priority` | integer | requerido |
| `is_active` | boolean | requerido |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

Menor prioridad numérica se evalúa primero.

Índices sobre categoría, estado y prioridad.

No ejecutar código arbitrario almacenado en `pattern`. Si se admiten expresiones regulares, los errores deben manejarse de forma segura.

### `alerts`

Alertas persistentes opcionales.

| Columna | Tipo | Reglas |
| --- | --- | --- |
| `id` | uuid | PK |
| `level` | alert_level | requerido |
| `title` | varchar(180) | requerido |
| `message` | text | requerido |
| `category_id` | uuid | opcional, `set null` |
| `transaction_id` | uuid | opcional, cascade |
| `is_read` | boolean | requerido |
| `created_at` | timestamptz | requerido |

Índices sobre nivel, categoría, transacción y lectura.

El dashboard actual calcula alertas en tiempo de ejecución; no inserta filas en esta tabla.

## Conversión monetaria

Para USD:

```txt
amountUsd = amount
amountNio = amount × exchangeRate
```

Para NIO:

```txt
amountUsd = amount ÷ exchangeRate
amountNio = amount
```

Los resultados se redondean a dos decimales antes de persistirse.

## Presupuesto

- Los cálculos utilizan USD.
- `Ahorro` no forma parte del presupuesto consumible del dashboard.
- Las transferencias e ingresos no consumen presupuesto.
- El dashboard usa los umbrales de cada categoría.
- Un presupuesto inexistente produce totales en cero y una advertencia de interfaz.

## Seed inicial

`src/lib/db/seed.ts` usa upserts e inserta:

- 1 fila de configuración.
- 13 categorías.
- 7 métodos de pago.
- Presupuesto para `2026-07-01`.
- 13 asignaciones de categoría.
- 7 reglas de comercios.

El seed puede repetirse sin duplicar estas entidades. También sincroniza los valores iniciales definidos en el archivo.

## Migraciones

Flujo esperado:

```powershell
pnpm db:generate
pnpm db:migrate
```

No edites una migración ya aplicada para representar un cambio nuevo. Genera una migración adicional y revisa su SQL.

## Cambios futuros que requieren aprobación

- `users` y columnas `user_id`.
- Row Level Security.
- Cuentas con saldos reales.
- Conexiones bancarias.
- Archivos de recibos y OCR.
- Transacciones recurrentes.
- Metas, auditoría o notificaciones.

Al aprobar multiusuario, será necesario revisar todas las claves únicas y agregar aislamiento por usuario.
