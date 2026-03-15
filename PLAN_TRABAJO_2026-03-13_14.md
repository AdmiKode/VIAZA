# PLAN DE TRABAJO — VIAZA (13–14 MARZO 2026)

Objetivo: terminar la app “lista para testers” cumpliendo:
- `Manifiesto v2.md` (Trip Object core + flujo maestro + módulos dinámicos)
- `MANIFIESTO VIAZA.md` (visual + i18n + cero emojis + paleta estricta + lógica fuera de componentes)
- `SCHEMA_SOPORTE.sql` → consolidado en `supabase/schema_viaza.sql` (schema único)

Reglas no negociables (DoD global):
- Cero emojis.
- Cero colores fuera de paleta (usar tokens `--viaza-*`).
- Cero strings hardcodeados en UI (todo por i18n con paridad `es/en/pt/fr/de`).
- Cero API keys en frontend (todo proveedor sensible/costoso vía Supabase Edge Functions).
- `user_id` siempre `auth.user.id` (nunca email) para no romper RLS.
- `npm run build` sin warnings/errores.

---

## Prerrequisitos (bloqueantes)

- [ ] Supabase proyecto activo (URL + anon key en `.env`).
- [ ] Stripe (modo test): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PREMIUM_MXN_149_MONTHLY`.
- [ ] Google Places/Maps (server key): `GOOGLE_MAPS_API_KEY` (solo server).
- [ ] Google Routes/Transit habilitado (misma key server): Directions/Routes + Time Zone API habilitadas.
- [ ] IA (server): `OPENAI_API_KEY` (y/o `ANTHROPIC_API_KEY`, `GROQ_API_KEY`).
- [ ] Aviationstack (server): `AVIATIONSTACK_API_KEY`.
- [ ] Confirmación de plataforma testers: Web / Mobile (Capacitor) / ambos.

Estado actual (repo, 13 marzo 2026):
- [x] `supabase/schema.sql` deprecado (no ejecutar por accidente).
- [x] Schema único V2 listo en `supabase/schema_viaza.sql`.
- [x] Edge Functions base ya creadas: Places, Weather, IA, Routes Transit, Flight, Exchange Rates, Stripe.
- [x] Frontend ya consume Edge (cero keys en cliente).

Notas:
- Free plan: no dispara procesos costosos (sin Places, sin clima cacheado, sin traductor, sin OCR, sin recomendaciones).
- Premium plan (149 MXN/mes): habilita Places, clima, packing inteligente, wallet OCR, recomendaciones, traductor y quick phrases.

---

## 13 MARZO (13:00–23:00) — Infra + Flujo Core End-to-End

### 13.1 Supabase DB: schema único + tablas V2 faltantes (13:00–15:30)

- [ ] Aplicar `supabase/schema_viaza.sql` en Supabase (SQL Editor).
- [ ] Verificar RLS: `profiles`, `trips`, `packing_items`, `emergency_profiles` (lectura/escritura del usuario).
- [ ] Crear buckets Storage y reglas mínimas:
  - [ ] `wallet_docs`
  - [ ] `packing_evidence`
  - [ ] `luggage_photos`
- [ ] Completar schema V2 (tablas mínimas) si no existen:
  - [x] `agenda_items` (CRUD + RLS + índices) — incluido en `schema_viaza.sql`
  - [x] `itinerary_events` (CRUD + RLS + índices) — incluido en `schema_viaza.sql`
  - [x] `wallet_docs` (metadata + RLS + índices) — incluido en `schema_viaza.sql`
  - [x] `trip_places` (relación trip <-> place + RLS) — incluido en `schema_viaza.sql`
  - [x] `places_cache` (place_id -> details normalizados + TTL) — incluido en `schema_viaza.sql`
  - [x] `trip_recommendations` (o estado estructurado equivalente) — incluido en `schema_viaza.sql`
- [ ] Servicios frontend para persistencia (no store como verdad final):
  - [ ] `agendaService` (sync)
  - [ ] `itineraryService` (sync)
  - [ ] `walletService` (sync + storage)
  - [ ] `placesService` (sync)

Entregable:
- DB soporta Trip Object + módulos core con persistencia real.

### 13.2 Edge Functions: base obligatoria (15:30–19:00)

Carpeta: `supabase/functions/*`

**Places (Premium)**
- [x] `places-autocomplete` (input, lang, optional country bias)
- [x] `places-details` (place_id -> lat/lon + name + country_code)
- [x] Resolver y regresar metadata obligatoria para Trip (`destination-resolve`):
  - [x] `destination_place_id`
  - [x] `destination_name`
  - [x] `destination_country`
  - [x] `destination_timezone` (IANA)
  - [x] `destination_currency`
  - [x] `destination_language`
  - [x] `lat`, `lon`

**Weather (Premium)**
- [x] `weather-cache` por `trip_id` + fechas → carrusel diario (mañana/tarde/noche)
- [x] Persistir en `trips.weather_forecast_daily`

**Rutas transporte público (Premium / V1 global)**
- [x] `routes-transit` (Google Directions/Routes en modo transit) → líneas, estaciones, transbordos, duración, pasos
- [x] Frontend consume ruta solo por Edge (cero keys), y renderiza “cómo llegar” operativo

**IA (Premium)**
- [x] `ai-orchestrator` (único punto de IA)
- [x] Tasks mínimas:
  - [x] `translation`
  - [x] `boarding_pass_ocr`
  - [x] `reservation_parse`
  - [x] `luggage_analysis`
  - [x] `reviews_summary`

Regla:
- [x] Frontend consume Edge vía `supabase.functions.invoke()`; ningún fetch directo a OpenAI/Google/Aviationstack.

Entregable:
- Infra server lista para Places/IA/Weather sin llaves en cliente.

### 13.3 Stripe: Premium 149 MXN/mes end-to-end (19:00–21:00)

- [ ] Crear/confirmar en Stripe:
  - [ ] Product: “VIAZA Premium”
  - [ ] Price: 149 MXN / mes (recurrente)
- [ ] Edge:
  - [x] `stripe-create-checkout-session` (retorna `checkout_url`)
  - [x] `stripe-webhook` (source of truth: `profiles.plan` + `plan_expires_at`, registrar en `payments`)
  - [x] `stripe-customer-portal` (gestión suscripción)
- [ ] Frontend:
  - [x] `purchasePremium()` -> Edge checkout (eliminar Payment Link hardcodeado)
  - [x] `isPremium` se deriva de Supabase (`profiles.plan`) y se refresca al login.

Entregable:
- Upgrade/downgrade funciona y gating Premium es real.

### 13.4 Onboarding V2 corto: Trip Context + Traveler Profile (21:00–23:00)

Regla:
VIAZA no “organiza” ni activa módulos inteligentes hasta tener contexto completo.

- [x] Reordenar onboarding (máximo 6–7 pasos):
  - [x] `travel_type`
  - [x] `destination` (Free manual / Premium Places)
  - [x] `dates`
  - [x] `transport_mode`
  - [x] `traveler_group` + conteos (adultos/niños/bebés)
  - [x] `travel_style` + `traveler_profile`
  - [ ] Condiciones especiales (alto nivel) → `health_context` / `emergency_context`
- [x] Cuestionario ultra-corto para inferir `traveler_profile`:
  - [x] 1 pregunta (selector de perfil)
  - [x] Persistir `traveler_profile` en `trips`
  - [x] Derivar `price_level_max` (engine) para recomendaciones
- [x] Al crear viaje:
  - [x] persistir Trip Object (incluye metadata destino en Premium)
  - [x] disparar `active_modules` inicial y render del dashboard

Entregable:
- Flujo end-to-end: Auth → Onboarding → Trip persistido → App lista para operar el viaje.

---

## 14 MARZO — Producto Completo + Limpieza Visual/i18n + QA

### 14.1 Dashboard V2 dinámico + active_modules (09:00–12:30)

- [x] Implementar `activeModulesEngine` (entrada: TripContext + plan + trip_phase; salida: `active_modules`)
- [x] Persistir `active_modules` en `trips.active_modules`
- [x] Dashboard filtra módulos/herramientas por `active_modules` (MVP)
- [x] Clima: UI consume `weather_forecast_daily` (cacheado, no fetch por render)

Entregable:
- Dashboard cambia por contexto del viaje y plan.

### 14.2 Places + recomendaciones con presupuesto (12:30–15:30)

- [x] `places-nearby` (Edge) con filtros por contexto (incluye `price_level_max` por `traveler_profile`)
- [x] UI `/recommendations` (Premium) + i18n + guardado en `trip_places`
- [ ] `reviews-summary` (Edge vía `ai-orchestrator`) para texto corto en idioma activo
- [ ] Ranking mínimo obligatorio:
  - [x] respetar `traveler_profile` → `price_level_max`
  - [ ] señales por `traveler_group` (familia/bebé) y `transport_mode`
- [ ] Cero recomendaciones genéricas (si no hay TripContext, no hay módulo)

Entregable:
- Recomendaciones “con contexto” y con control de precio.

### 14.2B Transporte público precisión (GTFS/GTFS-Realtime) (15:30–17:00)

- [ ] Definir ciudades/regiones prioritarias (lista corta) para GTFS
- [ ] Integración por ciudad:
  - [ ] ingest/normalización GTFS (stops, routes, trips, stop_times)
  - [ ] soporte GTFS-Realtime donde exista (vehicle positions / trip updates / alerts)
- [ ] Regla: no integrar Moovit como dependencia principal en esta fase

### 14.3 Translator + Quick Phrases (15:30–17:30)

- [x] Traductor (Premium) usa Edge (`ai-orchestrator` task `translation`)
- [x] i18n UI (claves críticas) con paridad `es/en/pt/fr/de` (sin hardcode en Translator/Onboarding)
- [x] Quick Phrases categorías completas:
  - [x] `airport`
  - [x] `hotel`
  - [x] `restaurant`
  - [x] `transport`
  - [x] `shopping`
  - [x] `emergency`
  - [x] `health`
  - [x] `directions`
  - [x] `basic_conversation`
- [x] Respeta idioma activo de la app (default “from” = idioma de app)

Entregable:
- Traductor operativo + frases rápidas completas.

### 14.4 Wallet + OCR + Agenda + Itinerary (17:30–20:30)

**Wallet**
- [x] Subida de documentos a Storage + registro en `wallet_docs` (`/wallet`)
- [ ] OCR (Premium) via Edge:
  - [x] boarding passes (usa `ai-orchestrator` task `boarding_pass_ocr`)
  - [x] reservas/tickets (MVP imágenes: `document_ocr` → `reservation_parse`)
- [ ] Auto-crear items de agenda/itinerary desde OCR (Premium)

**Agenda**
- [x] CRUD `agenda_items` con sync Supabase
- [ ] Notificaciones (si Capacitor aplica)

**Itinerary**
- [x] CRUD `itinerary_events` con sync Supabase
- [ ] Conexión con wallet/places

Entregable:
- Wallet inteligente + agenda operativa + itinerario funcional.

### 14.5 Packing V2 + evidencia + luggage analysis (20:30–22:00)

- [ ] Packing engine usa: destino + fechas + clima + travelers + `luggage_strategy` + `travel_style`
- [ ] Persistencia `packing_items` correcta (incluye `required`)
- [ ] Evidencia por item (`packing_evidence`)
- [ ] Luggage analysis (Premium) por foto via Edge (`ai-orchestrator` task `luggage_analysis`)

Entregable:
- Smart Packing operativo + evidencia + análisis de maleta.

### 14.6 Limpieza Manifiesto Visual + i18n parity + QA build (22:00–23:00)

- [ ] Barrido “cero colores fuera de paleta” en pantallas core
- [ ] Barrido “cero hardcode strings” en pantallas core
- [ ] Iconos estilo VIAZA (duotone) en navegación y cards core
- [ ] Verificar paridad llaves i18n `es/en/pt/fr/de`
- [ ] `npm run build` limpio
- [ ] Smoke test completo:
  - [ ] crear viaje Free
  - [ ] upgrade a Premium
  - [ ] crear viaje Premium con Places real
  - [ ] clima cacheado
  - [ ] recomendaciones con filtro de precio
  - [ ] traductor
  - [ ] wallet OCR
  - [ ] emergency card + QR público consentido

---

## Bloqueadores conocidos (si aparecen)

- Places: timezone/currency/language requieren resolución server-side (no “adivinar” en cliente).
- Cualquier key detectada en frontend bloquea release.
- Si UI tiene colores fuera de paleta/hardcode en pantallas core, bloquea testers.
