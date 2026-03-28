# AUDITORÍA REAL VIAZA V3 PRE-ANDROID
Fecha: 2026-03-28
Alcance: comparación real entre `MANIFIESTO VIAZA.md` + `Manifiesto v2.md` + `viaza_version_v3_25_mzo.md` vs implementación actual en repo `viaza/`.

## 1) Método (sin simulación)
Se auditó con evidencia de código, esquema SQL, Edge Functions y checks locales:
- Build: `npm run build` -> OK
- Lint: `npm run lint` -> OK con warnings (sin errores bloqueantes)
- Tests: `npm run test` -> OK
- Smoke: `npm run test:smoke` -> OK

Base técnica revisada:
- Frontend/flows/rutas: `src/app/router/index.tsx`, módulos en `src/modules/**`
- Estado/persistencia: `src/app/store/useAppStore.ts`
- Servicios reales: `src/services/**`
- Backend: `supabase/schema_viaza.sql`, `supabase/migrations/**`, `supabase/functions/**`

## 2) Resultado ejecutivo
Estado global real: **PARCIAL INESTABLE PARA TESTEO ANDROID**.

Sí hay producto funcional en varias áreas (onboarding, trips, packing base, agenda, itinerary, places, wallet, emergency, OCR básico, premium web), pero **no cumple aún la promesa completa de Manifiesto v2/v3** y hay módulos que hoy están parciales o decorativos respecto a lo prometido.

## 3) Reglas no negociables del manifiesto (estado real)

| Regla | Estado real | Evidencia |
|---|---|---|
| Cero emojis | Parcial (sin evidencia de emojis en pantallas auditadas) | revisión visual + código |
| Cero colores fuera de paleta | **NO CUMPLE** | hay múltiples hex fuera de paleta en `src/**` (`#1976D2`, `#4CAF50`, `#FF3D00`, etc.) |
| Tipografía Questrial total | Parcial | muchas pantallas la usan, no está garantizado 100% global |
| Todo texto vía i18n | **NO CUMPLE** | textos hardcodeados en inglés/español en pantallas críticas (ej. risk card home) |
| Lógica fuera de componentes | Parcial | aún hay lógica operativa pesada dentro de páginas |
| Build limpio | Cumple | build OK |

## 4) Auditoría total por capacidades (Manifiesto + v2 + v3)

### 4.1 Núcleo de viaje
| Capacidad | Estado | Real hoy |
|---|---|---|
| Auth + onboarding por tipo de viaje | Funcional | Flujo implementado con rutas reales y creación de trip |
| Trip Object real (destino, fechas, transporte, contexto) | Parcial alta | estructura amplia en `types/trip.ts` + store, pero no todos los campos gobiernan módulos avanzados |
| Dashboard “qué sigue/hoy/pendientes críticos” | Parcial | Home existe, pero no cubre toda la inteligencia prometida |

### 4.2 Destino, clima, recomendaciones
| Capacidad | Estado | Real hoy |
|---|---|---|
| Destino real con Places | Funcional | `places-autocomplete`, `places-details`, `destination-resolve` conectados |
| Clima por día del viaje | Parcial | `weather-cache` + fallback Open-Meteo existe, pero en UI hay casos de "no disponible" y cobertura dependiente de premium/datos |
| Recomendaciones contextuales profundas | Parcial baja | recomendaciones básicas sí; persistencia/optimización avanzada no cerrada |
| Tips no genéricos por contexto real | Parcial baja | `local-tips`/`survival-tips` son catálogos estáticos curados + filtros, no motor contextual completo |

### 4.3 Movilidad y transporte
| Capacidad | Estado | Real hoy |
|---|---|---|
| Ruta al destino (car) con ETA/distancia | Funcional base | `TripRoutePage` + OSRM + deep links |
| Transit companion multimodal sólido | Parcial baja | bus/train por `routes-transit`, sin motor multimodal completo ni contingencias robustas |
| Roadtrip completo (casetas/gasolineras/talleres/check mecánico) | **No funcional completo** | no existe módulo operativo completo end-to-end |
| Flight companion/airport flow avanzado | Parcial | onboarding y scanner existen; alertas/vuelo en vivo no cerradas |

### 4.4 Packing Ops / Maleta inteligente
| Capacidad | Estado | Real hoy |
|---|---|---|
| Smart Packing Engine (lista sugerida real) | Funcional alta | motor de packing + CRUD + sync remoto para custom items |
| Packing Validation Scan (escaneo contra checklist) | Parcial alta | infraestructura y flujo existen (`packing_scan_sessions/detections` + AI), falta robustez de precisión/QA real en campo |
| Perfil de maleta (tipo/medidas/compartimentos) | Funcional base | `suitcase_profiles` + UI y persistencia |
| Suitcase Fit & Layout Advisor (acomodo IA) | Parcial alta | se genera plan y se guarda en `suitcase_layout_plans`; aún requiere afinado de calidad funcional |
| Evidencia real (fotos ítem/maleta) | Funcional base | storage + tablas `packing_evidence`, `luggage_photos` |
| Reglas especiales equipaje (aerolínea/líquidos/no permitido) | Parcial | base existe, profundidad comercial completa no cerrada |

### 4.5 Agenda / Itinerary / Places
| Capacidad | Estado | Real hoy |
|---|---|---|
| Agenda CRUD | Funcional | DB real + UI real |
| Recurrencia avanzada agenda | Parcial / ambiguo | no hay cierre completo de recurrencia avanzada prometida |
| Itinerary CRUD | Funcional | DB real + UI real |
| Itinerario inteligente (optimiza zona/clima/presupuesto) | Parcial baja | CRUD sí; optimización automática aún no completa |
| Places CRUD | Funcional | DB real + UI real |
| Itinerario colaborativo | No funcional | no existe flujo colaborativo completo |

### 4.6 Wallet, OCR, documentos
| Capacidad | Estado | Real hoy |
|---|---|---|
| Wallet docs persistente | Funcional | `wallet_docs` + storage + CRUD |
| OCR documental | Funcional base | `ai-orchestrator` integrado |
| Clasificación fuerte + modelo documental premium | Parcial | clasificación básica, sin modelo completo robusto |
| Expiraciones + alertas de documentos | **No funcional** | `wallet_docs` no tiene modelo de expiración/alerta completo |
| Modo robo/pérdida | Parcial baja | no se observa cierre operacional completo |

### 4.7 Emergency & Safety
| Capacidad | Estado | Real hoy |
|---|---|---|
| Emergency profile/card | Funcional | CRUD completo |
| QR público de emergencia | Funcional | token público + vista pública |
| Logs de acceso QR | Funcional | `emergency_qr_access_logs` + función `log_emergency_qr_access` |
| SOS asistido WhatsApp/SMS | Funcional base | deep links client-side implementados |
| Safety tracking realtime | **No funcional** | no existe módulo realtime completo de tracking compartido |
| Safe walk / safe return | **No funcional** | no existe flujo operativo completo |

### 4.8 Finanzas y premium
| Capacidad | Estado | Real hoy |
|---|---|---|
| Premium (web Stripe) | Funcional | checkout + sync premium via edge |
| Premium móvil (IAP/RevenueCat real) | **No funcional** | `premiumService.ts` marca `isNative=false`; RevenueCat no integrado |
| Budget companion persistente | **No funcional** | no se encontró backend operativo de presupuesto por viaje |
| Split bill persistente compartido | **No funcional** | `SplitBillPage` es calculadora local con estado en memoria |

### 4.9 Importación e ingestión
| Capacidad | Estado | Real hoy |
|---|---|---|
| Importar reserva desde texto | Funcional base | parser por `ai-orchestrator` |
| Importación real por correo (Gmail/Graph/IMAP) | **No funcional** | no está integrada en producción |
| Centro de reservas robusto | Parcial | base existe, capa de ingestión completa no |
| Memoria/bitácora de viaje | **No funcional** | no hay módulo completo de journal/memory persistente |

### 4.10 Riesgo geográfico
| Capacidad | Estado | Real hoy |
|---|---|---|
| Risk zones por país | Parcial | edge `risk-zones` existe + persiste en `trips`, pero UI muestra estados unknown/error en casos reales |
| Zonas/polígonos y rerouting seguro | **No funcional** | no hay motor geoespacial operativo completo |

### 4.11 Matriz explícita V3 (numerada)
| # v3 | Función | Estado |
|---|---|---|
| 1 | Onboarding inteligente del viaje | Funcional base |
| 2 | Generador maestro del viaje | Parcial |
| 3 | IA contextual del viaje | Parcial baja |
| 4 | Smart Packing Engine | Funcional alta |
| 5 | Escáner de maleta/check visual | Parcial alta |
| 6 | Motor de acomodo de maleta | Parcial alta |
| 7 | Reglas especiales de equipaje | Parcial |
| 8 | Modo Auto / Ruta segura | Parcial baja |
| 9 | Check mecánico previo | No funcional |
| 10 | Test evaluación viaje en auto | No funcional |
| 11 | Flight Companion | Parcial |
| 12 | Airport Flow | Parcial |
| 13 | Agenda de viaje | Funcional |
| 14 | Itinerario inteligente | Parcial |
| 15 | Itinerario colaborativo | No funcional |
| 16 | Explorer contextual | Parcial |
| 17 | Recomendaciones por contexto | Parcial |
| 18 | Modo presupuesto | No funcional |
| 19 | Transit Companion | Parcial baja |
| 20 | Cómo me muevo aquí | Parcial |
| 21 | Offline mobility pack | No funcional |
| 22 | Clima contextual | Parcial |
| 23 | Motor “si cambia clima” | No funcional |
| 24 | Travel Wallet | Funcional |
| 25 | OCR documental | Funcional base |
| 26 | Modo robo / pérdida | Parcial baja |
| 27 | Emergency Travel Card | Funcional |
| 28 | QR de emergencia | Funcional |
| 29 | Modo acompañante | Parcial baja |
| 30 | Live Safety Tracking | No funcional |
| 31 | SOS Flow | Funcional base (asistido) |
| 32 | Safe Walk / Safe Return | No funcional |
| 33 | Health Travel Module | No funcional |
| 34 | Condiciones especiales | Parcial |
| 35 | Traductor contextual | Parcial |
| 36 | Centro de mensajes de viaje | No funcional |
| 37 | WhatsApp utility layer | Funcional base |
| 38 | Budget Companion | No funcional |
| 39 | Viaje compartido (gastos) | No funcional |
| 40 | Reservation Import Engine | Parcial |
| 41 | Centro de reservas | Parcial |
| 42 | Travel Memory Layer | No funcional |
| 43 | Recomendaciones post-viaje | No funcional |
| 44 | IA asistente transversal | Parcial baja |
| 45 | Replaneación en tiempo real | No funcional |
| 46 | Modo viaje con ansiedad | No funcional |

## 5) Hallazgos críticos para Android testing (P0/P1)

### P0 (bloquea calidad de test serio)
1. **Texto hardcodeado en módulos críticos** (mezcla ES/EN) rompe regla i18n y experiencia.
2. **Colores fuera de paleta oficial** presentes en código.
3. **Risk zones inestable** (estado unknown/error frecuente en UI real).
4. **Clima diario no confiable en todos los escenarios de viaje** (depende de premium, fechas, datos, fallback).
5. **Premium móvil no listo** (RevenueCat no operativo, solo web Stripe).
6. **Split bill y budget no persistentes** (no cumplen alcance v2/v3).

### P1 (no bloquea abrir APK, sí bloquea promesa V3 completa)
1. Safety tracking realtime inexistente.
2. Safe walk/safe return inexistente.
3. Roadtrip avanzado incompleto.
4. Importación de reservas por correo inexistente.
5. Wallet sin expiraciones/alertas robustas.
6. Recomendaciones/Tips aún con capa estática alta.
7. UI/claims de módulos más avanzada que su backend real en algunos casos.

## 6) Qué sí sirve hoy (real, no mock)
- Onboarding y creación de viaje.
- Destino real con Places (autocomplete + details + resolve).
- Packing base con persistencia real + custom item sync remoto.
- Luggage assistant base (perfil, escaneo, detecciones, layout plan, evidencia).
- Agenda CRUD.
- Itinerary CRUD.
- Places CRUD.
- Wallet docs y OCR base.
- Emergency profile + QR público + logs QR + SOS asistido.
- Premium web con Stripe.
- Build/lint/test/smoke pasan.

## 7) Qué NO está listo para vender como “completo”
- Safety tracking realtime y companion operativo.
- Safe walk / safe return.
- Budget companion persistente y shared finance completo.
- RevenueCat/IAP móvil productivo.
- Importación automática de reservas desde correo.
- Risk zones geográfica avanzada (polígonos/rerouting).
- Itinerario inteligente completo con replaneación automática robusta.

## 8) Veredicto pre-subida Android
Si subes hoy a testing interno de Android, la app **sí puede probarse como V3 parcial funcional**, pero **no como V3 completa cerrada** según Manifiesto v2 + versión v3.

Recomendación técnica de release labeling para evitar sobreventa:
- Etiquetar build de prueba como: **"V3 Beta operativa"** o **"V3 core"**.
- No etiquetar como “V3 completa” hasta cerrar P0/P1 anteriores.

## 9) Referencias de evidencia (archivos auditados)
- `MANIFIESTO VIAZA.md`
- `Manifiesto v2.md`
- `viaza_version_v3_25_mzo.md`
- `viaza/src/app/router/index.tsx`
- `viaza/src/app/store/useAppStore.ts`
- `viaza/src/engines/activeModulesEngine.ts`
- `viaza/src/modules/trips/pages/HomePage.tsx`
- `viaza/src/modules/onboarding/pages/TransportPage.tsx`
- `viaza/src/modules/trips/pages/TripRoutePage.tsx`
- `viaza/src/modules/packing/pages/LuggageAssistantPage.tsx`
- `viaza/src/services/packingValidationService.ts`
- `viaza/src/services/packingMediaService.ts`
- `viaza/src/modules/wallet/pages/WalletPage.tsx`
- `viaza/src/services/emergencyService.ts`
- `viaza/src/services/emergencyAssistService.ts`
- `viaza/src/modules/emergency/pages/EmergencyCardPage.tsx`
- `viaza/src/modules/split-bill/pages/SplitBillPage.tsx`
- `viaza/src/services/premiumService.ts`
- `viaza/src/modules/translator/services/translateService.ts`
- `viaza/src/modules/local-tips/utils/localTipsData.ts`
- `viaza/src/modules/survival-tips/utils/survivalTipsData.ts`
- `viaza/supabase/schema_viaza.sql`
- `viaza/supabase/functions/risk-zones/index.ts`
- `viaza/supabase/functions/weather-cache/index.ts`
- `viaza/supabase/functions/routes-transit/index.ts`
