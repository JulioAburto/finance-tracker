• Fase completada

Fase 0 — auditoría y plan de implementación. No modifiqué archivos. Esta auditoría es estática, basada en código; los resultados por viewport son riesgo estimado, no verificación visual final.

Files changed

File Change
━━━━━━━━━ ━━━━━━━━━━━━━━━━
Ninguno Solo auditoría

## Responsive route inventory

Route 320px risk Main responsive issue Priority
━━━━━━━━━━━━━━━━━━━━━━━━━ ━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━━━━━━━━━
/dashboard Alto Jerarquía móvil mejorable y filas con textos/montos largos sin defensas de wrap/shrink Alta
───────────────────────── ──────────── ──────────────────────────────────────────────────────────────────────────────────────── ──────────
/transactions Alto Filtros con patrón desktop y cards móviles con filas horizontales frágiles Alta
───────────────────────── ──────────── ──────────────────────────────────────────────────────────────────────────────────────── ──────────
/transactions/new Alto Formulario no optimizado para teclado móvil ni para orden de captura rápida Alta
───────────────────────── ──────────── ──────────────────────────────────────────────────────────────────────────────────────── ──────────
/transactions/[id]/edit Alto Mismos riesgos del formulario nuevo, más alerta superior que empuja el CTA Alta
───────────────────────── ──────────── ──────────────────────────────────────────────────────────────────────────────────────── ──────────
/categories Alto Formularios inline largos pensados para desktop; sin patrón móvil deliberado Alta
───────────────────────── ──────────── ──────────────────────────────────────────────────────────────────────────────────────── ──────────
/rules Alto Patrón inline denso, selects con ancho mínimo y campo de patrón largo Alta
───────────────────────── ──────────── ──────────────────────────────────────────────────────────────────────────────────────── ──────────
/settings Alto Formularios inline densos y tarjetas de crédito sin representación móvil específica Alta

## Cross-cutting issues

- El proyecto está ocultando overflow global en src/app/globals.css:5. overflow-x: hidden evita ver el problema, no lo corrige.
- La navegación móvil actual en src/components/layout/app-shell.tsx:121 es una fila horizontal desplazable. Eso reduce descubribilidad, puede ocultar la ruta activa y no cumple el patrón móvil claro pedido.
- No encontré manejo explícito de safe areas ni 100dvh en src/. El shell sticky actual en src/components/layout/app-shell.tsx:33 tampoco reserva insets.
- No hay uso defensivo de minWidth: 0 en layout/contenedores relevantes. Con etiquetas largas y montos grandes, eso deja riesgo de desborde silencioso.
- El tema deja botones con minHeight: 40 en src/app/theme.ts:77, por debajo del objetivo móvil de 44x44.
- /transactions usa filtros todavía con mentalidad desktop en src/app/transactions/page.tsx:79: no hay Drawer/sheet, no hay contador de filtros activos y los selects siguen con minWidth: 220.
- Las cards móviles de /transactions en src/app/transactions/page.tsx:137 usan varias filas row para chip, montos y acciones; con nombres largos y valores grandes pueden apretarse en 320px.
- El formulario de transacción en src/features/transactions/components/transaction-form.tsx:67 no sigue el orden móvil solicitado, no tiene patrón explícito para teclado virtual y deja el submit al final sin
  estrategia sticky o safe-area-aware.

- /dashboard ya separa mobile/desktop para categorías, lo cual es correcto, pero la prioridad móvil todavía no es la ideal: el grid de 4 summary cards aparece antes de alertas críticas en src/app/dashboard/
  page.tsx:173.

- Las listas “Últimas transacciones” y “Sin clasificar” en src/app/dashboard/page.tsx:360 usan texto crudo en filas sin control de wrap, truncado accesible ni minWidth: 0.
- /categories, /rules y /settings son funcionales, pero su UX móvil actual es claramente transicional: formularios largos inline, sin cards/rows móviles ni dialogs fullscreen.
- No hay problemas actuales de dialogs/drawers anidados porque prácticamente no existen overlays responsivos todavía. Eso simplifica Fase 1, pero deja una deuda para Fases 3 y 5.

## Proposed implementation plan

1. Fase 1 — shell, navegación, safe areas y overflow global.
   Archivos: src/components/layout/app-shell.tsx, src/app/layout.tsx, src/app/globals.css, src/app/theme.ts, src/components/layout/page-header.tsx. Objetivo: patrón de navegación móvil claro, spacing
   consistente, safe areas y eliminación de overflow estructural.

2. Fase 2 — formulario móvil de transacciones.
   Archivos: src/features/transactions/components/transaction-form.tsx, src/features/transactions/components/submit-button.tsx, src/app/transactions/new/page.tsx, src/app/transactions/[id]/edit/page.tsx.
   Objetivo: orden móvil correcto, CTA alcanzable con teclado, errores junto al campo y envío robusto.

3. Fase 3 — lista móvil y filtros de /transactions.
   Archivos: src/app/transactions/page.tsx, src/features/transactions/components/delete-transaction-button.tsx. Posible archivo nuevo mínimo si hace falta para filtros móviles.

4. Fase 4 — jerarquía móvil del dashboard.
   Archivos: src/app/dashboard/page.tsx, src/components/ui/summary-card.tsx, y solo si hace falta src/components/ui/budget-status-chip.tsx.

5. Fase 5 — pantallas de gestión y overlays responsivos.
   Archivos: src/app/categories/page.tsx, src/app/rules/page.tsx, src/app/settings/page.tsx. Posibles wrappers compartidos solo si la duplicación ya es real.

6. Fase 6 — polish de baja prioridad.
   Archivos: src/app/theme.ts, src/components/layout/app-shell.tsx y componentes tocados previamente, sin rediseño global.

## Validation

Command Result
━━━━━━━━━━━━ ━━━━━━━━━
pnpm test Not run
──────────── ─────────
pnpm lint Pass
──────────── ─────────
pnpm build Fail

pnpm build ya falla en el estado actual por un error de tipado previo en src/app/dashboard/page.tsx:133: Typography está usando fontWeight como prop directo. Eso no lo cambié, pero sí bloquea la definición
de terminado limpia para la siguiente fase si no se corrige.

## Remaining risks

- La mayor parte del riesgo real está en contenido largo y estados reales de datos; esta fase no incluyó validación visual en navegador.
- El build roto es deuda previa y puede mezclarse con la Fase 1 porque toca dashboard.
- El shell actual probablemente “parece estable” por overflow-x: hidden; al corregirlo pueden aparecer desbordes reales hoy ocultos.

## Intentionally unchanged

- Lógica financiera.
- Esquema y capa de datos.
- Server Actions.
- Tests.
- Navegación/rutas de producto.
- Cualquier overlay nuevo; solo quedó planificado.

Phase complete. Waiting for approval before starting the next phase.
