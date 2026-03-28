# AUDITORIA REAL VIAZA V3 PRODUCCION

Fecha: 2026-03-28
Base documental auditada:
- DOCUMENTO_EJECUTIVO_DIRECTOR_PARA_CODEX.md
- MANIFIESTO VIAZA.md
- Manifiesto v2.md
- viaza_version_v3_25_mzo.md

Repositorio evaluado:
- viaza/ (frontend + servicios + supabase schema + edge functions)

## 1) Veredicto ejecutivo (honesto)
VIAZA NO esta en 100% V3 produccion. Estado real: **V3 parcial funcional**.

Resumen duro:
- Hay columna vertebral real: auth, onboarding base, trip object, packing base, agenda CRUD, itinerary CRUD, places CRUD, wallet base, emergency card + QR, premium web, funciones edge de clima/riesgo/lugares/vuelos.
- Hay brechas graves frente al manifiesto: safety tracking real, budget persistente, split bill persistente, rutas por lugar visitado, roadtrip operativo, modo sin señal, centro de reservas, memory layer, IA transversal.
- No detecte un solo modulo estrategico en 100% segun Definition of Done del documento (UX+logica+persistencia+errores+seguridad+integracion+reuso+valor real completo).

## 2) Evidencia tecnica del estado actual
Comandos ejecutados en `viaza/`:
- `npm run build` -> OK
- `npm run lint` -> OK con 17 warnings, 0 errors
- `npm run test:smoke` -> OK (4 files, 7 tests)

Resultados relevantes:
- Build genera bundle de produccion correctamente.
- Lint no bloquea build, pero hay deuda tecnica.
- Smoke tests existen, cobertura funcional de negocio todavia limitada.

## 3) Hallazgos estructurales de backend/datos
Tablas reales presentes en `schema_viaza.sql` (core):
- profiles, emergency_profiles, emergency_qr_access_logs, trips, travelers
- packing_items, packing_evidence, luggage_photos
- suitcase_profiles, packing_scan_sessions, packing_scan_detections, suitcase_layout_plans
- trip_activities, departure_reminders
- split_bill_sessions, split_bill_expenses
- payments, places_cache, trip_places, itinerary_events, agenda_items, wallet_docs
- bloque compat para trip_recommendations

Huecos de modelo para vision completa:
- No hay tablas de budget real por viaje/categoria/ledger.
- No hay modelo de tracking/safety sessions/token efimero por evento.
- No hay modelo de travel memory/journal/checkpoints.
- No hay centro de reservas persistente completo (bandeja de reservas normalizadas).
- No hay modelo geoespacial de zonas/poligonos para riesgo operativo de ruta.

## 4) Matriz real por modulo (1-26)
Escala:
- 80-99: fuerte pero incompleto
- 50-79: parcial funcional
- 20-49: base limitada
- 0-19: no funcional para el alcance prometido

| # | Modulo | % real | Lo que SI funciona hoy | Falta critica para 100% |
|---|---|---:|---|---|
| 1 | Nucleo del viaje / Trip Object | 78% | Onboarding multipaso, trip persisted, travelers, destino y metadatos base | Contexto completo gobernando todos los modulos sin huecos ni inconsistencias |
| 2 | Smart Trip Brain | 42% | Home operativo con tarjetas y estados base | Motor real de prioridades, huecos, "que sigue", replaneacion integral |
| 3 | Smart Packing Engine | 74% | Checklist contextual por viaje + custom items sincronizados | Ajuste avanzado por presupuesto/clima extremo/escenarios complejos |
| 4 | Escaner de maleta / check visual | 68% | Sesiones de scan, detecciones, faltantes/duplicados/inciertos, progreso | Precision y robustez de vision en casos reales variados |
| 5 | Motor de acomodo de maleta | 66% | Perfil de maleta + plan por zonas + persistencia de layout | Optimizacion mas fuerte por volumen/peso/transporte en tiempo real |
| 6 | Reglas especiales de equipaje | 46% | Reglas base y pantallas de apoyo | Reglas dinamicas por aerolinea/restricciones legales con enforcement real |
| 7 | Roadtrip Intelligence | 18% | Ruta global basica auto | Casetas/gasolineras/talleres/paradas seguras/check mecanico/evaluacion de riesgo |
| 8 | Flight Companion / Airport Flow | 57% | Scanner boarding pass, consulta vuelo, reminder salida | Go-Now real con trafico+terminal+alertas y flujo aeropuerto completo |
| 9 | Agenda de viaje | 64% | CRUD persistente agenda_items, categorias, recordatorios base | Recurrencia operativa real y automatizaciones robustas |
| 10 | Itinerario inteligente | 48% | CRUD itinerario por dia/hora persistente | Optimizacion por zona/clima/costo y colaboracion multiusuario |
| 11 | Explorer contextual y recomendaciones | 52% | Nearby real via edge function + guardado en lugares | Persistencia de recomendaciones contextuales y mayor inteligencia situacional |
| 12 | Movilidad urbana y transporte | 34% | Ruta destino global + transit base bus/train | Rutas por lugar visitado + multimodal operativo + criterio por contexto |
| 13 | Weather Intelligence | 59% | Pronostico diario real con cache y fallback | Replaneacion automatica por cambios de clima y cobertura mas alla de casos simples |
| 14 | Travel Wallet | 72% | Upload/download/delete docs con storage y DB | Modelo documental completo y flujo de contingencia integrado |
| 15 | OCR documental | 47% | OCR base + parse por AI orchestrator | Clasificacion fuerte, expiraciones, alertas, modo robo/perdida completo |
| 16 | Emergency Travel Card | 82% | Perfil robusto editable, campos medicos y visibilidad | Integracion profunda con safety runtime y eventos criticos |
| 17 | QR de emergencia | 71% | QR publico, RPC segura, logs de acceso | Expiracion avanzada/modos avanzados/companion completo |
| 18 | Safety Layer | 24% | SOS asistido (WhatsApp/SMS deep link) con ubicacion | Live tracking, safe walk/return, check-ins, trazabilidad por evento |
| 19 | Zonas de riesgo / rutas seguras | 33% | Riesgo por pais via TravelRiskAPI | Riesgo geoespacial por zona/ruta con rerouting operativo |
| 20 | Modo sin señal / remotas | 11% | Persistencia local basica de app state | Pack offline de emergencia + cola SOS/check-ins diferidos |
| 21 | Salud y continuidad personal | 22% | Datos medicos en emergency + packing health basico | Medicacion/dosis/alertas/hospitales-farmacias operativas |
| 22 | Traductor contextual y comunicaciones | 46% | Traductor real (AI+fallback), quick phrases | Centro de mensajes de viaje + capa comunicaciones integral |
| 23 | Finanzas del viaje | 12% | Split bill calculadora local (UI) | Budget persistente + ledger por viaje + split bill compartido real |
| 24 | Reservation Import + Centro reservas | 36% | Parser de texto a evento itinerario (manual paste) | Ingestion real por correo + centro de reservas persistente |
| 25 | Travel Memory Layer | 0% | Sin modulo funcional real | Bitacora, fotos, checkpoints, resumen diario, post-viaje |
| 26 | IA premium / capa wow | 21% | IA puntual en OCR/parse/traduccion/packing layout | Asistente transversal del viaje + replaneacion multi-modulo |

## 5) Estado real de los 4 modulos firma
| Modulo firma | % real | Estado |
|---|---:|---|
| Smart Packing real | 70% | Fuerte pero no cerrado al nivel prometido |
| Travel Wallet + OCR | 60% | Base util, faltan expiraciones y contingencia premium |
| Emergency Card + QR | 76% | Es el mas maduro hoy |
| Safety Layer completa | 24% | Brecha mayor, no vendible como completo |

## 6) Hallazgos criticos visibles (produccion Android)
1. Finanzas: `SplitBillPage` sigue local-only; no usa `split_bill_sessions` ni `split_bill_expenses`.
2. Budget Companion no existe como modulo funcional persistente.
3. Clima puede quedar en "no disponible" para viajes fuera de ventana de forecast o sin sync exitoso.
4. Risk Zones hoy es advisory por pais; no hay riesgo por ruta/lugar.
5. No existe flujo real de "rutas por cada lugar visitado" (solo ruta global principal).
6. SOS no tiene token efimero por evento ni sesion de tracking en backend.
7. Recommendations no persiste en `trip_recommendations` desde UI actual.
8. Reservation import no tiene conector de correo real (solo texto pegado).
9. Premium movil (IAP/RevenueCat) no esta integrado en runtime nativo; premiumService esta orientado a web.
10. Memory/post-viaje no existe funcionalmente.

## 7) Ruta de cierre sugerida (orden tecnico)
1. Finanzas completas (Budget + Split Bill persistente) como primer modulo visible E2E.
2. Safety runtime (tracking + token evento + SOS trazable + safe walk).
3. Movilidad por lugar visitado (itinerary <-> places <-> route legs).
4. Wallet/OCR hardening (expiraciones/alertas/clasificacion robusta).
5. Reservation center real (modelo + pipeline + ingestores).
6. Risk geoespacial por zonas/rutas.
7. Memory layer y post-viaje.

## 8) Conclusión final
- VIAZA tiene base real de producto, pero **no** esta en 100% V3 produccion completa.
- Estado global estimado frente al manifiesto completo: **49%**.
- Estado para testeo Android interno: **viable para testing tecnico**, **no viable aun como cierre de alcance V3 completo prometido**.
- Recomendacion ejecutiva: no venderlo como "terminado" hasta cerrar minimo los bloques 1-4 de la ruta de cierre.

