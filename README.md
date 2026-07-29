# Finance Tracker

Aplicación personal para registrar transacciones, conservar su tasa de cambio
histórica y comparar los gastos mensuales contra presupuestos por categoría.

El proyecto utiliza Next.js App Router, TypeScript, MUI, Supabase Postgres,
Drizzle ORM, Jest y pnpm.

## Estado actual

Actualmente están implementados:

- Creación, listado, filtrado, edición y eliminación de transacciones.
- Conversión USD/NIO con montos y tasa histórica por transacción.
- Dashboard mensual con presupuesto, uso por categoría y alertas.
- Gestión de categorías, presupuestos mensuales y umbrales.
- Gestión de reglas determinísticas de comercios.
- Configuración general y administración de tarjetas de crédito.
- Interfaz adaptable para escritorio y dispositivos móviles.
- Logs estructurados, diagnóstico de base de datos y health check.
- Pruebas unitarias de lógica financiera, validación y observabilidad.

Continúan pendientes la aplicación automática de reglas durante el registro, la
protección del despliegue público y la IA opcional como último fallback. El
alcance detallado está en [docs/MVP.md](./docs/MVP.md).

## Inicio rápido

Requisitos: una versión de Node.js compatible con Next.js 16, pnpm y un proyecto
de Supabase.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Configura `DATABASE_URL` en `.env.local` con la cadena del transaction pooler de
Supabase. La aplicación estará disponible normalmente en
`http://localhost:3000`.

Consulta [docs/SETUP_NOTES.md](./docs/SETUP_NOTES.md) para HTTPS local,
configuración de Supabase y solución de problemas.

## Rutas

| Ruta                      | Función                                       |
| ------------------------- | --------------------------------------------- |
| `/`                       | Redirige a `/dashboard`                       |
| `/dashboard`              | Resumen mensual, presupuestos y alertas       |
| `/transactions`           | Listado y filtros de transacciones            |
| `/transactions/new`       | Registro de una transacción                   |
| `/transactions/[id]/edit` | Edición de una transacción                    |
| `/categories`             | Categorías, presupuestos y umbrales mensuales |
| `/rules`                  | Reglas determinísticas de comercios           |
| `/settings`               | Configuración general y tarjetas de crédito   |
| `/api/health`             | Estado seguro de Next.js y Postgres           |

`GET /api/health` devuelve `200` cuando la aplicación y Postgres responden, o
`503` con un `incidentId` cuando la base de datos no está disponible. Nunca
expone detalles internos.

## Logs y diagnóstico

Los eventos del servidor se escriben como JSON e incluyen timestamp, nivel,
evento, operación, duración, clasificación segura del error e `incidentId`.

- En desarrollo local se consultan en la terminal donde se ejecuta `pnpm dev`.
- En Vercel se consultan en Runtime Logs y pueden buscarse por `incidentId`.
- En Supabase, Pooler Logs y Postgres Logs ayudan a correlacionar fallos mediante
  el timestamp.

Se clasifican errores de timeout, cierre de conexión, autenticación, límite de
conexiones y consultas lentas. Los logs no incluyen `DATABASE_URL`, SQL,
parámetros, nombres de comercios, montos ni notas.

## Comandos de calidad

```powershell
pnpm format:check
pnpm test
pnpm lint
pnpm build
```

Para aplicar el formato definido en `.prettierrc.json` a todo el proyecto:

```powershell
pnpm format
```

Los comandos de migración, seed y Drizzle Studio están documentados en
[docs/SETUP_NOTES.md](./docs/SETUP_NOTES.md).

## Reglas financieras esenciales

- La categoría indica en qué se utilizó el dinero; el método indica cómo se
  pagó.
- Una compra con tarjeta es un gasto. El pago de la tarjeta es una transferencia
  y no debe duplicar el gasto.
- Solo las transacciones `expense` consumen presupuesto.
- Cada transacción conserva monto original, moneda, tasa histórica, USD y NIO.
- Las transacciones históricas no se recalculan con una tasa nueva.
- Las reglas determinísticas se evalúan antes que cualquier IA opcional.

## Seguridad

La aplicación es de un solo usuario y todavía no tiene autenticación. Antes de
publicarla, habilita Vercel Deployment Protection u otra protección aprobada.
Si se exponen tablas del esquema `public` mediante PostgREST, habilita RLS y
define políticas explícitas antes de permitir acceso.

Nunca publiques ni confirmes `.env.local`, `DATABASE_URL`, contraseñas, API keys,
JWT secrets ni service-role keys.

## Documentación

| Documento                                            | Responsabilidad                           |
| ---------------------------------------------------- | ----------------------------------------- |
| [docs/MVP.md](./docs/MVP.md)                         | Alcance y estado del producto             |
| [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Contrato de base de datos                 |
| [docs/SETUP_NOTES.md](./docs/SETUP_NOTES.md)         | Configuración, comandos y troubleshooting |
| [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md) | Decisiones y problemas conocidos          |
| [AGENTS.md](./AGENTS.md)                             | Reglas de colaboración para agentes       |
