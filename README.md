# 💸 Finance Tracker

Aplicación personal para registrar transacciones, conservar la tasa de cambio histórica y comparar los gastos mensuales contra presupuestos por categoría.

El objetivo principal es responder rápido:

```txt
¿Cuánto gasté este mes?
¿En qué categorías estoy sano, en riesgo o excedido?
¿Qué gasto debería frenar antes de salirme del presupuesto?
```

---

## 📌 Estado actual

### ✅ Implementado

* Conexión con **Supabase Postgres** mediante **Drizzle ORM**.
* Migración y seed inicial.
* Conversión **USD/NIO** con tasa histórica por transacción.
* Creación, listado, filtrado, edición y eliminación de transacciones.
* Dashboard mensual con:

  * uso por categoría,
  * alertas de presupuesto,
  * gastos sin categoría.
* Pruebas unitarias con **Jest**.

### ⏳ Pendiente dentro del MVP

* Gestión de categorías y presupuestos.
* Gestión de reglas de comercios.
* Configuración editable desde la interfaz.
* Protección del despliegue público.
* IA opcional como fallback.

El alcance y estado detallados están en [docs/MVP.md](./docs/MVP.md).

---

## 🧱 Stack

| Área            | Tecnología         |
| --------------- | ------------------ |
| Framework       | Next.js App Router |
| Lenguaje        | TypeScript         |
| UI              | MUI                |
| Base de datos   | Supabase Postgres  |
| ORM             | Drizzle ORM        |
| Driver DB       | `postgres`         |
| Testing         | Jest               |
| Package manager | pnpm               |

---

## 🚀 Inicio rápido

### 1. Instalar dependencias

```powershell
pnpm install
```

### 2. Configurar variables de entorno

Copia `.env.example` como `.env.local` y reemplaza los placeholders:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:6543/postgres"
```

> ⚠️ No publiques ni confirmes `.env.local`.

### 3. Preparar la base de datos

```powershell
pnpm db:migrate
pnpm db:seed
```

### 4. Iniciar la aplicación

```powershell
pnpm dev
```

La app quedará disponible normalmente en:

```txt
http://localhost:3000
```

Para requisitos, HTTPS local, scripts y solución de problemas, consulta [docs/SETUP_NOTES.md](./docs/SETUP_NOTES.md).

---

## 🧭 Rutas actuales

| Ruta                      | Función                                |
| ------------------------- | -------------------------------------- |
| `/`                       | Redirige a `/dashboard`                |
| `/dashboard`              | Resumen mensual, presupuesto y alertas |
| `/transactions`           | Listado y filtros de transacciones     |
| `/transactions/new`       | Registro de transacciones              |
| `/transactions/[id]/edit` | Edición de una transacción             |

## ⏳ Rutas pendientes dentro del MVP

| Ruta          | Estado   |
| ------------- | -------- |
| `/categories` | Pendiente |
| `/rules`      | Pendiente |
| `/settings`   | Pendiente |

---

## 💰 Reglas financieras esenciales

Estas reglas protegen la lógica financiera del proyecto:

| Regla               | Significado                                |
| ------------------- | ------------------------------------------ |
| Categoría           | Indica en qué se gastó el dinero           |
| Método de pago      | Indica cómo se pagó                        |
| Compra con tarjeta  | Es un gasto                                |
| Pago de tarjeta     | Es una transferencia, no un segundo gasto  |
| Tasa de cambio      | Se conserva por transacción                |
| Presupuesto         | Solo los gastos consumen presupuesto       |
| Ahorro              | No se cuenta como gasto normal             |
| Reglas de comercios | Se evalúan antes que cualquier IA opcional |

Cada transacción conserva:

```txt
monto original
moneda original
tasa de cambio histórica
monto convertido a USD
monto convertido a NIO
```

---

## 📊 Lógica de presupuesto

El dashboard compara los gastos mensuales contra el presupuesto asignado por categoría.

Estados esperados:

| Estado      | Uso del presupuesto |
| ----------- | ------------------- |
| 🟢 Sano     | 0% - 69%            |
| 🟡 Cuidado  | 70% - 79%           |
| 🟠 Alerta   | 80% - 99%           |
| 🔴 Excedido | 100% o más          |

Regla especial:

> Si una categoría llega al **80% antes del día 20**, la app debe recomendar congelar gastos extras en esa categoría.

---

## 📚 Documentación

| Documento                                            | Descripción                               |
| ---------------------------------------------------- | ----------------------------------------- |
| [docs/MVP.md](./docs/MVP.md)                         | Alcance del MVP                           |
| [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Esquema de base de datos                  |
| [docs/SETUP_NOTES.md](./docs/SETUP_NOTES.md)         | Configuración, comandos y troubleshooting |
| [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md) | Contexto y decisiones vigentes            |
| [AGENTS.md](./AGENTS.md)                             | Instrucciones para Codex/agentes          |

---

## 🧪 Comandos útiles

| Comando            | Descripción                      |
| ------------------ | -------------------------------- |
| `pnpm dev`         | Inicia el servidor de desarrollo |
| `pnpm build`       | Genera build de producción       |
| `pnpm lint`        | Ejecuta lint                     |
| `pnpm test`        | Ejecuta pruebas unitarias        |
| `pnpm db:generate` | Genera migraciones Drizzle       |
| `pnpm db:migrate`  | Aplica migraciones a la base     |
| `pnpm db:seed`     | Ejecuta seed inicial             |
| `pnpm db:studio`   | Abre Drizzle Studio              |

---

## 🔐 Seguridad

No confirmes ni publiques:

```txt
.env.local
DATABASE_URL
Contraseñas de Supabase
API keys
JWT secrets
service-role keys
```

La aplicación actualmente no tiene autenticación.

Antes de desplegarla públicamente, habilita al menos:

```txt
Vercel Deployment Protection
```

u otra protección aprobada.

---

## 🧠 Notas de arquitectura

* La app usa **Next.js App Router**.
* Se priorizan **Server Components** por defecto.
* Las mutaciones deben manejarse desde servidor.
* La base de datos se consulta mediante **Drizzle ORM**.
* No se usa Firebase.
* No se usa Tailwind.
* No se usa AI-first UX en el MVP.
* Las reglas financieras tienen prioridad sobre cualquier automatización futura.

---

## 🎯 Objetivo del MVP

La primera versión útil no busca ser una app bancaria completa.

Busca lograr esto:

```txt
Puedo registrar mis gastos todos los días.
La app los categoriza correctamente.
El dashboard muestra el uso del presupuesto.
La app me avisa antes de gastar de más.
```
