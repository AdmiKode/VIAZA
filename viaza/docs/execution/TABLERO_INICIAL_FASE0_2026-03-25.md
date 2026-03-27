# VIAZA - Tablero Inicial Fase 0
Fecha de arranque: 2026-03-25
Objetivo Fase 0: estabilizar calidad mínima de release y activar gobierno técnico.
Última actualización: 2026-03-25 19:33 (America/Mexico_City)

## 1. Sprint actual (W1)
| ID | Tarea | Stream | Estado | Dependencia | Evidencia esperada |
|---|---|---|---|---|---|
| F0-01 | Arreglar ESLint para que corra en repo sin config global | X. QA & Release | COMPLETADO | Ninguna | `npm run lint` OK |
| F0-02 | Definir pipeline CI mínimo (build + lint + smoke) | X. QA & Release | EN_CURSO | F0-01 | job CI verde |
| F0-03 | Crear smoke test flujo core (Auth->Emergency) | X. QA & Release | COMPLETADO | F0-02 | reporte test + comandos |
| F0-04 | Unificar servicios de notificaciones duplicados | Fase 1 transversal | COMPLETADO | Ninguna | 1 servicio activo + imports consolidados |
| F0-05 | Corregir sync remoto `addCustomPackingItem` | B. Packing Ops | COMPLETADO | Ninguna | escritura/lectura Supabase validada |
| F0-06 | Backlog técnico detallado por stream (A-G) | PM/Tech Lead | COMPLETADO | Ninguna | listado de épicas + estimación |
| F0-07 | Actualizar `.env.example` (frontend vs edge) | Fase 1 transversal | COMPLETADO | Ninguna | archivo actualizado + checklist de secrets |
| F0-08 | Definir convenciones de migración/versionado | Fase 1 transversal | COMPLETADO | Ninguna | guía + estructura migration naming |
| F0-09 | Crear matriz RLS/Buckets base del scope actual | Fase 1 transversal | COMPLETADO | Ninguna | matriz publicada |
| F0-10 | Abrir implementación QR access logs (diseño técnico) | E. Emergency & Safety | COMPLETADO | F0-08 | diseño tabla/evento y flujo |

## 2. Sprint siguiente (W2)
| ID | Tarea | Stream | Estado | Dependencia | Evidencia esperada |
|---|---|---|---|---|---|
| F0-11 | Implementar migraciones base: packing/evidence/luggage sessions | B. Packing Ops | EN_CURSO | F0-08 | migraciones aplicadas |
| F0-12 | Implementar QR access logs E2E | E. Emergency & Safety | COMPLETADO | F0-10 | logs persistidos y consulta admin |
| F0-13 | Activar gate de DoD por módulo en checklist release | X. QA & Release | COMPLETADO | F0-02 | plantilla DoD en repo |
| F0-14 | Baseline observabilidad (errores críticos) | X. QA & Release | COMPLETADO | F0-02 | captura de errores centralizada |

## 3. Bloqueantes abiertos por proveedor
| ID | Bloqueante | Impacto | Estado |
|---|---|---|---|
| EXT-01 | Proveedor de zonas de riesgo (API + cobertura) | Bloquea submódulo Risk Zones | EN_CURSO (TravelRiskAPI key configurada) |
| EXT-02 | Credenciales Gmail/Graph para importación de correo | Bloquea ingestión real de reservas | PENDIENTE |
| EXT-03 | Proveedor SMS automático (capa fallback) | NO bloquea SOS asistido; bloquea auto-send backend | PENDIENTE |
| EXT-04 | APNS/FCM producción | Bloquea push production-ready | PENDIENTE |
| EXT-05 | RevenueCat + IAP setup stores | Bloquea pago móvil de tiendas | EN_CURSO (key test recibida; pendiente App Store / Play Console bindings) |
| EXT-06 | Credenciales Supabase CLI/DB para aplicar migraciones remotas | Bloquea cierre técnico de F0-11 en entorno remoto | PENDIENTE |

## 4. Reglas de avance
1. Ninguna tarea pasa a DONE sin evidencia verificable.
2. Cualquier feature parcial queda como IN_PROGRESS, no DONE.
3. Toda migración requiere validación de rollback y revisión RLS.
4. No se introduce dependencia externa si existe solución client-side suficiente para el core.

## 5. Evidencia de progreso (2026-03-25)
- `F0-01 COMPLETADO`: `npm run lint` ejecuta en repo con `eslint.config.mjs` local (0 errores).
- `F0-04 COMPLETADO`: notificaciones unificadas en `src/services/notificationsService.ts` y wrapper de compatibilidad en `src/services/notifications/notificationsService.ts`.
- `F0-07 COMPLETADO`: `.env.example` alineado a separación frontend (`VITE_*`) vs secretos Edge.
- `F0-10 COMPLETADO`: migración `20260325_emergency_qr_access_logs.sql` + integración de logging en página pública de emergencia.
- `F0-02 EN_CURSO`: workflow `/.github/workflows/ci.yml` creado; pendiente validación en runner remoto.
- `F0-03 COMPLETADO`: smoke ampliado a flujo crítico de datos + emergency logs (`src/smoke/*.smoke.test.ts`, `6/6` en verde).
- `F0-05 COMPLETADO`: custom packing con alta y eliminación remota (`savePackingItems` + `deletePackingItemRemote`) y evidencia automatizada.
- `F0-12 COMPLETADO`: historial de escaneos implementado en Emergency (`getEmergencyQrAccessLogs` + tarjeta en UI overview) con `build/lint/test` en verde.
- `F0-06 COMPLETADO`: backlog por streams publicado en `docs/execution/BACKLOG_STREAMS_FULL_V3_2026-03-25.md`.
- `F0-08 COMPLETADO`: convención de migraciones/versionado publicada en `docs/execution/CONVENCIONES_MIGRACIONES_VERSIONADO_2026-03-25.md`.
- `F0-09 COMPLETADO`: matriz RLS/Buckets publicada en `docs/execution/MATRIZ_RLS_BUCKETS_SCOPE_V3_2026-03-25.md`.
- `F0-13 COMPLETADO`: checklist DoD publicado en `docs/execution/CHECKLIST_DOD_RELEASE_V3_2026-03-25.md`.
- `F0-14 COMPLETADO`: observabilidad base implementada (`src/services/observabilityService.ts`) + guía en `docs/execution/OBSERVABILIDAD_BASE_2026-03-25.md`.
- `F0-11 EN_CURSO`: migración base Smart Packing creada (`20260325_1935_packing_scan_foundations.sql`) + `schema_viaza.sql` actualizado + servicio técnico inicial (`packingValidationService.ts` y `types/packingScan.ts`); pendiente aplicar en Supabase remoto (`SUPABASE_ACCESS_TOKEN` + password DB remota).
- Ajuste de estilo aplicado en Emergency: íconos sin emoji y uso de paleta existente.
