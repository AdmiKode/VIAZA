# MANIFIESTO TÉCNICO VIAZA END-TO-END (VISIÓN + ESTADO REAL)
Fecha: 2026-03-28
Base documental comparada: `MANIFIESTO VIAZA.md`, `Manifiesto v2.md`, `viaza_version_v3_25_mzo.md`.
Base técnica auditada: repo `viaza/` (frontend + Supabase + Edge Functions).

---

## 0) Tesis de producto (lo que VIAZA debe ser)
VIAZA no es una app de tips ni una lista de pendientes. VIAZA es un **sistema operativo de viaje** que:
- entiende un viaje real como objeto central (`Trip Object`),
- automatiza decisiones antes de salir,
- opera contigo durante el viaje,
- protege tu seguridad en escenarios críticos,
- y conserva memoria útil para que volver a usarla sea natural.

La experiencia ideal de retención es:
1. Creas un viaje en minutos con contexto real.
2. VIAZA te propone qué hacer y qué empacar sin fricción.
3. Durante el viaje resuelve clima, movilidad, gastos, documentos y seguridad.
4. En emergencia actúa rápido, con evidencia y trazabilidad.
5. Al regresar, conserva memoria y te deja listo para el siguiente viaje.

---

## 1) Arquitectura funcional objetivo (debe existir en producción)

### 1.1 Capas
| Capa | Rol |
|---|---|
| UX móvil | flujos claros por fase del viaje (antes/durante/protección/después) |
| Motor de contexto | activa módulos según tipo de viaje, destino, fechas, clima, transporte y perfil del viajero |
| Servicios de dominio | packing, agenda, itinerary, places, weather, wallet OCR, emergency, finance, mobility |
| Persistencia | Supabase Postgres + Storage + RLS por usuario |
| Integración externa | Maps/Places/Directions, clima, vuelos, riesgo geográfico, OCR/IA, pagos |
| Observabilidad/QA | build/lint/tests + validación manual por flujos críticos |

### 1.2 Principio rector técnico
Ninguna funcionalidad se considera “cerrada” si no cumple simultáneamente:
- UI visible navegable,
- lógica de negocio real,
- persistencia real,
- manejo de error,
- seguridad/RLS,
- validación funcional reproducible.

---

## 2) Inventario técnico real actual (lo que sí está en código)

### 2.1 Rutas visibles de app
Archivo fuente: `src/app/router/index.tsx`.

Rutas principales activas:
- `/home`, `/trip/:id`, `/packing`, `/tools`, `/tips`, `/profile`, `/settings`
- `/translator`, `/currency`, `/split-bill`, `/route`, `/agenda`, `/itinerary`, `/places`, `/recommendations`, `/wallet`, `/import-reservation`
- `/airline-rules`, `/allowed-items`, `/departure`, `/boarding-pass-scanner`, `/luggage-assistant`
- `/profile/emergency`, `/emergency/:publicToken`, `/premium`
- onboarding: `/onboarding/travel-type`, `/destination`, `/dates`, `/transport`, `/smart-detection`, `/travelers`, `/preferences`, `/summary`

### 2.2 Tablas reales en esquema
Archivo fuente: `supabase/schema_viaza.sql`.

Tablas detectadas:
- `profiles`
- `emergency_profiles`
- `emergency_qr_access_logs`
- `trips`
- `travelers`
- `packing_items`
- `packing_evidence`
- `luggage_photos`
- `suitcase_profiles`
- `packing_scan_sessions`
- `packing_scan_detections`
- `suitcase_layout_plans`
- `trip_activities`
- `departure_reminders`
- `split_bill_sessions`
- `split_bill_expenses`
- `payments`
- `places_cache`
- `trip_places`
- `itinerary_events`
- `agenda_items`
- `wallet_docs`
- `trip_recommendations` (compat/hotfix chain)

### 2.3 Buckets de Storage reales
- `evidence`
- `luggage`
- `wallet_docs`
- `avatars`

### 2.4 Edge Functions reales
- `ai-orchestrator`
- `airlines-autocomplete`
- `destination-resolve`
- `exchange-rates`
- `flight-info`
- `places-autocomplete`
- `places-details`
- `places-nearby`
- `risk-zones`
- `routes-transit`
- `weather-cache`
- `stripe-create-checkout-session`
- `stripe-customer-portal`
- `stripe-sync-premium`
- `stripe-webhook`

---

## 3) Flujo maestro ideal de experiencia (de onboarding a post-viaje)

## 3.1 Antes del viaje
### Paso A. Onboarding de viaje inteligente
Objetivo ideal:
- crear el `Trip Object` con contexto completo y activación automática de módulos.

Flujo real actual:
1. Tipo de viaje.
2. Destino (Places autocomplete).
3. Fechas.
4. Transporte + origen.
5. Smart detection.
6. Viajeros.
7. Preferencias.
8. Resumen.

Salida esperada ideal:
- viaje activo con destino real, coordenadas, timezone, moneda, idioma, clima por días, módulos activos.

Estado real:
- **Funcional base** (flujo existe), con vacíos en consistencia y automatización total.

### Paso B. Preparación operacional
Objetivo ideal:
- checklist viva, maleta inteligente, agenda completa, documentos listos.

Estado real:
- packing base fuerte + maleta inteligente parcial alta.
- agenda e itinerary CRUD funcionales.
- wallet OCR base funcional.

### Paso C. Movilidad previa
Objetivo ideal:
- rutas precisas por trayecto completo y por visita puntual.

Estado real:
- ruta general al destino sí (car + transit básico).
- **rutas por lugar de visita (intra-itinerary)** no cerradas.

## 3.2 Durante el viaje
Objetivo ideal:
- asistencia contextual minuto a minuto (clima, recomendaciones, movilidad, gastos, seguridad).

Estado real:
- clima y recomendaciones existen pero no siempre con profundidad operativa prometida.
- budget/split persistente no está cerrado.

## 3.3 Protección / emergencia
Objetivo ideal:
- QR robusto con auditoría, SOS confiable, tracking en vivo, tokens por evento geo.

Estado real:
- emergency card + QR + logs: sí.
- SOS asistido (abre WhatsApp/SMS con mensaje): sí.
- tracking realtime/safe walk/safe return: no.
- token por evento de geolocalización: no (hoy token público de perfil, no event-token efímero).

## 3.4 Post-viaje
Objetivo ideal:
- bitácora, memoria, resumen inteligente y preparación del siguiente viaje.

Estado real:
- memoria/journal no está cerrado como módulo productivo.

---

## 4) Mapa de tarjetas y ejecuciones UI (qué promete cada pantalla)

### 4.1 Home (`/home`)
Tarjetas detectadas:
- Hero del viaje activo.
- Pronóstico del clima.
- Risk Zones.
- Progreso de equipaje.
- Herramientas rápidas.
- Before you go.
- Tips locales / survival.

Ejecución real:
- clima: usa `weather-cache` + fallback Open-Meteo (premium).
- risk zones: usa `risk-zones` y guarda en `trips.risk_*`.
- quick tools: navegación a módulos.

Gap crítico:
- textos hardcodeados en inglés en tarjeta de riesgo.
- estados `Unknown/Pending` visibles en escenarios reales.

### 4.2 Tools Hub (`/tools`)
Tarjetas actuales:
- Ruta, Traductor, Moneda, Dividir cuenta, Adaptadores, Itinerary, Agenda, Places, Importar reservas.

Ejecución real:
- varias rutas abren módulos funcionales.
- `split-bill` abre calculadora local (no persistencia).

### 4.3 Tips Hub (`/tips`)
Tarjetas actuales:
- Tips locales.
- Survival tips.

Ejecución real:
- contenido estático curado + algunos filtros contextuales.

Gap:
- no es motor contextual profundo en tiempo real.

### 4.4 Trip Details (`/trip/:id`)
Tarjetas actuales:
- resumen clima, transporte, viajeros, actividades, progreso packing.
- grid de accesos a módulos (packing, itinerary, agenda, places, import, departure, airline, route, tips, tools).

Gap:
- tarjetas pueden dar percepción de cierre total aunque backend real sea parcial en algunos módulos.

---

## 5) Módulo por módulo: objetivo, estado real y faltante

### 5.1 Núcleo de viaje y contexto
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Onboarding inteligente | crear trip real y activar módulos correctos | Funcional base | endurecer validaciones, consistencia de contexto y QA de edge-cases |
| Smart Trip Brain | tablero "qué sigue/hoy/pendientes" con decisiones automáticas | Parcial | motor de prioridades y recomendaciones accionables por fase |
| Active Modules Engine | activar módulos según contexto real | Parcial | más granularidad por estado del viaje y SLA de calidad por módulo |

### 5.2 Packing Ops
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Smart Packing | lista por clima/duración/perfil/actividades | Funcional alta | ajuste fino de reglas y validación por escenarios extremos |
| Packing Validation Scan | detectar checklist vs evidencia visual | Parcial alta | precisión/recall en campo y mejor resolución de "inciertos" |
| Suitcase Profile | tipo, medidas, compartimentos, restricciones | Funcional base | extender restricciones por aerolínea real y validaciones UX |
| Layout Advisor | plan de acomodo por zonas y seguridad | Parcial alta | consistencia de calidad de plan y override manual más rico |
| Packing Evidence | fotos por item y foto final de maleta | Funcional base | mejores flujos de revisión y trazabilidad por viajero |

### 5.3 Movilidad
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Ruta al destino | ETA/distancia + deep links | Funcional base | robustecer fallbacks y precisión multimodo |
| Transit companion | pasos transitivos reales | Parcial baja | cobertura más estable por ciudad/proveedor |
| Movilidad por lugar visitado | rutas entre puntos del itinerario/places | No funcional | motor de rutas intra-viaje, selección de tramos y costo/tiempo |
| Roadtrip operativo | casetas, gasolina, taller, seguridad | No funcional completo | backend/UX dedicado roadtrip y datasets de carretera |

### 5.4 Clima y recomendaciones
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Clima diario contextual | forecast usable por todo el viaje | Parcial | manejo sólido de rangos, UX de degradación, refresh confiable |
| Recomendaciones contextuales | persistencia + ajuste por clima/tiempo/presupuesto | Parcial baja | persistencia robusta y replaneación automática real |
| Local/Survival tips | no genéricos, accionables por contexto | Parcial baja | pasar de catálogo estático a motor dinámico por señales reales |

### 5.5 Agenda / Itinerary / Places
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Agenda | eventos y recordatorios útiles | Funcional base | recurrencia avanzada completa + notificaciones robustas |
| Itinerary | planificación por día/hora con optimización | Funcional CRUD, inteligencia parcial | optimizador de orden por zona/clima/tiempo/costo |
| Places | CRUD y contexto local | Funcional | enriquecer scoring y persistencia de recomendaciones |
| Colaboración | edición multiusuario | No funcional | modelo de permisos/miembros/locks y UI colaborativa |

### 5.6 Wallet / OCR
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Wallet docs | repositorio seguro de docs de viaje | Funcional | más tipos y mejores estados del documento |
| OCR | extracción de info útil por documento | Funcional base | clasificación fuerte y validación de campos críticos |
| Expiraciones/alertas | avisos preventivos por vencimiento | No funcional | columnas/modelo de expiración + motor de alertas |
| Modo robo/pérdida | protocolo operativo completo | Parcial baja | flujos guiados y respuesta rápida integrada |

### 5.7 Emergency & Safety
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Emergency Card | perfil médico/emergencia confiable | Funcional | mejorar cobertura clínica y UX de actualización |
| QR de emergencia | acceso público controlado | Funcional | expiración/políticas más ricas por contexto |
| Logs QR | auditoría de accesos | Funcional | más metadatos útiles y alertas al dueño |
| SOS asistido | mensaje listo con ubicación y tracking | Funcional base | persistir eventos SOS en DB + confirmación de entrega |
| Tokens por evento de geolocalización | token efímero por evento SOS/tracking | No funcional | servicio de emisión/rotación/expiración y validación server-side |
| Safety tracking realtime | compartir seguimiento vivo | No funcional | canal realtime + permisos + expiración + consentimiento |
| Safe walk/return | monitoreo de retorno seguro | No funcional | timers, checkpoints, alertas escalonadas |

### 5.8 Finanzas
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Budget Companion | presupuesto por viaje con categorías | No funcional | módulo completo UI + servicios + tabla(s) |
| Split bill persistente | sesiones/gastos/saldo compartido | No funcional (UI local) | conectar `split_bill_sessions` y `split_bill_expenses` con CRUD real |
| Premium web | checkout/sync suscripción | Funcional | endurecer observabilidad de lifecycle |
| Premium móvil | IAP/RevenueCat real | No funcional | integrar SDK y backend de validación móvil |

### 5.9 Ingestion + Memory
| Módulo | Objetivo ideal | Estado real | Falta para cierre real |
|---|---|---|---|
| Import reservation por texto | parsear texto pegado | Funcional base | robustez parser y mapeo a agenda/itinerary |
| Import por correo real | ingestión automática desde inbox | No funcional | conectores + autenticación + parse pipeline |
| Centro de reservas | vista consolidada utilizable | Parcial | normalización y UX operacional |
| Memoria/bitácora | diario multimedia útil | No funcional | modelo de datos + UI + indexado |

---

## 6) Estado explícito de requerimientos críticos que pediste

### 6.1 Rutas de transporte por lugar de visita
Requerimiento: calcular rutas por cada sitio dentro del viaje (no solo origen-destino global).

Estado real actual:
- Existe ruta al destino (`/route`) con:
  - auto por OSRM,
  - bus/tren por `routes-transit` (origen ciudad -> destino viaje).
- No existe motor cerrado de ruta por cada `itinerary_event` o `trip_place`.

Conclusión: **No funcional aún** para el alcance que pediste.

### 6.2 SOS con precisión extrema + token por evento geo + mensaje a contacto
Requerimiento:
- token generado por evento geolocalizado,
- trazabilidad de evento,
- mensaje enviado al contacto.

Estado real actual:
- Sí hay SOS asistido WhatsApp/SMS con ubicación y link de emergency card.
- El token actual es `public_token` del perfil (persistente), no token efímero por evento.
- No hay tabla dedicada de eventos SOS con ciclo de vida (created/sent/delivered/ack).
- No hay envío automático server-side garantizado; se abre app de mensajería del usuario.

Conclusión: **Parcial base**, no cumple tu especificación final de precisión/telemetría por evento.

---

## 7) Matriz V3 numerada (estado real)
| # | Función V3 | Estado real |
|---|---|---|
| 1 | Onboarding inteligente | Funcional base |
| 2 | Generador maestro del viaje | Parcial |
| 3 | IA contextual del viaje | Parcial baja |
| 4 | Smart Packing Engine | Funcional alta |
| 5 | Escáner de maleta | Parcial alta |
| 6 | Motor de acomodo maleta | Parcial alta |
| 7 | Reglas especiales equipaje | Parcial |
| 8 | Modo auto/ruta segura | Parcial baja |
| 9 | Check mecánico | No funcional |
| 10 | Test evaluación auto | No funcional |
| 11 | Flight companion | Parcial |
| 12 | Airport flow | Parcial |
| 13 | Agenda viaje | Funcional |
| 14 | Itinerario inteligente | Parcial |
| 15 | Itinerario colaborativo | No funcional |
| 16 | Explorer contextual | Parcial |
| 17 | Recomendaciones contextuales | Parcial |
| 18 | Presupuesto | No funcional |
| 19 | Transit companion | Parcial baja |
| 20 | Cómo me muevo aquí | Parcial |
| 21 | Offline mobility pack | No funcional |
| 22 | Clima contextual | Parcial |
| 23 | Motor "si cambia clima" | No funcional |
| 24 | Travel Wallet | Funcional |
| 25 | OCR documental | Funcional base |
| 26 | Modo robo/pérdida | Parcial baja |
| 27 | Emergency Travel Card | Funcional |
| 28 | QR emergencia | Funcional |
| 29 | Modo acompañante | Parcial baja |
| 30 | Live Safety Tracking | No funcional |
| 31 | SOS Flow | Funcional base asistido |
| 32 | Safe Walk/Return | No funcional |
| 33 | Health module | No funcional |
| 34 | Condiciones especiales | Parcial |
| 35 | Traductor contextual | Parcial |
| 36 | Centro de mensajes | No funcional |
| 37 | WhatsApp utility layer | Funcional base |
| 38 | Budget companion | No funcional |
| 39 | Viaje compartido gastos | No funcional |
| 40 | Reservation import engine | Parcial |
| 41 | Centro de reservas | Parcial |
| 42 | Travel memory layer | No funcional |
| 43 | Recomendaciones post-viaje | No funcional |
| 44 | IA asistente transversal | Parcial baja |
| 45 | Replaneación realtime | No funcional |
| 46 | Modo ansiedad de viaje | No funcional |

---

## 8) Qué impide hoy que VIAZA sea "app que no borras"
1. Falta de cierre en seguridad avanzada (tracking/safe walk/event tokens).
2. Finanzas incompletas (budget/split persistente real).
3. Movilidad incompleta por lugar de visita.
4. Inconsistencia de calidad de contenido (tips/recomendaciones aún parcialmente estáticos).
5. Desalineación visual/técnica con reglas del manifiesto (i18n total y paleta).
6. Diferencia entre “módulo mostrado” y “módulo realmente operativo” en algunos puntos.

---

## 9) Definición de cierre técnico por módulo (estándar obligatorio)
Un módulo solo se marca como cerrado cuando tenga:
- ruta visible y UX navegable,
- CRUD real (si aplica),
- persistencia Supabase real,
- RLS validado,
- estados vacíos + errores,
- pruebas mínimas,
- evidencia de uso después de recargar app,
- sin hardcode que simule backend.

---

## 10) Prioridad de ejecución inmediata recomendada (sin recorte de visión)
1. **Budget Companion + Split Bill persistente** (visible + DB real).
2. **Mobility por lugar visitado** (itinerary/places -> rutas entre puntos).
3. **SOS event model** (event tokens geo + tabla de eventos + trazabilidad de envío).
4. **Safety tracking base** (consentimiento, sesión, expiración, share link/token).
5. **Hardening de i18n/paleta + claims UI vs realidad**.

---

## 11) Anexo técnico de evidencia (archivos clave auditados)
- `viaza/src/app/router/index.tsx`
- `viaza/src/modules/onboarding/pages/*.tsx`
- `viaza/src/modules/trips/pages/HomePage.tsx`
- `viaza/src/modules/trips/pages/TripDetailsPage.tsx`
- `viaza/src/modules/trips/pages/TripRoutePage.tsx`
- `viaza/src/modules/tools/pages/ToolsHubPage.tsx`
- `viaza/src/modules/tips/pages/TipsHubPage.tsx`
- `viaza/src/modules/packing/pages/PackingChecklistPage.tsx`
- `viaza/src/modules/packing/pages/LuggageAssistantPage.tsx`
- `viaza/src/modules/wallet/pages/WalletPage.tsx`
- `viaza/src/modules/emergency/pages/EmergencyCardPage.tsx`
- `viaza/src/modules/split-bill/pages/SplitBillPage.tsx`
- `viaza/src/services/emergencyService.ts`
- `viaza/src/services/emergencyAssistService.ts`
- `viaza/src/services/packingValidationService.ts`
- `viaza/src/services/packingMediaService.ts`
- `viaza/src/services/premiumService.ts`
- `viaza/supabase/schema_viaza.sql`
- `viaza/supabase/functions/*/index.ts`

---

## 12) Mensaje ejecutivo final
VIAZA sí tiene columna vertebral real. No está en cero.
Pero todavía no es la V3 total prometida en los tres manifiestos.

Para convertirla en producto realmente diferencial y no genérico, hay que cerrar módulos **visibles end-to-end** con persistencia y seguridad real, empezando por Finanzas, Movilidad por visita y Safety/SOS de precisión operacional.
