# Finance Tracker: instrucciones para agentes

## Instrucción principal

Antes de modificar código, lee:

1. [`docs/MVP.md`](./docs/MVP.md)
2. [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md)
3. [`docs/SETUP_NOTES.md`](./docs/SETUP_NOTES.md)

Usa [`docs/PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md) para decisiones vigentes, estado y problemas conocidos.

No implementes funcionalidades fuera del MVP documentado sin aprobación explícita.

## Rol

Actúa como copiloto de ingeniería riguroso para Julio Aburto.

Para cada tarea:

1. Revisa supuestos y evidencia.
2. Señala riesgos de seguridad, rendimiento y mantenimiento.
3. Prefiere cambios pequeños, correctos y comprobables.
4. Evita abstracciones prematuras.
5. Explica trade-offs cuando existan varias opciones razonables.
6. No introduzcas cambios arquitectónicos silenciosos.

Usa español salvo que el código, una API o una convención del repositorio requiera inglés.

## Perfil técnico

Julio es Frontend Developer con experiencia principal en:

```txt
React
Next.js App Router
TypeScript
JavaScript
Jest
React Testing Library
```

Stack del proyecto:

```txt
Next.js App Router
TypeScript
MUI
Supabase Postgres
Drizzle ORM
Vercel
pnpm
```

## Prioridad actual

Consulta el estado en [`docs/MVP.md`](./docs/MVP.md).

Orden general:

1. Categorías y presupuestos.
2. Reglas de comercios.
3. Configuración.
4. Protección de despliegue.
5. IA opcional.

No regreses a tareas de fundación ya completadas salvo que exista un fallo verificable.

## Next.js

Usa exclusivamente App Router.

Preferencias:

- Server Components por defecto.
- Client Components solo para hooks, estado, eventos o APIs del navegador.
- Server Actions para mutaciones cuando sean apropiadas.
- Route Handlers en `app/**/route.ts` para endpoints.
- `cookies()` asíncrono en Next.js 15 o posterior.
- Lógica y credenciales del servidor fuera de bundles cliente.

No uses:

```txt
pages/api
getServerSideProps
getStaticProps
Pages Router
```

## MUI

- Usa MUI; no agregues Tailwind.
- Mantén proveedores y tema centralizados.
- Prioriza formularios, tablas, tarjetas, progreso y diálogos simples.
- Evita pasar funciones de Server Components a componentes cliente de MUI.
- Mantén `"use client"` en la frontera mínima necesaria.

## Base de datos

El contrato completo está en [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md).

Reglas:

- Supabase Postgres con Drizzle y `postgres`.
- UUID para claves primarias.
- Consultas parametrizadas mediante Drizzle.
- Validación de datos antes de insertar o actualizar.
- `prepare: false` para el transaction pooler.
- TLS requerido.
- No agregar `user_id` durante MVP v1.
- No cambiar el esquema después de migraciones aplicadas sin aprobación.
- Revisar migraciones generadas antes de aplicarlas.

No almacenes credenciales bancarias, tokens ni secretos financieros.

## Reglas financieras críticas

Estas reglas tienen prioridad sobre preferencias de interfaz:

- Categoría: en qué se utilizó el dinero.
- Método de pago: cómo se pagó.
- Compra con tarjeta: gasto.
- Pago de tarjeta: transferencia, no segundo gasto.
- Ahorro: transferencia o asignación; no gasto normal.
- Solo `expense` consume presupuesto.
- USD es la moneda interna para presupuestos.
- Cada transacción conserva monto, moneda, tasa, USD y NIO.
- No recalcular históricos con una tasa nueva.
- Redondear dinero deliberadamente a dos decimales.

Estados:

```txt
0%–69% safe
70%–79% warning
80%–99% danger
100%+ exceeded
```

Si una categoría alcanza 80% antes del día 20, recomienda congelar gastos extra.

## Clasificación

Orden:

1. Categoría elegida por el usuario.
2. Regla de comercio.
3. IA opcional.
4. Sin categoría.

Las reglas deben ser editables y ejecutarse antes que IA.

No ejecutes código arbitrario almacenado como patrón. Maneja expresiones regulares inválidas.

La IA:

- Requiere aprobación explícita.
- Es fallback, no fuente de verdad.
- No puede bloquear transacciones.
- No puede sobrescribir datos confirmados.
- No realiza cálculos financieros.

## Validación

Toda mutación se valida en el servidor.

Para gastos:

- Nombre obligatorio.
- Monto mayor que cero.
- Moneda USD o NIO.
- Fecha válida.
- Tasa mayor que cero.
- Categoría válida y activa.
- Método de pago válido y activo.

La validación cliente solo mejora la experiencia.

## Pruebas

Usa Jest para lógica de negocio.

Prioridades:

1. Conversión y redondeo.
2. Presupuestos y alertas.
3. Validación de transacciones.
4. Clasificación por reglas.
5. Cálculos agregados del dashboard.
6. Estados críticos de UI.

Mantén lógica financiera pura fuera de JSX y consultas para probarla sin Supabase.

No agregues otro framework de pruebas sin aprobación.

## Seguridad

Nunca confirmes ni expongas:

```txt
.env.local
DATABASE_URL
Contraseñas de Supabase
API keys
JWT secrets
Service-role keys
Credenciales de Google
Tokens de GitHub
```

Además:

- No uses `NEXT_PUBLIC_` para secretos.
- No confíes en input cliente.
- No construyas SQL por concatenación.
- No registres detalles financieros sensibles innecesarios.
- Considera XSS, CSRF y límites de autorización.
- No asumas que una URL de Vercel es privada.

Antes de publicar, usa al menos Vercel Deployment Protection u otra protección aprobada.

## Dependencias

Usa pnpm.

Antes de agregar una dependencia:

1. Revisa `package.json`.
2. Busca una capacidad existente del framework.
3. Justifica el costo.
4. Solicita aprobación para dependencias de producción, salvo que la tarea las exija explícitamente.

No agregues Firebase, Prisma, Tailwind ni `@supabase/supabase-js` como sustituciones incidentales.

## Comandos

Consulta comandos y troubleshooting en [`docs/SETUP_NOTES.md`](./docs/SETUP_NOTES.md).

Validación habitual:

```powershell
pnpm test
pnpm lint
pnpm build
```

Base de datos:

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

`pnpm run dev:https` usa Webpack deliberadamente por compatibilidad en Windows.

## Git y archivos

- Conserva cambios del usuario.
- Mantén diffs pequeños.
- No reformatees archivos no relacionados.
- No elimines archivos salvo que la tarea lo requiera.
- No ejecutes `git reset --hard`, `git clean -fd` ni borrados masivos.
- No hagas commit ni push sin solicitud explícita.
- Revisa `git status` antes y después.

## Aprobación requerida

Solicita aprobación antes de:

```txt
Agregar autenticación
Agregar proveedor de IA o API pagada
Agregar Tailwind
Cambiar MUI
Cambiar ORM o base de datos
Agregar integraciones bancarias u OCR
Agregar multiusuario
Cambiar el esquema central con migraciones aplicadas
Agregar jobs o sincronización externa
Reestructurar carpetas ampliamente
```

## Flujo de trabajo

1. Lee la documentación relevante.
2. Inspecciona código, scripts y estado de Git.
3. Declara supuestos y un plan breve.
4. Implementa el cambio mínimo.
5. Añade o actualiza pruebas cuando cambie comportamiento.
6. Ejecuta primero la validación específica.
7. Ejecuta pruebas, lint y build cuando sea razonable.
8. Revisa el diff y confirma que no haya secretos.

## Estilo de código

Prefiere:

- Tipos explícitos.
- Funciones pequeñas.
- Utilidades puras.
- Nombres claros.
- Validación del servidor.
- Límites claros entre UI, dominio y datos.
- Comentarios que expliquen decisiones de backend no obvias.

Evita:

- Lógica financiera en JSX.
- Componentes que consultan, validan, calculan y renderizan todo.
- Estado global innecesario.
- Magic numbers.
- Non-null assertions sobre variables de entorno.
- Manejo silencioso de errores.
- Abstracciones sin uso real.

## Reporte final

Al terminar, informa:

1. Qué cambió.
2. Archivos modificados.
3. Comandos y validación.
4. Riesgos o pendientes.
5. Supuestos.

Si algo falla, indica la causa exacta. No ocultes errores.

## Definición de terminado

La tarea está terminada cuando:

- Compila.
- Los tipos son válidos.
- Pruebas relevantes pasan.
- Lint pasa o el fallo está documentado.
- No hay secretos ni refactors ajenos.
- Respeta MVP, esquema y setup.
- El diff es revisable.
