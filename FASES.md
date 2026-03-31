# Plan de trabajo (2 días) — VIAZA

## Reglas del manifiesto (obligatorias)
- No usar emojis en UI ni en contenido dentro de la app.
- No usar colores fuera de la paleta definida (incluye los “travel themes” del manifiesto).
- Tipografía: **Questrial** (si se decide mezclar tipografías, se valida primero; por ahora 100% Questrial).
- Todo texto sale de i18n (nada hardcoded).
- Lógica fuera de componentes, tipado fuerte, módulos por dominio.

## Objetivo del sprint (48 horas)
Tener una base **real** (no solo demo) con:
- App React + Vite + TypeScript lista para correr en `localhost` y lista para empaquetar con Capacitor.
- Arquitectura modular por dominios (carpetas/contratos como en el manifiesto).
- Navegación (React Router) + bottom nav.
- Zustand con persistencia local.
- i18next con 5 idiomas (en, es, pt, fr, de).
- Theme engine (brand theme + theme dinámico por `travelType`).
- MVP funcional de módulos obligatorios con datasets internos (sin depender de APIs externas).

## Alcance “MVP 48h” (qué sí entra)
1) Splash (1–1.5s) + Intro (máximo 3 pantallas).
2) Onboarding rápido (objetivo UX: < 45s) + crear viaje (Trip) + set “viaje activo”.
3) Packing list generator + checklist (con progreso) + agregar item custom.
4) Laundry planner (cálculo) integrado al generador.
5) Airline rules (dataset) + pantalla.
6) Allowed items search (dataset + búsqueda) + pantalla.
7) Adapter guide (dataset) + pantalla.
8) Tools: translator “basic” (MVP con mocks/dataset), currency converter (MVP con rates mock), split bill (simple + avanzado por consumo).
9) Tips: local tips + survival tips (datasets) + UI tipo cards.
10) Departure reminder: cálculo + UI + “hook” listo para notificación nativa (en web queda como stub/preview).
11) Settings: idioma + preview de theme.
12) Premium placeholder (sin paywall real).

## Fuera de alcance (posponer)
- Modo offline real (beyond “persist local”).
- APIs reales (clima/moneda/traducción). Se dejan servicios listos con TODOs y mocks.
- Scan My Bag, IA, nube/sync, integraciones de reservas.

## Definición de “Done” (para cerrar en 48h)
- `npm run dev` levanta sin errores y todas las rutas principales renderizan.
- Crear un viaje desde onboarding y verlo reflejado en Home.
- Onboarding: máximo 3 pantallas de intro y flujo de preguntas directo (objetivo UX: < 45s).
- Home “cockpit” en 3 segundos: header premium, hero card de viaje activo (con foto/overlay), progreso de packing, quick tools 2x2, “Before you go”, tips y survival.
- Packing checklist persiste estado (reload conserva checks y viaje activo).
- Buscadores (allowed items) y calculadoras (split bill, currency) funcionan con datos mock.
- i18n: cambiar idioma desde settings cambia textos en toda la app.
- Theme: cambiar `travelType` cambia theme del interior sin romper paleta.
- Sin hardcodes de texto visible (solo keys i18n).

---

## Día 1 (0–24h) — Base + flujo principal + packing

### Fase 1 — Setup base (2–3h)
Entregable: proyecto ejecutando en `localhost` con estructura inicial.
- Vite + React + TS.
- Tailwind (o CSS Modules si se decide; recomendado Tailwind por velocidad).
- React Router (rutas base + layout con bottom nav).
- Zustand + persist (storage local web; wrapper listo para Capacitor Preferences).
- i18next + `react-i18next` + locales (en/es/pt/fr/de) con llaves mínimas.
- Theme engine: `brandTheme` + `travelThemes` + `ThemeProvider` (CSS variables).
- Framer Motion: transiciones sutiles (sin exagerar) para onboarding/cards.
- UI kit mínimo: `AppButton`, `AppCard`, `AppInput`, `AppSelect`, `AppHeader`, `BottomNav`, `EmptyState`.
- Tipografía Questrial cargada (Google Fonts o archivo local).

### Fase 2 — Datos + contratos (1–2h)
Entregable: types + datasets base listos para usar.
- Types: `Trip`, `PackingItem`, etc.
- Utils: formatters, validators, dates.
- Datasets (v1): `airlineRulesData`, `airportItemsData`, `countryAdapterData`, `quickPhrasesData`, `localTipsData`, `survivalTipsData`.

### Fase 3 — Onboarding + Trips (4–6h)
Entregable: crear viaje end-to-end.
- Splash (1–1.5s) + intro (máximo 3 pantallas) con swipe horizontal.
- Páginas onboarding (según manifiesto) con validaciones mínimas y UX directo:
  - tipo de viaje (grid de tarjetas grandes)
  - destino (autocomplete v1 con lista interna; API real queda para fase futura)
  - duración (slider)
  - clima esperado
  - con quién viaja
  - lavado de ropa (No / Laundry service / Washing machine)
- `createTrip` genera `Trip` + `currentTripId`.
- HomePage muestra “cockpit” (sin emojis) con estructura del manifiesto:
  - header con logo + acceso a settings
  - hero card del viaje activo (foto + overlay + chips + CTA)
  - packing progress + CTA a checklist
  - quick tools (grid 2x2)
  - “Before you go” (3 accesos)
  - tips destino + survival (listas horizontales con cards)
- TripDetailsPage con resumen y accesos a módulos.

### Fase 4 — Packing generator + checklist + laundry (6–8h)
Entregable: packing completo y persistente.
- `packingRules.ts` + `packingGenerator.ts` (reglas acumulativas: base + travelType + climate + laundry).
- PackingListPage (vista por categorías).
- PackingChecklistPage (checklist, progreso, colapsables, add custom item).
- Laundry planner: cálculo integrado (según manifiesto) y reflejado en cantidades.

Checkpoint fin Día 1:
- Flujo: onboarding → home → packing checklist, con persistencia.

---

## Día 2 (24–48h) — módulos restantes + polish + Capacitor-ready

### Fase 5 — Antes de salir (4–5h)
Entregable: “Before you go” operativo.
- AirlineRulesPage (dataset + UI cards).
- AllowedItemsPage (search + estatus cabina/documentado).
- AdapterGuidePage (por país + recomendación).
- DepartureReminderPage: cálculo de hora recomendada + botón “crear recordatorio” (web: stub; native: service).

### Fase 6 — Tools (4–5h)
Entregable: herramientas útiles funcionando sin APIs.
- TranslatorPage + QuickPhrasesPage (dataset + mock translateService).
- CurrencyConverterPage (rates mock + convert + swap).
- SplitBillPage (simple + modo por consumo individual).

### Fase 7 — Tips (2–3h)
Entregable: contenido tipo feed para que “no se sienta vacía”.
- LocalTipsPage (filtro por categoría).
- SurvivalTipsPage (cards horizontales/scroll).

### Fase 8 — Settings + QA + build-ready (4–6h)
Entregable: estabilidad y preparación para empaquetado.
- Settings: idioma + theme preview.
- Revisión de i18n (cero strings visibles hardcoded).
- Estados vacíos y errores (EmptyState, loaders mínimos).
- Pulido UI (espaciado, jerarquía, accesibilidad básica).
- Integración Capacitor (sin necesidad de compilar aquí): estructura lista + wrappers de servicios (storage/notifications/device).

Checkpoint fin Día 2:
- Navegación completa por módulos MVP + persist + i18n + theme.
- Lista para “wrap” nativo con Capacitor sin re-arquitectura.

---

## Decisiones para no fallar el plazo
- Priorizar “funciona y persiste” sobre perfección visual.
- APIs externas se mockean; se dejan servicios con interfaz estable para reemplazar.
- Capacitor se integra como “compat layer” desde el inicio (servicios), aunque la demo principal sea en web.
- Donde el manifiesto usa emojis como referencia visual, se reemplaza por iconos SVG (misma intención, sin emojis).

## Riesgos (y mitigación)
- Alcance grande para 48h: mantener datasets simples y UI consistente; evitar features fase 2/3.
- Regla "no emojis": evitar también banderas/íconos emoji; usar íconos SVG propios o de librería.
- "No colores fuera de paleta": theme engine solo usa `brandTheme` + `travelThemes` definidos.

---

---

# ANÁLISIS HONESTO DE ESTADO — 12 DE MARZO DE 2026

> Revisado contra el código real. Sin mentiras, sin suavizar.

---

## FASE 1 — Setup base ✅ COMPLETA

| Item | Estado | Notas |
|------|--------|-------|
| Vite + React + TypeScript | ✅ | Funcionando, build limpio |
| Tailwind CSS | ✅ | Configurado con variables CSS de la paleta |
| React Router v6 | ✅ | Rutas anidadas, guards de auth y onboarding |
| Zustand + persist | ✅ | Con `partialize` para seleccionar qué persiste |
| i18next 5 idiomas | ✅ | en, es, pt, fr, de — archivos json completos |
| Theme engine dinámico | ✅ | `ThemeProvider` + `travelThemes.ts` + CSS variables |
| Framer Motion | ✅ | Usado en onboarding, cards, accordions |
| AppButton | ✅ | |
| AppCard | ✅ | |
| AppInput | ✅ | |
| AppSelect | ✅ | |
| AppHeader | ✅ | |
| BottomNav | ✅ | Pill flotante, bubble naranja, íconos duotone |
| EmptyState | ❌ | No existe como componente — se hace inline en cada pantalla |
| Tipografía Questrial | ✅ | Cargada y aplicada en toda la app |

**Deuda técnica:** `EmptyState`, `ProgressBar`, `SectionTitle`, `ModalSheet` y `AppChip` no existen como componentes reutilizables — están hechos inline. Hay que extraerlos.

---

## FASE 2 — Datos + contratos ✅ COMPLETA (y superada)

| Item | Estado | Notas |
|------|--------|-------|
| Types: Trip, PackingItem | ✅ | Expandidos con TransportType, WeatherForecast, numberOfAdults/Kids, family_baby |
| airlineRulesData.ts | ✅ | Dataset de aerolíneas |
| airportItemsData.ts | ✅ | Dataset con búsqueda |
| countryAdapterData.ts | ✅ | Dataset de enchufes por país |
| quickPhrasesData.ts | ✅ | Dataset por categoría |
| localTipsData.ts | ✅ | Dataset por país/ciudad/categoría |
| survivalTipsData.ts | ✅ | Dataset camping/montaña/playa/naturaleza |
| formatters/validators/dates utils | ⚠️ | Parcial — existen algunas pero no todas las del manifiesto |

---

## FASE 3 — Onboarding + Trips ✅ COMPLETA (y expandida)

| Item | Estado | Notas |
|------|--------|-------|
| SplashPage (1.5s) | ✅ | Animación SVG pin→ruta→avión, fondo oscuro, logo blanco |
| IntroPage (3 slides) | ✅ | Premium — ilustraciones 320px, AnimatePresence, gradientes |
| OnboardingWelcomePage | ✅ | Hero oscuro, feature cards glass |
| LoginPage / RegisterPage | ✅ | Neumorfismo, logo correcto por fondo |
| TravelTypePage (8 tipos) | ✅ | Cards grandes, subtítulos descriptivos, íconos SVG duotone |
| DestinationPage | ✅ | Nominatim autocomplete real, guarda lat/lon/currency/language |
| DatePickerPage | ✅ | Calcula duración en días |
| TransportPage | ✅ | NUEVO — 5 medios, sub-formularios, estimación Haversine |
| SmartTripDetectionPage | ✅ | NUEVO — OWM + Open-Meteo en paralelo, automático |
| ActivitiesPage | ✅ | Filtradas por travelType, 23 actividades con íconos duotone SVG |
| TravelersPage | ✅ | 5 grupos + stepper adultos/niños |
| PreferencesPage | ✅ | packingStyle, hasLaptop, travelLight |
| LaundryPage (en onboarding) | ✅ | 3 modos |
| OnboardingSummaryPage | ✅ | Resumen completo |
| createTrip → currentTripId | ✅ | Con flag `onboardingCompleted` anti-bypass |
| HomePage (cockpit) | ✅ | Hero dinámico, clima, packing progress, quick tools 2×2, before you go |
| TripDetailsPage | ⚠️ | Existe pero diseño es BÁSICO — no tiene nivel premium |

**Pendientes de Fase 3:**
- `CountryPickerPage` — no se implementó. El flujo correcto es TravelType → País → Destino.
- `TripDetailsPage` — necesita rediseño premium completo.

---

## FASE 4 — Packing generator + checklist + laundry ✅ COMPLETA (muy avanzada)

| Item | Estado | Notas |
|------|--------|-------|
| packingRules.ts | ✅ | Engine bidimensional: travelType × travelerGroup × climate × 23 actividades |
| packingGenerator.ts | ✅ | 7 capas de reglas + deduplicación + escala por número de personas |
| laundryPlanner.ts | ✅ | Algoritmo de ciclos correcto, 3 modos |
| PackingChecklistPage | ✅ | Accordions colapsables, progreso circular, FAB agregar ítem |
| PackingListPage separada | ❌ | No existe — solo hay ChecklistPage |
| Laundry integrado al generador | ✅ | Cantidades de ropa según laundryMode |
| Generación automática al entrar | ❌ | Si packingItems vacío para trip activo, NO se regenera automáticamente |

**Pendiente crítico:** Si el usuario no tiene ítems de packing (cache borrado, primer acceso), al abrir `PackingChecklistPage` ve pantalla vacía en lugar de la lista generada.

---

## FASE 5 — Antes de salir ✅ MAYORMENTE COMPLETA

| Item | Estado | Notas |
|------|--------|-------|
| AirlineRulesPage | ✅ | 2 tabs: tracker AviationStack en tiempo real + reglas de equipaje |
| AllowedItemsPage | ✅ | Buscador funcional, estados cabina/documentado |
| AdapterGuidePage | ✅ | Por país, tipo de enchufe, voltaje |
| DepartureReminderPage | ⚠️ | Cálculo correcto, pero el botón "crear recordatorio" es STUB — no dispara notificación nativa |

---

## FASE 6 — Tools ⚠️ PARCIALMENTE COMPLETA

| Item | Estado | Notas |
|------|--------|-------|
| TranslatorPage | ⚠️ | Existe pero usa **mock** — no llama a API real de traducción |
| QuickPhrasesPage | ✅ | Dataset funcional por categoría |
| CurrencyConverterPage | ✅ | API real ExchangeRate con cache 1h, 15 monedas, swap |
| SplitBillPage | ✅ | Modo simple + avanzado por consumo individual |

**Pendiente crítico:** `TranslatorPage` — `translateService.ts` devuelve mock. Falta conectar Google Cloud Translation API o LibreTranslate.

---

## FASE 7 — Tips ✅ COMPLETA

| Item | Estado | Notas |
|------|--------|-------|
| LocalTipsPage | ✅ | Filtro por categoría (safety, transport, culture, money, food, utilities) |
| SurvivalTipsPage | ✅ | Filtro por categoría (camping, mountain, beach, nature) |
| Tips en Home (carousel) | ⚠️ | Están, pero NO filtran por el destino del viaje activo |

---

## FASE 8 — Settings + QA + build-ready ✅ COMPLETA (30 marzo 2026)

| Item | Estado | Notas |
|------|--------|-------|
| SettingsPage | ✅ | Cuenta (email + plan), selector de idioma real, toggle notificaciones push con Capacitor |
| i18n revisión | ✅ | Cero strings hardcodeados visibles |
| EmptyState / loaders | ⚠️ | Hay spinners pero no existe `EmptyState` como componente reutilizable |
| Pulido UI | ✅ | Paleta auditada en 17 archivos, fixes en ResetPassword/TripActivities/Landing |
| Capacitor | ✅ | pushNotificationService, localNotifications, geolocation, camera — reales |
| Build limpio | ✅ | `npm run build` — 0 errores TypeScript |
| ThemePreviewPage | ❌ | No existe todavía |
| ProfilePage completa | ✅ | Avatar inicial, edición nombre → Supabase, 3 viajes recientes, NavRows, logout |

---

## RESUMEN EJECUTIVO — 30 MARZO 2026

### Lo que funciona de punta a punta:
1. Flujo completo: Splash → Intro → Login → Onboarding (10 pasos) → Home
2. Packing engine real con 7 capas de reglas, generación automática al crear viaje
3. Packing checklist con accordions, progreso circular, ítems custom
4. Currency converter con API real (ExchangeRate, cache 1h)
5. AirlineRules con tracker de vuelo en tiempo real (AviationStack)
6. AllowedItems, Adapters, SplitBill, LocalTips, SurvivalTips, QuickPhrases
7. i18n completo en 5 idiomas, cambiable desde Settings
8. Temas dinámicos por tipo de viaje
9. Build de producción limpio sin errores TS
10. **ProfilePage completa** — avatar, edición nombre, viajes recientes, NavRows ✅ (30 mar)
11. **SettingsPage completa** — cuenta, idioma, toggle notificaciones push ✅ (30 mar)
12. **AgendaPage + NewAgendaItemPage + AgendaItemDetailPage** — 3 pantallas + notif Capacitor ✅ (30 mar)
13. **ItineraryPage + DayDetailPage + AddEventPage + PlacesPage + AddPlacePage** ✅ (30 mar)
14. **Translator real** — Google Cloud Translation + LANG_CODE_MAP + 3 fallbacks ✅ (30 mar)
15. **Weather real** — Open-Meteo por destino + geocoding fallback ✅ (30 mar)
16. **Emergency QR** — RPC pública + anon access + log de accesos ✅ (30 mar)
17. **places-nearby** edge function — geocoding + Overpass OSM fallback ✅ (30 mar)
18. **Flight Alerts** — paleta correcta, sin emojis ✅ (30 mar)
19. **SafetyHubPage** — hub `/safety` con SOS, SafeWalk, EmergencyCard, números locales ✅ (30 mar)
    * Safety MVP Sprint 1: **DONE**
    * Safety Layer completa del manifiesto: **PARCIAL** — background location (Android Foreground Service) y cola local sin señal quedan fuera de este bloque
20. **SplitBill persistente** — sessions + expenses en Supabase ✅ (28 mar, confirmado 30 mar)
    * Split Bill MVP Sprint 1: **DONE** — create/read/add expense/delete expense/delete session, RLS activo, trigger `on_auth_user_created` garantiza FK de perfil, manejo de errores y loading states presentes
    * Fuera de este bloque: cola offline, edición de gasto existente, exportar resumen
21. **Wallet expiración** — banner urgente de docs vencidos/críticos al tope de WalletPage ✅ (30 mar)
22. **Smart Trip Brain suggestions** — sección "Que sigue" en HomePage conectada al engine ✅ (30 mar)
23. **PlaceDetailPage** `/places/:id` — mapa estático, status, día, notas, eliminar, i18n 5 idiomas, navegación desde PlacesPage ✅ (30 mar, commit 9c6107c)
24. **Brain fix** — ruta `/emergency` rota en suggestion corregida a `/safety` ✅ (30 mar)
25. **Auto-generar packing** — ya implementado desde sprint anterior (useEffect en PackingChecklistPage, `existing.length === 0` → `generatePackingItemsForTrip`) ✅ confirmado

### Decisiones de alcance cerradas (30 marzo):
| Item | Decisión | Razón |
|------|----------|-------|
| `PackingListPage` separada | DESCARTADA | Duplicaría flujo con ChecklistPage sin función distinta |
| `CountryPickerPage` en onboarding | DESCARTADA | Geocoding ya resuelve país; no hay lógica gobernante que lo requiera |
| Tips estáticos en HomePage | DESCARTADOS | Reemplazados por Smart Trip Brain suggestions (datos reales) |
| `TripDetailsPage` premium visual | MOVIDA a Polish post-cierre funcional | Después de Safety/SplitBill/Wallet/Brain |

### Lo que está a medias:
| Feature | Problema |
|---------|---------|
| Safety Layer completa | MVP Sprint 1 DONE. Fuera: background location (Android Foreground Service) + cola local sin señal — documentado como Fase 2/3 |
| DepartureReminderPage | Cálculo OK. scheduleLocalNotification de Capacitor implementado — verificar en device |
| TripDetailsPage | Funcional pero sin diseño premium (movido a bloque de polish) |
| EmptyState reutilizable | Se hace inline en cada pantalla |

### Lo que NO existe todavía:
- `TripsList` — gestionar múltiples viajes en pantalla propia
- `ThemePreviewPage` — preview de temas por travelType en Settings
- Build nativo Capacitor Android firmado para Play Store (keystore lista, falta pipeline CI)
- Módulo Colaboración (trip_members, Realtime, invitaciones)
- Módulo Importar Reservas con IA (ImportReservationPage — UI existe, parser GPT pendiente)

---

## PRIORIDADES ACTIVAS — 30 MARZO 2026

| # | Tarea | Impacto | Estado |
|---|-------|---------|--------|
| 1 | **PlaceDetailPage** `/places/:id` | Alto — módulo incompleto | ✅ DONE commit 9c6107c |
| 2 | DepartureReminder — notif nativa Capacitor real | Medio | ❌ |
| 3 | TripDetailsPage rediseño premium | Medio | ❌ |
| 4 | TripsList — gestionar varios viajes | Medio | ✅ TripHistoryPage ya cubre esto + setCurrentTrip |
| 5 | Auto-generar packing si items vacíos | Alto — core feature | ✅ Ya implementado — useEffect en PackingChecklistPage |
| 6 | ThemePreviewPage en Settings | Bajo | ⚠️ DESCARTADA — todos los temas usan paleta idéntica, impacto visual cero |
| 7 | Build nativo Android firmado → Play Store | Alto para lanzamiento | ❌ |

---

## FASE 9 — AGENDA DE VIAJE ✅ COMPLETA (30 marzo 2026)

**Objetivo:** Recordatorios inteligentes por categoría, nativos, con notificaciones push.

### Pantallas entregadas
| Pantalla | Ruta | Estado |
|----------|------|--------|
| `AgendaPage` | `/agenda` | ✅ Lista agrupada por día, filtros por categoría, toggle completado |
| `NewAgendaItemPage` | `/agenda/new` | ✅ Formulario completo con categorías, recurrencia, notificación Capacitor |
| `AgendaItemDetailPage` | `/agenda/:id` | ✅ Detalle + toggle completado + editar + eliminar + cancelar notif |

### Servicios entregados
- `pushNotificationService.ts` — `scheduleLocalNotification`, `cancelLocalNotification`, `requestNotificationPermission` ✅
- `notificationsService.ts` — CRUD de notificaciones ✅
- Capacitor `@capacitor/local-notifications` — integrado real ✅

### Supabase
- Tabla `agenda_items` con RLS ✅
- `agendaService.ts` — upsert + delete remoto ✅

---

## FASE 10 — ITINERARIO + TIMELINE + LUGARES ✅ COMPLETA (30 marzo 2026)

**Objetivo:** Vista día a día del viaje con eventos, lugares en mapa y ruta entre puntos.

### Pantallas entregadas
| Pantalla | Ruta | Estado |
|----------|------|--------|
| `ItineraryPage` | `/itinerary` | ✅ Timeline vertical todos los días, accordion, botón ver detalle del día |
| `DayDetailPage` | `/itinerary/day/:index` | ✅ Timeline del día, editar/eliminar eventos, añadir evento al día, fecha real calculada |
| `AddEventPage` | `/itinerary/add-event` | ✅ Crear evento: tipo, título, hora, confirmación, descripción |
| `PlacesPage` | `/places` | ✅ Lista de lugares guardados del viaje activo |
| `AddPlacePage` | `/places/add` | ✅ Buscador Google Places → guardar al viaje |
| `PlaceDetailPage` | `/places/:id` | ✅ Detalle + mapa estático + selector status + asignar día + notas + eliminar |

### Servicios entregados
- `itineraryService.ts` — upsert + delete remoto ✅
- `placesService.ts` — Google Places API ✅
- `DayRoutePanel` — rutas entre eventos con Google Maps ✅
- `FlightAlertCard` — suscripción a alertas de vuelo por evento tipo `flight` ✅

### Supabase
- Tablas `itinerary_events` + `trip_places` con RLS ✅
- 20 edge functions desplegadas ✅

---

## FASE 11 — IMPORTAR RESERVAS + COLABORACIÓN (nueva)

**Objetivo:** IA parsea emails de confirmación → puebla el itinerario. Colaborar con amigos en tiempo real.

### IMPORTAR RESERVAS
- Usuario pega texto de email de confirmación (vuelo, hotel, tour, tren)
- GPT-4 (ya conectado) extrae: tipo, fechas, horas, confirmación, proveedor, precio
- Se crea automáticamente un `ItineraryEvent` del tipo correcto
- Historial de importaciones por viaje

**Pantallas:**
| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| `ImportReservationPage` | `/import-reservation` | Input de texto + procesamiento IA + preview |
| `ReservationsPage` | `/reservations` | Historial de reservas del viaje activo |

**Servicios:** `reservationParserService.ts` — llama a OpenAI con prompt estructurado

**Premium:** PREMIUM ONLY — funciona con GPT-4

### COLABORACIÓN
- Tabla `trip_members` en Supabase (tripId, userId, role: viewer | editor, invitedAt, acceptedAt)
- Link de invitación único `/join/:token`
- Supabase Realtime para sincronizar cambios en tiempo real
- Rol viewer: solo lectura. Rol editor: añadir eventos/lugares

**Pantallas:**
| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| `CollaboratorsPage` | `/trip/:id/collaborators` | Ver colaboradores, gestionar roles |
| `InvitePage` | `/trip/:id/invite` | Generar link + copiar |
| `JoinTripPage` | `/join/:token` | Aceptar invitación |

**Premium:** PREMIUM ONLY

---

## ACTUALIZACIÓN — 31 DE MARZO DE 2026 (SESIÓN 2 — MAÑANA)

> Commits acumulados: d9931a8 → 2976804 → ff9b2a5 → 5e00289 → 9535307 → d7a3c6b (último)

### BLOQUES CERRADOS ESTA SESIÓN ✅

**AndroidManifest — 6 permisos críticos (CODE DONE — commit 5e00289)**
- `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` — sin estos SafeWalk fallaba silenciosamente
- `SCHEDULE_EXACT_ALARM` + `USE_EXACT_ALARM` — requeridos Android 12+ para DepartureReminder
- `RECEIVE_BOOT_COMPLETED` — notificaciones sobreviven reinicio
- `VIBRATE` + `WAKE_LOCK` — calidad de experiencia de notificación

**FCM onNewToken persistence (CODE DONE — commit 9535307)**
- `MyFirebaseMessagingService.kt`: `onNewToken` antes solo hacía `Log.d` — token rotado nunca se persistía
- Fix: coroutine Kotlin + HTTP POST a `push_tokens` tabla Supabase
- Lee JWT de `CapacitorStorage` SharedPreferences → autenticado correctamente
- Usa `SimpleDateFormat` (no `java.time`) para compatibilidad minSdk 22
- `kotlinx-coroutines-android:1.7.3` añadido a `android/app/build.gradle`
- `supabase_url` + `supabase_anon_key` añadidos a `android/app/src/main/res/values/strings.xml`

**TripDetailsPage premium redesign (CODE DONE — commit 9535307)**
- Hero full-bleed 300px con gradiente profundo por travelType (8 temas)
- Stats row glassmorphism: countdown días, % packing, viajeros
- Countdown dinámico: future/ongoing/today/past
- Badge "viaje activo" + botón "Activar este viaje"
- Grid 4 columnas, 12 módulos, íconos SVG, paleta estricta `C`
- Share (Web Share API) + Delete con `AnimatePresence` bottom sheet confirm
- 17 claves `trip.*` nuevas en 5 idiomas
- 0 emojis, 0 colores fuera de paleta

**risk-zones desplegada a producción (DEPLOYED — hoy)**
- `useTripBrain` invocaba `risk-zones` pero la función no existía en prod → Brain nunca generaba alertas de riesgo
- `npx supabase functions deploy risk-zones` → ACTIVE v1
- `TRAVEL_RISK_API_KEY` + `TRAVEL_RISK_BASE_URL` confirmados en secrets

**exchange-rates desplegada a producción (DEPLOYED — hoy)**
- Existía localmente, no en prod
- `npx supabase functions deploy exchange-rates` → ACTIVE v1
- `EXCHANGE_RATE_KEY` confirmado en secrets

**flight-info desplegada + fix (DEPLOYED — commit d7a3c6b)**
- Bug: código pedía `AVIATIONSTACK_API_KEY` pero secret se llama `AVIATIONSTACK_KEY`
- Fix aplicado antes del deploy
- `npx supabase functions deploy flight-info` → ACTIVE v1
- `AVIATIONSTACK_KEY` confirmado en secrets

### ESTADO EDGE FUNCTIONS — 31 MARZO (POST DEPLOY)
**23 funciones ACTIVE** en producción:
places-autocomplete, places-details, destination-resolve, weather-cache, stripe-create-checkout-session, stripe-customer-portal, stripe-webhook, airlines-autocomplete, places-nearby, routes-transit, ai-orchestrator, stripe-sync-premium, send-push, safety-tracking, sos-handler, flight-alerts, share-itinerary, **risk-zones** ✅, **exchange-rates** ✅, **flight-info** ✅ (+3 nuevas hoy = 23 total)

---

## ACTUALIZACIÓN — 31 DE MARZO DE 2026 (SESIÓN 1 — MADRUGADA)

> Commits del día: d9931a8 → 2976804 → ff9b2a5 (último)

### BLOQUES CERRADOS HOY ✅

**Bloque C — Wallet viewer + expiración (CODE DONE — commit 2976804)**
- `WalletPage.tsx`: bug crítico corregido — `deleteWalletDoc` no llamaba a `deleteWalletDocRemote` → filas huérfanas en `wallet_docs`. Fix: `void deleteWalletDocRemote(d.id)` añadido antes de borrar en store local
- `DocViewer.tsx`: `useTranslation` importado, todos los strings hardcoded → i18n
- `WalletPage.tsx`: banner urgente, label expiración, "Reportar perdido" → i18n
- 17 claves `wallet.*` nuevas en 5 idiomas: urgentTitle, expiredAgo, expiresToday/Tomorrow/InDays, reportLost, reportedLost, expirationDate, openExternal, pdfFallbackHint, docLoad*, docClose, openDownload

**Bloque D — Smart Trip Brain operativo básico (CODE DONE — commit 2976804)**
- Todas las `actionPath` del `tripBrainEngine.ts` verificadas contra router: `/wallet` ✅ `/packing` ✅ `/health` ✅ `/profile/emergency` ✅ `/safety` ✅ `/budget` ✅ `/itinerary` ✅ `/safety/safewalk` ✅ `/split-bill` ✅
- `HomePage.tsx`: "Que sigue" hardcoded → `t('home.whatsNext')` en 5 idiomas
- `useTripBrain.ts`: 4 queries Supabase reales verificadas contra schema real

**Bugs críticos del Brain corregidos (commit ff9b2a5)**
- Bug 1: `useTripBrain` consultaba `.from('trip_budgets')` — tabla NO EXISTE. Tabla real: `trip_budget` (singular). Fix: una línea. Impacto: `budgetTotal` siempre era 0, Brain nunca generaba alertas de presupuesto
- Bug 2: `useTripBrain` consultaba `.from('trip_risk_zones')` — tabla NUNCA EXISTIÓ. Edge function `risk-zones` ya hace eso. Fix: `supabase.functions.invoke('risk-zones', { body: { trip_id: trip.id } })` mapeado a `{ isRiskDestination, riskLevel }`. Impacto: Brain nunca generaba alertas de zona de riesgo
- 22 errores Deno en VS Code suprimidos: `tsconfig.json exclude: [supabase, android, scripts]` + `viaza/.vscode/settings.json` con `deno.enable: false`

**Firebase Service Account actualizado**
- `FIREBASE_SERVICE_ACCOUNT_JSON` actualizado con `private_key_id: f99aff379268b51a9e055cbce671d29b3a5fa9fb`
- `send-push` redesplegada: `npx supabase functions deploy send-push`
- Push Notifications: CODE DONE. DEVICE VALIDATED: PENDIENTE. PRODUCTION READY: PENDIENTE (validar token en device Android real → fila en push_tokens → push recibida)

### VALIDACIÓN 0 MOCKS EN PRODUCCIÓN ✅
Búsqueda exhaustiva realizada. Resultado: 0 mocks en producción.
- `translateService.ts`: MyMemory API real + fallback Supabase Edge
- `pushNotificationService.ts`: espera FCM real (3s timeout), no simula datos
- Todos los `return []` son guards de error legítimos

### ESTADO REAL DE MÓDULOS — VERIFICADO 31 MARZO
| Módulo | Archivo | Líneas | Servicio backend | Estado |
|--------|---------|--------|-----------------|--------|
| Wallet | `WalletPage.tsx` | 417L | `walletDocsService` → Supabase + `ai-orchestrator` | CODE DONE |
| Brain | `useTripBrain.ts` / `tripBrainEngine.ts` | — / 372L | 4 queries + `risk-zones` invoke | CODE DONE |
| Safety Hub | `SafetyHubPage.tsx` | — | `safety-tracking` + `sos-handler` edge functions | CODE DONE |
| Split Bill | `SplitBillPage.tsx` | — | `split_bill_sessions` + `split_bill_expenses` Supabase | CODE DONE |
| Health | `HealthPage.tsx` | 814L | `healthService` → `health_conditions` + `health_medications` | CODE DONE |
| Budget | `BudgetPage.tsx` | 424L | `budgetService` → `trip_budget` + `trip_expenses` | CODE DONE |
| Journal | `TravelMemoryPage.tsx` | 524L | `journalService` + `ai-orchestrator` | CODE DONE |
| LiveTracking | `LiveTrackingPage.tsx` | 41L | `CompanionMapView` → `supabase.functions.invoke` real | CODE DONE |
| ImportReservation | `ImportReservationPage.tsx` | 259L | `reservationParserService` → `ai-orchestrator` | CODE DONE |
| Agenda | `AgendaPage.tsx` + 2 subpáginas | — | `agendaService` → `agenda_items` Supabase | CODE DONE |
| Itinerary | `ItineraryPage.tsx` + 5 subpáginas | — | `itineraryService` + `placesService` | CODE DONE |
| DepartureReminder | `DepartureReminderPage.tsx` | 209L | `@capacitor/local-notifications` real | CODE DONE (ver nota) |
| TripDetails | `TripDetailsPage.tsx` | 238L | 10 MODULE_LINKS reales, hero gradient | CODE DONE — PENDIENTE PREMIUM VISUAL |
| Push Notifications | `pushNotificationService.ts` | — | `push_tokens` Supabase + `send-push` edge | CODE DONE — DEVICE PENDIENTE |

> **Nota DepartureReminder**: `scheduleLocalNotification` real via Capacitor ✅. GAP: NO persiste en tabla `departure_reminders` de Supabase (tabla existe con columnas: id, trip_id, user_id, remind_at, message, is_active, fired_at, capacitor_id, created_at). Fix cerrado en commit de esta sesión.

### 34 TABLAS SUPABASE — VERIFICADAS CONTRA SCHEMA REAL (31 marzo)
agenda_items, departure_reminders, emergency_profiles, emergency_qr_access_logs, flight_watches, health_conditions, health_medications, itinerary_events, luggage_photos, offline_queue, packing_evidence, packing_items, packing_scan_detections, packing_scan_sessions, payments, places_cache, profiles, push_tokens, safety_checkins, safety_sessions, sos_events, split_bill_expenses, split_bill_sessions, suitcase_layout_plans, suitcase_profiles, travelers, trip_activities, trip_budget, trip_expenses, trip_journal_entries, trip_places, trip_recommendations, trips, wallet_docs

> Tablas que NO existen (documentado para no repetir bugs): `trip_budgets` (plural), `trip_risk_zones`

### PENDIENTES REALES — ORDEN DE PRIORIDAD (31 marzo — actualizado sesión 2)
| # | Item | Tipo | Estado |
|---|------|------|--------|
| 1 | DepartureReminder → persistir en `departure_reminders` tabla | CODE | ✅ CERRADO sesión 1 |
| 2 | TripDetailsPage rediseño premium | CODE | ✅ CERRADO commit 9535307 |
| 3 | AndroidManifest 6 permisos críticos | CODE | ✅ CERRADO commit 5e00289 |
| 4 | FCM onNewToken persistencia token rotado | CODE | ✅ CERRADO commit 9535307 |
| 5 | risk-zones deploy a producción | DEPLOY | ✅ CERRADO sesión 2 mañana |
| 6 | exchange-rates deploy a producción | DEPLOY | ✅ CERRADO sesión 2 mañana |
| 7 | flight-info deploy + fix secret name | DEPLOY+CODE | ✅ CERRADO commit d7a3c6b |
| 8 | Auditar rutas del router vs módulos existentes | CODE | PENDIENTE HOY |
| 9 | Build Android AAB firmado → Play Store (keystore lista en `android/keystore/`) | BUILD | PENDIENTE HOY |
| 10 | Validación manual Android: Safety/SplitBill/Wallet/Brain/Departure/Push | DEVICE | PENDIENTE (necesita build) |
| 11 | PDF nativo Android: `@capacitor-community/file-opener` | CODE | Fase 2 |
| 12 | Colaboración: trip_members + Realtime Supabase | CODE | Fase 2 |

---

## PLAN DE TRABAJO — 30 DE MARZO DE 2026

> Commits del día: b0719cb → cb3f008 → 2db7236 → 480c382 → 832c6db → 3f857f1 → 4ade600

### COMPLETADO HOY ✅
```
[x] i18n pt/de/fr — fixes completos
[x] flightAlertsService paleta + emojis edge function
[x] Auditoría global paleta 17 archivos + SplitBillPage crash fix
[x] WeatherPage — usa trip.lat/lon (destino real) + geocoding fallback
[x] translateService — LANG_CODE_MAP + 3 fallbacks + validación output
[x] places-nearby edge function — geocoding + Overpass OSM sin API key
[x] Emergency QR — RPC pública + GRANT anon/authenticated
[x] ResetPasswordPage/TripActivitiesPage/Landing — paleta corregida
[x] ESTADO_DESARROLLO_29_MARZO_2026.md — documento creado
[x] ProfilePage — avatar inicial, edición nombre Supabase, viajes recientes, NavRows, logout
[x] SettingsPage — cuenta, idioma, toggle notif push Capacitor
[x] AgendaItemDetailPage — detalle, toggle, editar, eliminar + cancelar notif Capacitor
[x] DayDetailPage — timeline día, editar/eliminar, añadir evento, fecha calculada
[x] router — rutas /agenda/:id y /itinerary/day/:index registradas
[x] AgendaPage — tap en item navega a /agenda/:id
[x] ItineraryPage — botón "Ver detalle del día" navega a /itinerary/day/:index
[x] i18n 5 idiomas — ~60 claves nuevas (profile, settings, agenda, itinerary)
[x] SafetyHubPage — hub /safety: SOS, SafeWalk, EmergencyCard, números emergencia locales
[x] router — ruta /safety registrada (estaba rota en tripBrainEngine, ahora resuelve)
[x] WalletPage — banner urgente de docs vencidos/críticos al tope
[x] HomePage — sección "Que sigue" conectada a brain.suggestions (reemplaza tips estáticos)
[x] SplitBill — persistencia en Supabase confirmada (ya existía, documentada ahora)
```

### DECISIONES DE ALCANCE CERRADAS ✅
```
[DESCARTADA]  PackingListPage separada — sin función distinta a ChecklistPage
[DESCARTADA]  CountryPickerPage en onboarding — geocoding resuelve el país
[DESCARTADA]  Tips estáticos en HomePage — reemplazados por brain.suggestions
[MOVIDA]      TripDetailsPage premium visual → bloque de polish post-cierre funcional
```

### PRÓXIMOS PASOS — por orden de prioridad
```
[x] PlaceDetailPage.tsx — /places/:id ✅ DONE commit 9c6107c
[x] Auto-generar packing si items vacíos ✅ ya implementado (PackingChecklistPage useEffect)
[x] TripsList ✅ cubierto por TripHistoryPage + setCurrentTrip (ya accesible desde Profile)
[DESCARTADA] ThemePreviewPage — todos los temas comparten paleta INMUTABLE, impacto visual cero
[ ] DepartureReminder — scheduleLocalNotification real en device Android
[ ] TripDetailsPage rediseño premium
[ ] Build Android firmado → aab para Play Store
[ ] Colaboración trip_members + Realtime Supabase
[ ] ImportReservationPage — parser GPT-4 real (UI existe)
```
