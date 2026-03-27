# AUDITORIA VIAZA V3 - PRODUCCION
Fecha: 2026-03-25
Scope: `/Users/pg/Documents/VIAZA/viaza` + revision de artefactos en `/Users/pg/Documents/VIAZA`.

## 1) Resumen Ejecutivo
- Estado global V3 (contra tu lista de 25 modulos): **parcial**.
- Compilacion web: **OK** (`npm run build`).
- Lint: **fallando** (config ESLint externa incompleta).
- Mocks: hay modulo con comportamiento real, pero todavia hay piezas "solo UI/local" y mensajes de fallback/MVP.
- Preparacion para produccion en 48h: **viable solo si se recorta scope a MVP critico y se cierran bloqueantes P0/P1**.

### Estado por severidad
- P0 (bloqueante prod): 6
- P1 (alto): 9
- P2 (medio): 8

## 2) Auditoria Por Modulo (Lista V3 de 25)
| # | Modulo | FE | BE | Persistencia | Estado | Brecha principal | Prioridad |
|---|---|---|---|---|---|---|---|
| 1 | Onboarding inteligente | Si | Si | Si (`trips`) | Parcial | Falta presupuesto y destinos secundarios en modelo/flujo | Alta |
| 2 | Dashboard dinamico | Si | Parcial | Si | Parcial | No existe motor formal de pendientes criticos/what-next con reglas robustas | Alta |
| 3 | Itinerario inteligente | Si | Si | Si (`itinerary_events`) | Parcial | No hay optimizacion por zona/clima/tiempo/presupuesto | Critica |
| 4 | Recomendaciones contextuales | Si | Si | Parcial | Parcial | Recomendacion en vivo existe, pero no persiste en `trip_recommendations` | Alta |
| 5 | Clima contextual | Si | Si | Si (`trips.weather_forecast_daily`) | Parcial | Sin alertas climaticas automticas ni impacto automatico al itinerario | Alta |
| 6 | Transporte y movilidad | Si | Si | No | Parcial | Solo rutas puntuales; sin multimodal real completo/offline pack | Alta |
| 7 | Modo auto / roadtrip | Si | Parcial | No | Parcial | Sin casetas/gasolineras/paradas seguras/check mecanico/evaluacion | Alta |
| 8 | Modo avion / vuelos | Si | Si | Parcial | Parcial | Sin check-in integration ni alertas push de cambios | Alta |
| 9 | Smart Packing | Si | Si | Si (`packing_items`) | Parcial alto | Generador fuerte, pero custom items no sincronizan remoto | Critica |
| 10 | Escaner maleta / vision | Si | Si | No | Parcial | No hay deteccion de objetos/faltantes real contra checklist | Alta |
| 11 | Motor acomodo maleta | Si | Si | No | Parcial | Recomendacion IA textual, sin modelo estructurado por medidas/capacidad | Media |
| 12 | Agenda personal | Si | Si | Si (`agenda_items`) | Parcial | Recurrencia se guarda, pero no se programa recurrencia real | Critica |
| 13 | Travel Wallet | Si | Si | Si (`wallet_docs` + bucket) | Parcial | Sin expiraciones/alertas/document model completo (pasaporte, visas, etc.) | Alta |
| 14 | OCR documental | Si | Si | Parcial | Parcial | OCR + parse existe, falta clasificacion fuerte y vencimientos | Alta |
| 15 | Emergency Travel Card | Si | Si | Si (`emergency_profiles`) | Casi completo | Falta auditoria/historial de accesos publicos | Alta |
| 16 | QR de emergencia | Si | Si | Si (token + RPC) | Parcial alto | Sin registro de escaneos/accesos | Alta |
| 17 | Safety tracking | No | No | No | No iniciado | Sin realtime location/ETA/check-in | Critica |
| 18 | SOS / WhatsApp / alertas | No | No | No | No iniciado | No existe flujo SOS integrado | Critica |
| 19 | Modulo de salud | Parcial | Parcial | Parcial | Parcial bajo | Solo piezas en agenda/emergency; sin hospitales/farmacias/med scheduler robusto | Alta |
| 20 | Traductor | Si | Si | No | Parcial | Texto + frases OK; sin voz/modo emergencia conversacional | Media |
| 21 | Importacion de reservas | Si | Si | Si (`itinerary_events`) | Parcial | Parsea texto pegado; no lectura directa correo/inbox | Alta |
| 22 | Presupuesto del viaje | Parcial | No | No | No iniciado funcional | `split-bill` es calculadora local; no budget real por viaje/categorias | Critica |
| 23 | Memoria / bitacora | No | No | No | No iniciado | No existe modulo de journal/fotos/notas por dia | Media |
| 24 | IA contextual del viaje | Parcial | Parcial | No | Parcial bajo | IA puntual por feature; sin "copiloto" transversal ni replaneacion global | Alta |
| 25 | Zonas de riesgo / seguridad geo | No | No | No | No iniciado | Sin dataset riesgo, sin geofencing, sin rerouting seguro | Critica |

## 3) Supabase: Inventario Completo

### 3.1 Tablas detectadas en `schema_viaza.sql`
`profiles`, `emergency_profiles`, `trips`, `travelers`, `packing_items`, `packing_evidence`, `luggage_photos`, `trip_activities`, `departure_reminders`, `split_bill_sessions`, `split_bill_expenses`, `payments`, `places_cache`, `trip_places`, `itinerary_events`, `agenda_items`, `wallet_docs`, `trip_recommendations`.

Vista: `user_subscription`.
Funciones SQL: `handle_new_user`, `set_updated_at`, `handle_payment_completed`, `get_emergency_public_view`.

### 3.2 Uso real desde frontend
- **Usadas activamente**: `profiles`, `emergency_profiles`, `trips`, `travelers`, `packing_items`, `agenda_items`, `itinerary_events`, `trip_places`, `wallet_docs`, `payments`, `user_subscription`.
- **Definidas pero no conectadas en app**: `departure_reminders`, `packing_evidence`, `luggage_photos`, `trip_activities`, `split_bill_sessions`, `split_bill_expenses`, `places_cache`, `trip_recommendations`.

### 3.3 Buckets Storage
- `evidence` (privado): creado en schema, **no usado** por FE actual.
- `luggage` (privado): creado en schema, **no usado** por FE actual.
- `wallet_docs` (privado): **usado**.
- `avatars` (publico): **usado**.

## 4) APIs / Integraciones

### 4.1 Integraciones ya conectadas
- Supabase Auth/DB/Storage/Edge Functions.
- Google Places/Directions/Timezone (via Edge): `places-*`, `routes-transit`, `destination-resolve`.
- Open-Meteo (clima), RestCountries (meta pais), MyMemory (fallback traduccion).
- Aviationstack (vuelos y aerolineas autocomplete).
- ExchangeRate-API (tipos de cambio).
- Stripe (checkout, portal, webhook, sync premium).
- LLM/OCR via `ai-orchestrator` (OpenAI/Anthropic/Groq).
- OSRM directo desde cliente para ruta en auto.

### 4.2 Integraciones faltantes para V3 completo
- Realtime safety tracking: Supabase Realtime + canal de ubicacion/ETA/check-ins.
- SOS + WhatsApp: API de WhatsApp Business/Twilio (o fallback con links prearmados + backend de incidentes).
- Riesgo geografico: proveedor de zonas de riesgo (dataset oficial/tercero) + motor geofencing/reroute.
- Importacion real de reservas por correo: Gmail API / Microsoft Graph / IMAP parser service.
- Roadtrip avanzado: proveedores de casetas/peajes/gasolineras/puntos de descanso en ruta.
- Salud contextual: hospitales/farmacias cercanas por tipo + guardias 24h.
- Budget engine: ledger por viaje, categorias, alertas, split multiusuario persistente.

## 5) Secrets / Variables

### 5.1 Requeridas en Edge Functions
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (o `SERVICE_ROLE_KEY`), `PROJECT_URL` (alias), `GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_SERVER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `EXCHANGE_RATE_KEY`, `AVIATIONSTACK_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PREMIUM_MXN_149_MONTHLY`, `APP_URL`.

### 5.2 Riesgo actual detectado
- `.env.example` no refleja arquitectura actual (habla de keys frontend que ya no son la via correcta para prod).
- Existen variables `VITE_*` locales que no deberian ser la fuente de secretos de backend.

## 6) Hallazgos Criticos (P0)
1. `lint` no ejecuta por config externa rota (`eslint-plugin-react` no resuelto desde config global).
2. No hay suite de tests automatizados (unit/integration/e2e) para release a prod.
3. `addCustomPackingItem` agrega local pero **no sincroniza** con Supabase.
4. Recurrencia de Agenda se guarda, pero notificaciones recurrentes reales no existen.
5. Modulos comprometidos en V3 (17,18,22,25) no iniciados.
6. Hygiene de backend: schema largo con seccion "FIN DEL SCHEMA" y bloques agregados posteriores; falta estrategia de migraciones versionadas.

## 7) Hallazgos Altos (P1)
1. `split-bill` solo calculadora local; tablas backend sin uso.
2. `packing_evidence` y `luggage_photos` estan en schema pero UI persiste en store local.
3. `trip_recommendations`/`places_cache` definidos pero no usados (costo/API optimization pendiente).
4. QR emergencia sin historial de acceso/escaneo.
5. Modulo clima sin alertas proactivas ni reglas de replaneacion automatica.
6. Import reservation solo por pegar texto, no ingestion de correo.
7. Landing mantiene TODO de boton pre-release.
8. Bundle JS principal alto (~1.39 MB) para mobile web.
9. Doble servicio de notificaciones (`src/services/notificationsService.ts` y `src/services/notifications/notificationsService.ts`) aumenta riesgo de divergencia.

## 8) Estado Build/Quality
- `npm run build`: **OK**.
- `npm run lint`: **FAIL** por dependencia/config ESLint externa.
- Pruebas: **No detectadas** (`test/spec`, `vitest`, `jest`, `cypress`, `playwright` no encontrados).

## 9) Que hay fuera de `viaza/` y si moverlo
En `/Users/pg/Documents/VIAZA` hay documentos historicos y SQL/planes. No son runtime de app.
Recomendado para orden inmediato:
- Crear carpeta `viaza/docs/auditoria/` y concentrar auditorias/briefs vigentes.
- Mantener en raiz solo historicos archivados.

## 10) Plan de Cierre 48h (realista)

### Dia 1 (Bloqueantes de salida)
1. Corregir pipeline calidad minima: lint funcional + smoke test automatizado.
2. Arreglar persistencia faltante critica:
   - custom packing items remoto,
   - recurrencia agenda real o deshabilitar feature recurrente en UI,
   - decidir si `luggage_photos`/`packing_evidence` van a prod o se desactivan.
3. Congelar scope V3 prod: dejar solo modulos realmente operables (sin prometer 17/18/22/25 completos).
4. Cerrar `.env.example` y checklist de secrets de Edge para deploy limpio.

### Dia 2 (Hardening + release)
1. Hardening seguridad y datos sensibles (wallet/emergency/QR logs minimos).
2. Verificacion completa RLS/buckets en proyecto Supabase destino.
3. QA de flujo extremo a extremo:
   - Auth -> Onboarding -> Trip -> Packing -> Agenda -> Itinerary -> Wallet -> Premium -> Emergency.
4. Release checklist y rollback plan.

## 11) Recomendacion Final de Scope de Produccion V3
Si sales en 48h sin aumentar equipo, recomiendo:
- **V3 Produccion (si)**: Onboarding, Home, Packing base, Agenda base sin recurrencia avanzada, Itinerary CRUD, Places CRUD, Recommendations basicas, Wallet base + OCR, Premium Stripe, Emergency Card + QR.
- **V3.1 inmediato (post-release)**: Safety tracking, SOS/WhatsApp, Budget engine, Risk zones, Import email real, bitacora.

---
Resultado: el producto ya tiene base robusta de app real, pero **todavia no esta al 100% de la promesa V3 completa**. Si ajustamos scope y cerramos P0/P1 hoy-manana, si puede salir a produccion sin demos ni mocks en los modulos que se publiquen.
