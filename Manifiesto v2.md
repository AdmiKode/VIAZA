VIAZA — Manifiesto actualizado + Brief maestro para Codex
Fecha

13 de marzo de 2026

1) Visión de producto

VIAZA es un centro de control inteligente para viajes.

No es una app genérica de tips. No es un planner suelto. No es solo una packing app.

VIAZA gira alrededor de un objeto central: el viaje. Todo debe nacer de un viaje real y de su contexto real.

La app acompaña al usuario en tres momentos:

Antes del viaje

Durante el viaje

En escenarios de logística y seguridad

2) Principio rector

La app no debe pedirle al usuario que capture todo manualmente.

La app debe:

proponer

sugerir

inferir

resumir

automatizar

El usuario debe:

confirmar

ajustar

corregir

personalizar

3) Eje de arquitectura

Todo vive dentro de un Trip Object.

Variables madre del viaje:

trip_type

destination

destination_place_id

coordinates

start_date

end_date

duration_days

transport_mode

route_origin_if_needed

traveler_group

luggage_strategy

weather_forecast

health_context

emergency_context

active_modules

Nada debe renderizarse como recomendación fija si no depende de un viaje real.

4) Flujo maestro del usuario
Entrada

Nuevo viaje

Mis viajes

Creación de viaje

Tipo de viaje

Destino real desde Maps / Places

Fechas

Medio de transporte

Ubicación cuando aplique

Con quién viajas

Cómo se organizan las maletas

Condiciones especiales (bebé, embarazo, adulto mayor, medicamentos, alergias, padecimientos)

Activación / edición del Emergency Travel Card

Crear viaje

Resultado

Se crea el dashboard del viaje.

5) Tipo de viaje

Opciones base:

beach

city

mountain

camping

snow

roadtrip

work

adventure

Esto debe gobernar:

filtros de destino sugerido

actividades sugeridas

reglas de packing

tono visual contextual

riesgos y tips relevantes

6) Destino

La selección del destino debe hacerse con Google Maps Platform / Places.

Flujo esperado:

el usuario escribe “Cancún”

se muestran resultados reales

el usuario toca el destino correcto

se guardan coordinates, place_id, país, idioma, moneda, timezone

Desde ese momento se activa el viaje real.

7) Fechas

Al guardar salida y regreso, VIAZA debe calcular:

duración del viaje

temporada

forecast por día

ventanas útiles para logística

El clima del viaje no es genérico. Debe ser por los días reales del viaje.

8) Medio de transporte

Opciones:

plane

car

bus

train

boat

other

Si es avión

Activar:

airline rules

carry-on / checked logic

airport checklist

boarding pass scan

departure reminder

wallet docs

Si es auto

Activar:

permiso de ubicación

ruta

tiempo estimado

stops sugeridos

zonas seguras

comida / gasolina / descanso

Si es autobús o tren

Activar:

terminal / estación

hora de salida

llegada estimada

wallet de tickets

checklist acceso / equipaje

9) Ubicación

La ubicación no se pide por pedir. Se pide cuando genera valor.

Casos de uso:

calcular trayecto en auto

estimar salida al aeropuerto / terminal

encontrar lugares cercanos durante el viaje

botón “recomiéndame a dónde ir”

10) Con quién viajas

Opciones:

solo

couple

friends

family

family_with_baby

business_team

Esto impacta:

packing

itinerario

seguridad

agenda

distribución de maletas

11) Lógica de maletas

La maleta inteligente es el corazón del sistema.

Antes de generarla, el sistema debe hacer un test corto.

Preguntas obligatorias:

medio de transporte

si va en avión: cabina o documentada

cuántas personas viajan

maleta por integrante o compartida

combinaciones de maleta compartida

si hay bebé / niño / adulto mayor

edad del bebé si existe

Estrategias posibles

individual luggage

shared luggage

mother_baby luggage

parent_children luggage

couple luggage

12) Packing engine

La lista no debe salir como un texto gigantesco. Debe estar organizada en:

categorías

subcategorías

items

cantidades

Categorías ejemplo

clothes

shoes

hygiene

medications

accessories

tech

documents

baby

beach gear

cold weather gear

Subcategorías ejemplo

Ropa:

playeras

shorts

pantalones

pijamas

ropa interior

traje de baño

Bebé:

fórmula

biberones

pañales

toallitas

bloqueador bebé

medicamentos bebé

13) Escaneo de maleta

El OCR/visión no es solo para documentos.

En packing existe un flujo central:

el usuario configura el tamaño / tipo de maleta

la app propone qué debería caber

el usuario escanea la maleta abierta

la IA analiza contenido y espacio

la IA sugiere acomodo

Ejemplos de salida:

enrolla las playeras

coloca los zapatos encontrados

usa huecos internos

prendas pesadas abajo

aún caben 2 playeras y 1 short

Debe existir también una foto final de maleta como evidencia visual.

14) OCR transversal

OCR es un capability transversal.

OCR en packing

escanear maleta

detectar objetos

validar categorías

recomendar acomodo

OCR en wallet / documentos

póliza de seguro

tickets

boarding pass

reservas

comprobantes

cualquier documento del viaje

El usuario debe poder cargar libremente fotos/PDFs/documentos donde tenga sentido.

15) Travel Wallet

Debe existir un wallet del viaje.

Contenido esperado:

boarding passes

póliza de seguro

reservas de hotel

tickets

tours

comprobantes

documentos relevantes

Fuentes:

carga manual

foto

PDF

OCR

16) Dashboard del viaje

Al crear el viaje, se genera un dashboard vivo.

Header

destino

fechas

duración

medio de transporte

grupo de viaje

Carrusel del clima

Debe mostrar por cada día:

fecha

mañana

tarde

noche

temperatura

lluvia / viento / condiciones

Tarjetas dinámicas base

Maleta inteligente

Ruta / traslado

Itinerario

Recomendaciones del destino

Travel Wallet

Agenda

Seguridad del viajero

Checklist previo

Documentos / reservas

Estas tarjetas deben aparecer según el contexto del viaje, no por default fijo.

17) Recomendaciones del destino

Botón clave: Recomiéndame a dónde ir

Cuando se toque:

pedir ubicación si hace falta

buscar lugares cercanos con Maps / Places

obtener fotos desde Maps

obtener rating y reseñas

usar IA para resumir testimonios y explicar qué tipo de lugar es

El sistema no debe depender de imágenes cargadas por nosotros para esos lugares. Debe usar la capa de Places / Maps.

18) Agenda del viaje

La agenda no es un calendario decorativo. Es un módulo operativo.

Debe vivir aquí:

itinerario

eventos

recordatorios

medicamentos

actividades

Medicamentos

Si el usuario toma medicamentos:

se registran en la agenda

desde la agenda salen las notificaciones

se pueden reflejar en el QR si el usuario lo autoriza

19) Emergency Travel Card

Debe existir una explicación clara y consciente.

Mensaje de producto: Comparte información esencial con tus acompañantes para que, si ocurre una emergencia, sepan cómo ayudarte rápido.

Debe funcionar como sustituto digital de una placa médica.

Datos críticos

nombre

edad

tipo de sangre

alergias

medicamentos

padecimientos importantes

contactos de emergencia

idioma principal

No debe exponer todo indiscriminadamente. Deben existir controles de visibilidad.

20) Orquestador de IA

La lógica compleja no debe resolverse solo con reglas rígidas.

Debe existir un orquestador que pueda usar:

OpenAI

Anthropic

Groq

Casos de uso

packing generation

packing optimization

visual luggage analysis

OCR post-processing

clasificación de documentos

resumen de reseñas de lugares

recomendaciones contextuales

interpretación de viaje

El orquestador debe elegir el modelo según la tarea.

21) APIs / servicios requeridos
Ya presentes o ya mencionadas

Supabase

Google OAuth

Google Maps Platform / Places

Google Routes API

ExchangeRate API

Aviationstack

OpenAI

Anthropic

Groq

Deben confirmarse / añadirse / quedar explícitas

Weather API robusta para forecast por viaje (Open-Meteo encaja muy bien)

Google Routes / Directions para trayectos en coche

Rutas de transporte público (arquitectura oficial)

V1 mundial (columna vertebral global):

Usar Google Directions API / Google Routes API en modo transit para mostrar cómo llegar en transporte público. Debe devolver líneas, estaciones, transbordos, duración y pasos del trayecto.

V2 de precisión (refuerzo regional):

Donde la cobertura o el tiempo real no sea suficiente, integrar GTFS / GTFS-Realtime por ciudad o región (priorizar ciudades clave).

Regla:

No usar Moovit como dependencia principal en esta fase. Dejarlo fuera salvo partnership formal futuro.

Places Photos / Details / Nearby Search

API de autobuses / salidas si de verdad quieren horarios o salidas reales

Nota sobre autobuses

No existe una API única global y perfecta para “salidas de autobús” en todo el mundo. Hay dos rutas realistas:

Google transit routing donde exista cobertura

GTFS / GTFS-Realtime por región o un proveedor especializado

Para Reino Unido, TransportAPI sí ofrece salidas de bus y departure boards. Para producto global, tocará resolver por región o usar cobertura transit donde exista.

22) Lo que Codex debe revisar sí o sí

si la arquitectura actual gira realmente alrededor de un trip object

si el onboarding actual respeta este flujo nuevo

si hay módulos que deben reordenarse en vez de recrearse

si Supabase ya tiene tablas útiles y cuáles sobran

qué columnas faltan en trips, trip_members, packing, agenda, emergency_profiles, wallet_docs

si el dashboard actual puede evolucionar o conviene reconstruirlo

si el OCR actual está mal ubicado o incompleto

qué engines actuales sí sirven y cuáles ya quedaron fuera de visión

23) Instrucción de producto para el equipo

No se vale maquillar el flujo viejo. No se vale meter parches visuales encima de una lógica equivocada. No se vale dejar recomendaciones genéricas desconectadas del viaje.

VIAZA debe reconstruirse sobre este principio:

Viaje real -> contexto real -> dashboard vivo -> módulos dinámicos -> logística + seguridad + maleta inteligente

BRIEF MAESTRO PARA CODEX
Objetivo

Quiero que tomes el estado actual de VIAZA y lo alinees por completo con este manifiesto actualizado.

No quiero parches sueltos. No quiero “hacer más bonito” lo que ya está mal en lógica. Quiero una revisión estructural, una propuesta ejecutable y luego implementación ordenada.

Stack y recursos disponibles

Ya contamos con:

Supabase

OpenAI

Anthropic

Groq

Google OAuth

Google Maps Platform / Places / Routes API

ExchangeRate API

Aviationstack

También puedes apoyarte en Edge Functions de Supabase cuando aplique.

Tu misión
Fase 1. Auditoría técnica de alineación

Revisa el proyecto actual y entrégame:

Qué partes ya se pueden reutilizar

Qué partes están conceptualmente mal aunque “funcionen”

Qué módulos deben reordenarse

Qué tablas de Supabase sirven

Qué tablas / campos faltan

Qué sobra o debe simplificarse

Qué APIs ya están bien aprovechadas y cuáles no

Qué API adicional recomiendas para buses si la app va a mostrar salidas / horarios reales

Fase 2. Propuesta técnica de reconstrucción

Antes de tocar código, entrégame:

Nuevo mapa de rutas

Nuevo flujo de creación del viaje

Nuevo diseño de datos en Supabase

Mapa de módulos dinámicos del dashboard

Cómo implementar Travel Wallet

Cómo implementar Agenda + medicamentos + notificaciones

Cómo implementar Emergency Travel Card + QR

Cómo implementar el orquestador de IA

Cómo implementar OCR transversal (maleta + documentos)

Qué tareas deben vivir en cliente, qué tareas en Supabase Edge Functions y qué tareas en servicios externos

Fase 3. Implementación por sprints

Propón sprints reales, no humo.

Reglas obligatorias

No replantees la visión del producto

No inventes features nuevas fuera del manifiesto

No uses recomendaciones genéricas desconectadas del viaje real

No dejes lógica compleja dentro de componentes

No metas hardcode innecesario

No rompas i18n

No rompas mobile-first

No conviertas el proyecto en Frankenstein

APIs / servicios que debes validar
1. Supabase

Valida si las tablas actuales soportan:

trips

trip travelers / trip members

luggage profiles o luggage groups

packing items por categoría y subcategoría

weather cache

wallet documents

agenda items

medication reminders

emergency profiles

qr public token

place recommendations cache

Si faltan tablas o columnas, dilo con exactitud. Si sobran o hay duplicados, dilo también.

2. IA

Propón un orquestador real para usar:

OpenAI cuando convenga visión, clasificación o razonamiento multimodal

Anthropic cuando convenga razonamiento estructurado / planning

Groq cuando convenga velocidad o tareas rápidas

No decidas al azar. Justifica cada uso.

3. Google Maps Platform

Valida qué endpoints / APIs exactas debemos usar para:

autocomplete destino

place details

photos

nearby recommendations

route calculations

transit / si aplica

roadtrip logic con Routes API (computeRoutes y, si conviene, computeRouteMatrix)

4. Weather

Valida la mejor opción actual para:

forecast diario por viaje

mañana / tarde / noche

cache razonable

costo sostenible

5. Autobuses / salidas

Necesito que me digas la neta:

si existe una API realmente útil para horarios / salidas de autobús en la cobertura que buscamos

si conviene usar Google transit routing, GTFS/GTFS-Realtime, o un proveedor regional

si esto debe quedar como V2 por cobertura irregular

Entregable que quiero de ti

Entrégame exactamente esto:

Diagnóstico técnico del estado actual contra este manifiesto

Lista de tablas Supabase reutilizables

Lista de tablas/columnas nuevas necesarias

Lista de tablas/columnas sobrantes o mal planteadas

APIs actuales: cuáles sí sirven, cuáles están incompletas y cuáles faltan

Recomendación específica sobre buses / salidas

Arquitectura propuesta por módulos

Orden de implementación por sprints

Riesgos técnicos

Qué puedes empezar a construir de inmediato sin esperar más definiciones

Tono de ejecución

Quiero criterio de arquitecto de producto, no de autocompletado ansioso. Si algo del proyecto actual está mal planteado, dilo. Si algo se puede rescatar, dilo. Si algo conviene mover a V2, dilo.

Pero no me des una respuesta tibia. Quiero bisturí y claridad.

Cómo la usa el backend

Dentro de una Supabase Edge Function se obtiene así:

const GOOGLE_KEY = Deno.env.get("GOOGLE_MAPS_SERVER_API_KEY")

Luego la usas para llamar Google.

Ejemplo conceptual para Nearby Places:

const response = await fetch(
  `https://places.googleapis.com/v1/places:searchNearby`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_KEY
    },
    body: JSON.stringify({
      includedTypes: ["restaurant"],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng
          },
          radius: 3000
        }
      }
    })
  }
)

El frontend no ve la key nunca.

3️⃣ Cómo se conecta el frontend

El front llama a Supabase, no a Google.

Ejemplo:

/functions/v1/nearby-recommendations

Y esa función es la que llama a Google.

Flujo correcto:

APP
↓
Supabase Edge Function
↓
Google Places API
↓
Supabase cache
↓
APP
4️⃣ Para qué la usará VIAZA

Tu server key servirá para:

Recomendaciones cercanas

Places Nearby

Fotos de lugares

Places Photos

Detalles de lugares

Place Details

Roadtrip

Routes API

Geocoding

Dirección ↔ coordenadas

Procesamiento con IA

(resumir reseñas de lugares)

5️⃣ Qué NO debes hacer

Nunca pongas esa key en:

.env del frontend
VITE_GOOGLE_MAPS_SERVER_KEY

ni en React.

Porque cualquiera podría verla.

6️⃣ Resultado final en VIAZA

Tendrás dos keys separadas:

Frontend
VITE_GOOGLE_MAPS_API_KEY

Para:

mapa

autocomplete

seleccionar destino

Backend (Supabase)
GOOGLE_MAPS_SERVER_API_KEY

Para:

nearby

details

photos

rutas

IA

DIAGRAMA ARQUITECTÓNICO DE VIAZA
Verdad operativa del sistema

Codex, este documento define la arquitectura conceptual y funcional oficial de VIAZA.
No reemplaza el manifiesto, lo aterriza en estructura de producto y sistema.

1. DEFINICIÓN DEL PRODUCTO

VIAZA no es un travel planner.
VIAZA es un Travel Control Center.

Eso significa que la app no gira alrededor de módulos aislados, sino alrededor de una sola entidad central:

TRIP OBJECT

Cada viaje es un objeto vivo con contexto, estado, módulos activados, datos, documentos, clima, agenda, recomendaciones, seguridad y asistentes.

Todo lo demás depende de ese objeto.

2. NÚCLEO DEL SISTEMA
Entidad central
Trip
Todo cuelga de Trip

destino real

fechas

clima

transporte

integrantes

estrategia de maletas

agenda

wallet

emergency card

recomendaciones

módulos activos

historial del viaje

No se debe construir ninguna experiencia importante fuera de Trip.

3. ARQUITECTURA DE CAPAS
CAPA 1. PRESENTACIÓN

Frontend mobile-first app

Responsabilidades:

renderizar UI

capturar input del usuario

mostrar dashboard

navegar entre módulos

consumir store/cache

disparar acciones a servicios

El frontend no debe contener lógica compleja de negocio.

CAPA 2. STORE / ESTADO UI

Cache local + estado de sesión + estado visual

Responsabilidades:

sesión

viaje activo

progreso de onboarding

estado temporal de formularios

cache visual de módulos

No debe ser la fuente de verdad final.
La verdad vive en Supabase.

CAPA 3. DOMINIO / ENGINES

Motores puros de lógica

Ejemplos:

activeModulesEngine

packingEngine

tripContextEngine

translationContextEngine

recommendationRankingEngine

Responsabilidades:

decidir qué módulos se activan

transformar datos del viaje en decisiones

generar estructuras listas para UI

Aquí vive la lógica real del producto.

CAPA 4. BACKEND DE PRODUCTO

Supabase + Edge Functions

Responsabilidades:

persistencia real

RLS

autenticación

storage

cache

AI orchestration

integración con APIs externas

Aquí vive la lógica que no debe ir en cliente:

Places

OCR

resumen de reseñas

traducción dinámica

clima cacheado

procesamiento de documentos

QR público

CAPA 5. SERVICIOS EXTERNOS

Proveedores externos especializados

Google Maps / Places / Routes

Open-Meteo

ExchangeRate

Aviationstack

OpenAI

Anthropic

Groq

Nunca deben ser consumidos directo desde el frontend cuando involucren:

llaves privadas

costo alto

procesamiento complejo

cache

IA

4. FLUJO CENTRAL DEL SISTEMA
FLUJO MAESTRO
Usuario entra
→ crea viaje
→ nace Trip Object
→ se calcula contexto
→ se activan módulos
→ se genera dashboard vivo
→ viaje evoluciona antes / durante / después

Eso es VIAZA.

No:

Usuario entra
→ ve módulos sueltos
→ llena cosas dispersas
→ cada parte vive aislada

Eso está prohibido.

5. TRIP OBJECT OFICIAL

El Trip Object debe contener, como mínimo, estas dimensiones:

Identidad del viaje

trip_id

user_id

status

created_at

Destino

destination_name

destination_place_id

destination_lat

destination_lng

destination_country

destination_timezone

destination_currency

destination_language

Fechas

start_date

end_date

duration_days

Transporte

transport_mode

route_origin_place_id

route_origin_lat

route_origin_lng

Grupo de viaje

traveler_group

travelers_count

trip_members

Maletas

luggage_strategy

luggage_profiles

packing_status

Salud y seguridad

health_context

emergency_context

emergency_profile_id

Operación del viaje

active_modules

itinerary_state

agenda_state

wallet_state

Inteligencia

weather_forecast_daily

recommendations_state

translator_state

6. MÓDULOS DEL SISTEMA

Los módulos no son fijos.
Los módulos se activan por contexto.

Módulos base posibles

Smart Packing

Weather

Route / Transport

Itinerary

Travel Wallet

Agenda

Recommendations

Emergency Travel Card

Translator

Quick Phrases

Documents / Reservations

Regla

No todos deben mostrarse igual para todos.
Se renderizan según:

destino

tipo de viaje

transporte

con quién viaja

si hay bebé

si hay medicamentos

si está en ruta

si está ya en destino

7. ACTIVE MODULES ENGINE

Debe existir un motor que decida qué tarjetas y módulos mostrar en dashboard.

Entrada del engine

trip

travelers

transport_mode

health_context

luggage_strategy

trip_phase

Salida
active_modules = [
  "weather",
  "packing",
  "wallet",
  "agenda",
  "recommendations",
  "translator",
  "emergency"
]
Ejemplos
Caso 1

Cancún + avión + familia + bebé

Módulos prioritarios:

weather

packing

wallet

airport logistics

recommendations

emergency

quick phrases

Caso 2

Guadalajara → Vallarta + auto + pareja

Módulos prioritarios:

route

stops

packing

weather

agenda

recommendations

Caso 3

Roma + solo + medicamentos

Módulos prioritarios:

wallet

translator

quick phrases

agenda

medication reminders

emergency

recommendations

8. FASES DEL VIAJE

El viaje vive en 3 momentos:

PRE-TRIP

Preparación

crear viaje

packing

wallet

documentos

agenda

clima

emergency card

IN-TRIP

Operación

recomendaciones cercanas

traductor

quick phrases

itinerario

agenda

medicamentos

QR

ruta si aplica

POST-TRIP

Cierre / historial

historial

notas

recuerdos

reutilización de datos

referencia para viajes futuros

9. ARQUITECTURA DE DATOS
Fuente de verdad

Supabase es la verdad persistente.

Frontend

Solo representa y cachea.

Principio clave

No guardar como verdad final en store algo que debería estar en DB.

10. TABLAS ESTRUCTURALES
Núcleo mínimo

profiles

trips

trip_members

travelers o traveler_profiles

packing_items

agenda_items

itinerary_events

wallet_docs

emergency_profiles

places_cache

trip_recommendations

Storage buckets

luggage_photos

packing_evidence

wallet_docs

qr_assets si aplica

11. EDGE FUNCTIONS OBLIGATORIAS
1. places-nearby

Busca lugares cercanos según contexto del viaje.

2. places-details

Trae detalles y reseñas útiles de un lugar.

3. places-photos

Resuelve fotos de lugares.

4. weather-cache

Obtiene y cachea clima por viaje.

5. ai-orchestrator

Despacha tareas a OpenAI / Anthropic / Groq.

6. wallet-ocr

Procesa documentos de viaje.

7. luggage-analysis

Analiza maleta y acomodo.

8. reviews-summary

Resume reseñas para recomendaciones.

9. translator-service

Traducción contextual y funcional.

10. emergency-public-card

Resuelve la vista pública del QR con token.

12. ORQUESTADOR DE IA

Debe existir un solo punto de entrada para IA.

No se vale que cada módulo hable directo con un proveedor.

Entrada
task_type
payload
trip_context
language_context
Ejemplos de task_type

boarding_pass_ocr

luggage_analysis

reservation_parse

reviews_summary

translation

quick_phrase_localization

Objetivo

centralizar costos

centralizar logs

controlar rate limits

cambiar proveedor sin romper módulos

decidir modelo por tarea

13. TRADUCTOR Y QUICK PHRASES

Este módulo es oficial y parte del producto.

Tiene dos capas
1. App multilenguaje

Toda la UI vía i18n.

Idiomas iniciales:

es

en

pt

fr

de

2. Travel Translator

Herramienta funcional del viaje.

Debe permitir:

traducción libre

categorías por contexto

quick phrases

soporte según idioma activo

Categorías base

airport

hotel

restaurant

transport

shopping

emergency

health

directions

basic conversation

Regla clave

No es un traductor decorativo.
Es un asistente operativo de comunicación.

14. WEATHER ARCHITECTURE

El clima debe ser:

por viaje

por día

útil para mañana / tarde / noche

cacheado

Uso

dashboard

packing

recomendaciones

alertas contextuales

No debe ser una consulta suelta cada render.

15. PACKING ARCHITECTURE

Smart Packing es el corazón del sistema.

Flujo
Trip context
→ luggage strategy
→ traveler profiles
→ climate context
→ packing engine
→ categorized list
→ user confirmation
→ photo evidence
→ luggage analysis
El módulo debe soportar

maleta individual

maleta compartida

mamá + bebé

pareja

niños juntos

categorías y subcategorías

evidencia

análisis visual

16. WALLET ARCHITECTURE

Travel Wallet es el repositorio operativo del viaje.

Guarda

boarding passes

reservas

tickets

pólizas

documentos

comprobantes

Entradas posibles

carga manual

imagen

PDF

OCR

Debe conectarse con

itinerary

agenda

transport

emergency context si aplica

17. AGENDA ARCHITECTURE

Agenda no es un calendario bonito.
Es un módulo operativo.

Debe contener

eventos del viaje

recordatorios

medicamentos

horarios

actividades

hitos del viaje

Debe alimentar

notificaciones

timeline

widgets del dashboard

18. EMERGENCY ARCHITECTURE

Emergency Travel Card es un módulo central.

Debe existir en dos niveles
Privado

Perfil completo del usuario

Público

QR/token con solo campos consentidos

Debe incluir mínimo

nombre

edad

tipo de sangre

alergias

medicamentos

padecimientos clave

contactos de emergencia

idioma principal

19. PRINCIPIOS ABSOLUTOS DE IMPLEMENTACIÓN
1. No Frankenstein

No pegar módulos viejos con lógica nueva sin alineación.

2. No hardcode

Nada crítico debe vivir fijo en UI.

3. No lógica compleja en componentes

Los componentes renderizan, no deciden negocio.

4. No APIs privadas en frontend

Todo proveedor sensible va por Edge.

5. No recomendaciones genéricas

Todo debe depender de un viaje real.

6. No módulos muertos

Si no nace del contexto, no aparece.

7. No texto fuera de i18n

Toda UI debe ser traducible.

8. No emojis

Marca y UI limpias.

20. PREGUNTA RECTORA PARA TODO DESARROLLO

Antes de implementar cualquier feature, responder:

¿Esto ayuda a operar un viaje real dentro del Travel Control Center?

Si la respuesta es no, no entra.

21. ORDEN DE CONSTRUCCIÓN
Fase 1

Trip real + Supabase consistente

Fase 2

Dashboard vivo + active_modules + clima diario

Fase 3

Packing V2

Fase 4

Wallet + OCR

Fase 5

Agenda + notificaciones

Fase 6

Emergency Travel Card

Fase 7

Translator + Quick Phrases

Fase 8

IA Orchestrator refinado

22. DEFINICIÓN FINAL

VIAZA no compite por ser “otra app de viaje”.

Compite por convertirse en la capa operativa del viaje.

Eso significa:

menos caos

más control

más seguridad

mejor preparación

mejor experiencia en destino

Fórmula oficial

Viaje real → contexto real → dashboard vivo → módulos dinámicos → operación del viaje

PLAN FREE
Organiza tu viaje

Precio: Gratis

Este plan permite al usuario crear su viaje y organizar lo básico, pero no ejecuta procesos que generen costo en infraestructura.

Incluye

Gestión básica del viaje

Crear viaje

Destino manual (texto simple)

Fechas

Tipo de viaje

Viaje solo / pareja / familia / grupo

Lista simple del viaje

Checklist manual editable tipo:

Pasaporte

Ropa

Cargadores

Documentos

(no inteligente)

Notas del viaje

apuntes

direcciones

recordatorios manuales

Agenda manual

agregar eventos

agregar recordatorios

sin notificaciones avanzadas

Travel Wallet básico

subir documentos manualmente

fotos o PDF

(sin OCR)

Emergency Card básica

datos médicos

contacto emergencia

visible dentro de la app

(sin QR público)

Historial de viajes

guardar viajes anteriores

Límites del plan FREE

1 viaje activo

Sin clima automático

Sin recomendaciones

Sin Places

Sin maleta inteligente

Sin OCR

Sin análisis de equipaje

Sin resumen de lugares

Sin traductor

Sin frases rápidas

Sin módulos dinámicos

Sin notificaciones inteligentes

PLAN PREMIUM
Travel Control Center completo

Precio: 149 MXN / mes

Aquí vive el valor real del producto.

Todo lo que implica:

IA

APIs

inteligencia

contexto del viaje

automatización

Incluye todo FREE +:
Destino inteligente

destino vía Google Places

timezone automático

moneda

idioma

coordenadas

Clima del viaje

Pronóstico por día:

mañana

tarde

noche

Usado para:

packing

recomendaciones

Smart Packing (Maleta Inteligente)

Generación automática basada en:

destino

clima

duración

tipo de viaje

integrantes

Incluye:

categorías

subcategorías

organización por integrante

maletas compartidas

mamá + bebé

pareja

niños

Análisis de equipaje

foto de maleta

recomendación de acomodo

detección de objetos

Travel Wallet inteligente

OCR automático de:

boarding passes

reservas

tickets

pólizas

documentos

Genera eventos automáticamente.

Recomendaciones inteligentes

Basadas en:

ubicación

contexto del viaje

tipo de viaje

Incluye:

restaurantes

lugares

experiencias

transporte

Traductor integrado

Traducción contextual.

Idiomas:

español

inglés

portugués

francés

alemán

Quick Phrases de viaje

Categorías:

aeropuerto

hotel

restaurante

transporte

compras

emergencia

salud

direcciones

Agenda avanzada

recordatorios automáticos

medicamentos

horarios

sincronización

Emergency Travel Card avanzada

Incluye:

QR público

token seguro

acceso por emergencia

Módulos dinámicos

El dashboard cambia según:

tipo de viaje

destino

transporte

integrantes

fase del viaje

Lógica de conversión

El usuario entra por FREE para:

organizar viaje

guardar cosas

probar la app

Pero el momento de conversión llega cuando necesita:

packing

clima

recomendaciones

traducción

wallet inteligente

agenda automática

Eso ocurre cuando el viaje se acerca.

Economía del modelo

Costo FREE aproximado:

1–2 MXN por usuario / mes

Costo PREMIUM:

~18 MXN

Ingreso:

149 MXN

Margen bruto:

~88 %

Frase de posicionamiento

FREE organiza tu viaje.
PREMIUM lo controla.

Codex, hay una lógica importante del producto que debemos integrar en el sistema.

La idea central es que VIAZA solo debe empezar a organizar el viaje y activar los módulos inteligentes cuando tengamos claro el contexto del viaje.

Ese contexto se construye a partir de algunas variables clave:

A dónde va el usuario (destino)

Con quién viaja (solo, pareja, familia, amigos, con niños, con bebé, etc.)

Cómo se traslada (avión, auto, bus, tren, etc.)

Modo de viaje o estilo de equipaje (ligero / mochila, normal, cómodo o “nice”)

Una vez que el sistema conoce estas variables, entonces puede empezar a organizar el viaje y activar los módulos correctos.

Pero hay otra dimensión muy importante:

Perfil del viajero

No todos los viajeros tienen el mismo estilo.

Por ejemplo:

algunos viajan con presupuesto limitado

otros con presupuesto medio

otros buscan comodidad o experiencias premium

Si un usuario indica que viaja con presupuesto bajo, el sistema no debe recomendar lugares caros.

Por eso el onboarding debe incluir un cuestionario corto pero inteligente, que permita identificar el perfil del viajero.

Reglas del cuestionario

Debe ser muy corto

Solo debe contener preguntas clave

El objetivo es generar señales suficientes para que el sistema entienda el perfil del viajero

Las respuestas deben alimentar la lógica de análisis del viaje.

Perfil de viajero que el sistema debe inferir

El algoritmo debe poder detectar perfiles como:

viajero económico

viajero balanceado

viajero cómodo

viajero premium

Ese perfil debe formar parte del Trip Context.

Ejemplo conceptual:

trip_context = {
  destination,
  transport_mode,
  travelers_type,
  luggage_strategy,
  traveler_profile
}
Cómo debe usarlo el sistema

Ese contexto debe afectar directamente:

las recomendaciones

las experiencias sugeridas

el rango de precios de lugares

el tipo de actividades

la organización del viaje

Ejemplos:

viajero económico → recomendaciones de bajo costo

familia → lugares familiares

mochilero → lugares prácticos y accesibles

viajero premium → experiencias y lugares de mayor nivel

Principio clave

El sistema no debe mostrar recomendaciones genéricas.

Todo debe depender del:

Trip Context + Traveler Profile

Eso es lo que permitirá que VIAZA se sienta realmente como un Travel Control Center inteligente, y no solo como una app de viajes genérica.

Por favor integra esta lógica en el diseño del algoritmo y del flujo de onboarding.
