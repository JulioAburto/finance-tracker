# Finance Tracker: contexto del proyecto

> Decisiones vigentes, estado de implementación y problemas conocidos.

Última revisión: 2026-06-20.

## Fuentes de verdad

Cuando exista una contradicción, usa este orden:

1. [`AGENTS.md`](../AGENTS.md)
2. [`MVP.md`](./MVP.md)
3. [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)
4. [`SETUP_NOTES.md`](./SETUP_NOTES.md)
5. Este documento
6. [`README.md`](../README.md)

## Objetivo

Construir una aplicación personal y de un solo usuario que permita:

- Registrar gastos manualmente.
- Clasificarlos por categoría y método de pago.
- Compararlos contra presupuestos mensuales.
- Mostrar estados y recomendaciones antes de exceder límites.
- Mantener cálculos financieros independientes de IA.

No es un sistema contable ni bancario completo.

## Decisiones vigentes

| Tema | Decisión |
| --- | --- |
| Framework | Next.js App Router con TypeScript |
| UI | MUI; no Tailwind |
| Base de datos | Supabase Postgres |
| Acceso a datos | Drizzle ORM con `postgres` |
| Despliegue previsto | Vercel |
| Usuario | Único usuario durante MVP v1 |
| Moneda interna | USD |
| Monedas capturadas | USD y NIO |
| Clasificación | Selección manual, luego reglas y finalmente IA opcional |
| Autenticación | No requerida localmente; necesaria alguna protección al publicar |

## Estado actual

### Completado

- Configuración de Next.js, MUI y App Router.
- Conexión TLS al transaction pooler de Supabase.
- Esquema Drizzle, migración inicial y seed idempotente.
- Utilidades de dinero y presupuesto.
- Creación y validación de transacciones en el servidor.
- Listado con filtros por mes, categoría y método de pago.
- Edición y eliminación con confirmación.
- Dashboard mensual con cálculos reales.
- Pruebas unitarias con Jest.
- Validación mediante lint y build.

### Pendiente

- CRUD de categorías y actualización de presupuestos.
- CRUD de reglas de comercios.
- Pantalla de configuración.
- Aplicación automática de reglas de comercios.
- Protección para un despliegue público.
- IA opcional, únicamente después de completar las reglas.

## Flujo de datos actual

```txt
Formulario cliente
  -> Server Action
  -> validación del lado servidor
  -> validación de categoría y método de pago
  -> conversión USD/NIO
  -> Drizzle ORM
  -> Supabase Postgres
  -> revalidación de transacciones y dashboard
```

Las consultas se ejecutan desde Server Components o módulos exclusivos del servidor. `DATABASE_URL` nunca debe llegar al navegador.

## Reglas financieras que no deben cambiarse accidentalmente

- La categoría responde “¿en qué se gastó?”.
- El método de pago responde “¿cómo se pagó?”.
- Una compra con tarjeta de crédito es un gasto.
- El pago de la tarjeta es una transferencia, no un gasto duplicado.
- El ahorro no se incluye como gasto normal del dashboard.
- Cada transacción almacena monto original, moneda, tasa, USD y NIO.
- Las transacciones históricas no se recalculan con tasas nuevas.
- Solo las transacciones de tipo `expense` consumen presupuesto.
- Las reglas determinísticas tienen prioridad sobre IA.

## Presupuesto inicial

El seed crea un presupuesto para `2026-07-01` con salario de USD 1,300 y ahorro esperado de USD 450.

El dashboard selecciona el mes actual por defecto. Para revisar el seed inicial, selecciona julio de 2026.

## Conexión con Supabase

- La variable local es `DATABASE_URL` dentro de `.env.local`.
- Se usa el transaction pooler en el puerto `6543`.
- La URL se fuerza a `sslmode=require`.
- El cliente usa `prepare: false` por compatibilidad con el pooler.
- Drizzle carga `.env.local` desde `drizzle.config.ts`.

No usar `NEXT_PUBLIC_DATABASE_URL`.

## Desarrollo HTTPS

`pnpm run dev:https` usa Webpack deliberadamente:

```powershell
next dev --webpack --experimental-https
```

Durante la implementación, Turbopack con HTTPS en Windows produjo errores del React Client Manifest. El desarrollo HTTP y el build pueden continuar usando Turbopack.

## Pruebas

Las pruebas unitarias cubren:

- Conversión USD/NIO.
- Redondeo monetario.
- Porcentaje y estado de presupuesto.
- Regla de congelamiento antes del día 20.
- Validación de transacciones.
- Cálculos agregados del dashboard.

Las pruebas de lógica pura no requieren conexión a Supabase.

## Consideraciones de seguridad

- `.env.local` está ignorado por Git.
- No registrar credenciales ni URLs completas en logs.
- No confiar en validación del navegador.
- Las mutaciones deben validar nuevamente en el servidor.
- Drizzle parametriza las consultas; no construir SQL con concatenación.
- La aplicación no debe considerarse privada únicamente por tener una URL difícil de adivinar.

## Historial relevante

- Se eligió Postgres en lugar de Firebase por las relaciones y agregaciones financieras.
- Se eligió Drizzle para mantener esquema y consultas tipadas.
- La conexión, migración y seed iniciales fueron comprobados contra Supabase.
- Se eliminó la dependencia de Google Fonts para que el build no requiera red.
- HTTPS local se fijó a Webpack por un problema reproducible de Turbopack en Windows.

## Próxima prioridad

1. Gestión de categorías y presupuestos.
2. Gestión y aplicación de reglas de comercios.
3. Configuración editable.
4. Protección del despliegue.
5. IA opcional como fallback.
