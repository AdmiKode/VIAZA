# VIAZA - Plan Operativo Full V3
Fecha base: 2026-03-25
Estado: Aprobado por dirección (sin recorte de alcance)
Última actualización de ejecución: 2026-03-26 15:18 (America/Mexico_City)

## 1. Objetivo Ejecutivo
Terminar VIAZA V3 completa con cierre real por módulo (UI + lógica + persistencia + seguridad + QA), y preparar release de tiendas con ruta móvil correcta (IAP/RevenueCat) y Stripe para web.

## 2. Cronograma Por Semanas (Plan Base)
Escenario base de ejecución: 3 FE + 1 BE + 1 QA (full-time).

| Fase | Semanas | Objetivo | Entregable de salida |
|---|---:|---|---|
| Fase 0 | W1-W2 | Gobierno técnico, calidad y pipeline | CI verde, lint estable, smoke/e2e base, criterios DoD activos |
| Fase 1 | W2-W4 | Modelo datos final + RLS + servicios transversales | Supabase endurecido, notificaciones unificadas, migraciones base |
| Fase 2 | W4-W7 | Cierre completo de módulos parciales | Planner/Packing/Mobility/Wallet/Emergency cerrados funcionalmente |
| Fase 3 | W7-W11 | Construcción completa de módulos no iniciados | Safety/SOS/Budget/Memory/Risk zones productivos |
| Fase 4 | W11-W13 | Hardening y QA integral | E2E completo, performance móvil, observabilidad, release-candidate |
| Fase 5 | W13-W15 | Publicación tiendas y estabilización | Beta cerrada, fixes finales, submission iOS/Android |

## 3. Workstreams, Dueño Técnico Sugerido y Dependencias
| Stream | Dueño técnico sugerido | Alcance | Dependencias críticas |
|---|---|---|---|
| A. Planner Intelligence | Tech Lead FE + BE soporte | onboarding, dashboard, itinerary, clima, recomendaciones | Fase 1 datos + weather/routing APIs |
| B. Packing Ops | FE Sr + AI integraciones | smart packing, validación escaneo, evidencia, acomodo | Fase 1 tablas storage + ai-orchestrator vision |
| C. Mobility | FE Sr + BE APIs | multimodal, roadtrip, flights | Google APIs + proveedor peajes/paradas |
| D. Wallet & OCR | FE Sr + BE seguridad | wallet, OCR, expiraciones y alertas | storage/RLS + ai-orchestrator |
| E. Emergency & Safety | BE lead + FE | emergency QR, logs, tracking, SOS, risk zones | Realtime + proveedor risk + WhatsApp deep-link |
| F. Finance & Shared Trip | FE+BE | budget engine, split persistente, companion | nuevas tablas + reglas de negocio |
| G. Ingestion & Memory | BE + FE | importación por correo, bitácora/memoria | credenciales Gmail/Graph |
| X. QA & Release | QA lead | E2E, regresión, release gates, tiendas | build estable + entornos |

## 4. Ruta Crítica (Orden de Ejecución Real)
1. Fase 0 completa (pipeline, calidad mínima y reglas de cierre).
2. Fase 1 completa (modelo final de datos, seguridad y servicios transversales).
3. Cierre de parciales (Fase 2) en paralelo por streams A/B/C/D/E.
4. Construcción no iniciados (Fase 3) con prioridad E/F/G.
5. Hardening + QA integral (Fase 4).
6. Tiendas + estabilización post-submission (Fase 5).

## 5. Qué Arranca Hoy Mismo (Sin Esperar Proveedores Nuevos)
1. Reparar `lint` local/CI y configuración ESLint autocontenida en repo.
2. Crear baseline de pruebas: smoke E2E del flujo core.
3. Unificar servicios de notificaciones en una sola fuente de verdad.
4. Corregir sync remoto de `addCustomPackingItem`.
5. Definir y crear migraciones base de Packing Ops (evidence/luggage scan session/layout plan).
6. Implementar logs de acceso QR emergency (tabla + inserción + endpoint).
7. Actualizar `.env.example` a arquitectura actual (separación frontend vs edge).
8. Preparar backlog detallado por stream con estimaciones técnicas por épica.

## 6. Bloqueantes por Proveedor (Solo donde aplica)
| Proveedor/credencial | Bloquea qué | Estado actual | Fecha límite recomendada |
|---|---|---|---|
| Risk data provider API key | Zonas de riesgo y rerouting seguro | Pendiente definir proveedor | Antes de W7 |
| Gmail API o Microsoft Graph creds | Importación real de reservas por correo | Pendiente | Antes de W8 |
| SMS provider (capa automática failover) | SMS automático backend (NO bloquea SOS asistido) | Pendiente opcional | Antes de W10 |
| APNS/FCM producción | Push production-grade en móvil | Pendiente | Antes de W11 |
| RevenueCat + IAP store setup | Pagos móviles para tiendas | Pendiente | Antes de W12 |
| Supabase CLI token + DB password remota | Aplicación de migraciones en proyecto remoto | Pendiente en este entorno | Inmediato para F0-11 |

Nota oficial: flujo core SOS WhatsApp asistido se implementa client-side con deep link/intents (`wa.me`/`whatsapp://send`) y no depende de Twilio.

## 7. Matriz de Riesgos
| Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Cierre parcial disfrazado de completo | Alto | Medio | DoD obligatorio + QA gate por módulo |
| Deuda en schema/migraciones | Alto | Medio | versionado estricto migraciones + rollback scripts |
| Integraciones externas tardías | Alto | Alto | frontload de proveedores en W1-W2 |
| Regresión por alta concurrencia de cambios | Alto | Alto | CI obligatorio + smoke por PR + freeze window |
| Seguridad de datos sensibles (health/wallet/emergency) | Crítico | Medio | revisión RLS/buckets + security checklist por release |

## 8. Hitos (Milestones)
- M1 (fin W2): Fase 0 cerrada, CI verde, tablero operativo activo.
- M2 (fin W4): Fase 1 cerrada, base de datos/seguridad consolidada.
- M3 (fin W7): módulos parciales cerrados end-to-end.
- M4 (fin W11): módulos no iniciados implementados y conectados.
- M5 (fin W13): RC estable con QA E2E completo.
- M6 (fin W15): submission tiendas + plan de estabilización.

## 9. Submódulo Explícito - Packing Ops (Maleta Inteligente)
### 9.1 Nombre
- `Packing Validation Scan`
- `Suitcase Fit & Layout Advisor`

### 9.2 Objetivo
Conectar checklist sugerida + evidencia/escaneo + datos de maleta + propuesta de acomodo en un flujo operativo único por viajero.

### 9.3 Alcance funcional
1. Escaneo contra checklist
- detectar items confirmados por visión
- faltantes por categoría/viajero
- duplicados/exceso
- items inciertos (confidence baja)
- progreso porcentual por viajero y por categoría

2. Medidas y tipo de maleta
- dimensiones (alto/ancho/profundo)
- tipo (`carry_on`, `checked`, `backpack`, `auto_trunk`)
- compartimentos y restricciones (líquidos, fragilidad, cabina)

3. Propuesta de acomodo
- zonas de acomodo (fondo/arriba/compartimentos/mano)
- reglas por duración/clima/transporte
- optimización de volumen y acceso rápido

4. Resultado unificado
- checklist + scan result + suitcase profile + layout plan en una sesión auditable

### 9.4 Estado actual (hoy)
- Existe: checklist base, evidencia UI básica, foto maleta, sugerencia textual IA, store local.
- No existe: validación real contra checklist por visión, scoring de certeza, persistencia completa evidence/luggage session, layout estructurado por zonas, medición formal de maleta en backend.

### 9.5 Backend/DB/Storage/IA requerido
- Nuevas tablas propuestas:
  - `packing_scan_sessions`
  - `packing_scan_detections`
  - `suitcase_profiles`
  - `suitcase_layout_plans`
- Reutilizar/activar:
  - `packing_evidence`
  - `luggage_photos`
  - buckets `evidence` y `luggage`
- Edge Function nueva propuesta:
  - `packing-vision-validate` (detección + matching + confidence)
  - `suitcase-layout-advisor` (plan estructurado por zonas)
- Estrategia técnica recomendada: **flujo híbrido**
  - visión + clasificación asistida (confirmación usuario para casos inciertos)

### 9.6 División por fases dentro de Packing Ops
- Fase 1 (W2-W4): modelo datos + storage + RLS + servicios base.
- Fase 2 (W4-W6): scan validation MVP real (detección, faltantes, confianza, progreso).
- Fase 3 (W6-W8): suitcase profile y layout advisor estructurado.
- Fase 4 (W8-W9): hardening UX, performance y QA E2E packing completo.

## 10. Definition of Done (Adoptada)
Un módulo se cierra únicamente con:
1. UI funcional
2. lógica de negocio completa
3. persistencia real
4. manejo de errores
5. seguridad validada
6. pruebas mínimas
7. evidencia de build/lint/test + validación manual

## 11. Orden de Ejecución Inmediata (Próximos 5 días)
- Día 1: Lint/CI + smoke tests + tablero + backlog técnico por stream.
- Día 2: Migraciones base Fase 1 (packing/emergency logs/notificaciones unificadas).
- Día 3: Sync packing custom + unificación notificaciones + `.env.example`.
- Día 4: QR access logs end-to-end + matriz RLS/buckets inicial.
- Día 5: Kickoff de `Packing Validation Scan` y pruebas de flujo.

## 12. Estado de ejecución Fase 0 (en orden)
| Orden | Tarea | Estado | Evidencia |
|---|---|---|---|
| 1 | Lint local autocontenido en repo | COMPLETADO | `npm run lint` OK (0 errores) + `eslint.config.mjs` |
| 2 | Pipeline CI mínimo (build/lint/smoke) | EN_CURSO | workflow `/.github/workflows/ci.yml` creado; falta corrida remota verde |
| 3 | Smoke test base | COMPLETADO | `npm run test:smoke` OK (6 pruebas) con flujo crítico store + emergency logs |
| 4 | Unificación de notificaciones | COMPLETADO | servicio único + imports consolidados |
| 5 | Sync remoto `addCustomPackingItem` | COMPLETADO | persistencia remota y eliminación remota validadas por smoke tests |
| 6 | `.env.example` actualizado | COMPLETADO | separación frontend/edge reflejada |
| 7 | QR access logs (diseño + base técnica) | COMPLETADO | migración + función SQL + integración en `EmergencyPublicPage` |
| 8 | Backlog técnico A-G detallado | COMPLETADO | `docs/execution/BACKLOG_STREAMS_FULL_V3_2026-03-25.md` |
| 9 | Convenciones de migración/versionado | COMPLETADO | `docs/execution/CONVENCIONES_MIGRACIONES_VERSIONADO_2026-03-25.md` |
| 10 | Matriz base RLS/Buckets | COMPLETADO | `docs/execution/MATRIZ_RLS_BUCKETS_SCOPE_V3_2026-03-25.md` |
| 11 | QR access logs E2E (persistencia + consulta) | COMPLETADO | servicio `getEmergencyQrAccessLogs` + UI historial en Emergency |
| 12 | Gate DoD por módulo | COMPLETADO | checklist `docs/execution/CHECKLIST_DOD_RELEASE_V3_2026-03-25.md` |
| 13 | Baseline observabilidad | COMPLETADO | `observabilityService` + captura global de errores y rechazos |
| 14 | Migración base Smart Packing (scan/layout) | EN_CURSO | migración + schema + servicio técnico (`packingValidationService`) listos; pendiente apply remoto |

## 13. Estado Por Bloques (Ejecución Continua)
| Bloque | Estado | Cierre técnico | Evidencia |
|---|---|---|---|
| Bloque 1 - Packing Ops | COMPLETADO_TECNICO | Flujo maleta inteligente conectado: perfil maleta, escaneo vs checklist, detecciones, resumen, layout por zonas, evidencia DB+Storage | `npm run lint` (0 errores), `npm run build` OK, `npm run test:smoke` (7/7), servicios/UI/motor IA conectados |
| Bloque 2 - Emergency & Safety | EN_CURSO | SOS asistido WhatsApp/SMS implementado client-side con ubicación + link; sigue pendiente tracking realtime con expiración/token compartible | `EmergencyCardPage` + `emergencyAssistService` + build/lint/test OK |
