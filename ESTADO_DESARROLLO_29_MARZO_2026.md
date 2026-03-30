# VIAZA — Estado real de desarrollo vs Plan completo
# Actualizado: 29 de marzo de 2026
# Commits del día: b0719cb → cb3f008 → 2db7236 → 480c382 → 832c6db

---

## REGLAS ABSOLUTAS (verificadas hoy — 0 violaciones)
- Paleta: #12212E #307082 #6CA3A2 #ECE7DC #EA9940 ÚNICAMENTE
- WhatsApp #25D366 y colores de marca Google = excepciones válidas
- CERO emojis en UI (solo permitidos en datasets de frases/tips)
- Build TypeScript: 0 errores, 0 warnings críticos
- Todo texto vía i18n — nada hardcoded visible

---

## INFRAESTRUCTURA TÉCNICA ✅ COMPLETA

| Item | Estado |
|------|--------|
| Vite + React + TypeScript | ✅ |
| Tailwind + CSS variables paleta | ✅ |
| React Router v6 — 38 rutas | ✅ |
| Zustand + persist (local) | ✅ |
| i18n 5 idiomas (en/es/pt/fr/de) | ✅ completo |
| ThemeProvider + travelThemes | ✅ |
| Capacitor 6 instalado | ✅ |
| @capacitor/local-notifications | ✅ real, no stub |
| @capacitor/geolocation | ✅ real |
| @capacitor/haptics | ✅ real |
| @capacitor/camera | ✅ real |
| @capacitor/push-notifications | ✅ real |
| Supabase auth + RLS | ✅ |
| Supabase Realtime | ✅ (SafeWalk) |
| 17 edge functions desplegadas | ✅ |
| Supabase Secrets todos configurados | ✅ |
| Build producción limpio | ✅ 0 errores |
| Android keystore generado | ✅ viaza-release.jks |
| Google Maps Server Key actualizada | ✅ 30 mar 2026 |

---

## MÓDULOS — ESTADO POR CAPA DEL DOCUMENTO EJECUTIVO

---

### CAPA 1 — NÚCLEO IRRENUNCIABLE

#### M1 — Onboarding inteligente del viaje
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| TravelTypePage (8 tipos) | ✅ | Cards grandes, íconos SVG duotone |
| DestinationPage (Nominatim autocomplete) | ✅ | Guarda lat/lon/currency/language |
| DatePickerPage | ✅ | Calcula duración en días |
| TransportPage | ✅ | 5 medios, sub-formularios, Haversine |
| SmartTripDetectionPage | ✅ | OWM + Open-Meteo en paralelo |
| ActivitiesPage | ✅ | 23 actividades filtradas por travelType |
| TravelersPage | ✅ | 5 grupos + stepper adultos/niños |
| PreferencesPage | ✅ | packingStyle, laptop, travelLight |
| LaundryPage | ✅ | 3 modos |
| OnboardingSummaryPage | ✅ | |
| createTrip → currentTripId | ✅ | Flag onboardingCompleted anti-bypass |
| **CountryPickerPage** | ❌ NO EXISTE | Plan: TravelType → País → Destino |

**Pendiente: CountryPickerPage**

---

#### M2 — Smart Trip Brain / Home cockpit
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| HomePage cockpit | ✅ 1,057 líneas | Hero dinámico, clima, packing progress |
| activeModulesEngine | ✅ | Calcula módulos activos por viaje |
| tripBrainEngine | ✅ | Contexto por fase del viaje |
| ActionAlerts (alertas críticas) | ✅ | |
| TripReadiness | ✅ | |
| Clima en home (OWM/Open-Meteo) | ✅ | |
| Risk zones en home | ✅ | Banner si destino en RISK_DB |
| Vista "qué sigue" / "pendientes" | ⚠️ | Parcial — ActionAlerts básica |
| **Replaneación si cambia clima** | ❌ NO EXISTE | Motor de plan B por clima |
| **Modo viaje con ansiedad** | ❌ NO EXISTE | UX simplificada, prioridades claras |

---

#### M3 + M4 + M5 + M6 — Smart Packing completo
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| packingRules.ts | ✅ | Engine bidimensional 7 capas |
| packingGenerator.ts | ✅ | Reglas × clima × actividades × viajeros |
| laundryPlanner.ts | ✅ | 3 modos integrados |
| PackingChecklistPage | ✅ 878 líneas | Accordions, progreso circular, FAB |
| LuggageAssistantPage | ✅ 930 líneas | OCR visual + validación |
| PackingEvidenceModal | ✅ | Fotos de evidencia |
| packingMediaService | ✅ | Pipeline real |
| packingValidationService | ✅ | |
| Auto-generar si items vacíos | ⚠️ | Parcialmente — se genera al crear viaje |
| **PackingListPage separada** | ❌ NO EXISTE | Solo existe checklist |
| **Motor de acomodo de maleta** (zonas) | ❌ NO EXISTE | Módulo 5 del doc ejecutivo |
| Reglas especiales equipaje (aerolínea) | ✅ | AirlineRulesPage con dataset |

---

#### M16 — Emergency Travel Card + QR ← MÓDULO FIRMA
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| EmergencyCardPage | ✅ 504 líneas | |
| EmergencyCardForm | ✅ | Todos los campos del doc ejecutivo |
| EmergencyQRModal | ✅ | Genera QR con public_token |
| EmergencyPublicPage | ✅ | Vista pública del QR |
| get_emergency_public_view RPC | ✅ SQL ejecutado hoy | |
| log_emergency_qr_access RPC | ✅ SQL ejecutado hoy | |
| GRANT anon/authenticated | ✅ | |
| **Activar toggles en formulario** | ⚠️ ACCIÓN USUARIA | qr_enabled + consent_public_display → ON |
| Historial de escaneos QR | ✅ | emergency_qr_access_logs |
| Token temporal/revocación | ✅ | public_token en tabla |
| **Modo acompañante** (datos del día, hotel, vuelo) | ❌ NO EXISTE | |

---

#### M11 — Safety Layer ← MÓDULO FIRMA
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| SafeWalkPage | ✅ 391 líneas | GPS tracking real |
| SosFlowPage | ✅ | Botón SOS, WhatsApp, SMS, ubicación |
| SosPublicPage | ✅ | Vista pública SOS |
| CompanionMapView | ✅ | Realtime desde Supabase |
| LiveTrackingPage | ✅ 41 líneas | Wrapper de CompanionMapView (funcional) |
| safeTrackingService | ✅ | |
| sosService | ✅ | |
| safety-tracking edge function | ✅ | |
| sos-handler edge function | ✅ | |
| **Safe Return (timer de vuelta)** | ⚠️ | SafeWalk lo tiene pero no como flujo separado |
| **Token efímero por evento** | ✅ | companion_token opaco |
| **Modo sin señal / zona remota** | ❌ NO EXISTE | Módulo 20 del doc ejecutivo |
| **Emergency Pack offline** | ❌ NO EXISTE | QR/card/datos sin internet |
| **SOS diferido offline** | ❌ NO EXISTE | Cola local cuando sin señal |

---

#### M12 — Zonas de riesgo
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| RISK_DB (dataset curado, 18 países) | ✅ | En RecommendationsPage |
| RiskZoneBanner en Recommendations | ✅ | Niveles 1-4, descartable |
| riskZonesService | ✅ | Llama a risk-zones edge function |
| risk-zones edge function | ✅ | |
| Banner en Home | ✅ | fetchTripRisk() |
| **Overlay/heatmap en mapa** | ❌ NO EXISTE | Solo banner de texto |
| **Rutas seguras / rerouting** | ❌ NO EXISTE | |
| **Modo viajero vulnerable** | ❌ NO EXISTE | |

---

### CAPA 2 — OPERACIÓN FUERTE DEL VIAJE

#### M9 — Agenda de viaje
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| AgendaPage | ✅ 335 líneas | Lista agrupada por día |
| NewAgendaItemPage | ✅ 277 líneas | Formulario completo categorías |
| agendaService | ✅ | CRUD real Supabase |
| notificationsService (real) | ✅ 90 líneas | LocalNotifications + web fallback |
| scheduleNotification | ✅ | |
| cancelNotification | ✅ | |
| **AgendaItemDetailPage** | ❌ NO EXISTE | Tap en ítem → ver/editar/eliminar/cancelar notif |
| Agenda en DepartureReminderPage | ⚠️ | Cálculo OK, integración notif real ✅ |
| Free: máx 5 ítems / Premium: ilimitados | ✅ | Gate implementado |

---

#### M10 — Itinerario inteligente
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| ItineraryPage | ✅ 309 líneas | Timeline vertical por días |
| AddEventPage | ✅ 161 líneas | Crear evento con tipo/hora/lugar |
| SharedItineraryPage | ✅ 267 líneas | Vista pública compartida |
| itineraryService | ✅ | CRUD real |
| itinerarySharingService | ✅ | Token compartible |
| ShareItineraryButton | ✅ | |
| DayRoutePanel | ✅ | Rutas entre eventos del día |
| LegCard | ✅ | Tarjeta de tramo de ruta |
| FlightAlertCard | ✅ | |
| **DayDetailPage** (/itinerary/day/:index) | ❌ NO EXISTE | Vista del día con mapa y eventos |
| **Optimización de orden** (IA/maps) | ❌ NO EXISTE | |
| **Itinerario colaborativo** | ❌ NO EXISTE | trip_members, roles, realtime |
| Free: días 1 y último / Premium: todos | ✅ | Gate implementado |

---

#### M8 — Flight Companion / Airport Flow
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| AirportFlowPage | ✅ 489 líneas | |
| BoardingPassScannerPage | ✅ | OCR boarding pass |
| AirlineRulesPage | ✅ | Dataset + tracker AviationStack |
| flightAlertsService | ✅ | Alertas de vuelo reales |
| flight-alerts edge function | ✅ | |
| flight-info edge function | ✅ | |
| airlines-autocomplete edge function | ✅ | |
| DepartureReminderPage | ✅ | Cálculo + notificación real |
| **Hora recomendada "Go Now"** | ⚠️ | DepartureReminderPage lo calcula pero no hay botón "SAL AHORA" prominente |
| FlightAlertCard en Itinerario | ✅ | |

---

#### M7 — Roadtrip Intelligence
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| TripRoutePage | ✅ | Ruta origen→destino via routes-transit |
| routes-transit edge function | ✅ | Google Directions real |
| routeLegService | ✅ | getDayRoute() con waypoints |
| DayRoutePanel (itinerario) | ✅ | Rutas entre eventos |
| **Modo Auto específico** | ⚠️ | TripRoutePage existe pero sin paradas seguras |
| **Check mecánico previo** | ❌ NO EXISTE | Checklist preventivo del auto |
| **Paradas seguras** (gasolineras, baños, casetas) | ❌ NO EXISTE | |
| **Evaluación del viaje en auto** | ❌ NO EXISTE | Scoring de trayecto |

---

#### M11 Explorer + M6 Recomendaciones
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| RecommendationsPage | ✅ 297 líneas | Google Places + Overpass OSM fallback (fix hoy) |
| places-nearby edge function | ✅ deploy hoy | Geocoding fallback + OSM fallback |
| PlacesPage | ✅ 162 líneas | Lista de lugares guardados |
| AddPlacePage | ✅ 237 líneas | Búsqueda Google Places |
| places-autocomplete edge function | ✅ | |
| places-details edge function | ✅ | |
| **PlaceDetailPage** (/places/:id) | ❌ NO EXISTE | Detalle + asignar a día |
| Modo presupuesto (filtro por precio) | ✅ | priceLevelMaxForProfile |
| **TipsHubPage** | ✅ | |
| LocalTipsPage | ✅ | Filtro por categoría |
| SurvivalTipsPage | ✅ | Filtro por categoría |

---

#### M12 — Movilidad urbana y transporte
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| routes-transit edge function | ✅ | Google Directions, transit/driving/walking |
| routeLegService (rutas entre eventos) | ✅ | Amarra itinerario con movilidad |
| TripRoutePage (ruta global) | ✅ | |
| **Transit Companion UI** (metro/camión/tren) | ❌ NO EXISTE | No hay página de movilidad urbana |
| **Modo "cómo me muevo aquí"** | ❌ NO EXISTE | |
| **Offline mobility pack** | ❌ NO EXISTE | |

---

#### M13 — Weather Intelligence
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| WeatherPage | ✅ 516 líneas | |
| weatherCacheService | ✅ | Cache por trip |
| weather-cache edge function | ✅ | |
| WeatherForecastModal | ✅ | |
| dailyForecastEngine | ✅ | |
| **Bug lat/lon destino** | ✅ CORREGIDO HOY | Usaba origen, ahora destino + geocoding |
| Open-Meteo geocoding fallback | ✅ AÑADIDO HOY | |
| Clima en Home | ✅ | |
| **Motor plan B si cambia clima** | ❌ NO EXISTE | |
| **Ajuste de agenda por clima** | ❌ NO EXISTE | |

---

### CAPA 3 — CIERRE PREMIUM

#### M14 + M15 — Travel Wallet + OCR
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| WalletPage | ✅ 347 líneas | |
| WalletLostModePage | ✅ | Modo robo/pérdida |
| walletDocsService | ✅ | |
| ExpirationBadge | ✅ | Alertas de vencimiento |
| DocViewer | ✅ | |
| boardingPassScanner | ✅ | OCR real |
| **OCR documental general** | ⚠️ | BoardingPass sí. Otros docs = manual |
| **Alertas de expiración push** | ⚠️ | Badge visible, push no implementado |

---

#### M16 — Finanzas del viaje
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| BudgetPage | ✅ 424 líneas | Presupuesto por viaje |
| BudgetBar | ✅ | |
| ExpenseForm | ✅ | |
| budgetService | ✅ | |
| SplitBillPage | ✅ 485 líneas | Simple + avanzado (crash resuelto hoy) |
| splitBillService | ✅ | |
| CurrencyConverterPage | ✅ 100 líneas | API real ExchangeRate |
| **Modo ahorro / alertas de desviación** | ⚠️ | BudgetBar existe, alertas parciales |

---

#### M22 — Traductor contextual
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| TranslatorPage | ✅ 135 líneas | |
| translateService | ✅ CORREGIDO HOY | 3 fallbacks: ai-orchestrator → MyMemory → LibreTranslate |
| LANG_CODE_MAP (códigos de región) | ✅ AÑADIDO HOY | es-MX, de-DE, etc. |
| Validación output basura | ✅ AÑADIDO HOY | |
| QuickPhrasesPage | ✅ 75 líneas | Dataset por categoría |
| **Traducción de voz** | ❌ NO EXISTE | Speech-to-text no implementado |
| **Frases de emergencia** | ✅ | En quickPhrasesData |

---

#### M21 — Salud y continuidad personal
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| HealthPage | ✅ 814 líneas | Medicamentos + condiciones |
| healthService | ✅ | CRUD Supabase real |
| Integración con Emergency Card | ⚠️ | Campos separados, no sincronizados |
| **Alertas de medicación** en Agenda | ⚠️ | Se puede crear en Agenda pero no auto-genera desde Health |
| **Condiciones especiales** (embarazo, diabetes, etc.) | ⚠️ | HealthPage tiene campos, sin lógica de ajuste |
| **Hospitales/farmacias cercanas** | ⚠️ | Recommendations lo puede buscar, sin acceso directo |

---

#### M24 — Importación de reservas
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| ImportReservationPage | ✅ 259 líneas | Textarea + proceso IA |
| reservationParserService | ✅ | GPT-4 via ai-orchestrator real |
| Preview del evento extraído | ✅ | |
| Crear ItineraryEvent desde reserva | ✅ | |
| **Import desde email directo** | ❌ NO EXISTE | Gmail API / Graph no conectados |
| **Centro de reservas** | ❌ NO EXISTE | Solo historial básico |

---

#### M25 — Travel Memory
| Sub-feature | Estado | Notas |
|-------------|--------|-------|
| TravelMemoryPage (journal) | ✅ 524 líneas | CRUD real |
| journalService | ✅ | |
| travelMemoryService | ✅ | |
| Fotos, notas, tags | ✅ | |
| **Resumen automático del día** | ❌ NO EXISTE | |
| **Recomendaciones post-viaje** | ❌ NO EXISTE | |

---

### CAPA 4 — RETENCIÓN Y EXPANSIÓN

| Feature | Estado |
|---------|--------|
| Colaboración (trip_members, roles, realtime) | ❌ NO EXISTE |
| Join trip (/join/:token) | ❌ NO EXISTE |
| Narrativa / relive del viaje | ❌ NO EXISTE |
| Recomendaciones post-viaje | ❌ NO EXISTE |
| Historial de múltiples viajes | ✅ TripHistoryPage (básica) |

---

### PÁGINAS STUB (existen pero incompletas)
| Página | Líneas | Problema |
|--------|--------|---------|
| ProfilePage | 75 | Solo nombre/email + link Emergency. Sin foto, sin editar, sin historial |
| SettingsPage | 56 | Solo idioma + link Premium. Sin theme preview, sin notif settings, sin cuenta |
| LiveTrackingPage | 41 | Solo wrapper de CompanionMapView. Funcional pero sin controles propios |

---

### PÁGINAS DEL PLAN QUE NO EXISTEN
| Página | Ruta esperada | Módulo |
|--------|--------------|--------|
| AgendaItemDetailPage | /agenda/:id | M9 |
| DayDetailPage | /itinerary/day/:index | M10 |
| PlaceDetailPage | /places/:id | M11 |
| CountryPickerPage | /onboarding/country | M1 |
| PackingListPage | /packing/list | M3 |
| CollaboratorsPage | /trip/:id/collaborators | M10 |
| InvitePage | /trip/:id/invite | M10 |
| JoinTripPage | /join/:token | M10 |
| Transit Companion UI | /transit | M12 |
| Motor acomodo maleta | /packing/layout | M5 |
| Check mecánico | /roadtrip/check | M7 |
| Modo sin señal / offline | /offline | M20 |
| Centro de mensajes | /messages | M22 |
| Centro de reservas | /reservations | M24 |

---

## PENDIENTES ORDENADOS POR IMPACTO

### INMEDIATOS — Bloquean experiencia de usuario (hacer primero)

| # | Tarea | Impacto |
|---|-------|---------|
| 1 | **ProfilePage completa** — avatar, editar nombre/email, link a viajes recientes, idioma, logout | Alto |
| 2 | **SettingsPage completa** — notificaciones on/off, theme preview, info de cuenta | Alto |
| 3 | **AgendaItemDetailPage** — ver/editar/marcar completado/cancelar notificación de un ítem | Alto |
| 4 | **DayDetailPage** — vista del día del itinerario con eventos ordenados | Alto |
| 5 | **PlaceDetailPage** — detalle de lugar guardado + asignar a día del itinerario | Medio |
| 6 | **QR emergencia** — ACCIÓN DE USUARIA: activar toggles qr_enabled + consent_public_display en el formulario y guardar | Bloqueante para QR |

### SPRINT SIGUIENTE — Funcionalidad core faltante

| # | Tarea | Impacto |
|---|-------|---------|
| 7 | **Transit Companion UI** — página de movilidad urbana que usa routes-transit (edge function ya existe) | Alto |
| 8 | **TripsList mejorada** — desde TripHistory poder cambiar el viaje activo con un tap | Alto |
| 9 | **Motor plan B clima** — si llueve, sugerir actividades de interior / reordenar agenda | Medio |
| 10 | **Sincronización Health → Agenda** — auto-crear recordatorios de medicación desde HealthPage | Medio |
| 11 | **PackingListPage separada** — vista de lista sin checks, para imprimir o compartir | Bajo |
| 12 | **"Go Now" prominente** — botón con countdown en Airport Flow | Medio |

### SPRINT FUTURO — Diferenciales avanzados

| # | Tarea |
|---|-------|
| 13 | Colaboración (trip_members + realtime) |
| 14 | Modo sin señal / Emergency Pack offline |
| 15 | Motor de acomodo de maleta (zonas de maleta) |
| 16 | Roadtrip Intelligence completo (paradas seguras, check mecánico) |
| 17 | Import desde email directo (Gmail API) |
| 18 | Resumen automático del día (Travel Memory IA) |
| 19 | Modo sin señal / SOS diferido |
| 20 | Android APK build final firmado |
| 21 | Modo viaje con ansiedad |
| 22 | Overlay de riesgo en mapa |

---

## EDGE FUNCTIONS — ESTADO

| Función | Estado | Notas |
|---------|--------|-------|
| ai-orchestrator | ✅ | GPT-4/Claude/Groq orchestrado |
| airlines-autocomplete | ✅ | |
| destination-resolve | ✅ | |
| exchange-rates | ✅ | |
| flight-alerts | ✅ | |
| flight-info | ✅ | |
| places-autocomplete | ✅ | |
| places-details | ✅ | |
| places-nearby | ✅ ACTUALIZADA HOY | Geocoding fallback + Overpass OSM |
| risk-zones | ✅ | |
| routes-transit | ✅ | Google Directions + transit/driving/walking |
| safety-tracking | ✅ | |
| send-push | ✅ | |
| share-itinerary | ✅ | |
| sos-handler | ✅ | |
| stripe-create-checkout-session | ✅ | |
| stripe-customer-portal | ✅ | |
| stripe-sync-premium | ✅ | |
| stripe-webhook | ✅ | |
| weather-cache | ✅ | |

---

## MIGRACIONES SQL APLICADAS EN PRODUCCIÓN

| Migración | Aplicada |
|-----------|---------|
| 20260325_1935_packing_scan_foundations.sql | ✅ |
| 20260325_emergency_qr_access_logs.sql | ✅ |
| 20260326_1115_trip_recommendations_compat.sql | ✅ |
| 20260326_1125_trip_recommendations_schema_hotfix.sql | ✅ |
| 20260326_1138_trip_recommendations_force_rebuild.sql | ✅ |
| 20260326_1310_trip_risk_zones.sql | ✅ |
| 20260328_finances.sql | ✅ |
| 20260328_push_tokens.sql | ✅ |
| 20260328_safety_layer.sql | ✅ |
| 20260328_sos_events.sql | ✅ |
| 20260328_travel_memory.sql | ✅ |
| 20260328_wallet_expiration.sql | ✅ |
| **20260329_fix_emergency_public_rpc.sql** | ✅ APLICADA HOY |
| 20260329_flight_watches.sql | ✅ |
| 20260329_health_module.sql | ✅ |
| 20260329_trips_share_token.sql | ✅ |

---

## FIXES APLICADOS HOY (29 marzo 2026)

| Fix | Archivo | Commit |
|-----|---------|--------|
| i18n pt/de/fr claves weather/health/airport/memory | locales/*.json | b0719cb |
| flightAlertsService paleta #EF4444/#F97316 | flightAlertsService.ts | cb3f008 |
| Edge function flight-alerts emojis eliminados | supabase/functions/flight-alerts | cb3f008 |
| Paleta global 17 archivos (#c0392b y similares) | múltiples | 2db7236 |
| SplitBillPage crash "Invalid hook call" | SplitBillPage.tsx | 2db7236 |
| WeatherPage usa lat/lon destino (no origen) | WeatherPage.tsx | 480c382 |
| WeatherPage geocoding fallback Open-Meteo | WeatherPage.tsx | 480c382 |
| TranslateService LANG_CODE_MAP + 3 fallbacks | translateService.ts | 480c382 |
| places-nearby geocoding fallback + Overpass OSM | supabase/functions/places-nearby | 480c382 |
| QR Emergency RPC + permisos anon | supabase/migrations/20260329_fix_emergency_public_rpc.sql | 480c382 |
| Google Maps Server Key actualizada en Supabase | Secrets | (CLI) |
| ResetPasswordPage #c0392b → #EA9940 | ResetPasswordPage.tsx | 832c6db |
| TripActivitiesPage #c0392b → #EA9940 | TripActivitiesPage.tsx | 832c6db |
| LandingPage/TermsPage/PrivacyPage #F0B86B → #ECE7DC | landing pages | 832c6db |

---

## PRÓXIMAS TAREAS — ORDEN DE EJECUCIÓN

```
TANDA 1 (hacer en esta sesión):
[ ] 1. ProfilePage completa
[ ] 2. SettingsPage completa
[ ] 3. AgendaItemDetailPage
[ ] 4. DayDetailPage

TANDA 2 (siguiente sesión):
[ ] 5. PlaceDetailPage
[ ] 6. Transit Companion UI (usa routes-transit que ya existe)
[ ] 7. TripsList mejorada con switch de viaje activo
[ ] 8. Sincronización Health → Agenda (auto-crear recordatorios)

TANDA 3 (sprint siguiente):
[ ] 9. Motor plan B clima
[ ] 10. PackingListPage separada
[ ] 11. "Go Now" botón prominente en Airport Flow
[ ] 12. Colaboración (trip_members)

PENDIENTE DE USUARIA (no código):
[ ] Activar toggles qr_enabled + consent_public_display en perfil Emergency → guardar
```
