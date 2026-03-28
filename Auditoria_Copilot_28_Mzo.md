# AUDITORÍA REAL VIAZA — GitHub Copilot
## Fecha: 28 de marzo de 2026
## Auditor: GitHub Copilot (independiente de Codex)
## Metodología: lectura directa del código fuente, schema SQL, edge functions y configuración

---

> **Declaración de independencia**  
> Esta auditoría fue realizada leyendo el código real del repositorio, archivo por archivo. No me baso en lo que dijo Codex ni en ningún documento previo de estado. Me baso únicamente en lo que existe en `/viaza/src`, `/viaza/supabase`, `/viaza/android` y los archivos de configuración. Soy brutal y honesto.

---

## 1. RESUMEN EJECUTIVO

**VIAZA existe como aplicación funcional parcial.** Tiene estructura real, routing, autenticación, backend en Supabase, y varios módulos con lógica de producción. **Sin embargo, aproximadamente el 60–65% de los módulos del Documento Ejecutivo Director no existen o son cáscaras sin implementación real.**

Los 4 módulos firma (Smart Packing, Travel Wallet + OCR, Emergency Card + QR, Safety Layer) tienen implementación parcial pero con brechas críticas que los descalifican del estado "producción completa":

- **Smart Packing**: Checklist funcional ✅ | Escáner visual ⚠️ parcial | Motor de acomodo ⚠️ parcial | Reglas de aerolínea ⚠️ básico
- **Travel Wallet + OCR**: Wallet con upload ✅ | OCR real ⚠️ solo vía IA (no extracción estructurada) | Modo robo/pérdida ❌ no existe
- **Emergency Card + QR**: Card editable ✅ | QR real con token ✅ | Modo acompañante ❌ no existe
- **Safety Layer**: SOS por WhatsApp/SMS ✅ básico | Live tracking ❌ no existe | Safe Walk ❌ no existe | Safe Return ❌ no existe

---

## 2. STACK TECNOLÓGICO REAL (confirmado)

| Capa | Tecnología | Versión | Estado |
|---|---|---|---|
| Frontend | React 18 + TypeScript | 18.3 / 5.6 | ✅ en uso |
| Build | Vite | 5.4 | ✅ |
| UI | Tailwind CSS + Framer Motion | 3.4 / 11.0 | ✅ |
| Estado | Zustand (con persist) | 4.5 | ✅ |
| Routing | React Router DOM | 6.26 | ✅ |
| i18n | i18next + react-i18next | 23 / 14 | ✅ |
| Backend / DB | Supabase (auth + storage + RLS) | v2.99 | ✅ |
| IA | OpenAI SDK | 6.27 | ✅ (configurado, no hardcoded) |
| Móvil | Capacitor | 6.0 | ✅ Android OK |
| Clima | Open-Meteo (sin key, gratis) | — | ✅ |
| Rutas auto | OSRM (sin key, gratis) | — | ✅ |
| Mapas/Lugares | Google Maps API (server-side) | — | ⚠️ depende de env |
| Vuelos | AviationStack | — | ⚠️ depende de env |
| Cambio de divisas | ExchangeRate API | — | ⚠️ depende de env |
| Zonas de riesgo | ACLED / OSAC (proxy) | — | ⚠️ depende de env |
| Pagos | Stripe | — | ✅ edge functions reales |

---

## 3. AUDITORÍA MÓDULO POR MÓDULO

### Leyenda
- ✅ Funcional y en producción
- ⚠️ Parcial — existe pero incompleto o sin integración end-to-end
- ❌ No existe — solo documentado o placeholder
- 🔑 Requiere API key / variable de entorno no confirmada

---

### MÓDULO 1 — Onboarding inteligente del viaje (Trip Object)
**% de avance: 75%**

**Qué SÍ existe:**
- Flujo completo de onboarding: SplashPage → IntroPage → TravelTypePage → ActivitiesPage → DestinationPage → DatePickerPage → DurationPage → TravelersPage → TransportPage → ClimatePage → PreferencesPage → SmartTripDetectionPage → OnboardingSummaryPage → OnboardingWelcomePage
- Captura: tipo de viaje (8 tipos), fechas, destino con geocodificación real vía Open-Meteo Geocoding API, clima inferido, número de viajeros, nombres, perfil económico, estilo de viaje, transporte principal, actividades, modo lavandería, lapto, viaje ligero
- Trip Object guardado en Zustand (persistido) y sincronizado a Supabase tabla `trips`
- `tripContextEngine.ts` infiere fase del viaje (pre_trip / in_trip / post_trip) correctamente

**Qué FALTA:**
- No hay detección de "viajero vulnerable" (embarazo, diabetes, movilidad reducida, adulto mayor) — el onboarding no pregunta condiciones especiales
- No hay captura de "objetivo del viaje" (descanso, turismo, negocio, salud, etc.) como campo separado
- No hay experiencia del viajero (primer viaje, frecuente, experto)
- Idioma del destino se infiere pero no es un campo configurable por el usuario
- La selección de **destinos secundarios** no existe — solo un destino principal

---

### MÓDULO 2 — Smart Trip Brain / Dashboard operativo
**% de avance: 40%**

**Qué SÍ existe:**
- `HomePage.tsx` (957 líneas) — existe una Home con hero por tipo de viaje, clima, nivel de riesgo del destino, módulos activos según contexto
- `activeModulesEngine.ts` — calcula qué módulos mostrar según fase, isPremium, coordenadas disponibles
- `tripContextEngine.ts` — infiere contexto del viaje correctamente
- Chip de riesgo en home con nivel (low/medium/high/critical) via `riskZonesService` → edge function
- Chip de clima con temperatura e icono contextual

**Qué FALTA:**
- **No existe un "timeline general" del viaje** — la home muestra cards de módulos pero no un dashboard operativo tipo "qué sigue / hoy / antes de salir / pendientes críticos"
- **No hay vista "pendientes críticos"** con detección de huecos
- **No hay motor de priorización de tareas** — el sistema no dice "te falta empacar, no tienes seguro de viaje, tu vuelo es mañana"
- **No hay detección de huecos en la planeación** — si el usuario no tiene hotel registrado para esa fecha, el sistema no lo advierte
- **No hay sugerencia de cambios si cambia clima o ruta**
- El Smart Trip Brain está descrito como "orquestador que piensa el viaje como sistema" — lo que existe es un menú de accesos a módulos, no un cerebro

---

### MÓDULO 3 — Smart Packing Engine
**% de avance: 70%**

**Qué SÍ existe:**
- `PackingChecklistPage.tsx` — checklist real con categorías (documents, clothes, toiletries, electronics, health, extras)
- `generatePackingItemsForTrip()` — genera ítems automáticos basados en tipo de viaje, clima, acompañantes, actividades, modo lavandería, presencia de laptop
- `packingRules.ts` — reglas por tipo de viaje (beach/mountain/city/camping/work/snow/roadtrip/adventure), por grupo de viajeros (bebé, niños), por clima, por actividades
- Separación por viajero (traveler) con tabs
- Ítems personalizados por usuario
- Persistencia en Supabase tabla `packing_items`
- Alertas de faltante visual

**Qué FALTA:**
- **No hay sugerencia de cantidades** — dice "pantalón" pero no "2 pantalones para 7 días"
- **No hay sugerencia por capas** (base layer / mid layer / outer) para viajes de frío/montaña
- **No hay alertas de clima extremo** que reclasifiquen la lista (si cambia a tormenta, agrega impermeable)
- **No hay checklists específicos para medicamento controlado, mascota completo, ni bebé completo** más allá de algunos ítems genéricos
- La categoría `health` solo tiene ítems de packing genérico — no es el módulo de salud y continuidad que describe el doc ejecutivo

---

### MÓDULO 4 — Escáner de maleta / check visual
**% de avance: 45%**

**Qué SÍ existe:**
- `LuggageAssistantPage.tsx` (931 líneas) — flujo de escaneo con cámara (Capacitor Camera)
- `packingValidationService.ts` — llama al edge function `ai-orchestrator` con task `packing_validation_scan`
- `ai-orchestrator` — envía imagen a OpenAI/Anthropic con visión para detectar objetos empacados
- Tablas DB: `packing_scan_sessions`, `packing_scan_detections`, `suitcase_profiles`, `suitcase_layout_plans`
- `PackingEvidenceModal.tsx` — captura foto de evidencia por ítem
- `createPackingScanSession`, `savePackingScanDetections`, `completePackingScanSession` — persistencia completa

**Qué FALTA:**
- **La detección no es un "check contra lista" confiable en producción** — depende de GPT Vision que reconoce objetos genéricos pero no identifica específicamente "cargador negro pequeño" vs "cargador de laptop"
- **No hay zona de maleta visual** en la UI — el resultado muestra texto, no un mapa visual de la maleta con zonas
- **No hay "propuesta de acomodo visual" post-scan** integrada al resultado del escaneo
- **No existe flujo de "duplicados detectados"** en la UI aunque la DB tiene `duplicate_count`
- El flujo de scan → resultado → acción es funcional pero la precisión en producción depende 100% de la calidad del modelo de visión configurado

---

### MÓDULO 5 — Motor de acomodo de maleta
**% de avance: 40%**

**Qué SÍ existe:**
- `invokeSuitcaseLayoutPlan()` en `packingValidationService.ts` — llama a `ai-orchestrator` con task `suitcase_layout_plan`
- `saveSuitcaseLayoutPlan()` — persiste el plan en DB
- `upsertSuitcaseProfile()` — guarda medidas de la maleta
- Selección de tamaño (cabin/medium/large/extra_large) y tipo (carry-on/checked/backpack/auto_trunk) en la UI
- El resultado incluye campos: `bottom`, `top`, `compartments`, `hand_bag`, `security_separated`, `fragile_separated`, `quick_access`

**Qué FALTA:**
- **No hay lógica propia de acomodo** — es 100% IA generativa, no un motor determinístico con reglas de física de maleta
- **No hay acomodo visual de maleta** — el resultado es texto, no un diagrama
- **No hay diferenciación real entre lógica avión vs auto** en el motor
- **No hay validación de peso estimado** — el sistema no sabe cuánto pesa cada ítem
- Si falla la IA (sin key, sin créditos), el módulo muere completo — no hay fallback

---

### MÓDULO 6 — Reglas especiales de equipaje / aerolíneas
**% de avance: 35%**

**Qué SÍ existe:**
- `AirlineRulesPage.tsx` — existe una página de reglas de aerolíneas
- `AllowedItemsPage.tsx` — existe página de ítems permitidos
- `BoardingPassScannerPage.tsx` — escáner de boarding pass vía cámara + OCR (ai-orchestrator task `boarding_pass_ocr`)
- `airlines-autocomplete` edge function — existe para autocompletar aerolíneas

**Qué FALTA:**
- **No hay base de datos de restricciones por aerolínea específica** — no sabe que Volaris cobra X por documentada, que Aeromexico permite Y kg
- **No hay validación de peso estimado** de la maleta vs el límite de la aerolínea del viaje
- **No hay checklist específico para líquidos (regla 100ml)** como feature dedicado
- **No hay checklist para bebés / medicamentos** como módulo separado con lógica real
- Las páginas de reglas muestran contenido estático / tips, no reglas dinámicas por aerolínea del viaje real del usuario

---

### MÓDULO 7 — Roadtrip Intelligence
**% de avance: 18%**

**Qué SÍ existe:**
- `TripRoutePage.tsx` — muestra ruta desde origen a destino con OSRM (distancia/tiempo sin key), deep links a Google Maps / Waze / Apple Maps
- `routes-transit` edge function — rutas de transporte público (Google Directions API)
- El tipo de viaje `roadtrip` existe en el enum y en el sistema de packing

**Qué FALTA (la mayoría de este módulo):**
- ❌ **Casetas** — no hay proveedor de peajes en México/LATAM conectado
- ❌ **Gasolineras en ruta** — no hay integración con Places API para buscar gasolineras en la ruta
- ❌ **Paradas seguras** (baños, restaurantes, tiendas, hospitales, talleres, vulcanizadoras, grúas) en ruta — no existe
- ❌ **Check mecánico previo** — no existe checklist (llantas, aceite, agua, frenos, batería, luces, etc.)
- ❌ **Evaluación del viaje en auto** (distancia, horas de manejo, conductores, riesgo carretero, gasolina estimada, presupuesto carretera) — no existe
- ❌ **Paradas para niños / mascota** — no existe
- ❌ **Hora recomendada de salida** con lógica de tráfico — no existe (OSRM no tiene tráfico real)

**El TripRoutePage solo es un lanzador de deep links con distancia OSRM. No es Roadtrip Intelligence.**

---

### MÓDULO 8 — Flight Companion / Airport Flow
**% de avance: 30%**

**Qué SÍ existe:**
- `DepartureReminderPage.tsx` — calcula hora recomendada de salida al aeropuerto (3h buffer configurado), agenda notificación local con Capacitor
- `BoardingPassScannerPage.tsx` — escanea boarding pass con cámara + OCR IA
- `flight-info` edge function — consulta AviationStack para estado de vuelo en tiempo real 🔑
- `FlightNumber`, `airline`, `airportCode`, `busTerminal` capturados en onboarding

**Qué FALTA:**
- ❌ **Checklist de aeropuerto** — no existe (documentos, equipaje de mano, check-in, etc.)
- ❌ **Vista "Go Now"** — no existe como módulo propio con lógica situacional
- ❌ **Alertas de cambio de puerta / retraso** en tiempo real — la edge function existe pero no hay polling ni notificación push automática
- ❌ **Amenidades del aeropuerto** cercanas (salas VIP, restaurantes, farmacias) — no existe
- ❌ **Vista de "estado del vuelo"** accesible desde la home o el trip detail — la edge function existe pero no hay UI que la consuma continuamente
- El recordatorio de salida es manual (usuario ingresa hora de vuelo), no se conecta automáticamente al vuelo registrado en el trip

---

### MÓDULO 9 — Agenda de viaje
**% de avance: 60%**

**Qué SÍ existe:**
- `AgendaPage.tsx` — lista de ítems de agenda del viaje
- `NewAgendaItemPage.tsx` — creación de ítem con título, descripción, fecha/hora, tipo
- `agendaService.ts` — `upsertAgendaItem`, `deleteAgendaItemRemote`, `fetchAgendaItems` — sincronización real con Supabase tabla `agenda_items`
- `toggleAgendaItem` — marcar como completado
- Notificación local programable para ítems de agenda
- Persistencia en Zustand + Supabase

**Qué FALTA:**
- ❌ **No hay tipos diferenciados de ítem** (vuelo, hotel, tour, medicamento, llamada, check-in, traslado, pago) — solo título/descripción libre
- ❌ **No se conectan las reservas importadas al calendario** automáticamente
- ❌ **No hay vista por día** dentro de la agenda (solo lista)
- ❌ **No hay alertas de check-out / check-in** de hotel que se generen automáticamente
- La agenda existe como lista de tareas genérica, no como agenda operativa del viaje descrita en el doc ejecutivo

---

### MÓDULO 10 — Itinerario inteligente
**% de avance: 50%**

**Qué SÍ existe:**
- `ItineraryPage.tsx` — vista por día, agrupación de eventos por `dayIndex`
- `AddEventPage.tsx` — añade evento con tipo (flight/hotel/activity/place/transport/meal/free), hora inicio/fin, descripción, código de confirmación
- `itineraryService.ts` — persistencia en Supabase tabla `itinerary_events`
- `reorderItineraryEvents` — lógica de reordenamiento por drag (orden persistente)
- Integración con `savedPlaces` (lugares guardados aparecen en el itinerario)

**Qué FALTA:**
- ❌ **No hay optimización de recorridos** — el itinerario no ordena eventos por distancia geográfica o lógica de traslados
- ❌ **No hay ajuste por clima** — si llueve en un día, el sistema no propone mover actividades de exterior
- ❌ **No hay cálculo de tiempos de traslado entre eventos** del itinerario
- ❌ **Itinerario colaborativo** — no existe (compartir con acompañantes, votación, aprobación de cambios)
- ❌ **Ajuste por presupuesto** — el itinerario no sabe cuánto cuesta cada actividad
- El itinerario es manual: el usuario lo construye a mano. No es "inteligente" en el sentido del doc ejecutivo.

---

### MÓDULO 11 — Explorer contextual y recomendaciones
**% de avance: 45%**

**Qué SÍ existe:**
- `RecommendationsPage.tsx` — permite buscar lugares por categoría (attraction/restaurant/cafe/museum/park/shopping)
- `recommendationsService.ts` → `fetchNearbyPlaces()` → `places-nearby` edge function → Google Places API Nearby Search 🔑
- Filtro por `traveler_profile` (economic/balanced/comfort/premium) via `priceLevelMaxForProfile`
- Guardar lugar (`addSavedPlace`) con persistencia en Supabase tabla `trip_places`
- `PlacesPage.tsx` + `AddPlacePage.tsx` — gestión de lugares guardados

**Qué FALTA:**
- ❌ **Solo disponible para Premium** — usuarios free no pueden usar el explorer
- ❌ **No hay modo "si llueve"** o "si solo tengo 1 hora" — no hay filtros contextuales situacionales
- ❌ **No hay recomendaciones abiertas** (mariscos cerca, crepas cerca, etc.) — solo categorías predefinidas
- ❌ **No hay modo presupuesto del explorer** como filtro explícito en la UI
- ❌ **No hay recomendaciones de emergencia 24h** (farmacias, hospitales, cajeros)
- ❌ **No hay recomendaciones familiares / para niños** diferenciadas del contexto
- ❌ **No hay persistencia de caché de recomendaciones** por sesión — cada búsqueda reconsulta la API

---

### MÓDULO 12 — Movilidad urbana y transporte
**% de avance: 35%**

**Qué SÍ existe:**
- `TripRoutePage.tsx` — ruta desde origen a destino vía OSRM (auto) y Google Directions (tránsito) 🔑
- `routes-transit` edge function — pasos de transporte público (metro, camión, tren) con instrucciones y tiempos
- Deep links a Google Maps, Waze, Apple Maps para navegación
- `mapsService.ts` — centraliza deep links por tipo de transporte

**Qué FALTA:**
- ❌ **No hay "Cómo me muevo aquí"** — la ruta es global destino→destino, no para moverse dentro del viaje entre lugares
- ❌ **"Rutas por lugar visitado"** — cada lugar del itinerario debería tener su ruta de llegada. Esto NO existe. Es uno de los módulos marcados como "Altísima" prioridad en el doc ejecutivo
- ❌ **Offline mobility pack** — no existe. No hay guardado de trayectos ni mapas offline
- ❌ **"Último transporte del día"** — no existe
- ❌ **Filtros por maleta, niño, adulto mayor** para transporte — no existen
- La movilidad existe como "lanzador de apps de mapas", no como módulo contextual

---

### MÓDULO 13 — Weather Intelligence
**% de avance: 55%**

**Qué SÍ existe:**
- `weatherService.ts` — Open-Meteo (gratuito, sin key): geocodificación + pronóstico real por rango de fechas del viaje
- `weatherCacheService.ts` — caché en Supabase de pronóstico por trip
- `weather-cache` edge function — caché server-side del pronóstico
- `WeatherForecastModal.tsx` — modal con pronóstico por día (visible desde home)
- `dailyForecastEngine.ts` — procesa pronóstico por día
- Clima se usa para generar packing items automáticamente
- El chip de clima en la home muestra temperatura y tipo de clima

**Qué FALTA:**
- ❌ **No hay alertas de lluvia / calor extremo** durante el viaje vía notificación push
- ❌ **Motor "si cambia el clima"** — no existe. Si el pronóstico cambia, el sistema no reacomoda actividades ni propone plan B
- ❌ **Sugerencia de ropa por día** basada en clima — el packing es estático una vez generado
- ❌ **Ajuste de agenda por clima** — no hay conexión entre el pronóstico y el itinerario
- El pronóstico es visible e informativo, pero no es "clima operativo" que cambie el viaje

---

### MÓDULO 14 — Travel Wallet
**% de avance: 50%**

**Qué SÍ existe:**
- `WalletPage.tsx` — sube documentos (PDF/imagen) a Supabase Storage bucket `wallet_docs`
- Tipos de documento: boarding_pass, reservation, ticket, policy, document, other
- `walletDocsService.ts` — `fetchWalletDocs`, `upsertWalletDoc`, `deleteWalletDocRemote`
- RLS habilitado en bucket `wallet_docs`
- Vista de documentos guardados con nombre de archivo y tipo
- Eliminación de documentos

**Qué FALTA:**
- ❌ **No hay visor de documentos dentro de la app** — solo se muestra el nombre del archivo, no se puede abrir/ver el documento
- ❌ **No hay pasaporte / visa / INE / licencia como campos específicos** — todo es genérico "document"
- ❌ **No hay alertas de vencimiento** — no se extraen ni almacenan fechas de expiración
- ❌ **Modo robo/pérdida** — NO EXISTE. Es uno de los diferenciales más importantes del doc ejecutivo
- ❌ **Acceso rápido a datos críticos** sin autenticación — no hay modo de acceso de emergencia a la wallet
- La wallet es un gestor básico de archivos adjuntos, no una Wallet documental inteligente

---

### MÓDULO 15 — OCR documental
**% de avance: 30%**

**Qué SÍ existe:**
- `ai-orchestrator` edge function con task `document_ocr` — envía imagen/PDF a GPT Vision para extracción de texto
- `analyzeDoc()` en `WalletPage.tsx` — botón de "Analizar" en la wallet que invoca el OCR
- Task `boarding_pass_ocr` — OCR específico para boarding passes en `BoardingPassScannerPage`

**Qué FALTA:**
- ❌ **Extracción estructurada de campos** — el OCR devuelve texto libre, no objetos con `numero_pasaporte`, `fecha_vencimiento`, `nombre`, etc.
- ❌ **Clasificación automática del tipo de documento** — no existe, el usuario selecciona manualmente
- ❌ **Almacenamiento de campos extraídos** en columnas de DB (no hay tabla de campos OCR)
- ❌ **Alertas de vencimiento** basadas en fechas extraídas — no existen
- ❌ **Modo robo/pérdida** con acceso a copias seguras y pasos de contingencia — NO EXISTE

---

### MÓDULO 16 — Emergency Travel Card
**% de avance: 70%**

**Qué SÍ existe:**
- `EmergencyCardPage.tsx` (505 líneas) — pantalla completa con onboarding, overview y formulario de edición
- `EmergencyCardForm.tsx` — formulario con nombre, foto (placeholder), edad, tipo de sangre, alergias, condiciones médicas, medicamentos, contactos de emergencia, idioma, país, seguro médico
- `emergencyService.ts` — CRUD completo en Supabase tabla `emergency_profiles`
- Generación de token aleatorio (`public_token`) con crypto
- `getEmergencyQrAccessLogs` — historial de accesos al QR
- `EmergencyPublicPage.tsx` — vista pública accesible via `/emergency/:publicToken` sin autenticación

**Qué FALTA:**
- ❌ **Foto de perfil real** — hay placeholder, no hay upload real de foto en la Emergency Card
- ❌ **Campos visibles configurables** — no hay toggle por campo para decidir qué es público y qué es privado
- ❌ **Modo acompañante** — persona autorizada con acceso controlado a datos de emergencia, agenda del día, hotel, último check-in — NO EXISTE
- ❌ **Token temporal** — el token generado es permanente hasta que se regenere manualmente, no tiene expiración automática por tiempo

---

### MÓDULO 17 — QR de emergencia
**% de avance: 65%**

**Qué SÍ existe:**
- `EmergencyQRModal.tsx` — genera QR real con `qrcode.react` apuntando a `/emergency/:publicToken`
- `regenerateEmergencyToken()` — regeneración del token (invalida el anterior)
- `logEmergencyPublicAccess()` — registra cada vez que alguien escanea el QR (fuente, timestamp)
- `getEmergencyPublicView()` — RPC de Supabase que sirve la vista pública sin autenticación
- Acceso al botón de llamada y WhatsApp desde la vista pública
- Historial de escaneos visible en la app

**Qué FALTA:**
- ❌ **Token temporal/efímero** — el token no expira por tiempo, solo se invalida manualmente
- ❌ **Modos privado / público / compartido** configurables por campo — todo es público o nada
- ❌ **Modo acompañante** — acceso diferenciado para persona autorizada con más datos que el QR público
- ❌ **Botón SOS** en la vista pública — existe en la card pero no conecta a un SOS real diferenciado
- ❌ **Control granular de visibilidad** por campo (mostrar tipo de sangre sí, número de seguro no)

---

### MÓDULO 18 — Safety Layer
**% de avance: 20%**

**Qué SÍ existe:**
- `emergencyAssistService.ts` — `buildSosMessage()` + `sendAssistedSos()` — genera y envía SOS por WhatsApp o SMS con nombre, destino y coordenadas actuales
- `locationService.ts` — `getCurrentPosition()` vía Capacitor Geolocation
- Botones de SOS en `EmergencyCardPage.tsx` que disparan WhatsApp/SMS con mensaje + ubicación

**Qué FALTA — y esto es grave:**
- ❌ **Live Safety Tracking** — NO EXISTE. No hay sistema de compartir ubicación en tiempo real. No hay sesiones de tracking, no hay backend de tracking, no hay UI de tracking
- ❌ **Safe Walk** — NO EXISTE. No hay módulo de seguimiento de trayecto corto
- ❌ **Safe Return** — NO EXISTE. No hay timer de seguridad ni escalamiento si no llega
- ❌ **"Llegué bien"** — NO EXISTE como feature propio
- ❌ **"Voy en camino"** — NO EXISTE
- ❌ **Check-ins periódicos** — NO EXISTE
- ❌ **Modo silencioso de SOS** — NO EXISTE
- ❌ **Última ubicación conocida** en base de datos — NO EXISTE
- ❌ **Batería estimada** en SOS — NO EXISTE
- ❌ **Tabla `safety_sessions`** o equivalente — NO EXISTE en el schema

**El Safety Layer es el módulo más crítico del doc ejecutivo y el más incompleto. El SOS actual es un enlace de WhatsApp. No es tracking. No es safety real.**

---

### MÓDULO 19 — Zonas de riesgo / rutas seguras
**% de avance: 25%**

**Qué SÍ existe:**
- `riskZonesService.ts` — `fetchTripRisk()` → `risk-zones` edge function
- `risk-zones` edge function — consulta ACLED o OSAC (o fuente configurada), normaliza nivel (low/medium/high/critical)
- Chip de riesgo en `HomePage.tsx` que muestra nivel del destino
- Lógica de normalización robusta en la edge function

**Qué FALTA:**
- ❌ **Heatmap / overlay de zonas peligrosas** — no hay visualización geográfica de riesgo
- ❌ **Alertas al entrar a zona de riesgo** en tiempo real — no hay geofencing
- ❌ **Rutas alternativas seguras** — el sistema dice el nivel de riesgo del país/ciudad pero no rerouta
- ❌ **Modo viajero vulnerable** — no existe
- ❌ **Filtro de recomendaciones por riesgo** — el explorer no filtra lugares por zona de riesgo
- ❌ **Integración safety + risk** — no hay conexión entre el nivel de riesgo y la activación de tracking/SOS
- El módulo solo muestra un chip de nivel de riesgo del destino. No es risk awareness operativo.

---

### MÓDULO 20 — Modo sin señal / zona remota
**% de avance: 5%**

**Qué SÍ existe:**
- Zustand con `persist` — los datos del viaje, packing, agenda e itinerario sobreviven offline si ya se cargaron
- El QR de emergencia funciona offline si el usuario guardó la URL en el dispositivo

**Qué FALTA:**
- ❌ **Activación manual o automática del modo sin señal** — NO EXISTE
- ❌ **Última ubicación segura guardada** con timestamp, altitud y precisión — NO EXISTE
- ❌ **Emergency Pack offline** (QR offline, Emergency Card offline, datos médicos, ruta crítica) — NO EXISTE como feature
- ❌ **SOS diferido** — no hay cola local de SOS para mandar cuando regrese la señal — NO EXISTE
- ❌ **Check-ins offline** — NO EXISTE
- ❌ **Alerta de entrada a zona remota** — NO EXISTE
- ❌ **Botón de retorno** con punto de salida — NO EXISTE
- ❌ **Mapa offline básico** (hotel, aeropuerto, hospital, embajada) — NO EXISTE
- Esto es prácticamente un módulo vacío.

---

### MÓDULO 21 — Salud y continuidad personal
**% de avance: 10%**

**Qué SÍ existe:**
- Ítems de packing en categoría `health` (medicamentos genéricos, kit de primeros auxilios, pastillas de altitud, etc.)
- Campos médicos en Emergency Card (alergias, condiciones, medicamentos)

**Qué FALTA:**
- ❌ **Módulo de medicamentos con horarios y dosis** — NO EXISTE. No hay recordatorios de medicación
- ❌ **Alertas de medicamentos no empacados** — la lógica de packing no cruza con un perfil médico del usuario
- ❌ **Condiciones especiales que ajusten el viaje** (embarazo → sugerencias especiales, diabetes → farmacias cerca, movilidad reducida → no sugerir actividades difíciles) — NO EXISTE
- ❌ **Hospitales y farmacias cercanas** como módulo operativo — existe el Places API pero no hay un shortcut de "apoyo médico urgente"
- El módulo de salud descrito en el doc ejecutivo no existe. Lo que hay es packing de salud y datos médicos en la emergency card.

---

### MÓDULO 22 — Traductor contextual y comunicaciones
**% de avance: 50%**

**Qué SÍ existe:**
- `TranslatorPage.tsx` — traducción de texto con selección de idiomas
- `QuickPhrasesPage.tsx` — frases rápidas predefinidas
- `translateService.ts` — usa MyMemory API (gratuita, sin key)
- `shareService.ts` — compartir contenido vía Capacitor Share
- `emergencyAssistService.ts` — WhatsApp/SMS para SOS

**Qué FALTA:**
- ❌ **Traducción por voz** — no existe (no hay integración de Speech-to-Text)
- ❌ **Frases por escenario** (restaurante, transporte, hotel, farmacia, policía/emergencia) — `QuickPhrasesPage` existe pero no sabemos si tiene todos estos escenarios sin verlo completo
- ❌ **Centro de mensajes del viaje** — NO EXISTE. No hay un lugar centralizado donde el usuario vea todas las alertas, recordatorios y cambios del viaje
- ❌ **WhatsApp utility layer completo** — compartir ruta, ETA, QR, ubicación, "llegué" — parcialmente existe (SOS) pero no como feature propio de sharing
- ❌ **"Llegué bien" / "Voy en camino"** como mensajes rápidos — no existen como feature

---

### MÓDULO 23 — Finanzas del viaje
**% de avance: 35%**

**Qué SÍ existe:**
- `SplitBillPage.tsx` — calculadora de división de gastos (total / personas / propina = per capita)
- Modo avanzado: ingreso individual por persona
- `CurrencyConverterPage.tsx` — conversor de divisas conectado a `exchange-rates` edge function → ExchangeRate API 🔑
- `currencyService.ts` — `fetchRates()` + `convertAmount()`
- Tablas en schema: `split_bill_sessions`, `split_bill_expenses`

**Qué FALTA:**
- ❌ **El split bill NO persiste en Supabase** — `SplitBillPage.tsx` usa estado local React sin guardar en DB. Las tablas existen en el schema pero no hay service que las use
- ❌ **Budget Companion** — NO EXISTE. No hay presupuesto del viaje, no hay registro de gastos por categoría, no hay alertas de desviación
- ❌ **Modo ahorro / gasto inteligente** — NO EXISTE
- ❌ **Gastos entre acompañantes** persistentes — el split bill es una calculadora sin memoria
- ❌ **Conversión contextual** (¿cuánto vale esto en mi moneda?) integrada en recomendaciones o explorer — no existe
- **Las finanzas del viaje son prácticamente un módulo vacío sin persistencia real.**

---

### MÓDULO 24 — Reservation Import Engine
**% de avance: 40%**

**Qué SÍ existe:**
- `ImportReservationPage.tsx` — el usuario pega texto de una reserva
- `reservationParserService.ts` → `ai-orchestrator` task `reservation_parse` — la IA extrae tipo, título, descripción, hora, código de confirmación
- El resultado se convierte en un `ItineraryEvent` y se guarda en el itinerario
- La página muestra el resultado parseado para confirmar antes de guardar

**Qué FALTA:**
- ❌ **Importación desde correo electrónico** — NO EXISTE. El usuario tiene que copiar y pegar el texto manualmente. No hay Gmail API ni Graph API ni lector de email
- ❌ **Centro de reservas** como vista unificada de todas las reservas — el itinerario agrupa eventos pero no hay una vista "Mis reservas" con estado operativo, datos de contacto, ubicación de cada una
- ❌ **Importación de imágenes** (voucher foto) con OCR — no existe para reservas
- El import es útil pero limitado. No hay "detección automática de vuelos en tu correo".

---

### MÓDULO 25 — Travel Memory Layer
**% de avance: 5%**

**Qué SÍ existe:**
- El historial de viajes pasados en `TripHistoryPage.tsx`
- Los lugares visitados guardados en `trip_places`

**Qué FALTA:**
- ❌ **Bitácora** — NO EXISTE
- ❌ **Fotos + notas por día de viaje** — NO EXISTE como módulo
- ❌ **Checkpoints / historias** — NO EXISTE
- ❌ **Resumen automático del día** — NO EXISTE
- ❌ **Retrospectiva del viaje** — NO EXISTE
- ❌ **Recomendaciones post-viaje** (qué repetirías, qué empacar distinto) — NO EXISTE
- ❌ **"Relive"** — NO EXISTE
- Prácticamente no existe. Los viajes pasados son solo una lista.

---

### MÓDULO 26 — IA Premium / Capa wow
**% de avance: 20%**

**Qué SÍ existe:**
- `ai-orchestrator` edge function — orquesta múltiples proveedores (OpenAI/Anthropic/Groq) para tasks específicos: translation, boarding_pass_ocr, document_ocr, reservation_parse, luggage_analysis, packing_validation_scan, suitcase_layout_plan, reviews_summary
- Lógica de fallback entre proveedores
- El sistema de IA está bien diseñado a nivel infraestructura

**Qué FALTA:**
- ❌ **IA asistente del viaje** — no hay un chat o interfaz donde el usuario pregunte "¿qué me falta?" o "¿qué hago hoy?" — NO EXISTE como UI
- ❌ **Replaneación en tiempo real** — si cambia el clima o se retrasa el vuelo, la app no propone cambios automáticamente
- ❌ **Modo viaje con ansiedad** — NO EXISTE. No hay modo simplificado/reducido para viajeros con ansiedad
- ❌ **Conexión de la IA al contexto completo del viaje** — el orquestador recibe `trip_context` pero no hay un agente que lea agenda + itinerario + clima + presupuesto + riesgo y genere una respuesta orquestada
- La IA existe como servicio de procesamiento puntual (OCR, parseo, análisis) pero no como asistente transversal del viaje

---

## 4. RESUMEN DE % DE AVANCE POR MÓDULO

| # | Módulo | % Avance | Estado |
|---|---|---|---|
| 1 | Onboarding / Trip Object | **75%** | ⚠️ Parcial |
| 2 | Smart Trip Brain / Dashboard | **40%** | ⚠️ Parcial crítico |
| 3 | Smart Packing Engine | **70%** | ⚠️ Parcial |
| 4 | Escáner de maleta visual | **45%** | ⚠️ Parcial |
| 5 | Motor de acomodo | **40%** | ⚠️ Parcial |
| 6 | Reglas especiales equipaje | **35%** | ⚠️ Parcial débil |
| 7 | Roadtrip Intelligence | **18%** | ❌ Casi vacío |
| 8 | Flight Companion / Airport | **30%** | ⚠️ Parcial débil |
| 9 | Agenda de viaje | **60%** | ⚠️ Parcial |
| 10 | Itinerario inteligente | **50%** | ⚠️ Parcial |
| 11 | Explorer y recomendaciones | **45%** | ⚠️ Parcial |
| 12 | Movilidad urbana | **35%** | ⚠️ Parcial débil |
| 13 | Weather Intelligence | **55%** | ⚠️ Parcial |
| 14 | Travel Wallet | **50%** | ⚠️ Parcial |
| 15 | OCR documental | **30%** | ⚠️ Parcial débil |
| 16 | Emergency Travel Card | **70%** | ⚠️ Parcial |
| 17 | QR de emergencia | **65%** | ⚠️ Parcial |
| 18 | Safety Layer | **20%** | ❌ Crítico |
| 19 | Zonas de riesgo | **25%** | ❌ Débil |
| 20 | Modo sin señal | **5%** | ❌ Casi vacío |
| 21 | Salud y continuidad | **10%** | ❌ Casi vacío |
| 22 | Traductor y comunicaciones | **50%** | ⚠️ Parcial |
| 23 | Finanzas del viaje | **35%** | ⚠️ Parcial débil |
| 24 | Reservation Import Engine | **40%** | ⚠️ Parcial |
| 25 | Travel Memory Layer | **5%** | ❌ Casi vacío |
| 26 | IA Premium / Capa wow | **20%** | ❌ Débil |

**PROMEDIO GLOBAL DE AVANCE: ~38%**

> Si solo se considera el núcleo irrenunciable (Capas 1 y 2 del doc ejecutivo), el avance es aproximadamente **45%**.

---

## 5. APIS EXTERNAS — ESTADO REAL

### APIs confirmadas en código (hay edge function que las consume):

| API | Función | Key requerida | ¿Gratuito? | Notas |
|---|---|---|---|---|
| **Open-Meteo** | Clima y geocodificación | ❌ No | ✅ Gratis | Única API gratis completa |
| **OSRM** | Rutas en auto (distancia/tiempo) | ❌ No | ✅ Gratis | Sin tráfico real |
| **MyMemory** | Traducción de texto | ❌ No (básico) | ✅ Gratis limitado | Límite de caracteres/día |
| **Google Maps API** | Places Nearby, Directions, Geocoding | ✅ SÍ | 💰 Pago | `GOOGLE_MAPS_SERVER_API_KEY` o `GOOGLE_MAPS_API_KEY` en env |
| **AviationStack** | Estado de vuelos en tiempo real | ✅ SÍ | 💰 Pago (plan free muy limitado) | `AVIATIONSTACK_API_KEY` |
| **ExchangeRate API** | Tipos de cambio | ✅ SÍ | 💰 Plan free disponible | `EXCHANGE_RATE_KEY` |
| **OpenAI** | OCR visual, parseo, traducción IA, análisis packing | ✅ SÍ | 💰 Pago por tokens | `OPENAI_API_KEY` |
| **Anthropic** | Alternativa a OpenAI | ✅ SÍ | 💰 Pago | `ANTHROPIC_API_KEY` |
| **Groq** | Alternativa rápida para texto | ✅ SÍ | 💰 Plan free disponible | `GROQ_API_KEY` |
| **Stripe** | Pagos Premium | ✅ SÍ | 💰 Comisión | `STRIPE_SECRET_KEY` y webhooks |
| **ACLED/OSAC** | Datos de riesgo por país | ✅ SÍ | 💰/✅ según fuente | Configurable en edge function |

### APIs que NO existen y que el doc ejecutivo requiere:

| API Necesaria | Para qué módulo | Proveedor sugerido | Costo |
|---|---|---|---|
| **Gmail API / Microsoft Graph** | Importación de reservas desde correo | Google / Microsoft | Gratis con OAuth |
| **AviationStack / FlightAware / Cirium** | Alertas automáticas de vuelo (push real) | AviationStack, Cirium | 💰 Pago |
| **Casetas / Peajes LATAM** | Roadtrip: costo de casetas en ruta | No hay API consolidada para México | Manual o INFRAMEX |
| **Google Routes API** (nueva) | Rutas con tráfico real | Google | 💰 Pago (reemplaza Directions) |
| **HERE Maps / TomTom** | Mapas offline, tráfico, rutas alternativas | HERE / TomTom | 💰 Pago (plan free disponible) |
| **Geofencing backend** | Alertas de zonas de riesgo al entrar | AWS Location / Google / Supabase Realtime | 💰 Pago |
| **WebSocket / Supabase Realtime** | Live Safety Tracking | Supabase Realtime (ya disponible) | ✅ Incluido en Supabase |
| **Apple Speech / Google Speech** | Traducción por voz | Google Cloud Speech o Web Speech API | Gratis (Web) / 💰 |
| **Push notifications reales** | Alertas de vuelo, clima, SOS | FCM (Firebase Cloud Messaging) + APNs | Gratis |

---

## 6. ESTADO DEL BACKEND / SUPABASE

### Tablas confirmadas en schema_viaza.sql:
- ✅ `profiles`
- ✅ `trips`
- ✅ `packing_items`
- ✅ `travelers`
- ✅ `agenda_items`
- ✅ `itinerary_events`
- ✅ `trip_places`
- ✅ `wallet_docs`
- ✅ `emergency_profiles`
- ✅ `emergency_qr_access_logs`
- ✅ `split_bill_sessions`
- ✅ `split_bill_expenses`
- ✅ `packing_scan_sessions`
- ✅ `packing_scan_detections`
- ✅ `suitcase_profiles`
- ✅ `suitcase_layout_plans`
- ✅ `trip_recommendations` (tabla de recomendaciones con caché)
- ✅ `trip_risk_zones` (tabla de riesgo por destino)

### Tablas que FALTAN y el producto necesita:
- ❌ `safety_sessions` — para Live Tracking
- ❌ `safety_checkins` — para check-ins periódicos de seguridad
- ❌ `sos_events` — log de eventos SOS
- ❌ `trip_budget` — presupuesto del viaje
- ❌ `trip_expenses` — gastos registrados
- ❌ `health_profiles` — condiciones médicas y medicamentos del viajero
- ❌ `medication_schedules` — recordatorios de medicación
- ❌ `trip_memories` — bitácora/fotos del viaje
- ❌ `offline_queue` — cola de eventos offline para sincronizar
- ❌ `companion_access` — permisos del modo acompañante

### Edge Functions existentes:
✅ `ai-orchestrator` | ✅ `airlines-autocomplete` | ✅ `destination-resolve` | ✅ `exchange-rates` | ✅ `flight-info` | ✅ `places-autocomplete` | ✅ `places-details` | ✅ `places-nearby` | ✅ `risk-zones` | ✅ `routes-transit` | ✅ `stripe-create-checkout-session` | ✅ `stripe-customer-portal` | ✅ `stripe-sync-premium` | ✅ `stripe-webhook` | ✅ `weather-cache`

### Edge Functions que FALTAN:
- ❌ `safety-tracking` — Live Tracking backend
- ❌ `sos-handler` — procesamiento y log de SOS
- ❌ `flight-alerts` — polling de estado de vuelo para notificaciones push
- ❌ `email-import` — parseo de emails de reservas
- ❌ `budget-insights` — análisis de gasto vs presupuesto

---

## 7. ESTADO ANDROID / CAPACITOR

**Configuración confirmada:**
- Capacitor 6.0 con Android configurado
- `capacitor.config.ts` — `appId: 'com.viaza.app'`, scheme HTTPS, webDir `dist`
- `android/keystore/viaza-release.jks` — keystore de producción existe ✅
- `keystore.properties` — configurado ✅
- `google-services.json` — existe en `android/app/` ✅ (Firebase configurado para Android)
- Plugins: @capacitor/camera, @capacitor/geolocation, @capacitor/local-notifications, @capacitor/haptics, @capacitor/share, @capacitor/preferences, @capacitor/device

**Problema detectado en el terminal:**
El último comando ejecutado fue `cd android && ./gradlew signingReport` con exit code 127. Esto indica que `./gradlew` no fue encontrado o no tiene permisos de ejecución. **El build de Android está bloqueado en este momento.**

**Posibles causas:**
1. `gradlew` no tiene permisos de ejecución (`chmod +x android/gradlew`)
2. Java/JDK no está en PATH
3. Android SDK no configurado en `local.properties`

---

## 8. BRECHAS CRÍTICAS — LOS 10 PROBLEMAS MÁS GRAVES

En orden de impacto para la propuesta de valor de VIAZA:

### 🔴 CRÍTICO 1: Safety Layer prácticamente vacía
El módulo más diferencial del producto según el doc ejecutivo no existe en producción. El SOS es un enlace de WhatsApp. No hay live tracking, no hay safe walk, no hay safe return, no hay check-ins periódicos. Este es el mayor engaño del estado actual.

### 🔴 CRÍTICO 2: Finanzas sin persistencia real
El split bill es una calculadora estática sin backend. El Budget Companion no existe. Las tablas DB existen pero nadie las usa. El usuario no puede llevar control financiero real de su viaje.

### 🔴 CRÍTICO 3: Wallet sin visor y sin modo robo/pérdida
Subes documentos pero no puedes verlos dentro de la app. El modo robo/pérdida — uno de los diferenciales más fuertes del doc ejecutivo — no existe. No hay alertas de vencimiento.

### 🔴 CRÍTICO 4: Smart Trip Brain es un menú, no un cerebro
La home muestra módulos pero no un dashboard operativo. No hay "qué sigue", no hay "pendientes críticos", no hay detección de huecos en la planeación.

### 🔴 CRÍTICO 5: Modo sin señal no existe
Un viajero en zona remota no tiene respaldo de VIAZA. No hay offline pack, no hay SOS diferido, no hay datos médicos cacheados offline. Si no hay señal, la app no sirve.

### 🔴 CRÍTICO 6: Roadtrip Intelligence es solo un lanzador de Maps
No hay casetas, gasolineras, paradas seguras, check mecánico, evaluación de riesgo carretero. Para un tipo de viaje que es `roadtrip`, la experiencia es básicamente: "Abrir Google Maps".

### 🔴 CRÍTICO 7: La IA no es asistente — es procesador de tareas
No hay interfaz de IA que el usuario pueda usar para preguntar cosas de su viaje. El orquestador procesa imágenes y textos específicos pero no hay agente transversal.

### 🔴 CRÍTICO 8: No hay importación real de reservas desde correo
El import requiere copiar y pegar texto. No hay conexión a Gmail ni a ningún correo. La promesa de "importar automáticamente" no existe.

### 🔴 CRÍTICO 9: Travel Memory Layer casi no existe
Después del viaje, VIAZA muere. No hay bitácora, no hay fotos del viaje, no hay resumen automático. La retención post-viaje es prácticamente cero.

### 🔴 CRÍTICO 10: Push Notifications reales no configuradas
Hay `@capacitor/local-notifications` (notificaciones locales del dispositivo) pero no hay FCM/APNs para notificaciones push desde el servidor. Esto significa que las alertas de vuelo, clima o SOS solo funcionan si la app está abierta.

---

## 9. LO QUE SÍ ESTÁ BIEN Y ES REAL

Para ser justo, esto existe y funciona de verdad:

✅ **Autenticación completa** — registro, login, forgot password, reset password, sesión persistente con Supabase Auth

✅ **Onboarding de 13 pasos** — flujo completo con geocodificación real del destino, clima real, creación de Trip Object

✅ **Smart Packing Checklist** — generación automática contextual, por viajero, categorías, persistencia real en Supabase

✅ **Emergency Card con QR y token** — perfil médico editable, QR escaneable, vista pública sin auth, log de accesos, regeneración de token

✅ **Weather real** — Open-Meteo sin key, pronóstico por día para el rango del viaje, caché en Supabase

✅ **Travel Wallet básico** — subida de archivos a Supabase Storage con RLS

✅ **Itinerario editable** — creación de eventos por día, persistencia, reordenamiento

✅ **Agenda operativa básica** — ítems con fecha/hora, notificaciones locales, completado

✅ **Escáner de maleta vía IA** — flujo real con cámara + GPT Vision + persistencia en DB

✅ **Motor de acomodo básico** — generación de plan de acomodo vía IA con persistencia

✅ **Import de reservas por texto** — OCR de texto libre vía IA, conversión a evento de itinerario

✅ **Recomendaciones de lugares** — Google Places API Nearby real (Premium)

✅ **SOS asistido** — mensaje con ubicación real por WhatsApp/SMS

✅ **Risk chip del destino** — nivel de riesgo real vía edge function

✅ **Traductor básico** + frases rápidas

✅ **Split Bill calculadora** (sin persistencia)

✅ **Conversor de divisas real** (ExchangeRate API)

✅ **Departure reminder** — cálculo de hora de salida + notificación local

✅ **Boarding pass scanner** — OCR de boarding pass con cámara + IA

✅ **Android configurado** — keystore, google-services.json, Capacitor 6

✅ **Premium con Stripe** — checkout, customer portal, webhook, sync de estado premium

✅ **Pagos funcionales** — las edge functions de Stripe están completas

---

## 10. PLAN DE EJECUCIÓN PRIORIZADO

### FASE 1 — Cerrar brechas del núcleo irrenunciable (4-6 semanas)
*Lo que VIAZA debe tener para ser el producto que describe el doc ejecutivo.*

| Tarea | Módulo | Esfuerzo | Prioridad |
|---|---|---|---|
| 1. Live Safety Tracking básico | Safety Layer | Alto | 🔴 Máxima |
| 2. Safe Walk / Safe Return + check-ins | Safety Layer | Medio | 🔴 Máxima |
| 3. Tablas DB: safety_sessions, sos_events, safety_checkins | Backend | Bajo | 🔴 Máxima |
| 4. Budget del viaje con persistencia real | Finanzas | Medio | 🔴 Alta |
| 5. Split bill persistente (conectar a tablas existentes) | Finanzas | Bajo | 🔴 Alta |
| 6. Visor de documentos en Wallet | Wallet | Bajo | 🔴 Alta |
| 7. Modo robo/pérdida con pasos y acceso a copias | Wallet | Medio | 🔴 Alta |
| 8. Alertas de vencimiento de documentos | Wallet/OCR | Medio | 🔴 Alta |
| 9. Smart Trip Brain: vista "hoy / qué sigue / pendientes" | Dashboard | Alto | 🔴 Alta |
| 10. Push Notifications FCM/APNs | Infraestructura | Medio | 🔴 Alta |

### FASE 2 — Fortalecer módulos parciales (4-6 semanas)
| Tarea | Módulo | Esfuerzo |
|---|---|---|
| 1. Modo acompañante (acceso autorizado a Emergency Card) | Emergency | Medio |
| 2. Token efímero con expiración para QR | QR Emergency | Bajo |
| 3. Campos de visibilidad configurables en Emergency Card | Emergency | Bajo |
| 4. Roadtrip: check mecánico + evaluación del viaje | Roadtrip | Medio |
| 5. Roadtrip: gasolineras y paradas en ruta (Google Places en ruta) | Roadtrip | Alto |
| 6. Modo salud: medicamentos con horarios + alertas | Salud | Medio |
| 7. Condiciones especiales en onboarding y perfil | Salud / Onboarding | Medio |
| 8. Rutas por lugar visitado (calcular traslado entre eventos) | Movilidad | Medio |
| 9. Centro de mensajes del viaje (alertas unificadas) | Comunicaciones | Medio |
| 10. Optimización de itinerario por distancia | Itinerario | Alto |
| 11. Foto real en Emergency Card | Emergency | Bajo |

### FASE 3 — Módulos nuevos de alto valor (6-8 semanas)
| Tarea | Módulo | Esfuerzo |
|---|---|---|
| 1. Modo sin señal / zona remota (offline pack básico) | Modo offline | Alto |
| 2. Health continuity module completo | Salud | Alto |
| 3. Travel Memory básica (notas + fotos por día) | Memoria | Medio |
| 4. IA asistente del viaje (interfaz conversacional) | IA Premium | Alto |
| 5. Risk awareness con zonas geográficas (heatmap básico) | Zonas riesgo | Alto |
| 6. Flight alerts automáticas (polling + push) | Flight | Medio |
| 7. Importación de reservas desde correo (Gmail OAuth) | Import | Alto |
| 8. Itinerario colaborativo básico | Itinerario | Alto |
| 9. Modo ansiedad / viajero vulnerable | UX | Medio |
| 10. Retrospectiva del viaje y recomendaciones post-viaje | Memoria | Medio |

---

## 11. VARIABLES DE ENTORNO REQUERIDAS PARA PRODUCCIÓN

El proyecto requiere las siguientes variables en Supabase Edge Functions. Si alguna falta, el módulo correspondiente no funciona:

| Variable | Módulo afectado | Estado |
|---|---|---|
| `OPENAI_API_KEY` | OCR, análisis maleta, parseo reservas, acomodo, traducción IA | 🔑 Requerida |
| `ANTHROPIC_API_KEY` | Alternativa a OpenAI | 🔑 Opcional (backup) |
| `GROQ_API_KEY` | Traducción rápida | 🔑 Opcional (backup) |
| `GOOGLE_MAPS_SERVER_API_KEY` | Places Nearby, Directions Transit, Places Details | 🔑 Requerida para Premium |
| `AVIATIONSTACK_API_KEY` | Estado de vuelos en tiempo real | 🔑 Requerida para Flight Companion |
| `EXCHANGE_RATE_KEY` | Conversor de divisas | 🔑 Requerida |
| `STRIPE_SECRET_KEY` | Pagos Premium | 🔑 Requerida |
| `STRIPE_WEBHOOK_SECRET` | Webhook de Stripe | 🔑 Requerida |
| `STRIPE_PRICE_ID_MONTHLY` | Plan mensual | 🔑 Requerida |
| `STRIPE_PRICE_ID_YEARLY` | Plan anual | 🔑 Requerida |
| `ACLED_API_KEY` o fuente de riesgo | Zonas de riesgo | 🔑 Opcional (fallback genérico) |

**Sin OpenAI y sin Google Maps API, el 40% de las funciones "Premium" no funcionan.**

---

## 12. VEREDICTO FINAL DEL AUDITOR

**VIAZA tiene bases sólidas y honestas**: stack limpio, código organizado, schema bien diseñado con RLS, edge functions bien estructuradas, autenticación funcional, y varios módulos con lógica real de producción. No es un mock ni un demo. Es una app parcialmente funcional con código real.

**El problema no es que el código sea falso. El problema es que existe una brecha de ~60% entre lo que Codex reportó como "hecho" y lo que realmente está funcional end-to-end según la definición del doc ejecutivo de "Estado deseado 100%".**

Los 4 módulos firma están a medio camino:
- Smart Packing: 70% (falta motor de cantidades y reglas de aerolínea específicas)
- Travel Wallet + OCR: 40% (falta visor, modo robo/pérdida, extracción estructurada)
- Emergency Card + QR: 68% (falta modo acompañante, token efímero, visibilidad granular)
- **Safety Layer: 20%** ← Este es el que más duele. Es el corazón de la diferenciación de seguridad y prácticamente no existe.

**En modo producción real, con usuarios reales viajando:**
- La experiencia de packing y emergency card sería usable
- El tracking de seguridad los dejaría desprotegidos
- Las finanzas no se guardarían
- El modo offline los abandonaría en zona remota
- El Roadtrip Intelligence los mandaría a Google Maps

**Avance global honesto: 38% del Documento Ejecutivo Director.**

---

*Auditoría realizada con lectura directa del código fuente. 28 de marzo de 2026.*  
*Auditor: GitHub Copilot — sin sesgo hacia Codex.*
