# Plan por fases: categorías, presupuestos y motor de clasificación

## Resumen

Se agregarán únicamente estas siete categorías, sin renombrar, reemplazar ni desactivar categorías existentes:

| Categoría | Presupuesto predeterminado USD | Esencial |
|---|---:|:---:|
| Naza / salidas | 120 | No |
| Apolo | 60 | Sí |
| Hogar | 75 | Sí |
| Cuidado personal | 35 | No |
| Formación tecnológica | 25 | No |
| Desarrollo / infraestructura | 15 | No |
| Bancos / comisiones | 10 | Sí |

Los presupuestos serán plantillas editables, no valores sincronizados permanentemente. No crearán transacciones ni cabeceras presupuestarias.

Al terminar cada fase se detendrá el trabajo y se informarán archivos modificados, decisiones, migraciones, pruebas y riesgos. No se usará SonarQube.

## Fase 1: contrato de datos y migración expansiva

- Ampliar `transaction_type` con `refund`.
- Agregar a `transactions`:
  - `original_transaction_id`, nullable, FK autorreferenciada con eliminación restringida.
  - `is_essential_override`, boolean nullable, sin valor predeterminado.
- Semántica de esencialidad:
  - `null`: hereda `categories.is_essential`.
  - `true`: la transacción es esencial.
  - `false`: la transacción no es esencial.
- Centralizarla en una función reutilizable `resolveTransactionEssentiality`.
- Generalizar `merchant_rules` agregando:
  - `match_type`: `exact | contains`.
  - `include_terms`: `text[]`.
  - `exclude_terms`: `text[]`.
  - `transaction_type`.
  - `requires_review`.
  - `category_id` nullable.
- Conservar `pattern` como representación canónica única para mantener compatibilidad con la aplicación desplegada.
- Añadir restricciones:
  - Toda regla tiene al menos un término incluido.
  - Una regla de gasto requiere categoría.
  - Un reembolso requiere transacción original.
  - Los movimientos que no sean reembolsos no pueden usar `original_transaction_id`.
- Generar y revisar una migración nueva, sin ejecutarla.
- Backfill de las siete reglas actuales como reglas `contains`, tipo `expense`, sin revisión.

### Pruebas

- Esencialidad efectiva con `true`, `false` y `null`.
- Restricciones y tipos inferidos del esquema.
- Compatibilidad de los datos actuales con el backfill.

> **Punto de parada:** presentar migración propuesta, archivos, pruebas y riesgos. No tocar Supabase.

## Fase 2: categorías y asignación mensual idempotente

### Categorías

- Incorporar las siete categorías al seed para instalaciones nuevas.
- Cambiar el tratamiento de categorías iniciales para no sobrescribir presupuestos, esencialidad ni configuración editada manualmente al repetir el seed.
- Crear un script productivo dedicado; no usar el seed completo en producción.
- Insertar categorías con `onConflictDoNothing` por nombre.
- Si una categoría ya existe, conservar todos sus valores actuales.
- Recuperar sus IDs después de insertar o detectar las existentes.

### Mes actual

- Calcular el mes actual usando `America/Guatemala`, no UTC del servidor.
- Guardar los montos indicados como `categories.monthly_budget_usd` únicamente en la creación inicial.
- Consultar exclusivamente la cabecera cuyo `month` sea el primer día del mes actual.
- Si la cabecera no existe:
  - No crearla.
  - No crear asignaciones.
  - Finalizar correctamente.
- Si existe:
  - Consultar las asignaciones de las siete categorías para esa cabecera.
  - Insertar únicamente las combinaciones ausentes.
  - Usar el presupuesto predeterminado de cada categoría como monto inicial.
  - Usar `onConflictDoNothing` sobre la restricción única (`monthly_budget_id`, `category_id`) como protección adicional frente a repetición o carrera.
  - No usar `onConflictDoUpdate`.
- No consultar ni modificar cabeceras o asignaciones históricas.
- Una ejecución repetida no cambia categorías existentes, asignaciones existentes ni crea duplicados.
- El sobrante se calcula y muestra; nunca se persiste como movimiento.

La selección de asignaciones faltantes se centralizará en una función pura para probarla sin conectarse a Supabase.

### Pruebas obligatorias

1. Presupuesto actual inexistente: no genera asignaciones ni cabecera.
2. Presupuesto actual existente sin asignación: genera exactamente las siete asignaciones faltantes.
3. Asignación existente con monto diferente: conserva el monto manual.
4. Presupuestos históricos: permanecen sin modificaciones.
5. Ejecución repetida: no genera duplicados ni actualizaciones.
6. Presupuesto parcialmente configurado: inserta solo las combinaciones ausentes.
7. Categoría existente con presupuesto editado: no restaura el valor inicial.

> **Punto de parada:** presentar seed preparado, script idempotente, pruebas y riesgos. No ejecutar seed ni script contra Supabase.

## Fase 3: motor y administración de reglas

Implementar un matcher determinístico:

- Normalizar mayúsculas, espacios y acentos.
- `exact`: igualdad completa.
- `contains`: coincidencia parcial.
- Coincide cuando algún término incluido aplica y ningún término excluido aplica.
- Evaluar prioridad ascendente y desempatar por `pattern`.
- Ignorar reglas inactivas.
- No admitir regex ni añadir dependencias.

Ampliar `/rules` y sus Server Actions para editar:

- Tipo de coincidencia.
- Términos incluidos y excluidos.
- Categoría opcional.
- Tipo de movimiento.
- Prioridad.
- Revisión obligatoria.
- Estado activo.

### Reglas iniciales

| Prioridad | Términos | Resultado | Revisión |
|---:|---|---|:---:|
| 10 | la colonia | Supermercado / expense | No |
| 15 | tulum, mr seafood, floristeria, peluche, regalo | Naza / salidas / expense | No |
| 20 | mandaditos, sisu, sorbetes, la placita, glorieta, ambros | Delivery / expense | No |
| 21 | pago tarjeta, abono tarjeta, pago tc | transfer | No |
| 22 | retiro atm, retiro efectivo | transfer | No |
| 23 | transferencia cuenta propia | transfer | No |
| 24 | fondo emergencia | Ahorro / transfer | No |
| 25 | google one, google storage | Productividad / expense | No |
| 26 | salario, honorarios, pago quincenal | income | No |
| 27 | reembolso, devolución, reversa | refund | Sí |
| 28 | transferencia recibida | transfer | Sí |
| 29 | pago recibido | income | Sí |
| 30 | openai, chatgpt | Productividad / expense | No |
| 35 | udemy, coursera, platzi, domestika | Formación tecnológica / expense | No |
| 36 | vercel, supabase, github, namecheap, cloudflare, railway, render | Desarrollo / infraestructura / expense | No |
| 40 | netflix, spotify, youtube premium, disney plus, hbo max | Entretenimiento / expense | No |
| 45 | indrive, uber, taxi, bus, gasolina, combustible, estacion de servicio | Transporte / expense | No |
| 50 | amazon, amzn, amazon marketplace | Amazon / agencias / expense | No |
| 55 | veterinaria, veterinary, croquetas, alimento para perro, mascota | Apolo / expense | No |
| 60 | farmacia | Salud / expense | No |
| 65 | ferreteria, pintura, materiales de construccion, muebleria | Hogar / expense | No |
| 70 | claro, tigo, internet, cable | Servicios / expense | No |
| 71 | gas butano, recarga de gas, cilindro de gas | Servicios / expense | No |
| 75 | barberia, peluqueria, salon, cosmeticos, skincare | Cuidado personal / expense | No |
| 80 | ropa, calzado, zapateria, tienda de ropa | Ropa / expense | No |
| 85 | comision, mantenimiento, interes, mora, cargo bancario | Bancos / comisiones / expense | No |

Se eliminan como términos genéricos `agencia`, `gas` y `max`. No se inventarán nombres personales de comercios.

### Pruebas

- Normalización de acentos y mayúsculas.
- Coincidencia exacta y parcial.
- Exclusiones.
- Prioridad y desempate.
- Reglas inactivas.
- Validación de categorías requeridas.
- Casos `gas/gasolina`, `max/hbo max` y `agencia`.

> **Punto de parada:** presentar motor, administración, pruebas y riesgos. No tocar Supabase.

## Fase 4: aplicación en transacciones y reembolsos

- Crear una Server Action para clasificar el nombre al salir del campo.
- Las reglas inequívocas autocompletan categoría y tipo.
- Las reglas con `requires_review` muestran una sugerencia que debe confirmarse.
- La elección manual siempre prevalece.
- Revalidar la regla en el servidor al guardar.
- Guardar `classification_reason` y confianza determinística `1.0000`.
- Ninguna regla crea automáticamente una transacción.

### Reembolsos

- Exigir un gasto original.
- Copiar su categoría.
- Permitir reembolsos parciales.
- Validar dentro de una transacción que la suma reembolsada no exceda el monto USD original.
- Bloquear autorreferencias y vínculos a ingresos, transferencias o reembolsos.
- Impedir eliminar un gasto con reembolsos asociados.
- Buscar gastos reembolsables mediante Server Action y MUI Autocomplete, sin dependencia nueva.
- Descontar el reembolso del mes y categoría del gasto original, aunque se registre posteriormente.
- Mantener el gasto neto en cero como mínimo.

Actualizar listados, filtros y dashboard para reconocer `refund`. `is_essential_override` permanecerá fuera de la UI.

### Pruebas

- Aplicación automática y revisión obligatoria.
- Prevalencia de selección manual.
- Reembolso total, parcial y múltiple.
- Límite acumulado.
- Mes histórico corregido.
- Eliminación protegida.
- Presupuesto no utilizado sin transacción artificial.

> **Punto de parada:** entregar comportamiento completo local, pruebas y riesgos. No desplegar ni tocar Supabase.

## Fase 5: validación y paquete productivo

### Ejecutar

- Pruebas específicas.
- Suite Jest completa.
- `pnpm lint`.
- `pnpm build`.
- `git diff --check`.
- Revisión de migración y ausencia de secretos.

Preparar un wrapper en `scripts/database/` que:

1. Exija confirmación explícita.
2. Genere un respaldo lógico del esquema `public`.
3. Valide el respaldo y su checksum SHA-256.
4. Compruebe `categories`, `monthly_budgets`, `monthly_budget_categories`, `merchant_rules` y `transactions`.
5. Aplique la migración únicamente con aprobación.
6. Ejecute después el script idempotente de categorías y reglas.
7. Verifique que:
   - No se crearon transacciones.
   - No se creó una cabecera mensual.
   - No se modificaron categorías existentes.
   - No se tocaron presupuestos históricos.
   - No se sobrescribieron asignaciones.
   - Las siete categorías y reglas quedaron correctas.

Actualizar documentación de esquema, setup, MVP y procedimiento operativo.

> **Punto de parada y aprobación:** mostrar migración SQL, comando exacto, alcance del respaldo y resultados locales. Esperar aprobación explícita.

## Fase 6: Supabase y despliegue, únicamente con autorización

Después de una aprobación independiente:

1. Crear y verificar el respaldo.
2. Aplicar únicamente la migración revisada.
3. Ejecutar el script idempotente; nunca `pnpm db:seed`.
4. Verificar datos y ausencia de efectos colaterales.
5. Detenerse y reportar resultados.
6. Push, despliegue de Vercel y verificaciones autenticadas requieren autorización adicional.

## Supuestos fijados

- Se conservan todas las categorías actuales.
- Los montos iniciales son plantillas editables, no sincronización permanente.
- Solo el mes actual puede recibir asignaciones nuevas y únicamente si su cabecera ya existe.
- No se sobrescriben asignaciones ni valores personalizados.
- No se crean movimientos para presupuestos o sobrantes.
- No se usa regex, SonarQube ni dependencias nuevas.
- No se ejecutan migraciones, seeds, scripts contra Supabase, commits, pushes ni despliegues sin aprobación explícita.
****


codex resume 019fb5a1-724f-7c13-af8c-52d80c0e3cb5