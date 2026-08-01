# Plan de confiabilidad y análisis de rendimiento

## Propósito y alcance

Este documento conserva íntegramente la evidencia y las conclusiones de las fases 0, 1 y 2 de la revisión de confiabilidad realizada contra producción. También organiza el trabajo pendiente por fases, con criterios de entrada, actividades, entregables, riesgos y puertas de aprobación.

La revisión observó la aplicación desde fuera y sin autenticación. No se modificó código, configuración, datos ni infraestructura; no se ejecutó SQL de producción; no se realizaron pruebas concurrentes ni intentos de eludir la autenticación.

Fuentes revisadas:

- [`../AGENTS.md`](../AGENTS.md)
- [`MVP.md`](./MVP.md)
- [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)
- [`SETUP_NOTES.md`](./SETUP_NOTES.md)
- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)
- [`../SLOW_QUERIES.md`](../SLOW_QUERIES.md)
- [`../package.json`](../package.json)
- [`../drizzle.config.ts`](../drizzle.config.ts)
- [`../src/lib/db/index.ts`](../src/lib/db/index.ts)
- [`../src/lib/db/schema.ts`](../src/lib/db/schema.ts)

Reglas para ejecutar las fases pendientes:

- No exponer `DATABASE_URL`, contraseñas, secretos de autenticación ni datos financieros.
- No ejecutar migraciones, seeds, SQL de producción, `EXPLAIN ANALYZE` ni cambios destructivos sin aprobación explícita.
- Mantener separadas las mediciones públicas no autenticadas de las conclusiones sobre consultas privadas.
- Hacer tráfico secuencial y de bajo volumen; cualquier carga concurrente necesita una aprobación independiente.
- Registrar antes y después con la misma ruta, región, muestra, intervalo, timeout y revisión de Git.
- Implementar cambios pequeños, medibles y reversibles.

## Estado de las fases

| Fase | Objetivo                                                 | Estado                         | Resultado o puerta de salida                                               |
| ---- | -------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| 0    | Reunir contexto, restricciones y evidencia existente     | Completada                     | Documentación, configuración segura y revisión de Git identificadas        |
| 1    | Medir disponibilidad y latencia pública                  | Completada                     | 189 solicitudes secuenciales; sin errores ni timeouts                      |
| 2    | Correlacionar rutas, consultas, esquema y observabilidad | Completada                     | Riesgos y límites clasificados por nivel de evidencia                      |
| 3    | Auditar confiabilidad de Next.js de forma estática       | Pendiente de aprobación        | Mapa por ruta de esperas, límites, errores y secuencialidad                |
| 4    | Correlacionar Vercel Runtime Logs                        | Pendiente de acceso/aprobación | Tiempos de función, región, cold starts e incidentes correlacionados       |
| 5    | Correlacionar observabilidad de Supabase                 | Pendiente de acceso/aprobación | Métricas de pool, sesiones, bloqueos y consultas reales                    |
| 6    | Diseñar límites de tiempo y cancelación                  | Pendiente                      | Propuesta concreta sin ocultar errores ni cortar operaciones válidas       |
| 7    | Acotar lecturas y mejorar agregaciones                   | Pendiente                      | Paginación/límites y consultas reducidas con medición antes/después        |
| 8    | Separar salud pública y readiness privada                | Pendiente                      | Contrato operativo que no exponga información sensible                     |
| 9    | Verificar rutas autenticadas con cuenta desechable       | Pendiente de aprobación        | Latencia real de páginas privadas y consultas asociadas                    |
| 10   | Validar cambios y cerrar hallazgos                       | Pendiente                      | Evidencia comparativa, regresiones descartadas y documentación actualizada |

## Resumen ejecutivo

- **Estado general:** la superficie pública estuvo disponible y estable durante la muestra. No se confirmó un incidente crítico o alto desde tráfico externo no autenticado.
- **Disponibilidad pública:** 189 de 189 solicitudes terminaron sin error y sin timeout; no se observaron respuestas `5xx`.
- **Autenticación:** `/dashboard`, `/transactions`, `/transactions/new`, `/categories`, `/rules` y `/settings` redirigieron a `/login`. `/api/health` devolvió `401`. No aparecieron marcadores de contenido financiero protegido.
- **Mayor riesgo:** el cliente PostgreSQL no configura un límite explícito por consulta, sentencia o espera de bloqueo. Esto puede permitir esperas prolongadas, pero su impacto actual no fue verificado.
- **Siguiente acción recomendada:** ejecutar la fase 3, una auditoría estática y de solo lectura de confiabilidad de Next.js; después correlacionar Vercel Runtime Logs y observabilidad de Supabase antes de cambiar consultas, índices o conexiones.

Limitación central:

> Las mediciones HTTP externas sin autenticación no pueden demostrar directamente el tiempo de ejecución de consultas privadas de Supabase detrás de rutas autenticadas.

Por esa razón, la latencia pública observada no se atribuye a Supabase sin evidencia adicional.

## Entorno de prueba

- **Marca de tiempo:** 2026-08-01, de 02:02:20 a 02:06:55 UTC.
- **URL de producción:** `https://finance-tracker-chi-self.vercel.app/`.
- **Modo de autenticación:** no autenticado; no se enviaron credenciales ni cookies de sesión.
- **Muestras:** una solicitud inicial independiente y 20 muestras cálidas por cada una de nueve rutas.
- **Total:** 9 solicitudes iniciales y 180 cálidas; 189 solicitudes secuenciales.
- **Intervalo:** al menos 1000 ms entre solicitudes cálidas.
- **Timeout:** 15 segundos por solicitud.
- **Cliente:** `curl.exe`, siguiendo redirecciones y registrando tiempos de red y HTTP.
- **Origen de prueba:** estación de trabajo local; ubicación exacta del origen no determinada.
- **Revisión Git local:** `b580446` (`feat: add slow queries documentation and optimize database queries`).
- **Despliegue:** no fue posible confirmar desde fuera que producción correspondiera exactamente a esa revisión.

Los encabezados observados incluyeron un identificador compuesto `X-Vercel-Id` con segmentos `iad1::pdx1::...` en respuestas de páginas y `iad1::...` en la respuesta directa del health check. Esto sugiere tránsito por infraestructura de Vercel, pero no permite confirmar región de ejecución, cold start ni causa de latencia sin Runtime Logs.

## Revisión de `SLOW_QUERIES.md`

`SLOW_QUERIES.md` se trata como evidencia diagnóstica histórica, no como fuente automática del estado actual. El archivo contiene consultas de catálogo de PostgreSQL, pero no contiene métricas que demuestren lentitud actual.

| Operación documentada                                            | Ubicación actual en código                          | Métrica documentada                      | Estado actual                                                                                            | Nivel de evidencia                                                            | Riesgo                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Inventario de extensiones mediante `pg_available_extensions`     | No encontrada en `src/` ni en scripts de aplicación | Ninguna: sin latencia, llamadas ni filas | No está presente en el código actual; parece una consulta de herramienta administrativa                  | No longer present in current code / Documented but not independently verified | Bajo para la aplicación; indeterminado para Supabase Studio |
| Catálogo de zonas horarias mediante `pg_timezone_names`          | No encontrada en el código actual                   | Ninguna                                  | No está presente en el código actual; no corresponde a un flujo del MVP                                  | No longer present in current code / Documented but not independently verified | Bajo para la aplicación                                     |
| CTE de catálogo para tablas, columnas, relaciones, tamaños y RLS | No encontrada en el código actual                   | Ninguna                                  | La anotación del documento apunta a dashboard/administración; no a una ruta funcional de Finance Tracker | No longer present in current code / Requires Supabase observability access    | Indeterminado fuera de la aplicación                        |

## Hallazgos de documentación

### Confirmado por el código actual

- Ninguna de las tres consultas textuales de `SLOW_QUERIES.md` está presente en la aplicación actual.
- Las consultas de negocio usan Drizzle y el esquema definido en `src/lib/db/schema.ts`; no usan los catálogos PostgreSQL documentados como parte de las rutas.
- Las páginas protegidas actuales validan al usuario mediante `requireCurrentUser`.
- Los grupos independientes de lectura ya utilizan `Promise.all`; no se confirmó que la navegación lenta sea causada por una cadena completamente secuencial.

### Confirmado por medición de producción

- Las nueve rutas medidas respondieron en todas las muestras.
- No hubo errores, timeouts ni respuestas finales `5xx`.
- Las seis rutas financieras protegidas redirigieron a `/login` sin sesión.
- `/api/health` rechazó acceso anónimo con `401`.
- No se observó contenido financiero protegido en las respuestas anónimas.
- Los p95 de las rutas públicas o redirigidas fueron inferiores a 560 ms durante esta ventana.

### Documentado pero no verificado independientemente

- La clasificación de las consultas de catálogo como “lentas”.
- La procedencia exacta de las consultas; su forma sugiere Supabase Studio, pero falta un identificador de fuente.
- El beneficio real de `UNION ALL` y de calcular una sola vez el tamaño de relaciones dentro de la tercera consulta.
- Cualquier relación entre esas consultas y la latencia percibida al navegar por la aplicación autenticada.

### Obsoleto o ausente del código actual

#### Inventario de extensiones

- Consulta metadatos de extensiones disponibles e instaladas.
- No existe una ruta o workflow de Finance Tracker que la ejecute en el código actual.
- No requiere ni refleja las tablas definidas en `src/lib/db/schema.ts`.
- Clasificación: **No longer present in current code** y **Documented but not independently verified**.

#### Zonas horarias de PostgreSQL

- Enumera el catálogo `pg_timezone_names`.
- No se encontró en componentes, Server Actions, Route Handlers, capa de datos ni scripts del proyecto.
- No usa columnas ni relaciones del esquema Drizzle del proyecto.
- Clasificación: **No longer present in current code** y **Documented but not independently verified**.

#### Catálogo de tablas, columnas, relaciones, tamaños y RLS

- Inspecciona catálogos `pg_catalog` y metadatos de relaciones, columnas, restricciones, tamaños y políticas RLS.
- El texto del documento la relaciona con un dashboard administrativo; por su forma es compatible con una consulta de Supabase Studio o herramienta semejante, no con una página de negocio.
- No se encontró una función actual que la ejecute.
- La propia consulta contiene optimizaciones internas documentadas: uso de `UNION ALL` y cálculo del tamaño de relación una sola vez. El archivo no demuestra el efecto de esas decisiones.
- Clasificación: **No longer present in current code**, **Documented but not independently verified** y **Requires Supabase observability access**.

### Contradicciones o información faltante

- No se documentan latencia, frecuencia, filas procesadas, fecha de captura, entorno, usuario, fuente exacta o plan de ejecución para ninguna consulta.
- No se registra una causa sospechada sustentada por métricas.
- No hay propuestas aplicables de índices del esquema de negocio, reescrituras de consultas de Finance Tracker, caché, paginación o cambios de conexión.
- El nombre `SLOW_QUERIES.md` puede sugerir problemas confirmados de la aplicación, aunque su contenido no aporta una asociación comprobada con rutas actuales.
- La documentación es incompleta para decidir si la causa es ejecución SQL, índices faltantes, exceso de filas, consultas secuenciales, agotamiento del pool, redirecciones de autenticación, cold starts o procesamiento de aplicación.
- Con la evidencia disponible, la clasificación causal correcta es **insufficient evidence**. Validar tiempos SQL requiere observabilidad de Supabase, prueba autenticada o un plan de ejecución autorizado; no se ejecutará `EXPLAIN ANALYZE` en esta fase.

## Resultados de rutas en producción

Todos los percentiles y extremos siguientes corresponden a las 20 muestras cálidas secuenciales de cada ruta. Los tiempos están expresados en milisegundos.

| Ruta                | Comportamiento esperado        | Estado final | URL final     | Redirecciones |   Mín. |    p50 |    p90 |    p95 |   Máx. | Errores | Timeouts |
| ------------------- | ------------------------------ | ------------ | ------------- | ------------: | -----: | -----: | -----: | -----: | -----: | ------: | -------: |
| `/`                 | Redirigir al login sin sesión  | 200          | `/login`      |             1 | 397.44 | 444.50 | 471.89 | 499.99 | 505.72 |    0/20 |     0/20 |
| `/login`            | Renderizar formulario público  | 200          | `/login`      |             0 | 327.67 | 343.73 | 368.72 | 382.34 | 611.11 |    0/20 |     0/20 |
| `/dashboard`        | Proteger y redirigir al login  | 200          | `/login`      |             1 | 411.71 | 446.89 | 508.60 | 510.29 | 524.41 |    0/20 |     0/20 |
| `/transactions`     | Proteger y redirigir al login  | 200          | `/login`      |             1 | 404.91 | 441.96 | 481.16 | 485.95 | 621.55 |    0/20 |     0/20 |
| `/transactions/new` | Proteger y redirigir al login  | 200          | `/login`      |             1 | 404.88 | 434.49 | 465.91 | 467.67 | 478.42 |    0/20 |     0/20 |
| `/categories`       | Proteger y redirigir al login  | 200          | `/login`      |             1 | 401.06 | 436.54 | 473.34 | 494.69 | 667.10 |    0/20 |     0/20 |
| `/rules`            | Proteger y redirigir al login  | 200          | `/login`      |             1 | 400.76 | 431.38 | 486.23 | 503.15 | 611.92 |    0/20 |     0/20 |
| `/settings`         | Proteger y redirigir al login  | 200          | `/login`      |             1 | 412.91 | 439.92 | 505.04 | 558.20 | 626.37 |    0/20 |     0/20 |
| `/api/health`       | Rechazar acceso no autenticado | 401          | `/api/health` |             0 | 236.17 | 253.82 | 304.13 | 318.15 | 322.03 |    0/20 |     0/20 |

La tasa de error global de las muestras cálidas fue 0% y la tasa de timeout fue 0%. En rutas protegidas, el `200` corresponde a la respuesta final de `/login` después de seguir una redirección; no significa que la página protegida se haya renderizado para el usuario anónimo.

No se observaron marcadores de dashboard, transacciones, categorías, reglas, configuración ni otros datos financieros en las respuestas obtenidas sin sesión.

## Solicitud inicial por ruta

La solicitud inicial se mantuvo separada de las muestras cálidas. Los tiempos de DNS, conexión y TLS son hitos acumulados que entrega `curl.exe` desde el inicio; no deben sumarse entre sí.

| Ruta                |   DNS | Conexión TCP |    TLS |   TTFB |  Total | Tamaño final |
| ------------------- | ----: | -----------: | -----: | -----: | -----: | -----------: |
| `/`                 | 82.20 |        88.78 | 185.24 | 688.38 | 696.04 |     35,394 B |
| `/login`            | 12.61 |        57.95 | 153.86 | 533.79 | 549.46 |     35,394 B |
| `/dashboard`        | 17.01 |        79.68 | 157.49 | 431.42 | 437.78 |     35,394 B |
| `/transactions`     | 15.99 |        54.25 | 147.23 | 423.94 | 424.95 |     35,394 B |
| `/transactions/new` | 18.26 |        60.62 | 152.83 | 424.34 | 425.74 |     35,394 B |
| `/categories`       | 31.84 |        72.12 | 169.84 | 532.82 | 540.74 |     35,394 B |
| `/rules`            | 19.20 |        58.57 | 147.03 | 406.15 | 411.90 |     35,394 B |
| `/settings`         | 46.63 |        96.33 | 198.59 | 477.30 | 482.27 |     35,394 B |
| `/api/health`       | 18.68 |        81.06 | 158.85 | 260.19 | 260.24 |         26 B |

La primera solicitud a `/` fue la más lenta del conjunto inicial, con 696.04 ms totales. Una única muestra no demuestra un cold start: se necesitan Runtime Logs de Vercel para confirmarlo.

## Desglose de latencia cálida

Los valores son medianas p50 en milisegundos. DNS, conexión y TLS vuelven a ser hitos acumulados de `curl.exe`.

| Ruta                |   DNS | Conexión |    TLS |   TTFB |  Total | Interpretación                                                                                          |
| ------------------- | ----: | -------: | -----: | -----: | -----: | ------------------------------------------------------------------------------------------------------- |
| `/`                 | 17.86 |    59.00 | 151.21 | 440.07 | 444.50 | La mayor parte ocurre antes del primer byte; incluye red, proxy, autenticación y render final del login |
| `/login`            | 18.89 |    62.01 | 157.77 | 336.64 | 343.73 | Referencia pública más directa; no ejecuta las consultas financieras privadas                           |
| `/dashboard`        | 18.51 |    59.68 | 156.54 | 442.17 | 446.89 | Mide protección y redirección al login, no el dashboard autenticado                                     |
| `/transactions`     | 19.20 |    60.50 | 153.09 | 436.05 | 441.96 | Mide protección y redirección, no la consulta mensual                                                   |
| `/transactions/new` | 18.21 |    62.18 | 154.57 | 427.92 | 434.49 | Mide protección y redirección, no la carga del formulario autenticado                                   |
| `/categories`       | 18.60 |    59.34 | 154.98 | 431.15 | 436.54 | Mide protección y redirección, no las consultas de categorías y presupuesto                             |
| `/rules`            | 18.78 |    60.40 | 155.73 | 425.22 | 431.38 | Mide protección y redirección, no la consulta de reglas                                                 |
| `/settings`         | 18.46 |    59.51 | 152.48 | 429.24 | 439.92 | Mide protección y redirección, no la consulta de configuración                                          |
| `/api/health`       | 19.60 |    62.72 | 155.21 | 253.73 | 253.82 | Rechazo `401`; no constituye una medición pública de disponibilidad de DB                               |

Los p95 de todas las rutas públicas o redirigidas quedaron por debajo de 560 ms en esta muestra. Los máximos aislados de `/login`, `/transactions`, `/categories`, `/rules` y `/settings` no bastan para identificar una causa.

## Correlación de consulta a ruta

| Consulta u operación                     | Ruta o workflow                                          | Función actual                                                 | ¿Se puede verificar el tiempo en producción sin autenticación? | Próximo paso de verificación                                                     |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Inventario de extensiones                | Supabase Studio o administración, no una ruta confirmada | No existe en la aplicación                                     | No                                                             | Revisar Query Performance o logs de Supabase con fuente y timestamp              |
| Catálogo de zonas horarias               | Herramienta administrativa, no una ruta confirmada       | No existe en la aplicación                                     | No                                                             | Confirmar fuente en Supabase; cerrar como irrelevante si no proviene del runtime |
| Catálogo de tablas/columnas/RLS          | Dashboard administrativo de base de datos                | No existe en la aplicación                                     | No                                                             | Correlacionar usuario, aplicación, frecuencia y duración en Supabase             |
| Identificación de usuario actual         | Todas las rutas protegidas                               | `requireCurrentUser` y flujo de autenticación asociado         | Solo se mide la redirección anónima, no el costo con sesión    | Instrumentar el tramo de autenticación y revisar Runtime Logs                    |
| Agregados del dashboard mensual          | `/dashboard`                                             | Funciones de consulta invocadas por la página del dashboard    | No                                                             | Prueba autenticada controlada y spans por grupo de consulta                      |
| Transacciones del mes                    | `/transactions` y resumen del dashboard                  | Funciones de lectura de transacciones del período              | No                                                             | Medir filas, bytes, duración y plan solo con aprobación                          |
| Categorías y asignaciones de presupuesto | `/categories` y `/dashboard`                             | Funciones de categorías/presupuesto invocadas por esas páginas | No                                                             | Medir consultas individuales y confirmar índices/filtros actuales                |
| Reglas de comercio                       | `/rules` y clasificación de transacción                  | Función de lectura de merchant rules                           | No                                                             | Prueba autenticada e inspección de volumen/ordenamiento                          |
| Configuración y métodos de pago          | `/settings` y formulario de transacción                  | Funciones de settings/payment methods                          | No                                                             | Medición autenticada por grupo y revisión de caché segura                        |

## Revisión del cliente de base de datos

- **Modo de pooler inferido:** transaction pooler de Supabase, según la configuración segura documentada con puerto 6543. Es una inferencia de documentación/configuración; no se imprimió ni verificó la URL completa en runtime.
- **TLS:** requerido por la validación de conexión.
- **Prepared statements:** `prepare: false`, apropiado para el transaction pooler.
- **Máximo de conexiones:** `max: 4` por instancia de runtime.
- **Timeout de conexión:** `connect_timeout: 10` segundos.
- **Timeout inactivo:** `idle_timeout: 300` segundos.
- **Timeout de consulta/sentencia/bloqueo:** no existe configuración explícita de `query_timeout`, `statement_timeout` o `lock_timeout`.
- **Singleton:** en desarrollo se guarda el cliente en `globalThis.__financeTrackerDbClient` para evitar duplicados durante hot reload. En producción existe un singleton de módulo por instancia, no un singleton global entre instancias de Vercel.
- **Riesgo de agotamiento:** cada instancia puede abrir hasta cuatro conexiones; el total crece con el escalamiento de Vercel. No se confirmó agotamiento. Para evaluarlo se necesitan métricas de Supabase sobre conexiones activas, esperas, rechazos y límites del pooler.
- **Identificación de cliente:** no se configura `application_name`; esto dificulta distinguir tráfico del runtime frente a herramientas administrativas en PostgreSQL.
- **Riesgo de secretos:** `DATABASE_URL` se mantiene en código de servidor y los logs estructurados clasifican/sanean errores. No se encontró exposición deliberada al cliente. Debe mantenerse prohibido imprimir la URL completa o errores nativos con credenciales.

No se recomienda aumentar `max`, reducir timeouts o cambiar el pooler sin medir primero concurrencia real y capacidad disponible. Un valor mayor por instancia puede empeorar el agotamiento global.

## Revisión de confiabilidad de Next.js

### Fronteras de carga y error

- Existe `src/app/loading.tsx` como frontera de carga en el nivel raíz.
- Existe `src/app/error.tsx` como frontera de error con capacidad de reintento mediante `reset`.
- No se encontraron fronteras `loading.tsx` o `error.tsx` específicas para `dashboard`, `transactions`, `categories`, `rules` o `settings`.
- La frontera raíz evita una pantalla vacía, pero un único grupo lento puede mantener un skeleton amplio y ocultar qué dependencia está esperando.
- Agregar fronteras segmentadas o Suspense más fino es una opción a evaluar en fase 3; no sustituye la corrección de consultas lentas o sin límite.

### Esperas y timeouts

- El timeout de conexión cubre el establecimiento de la conexión, no la duración de una consulta ya iniciada ni una espera por bloqueo.
- No se encontraron `AbortSignal`, `Promise.race` o límites equivalentes alrededor de lecturas de base de datos.
- Riesgo: una consulta o bloqueo que no termina puede mantener el estado de carga hasta que la plataforma interrumpa la función.
- Estado de evidencia: **Confirmed by current code** para la ausencia de timeout explícito; **Requires authenticated route testing** y **Requires Supabase or Vercel observability access** para su impacto.

### Consultas secuenciales y paralelas

- `getDashboardData` usa `Promise.all` para `budgetCategoryRows` y `transactionRows`.
- `getTransactionFormOptions` usa `Promise.all` para categorías, métodos de pago y settings.
- `getCategoryManagementData` agrupa categorías y asignaciones de presupuesto.
- `getRulesManagementData` agrupa reglas y categorías.
- `getSettingsData` agrupa settings y métodos de pago.
- `getTransactions` y `getTransactionById` son lecturas individuales; las páginas de listado y edición combinan datos independientes con `Promise.all` donde corresponde.
- `requireCurrentUser` ocurre antes de las consultas de cada función protegida. Si una página invoca varias funciones que también lo llaman, puede existir trabajo de autenticación repetido; debe mapearse en fase 3 antes de afirmar duplicación.
- No se confirmó una cadena secuencial dominante. La paralelización actual reduce espera, pero puede elevar conexiones simultáneas por solicitud y debe correlacionarse con el límite de cuatro conexiones.

### Volumen, límites y paginación

- `getDashboardData` consulta las transacciones del mes ordenadas y después obtiene las cinco más recientes con `transactionData.slice(0, 5)`. La base puede transferir todas las filas mensuales aunque solo cinco se muestren en esa sección; las mismas filas también participan en cálculos del resumen.
- `getTransactions` aplica filtros y orden, pero no tiene `limit` ni paginación. Un mes con muchas transacciones aumenta filas, bytes, memoria y tiempo de render.
- Lecturas de categorías, reglas y métodos de pago tampoco están paginadas. Es razonable para el MVP si los conjuntos permanecen pequeños, pero falta un límite operativo documentado.
- `appSettings` y los detalles por ID sí usan `limit(1)`.
- No se debe añadir un índice solo por intuición. Primero se deben medir cardinalidad, filtros, ordenamiento y, con aprobación, revisar un plan seguro.

### Errores y riesgo de carga infinita

- `withDatabaseDiagnostics` registra operaciones fallidas y vuelve a lanzar el error; no lo oculta.
- Las Server Actions de transacciones capturan el error después del diagnóstico y devuelven mensajes seguros al usuario, evitando filtrar detalles.
- El health check devuelve `503 degraded` ante fallo de readiness; el diagnóstico interno registra el fallo.
- El riesgo principal de skeleton indefinido no es una excepción tragada confirmada, sino una promesa de DB/autenticación sin límite de duración.
- El `incidentId` existe en logging y health, pero no se confirmó que las pantallas de error lo muestren al usuario para facilitar soporte.

### Frontera cliente/servidor

- La capa de base de datos y autenticación permanece del lado servidor.
- Los archivos de Server Actions actuales exportan funciones asíncronas; no se confirmó en esta revisión la antigua violación de exportar un objeto desde un archivo con `"use server"`.
- No se observó consumo directo de la base de datos o secretos desde componentes cliente.
- Las lecturas se realizan mediante Server Components/capa de consultas y las mutaciones mediante Server Actions, acorde con las reglas del proyecto.

### Observabilidad existente

- `withDatabaseDiagnostics` mide grupos funcionales como `dashboard.load`, `transactions.list`, `management.categories.load`, `management.rules.load` y `management.settings.load`.
- El umbral predeterminado de operación lenta es 1500 ms.
- Los logs son estructurados, clasifican errores y evitan incluir el error nativo completo.
- La granularidad actual es por grupo; una operación lenta dentro de un `Promise.all` no queda identificada individualmente.
- `requireCurrentUser` no está instrumentado como tramo separado.
- No existe un identificador compartido confirmado que una navegación, autenticación, consulta, respuesta y deployment.
- No se encontraron dependencias configuradas de Sentry, OpenTelemetry o Vercel Speed Insights.
- El health check combina autorización y readiness de base de datos, de modo que un monitor público solo observa `401` y no puede distinguir “proceso vivo” de “DB lista”.

## Hallazgos priorizados

### Críticos

No se confirmó ningún hallazgo crítico en las fases 0–2.

### Altos

No se confirmó un hallazgo alto por medición pública. El candidato de mayor riesgo es la ausencia de timeout por consulta, sentencia o bloqueo:

- **Evidencia:** ausencia confirmada en el código actual.
- **Impacto:** no verificado; requiere una ruta autenticada, Runtime Logs y/o observabilidad de Supabase.
- **Posible efecto:** función ocupada, skeleton prolongado y consumo de conexiones mientras una promesa espera.
- **Clasificación:** **Confirmed by current code** para la configuración y **Requires authenticated route testing** / **Requires Supabase or Vercel observability access** para el impacto.

### Medios

1. **La latencia autenticada sigue sin medirse.** La experiencia reportada ocurre detrás del login, mientras que la auditoría externa solo midió redirecciones. Clasificación: **Requires authenticated route testing**.
2. **Lecturas mensuales sin paginación o límite.** `getTransactions` devuelve todas las coincidencias y el dashboard obtiene todas las transacciones del mes antes de recortar cinco para la lista reciente. Clasificación: **Confirmed by current code**; impacto requiere medición autenticada.
3. **Observabilidad demasiado agregada.** Los grupos actuales no distinguen cuál consulta interna domina un `Promise.all`. Clasificación: **Confirmed by current code**.
4. **Autenticación sin tramo medido.** No se puede separar costo de sesión/usuario del costo de datos. Clasificación: **Confirmed by current code**.
5. **Health check no apto para monitoreo público.** Combina autorización y DB readiness; externamente devuelve `401`. Clasificación: **Confirmed by production measurement** y **Confirmed by current code**.
6. **`SLOW_QUERIES.md` carece de trazabilidad.** Sus consultas no aparecen en la aplicación y no incluye métricas. Clasificación: **No longer present in current code** / **Documented but not independently verified**.
7. **Una frontera de carga global tiene poca precisión diagnóstica.** Un grupo lento puede mantener un skeleton amplio. Clasificación: **Confirmed by current code**; efecto visual requiere prueba de navegador autenticada.

### Bajos

1. **Pool de cuatro conexiones por instancia sin métricas de capacidad.** No es un error por sí mismo; requiere métricas antes de ajustarse.
2. **Falta `application_name`.** Reduce la capacidad de separar tráfico de la aplicación en observabilidad PostgreSQL.
3. **Incident ID no confirmado en UI.** Puede dificultar que el usuario relacione un error visible con Runtime Logs.
4. **Variación aislada de tamaño/latencia en settings.** Una muestra no permite concluir regresión, caché defectuosa ni contenido variable.
5. **Ausencia de Web Vitals/browser tracing confirmado.** Limita el diagnóstico de navegación cliente, prefetch y render, pero no prueba un fallo.

## Próximos pasos recomendados

| Prioridad | Acción                                                                                          | Evidencia                                                           | Impacto esperado                                            | ¿Requiere aprobación?               |
| --------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| P0        | Ejecutar fase 3: auditoría estática de rutas, consultas, autenticación, loading/error y límites | El tiempo privado no puede inferirse desde redirecciones            | Localizar trabajo repetido y diseñar instrumentación mínima | Sí, como siguiente fase             |
| P0        | Correlacionar Vercel Runtime Logs con ruta, región, duración y deployment                       | Los encabezados externos no prueban cold start ni región de función | Separar plataforma, autenticación y aplicación              | Sí; requiere acceso de solo lectura |
| P0        | Revisar observabilidad de Supabase por la misma ventana                                         | `SLOW_QUERIES.md` no contiene métricas y el pool no fue medido      | Confirmar o descartar DB, bloqueos y pool                   | Sí; solo lectura                    |
| P1        | Instrumentar auth y cada consulta interna con un ID compartido                                  | Los logs actuales miden grupos agregados                            | Atribución precisa por request sin exponer datos            | Sí; implica cambio de código        |
| P1        | Diseñar `statement/query/lock timeout` compatible con el pooler                                 | Ausencia confirmada de límites de duración                          | Evitar esperas indefinidas y liberar recursos               | Sí; cambio de conexión/runtime      |
| P1        | Paginar `getTransactions` y limitar/reescribir últimas transacciones                            | Lecturas sin límite confirmadas                                     | Menos filas, bytes, memoria y tiempo de render              | Sí; cambia comportamiento/consulta  |
| P1        | Evaluar agregación SQL del dashboard                                                            | El dashboard trae filas mensuales para calcular y mostrar           | Menos transferencia y procesamiento de aplicación           | Sí; requiere pruebas financieras    |
| P2        | Separar liveness pública de readiness protegida                                                 | Health actual devuelve `401` al monitor anónimo                     | Monitoreo operativo útil sin exponer DB                     | Sí; cambio de contrato              |
| P2        | Actualizar `SLOW_QUERIES.md` con fuente, métricas y estado                                      | Documento actual puede inducir causalidad incorrecta                | Evidencia diagnóstica trazable                              | Sí; documentación                   |
| P2        | Evaluar fronteras de loading/error por segmento                                                 | Solo existe frontera raíz                                           | Mejor feedback y aislamiento visual                         | Sí; UI                              |
| P3        | Evaluar `application_name` y visualización de incident ID                                       | Correlación limitada                                                | Mejor investigación de incidentes                           | Sí; configuración/UI                |

No se recomiendan todavía índices, más conexiones, caché general ni cambio de región. Cada opción puede ayudar en un caso concreto, pero actualmente carece de evidencia suficiente y puede introducir consistencia obsoleta, mayor presión de conexiones o complejidad.

## No probado

- Render de rutas autenticadas.
- Latencia de consultas autenticadas a la base de datos.
- Login real, refresh de sesión y expiración de sesión.
- Métricas del pooler y conexiones de Supabase.
- `pg_stat_statements`.
- Planes de ejecución y `EXPLAIN ANALYZE`.
- Vercel Runtime Logs, cold starts y duración de funciones.
- SHA o identificador exacto del deployment medido.
- Mutaciones autenticadas.
- Comportamiento con carga concurrente.
- Bloqueos, deadlocks, cancelación de consultas y fallos de desconexión.
- Web Vitals, navegación con navegador, prefetch y tiempo de hidratación.
- Efectividad real del prefetch de Next.js.
- Comportamiento de caché de datos autenticados.
- Cardinalidad real de transacciones, categorías, reglas y métodos de pago.
- Rendimiento desde otras regiones o proveedores de red.
- Disponibilidad de Supabase durante la ventana, salvo lo que pueda inferirse de respuestas públicas, que no es suficiente.

## Plan de trabajo por fases

Cada fase debe producir evidencia revisable antes de autorizar la siguiente. Una fase de análisis no autoriza automáticamente cambios de código, infraestructura o base de datos.

### Fase 0: contexto y línea base documental

**Estado:** completada.

**Objetivo:** entender el MVP, esquema, configuración, restricciones de seguridad y evidencia histórica antes de medir o proponer cambios.

**Actividades realizadas:**

- [x] Leer instrucciones y documentos obligatorios.
- [x] Localizar y revisar `SLOW_QUERIES.md`.
- [x] Inspeccionar `package.json`, Drizzle, cliente PostgreSQL y esquema.
- [x] Confirmar revisión Git local.
- [x] Separar hechos actuales de hipótesis y documentos históricos.
- [x] Confirmar las restricciones: sin autenticación, sin SQL de producción, sin cambios y sin concurrencia.

**Entregable:** inventario de configuración y mapa inicial de riesgos.

**Criterio de salida cumplido:** el alcance y la evidencia quedaron definidos sin exponer secretos.

### Fase 1: línea base HTTP pública

**Estado:** completada.

**Objetivo:** comprobar disponibilidad, protección y latencia externa reproducible.

**Método realizado:**

- [x] Una solicitud inicial independiente por ruta.
- [x] Veinte muestras cálidas secuenciales por ruta.
- [x] Intervalo mínimo de 1000 ms.
- [x] Timeout duro de 15 segundos.
- [x] `curl.exe`, siguiendo redirecciones.
- [x] Registro de status, URL final, redirecciones, DNS, TCP, TLS, TTFB, total, tamaño, p50, p90, p95, mínimo, máximo, errores y timeouts.
- [x] Verificación de ausencia de contenido financiero protegido.

**Resultado:** 189/189 respuestas completadas, cero errores, cero timeouts y comportamiento de autenticación correcto dentro del alcance anónimo.

**Criterio de salida cumplido:** existe una línea base pública reproducible, conservada en las tablas de este documento.

### Fase 2: correlación estática inicial

**Estado:** completada.

**Objetivo:** relacionar la evidencia HTTP con rutas Next.js, funciones de consulta, esquema Drizzle, cliente DB, loading/error y observabilidad.

**Actividades realizadas:**

- [x] Buscar las tres consultas documentadas en el código actual.
- [x] Confirmar que no corresponden a funciones de la aplicación.
- [x] Mapear `getDashboardData`, `getTransactions`, `getTransactionFormOptions`, `getCategoryManagementData`, `getRulesManagementData` y `getSettingsData`.
- [x] Revisar filtros, ordenamiento, `limit`, `slice` y `Promise.all`.
- [x] Revisar pooler, TLS, `prepare`, conexiones, timeouts y singleton.
- [x] Revisar loading, error boundaries y diagnósticos estructurados.
- [x] Clasificar cada conclusión por nivel de evidencia.

**Resultado:** no existe evidencia para atribuir la latencia percibida a las consultas de catálogo de `SLOW_QUERIES.md`; se identificaron límites reales de medición y candidatos concretos para fases posteriores.

**Criterio de salida cumplido:** los riesgos están priorizados y ninguna hipótesis histórica se presenta como lentitud actual confirmada.

### Fase 3: auditoría estática profunda de Next.js

**Estado:** siguiente fase recomendada; requiere aprobación.

**Objetivo:** crear un mapa exacto de la ruta crítica autenticada sin ejecutar login ni cambiar archivos.

**Alcance propuesto:**

- [ ] Trazar por ruta: page/layout, `requireCurrentUser`, funciones de datos, cálculos, serialización y UI.
- [ ] Contar cuántas veces puede ejecutarse autenticación por navegación.
- [ ] Identificar llamadas duplicadas entre layout, page y funciones internas.
- [ ] Distinguir dependencias obligatorias de datos secundarios que puedan usar Suspense independiente.
- [ ] Revisar si el prefetch del menú está habilitado, deshabilitado o bloqueado por componentes cliente.
- [ ] Revisar `dynamic`, caché, revalidación y uso de APIs dinámicas como `cookies()`.
- [ ] Confirmar si cada `Promise.all` es seguro con el pool máximo de cuatro conexiones.
- [ ] Mapear consultas sin límite y cálculos que podrían moverse a SQL conservando reglas financieras.
- [ ] Revisar que los errores lleguen a una frontera útil y que no exista un estado de carga sin salida.
- [ ] Proponer instrumentación mínima, todavía sin implementarla.

**Entregable:** tabla por ruta con secuencia, operaciones DB, límites, riesgos, evidencia y cambio mínimo recomendado.

**Criterio de salida:** una hipótesis concreta por ruta que pueda confirmarse en logs, sin basarse únicamente en percepción.

**Riesgos:** confundir tiempo de compilación local con producción, asumir que prefetch equivale a datos precargados o recomendar caché de datos por usuario sin revisar aislamiento.

### Fase 4: correlación de Vercel

**Estado:** pendiente de acceso de solo lectura y aprobación.

**Objetivo:** separar tiempo de red, middleware/proxy, autenticación, ejecución de función y render.

**Datos a capturar:**

- [ ] Deployment ID y commit SHA.
- [ ] Región efectiva de ejecución.
- [ ] Duración de función por ruta.
- [ ] Cold start, si Vercel lo expone.
- [ ] Status, redirecciones y errores.
- [ ] Invocaciones lentas por timestamp.
- [ ] Logs `database.operation.slow` y `database.operation.failed`.
- [ ] Incidentes correlacionados por un identificador seguro.

**Método seguro:**

- Usar la misma ventana o una nueva ventana controlada.
- No copiar cookies, correos, datos financieros ni variables de entorno al informe.
- Registrar solo identificadores, operación, duración, región y clasificación saneada.

**Criterio de salida:** distinguir si la demora dominante ocurre antes de la función, dentro del runtime, en auth, en DB o en render.

**Bloqueador actual:** no se proporcionó acceso a Runtime Logs ni al identificador exacto del deployment.

### Fase 5: observabilidad de Supabase

**Estado:** pendiente de acceso de solo lectura y aprobación.

**Objetivo:** confirmar o descartar ejecución SQL, bloqueos, cardinalidad y presión de conexiones.

**Datos a revisar sin ejecutar SQL de producción:**

- [ ] Query Performance / `pg_stat_statements` disponible desde la interfaz autorizada.
- [ ] Llamadas, tiempo total, tiempo medio, filas y ventana temporal.
- [ ] Conexiones activas, límite, esperas y rechazos del pooler.
- [ ] Bloqueos o sesiones con espera.
- [ ] Usuario/`application_name` cuando exista.
- [ ] Diferencia entre consultas del runtime y Supabase Studio.
- [ ] Presencia real de las consultas de `SLOW_QUERIES.md`.

**Clasificación esperada:**

- Si las consultas de catálogo solo provienen de Studio, cerrar su relación con las rutas como **No longer present in current code**.
- Si una consulta de negocio domina la ventana, marcarla **Confirmed by Supabase observability**, todavía sin asumir que falta un índice.
- Si el pool está cerca del límite, correlacionar con invocaciones Vercel antes de cambiar `max`.
- Si hace falta un plan de ejecución, registrar **Requires a database execution plan** y abrir una aprobación separada. No ejecutar `EXPLAIN ANALYZE` automáticamente.

**Criterio de salida:** disponer de una causa respaldada por métricas o cerrar explícitamente la hipótesis de DB por falta de correlación.

### Fase 6: diseño de límites de tiempo y cancelación

**Estado:** pendiente; no autoriza cambios de conexión.

**Objetivo:** evitar esperas sin límite sin convertir una demora transitoria en pérdida de operaciones válidas.

**Decisiones a preparar:**

- [ ] Elegir dónde aplicar `statement_timeout`, `query_timeout` y/o `lock_timeout` según compatibilidad con postgres.js y transaction pooler.
- [ ] Separar timeout de conexión, consulta, bloqueo y duración máxima de Server Action.
- [ ] Definir valores por tipo de operación; una lectura de dashboard y una escritura financiera no deben cancelarse ciegamente con la misma política.
- [ ] Confirmar que una cancelación no deja una transacción en estado ambiguo.
- [ ] Registrar error saneado, operación, duración e incident ID.
- [ ] Diseñar mensaje y reintento seguro para UI.
- [ ] Añadir pruebas unitarias de clasificación y pruebas de integración donde sea viable.

**Trade-off:** valores demasiado altos no protegen la experiencia; valores demasiado bajos generan fallos falsos y reintentos. El diseño debe usar datos de fases 4 y 5.

**Criterio de salida:** propuesta revisable con valores, alcance, fallback, pruebas y rollback. La implementación requiere una aprobación nueva.

### Fase 7: acotar lecturas y agregaciones

**Estado:** pendiente de evidencia autenticada.

**Objetivo:** reducir filas transferidas y procesamiento sin cambiar reglas financieras.

**Candidatos:**

1. **Listado de transacciones**
   - [ ] Definir tamaño de página y navegación.
   - [ ] Mantener orden estable por fecha y `createdAt`, agregando desempate por ID si hace falta.
   - [ ] Preservar filtros de mes, categoría, método y tipo.
   - [ ] Medir filas, tamaño, TTFB y tiempo de render antes/después.

2. **Dashboard**
   - [ ] Separar las cinco transacciones recientes de los agregados mensuales.
   - [ ] Evaluar agregaciones SQL por categoría/tipo en lugar de transferir todas las filas.
   - [ ] Preservar exactamente conversión, redondeo, solo `expense` consumiendo presupuesto y umbrales 70/80/100.
   - [ ] Añadir pruebas de regresión para totales, porcentajes y alerta antes del día 20.

3. **Catálogos de administración**
   - [ ] Documentar un volumen esperado para categorías, reglas y métodos.
   - [ ] Añadir límite/paginación solo si métricas o crecimiento lo justifican.

4. **Índices**
   - [ ] Comparar filtros y orden con índices actuales del esquema.
   - [ ] Solicitar plan de ejecución antes de proponer un índice para una consulta realmente lenta.
   - [ ] Crear migración revisable únicamente tras aprobación; no cambiar esquema de forma directa.

**Criterio de salida:** misma exactitud financiera y mejoría medible en datos transferidos o latencia, sin regresión funcional.

### Fase 8: contrato de salud y readiness

**Estado:** pendiente.

**Objetivo:** permitir monitoreo sin exponer el estado interno ni abrir una ruta financiera.

**Diseño a evaluar:**

- [ ] Liveness pública mínima que confirme que el proceso responde, sin consultar DB y sin detalles.
- [ ] Readiness protegida que compruebe DB con timeout corto y respuesta saneada.
- [ ] `Cache-Control: no-store`.
- [ ] Status consistentes: `200` vivo/listo, `503` degradado, `401` solo donde la autenticación sea parte del contrato.
- [ ] Rate limiting o protección de plataforma si la ruta pudiera abusarse.
- [ ] No incluir host, usuario, pool, SQL, stack trace o URL de conexión.

**Trade-off:** hacer pública la prueba completa de DB facilita monitoreo, pero aumenta superficie y dependencia; por eso se recomienda separar liveness de readiness.

**Criterio de salida:** contrato documentado, seguro y compatible con el monitor elegido.

### Fase 9: medición autenticada controlada

**Estado:** pendiente de aprobación explícita y cuenta desechable.

**Objetivo:** medir las rutas privadas que representan la experiencia real.

**Precondiciones:**

- [ ] Cuenta de prueba separada o autorización explícita para una cuenta controlada.
- [ ] Datos no sensibles y volumen conocido.
- [ ] Método seguro para la sesión; nunca guardar credenciales o cookies en el repositorio, logs o informe.
- [ ] Confirmación del deployment y ventana de observabilidad.
- [ ] Prohibición de mutaciones; solo navegación GET/lectura.

**Método:**

- [ ] Una navegación inicial separada por ruta.
- [ ] Veinte muestras cálidas secuenciales por ruta, al menos 500 ms entre solicitudes y timeout de 15 segundos, salvo ajuste aprobado.
- [ ] No ejecutar solicitudes concurrentes ni load test.
- [ ] Medir redirect, status, final URL, TTFB, total, tamaño, errores y timeouts.
- [ ] Correlacionar cada muestra con Vercel y Supabase.
- [ ] Verificar que no se registre contenido financiero.

**Rutas:** `/dashboard`, `/transactions`, `/transactions/new`, `/categories`, `/rules` y `/settings`.

**Criterio de salida:** distribución de latencia autenticada y desglose por auth, DB y aplicación con suficiente evidencia para elegir un cambio.

### Fase 10: implementación, validación y cierre

**Estado:** pendiente; cada cambio necesita alcance aprobado.

**Secuencia:**

- [ ] Seleccionar un solo hallazgo causal.
- [ ] Registrar línea base y criterio de éxito.
- [ ] Implementar el cambio mínimo.
- [ ] Añadir o actualizar pruebas relevantes.
- [ ] Ejecutar validación específica, luego `pnpm test`, `pnpm lint` y `pnpm build` cuando corresponda.
- [ ] Revisar diff y confirmar ausencia de secretos.
- [ ] Desplegar de forma controlada.
- [ ] Repetir exactamente la medición antes/después.
- [ ] Revisar errores, timeouts, exactitud financiera y conexiones.
- [ ] Actualizar este documento, `PROJECT_CONTEXT.md` y, si aplica, `SLOW_QUERIES.md`.
- [ ] Definir rollback antes de cambios de conexión, esquema o consultas críticas.

**Criterio de éxito general:**

- Sin aumento de errores o timeouts.
- Sin exposición de datos o debilitamiento de autenticación.
- Sin regresiones de cálculos financieros.
- Mejora reproducible en la métrica objetivo, no solo en una muestra.
- Hallazgo cerrado con evidencia o reclasificado con una razón documentada.

## Paquetes de cambio potenciales

Estos paquetes son alternativas de implementación posteriores, no cambios aprobados.

### Paquete A: atribución y observabilidad

- Medir `requireCurrentUser` por separado.
- Medir cada consulta interna en lugar de solo el grupo.
- Propagar un request/incident ID seguro entre logs.
- Incluir deployment y región cuando estén disponibles.
- Mostrar un incident ID al usuario solo en errores recuperables, sin detalles sensibles.

**Orden recomendado:** primero, porque reduce el riesgo de optimizar el componente equivocado.

### Paquete B: volumen y forma de consultas

- Paginar transacciones.
- Separar últimas cinco transacciones de agregados.
- Agregar en SQL solo cuando pruebas financieras garanticen equivalencia.
- Limitar catálogos únicamente con un contrato de UX claro.
- Evaluar índices después de métricas y plan de ejecución autorizado.

**Riesgo principal:** alterar totales, orden, filtros o reglas de presupuesto si se cambia demasiado a la vez.

### Paquete C: resiliencia de runtime y base de datos

- Diseñar timeouts de consulta/bloqueo.
- Revisar el pool máximo usando métricas reales.
- Evaluar `application_name`.
- Separar liveness y readiness.

**Riesgo principal:** cancelaciones prematuras o mayor agotamiento de conexiones por una configuración intuitiva pero no medida.

### Paquete D: experiencia de navegación

- Revisar prefetch real del menú.
- Añadir fronteras Suspense/loading específicas donde un dato secundario no deba bloquear todo.
- Mantener error boundaries recuperables.
- Conservar Server Components y datos sensibles del lado servidor.

**Riesgo principal:** ocultar una demora real detrás de skeletons más complejos sin mejorar el tiempo de datos.

## Matriz para determinar la causa

| Causa candidata                | Evidencia necesaria para confirmarla                                            | Estado actual                                                 |
| ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Ejecución lenta de consulta    | Tiempo SQL de una consulta de negocio correlacionado con la ruta                | Insufficient evidence; requiere Supabase y prueba autenticada |
| Índice faltante                | Consulta lenta confirmada y plan de ejecución que muestre scan/orden costoso    | Requires a database execution plan                            |
| Exceso de filas                | Cardinalidad/payload elevado y mejora al limitar/agregar                        | Lecturas sin límite confirmadas; impacto no verificado        |
| Consultas secuenciales         | Timeline que muestre dependencias independientes ejecutadas una después de otra | No confirmado; existen varios `Promise.all`                   |
| Agotamiento del pool           | Conexiones al límite, esperas o rechazos correlacionados con invocaciones       | Requires Supabase observability access                        |
| Redirecciones de autenticación | Cadena y tiempo de redirección medidos                                          | Confirmed by production measurement para usuario anónimo      |
| Cold start de Vercel           | Señal de cold start y duración de función en Runtime Logs                       | Requires Vercel observability access                          |
| Procesamiento de aplicación    | Runtime largo con DB rápida, medido por spans                                   | Insufficient evidence                                         |
| Autenticación                  | Tramo `auth()`/usuario lento dentro de una ruta con sesión                      | Requires authenticated route testing                          |

## Plantilla de medición antes y después

Completar una fila por cambio y conservar los datos brutos fuera del repositorio solo si no contienen secretos.

| Campo                | Antes | Después |
| -------------------- | ----- | ------- |
| Fecha/hora UTC       |       |         |
| Deployment/commit    |       |         |
| Ruta y modo de auth  |       |         |
| Región/origen        |       |         |
| Muestras e intervalo |       |         |
| Timeout              |       |         |
| Mínimo               |       |         |
| p50                  |       |         |
| p90                  |       |         |
| p95                  |       |         |
| Máximo               |       |         |
| Error rate           |       |         |
| Timeouts             |       |         |
| Filas/bytes DB       |       |         |
| Duración auth        |       |         |
| Duración DB          |       |         |
| Duración runtime     |       |         |
| Resultado funcional  |       |         |

## Registro de decisiones

| Fecha ISO  | Fase | Decisión                                                       | Evidencia                                        | Aprobado por              | Resultado/rollback       |
| ---------- | ---- | -------------------------------------------------------------- | ------------------------------------------------ | ------------------------- | ------------------------ |
| 2026-08-01 | 0–2  | No atribuir latencia pública a Supabase ni a `SLOW_QUERIES.md` | Consultas ausentes del código y medición anónima | Auditoría de solo lectura | Mantener como línea base |
| Pendiente  | 3    | Auditar estáticamente la ruta crítica autenticada              | Riesgos y huecos identificados                   | Pendiente                 | Pendiente                |

## Definición de evidencia

- **Confirmed by current code:** el comportamiento o ausencia puede verificarse en la revisión actual del repositorio.
- **Confirmed by production measurement:** fue observado en las solicitudes secuenciales documentadas.
- **Documented but not independently verified:** aparece en documentación, pero no tiene confirmación independiente.
- **No longer present in current code:** no existe una coincidencia o función actual que lo ejecute.
- **Requires Supabase or Vercel observability access:** necesita métricas internas de solo lectura.
- **Requires authenticated route testing:** no puede comprobarse detrás del login con tráfico anónimo.
- **Requires a database execution plan:** no puede concluirse que falte un índice sin un plan autorizado.

## Puerta de aprobación

La próxima fase exacta recomendada es la **Fase 3: auditoría estática profunda y de solo lectura de la ruta crítica autenticada en Next.js**. No requiere autenticarse ni modificar archivos, pero debe aprobarse antes de continuar.

Después de la fase 3, el orden recomendado es: **Fase 4 (Vercel Runtime Logs) → Fase 5 (observabilidad de Supabase) → seleccionar un único cambio medible de las fases 6–8 → Fase 9 autenticada solo con autorización explícita → Fase 10 de validación y cierre**.

No iniciar cambios de código, consultas, índices, pool, autenticación o infraestructura hasta que la fase correspondiente tenga evidencia suficiente y aprobación.
