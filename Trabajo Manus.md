VIAZA — Handoff técnico para el programador

Repositorio: AdmiKode/VIAZA · rama main · commit final 2884557
Fecha de sesión: 12 de marzo de 2026
Preparado por: Manus AI




1. Contexto de la sesión

Esta sesión partió del commit 798a946 (el estado original del repo) y avanzó en tres etapas claramente diferenciadas: primero una auditoría completa del código contra el manifiesto del producto, luego la implementación de todas las funciones faltantes identificadas en la auditoría, y finalmente el diseño del schema SQL completo para Supabase. El resultado son dos commits nuevos sobre main que suman 1,703 líneas insertadas y 13 archivos nuevos.




2. Historial de commits de la sesión

Commit
Mensaje
Archivos
798a946
Estado original del repo (punto de partida)
—
9a88afc
feat: implementación completa MVP producción
23 archivos modificados/creados
2884557
feat: OCR boarding pass, ruta Waze/Maps, refresco clima, schema Supabase
13 archivos modificados/creados







3. Auditoría inicial (commit 798a946)

Antes de tocar una sola línea de código se realizó una auditoría exhaustiva del repo contra el manifiesto del producto. Los hallazgos más importantes fueron:

Lo que ya funcionaba correctamente:

El motor de packing bidimensional (travelType × travelerGroup) era más avanzado de lo que describía el manifiesto: 23 actividades, 8 tipos de viaje, overlays por perfil familiar incluyendo family_baby, y lógica de laundry planner integrada. El SmartTripDetectionPage ya consultaba Open-Meteo y OpenWeatherMap en paralelo. Los íconos duotone SVG inline estaban implementados sin dependencias externas. El tsconfig.json tenía strict: true y el build compilaba sin errores de TypeScript.

Los tres incumplimientos críticos identificados:

El translateService.ts era un mock que devolvía "texto (idioma)" en lugar de llamar a OpenAI, a pesar de que la key VITE_OPENAI_API_KEY ya estaba en el .env.example. El DepartureReminderPage calculaba la hora de salida pero el botón no creaba ninguna notificación real: los plugins de Capacitor estaban en package.json pero sin importar en ningún archivo. Finalmente, seis servicios de dispositivo (storageService, locationService, shareService, hapticsService, notificationsService, cameraService) no existían como archivos — los plugins estaban instalados pero eran letra muerta.

Incumplimientos menores:

Cuatro strings hardcodeados en inglés en AirlineRulesPage.tsx ("Terminal salida", "Gate", "Terminal llegada") y HomePage.tsx ("Smart Travel Companion") sin pasar por t(). Los archivos i18n de pt, fr y de tenían entre 12 y 18 claves faltantes respecto a en.json. El boardingPassScanner, la TripRoutePage y el WeatherForecastModal de 14 días no existían.




4. Cambios implementados — commit 9a88afc

4.1 Translator conectado a OpenAI real

Archivo modificado: viaza/src/modules/translator/services/translateService.ts

El mock fue reemplazado completamente. El servicio ahora llama a https://api.openai.com/v1/chat/completions con gpt-4.1-mini vía fetch directo (sin SDK ). Si VITE_OPENAI_API_KEY no está configurada, lanza un error claro al usuario en lugar de devolver texto falso. El idioma de destino se pasa como parámetro y el prompt del sistema instruye a la IA a devolver únicamente la traducción sin explicaciones.

4.2 i18n — 5 idiomas completos

Archivos modificados: src/lib/i18n/locales/es.json, en.json, pt.json, fr.json, de.json

Se completaron los cinco archivos de idioma hasta tener paridad total de claves. El archivo es.json tiene 510 líneas (el más completo por ser el idioma base), los demás tienen 493 líneas cada uno. Se agregaron claves nuevas para todos los módulos implementados en esta sesión: weather.forecast.*, luggage.*, boarding.*, route.*, history.*, business.*, activities.*. Los cuatro strings hardcodeados en AirlineRulesPage y HomePage fueron reemplazados con llamadas a t().

4.3 Componentes UI base nuevos

Archivos creados:

src/components/ui/ModalSheet.tsx — Sheet deslizable desde abajo con efecto cristal (backdrop-blur), overlay oscuro y animación de entrada/salida con Framer Motion. Acepta isOpen, onClose, title y children. Es el componente base que usan el WeatherForecastModal, el PackingEvidenceModal y el LuggageAssistantPage.

src/components/ui/EmptyState.tsx — Estado vacío reutilizable con ícono SVG, título, descripción y botón de acción opcional.

src/components/ui/ProgressBar.tsx — Barra de progreso con valor de 0 a 100, color configurable y animación de llenado.

src/components/ui/AppChip.tsx — Chip/etiqueta pequeña con variantes default, success, warning y error.

4.4 Motor de pronóstico diario real

Archivo creado: src/engines/dailyForecastEngine.ts (125 líneas)

Llama a la API hourly de Open-Meteo (https://api.open-meteo.com/v1/forecast ) con las variables temperature_2m, weathercode, precipitation_probability y windspeed_10m. Agrupa las horas en tres franjas: mañana (06:00–11:59), tarde (12:00–17:59) y noche (18:00–23:59). Para cada franja calcula la temperatura promedio, el código de clima más frecuente y la probabilidad máxima de lluvia. Devuelve un array de hasta 14 objetos DailyForecast, uno por día del viaje.

Archivo creado: src/modules/weather/components/WeatherForecastModal.tsx (297 líneas)

Modal cristal que muestra el pronóstico completo del viaje. Usa dailyForecastEngine al abrirse si los datos tienen más de 6 horas o no existen. Cada día se muestra como una tarjeta expandible con las tres franjas horarias, temperatura, ícono de clima y probabilidad de lluvia. El scroll es horizontal para los días y vertical para las franjas.

4.5 Seis servicios nativos de Capacitor

Archivos creados en src/services/:

cameraService.ts — Envuelve @capacitor/camera. Expone takePhoto() que retorna la imagen en base64. En web usa el input de archivo del navegador como fallback. Maneja los permisos de cámara antes de cada llamada.

notificationsService.ts — Envuelve @capacitor/local-notifications. Expone scheduleNotification({ title, body, at }) que programa una notificación local en la fecha/hora indicada. Solicita permisos automáticamente si no están concedidos. En web muestra una Notification del navegador como fallback.

hapticsService.ts — Envuelve @capacitor/haptics. Expone impactLight(), impactMedium(), impactHeavy(), notificationSuccess(), notificationError() y selectionChanged(). En web hace navigator.vibrate() como fallback silencioso.

shareService.ts — Envuelve @capacitor/share. Expone shareContent({ title, text, url }). En web usa la Web Share API (navigator.share) si está disponible.

storageService.ts — Envuelve @capacitor/preferences. Expone get(key), set(key, value) y remove(key). Serializa y deserializa JSON automáticamente. En web usa localStorage como fallback.

locationService.ts — Envuelve @capacitor/geolocation. Expone getCurrentPosition() que retorna { lat, lon }. Maneja permisos y errores con mensajes claros.

4.6 Store extendido con integrantes y fotos

Archivo modificado: src/app/store/useAppStore.ts (534 líneas)

Se agregaron tres nuevas secciones al estado global de Zustand:

travelers: Traveler[] — Array de integrantes del viaje activo. Cada Traveler tiene id, tripId, name, role (adult | child | baby), age opcional y avatarEmoji.

packingEvidence: PackingEvidence[] — Fotos de evidencia por ítem de maleta. Cada PackingEvidence tiene id, itemId, travelerId, photoBase64 y takenAt.

luggagePhotos: LuggagePhoto[] — Fotos de la maleta completa para el asistente de acomodo. Cada LuggagePhoto tiene id, tripId, travelerId, photoBase64, luggageSize, phase (open | packed | final), aiSuggestion y zones.

Se agregó la acción updateTrip(tripId, patch) que hace un merge parcial de cualquier campo del viaje, necesaria para actualizar el pronóstico del clima desde el HomePage.

Archivo creado: src/types/traveler.ts — Define los tipos Traveler, PackingEvidence y LuggagePhoto.

4.7 PackingChecklistPage con tabs por integrante

Archivo modificado: src/modules/packing/pages/PackingChecklistPage.tsx (707 líneas)

La página fue reescrita para soportar múltiples integrantes. La parte superior muestra tabs horizontales con el nombre y emoji de cada integrante. Al cambiar de tab, la lista de ítems se filtra por travelerId. Cada ítem tiene un botón de cámara que abre el PackingEvidenceModal. Si el ítem tiene foto de evidencia, muestra un thumbnail circular verde. Los ítems sin foto muestran un indicador de alerta naranja. El botón "Asistente de acomodo" en el footer navega a /luggage-assistant.

Archivo creado: src/modules/packing/components/PackingEvidenceModal.tsx

Modal que usa cameraService.takePhoto() para tomar la foto, la muestra en preview y la guarda en el store con addPackingEvidence(). No es obligatoria: el usuario puede cerrar el modal sin tomar foto y el ítem sigue funcionando normalmente.

4.8 Asistente de acomodo de maleta

Archivo creado: src/modules/packing/pages/LuggageAssistantPage.tsx (536 líneas)

Flujo de cuatro pasos:

Paso 1 — Tamaño: El usuario elige entre cabin (cabina), medium (mediana), large (grande) o xl (extra grande). Cada opción tiene un ícono SVG duotone y una descripción del peso máximo permitido.

Paso 2 — Foto abierta: El usuario toma una foto de la maleta abierta y vacía con cameraService. La foto se muestra en preview.

Paso 3 — Análisis IA: Se llama a https://api.openai.com/v1/chat/completions con gpt-4o y la imagen en base64. El prompt del sistema pide que la IA analice el espacio disponible y devuelva un JSON con recomendaciones por zonas: left (izquierda ), right (derecha), center (centro) y access (acceso rápido). La respuesta se muestra como tarjetas de zona con los ítems recomendados.

Paso 4 — Foto final: El usuario toma una foto de la maleta ya acomodada. Se guarda en el store con addLuggagePhoto().

Archivo creado: src/modules/packing/pages/LuggageAssistantRoute.tsx

Wrapper standalone que lee el currentTripId y el primer integrante del store, y pasa las props requeridas al LuggageAssistantPage. Permite pasar ?travelerId=xxx en la URL para elegir un integrante específico.

4.9 Módulo de actividades con contexto real

Archivo creado: src/modules/activities/pages/TripActivitiesPage.tsx

Muestra las actividades seleccionadas en el onboarding con contexto real obtenido del activityEngine. Cada actividad tiene: nombre, categoría, costo estimado en la moneda local del destino, duración aproximada, tip de viajero experto, alerta de compra anticipada cuando aplica (con link directo a la página de reserva), y estado de reserva (booked / not booked). El usuario puede marcar una actividad como reservada y agregar notas.

4.10 Historial de viajes

Archivo creado: src/modules/trips/pages/TripHistoryPage.tsx

Muestra dos secciones: viajes próximos (status planning) y viajes completados (status completed). Cada viaje es una tarjeta expandible que muestra destino, fechas, tipo de viaje, número de integrantes y un resumen del progreso de la maleta. Los viajes completados muestran un badge con la fecha de regreso. Hay un botón flotante + para crear un nuevo viaje que navega al onboarding.

4.11 Modo viaje de trabajo

Archivo creado: src/modules/trips/pages/BusinessTripPage.tsx

Checklist rápido organizado en cuatro categorías: Documentos, Tecnología, Ropa y Essentials. No usa el motor de packing completo (sin maleta por integrante). Incluye una sección de agenda de juntas donde el usuario puede agregar reuniones con hora, lugar y notas. Pensado para viajes cortos donde el usuario no necesita la maleta completa pero sí quiere un checklist rápido.

4.12 Notificaciones nativas reales

Archivo modificado: src/modules/reminders/pages/DepartureReminderPage.tsx

La página ya calculaba la hora de salida recomendada con departureCalculator.ts. Lo que faltaba era el botón que creara la notificación real. Ahora importa scheduleNotification de notificationsService y al presionar "Activar recordatorio" programa una notificación local 30 minutos antes de la hora de salida calculada. Si el usuario ya tiene una notificación programada, la cancela y crea una nueva. El estado se guarda en el store para persistir entre sesiones.

4.13 HomePage con refresco automático del clima

Archivo modificado: src/modules/trips/pages/HomePage.tsx (480 líneas)

Se agregó un useEffect que al montar el componente verifica si el pronóstico del viaje activo tiene más de 6 horas de antigüedad (usando el nuevo campo fetchedAt en WeatherForecast). Si es así, llama a fetchCurrentConditions del weatherEngine y actualiza el store con updateTrip. El tagline "Smart Travel Companion" fue reemplazado con t('home.tagline').




5. Cambios implementados — commit 2884557

5.1 OCR de boarding pass

Archivo creado: src/services/boardingPassScanner.ts (127 líneas)

Servicio que recibe una imagen en base64 y llama a gpt-4o con visión para extraer los datos del boarding pass. Usa fetch directo a https://api.openai.com/v1/chat/completions sin el SDK de OpenAI (para evitar dependencias innecesarias en el bundle del cliente ). El prompt del sistema instruye a la IA a devolver un JSON estricto con los campos: passengerName, flightNumber, airline, originIata, originCity, destinationIata, destinationCity, departureDate, departureTime, boardingTime, gate, terminal, seat, bookingRef y rawText. La función limpia los null del JSON y devuelve solo los campos con valor.

Archivo creado: src/modules/airline/pages/BoardingPassScannerPage.tsx (212 líneas)

UI completa del escáner. Tiene tres estados: idle (botón de cámara), scanning (spinner con mensaje de análisis) y result (tarjeta con los datos extraídos). Si la extracción fue exitosa, muestra un botón "Aplicar al viaje" que actualiza el vuelo del viaje activo en el store con los datos del boarding pass. Si hay error, muestra el mensaje de error de la API con un botón de reintento.

5.2 Pantalla de ruta con navegación real

Archivo creado: src/modules/trips/pages/TripRoutePage.tsx (390 líneas)

Muestra la ruta desde el origen del viaje hasta el destino. Genera deep links reales para tres aplicaciones de navegación:

•
Waze: https://waze.com/ul?ll={lat},{lon}&navigate=yes

•
Google Maps: https://maps.google.com/maps?daddr={lat},{lon}

•
Apple Maps: maps://maps.apple.com/?daddr={lat},{lon} (solo funciona en iOS )

Calcula la distancia aproximada entre origen y destino usando la fórmula de Haversine (sin API externa). Muestra el tiempo estimado de conducción asumiendo 80 km/h promedio. Si el tipo de transporte es vuelo, muestra la información del vuelo en lugar de la ruta terrestre. Los botones de navegación usan window.open() con _blank en web y App.openUrl() de Capacitor en nativo.

5.3 LuggageAssistantRoute

Archivo creado: src/modules/packing/pages/LuggageAssistantRoute.tsx

Wrapper standalone para la ruta /luggage-assistant. Lee currentTripId y travelers del store y pasa las props requeridas al LuggageAssistantPage. Si no hay viaje activo, muestra un estado vacío con botón para ir al home.

5.4 Tipo fetchedAt en WeatherForecast

Archivo modificado: src/types/trip.ts

Se agregó el campo opcional fetchedAt?: string (ISO 8601) al tipo WeatherForecast. Este campo lo escribe el weatherEngine al guardar el pronóstico y lo lee el HomePage para decidir si debe refrescar.

5.5 Acción updateTrip en el store

Archivo modificado: src/app/store/useAppStore.ts

Se agregó la acción updateTrip(tripId: string, patch: Partial<Trip>) que hace un merge parcial del viaje indicado. Es necesaria para que el HomePage pueda actualizar el pronóstico sin reemplazar todo el objeto del viaje.

5.6 Router actualizado

Archivo modificado: src/app/router/index.tsx

Se agregaron cuatro rutas nuevas dentro del AppFrame (requieren autenticación y viaje activo):

Ruta
Componente
/route
TripRoutePage
/boarding-pass-scanner
BoardingPassScannerPage
/luggage-assistant
LuggageAssistantRoute
/history
TripHistoryPage
/business
BusinessTripPage
/activities
TripActivitiesPage




5.7 .env.example documentado

Archivo modificado: viaza/.env.example

Se documentaron las seis variables de entorno con descripción, enlace de registro y comportamiento cuando no están configuradas:

Plain Text


VITE_OPENAI_API_KEY          — Requerida. Translator, OCR, asistente de acomodo.
VITE_OPENWEATHERMAP_KEY      — Opcional. Sin ella, solo usa Open-Meteo.
VITE_AVIATIONSTACK_KEY       — Opcional. Sin ella, modo manual de vuelos.
VITE_GOOGLE_MAPS_KEY         — Opcional. Solo para thumbnails de mapas estáticos.
VITE_SUPABASE_URL            — Opcional. Sin ella, usa Capacitor Preferences local.
VITE_SUPABASE_ANON_KEY       — Opcional. Ídem.



5.8 Schema SQL de Supabase

Archivo creado: supabase/schema.sql (760 líneas)

Archivo creado: supabase/README.md

El schema cubre el ciclo completo de la aplicación desde el registro hasta el pago. A continuación se describe cada tabla:

profiles — Extiende auth.users de Supabase. Campos: name, avatar_url, preferred_lang, plan (enum free | pro), plan_expires_at. Se crea automáticamente al registrarse vía el trigger on_auth_user_created.

trips — Un viaje por fila. Contiene todos los campos del onboarding: destination, country_code, lat, lon, start_date, end_date, travel_type, climate, traveler_group, activities (array), laundry_mode, packing_style, transport_type, flight_number, airline, airport_code, currency_code, language_code, number_of_adults, number_of_kids, number_of_babies, weather_forecast (JSONB), trip_status (enum planning | active | completed).

travelers — Integrantes del viaje. Campos: trip_id, name, role (enum adult | child | baby), age, avatar_emoji, sort_order.

packing_items — Ítems de la lista de maleta. Campos: trip_id, traveler_id (nullable), label_key, label, category, quantity, checked, source (generated | user_custom), sort_order.

packing_evidence — Fotos de evidencia por ítem. Campos: item_id, traveler_id, photo_url (URL pública de Supabase Storage), storage_path, taken_at.

luggage_photos — Fotos de la maleta completa. Campos: trip_id, traveler_id, photo_url, storage_path, luggage_size (enum), phase (open | packed | final), ai_suggestion (texto libre de la IA), zones (JSONB con arrays por zona).

trip_activities — Actividades planificadas. Campos: activity_key, name, category, estimated_cost, currency, duration_hours, tip, booking_url, booking_required, booked, booked_at, notes.

departure_reminders — Recordatorios de salida. Campos: remind_at, message, is_active, fired_at, capacitor_id (ID de la notificación en Capacitor para poder cancelarla).

split_bill_sessions — Sesiones de división de gastos. Campos: trip_id, title, currency, participants (JSONB).

split_bill_expenses — Gastos individuales. Campos: session_id, description, amount, paid_by, split_among (array de nombres).

payments — Pagos de suscripción PRO. Campos: provider (enum stripe | apple_pay | google_pay | paypal), provider_payment_id (único), provider_customer_id, amount, currency, status (enum pending | completed | failed | refunded), plan_purchased, plan_duration_days, receipt_url, error_message, metadata (JSONB).

user_subscription — Vista calculada que expone plan, plan_expires_at, is_active_pro (boolean) y days_remaining (int). El cliente solo necesita hacer SELECT * FROM user_subscription WHERE user_id = auth.uid().

Buckets de Storage:

Bucket
Visibilidad
Límite
Tipos permitidos
evidence
Privado
5 MB
jpeg, png, webp, heic
luggage
Privado
10 MB
jpeg, png, webp, heic
avatars
Público
2 MB
jpeg, png, webp




Triggers:

on_auth_user_created — Crea el perfil automáticamente al registrarse. Lee el nombre del raw_user_meta_data si viene de OAuth.

on_payment_status_change — Al cambiar el status de un pago a completed, actualiza plan y plan_expires_at en profiles. Al cambiar a refunded, regresa el plan a free. Este trigger es la única forma de actualizar el plan — el cliente no tiene política de UPDATE en payments.

*_updated_at — Triggers en todas las tablas con updated_at para mantener el timestamp automáticamente.

Nota crítica de seguridad: La tabla payments no tiene política de INSERT ni UPDATE para el cliente. Los pagos solo los puede insertar el backend (Edge Function de Supabase que recibe el webhook de Stripe). Esto hace imposible que alguien se otorgue el plan PRO sin pagar, incluso si inspecciona el código del cliente.




6. Estado actual del repo — árbol de archivos relevantes

Plain Text


VIAZA/
├── supabase/
│   ├── schema.sql          ← NUEVO — schema completo para Supabase
│   └── README.md           ← NUEVO — instrucciones de implementación
└── viaza/
    ├── .env.example        ← MODIFICADO — 6 variables documentadas
    ├── package.json        ← MODIFICADO — @capacitor/camera agregado
    └── src/
        ├── app/
        │   ├── router/index.tsx        ← MODIFICADO — 6 rutas nuevas
        │   └── store/useAppStore.ts    ← MODIFICADO — travelers, evidence, luggagePhotos, updateTrip
        ├── components/ui/
        │   ├── AppChip.tsx             ← NUEVO
        │   ├── EmptyState.tsx          ← NUEVO
        │   ├── ModalSheet.tsx          ← NUEVO
        │   └── ProgressBar.tsx         ← NUEVO
        ├── engines/
        │   └── dailyForecastEngine.ts  ← NUEVO — pronóstico 14 días Open-Meteo
        ├── lib/i18n/locales/
        │   ├── es.json  (510 líneas)   ← MODIFICADO
        │   ├── en.json  (493 líneas)   ← MODIFICADO
        │   ├── pt.json  (493 líneas)   ← MODIFICADO
        │   ├── fr.json  (493 líneas)   ← MODIFICADO
        │   └── de.json  (493 líneas)   ← MODIFICADO
        ├── modules/
        │   ├── activities/pages/
        │   │   └── TripActivitiesPage.tsx     ← NUEVO
        │   ├── airline/pages/
        │   │   ├── AirlineRulesPage.tsx       ← MODIFICADO — strings i18n
        │   │   └── BoardingPassScannerPage.tsx ← NUEVO
        │   ├── packing/
        │   │   ├── components/PackingEvidenceModal.tsx  ← NUEVO
        │   │   └── pages/
        │   │       ├── LuggageAssistantPage.tsx   ← NUEVO
        │   │       ├── LuggageAssistantRoute.tsx  ← NUEVO
        │   │       └── PackingChecklistPage.tsx   ← MODIFICADO — tabs por integrante
        │   ├── reminders/pages/
        │   │   └── DepartureReminderPage.tsx  ← MODIFICADO — notificaciones reales
        │   ├── translator/services/
        │   │   └── translateService.ts        ← MODIFICADO — OpenAI real
        │   ├── trips/pages/
        │   │   ├── BusinessTripPage.tsx       ← NUEVO
        │   │   ├── HomePage.tsx               ← MODIFICADO — refresco clima, i18n
        │   │   ├── TripHistoryPage.tsx        ← NUEVO
        │   │   └── TripRoutePage.tsx          ← NUEVO
        │   └── weather/components/
        │       └── WeatherForecastModal.tsx   ← NUEVO
        ├── services/
        │   ├── boardingPassScanner.ts  ← NUEVO — OCR con gpt-4o
        │   ├── cameraService.ts        ← NUEVO
        │   ├── hapticsService.ts       ← NUEVO
        │   ├── locationService.ts      ← NUEVO
        │   ├── notificationsService.ts ← NUEVO
        │   ├── shareService.ts         ← NUEVO
        │   └── storageService.ts       ← NUEVO
        └── types/
            ├── traveler.ts  ← NUEVO — Traveler, PackingEvidence, LuggagePhoto
            └── trip.ts      ← MODIFICADO — fetchedAt en WeatherForecast






7. Stack técnico completo

Capa
Tecnología
Versión
Framework UI
React
18
Lenguaje
TypeScript
5 (strict: true)
Build
Vite
5
Estilos
TailwindCSS
3
Animaciones
Framer Motion
—
Estado global
Zustand
—
Routing
React Router DOM
6
i18n
i18next + react-i18next
—
Nativo (iOS/Android)
Capacitor
6
Cámara
@capacitor/camera
—
Notificaciones
@capacitor/local-notifications
—
Hápticos
@capacitor/haptics
—
Share
@capacitor/share
—
Storage
@capacitor/preferences
—
Geolocalización
@capacitor/geolocation
—
Clima
Open-Meteo (gratis, sin key)
—
Clima actual
OpenWeatherMap (key opcional)
—
Vuelos
AviationStack (key opcional)
—
IA — Traducción
OpenAI gpt-4.1-mini
—
IA — OCR
OpenAI gpt-4o (vision)
—
IA — Acomodo
OpenAI gpt-4o (vision)
—
Backend/Auth
Supabase (schema listo, no conectado aún)
—
Pagos
Stripe / Apple IAP / Google IAP (schema listo)
—







8. Estado de las funciones — qué funciona y qué no

Función
Estado
Notas
Onboarding completo
Funciona
9 pasos, Nominatim autocomplete, detección automática de clima
Dashboard (HomePage)
Funciona
Días restantes en tiempo real, refresco de clima cada 6h
Pronóstico 14 días
Funciona
Open-Meteo real, modal cristal con 3 franjas por día
Translator
Funciona
Requiere VITE_OPENAI_API_KEY en .env
Conversor de moneda
Funciona
API de tasas de cambio real
Split bill
Funciona
Modo simple y modo avanzado por consumo
Maleta por integrante
Funciona
Tabs, foto de evidencia, alertas
Asistente de acomodo
Funciona
Requiere VITE_OPENAI_API_KEY
OCR boarding pass
Funciona
Requiere VITE_OPENAI_API_KEY
Actividades con contexto
Funciona
Datos del activityEngine
Ruta con Waze/Maps
Funciona
Deep links reales, Haversine para distancia
Notificaciones nativas
Funciona
Capacitor real, fallback web
Historial de viajes
Funciona
—
Viaje de trabajo
Funciona
—
Reglas de aerolínea
Funciona
AviationStack opcional
Ítems permitidos en avión
Funciona
Base de datos local
Guía de adaptadores
Funciona
Base de datos local
Auth con Supabase
PENDIENTE
El store usa registeredUsers[] local. Supabase está en .env pero no importado.
Persistencia en nube
PENDIENTE
Todos los datos están en Zustand local (Capacitor Preferences). No se sincronizan entre dispositivos.
Pagos (Stripe/IAP)
PENDIENTE
Schema listo. Falta la PremiumPage real y la Edge Function de Stripe.
Code splitting
PENDIENTE
Bundle de 782 KB. Recomendado dividir con import() dinámico.
Fix CSS @import
PENDIENTE
Warning en build: mover @import de Google Fonts antes de @tailwind en index.css.







9. Pendientes para producción — ordenados por prioridad

Prioridad 1 — Bloquean el lanzamiento

Conectar Supabase al store de auth. El LoginPage y el RegisterPage usan un array registeredUsers[] en Zustand. Hay que reemplazarlos con supabase.auth.signInWithPassword() y supabase.auth.signUp(). El schema ya está listo. El VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY ya están en .env.example.

Sincronización de datos con Supabase. Actualmente todos los datos (viajes, maleta, actividades) viven en Zustand y se persisten con Capacitor Preferences (solo en el dispositivo local). Hay que agregar llamadas a Supabase en las acciones del store para que los datos se sincronicen en la nube y el usuario pueda acceder desde cualquier dispositivo.

PremiumPage real con Stripe. La PremiumPage actual es un placeholder de 22 líneas. Hay que implementar el flujo de pago con Stripe (web) y los In-App Purchases de Apple/Google (nativo). La Edge Function de Supabase que recibe el webhook de Stripe y actualiza la tabla payments también está pendiente.

Prioridad 2 — Mejoran la experiencia significativamente

Code splitting. El bundle principal es de 782 KB (200 KB gzipped). Se recomienda usar import() dinámico en el router para cargar cada módulo bajo demanda. Esto reduciría el tiempo de carga inicial a menos de 200 KB.

Fix del warning de CSS. En viaza/src/index.css, mover la línea @import url('https://fonts.googleapis.com/...' ) antes de las directivas @tailwind. Esto elimina el warning en el build y evita problemas potenciales en algunos navegadores.

Configurar las keys de API en producción. Antes del lanzamiento hay que configurar las variables de entorno en el servidor de despliegue (Netlify, Vercel, Capacitor build, etc.): VITE_OPENAI_API_KEY, VITE_OPENWEATHERMAP_KEY, VITE_AVIATIONSTACK_KEY.

Prioridad 3 — Pulido y optimización

Caché de traducciones. El translateService hace una llamada a OpenAI por cada traducción. Hay que agregar un caché en memoria (o en storageService) para no repetir la misma traducción dos veces en la misma sesión.

Manejo de errores global. Agregar un ErrorBoundary de React en el AppProviders.tsx para capturar errores no manejados y mostrar una pantalla de error amigable en lugar de una pantalla en blanco.

Tests. No hay ningún test en el proyecto. Se recomienda agregar tests unitarios para los engines (packingGenerator, dailyForecastEngine, departureCalculator) con Vitest.




10. Cómo ejecutar el proyecto localmente

Bash


# 1. Clonar el repo
git clone https://github.com/AdmiKode/VIAZA.git
cd VIAZA/viaza

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar al menos VITE_OPENAI_API_KEY

# 4. Ejecutar en modo desarrollo
npm run dev

# 5. Build de producción
npm run build

# 6. Para iOS/Android (requiere Capacitor CLI )
npx cap sync
npx cap open ios     # o android






11. Cómo implementar el schema de Supabase

Bash


# 1. Crear proyecto en https://supabase.com
# 2. Ir a SQL Editor
# 3. Pegar y ejecutar el contenido de supabase/schema.sql
# 4. Verificar en Storage que existan los buckets: evidence, luggage, avatars
# 5. Agregar las keys al .env:
#    VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
#    VITE_SUPABASE_ANON_KEY=tu-anon-key



El README.md en supabase/ tiene instrucciones detalladas para configurar Auth, Storage y Stripe.




Documento generado por Manus AI el 12 de marzo de 2026. Refleja el estado del repositorio en el commit 2884557 de la rama main.

