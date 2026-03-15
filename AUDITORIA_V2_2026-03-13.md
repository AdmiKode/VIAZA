# AUDITORÍA EXHAUSTIVA — VIAZA (Operativo V2 + Visual)
Fecha: 13 de marzo de 2026  
Objetivo: comparar el estado actual del repo vs la “verdad oficial” (manifiestos + schema soporte), señalar brechas, y dejar un plan de acomodo por prioridades.

Fuentes de verdad (oficiales):
- `MANIFIESTO VIAZA.md` (visual: paleta, tipografía, iconografía, i18n, reglas absolutas)
- `Manifiesto v2.md` (operativo: Trip Object core + flujo maestro + módulos dinámicos)
- `SCHEMA_SOPORTE.sql` (schema base)

Fuente de verdad del schema a usar en Supabase:
- `supabase/schema_viaza.sql` (derivado de `SCHEMA_SOPORTE.sql`)
- `supabase/schema.sql` está deprecado (se dejó intencionalmente no ejecutable para evitar duplicidad).

---

## 1) Diagnóstico rápido (estado actual del repo)

Lo que ya está alineado o encaminado:
- Existe `supabase/schema_viaza.sql` y ya contiene extensiones + RLS + enums actualizados (`subscription_plan = free|premium`, `traveler_role = adult|kid|baby`, `luggage_size = cabin|medium|large|extra_large`).
- `public.trips` ya incluye campos de Trip Object V2 relevantes: `destination_place_id`, `destination_timezone`, `traveler_profile`, `travel_style`, `luggage_strategy`, `active_modules`, `weather_forecast_daily`, `*_state` (wallet/agenda/translator/recommendations).
- Existe `public.emergency_profiles` con `public_token` y RPC pública segura: `public.get_emergency_public_view(token)`.
- En frontend ya existe `TripContext` básico en `viaza/src/engines/tripContextEngine.ts` con `travelerProfile -> priceLevelMax` (base para recomendaciones por presupuesto).
- Se removieron emojis en UI donde aplicaba, y ya hay i18n keys nuevas para `travelerProfile` y `travelStyle` en `es/en/pt/fr/de`.

Brechas críticas que siguen abiertas (alto impacto):
- Onboarding todavía usa búsquedas/heurísticas (Nominatim / Open-Meteo geocoding) y no cumple “Destino real desde Places” para Premium.
- Muchas APIs con costo/llaves siguen en frontend (OpenAI/Google Places/Aviationstack/Stripe).
- No existe capa de Edge Functions (no hay `supabase/functions/` en el repo todavía).
- Persistencia Supabase incompleta: hay tablas no usadas por app (ej. `trip_activities`, `travelers`) y módulos en app sin tabla (agenda/itinerary/places/wallet).
- UI incumple manifiesto visual en muchos módulos: hardcode de textos, colores fuera de paleta, gradients y estilos inline.

---

## 2) Principio operativo V2 que debe gobernar el sistema

Regla central:
VIAZA solo debe “organizar” y activar módulos inteligentes cuando el sistema ya conoce el **Trip Context** (contexto real).

Variables mínimas para que exista Trip Context confiable:
- Destino (real) + metadata: place_id, lat/lon, país, timezone, currency, language
- Con quién viaja (grupo y conteos; idealmente roles)
- Cómo se traslada (transport_mode)
- Estilo de viaje / equipaje (travel_style y/o luggage_strategy)
- Perfil del viajero (traveler_profile, inferido por cuestionario corto)

Mientras esto no exista:
- No se debe mostrar dashboard “inteligente” ni recomendaciones.
- No se deben disparar procesos costosos (IA, Places, OCR, clima cacheado).

---

## 3) Onboarding V2 (corto, clave) — propuesta de flujo

Objetivo del onboarding:
capturar el mínimo de señales para construir Trip Context y activar módulos correctos.

Secuencia propuesta (6–7 pasos máximo):
1) `travel_type` (beach/city/mountain/camping/snow/roadtrip/work/adventure)
2) `destination` (Free: texto manual; Premium: Google Places + metadata obligatoria)
3) `dates` (start/end; duración derivada)
4) `transport_mode` (flight/car/bus/train/boat/other)  
   - si `car`: pedir origen (place_id o ciudad) para ruta luego  
   - si `flight`: opcional “flight number” (no obligatorio en onboarding corto)
5) `traveler_group` + conteos (adult/kid/baby)  
6) `luggage_strategy` (individual, shared, family_shared, mother_baby, etc) + `travel_style` (backpack_light/standard/comfort)
7) “Condiciones especiales” (checkbox corto): bebé, embarazo, adulto mayor, medicamentos, alergias, padecimientos clave  
   - esto alimenta `health_context` y `emergency_context` (alto nivel)

Luego:
Resumen → “Crear viaje” → nace Trip Object persistido en Supabase → se calcula Trip Context → se asigna `active_modules` → se renderiza dashboard V2.

Qué se elimina o se reubica:
- Actividades/laundry/climate manual solo si no agregan valor directo y hacen el onboarding largo.
- “Smart Trip Detection” basado en heurísticas debe ser reemplazado por: Places (metadata real) + clima cacheado por viaje.

---

## 4) Cuestionario corto para inferir “Traveler Profile” (presupuesto)

Requisito:
inferir perfiles: `economic | balanced | comfort | premium` sin hacer un onboarding largo.

Propuesta: 2 preguntas (máximo 20–25 segundos)

Pregunta A (principal, 1/2):
“¿Qué tan importante es mantenerte dentro de presupuesto en este viaje?”
- Opción 1: “Muy importante (quiero gastar lo mínimo)”
- Opción 2: “Importa, pero sin sacrificar todo”
- Opción 3: “Prefiero comodidad aunque cueste más”
- Opción 4: “Quiero experiencias top”

Señal directa:
`budget_intent = 1..4`

Pregunta B (ajuste fino, 2/2):
“Cuando eliges restaurantes/actividades, normalmente buscas…”
- Opción 1: “Precio bajo / bueno bonito barato”
- Opción 2: “Mejor relación valor/precio”
- Opción 3: “Buena calidad y comodidad”
- Opción 4: “Lo mejor disponible”

Señal:
`spend_preference = 1..4`

Inferencia (determinista, sin IA todavía):
- `score = round((budget_intent*0.6) + (spend_preference*0.4))`
- map:
  - 1 → `economic`
  - 2 → `balanced`
  - 3 → `comfort`
  - 4 → `premium`

Salida:
- guardar `traveler_profile` en `public.trips.traveler_profile`
- derivar `price_level_max` para Places:
  - economic → 1
  - balanced → 2
  - comfort → 3
  - premium → 4

Uso obligatorio:
- Recomendaciones y ranking de lugares deben filtrar/penalizar lugares cuyo `price_level` supere `price_level_max`.
- La IA (packing/reviews summary/recommendations) debe recibir este dato como parte del contexto, para evitar sugerencias fuera de perfil.

Nota:
Si se prefiere “1 sola pregunta”, se puede sustituir por una pregunta única tipo:
“En este viaje busco…” (ahorrar / balance / comodidad / top) → mapea directo a `traveler_profile`.

---

## 5) Active Modules Engine (dashboard dinámico)

Requisito V2:
dashboard dinámico por contexto + plan (Free/Premium).

Entrada:
- `TripContext` (destino + transport + travelers + luggage + traveler_profile + trip_phase)
- `plan` (free/premium)

Salida:
- `active_modules: string[]` persistido en `public.trips.active_modules`

Ejemplo de reglas (mínimas):
- Base (siempre): `agenda_basic`, `wallet_basic`, `emergency`
- Si Premium y destino real (place_id + lat/lon):
  - activar `weather` (carrusel diario cacheado)
  - activar `recommendations` (Places + ranking)
  - activar `translator` + `quick_phrases`
- Si `transport_mode=flight`:
  - activar `airport_logistics`, `boarding_pass_ocr` (Premium), `airline_rules`
- Si `transport_mode=car`:
  - activar `route`, `stops`, `safety_zones` (Premium si usa APIs)
- Si `traveler_group` incluye bebé o `health_context` no vacío:
  - activar `meds_reminders`, `emergency_card_focus`
- Si `travel_style=backpack_light`:
  - packing enfatiza “minimal + layers”; lista distinta
- Si `luggage_strategy` compartida:
  - packing por “maletas” y “owner”; no solo por persona

Regla:
si `TripContext` no está completo → `active_modules` debe ser mínimo y el UI debe empujar a completar contexto, no a “explorar módulos sueltos”.

---

## 6) Destino (Google Places) — estado vs requerido

Requerido por V2:
- Onboarding Premium debe usar Google Places (no Nominatim).
- Guardar mínimo:
  - `destination_place_id`, `destination_name`, `destination_country`, `destination_timezone`,
    `destination_currency`, `destination_language`, `lat`, `lon`

Estado actual:
- Todavía existe Nominatim en `viaza/src/engines/destinationSearch.ts`.
- `AddPlacePage` llama Google Places desde el frontend con `VITE_GOOGLE_MAPS_KEY` (prohibido) y además sufre CORS.

Acción recomendada:
- Crear Edge Functions:
  - `places-autocomplete` (input -> predictions)
  - `places-details` (place_id -> geometry + country_code + name/address)
  - `trip-destination-resolve` (orquesta: details + timezone/currency/language derivado)
- Frontend solo consume `supabase.functions.invoke(...)` (sin llaves).
- Persistir metadata en `public.trips` al crear viaje.

Timezone/currency/language:
- timezone: resolver por lat/lon (Time Zone API o librería offline).
- currency/language: map por país (tabla estática o JSON server-side).

---

## 7) Seguridad: llaves y costos (prohibido en frontend)

Regla:
Ninguna API key (ni de IA ni de proveedores) vive en frontend.

Estado actual (violaciones):
- Traducción: `viaza/src/modules/translator/services/translateService.ts` usa `VITE_OPENAI_API_KEY`.
- OCR: `viaza/src/services/boardingPassScanner.ts` usa `VITE_OPENAI_API_KEY`.
- Luggage analysis: `viaza/src/modules/packing/pages/LuggageAssistantPage.tsx` usa `VITE_OPENAI_KEY`.
- Places: `viaza/src/modules/places/pages/AddPlacePage.tsx` usa `VITE_GOOGLE_MAPS_KEY`.
- Aviationstack: revisar `viaza/src/modules/airline/services/airlineService.ts` (debe moverse a Edge).
- Stripe web: `viaza/src/services/premiumService.ts` usa Payment Link; no es flujo controlado por backend.

Acción recomendada:
- Implementar capa Supabase Edge Functions + “AI Orchestrator” (ver punto 9).
- Cambiar frontend a llamadas internas.

---

## 8) Persistencia: schema vs app (gap real)

Schema actual en `supabase/schema_viaza.sql` incluye:
- `profiles`, `trips`, `travelers`, `packing_items`, `packing_evidence`, `luggage_photos`,
  `trip_activities`, `departure_reminders`, `split_bill_*`, `payments`

App actual incluye módulos/estados que NO tienen tabla o NO se usan:
- Agenda (`agendaItems`) → falta `agenda_items` (con RLS) y servicios de sync
- Itinerary (`itineraryEvents`) → falta `itinerary_events`
- Places (`savedPlaces`) → falta `trip_places` y/o `places_cache`
- Wallet (documentos) → falta `wallet_docs` + Storage buckets y metadata
- Recommendations cache → falta `trip_recommendations`/`recommendations_state` real
- Travelers en DB existen, pero no hay servicios `.from('travelers')` en app (hoy se quedan en Zustand)

Acción recomendada:
- Completar schema con tablas V2 mínimas:
  - `agenda_items`
  - `itinerary_events`
  - `wallet_docs`
  - `trip_places` (relación trip<->place)
  - `places_cache` (place_id -> details normalizados)
  - `trip_recommendations` (o usar `recommendations_state` pero con persistencia estructurada)
- Implementar servicios de sync por módulo y no depender de store como “verdad final”.

---

## 9) Arquitectura de IA (Orchestrator) — requerido

Requisito:
un solo punto de entrada para IA, siempre server-side.

Edge Function sugerida: `ai-orchestrator`
Entrada:
- `task_type` (boarding_pass_ocr, luggage_analysis, reservation_parse, reviews_summary, translation, quick_phrase_localization)
- `payload`
- `trip_context` (incluye traveler_profile + price_level_max)
- `language_context` (idioma activo app)

Salida:
- JSON estandarizado por tarea
- logs + control de costos + rate limiting

Frontend:
- reemplazar fetch directo a OpenAI por `supabase.functions.invoke('ai-orchestrator', ...)`

---

## 10) Traductor (UI i18n + Travel Translator) — requerido

Requisito:
- UI 100% i18n (`es/en/pt/fr/de`) sin strings hardcodeados.
- Módulo Translator:
  - traducción libre
  - Quick Phrases por categorías:
    - airport, hotel, restaurant, transport, shopping, emergency, health, directions, basic conversation
  - respeta idioma activo de la app y el “to/from” del traductor
- Premium-only (por costo)

Estado actual:
- Translator UI existe, Quick Phrases existe pero faltan categorías (shopping/health/directions/basic conversation).
- Traducción usa OpenAI en frontend (prohibido).

Acción recomendada:
- Mover traducción a `translator-service` (Edge) o a `ai-orchestrator` con `task_type=translation`.
- Completar categorías y keys en `es/en/pt/fr/de`.

---

## 11) Stripe (Free vs Premium 149 MXN/mes) — requerido

Requerimiento de producto:
- Plan Free (sin procesos costosos).
- Plan Premium 149 MXN / mes (suscripción).

Estado actual:
- Existen tablas `payments` y enum `subscription_plan = free|premium` en `schema_viaza`.
- Frontend tiene un flujo placeholder con Payment Link/RevenueCat (no alineado a “fuente de verdad en Supabase”).

Acción recomendada (arquitectura correcta):
1) En Stripe:
   - crear Product: “VIAZA Premium”
   - crear Price: `14900` (MXN en centavos) recurrente mensual
2) En Supabase (Edge Functions):
   - `stripe-create-checkout-session` (server-side, recibe user_id, retorna checkout_url)
   - `stripe-webhook` (actualiza `profiles.plan` y `plan_expires_at` o un `subscriptions` table)
   - opcional: `stripe-customer-portal` para gestionar cancelación/cambio
3) En DB:
   - definir “fuente de verdad” del plan:
     - opción A: `profiles.plan` + `plan_expires_at`
     - opción B: tabla `subscriptions` (recomendado para historial)
4) En frontend:
   - `purchasePremium()` debe invocar Edge Function (no Payment Link hardcodeado)
   - gating real por `isPremium` (derivado de DB/claims), no por flags locales

---

## 12) Emergency Travel Card — estado vs requerido

Requerido:
- `emergency_profiles` con:
  - vínculo opcional a viaje (`trip_id`)
  - token público seguro (`public_token`)
  - consentimiento de campos (`qr_fields_consent`)
  - QR público habilitable (`qr_enabled`)
- Vista pública solo con campos consentidos (sin filtrar por frontend)

Estado actual:
- Tabla + RPC pública segura existen en `schema_viaza`.
- UI existe pero:
  - no está 100% i18n
  - usa colores fuera de paleta en varias pantallas
  - no modela `qr_enabled/qr_fields_consent` de forma completa
  - no vincula el perfil a un viaje

Acción recomendada:
- Ajustar UI para:
  - consent checkboxes (campos públicos)
  - toggle QR enabled
  - asociación a Trip activo (si aplica)
  - 100% i18n + tokens de color

---

## 13) UI (Manifiesto Visual) — auditoría de cumplimiento

Reglas absolutas:
- Cero emojis (ok en `viaza/src`).
- Cero colores fuera de paleta (incumplido en múltiples módulos).
- Tipografía Questrial (mayormente ok).
- Todo texto via i18n (incumplido: muchos strings hardcodeados).
- Lógica fuera de componentes (parcial; hay lógica y fetch en páginas).

Colores fuera de paleta detectados en código (ejemplos, no exhaustivo):
- Colores tipo “Material UI” (azules/verdes/rojos/amarillos) en pantallas de Auth.
- Colores externos para estados/errores y algunos fondos en Emergency/Boarding/Import.
- Gradients inline no tokenizados (Places/Add, Landing, etc).

Hardcode de texto (ejemplos evidentes):
- `viaza/src/modules/places/pages/AddPlacePage.tsx` (labels completos)
- `viaza/src/modules/emergency/pages/*` y `components/*`
- `viaza/src/modules/premium/pages/PremiumPage.tsx`
- `viaza/src/modules/agenda/pages/NewAgendaItemPage.tsx`
- `viaza/src/modules/itinerary/pages/AddEventPage.tsx`
- `viaza/src/app/store/useAppStore.ts` (nombres por defecto “Adulto/Niño/Bebé”)

Acción recomendada (sistémica, no parche):
- Prohibir hex inline: migrar a tokens CSS (`--viaza-*`) y clases utilitarias.
- Reemplazar gradients y estilos inline por componentes UI base (`AppCard/AppButton/AppHeader`) + ThemeProvider.
- Asegurar iconos estilo VIAZA (duotone con offset, capa base accent/secondary + capa superior blanca/soft).
- Añadir verificación automatizada:
  - script que falle si detecta hex no permitido en `viaza/src/**` (lista blanca = paleta + neutrales permitidos)
  - script que detecte strings no-i18n en TSX (heurístico)

---

## 14) Recomendaciones (no genéricas) — cómo se debe conectar

Principio:
Recomendaciones solo existen si dependen de Trip Context + Traveler Profile.

Ranking mínimo (sin IA):
- Filtrar por distancia (lat/lon del trip)
- Filtrar por tipo (según travel_type y travelers)
- Filtrar/penalizar por precio:
  - si `place.price_level > price_level_max` → descartar o downrank fuerte

Con IA (cuando exista `reviews-summary`):
- Resumir reseñas con “criterios de contexto” (familia/bebé/presupuesto/horarios/seguridad)
- Producir “por qué” en 1–2 bullets por lugar (en idioma activo)

---

## 15) Checklist de implementación (orden oficial)

Prioridad 1 (bloqueante):
- Schema único (`schema_viaza.sql`) + eliminar uso real de `schema.sql`
- `user_id = auth.user.id` en todas las escrituras + RLS sin hacks
- Destino Premium por Google Places vía Edge Functions (sin llaves en frontend)
- Persistencia correcta del Trip Object (metadata completa destino)

Prioridad 2:
- Dashboard V2 dinámico por `active_modules`
- Clima como carrusel diario cacheado por viaje

Prioridad 3:
- Packing V2 (luggage_strategy + categorías + evidencia)

Prioridad 4:
- Travel Wallet + OCR (Edge + AI orchestrator)

Prioridad 5:
- Agenda + notificaciones (persistencia + triggers)

Prioridad 6:
- Emergency Travel Card (QR público con consent)

Prioridad 7:
- Traductor + Quick Phrases (premium, server-side)

Prioridad 8:
- Orquestador IA refinado (routing OpenAI/Anthropic/Groq + logging/costos)
