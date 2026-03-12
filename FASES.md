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

## FASE 8 — Settings + QA + build-ready ⚠️ INCOMPLETA

| Item | Estado | Notas |
|------|--------|-------|
| SettingsPage | ⚠️ | Solo selector de idioma + link a Premium — falta theme preview |
| i18n revisión | ✅ | Cero strings hardcodeados visibles |
| EmptyState / loaders | ⚠️ | Hay spinners pero no existe `EmptyState` como componente reutilizable |
| Pulido UI | ⚠️ | Algunas pantallas son premium, otras son básicas |
| Capacitor | ⚠️ | Instalado en package.json pero NO compilado. `services/device/` vacío |
| Build limpio | ✅ | `npm run build` — 0 errores TypeScript |
| ThemePreviewPage | ❌ | No existe |
| ProfilePage completa | ❌ | No existe |

---

## RESUMEN EJECUTIVO — DÓNDE ESTAMOS

### Lo que funciona de punta a punta:
1. Flujo completo: Splash → Intro → Login → Onboarding (10 pasos) → Home
2. Packing engine real con 7 capas de reglas, generación automática al crear viaje
3. Packing checklist con accordions, progreso circular, ítems custom
4. Currency converter con API real
5. AirlineRules con tracker de vuelo en tiempo real (AviationStack)
6. AllowedItems, Adapters, SplitBill, LocalTips, SurvivalTips, QuickPhrases
7. i18n completo en 5 idiomas, cambiable desde Settings
8. Temas dinámicos por tipo de viaje
9. Build de producción limpio sin errores TS

### Lo que está a medias:
| Feature | Problema |
|---------|---------|
| TranslatorPage | Mock — no hay API real conectada |
| DepartureReminderPage | Cálculo OK pero notificación nativa no dispara |
| TripDetailsPage | Funcional pero sin diseño premium |
| HomePage tips | No filtra por destino del viaje activo |
| SettingsPage | Falta theme preview |
| Componentes UI | EmptyState, ProgressBar, ModalSheet no existen reutilizables |

### Lo que NO existe todavía:
- `CountryPickerPage` — selector de país antes del destino específico
- `PackingListPage` separada de la checklist
- `TripsList` — gestionar múltiples viajes
- Generación automática de packing si items están vacíos al abrir checklist
- `services/device/` — locationService, shareService, hapticsService, notificationsService
- Build nativo Capacitor (Android / iOS)
- ProfilePage completa
- Modo offline real
- Scan My Bag, IA, Backend/auth real, nube/sync

---

## PRIORIDADES PARA COMPLETAR MVP REAL

| # | Tarea | Impacto |
|---|-------|---------|
| 1 | Auto-generar packing al entrar a checklist si está vacío | Alto — core feature rota |
| 2 | CountryPickerPage (TravelType → País → Destino filtrado) | Alto — flujo incompleto |
| 3 | HomeScreen mejorada (días restantes, clima real, moneda automática del destino) | Alto — primera impresión |
| 4 | TranslatorPage con API real | Alto — función viral |
| 5 | TripDetailsPage rediseño premium | Medio |
| 6 | TripsList — gestionar varios viajes | Medio |
| 7 | DepartureReminder — notificación nativa Capacitor | Medio |
| 8 | Componentes UI reutilizables (EmptyState, ProgressBar, ModalSheet) | Medio — deuda técnica |
| 9 | SettingsPage — theme preview completa | Bajo |
| 10 | Build nativo Capacitor | Alto para lanzamiento real |

---

## FASE 9 — AGENDA DE VIAJE (nueva)

**Objetivo:** Recordatorios inteligentes por categoría, nativos, con notificaciones push.

### Estructura de datos
```typescript
interface AgendaItem {
  id: string;
  tripId: string;
  title: string;
  category: 'medication' | 'call' | 'meeting' | 'checkin' | 'activity' | 'reminder' | 'custom';
  date: string;        // ISO date
  time: string;        // HH:MM
  recurrence: 'none' | 'daily' | 'every_8h' | 'every_12h' | 'weekly';
  notes?: string;
  notificationId?: number;  // Capacitor LocalNotifications ID
  completed: boolean;
  createdAt: string;
}
```

### Pantallas
| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| `AgendaPage` | `/agenda` | Lista de eventos del viaje activo, agrupados por día |
| `NewAgendaItemPage` | `/agenda/new` | Formulario: título, categoría, fecha, hora, recurrencia |
| `AgendaItemDetailPage` | `/agenda/:id` | Detalle + editar + eliminar + marcar completado |

### Servicios
- `notificationsService.ts` — `scheduleNotification(item)`, `cancelNotification(id)`, `requestPermission()`
- Capacitor `@capacitor/local-notifications`
- En web: `Notification API` como fallback

### Premium gate
- Free: máximo 5 ítems de agenda
- Premium: ilimitados + recurrencias

---

## FASE 10 — ITINERARIO + TIMELINE + LUGARES (nueva)

**Objetivo:** Vista día a día del viaje con eventos, lugares en mapa y drag & drop para reordenar.

### Estructura de datos
```typescript
interface ItineraryEvent {
  id: string;
  tripId: string;
  dayIndex: number;       // 0 = día 1 del viaje
  order: number;          // posición dentro del día
  type: 'flight' | 'hotel' | 'activity' | 'place' | 'transport' | 'meal' | 'free';
  title: string;
  description?: string;
  startTime?: string;     // HH:MM
  endTime?: string;
  placeId?: string;       // ref a SavedPlace
  confirmationCode?: string;
  source: 'manual' | 'imported' | 'suggestion';
  createdAt: string;
}

interface SavedPlace {
  id: string;
  tripId: string;
  name: string;
  address?: string;
  lat: number;
  lon: number;
  category: 'restaurant' | 'museum' | 'hotel' | 'beach' | 'park' | 'shopping' | 'transport' | 'other';
  googlePlaceId?: string;
  photo?: string;
  assignedDayIndex?: number;
  notes?: string;
  status: 'want_to_go' | 'booked' | 'visited';
  createdAt: string;
}
```

### Pantallas
| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| `ItineraryPage` | `/itinerary` | Timeline vertical — todos los días del viaje |
| `DayDetailPage` | `/itinerary/day/:index` | Eventos del día + mapa Google Maps con pins |
| `AddEventPage` | `/itinerary/add-event` | Crear evento: tipo, título, hora, lugar |
| `PlacesPage` | `/places` | Lista de lugares guardados del viaje activo |
| `AddPlacePage` | `/places/add` | Buscar Google Places → guardar al viaje |
| `PlaceDetailPage` | `/places/:id` | Detalle del lugar + asignar a día |

### Servicios
- `placesService.ts` — Google Places API (ya tenemos `VITE_GOOGLE_MAPS_KEY`)
- `itineraryService.ts` — CRUD eventos, ordenar por día, exportar

### Premium gate
- Free: itinerario básico día 1 y último día, máximo 5 lugares
- Premium: todos los días + mapa interactivo + lugares ilimitados

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

## PLAN DE TRABAJO — 12 DE MARZO DE 2026

> Estado: sesión activa. Lo pendiente del sprint anterior + los módulos nuevos.

### URGENTE — Terminar sprint anterior (1-2h)
```
[ ] PASO 4 — TripDetailsPage premium (reescritura ejecutada, falta verificar build)
[ ] PASO 5 — PackingChecklistPage: auto-generar si items vacíos
[ ] npm run build — 0 errores TS
[ ] git commit + push
```

### HOY — Módulo Agenda (2-3h)
```
[ ] Crear types/agenda.ts (AgendaItem interface)
[ ] Añadir agendaItems[] al store Zustand con CRUD
[ ] AgendaPage — lista de eventos agrupados por día
[ ] NewAgendaItemPage — formulario completo con categorías hermosas
[ ] notificationsService.ts — scheduleNotification + cancelNotification
[ ] Conectar con Capacitor LocalNotifications
[ ] Añadir ruta /agenda al router
[ ] Añadir acceso desde HomePage y ToolsHub
```

### HOY — Módulo Itinerario/Timeline (2-3h)
```
[ ] Crear types/itinerary.ts (ItineraryEvent + SavedPlace interfaces)
[ ] Añadir itineraryEvents[] + savedPlaces[] al store
[ ] ItineraryPage — timeline vertical por días
[ ] DayDetailPage — eventos del día + map placeholder
[ ] AddEventPage — formulario nuevo evento
[ ] PlacesPage — lista de lugares guardados
[ ] AddPlacePage — buscador Google Places
[ ] Añadir rutas /itinerary y /places al router
```

### HOY — Módulo Importar Reservas (1h)
```
[ ] ImportReservationPage — UI + textarea + botón procesar
[ ] reservationParserService.ts — prompt GPT-4 estructurado
[ ] Preview del evento extraído antes de confirmar
[ ] Añadir ruta /import-reservation
```

### HOY — Actualizar PremiumPage con nuevos beneficios (30min)
```
[ ] Añadir a la lista de beneficios:
    - Agenda ilimitada con notificaciones recurrentes
    - Itinerario completo con mapa interactivo
    - Importar reservas con IA
    - Colaboración con amigos (próximamente)
[ ] Actualizar descripción del precio
```

### PENDIENTE (próxima sesión)
```
[ ] Colaboración con amigos — requiere backend Supabase
[ ] Búsqueda de vuelos/hoteles — requiere contrato Amadeus/Skyscanner
[ ] Build nativo Capacitor (iOS + Android)
[ ] TranslatorPage con API real (OpenAI ya conectado, solo el prompt)
[ ] CountryPickerPage
[ ] ProfilePage completa
```
