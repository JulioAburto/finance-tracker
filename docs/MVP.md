# Finance Tracker MVP v1

> Alcance de producto y estado de implementación.

Última revisión: 2026-06-20.

## Objetivo

Ayudar a Julio a registrar gastos diariamente, entender dónde se utiliza el dinero y detectar categorías que requieren reducir o congelar gastos.

El MVP debe responder:

1. ¿Cuánto se gastó durante el mes?
2. ¿En qué categorías?
3. ¿Qué porcentaje de cada presupuesto se ha consumido?
4. ¿Qué categorías están saludables, en advertencia, en peligro o excedidas?
5. ¿Qué gastos siguen sin categoría?
6. ¿Cuánto presupuesto queda?
7. ¿Qué gasto debería reducirse?

No es un sistema contable ni una plataforma bancaria.

## Usuario

Un solo usuario: Julio Aburto.

Multiusuario y control de roles no forman parte del MVP v1.

## Estado

### Implementado

- ✅ Registro manual de transacciones.
- ✅ Validación del lado servidor.
- ✅ Conversión y almacenamiento de USD/NIO.
- ✅ Listado y filtros por mes, categoría y método de pago.
- ✅ Edición y eliminación.
- ✅ Dashboard mensual con presupuesto, porcentajes y alertas.
- ✅ Datos iniciales de categorías, métodos, presupuesto y reglas.
- ✅ Pruebas unitarias de reglas financieras.

### Pendiente

- ⏳ Gestión de categorías y presupuestos.
- ⏳ Gestión de reglas de comercios.
- ⏳ Configuración editable.
- ⏳ Aplicación automática de reglas durante el registro.
- ⏳ Protección del despliegue público.
- ⏳ IA opcional como fallback.

## Alcance incluido

- Registro manual de ingresos, gastos y transferencias.
- Categorías editables.
- Métodos de pago editables.
- Presupuestos mensuales por categoría.
- USD y NIO.
- Tasa histórica por transacción.
- Dashboard mensual.
- Alertas de presupuesto.
- Reglas editables de comercios.
- Configuración básica.
- Modo de tarjeta de crédito.
- Seed inicial.

## Fuera de alcance

Requieren aprobación explícita:

- Integraciones bancarias.
- OCR y lectura de facturas.
- Entrada basada principalmente en IA.
- Multiusuario.
- Conciliación contable.
- Reportes avanzados.
- Simulaciones complejas de metas.
- Automatización de transacciones recurrentes.
- Notificaciones push o correo.
- Importación CSV.
- Sincronización con Google Sheets.
- Control de acceso por roles.

## Reglas del dominio

### Categoría y método de pago

La categoría indica en qué se utilizó el dinero:

```txt
Categoría: Supermercado
```

El método indica cómo se pagó:

```txt
Método de pago: Tarjeta de crédito
```

`Tarjeta` no es una categoría.

### Tarjetas de crédito

- Una compra con tarjeta es un gasto.
- El pago de la tarjeta es una transferencia.
- El pago no debe duplicar el gasto original.

### Ahorro

El ahorro es una transferencia o asignación, no un gasto normal.

El dashboard excluye la categoría `Ahorro` del presupuesto consumible y muestra el ahorro esperado por separado.

### Moneda

Cada transacción conserva:

```txt
monto original
moneda original
tipo de cambio
monto USD
monto NIO
```

No recalcular transacciones históricas con una tasa nueva.

## Estados de presupuesto

| Uso | Estado |
| --- | --- |
| 0%–69% | `safe` |
| 70%–79% | `warning` |
| 80%–99% | `danger` |
| 100% o más | `exceeded` |

Si una categoría alcanza al menos 80% antes del día 20, recomendar congelar gastos extra.

## Clasificación

Orden previsto:

1. Categoría seleccionada por el usuario.
2. Regla de comercio.
3. Sugerencia opcional de IA.
4. Sin categoría.

La IA:

- No forma parte del núcleo.
- No debe bloquear la creación de transacciones.
- No puede sobrescribir datos confirmados.
- No realiza cálculos financieros.

## Pantallas

### `/dashboard`

Implementada.

Muestra:

- Gasto mensual.
- Presupuesto de gastos.
- Porcentaje consumido.
- Ahorro esperado.
- Uso por categoría.
- Alertas.
- Últimas transacciones.
- Gastos sin categoría.

### `/transactions`

Implementada.

Permite:

- Listar por mes.
- Filtrar por categoría y método.
- Editar.
- Eliminar con confirmación.

### `/transactions/new`

Implementada.

Valida:

- Nombre obligatorio.
- Monto y tasa mayores que cero.
- Moneda USD o NIO.
- Fecha válida.
- Categoría y método obligatorios para gastos.

### `/categories`

Pendiente.

Debe permitir crear, editar, desactivar y actualizar presupuestos.

### `/rules`

Pendiente.

Debe permitir crear, editar, priorizar y desactivar reglas.

### `/settings`

Pendiente.

Debe permitir modificar moneda, tasa predeterminada y opciones de tarjeta.

## Datos iniciales

El seed crea:

- Configuración global.
- 13 categorías.
- 7 métodos de pago.
- Presupuesto para julio de 2026.
- Presupuestos por categoría.
- 7 reglas de comercios.

Los importes y columnas exactos están en [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

## Fases

| Fase | Estado | Contenido |
| --- | --- | --- |
| Fundación | ✅ | MUI, Drizzle, esquema, migración y seed |
| Utilidades | ✅ | Dinero y presupuesto |
| Transacciones | ✅ | Crear, listar, editar y eliminar |
| Dashboard | ✅ | Cálculos y alertas |
| Categorías | ⏳ | CRUD y presupuestos |
| Reglas | ⏳ | CRUD y clasificación |
| IA opcional | ⏳ | Solo después de reglas |

## Criterios de éxito

Después de 30 días de uso:

- Al menos 90% de gastos reales registrados.
- Cero gastos sin categoría al cierre.
- Porcentajes de presupuesto correctos.
- Alertas correctas en 70%, 80% y 100%.
- Funcionamiento completo sin IA.
- Comprensión del gasto sin cálculos manuales.

## Definición de terminado

Una funcionalidad está terminada cuando:

- Compila y tiene tipos válidos.
- Valida mutaciones en el servidor.
- Tiene pruebas para lógica financiera cuando sea práctico.
- Pasa lint, pruebas y build, o documenta el bloqueo.
- No expone secretos.
- No introduce alcance externo al MVP.
