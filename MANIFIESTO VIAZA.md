# MANIFIESTO DEL PRODUCTO — VIAZA
## Versión actualizada: 12 de marzo de 2026

---

## REGLAS ABSOLUTAS (NO NEGOCIABLES)
- **CERO EMOJIS** en la UI ni en el contenido de la app
- **CERO COLORES fuera de la paleta oficial** (ni morados, ni verdes custom, ni grises inventados)
- **TIPOGRAFÍA: Questrial** en toda la app — 100% sin excepción
- **TODO TEXTO via i18n** — nada hardcodeado en componentes
- **LÓGICA FUERA DE COMPONENTES** — engines y utils separados
- **TIPADO FUERTE** — TypeScript estricto en todo el proyecto
- **MOBILE-FIRST** — diseñado para pantalla de celular, no desktop
- **BUILD LIMPIO** — siempre verificar `npm run build` antes de cerrar sesión

---

## PALETA OFICIAL (INMUTABLE)

| Token | Hex | Uso |
|-------|-----|-----|
| Primary | `#12212E` | Fondos oscuros, textos principales |
| Secondary | `#307082` | Acentos, chips, íconos secundarios |
| Soft Teal | `#6CA3A2` | Acentos suaves, bordes |
| Background | `#ECE7DC` | Fondo general (arena/crema) |
| Accent | `#EA9940` | CTA, highlights, badges — solo para elementos de acción |

**Temas dinámicos por tipo de viaje** (aplican al interior de la app, no rompen la paleta base):
- `beach`: `#276189 / #96D0CD / #F0DD77 / #F7F6F0`
- `mountain`: `#3B4D2C / #7D8F55 / #C8B47D / #F5F2E8`
- `city`: `#223041 / #607D8B / #EA9940 / #F2F0EB`
- `camping`: `#425A36 / #83936D / #D2A65A / #F5F1E7`
- `work`: `#1F2A44 / #4B6B8A / #D59B47 / #F4F3F0`
- `snow`: usar variantes del primary más frías
- `roadtrip`: usar variantes del mountain
- `adventure`: usar variantes del accent cobre

---

## LOGOS DISPONIBLES
- `/public/brand/logo-white.png` — para fondos oscuros (`#12212E`)
- `/public/brand/logo-blue.png` — para fondos claros (`#ECE7DC`)
- **Regla:** nunca usar el logo equivocado según el fondo

---

MANIFIESTO DEL PRODUCTO
VIAZA
Visión

REGLA CLARA 
NO EMOJIS 
NO COLORES FUEERA DE PALETA 
TIPOGRAFIA questrial

VIAZA es el asistente inteligente de viaje que acompaña al usuario desde la planificación hasta el regreso a casa.

Viajar debería ser emocionante, no estresante.
Pero hoy los viajeros usan muchas herramientas separadas:

listas de equipaje

traductores

conversores de moneda

apps de notas

apps para dividir cuentas

blogs para tips

VIAZA integra todo eso en una sola app elegante, rápida y global.

Propósito

Crear el companion definitivo para viajeros independientes.

Una app que:

prepare el viaje

evite olvidar cosas

facilite la logística

ayude durante el viaje

resuelva problemas comunes

Posicionamiento

VIAZA no es una “packing app”.

VIAZA es:

Smart Travel Companion

Mercado objetivo
Target principal

Viajeros independientes 25-45 años.

Características:

viajan 2-6 veces al año

usan apps constantemente

reservan online

viajan solos o en pareja

Mercados prioritarios:

USA
Canada
UK
Australia
Europa occidental

Problema que resolvemos

Antes del viaje:

olvidar cosas

no saber qué empacar

no conocer reglas de aerolínea

no tener checklist claro

Durante el viaje:

idioma

moneda

dividir cuentas

tips locales

logística

Identidad visual
Logo

Símbolo:
V + pin de destino

Significa:

VIAZA

ubicación

destino

movimiento

Paleta oficial

Primary
#12212E

Secondary
#307082

Soft teal
#6CA3A2

Light background
#ECE7DC

Accent
#EA9940

Sistema visual dinámico

La app cambia colores según destino.

Playa
turquesa / aqua

Montaña
verde oliva

Ciudad
gris / navy

Camping
verde bosque

Arquitectura de la app

La experiencia se divide en 3 momentos del viaje.

1. ANTES DEL VIAJE

Preparación.

Onboarding inteligente

Preguntas:

Destino
Tipo de viaje
Duración
Clima esperado
Quién viaja
Actividades
Lavado de ropa

Tipos de viaje:

Playa
Montaña
Ciudad
Camping
Trabajo

Generador de packing list

Basado en:

destino
clima
duración
tipo de viaje

Ejemplo playa:

traje de baño
sandalias
bloqueador

Ejemplo montaña:

botas
chaqueta
linterna

Laundry planner

Pregunta clave:

¿lavarás ropa?

Esto calcula cuántas prendas llevar.

Ejemplo:

7 días
lavado cada 3 días

resultado:

4 camisetas
4 ropa interior
2 pantalones

Adaptadores eléctricos

Según país:

tipo de enchufe
voltaje

La app sugiere adaptador.

Reglas de aerolíneas

Usuario selecciona aerolínea.

Se muestra:

peso permitido
equipaje de mano
dimensiones

Qué puedo llevar en el avión

Buscador de objetos.

Ejemplo:

perfume
power bank
rastrillo
shampoo

Resultado:

permitido cabina
permitido documentado
prohibido

2. SALIDA DEL VIAJE

Logística final.

Checklist antes de salir

Pasaporte
llaves
cargador
cartera
documentos

Alarma salida aeropuerto

Inputs:

hora vuelo
aeropuerto

La app calcula:

hora salir de casa.

3. DURANTE EL VIAJE

Herramientas útiles.

Traductor rápido

Frases clave:

dónde está el baño
cuánto cuesta
necesito ayuda

Modo offline (fase futura).

Conversor de moneda

Conversión instantánea.

Ejemplo:

USD
EUR
MXN
JPY

Dividir cuentas

Split bill.

Inputs:

total
personas
propina

Modo avanzado:

dividir por consumo.

Tips del lugar

Basado en ubicación.

Ejemplo Roma:

cuidado con carteristas
fuentes de agua potable

Ejemplo Tokio:

normas del metro
formas de pago

Tips de supervivencia

Especial camping.

Ejemplos:

cocinar en lata
lavamanos con botella
kit básico

Funciones virales

Estas funciones generan descargas.

Packing list inteligente

Una de las más buscadas.

Qué puedo llevar en el avión

Muy buscado antes de viajar.

Split bill viajes

Problema común entre amigos.

Tips locales

Información útil inmediata.

Roadmap futuro
Scan My Bag

Escaneo de maleta con cámara.

Detecta objetos.

Modo viaje offline

Datos guardados sin internet.

Recomendaciones AI

Sugerencias de equipaje.

Arquitectura técnica

Frontend

React
Vite

Mobile

Capacitor

Local data

SQLite / local storage

APIs

clima
moneda
traducción

Idiomas

Inglés
Español
Portugués
Francés
Alemán

Monetización

Modelo freemium.

Gratis

packing list
checklist
tips básicos
split bill
moneda

PRO

traductor completo
modo offline
tips premium
recomendaciones inteligentes

Precio

$4.99 USD

Estrategia de crecimiento

Canales principales:

TikTok
Instagram Reels

Contenido:

travel hacks
packing tips
errores comunes al viajar

Meta año 1

Usuarios:

100k

Conversión:

3 %

Suscriptores:

3000

Ingresos:

$15,000+

Mensaje de marketing

Never forget anything when you travel.

Tagline

VIAZA
Your smart travel companion

BLUEPRINT TÉCNICO
VIAZA
React + Vite + Capacitor
1. OBJETIVO TÉCNICO

Construir una app móvil nativa llamada VIAZA, enfocada en viajeros independientes, que funcione como smart travel companion y cubra 3 momentos del viaje:

Antes del viaje

Salida del viaje

Durante el viaje

La app debe ser:

mobile-first

visualmente premium

rápida

modular

escalable

multilenguaje

lista para Android e iOS con Capacitor

con persistencia local desde el inicio

preparada para agregar APIs y features premium después

2. STACK
Frontend

React

Vite

TypeScript

React Router

Zustand o Context + hooks para estado global

Tailwind CSS o CSS Modules

Framer Motion para microanimaciones suaves

Mobile / Native

Capacitor

Capacitor Preferences

Capacitor Local Notifications

Capacitor Geolocation

Capacitor Device

Capacitor Share

Capacitor Haptics

Datos locales

SQLite o Ionic Secure Storage / sqlite plugin si se quiere más sólido

En MVP inicial se puede usar:

Zustand persist

localStorage / Preferences

Pero dejar arquitectura lista para pasar a SQLite

i18n

i18next

react-i18next

APIs externas

clima

moneda

traducción

opcional vuelos / reglas / países

3. ARQUITECTURA GENERAL DE MÓDULOS

La app se divide en módulos de negocio:

onboarding

trips

packing

laundry

airline

airport-items

adapters

translator

currency

split-bill

local-tips

survival-tips

reminders

settings

premium

theme-engine

i18n

4. ESTRUCTURA DE CARPETAS
src/
  app/
    router/
      index.tsx
      routes.tsx
    providers/
      AppProviders.tsx
    store/
      useAppStore.ts
    theme/
      theme.ts
      travelThemes.ts
    config/
      constants.ts
      env.ts

  assets/
    icons/
    images/
    lotties/

  components/
    ui/
      AppButton.tsx
      AppCard.tsx
      AppInput.tsx
      AppSelect.tsx
      AppChip.tsx
      AppHeader.tsx
      ProgressBar.tsx
      SectionTitle.tsx
      EmptyState.tsx
      BottomNav.tsx
      ModalSheet.tsx
    travel/
      TravelTypeCard.tsx
      TripSummaryCard.tsx
      PackingItemRow.tsx
      WeatherBadge.tsx
      CurrencyCard.tsx
      TipCard.tsx
      AirlineRuleCard.tsx

  modules/
    onboarding/
      pages/
        OnboardingWelcomePage.tsx
        TravelTypePage.tsx
        DestinationPage.tsx
        DurationPage.tsx
        ClimatePage.tsx
        TravelersPage.tsx
        ActivitiesPage.tsx
        LaundryPage.tsx
        OnboardingSummaryPage.tsx
      components/
      hooks/
      utils/
        onboardingMapper.ts

    trips/
      pages/
        HomePage.tsx
        TripDetailsPage.tsx
        CreateTripPage.tsx
      components/
      hooks/
      utils/
        tripCalculations.ts

    packing/
      pages/
        PackingListPage.tsx
        PackingChecklistPage.tsx
      components/
        PackingCategorySection.tsx
        PackingProgressCard.tsx
      utils/
        packingRules.ts
        packingGenerator.ts
        packingCategories.ts

    laundry/
      utils/
        laundryPlanner.ts

    airline/
      pages/
        AirlineRulesPage.tsx
      utils/
        airlineRulesData.ts

    airport-items/
      pages/
        AllowedItemsPage.tsx
      utils/
        airportItemsData.ts
        airportItemsSearch.ts

    adapters/
      pages/
        AdapterGuidePage.tsx
      utils/
        countryAdapterData.ts

    translator/
      pages/
        TranslatorPage.tsx
        QuickPhrasesPage.tsx
      services/
        translateService.ts
      utils/
        quickPhrasesData.ts

    currency/
      pages/
        CurrencyConverterPage.tsx
      services/
        currencyService.ts
      utils/
        currencyHelpers.ts

    split-bill/
      pages/
        SplitBillPage.tsx
      utils/
        splitBillCalculator.ts

    local-tips/
      pages/
        LocalTipsPage.tsx
      services/
        localTipsService.ts
      utils/
        localTipsData.ts

    survival-tips/
      pages/
        SurvivalTipsPage.tsx
      utils/
        survivalTipsData.ts

    reminders/
      pages/
        DepartureReminderPage.tsx
      services/
        notificationsService.ts
      utils/
        departureCalculator.ts

    settings/
      pages/
        SettingsPage.tsx
        LanguagePage.tsx
        ThemePreviewPage.tsx

    premium/
      pages/
        PremiumPage.tsx

  services/
    api/
      httpClient.ts
    storage/
      storageService.ts
    device/
      locationService.ts
      shareService.ts
      hapticsService.ts

  lib/
    i18n/
      index.ts
      locales/
        en.json
        es.json
        pt.json
        fr.json
        de.json

  types/
    trip.ts
    packing.ts
    airline.ts
    airportItem.ts
    currency.ts
    tip.ts
    user.ts
    theme.ts

  utils/
    formatters.ts
    dates.ts
    validators.ts

  main.tsx
  App.tsx
5. MODELO DE DATOS
Trip
type TravelType = 'beach' | 'mountain' | 'city' | 'camping' | 'work';

type ClimateType = 'hot' | 'cold' | 'mild' | 'rainy';

type TravelerGroup = 'solo' | 'couple' | 'family' | 'friends';

type LaundryMode = 'none' | 'washer' | 'laundry_service';

interface Trip {
  id: string;
  title: string;
  destination: string;
  countryCode?: string;
  startDate?: string;
  endDate?: string;
  durationDays: number;
  travelType: TravelType;
  climate: ClimateType;
  travelerGroup: TravelerGroup;
  activities: string[];
  laundryMode: LaundryMode;
  airline?: string;
  airportCode?: string;
  flightDepartureTime?: string;
  currencyCode?: string;
  languageCode?: string;
  createdAt: string;
  updatedAt: string;
}
Packing item
interface PackingItem {
  id: string;
  tripId: string;
  category: 'documents' | 'clothes' | 'toiletries' | 'electronics' | 'health' | 'extras';
  label: string;
  quantity: number;
  checked: boolean;
  required: boolean;
  source:
    | 'default'
    | 'travel_type'
    | 'climate'
    | 'laundry'
    | 'airline'
    | 'user_custom';
}
Airline rule
interface AirlineRule {
  airline: string;
  carryOnWeightKg?: number;
  checkedBagWeightKg?: number;
  carryOnSize?: string;
  personalItemSize?: string;
  notes?: string[];
}
Airport allowed item
interface AirportAllowedItem {
  id: string;
  label: string;
  carryOn: 'allowed' | 'restricted' | 'forbidden';
  checked: 'allowed' | 'restricted' | 'forbidden';
  notes?: string;
  keywords: string[];
}
Adapter guide
interface AdapterGuide {
  countryCode: string;
  countryName: string;
  plugTypes: string[];
  voltage: string;
  frequency: string;
  recommendation?: string;
}
Local tip
interface LocalTip {
  id: string;
  countryCode?: string;
  city?: string;
  category: 'safety' | 'transport' | 'culture' | 'money' | 'food' | 'utilities';
  title: string;
  description: string;
}
6. RUTAS DE LA APP
/
 /onboarding
 /home
 /trip/:id
 /trip/:id/packing
 /trip/:id/checklist
 /trip/:id/airline-rules
 /trip/:id/allowed-items
 /trip/:id/adapters
 /trip/:id/departure
 /translator
 /currency
 /split-bill
 /tips/local
 /tips/survival
 /settings
 /premium
7. FLUJO DE USUARIO
Flujo inicial

Welcome

Elegir tipo de viaje

Destino

Duración

Clima

Quién viaja

Actividades

Lavado de ropa

Resumen

Generar viaje

Crear packing list automática

Mandar a Home / Trip details

Flujo operativo

Home muestra viaje activo

usuario entra a packing checklist

marca items

revisa reglas de aerolínea

revisa qué puede llevar en avión

revisa adaptadores

programa recordatorio de salida

durante viaje usa traductor, moneda, split bill y tips

8. PANTALLAS CLAVE
HomePage

Debe mostrar:

header con logo y viaje activo

card principal del viaje actual

progreso de packing

accesos rápidos:

packing list

traductor

moneda

dividir cuenta

tips

sección “Before you go”

sección “During your trip”

TripDetailsPage

Debe mostrar:

destino

fechas

tipo de viaje

clima

aerolínea

moneda

idioma

botones rápidos a módulos relacionados

PackingChecklistPage

Debe mostrar:

progreso %

categorías colapsables

checkbox grande por item

cantidad por item

botón agregar item personalizado

AirlineRulesPage

Debe mostrar:

aerolínea

carry-on

maleta documentada

líquidos

notas especiales

AllowedItemsPage

Debe mostrar:

buscador

lista de objetos

estatus por cabina/documentado

notas aclaratorias

AdapterGuidePage

Debe mostrar:

país

tipos de enchufe

voltaje

recomendación visual

TranslatorPage

Debe mostrar:

input texto

idioma origen/destino

botón traducir

resultado

acceso a frases rápidas

CurrencyConverterPage

Debe mostrar:

monto

moneda origen

moneda destino

resultado grande

swap button

SplitBillPage

Debe mostrar:

total

porcentaje propina

número personas

resultado por persona

modo avanzado por consumo individual

LocalTipsPage

Debe mostrar:

tips por destino/país

categorías:

seguridad

transporte

cultura

dinero

comida

DepartureReminderPage

Debe mostrar:

hora vuelo

aeropuerto

tiempo recomendado salida

botón crear recordatorio nativo

9. MOTOR DE TEMAS DINÁMICOS
Idea

La marca base de VIAZA es fija, pero el interior puede cambiar según el tipo de viaje.

Tema base marca
const brandTheme = {
  primary: '#12212E',
  secondary: '#307082',
  soft: '#6CA3A2',
  background: '#ECE7DC',
  accent: '#EA9940',
};
Temas por viaje
const travelThemes = {
  beach: {
    primary: '#276189',
    secondary: '#96D0CD',
    accent: '#F0DD77',
    background: '#F7F6F0',
  },
  mountain: {
    primary: '#3B4D2C',
    secondary: '#7D8F55',
    accent: '#C8B47D',
    background: '#F5F2E8',
  },
  city: {
    primary: '#223041',
    secondary: '#607D8B',
    accent: '#EA9940',
    background: '#F2F0EB',
  },
  camping: {
    primary: '#425A36',
    secondary: '#83936D',
    accent: '#D2A65A',
    background: '#F5F1E7',
  },
  work: {
    primary: '#1F2A44',
    secondary: '#4B6B8A',
    accent: '#D59B47',
    background: '#F4F3F0',
  },
};
10. GENERADOR DE PACKING LIST
Lógica

La lista se genera por reglas acumulativas.

Base

Siempre agregar:

identificación/pasaporte

cargador celular

ropa interior

cepillo dental

artículos de higiene básicos

Por tipo de viaje
beach

traje de baño

sandalias

bloqueador

lentes de sol

mountain

botas

chamarra

linterna

termo

botiquín

city

ropa casual

audífonos

cargador portátil

zapatos cómodos

camping

tienda

sleeping bag

linterna

encendedor

botiquín

cuerda

work

laptop

cargador laptop

documentos

ropa formal

Por clima
hot

ropa ligera

sombrero

protector solar

cold

abrigo

guantes

bufanda

rainy

impermeable

paraguas

bolsa impermeable

Por laundry mode
none

calcular prendas para todos los días

washer / laundry_service

reducir prendas según ciclo estimado

11. LAUNDRY PLANNER
function calculateClothesNeeded(durationDays: number, laundryMode: LaundryMode) {
  if (laundryMode === 'none') {
    return {
      shirts: durationDays,
      underwear: durationDays,
      pants: Math.ceil(durationDays / 3),
    };
  }

  if (laundryMode === 'washer' || laundryMode === 'laundry_service') {
    const cycle = Math.min(4, durationDays);
    return {
      shirts: cycle,
      underwear: cycle,
      pants: Math.max(2, Math.ceil(cycle / 2)),
    };
  }

  return {
    shirts: durationDays,
    underwear: durationDays,
    pants: Math.ceil(durationDays / 3),
  };
}
12. DATOS ESTÁTICOS NECESARIOS

Codex debe crear datasets internos para MVP:

airlineRulesData.ts

Ejemplo:

Aeromexico

Volaris

Viva

American Airlines

Delta

United

Ryanair

EasyJet

airportItemsData.ts

Ejemplo:

perfume

power bank

rastrillo

navaja

líquidos

shampoo

comida

medicamentos

countryAdapterData.ts

Ejemplo:

USA

Mexico

Japan

France

Italy

UK

Spain

Germany

quickPhrasesData.ts

Categorías:

aeropuerto

hotel

restaurante

emergencia

transporte

localTipsData.ts

Por país o ciudad principal:

safety

transport

cultural etiquette

money tips

survivalTipsData.ts

Especial:

camping

montaña

playa

naturaleza

13. ESTADO GLOBAL

Usar Zustand.

Store sugerido
interface AppState {
  currentLanguage: string;
  currentTripId: string | null;
  trips: Trip[];
  packingItems: PackingItem[];
  isPremium: boolean;

  setLanguage: (lang: string) => void;
  createTrip: (trip: Trip) => void;
  updateTrip: (tripId: string, patch: Partial<Trip>) => void;
  setCurrentTrip: (tripId: string) => void;
  setPackingItems: (tripId: string, items: PackingItem[]) => void;
  togglePackingItem: (itemId: string) => void;
  addCustomPackingItem: (item: PackingItem) => void;
  setPremium: (value: boolean) => void;
}

Persistir store.

14. i18n
Idiomas iniciales

en

es

pt

fr

de

Claves
{
  "common.continue": "Continue",
  "common.back": "Back",
  "home.title": "Your smart travel companion",
  "packing.title": "Packing list",
  "translator.title": "Translator",
  "currency.title": "Currency converter"
}

Todo texto debe salir de i18n, no hardcoded.

15. SERVICIOS
storageService.ts

Funciones:

saveTrips

getTrips

savePackingItems

getPackingItems

saveSettings

getSettings

currencyService.ts

fetchRates(baseCurrency)

convertAmount(amount, from, to)

translateService.ts

translateText(text, from, to)

locationService.ts

getCurrentPosition()

reverseGeocode() opcional

notificationsService.ts

requestPermissions()

scheduleDepartureReminder()

16. BOTTOM NAV

La app debe tener navegación inferior clara.

Tabs sugeridas:

Home

Packing

Tools

Tips

Settings

Dentro de Tools:

translator

currency

split bill

adapters

17. FUNCIONES MVP OBLIGATORIAS

Estas sí o sí deben salir primero:

onboarding

create trip

packing generator

packing checklist

laundry planner

airline rules

allowed items search

adapter guide

translator basic

currency converter

split bill

local tips

departure reminder

multilanguage

dynamic theme by travel type

18. FUNCIONES FASE 2

modo offline

quick phrases offline

tips geolocalizados reales

compartir viaje

compartir lista

modo premium

guardar múltiples viajes avanzados

19. FUNCIONES FASE 3

scan my bag

recomendaciones IA

sincronización nube

reglas de aerolínea por ruta real

integración con reservas

20. ESTILO UI
Principios

premium pero cálida

nada infantil

nada saturado

tarjetas limpias

textos amplios

botones claros

iconografía elegante

Visual

headers limpios

cards con esquinas suaves

mucho aire

máximo 2-3 colores por pantalla

el accent naranja solo para CTA o highlights

Tipografía

Manrope o Inter

peso 600 para títulos

peso 400/500 para cuerpo

21. INSTRUCCIONES DIRECTAS PARA CODEX

Pégale esto tal cual si quieres:

Construye una app móvil nativa llamada VIAZA usando React + Vite + TypeScript + Capacitor.

Objetivo: crear un smart travel companion premium, multilenguaje, modular y listo para Android/iOS.

Requisitos obligatorios:
- arquitectura modular por dominios
- Zustand persistente para estado global
- i18next con 5 idiomas (en, es, pt, fr, de)
- diseño mobile-first
- tema de marca base y temas dinámicos según tipo de viaje
- rutas con React Router
- componentes reutilizables
- persistencia local
- código limpio, escalable y listo para producción

Módulos obligatorios:
1. onboarding de viaje
2. trips
3. packing list generator
4. packing checklist
5. laundry planner
6. airline rules
7. allowed items search
8. adapters guide
9. translator
10. currency converter
11. split bill
12. local tips
13. survival tips
14. departure reminders
15. settings
16. premium placeholder

Crea datasets internos para MVP para:
- reglas de aerolíneas
- objetos permitidos en avión
- tipos de enchufe por país
- frases rápidas
- tips locales
- survival tips

UI:
- premium
- minimal
- elegante
- no infantil
- usar paleta base:
  primary #12212E
  secondary #307082
  soft #6CA3A2
  background #ECE7DC
  accent #EA9940

Brand:
- usar logo de VIAZA basado en V + pin
- icono app separado del wordmark

Entregables esperados:
- estructura completa del proyecto
- rutas funcionales
- store global
- páginas y componentes base
- lógica del packing generator
- checklist funcional
- tools funcionales con mocks o servicios listos
- TODOs claros para API integration real
22. ORDEN DE CONSTRUCCIÓN

Para no romper nada:

Sprint 1

setup proyecto

router

theme

store

i18n

bottom nav

UI kit base

Sprint 2

onboarding

trip creation

trip summary

dynamic themes

Sprint 3

packing generator

packing checklist

laundry planner

Sprint 4

airline rules

allowed items

adapters

Sprint 5

translator

currency

split bill

Sprint 6

local tips

survival tips

departure reminder

Sprint 7

polish visual

persistencia

QA

build Android

23. CRITERIO DE CALIDAD

No queremos demo bonita. Queremos base real.

Codex debe cuidar:

tipado fuerte

separación de responsabilidades

lógica fuera de componentes

nada hardcodeado en componentes si puede ir en datos

componentes pequeños

naming consistente

app estable para build con Capacitor

Home de VIAZA tiene que hacer que el usuario sienta en 3 segundos:

“Esta app me tiene cubierto para todo mi viaje.”

No debe parecer menú.
Debe parecer panel de control del viaje.

Piensa en algo tipo cockpit de viaje. ✈️

Estructura de la Home (de arriba hacia abajo)
1. Header elegante

Arriba:

Logo VIAZA
a la derecha:

👤 perfil / settings

Debajo una frase:

Your smart travel companion

Color fondo:
#12212E (navy profundo)

Esto da sensación premium inmediata.

2. Tarjeta del viaje activo (hero card)

La primera sección debe ser grande.

Ejemplo:

Tokyo, Japan 🇯🇵
Oct 12 – Oct 18
7 days trip

Debajo chips:

🌤 clima
💱 moneda
🗣 idioma

Botón:

View trip

Visualmente parece una tarjeta elegante tipo Apple Wallet.

3. Progreso de preparación

Debajo aparece una barra:

Packing progress

██████████░░░░░░
10 / 18 items packed

Botón grande:

Open packing list

Esto engancha porque la gente quiere completar listas.

4. Quick Tools (las funciones virales)

Cuatro botones grandes.

Grid 2x2.

🗣 Translator
💱 Currency
💸 Split Bill
🔌 Adapters

Iconos grandes.

Esto hace que la app se sienta útil incluso sin viaje activo.

5. Before you go

Sección tipo checklist.

✔ Check airline rules
✔ What can I bring on plane
✔ Departure reminder

Cada item con icono.

6. Tips for your destination

Tarjetas horizontales deslizable.

Ejemplo:

⚠ Pickpockets common in metro
💧 Public water fountains available
🍜 Local ramen machines guide

Esto da sensación app inteligente.

7. Survival / travel hacks

Otra fila horizontal.

Ejemplos:

🔥 Cook eggs in a tuna can
🚿 Bottle hand-wash trick
🎒 Packing compression tips

Esto genera contenido viral.

8. Bottom navigation

Simple y clara.

Home | Packing | Tools | Tips | Settings
Cómo se vería mentalmente
--------------------------------
VIAZA                     👤
Your smart travel companion
--------------------------------

[ Tokyo, Japan 🇯🇵 ]
Oct 12 - Oct 18
7 days trip

🌤 Mild
💱 JPY
🗣 Japanese

[ View trip ]

--------------------------------

Packing progress
█████████░░░░
10 / 18 items

[ Open packing ]

--------------------------------

Quick tools

🗣 Translator     💱 Currency
💸 Split Bill     🔌 Adapters

--------------------------------

Before you go

✔ Airline rules
✔ What can I bring
✔ Departure reminder

--------------------------------

Tips for Tokyo

⚠ Pickpockets
💧 Water fountains
🍜 Ramen machines

--------------------------------
Por qué esta Home funciona

Porque mezcla:

✔ estado del viaje
✔ progreso
✔ herramientas útiles
✔ contenido interesante

Esto hace que la app:

se sienta completa

invite a explorar

no parezca vacía

El detalle que hace que VIAZA se sienta premium

La tarjeta del viaje (hero card) debe tener:

foto del destino

overlay oscuro

texto blanco elegante

Tipo app de viajes de alto nivel.
Intro + onboarding es clave. Si lo hacemos bien, la gente entiende el valor de VIAZA en segundos. Si lo hacemos mal, creen que es otra app de listas y la cierran.

La regla:
rápido, visual y útil. Nada de 10 pantallas eternas.

Te lo visualizo completo.

1️⃣ Splash (1.5 segundos)

Pantalla muy limpia.

Fondo:
#12212E

Centro:

Logo VIAZA (V + punto)

Debajo:

Travel smarter

Animación muy sutil:

el punto del logo se mueve como pin de mapa cayendo.

Duración:

1–1.5 segundos.

2️⃣ Intro (3 pantallas máximo)

Swipe horizontal.

Pantalla 1

Visual:

maleta abierta con items organizados.

Texto:

Never forget anything when you travel

Subtexto:

Smart packing lists based on your destination.

Pantalla 2

Visual:

viajeros en restaurante dividiendo cuenta.

Texto:

Travel tools in one place

Subtexto:

Translate, convert currency and split bills instantly.

Pantalla 3

Visual:

persona explorando ciudad con mapa.

Texto:

Travel smarter

Subtexto:

Local tips and travel helpers wherever you go.

Botón grande:

Start my trip

3️⃣ Inicio del onboarding real

Aquí empieza lo importante.

Pantalla minimal.

Título:

Let's plan your trip

Subtexto:

Answer a few questions to prepare everything.

Botón:

Start

4️⃣ Tipo de viaje

Grid visual con tarjetas grandes.

🏖 Beach
🏔 Mountain
🏙 City
🏕 Camping
💼 Work

Esto sirve para:

packing list

tema visual

tips

5️⃣ Destino

Input:

Where are you going?

Autocompletar ciudades.

Ejemplo:

Tokyo
Paris
Cancún
Rome

Esto permitirá:

moneda

idioma

enchufes

tips

6️⃣ Duración del viaje

Selector simple.

How many days?

Slider:

3 days
7 days
10 days
14 days

Esto alimenta el laundry planner.

7️⃣ Clima esperado

🌞 Hot
🌤 Mild
❄ Cold
🌧 Rainy

Esto afecta:

packing list.

8️⃣ Con quién viajas

👤 Solo
❤️ Couple
👨‍👩‍👧 Family
👥 Friends

Esto afecta:

split bill tips
packing.

9️⃣ Lavado de ropa

Pregunta clave.

Will you wash clothes during the trip?

Opciones:

No
Laundry service
Washing machine

Esto activa el laundry planner.

🔟 Pantalla final

Resumen bonito.

Tarjeta:

Tokyo 🇯🇵
7 days
City trip

Debajo:

Your smart packing list is ready

Botón grande:

Create my trip

Resultado

Al terminar onboarding el usuario entra a:

Home

pero ya con:

✔ viaje creado
✔ packing list generada
✔ moneda definida
✔ idioma definido

La app se siente inteligente inmediatamente.

UX clave

Duración total onboarding:

menos de 45 segundos.

Eso es importante.

Animaciones

Sutiles:

transiciones suaves

iconos que aparecen

tarjetas que suben

Nada exagerado.

Sensación final

El usuario debe sentir:

“Esta app ya está pensando por mí.”


actualizacion  adicional 

ARQUITECTURA CENTRAL DE VIAZA

El sistema funciona con un motor de contexto de viaje.

Variables principales
trip_type
destination
dates
activities
weather_forecast
culture_rules
gear_requirements
packing_list
tools_enabled

Cada paso alimenta el siguiente.

FLUJO COMPLETO DEL USUARIO
1. Splash / Intro

Pantalla animada.

Elementos:

logo VIAZA

animación pin → avión

fondo mapa minimal

Duración:

900 ms

Luego aparece:

Start your trip

Botón:

PLAN MY TRIP
2. Tipo de Viaje (PRIMERA DECISIÓN)

Pantalla:

What kind of trip is this?

Tarjetas grandes:

🏖 Beach
🏙 City
🏔 Mountain
🏕 Camping
🎿 Snow / Ski
🚗 Roadtrip
💼 Work
🌍 Adventure

UI:

tarjetas grandes

iconos ilustrados

hover / press animation

Cuando el usuario toca una tarjeta:

trip_type = beach

Esto activa:

destination_filters
activity_suggestions
packing_rules
3. Modal Cristal – Selección de Destino

Aquí haces lo que dijiste.

Se abre Glass Modal:

Search destination

UI:

campo búsqueda

resultados filtrados por tipo de viaje

Ejemplo beach
Cancún 🇲🇽
Tulum 🇲🇽
Maui 🇺🇸
Bora Bora 🇵🇫
Ibiza 🇪🇸
Phuket 🇹🇭
Ejemplo montaña
Aspen 🇺🇸
Zermatt 🇨🇭
Banff 🇨🇦
Bariloche 🇦🇷
Chamonix 🇫🇷
Ejemplo ciudad
Tokyo
Paris
New York
Rome
Barcelona

Cuando selecciona:

destination = cancun
country = mexico
lat = ...
lon = ...
4. Selección de Fechas

Pantalla calendario.

Campos:

departure_date
return_date

El sistema calcula:

trip_duration
5. Motor de Inteligencia (AUTOMÁTICO)

Ahora el sistema consulta APIs.

Clima

API ejemplo:

OpenWeather
WeatherAPI

Respuesta:

avg_temp
rain_probability
wind
humidity
uv_index

Se calcula:

weather_type

ejemplo:

hot
warm
cold
snow
rainy
humid
6. Actividades sugeridas

Dependen de:

trip_type
destination
weather

Ejemplo beach:

snorkeling
diving
boat tours
beach clubs
surf

Ejemplo montaña:

hiking
climbing
ski
snowboard
trail running

UI:

cards seleccionables.

Usuario marca:

activities = [snorkeling, beach_clubs]
7. Perfil del viajero

Pantalla simple:

Who are you traveling with?

Opciones:

solo
partner
friends
family
kids

Esto afecta packing.

8. Estilo de viaje

Opciones:

light traveler
normal
heavy gear

Variables:

packing_weight_pref
9. Motor de Packing Inteligente

Ahora el sistema genera:

packing_list

basado en:

trip_type
weather
activities
duration
traveler_type
Ejemplo beach + snorkeling
swimsuits
reef-safe sunscreen
snorkel gear
flip flops
beach towel
dry bag
light clothes
waterproof phone pouch
hat
Ejemplo snow
thermal base layers
ski jacket
ski pants
gloves
goggles
neck warmer
snow boots
lip balm
hand warmers
10. Pantalla RESUMEN DEL VIAJE

Hero card.

Trip to Cancún
May 4 — May 10
Beach Trip

Datos:

weather forecast
activities
packing progress
tools enabled

Botón:

ENTER TRIP DASHBOARD
DASHBOARD DEL VIAJE

Pantalla principal.

Secciones:

Hero Card
Cancún 🇲🇽
28°C Sunny
7 days
Beach Trip
Packing Progress
65% ready

Botón:

VIEW PACKING
Quick Tools
Translator
Currency
Split bill
Adapters
Before You Go
Airport rules
Local laws
Travel tips
Documents
DURANTE EL VIAJE

El sistema cambia estado.

trip_status = active
Tools disponibles
Translator

idioma destino.

Currency converter
Split bill
Tips locales
Emergency info
ACTIVIDADES

Usuario puede guardar.

saved_activities
FINAL DEL VIAJE

Cuando termina la fecha.

trip_status = completed

Pantalla:

How was your trip?

Opciones:

save memories
export packing
duplicate trip
ESTRUCTURA TÉCNICA

Motor principal:

TripContext

Ejemplo:

interface TripContext {
 tripType
 destination
 country
 coordinates
 startDate
 endDate
 duration
 weatherForecast
 activities
 travelerType
 packingStyle
 packingList
 toolsEnabled
}
MOTOR DE PACKING

Función:

generatePackingList(context: TripContext)

Reglas:

weather_rules
activity_rules
trip_type_rules
duration_rules
MOTOR DE ACTIVIDADES
suggestActivities(context)
APIs

Clima

OpenWeather
WeatherAPI

Moneda

ExchangeRate API

Idiomas

Google Translate
COMPONENTES UI
TripTypeCards
DestinationModal
DatePicker
ActivitySelector
TravelerSelector
PackingChecklist
TripDashboard
QuickTools
ANIMACIONES

Bibliotecas:

Framer Motion
Lottie

Transiciones:

moduleTransition
modalGlassOpen
cardHover
navSlide
ORDEN PARA CODEX
1 create TripContext state
2 implement TripType screen
3 implement DestinationModal with filters
4 integrate weather API
5 implement ActivitySelector
6 implement PackingEngine
7 build TripDashboard
8 add tools modules
9 add animations
DECISIÓN IMPORTANTE

Este flujo sí respeta lo que tú querías:

1️⃣ tipo de viaje
2️⃣ destino
3️⃣ clima automático
4️⃣ actividades
5️⃣ maleta inteligente

No es un formulario.
Es un motor de viaje.

Arquitectura del sistema

Flujo de pantallas

Motor de inteligencia del viaje

Arquitectura React real

Todo mobile-first, React + Vite + Capacitor como ya trabajas.

1. ARQUITECTURA GLOBAL DE VIAZA

VIAZA tiene 4 motores principales.

Trip Engine
Packing Engine
Activity Engine
Travel Tools Engine

Todos usan un estado central:

TripContext
TRIP CONTEXT (NÚCLEO DEL SISTEMA)
interface TripContext {
  tripId: string

  tripType: "beach" | "city" | "mountain" | "snow" | "camping" | "roadtrip" | "work"

  destination: {
    name: string
    country: string
    lat: number
    lon: number
    timezone: string
    currency: string
    language: string
  }

  dates: {
    departure: string
    return: string
    duration: number
  }

  weather: {
    avgTemp: number
    forecast: string
    rainProbability: number
    weatherType: "hot" | "warm" | "cold" | "snow" | "rainy"
  }

  activities: string[]

  travelerType: "solo" | "partner" | "friends" | "family"

  packingStyle: "light" | "normal" | "heavy"

  packingList: PackingItem[]

  tripStatus: "planning" | "active" | "completed"
}

Este objeto vive en:

src/context/TripContext.tsx
2. FLUJO DE PANTALLAS

El flujo no es lineal tipo formulario.

Es Decision Tree UX.

SCREEN 1
Splash

Animación:

pin → ruta → avión

Duración

900 ms

Luego botón:

START TRIP

Ruta:

/onboarding/trip-type
SCREEN 2
Tipo de Viaje

Cards grandes.

Beach
City
Mountain
Snow
Camping
Roadtrip
Work
Adventure

Componente:

TripTypeSelector

Cuando selecciona:

setTripType()

Ruta siguiente:

/onboarding/destination
SCREEN 3
Modal Cristal – Destino

Glass modal con búsqueda.

Componente:

DestinationModal

Campo:

searchDestination()

Resultados filtrados por tipo de viaje.

Ejemplo:

beach
Cancún
Tulum
Ibiza
Phuket
Maui
Bora Bora
mountain
Aspen
Zermatt
Banff
Chamonix

Selección guarda:

destination
coordinates
country
currency
language

Ruta:

/onboarding/dates
SCREEN 4
Fechas

Componente:

TripDatePicker

Campos:

departure
return

Se calcula:

duration
SCREEN 5
Weather Engine

No es pantalla visible.

Cuando ya hay:

destination + dates

Se dispara:

fetchWeatherForecast()

API:

OpenWeatherMap
WeatherAPI

Se guarda en:

TripContext.weather
SCREEN 6
Actividades

Componente:

ActivitySelector

Se generan sugerencias según:

tripType
destination
weather

Ejemplo beach:

snorkeling
diving
boat tours
surf
beach clubs

Ejemplo snow:

ski
snowboard
sledding

El usuario puede seleccionar varias.

SCREEN 7
Perfil de Viaje

Opciones:

solo
partner
friends
family

Componente:

TravelerSelector
SCREEN 8
Estilo de Equipaje

Opciones:

light traveler
normal
heavy gear

Componente:

PackingStyleSelector
SCREEN 9
Motor de Packing

Función principal:

generatePackingList(context)

Inputs:

tripType
weather
activities
duration
travelerType
packingStyle

Output:

packingList
SCREEN 10
Trip Summary

Hero card.

Trip to Cancún
Beach trip
May 4 – May 10
28°C sunny

Botón:

ENTER TRIP

Ruta:

/trip/dashboard
3. DASHBOARD DEL VIAJE

Pantalla principal.

Componentes:

TripHeroCard
PackingProgress
QuickTools
BeforeYouGo
DuringTrip
HERO CARD

Datos:

destination
weather
trip duration
trip type
PACKING PROGRESS
PackingChecklist

Progreso:

items packed / total items
QUICK TOOLS

Tarjetas:

Translator
Currency Converter
Split Bill
Adapters
BEFORE YOU GO

Cards:

airport rules
local laws
documents
travel tips
DURING TRIP
local phrases
tips
activities
emergency info
4. HERRAMIENTAS DEL VIAJE

Cada tool es módulo independiente.

TRANSLATOR

Pantalla:

TranslatorScreen

Funciones:

translateText()
quickPhrases()
speechToText()
CURRENCY

Pantalla:

CurrencyConverter

API:

ExchangeRate API
SPLIT BILL

Pantalla:

SplitBill

Lógica:

addPeople()
addItems()
calculateSplit()
ADAPTERS

Pantalla:

PowerAdapters

Basado en:

country
5. MOTOR DE PACKING

Archivo:

src/engines/packingEngine.ts

Función:

export function generatePackingList(context: TripContext) {

  let list = []

  if(context.tripType === "beach") {
    list.push("Swimsuits")
    list.push("Flip flops")
    list.push("Sunscreen")
  }

  if(context.weather.weatherType === "cold") {
    list.push("Thermal base layer")
    list.push("Jacket")
  }

  if(context.activities.includes("snorkeling")) {
    list.push("Snorkel gear")
    list.push("Dry bag")
  }

  return list
}
6. ESTRUCTURA DEL PROYECTO
src
 ├── context
 │    TripContext.tsx
 │
 ├── engines
 │    packingEngine.ts
 │    activityEngine.ts
 │    weatherEngine.ts
 │
 ├── components
 │    TripTypeSelector
 │    DestinationModal
 │    DatePicker
 │    ActivitySelector
 │    TravelerSelector
 │    PackingChecklist
 │    TripHeroCard
 │
 ├── screens
 │    Splash
 │    TripType
 │    Destination
 │    Dates
 │    Activities
 │    Traveler
 │    PackingStyle
 │    Summary
 │    Dashboard
 │
 ├── tools
 │    Translator
 │    Currency
 │    SplitBill
 │    Adapters
7. ANIMACIONES

Bibliotecas:

Framer Motion
Lottie

Animaciones clave:

moduleTransition
cardHover
glassModalOpen
navIndicatorSlide

Ejemplo:

plane crossing screen
campfire ignition
coin flip
map pin drop

Duración:

300ms — 700ms
8. NAVEGACIÓN

Sistema:

React Router

Rutas:

/onboarding/trip-type
/onboarding/destination
/onboarding/dates
/onboarding/activities
/onboarding/traveler
/onboarding/packing-style
/onboarding/summary

/trip/dashboard
/trip/packing
/trip/translator
/trip/currency
/trip/split
/trip/adapters
9. ESTADOS DEL VIAJE
planning
active
completed

Cuando llega la fecha:

tripStatus = active

El dashboard cambia.

10. SISTEMA DE DISEÑO (LO QUE TE GUSTA)

Estilo:

Soft premium travel UI

Características:

glass modal
soft shadows
rounded surfaces
iconography illustrated
micro animations

Colores:

sand
ocean blue
coral accent
off white
ORDEN FINAL PARA CODEX
1 create TripContext
2 implement TripType screen
3 build DestinationModal glass
4 integrate weather API
5 implement ActivitySelector
6 implement TravelerSelector
7 build PackingEngine
8 generate packing list
9 build TripDashboard
10 implement tools modules
11 add animations

ARQUITECTURA COMPLETA DE VIAZA
(Blueprint de producto + UI + lógica)

Voy a dividirlo en 6 capas para que Codex o Sonnet no se vuelvan a perder.

1 UX FLOW
2 UI SYSTEM
3 TRIP INTELLIGENCE ENGINE
4 PACKING ENGINE
5 TRAVEL TOOLS
6 APP ARCHITECTURE
1. UX FLOW (EL VIAJE DEL USUARIO)

El flujo debe sentirse como preparar una aventura, no llenar un SAT.

Entrada
Splash
↓
Tipo de viaje
↓
Destino
↓
Fechas
↓
Actividades
↓
Perfil de viaje
↓
Packing inteligente
↓
Trip Dashboard
2. PANTALLAS PRINCIPALES
1. Splash

Visual:

fondo minimal

animación

pin → ruta → avión

Duración

900ms

Botón:

START YOUR TRIP
2. Tipo de viaje

UI estilo Pinterest que mandaste.

Tarjetas grandes.

🏖 Beach
🏙 City
🏔 Mountain
🎿 Snow
🏕 Camping
🚗 Roadtrip
💼 Work
🌍 Adventure

Diseño:

tarjetas flotantes

iconos grandes

animación hover

sombras suaves

3. Modal cristal destino

Al elegir tipo de viaje aparece glass modal.

Search destination

UI:

campo grande

lista scroll

Ejemplo beach:

Cancún
Tulum
Ibiza
Phuket
Bora Bora

Ejemplo montaña:

Aspen
Zermatt
Banff
Chamonix
4. Fechas

Calendario elegante.

Campos:

departure
return

Sistema calcula:

trip duration
5. Actividades

Tarjetas seleccionables.

Ejemplo playa:

Snorkeling
Diving
Surf
Boat tours
Beach clubs

Ejemplo nieve:

Ski
Snowboard
Snow hiking
6. Perfil de viaje

Opciones:

Solo
Couple
Friends
Family
Kids
7. Estilo de equipaje
Light traveler
Normal
Heavy gear
8. Motor de viaje (automático)

El sistema ahora calcula:

clima
idioma
moneda
reglas locales
adaptadores
actividades sugeridas
packing list
9. Resumen del viaje

Hero card.

Trip to Cancún
May 4 — May 10
Beach Trip
28°C Sunny

Botón:

ENTER TRIP
3. TRIP DASHBOARD

Pantalla principal.

Hero card
Cancún 🇲🇽
28°C
7 days
Beach Trip
Packing progress
65% packed
Quick tools

Tarjetas:

Translator
Currency
Split bill
Adapters
Before you go
Airport rules
Local laws
Travel tips
Documents
During trip
Local tips
Saved activities
Emergency info
4. MOTOR DE INTELIGENCIA DE VIAJE

Archivo

tripEngine.ts

Función:

buildTripContext()

Inputs:

tripType
destination
dates
activities
travelerType
packingStyle

Outputs:

weatherForecast
currency
language
packingList
toolsEnabled
5. MOTOR DE PACKING

Archivo

packingEngine.ts

Función

generatePackingList(context)

Reglas:

trip_type_rules
weather_rules
activity_rules
duration_rules

Ejemplo:

Beach + snorkeling:

swimsuits
reef-safe sunscreen
snorkel gear
beach towel
flip flops
dry bag
hat

Snow:

thermal layers
ski jacket
gloves
goggles
snow boots
neck warmer
6. MOTOR DE ACTIVIDADES

Archivo

activityEngine.ts

Función:

suggestActivities(context)

Inputs:

tripType
destination
weather
7. TRAVEL TOOLS

Módulos independientes.

translator
currency
split bill
adapters
Translator

Funciones:

translateText()
speechToText()
quickPhrases()
Currency

API

ExchangeRate API
Split Bill

Funciones:

addPeople()
addItems()
calculateSplit()
Adapters

Basado en:

country
8. ARQUITECTURA REACT

Estructura del proyecto.

src
 ├ context
 │  TripContext.tsx
 │
 ├ engines
 │  tripEngine.ts
 │  packingEngine.ts
 │  activityEngine.ts
 │  weatherEngine.ts
 │
 ├ components
 │  TripTypeSelector
 │  DestinationModal
 │  DatePicker
 │  ActivitySelector
 │  TravelerSelector
 │  PackingChecklist
 │  TripHeroCard
 │
 ├ screens
 │  Splash
 │  TripType
 │  Destination
 │  Dates
 │  Activities
 │  Traveler
 │  PackingStyle
 │  Summary
 │  Dashboard
 │
 ├ tools
 │  Translator
 │  Currency
 │  SplitBill
 │  Adapters
9. SISTEMA VISUAL (ESTILO PINTEREST)

Estilo:

Soft premium travel UI

Características:

tarjetas flotantes
iconos ilustrados
sombras suaves
botones redondeados
gradientes suaves
glass modal
micro animaciones

Evitar:

dashboards planos
formularios aburridos
UI gris corporativa
10. ANIMACIONES

Bibliotecas

Framer Motion
Lottie

Animaciones:

plane crossing
map pin drop
campfire glow
coin flip
card lift
modal glass open

Duración

300ms — 700ms
11. ORDEN PARA CODEX

Esto evita que improvise.

1 create TripContext
2 build TripTypeSelector
3 build DestinationModal glass
4 integrate weather API
5 implement ActivitySelector
6 implement TravelerSelector
7 implement PackingEngine
8 generate packing list
9 build TripDashboard
10 implement travel tools
11 add animations

---

# ESTADO REAL DEL PROYECTO — 12 DE MARZO DE 2026

## STACK ACTUAL REAL

| Tecnología | Estado |
|---|---|
| React + Vite + TypeScript | Funcionando |
| Tailwind CSS | Funcionando |
| Framer Motion | Funcionando |
| React Router v6 | Funcionando |
| Zustand + persist | Funcionando |
| i18next (en, es, pt, fr, de) | Funcionando |
| Capacitor | Instalado, no compilado aún |
| ThemeProvider dinámico | Funcionando |

## APIs CONECTADAS (KEYS EN .env)

| API | Key | Estado |
|---|---|---|
| OpenWeatherMap | `VITE_OPENWEATHERMAP_KEY` | Conectada |
| ExchangeRate-API | `VITE_EXCHANGE_RATE_KEY` | Conectada |
| AviationStack | `VITE_AVIATIONSTACK_KEY` | Conectada |
| Google Maps | `VITE_GOOGLE_MAPS_KEY` | Conectada (deeplinks + estática) |
| Open-Meteo | sin key | Funcionando (forecast) |
| Nominatim/OSM | sin key | Funcionando (geocoding) |

## MODELO DE DATOS REAL (trip.ts actualizado)

El tipo `Trip` en producción tiene más campos que el manifiesto original:

```typescript
// CAMPOS ADICIONALES vs. manifiesto original
TravelType: agrega 'snow' | 'roadtrip' | 'adventure' (el manifiesto solo tenía 5)
TravelerGroup: agrega 'family_baby' (bebé/infante)
TransportType: 'flight' | 'car' | 'bus' | 'cruise' | 'train' (NUEVO — no estaba en manifiesto)
PackingStyle: 'light' | 'normal' | 'heavy' (implementado)
WeatherForecast: objeto completo con avgTemp, minTemp, maxTemp, rainProbability, weatherType, description
tripStatus: 'planning' | 'active' | 'completed' (implementado)
numberOfAdults: number (NUEVO)
numberOfKids: number (NUEVO)
// Campos de transporte completos:
originCity, originLat, originLon, flightNumber, airline, airportCode,
busTerminal, trainStation, cruisePort (NUEVO)
```

## FLUJO DE ONBOARDING REAL (rutas implementadas)

```
/splash
  ↓ (1.5s automático)
/intro  (3 slides)
  ↓ (botón Start)
/auth/login  o  /auth/register
  ↓ (login exitoso)
/onboarding/travel-type
  ↓
/onboarding/destination  (Nominatim autocomplete)
  ↓
/onboarding/dates
  ↓
/onboarding/transport   ← NUEVO (no estaba en manifiesto original)
  ↓
/onboarding/smart-detection  ← NUEVO (API OpenWeatherMap + Open-Meteo automático)
  ↓
/onboarding/activities
  ↓
/onboarding/travelers  (stepper adultos + niños)
  ↓
/onboarding/preferences  (packingStyle, hasLaptop, travelLight)
  ↓
/onboarding/laundry
  ↓
/onboarding/summary
  ↓ (crear viaje)
/home
```

## MOTOR DE PACKING REAL (vs. manifiesto)

El manifiesto describía un engine simple. Lo que tenemos implementado es **mucho más avanzado**:

### packingRules.ts — Reglas reales implementadas:
- `baseRuleItems` — ítems que siempre van (documentos, higiene, electronics básicos)
- `travelTypeItems` — por tipo: beach (13 ítems), mountain (13), city (7), camping (12), work (10), snow (10), roadtrip (8), adventure (9)
- `travelerGroupOverlay` — por grupo de viajero:
  - `solo.beach` — vestido, cover-up, SPF facial, libro, maquillaje, sandalia vestir
  - `couple.beach` — ídem + juegos de playa
  - `family.beach` — traje kids x2, rashguard kids, bloqueador infantil, juguetes, carpa sombra, botiquín niños
  - `family_baby.beach` — pañales x30, toallitas x3, bloqueador bebé, sombra bebé, traje bebé x2, moisés, fórmula, porta bebé
  - `friends.beach` — bocina portátil, juegos de playa, hielera, outfit nocturno x2
  - (y overlays similares para mountain, city, snow, roadtrip, adventure, work)
- `climateItems` — por clima: hot, mild, cold, rainy
- `activityItems` — por actividad: snorkeling, surfing, kayaking, hiking, skiing, snowboard, photography, yoga, nightlife, shopping, etc. (23 actividades)

### packingGenerator.ts — Lógica real:
1. `baseRuleItems` — siempre
2. `travelTypeItems[travelType]` — por tipo
3. `travelerGroupOverlay[travelerGroup][travelType]` — por perfil
4. `climateItems[climate]` — por clima
5. `activityItems[activityId]` para cada actividad seleccionada
6. `laundryPlanner` — cantidad de ropa según ciclo de lavado
7. Multiplica cantidades por `numberOfAdults + numberOfKids`
8. Deduplica por `labelKey`

## SERVICIOS REALES IMPLEMENTADOS

| Servicio | Archivo | Estado |
|---|---|---|
| currencyService | `src/modules/currency/services/currencyService.ts` | API real con cache 1h |
| weatherEngine | `src/engines/weatherEngine.ts` | Open-Meteo + OWM en paralelo |
| destinationSearch | `src/engines/destinationSearch.ts` | Nominatim OSM |
| activityEngine | `src/engines/activityEngine.ts` | Catálogo de 23+ actividades con íconos duotone SVG |
| airlineService | `src/modules/airline/services/airlineService.ts` | AviationStack + fallback data local |
| mapsService | `src/services/api/mapsService.ts` | Google Maps deeplinks (Waze/Apple/Google) |
| laundryPlanner | `src/modules/laundry/utils/laundryPlanner.ts` | Algoritmo ciclos de lavado |

## PANTALLAS/MÓDULOS — ESTADO REAL

### Onboarding
| Pantalla | Estado | Notas |
|---|---|---|
| SplashPage | Implementada — diseño premium | Animación SVG pin→ruta→avión, fondo `#12212E` |
| IntroPage | Implementada — 3 slides premium | Ilustraciones SVG 320x320, gradientes por slide, AnimatePresence |
| OnboardingWelcomePage | Implementada | Hero oscuro, feature cards glass |
| LoginPage | Implementada — neumorfismo | Card elevada, inputs con sombra inset, logo-blue.png |
| RegisterPage | Implementada | Mismo estilo que Login |
| TravelTypePage | Implementada | 8 tipos, cards grandes, subtítulos descriptivos, sin emojis |
| DestinationPage | Implementada | Nominatim autocomplete, guarda lat/lon/currency/language |
| DatePickerPage | Implementada | Selector departure + return, calcula duración |
| TransportPage | Implementada | 5 medios de transporte, sub-formularios contextuales, estimación Haversine |
| SmartTripDetectionPage | Implementada | OWM + Open-Meteo automático en paralelo |
| ActivitiesPage | Implementada | Cards por travelType, íconos duotone SVG |
| TravelersPage | Implementada | Stepper adultos (1-8) + niños (0-6), 5 grupos |
| PreferencesPage | Implementada | packingStyle, hasLaptop, travelLight |
| LaundryPage | Implementada | 3 modos de lavado |
| OnboardingSummaryPage | Implementada | Resumen completo con todos los datos del viaje |

### App principal
| Pantalla | Estado | Notas |
|---|---|---|
| HomePage | Implementada | Hero dinámico por tipo de viaje, clima, packing progress, quick tools 2x2, before you go |
| TripDetailsPage | Implementada — BÁSICA | Muestra datos del viaje, botones a módulos |
| PackingChecklistPage | Implementada | Accordions colapsables, progreso circular, FAB agregar ítem, contexto del viaje en header |
| AirlineRulesPage | Implementada — 2 tabs | Tab "Mi vuelo" con AviationStack en tiempo real + tab "Equipaje" con reglas |
| AllowedItemsPage | Implementada | Buscador Nominatim, estados cabina/documentado |
| AdapterGuidePage | Implementada | Dataset de enchufes por país |
| DepartureReminderPage | Implementada — BÁSICA | Cálculo hora salida, stub para notificación nativa |
| TranslatorPage | Implementada — BÁSICA | Mock translate, selector idiomas |
| QuickPhrasesPage | Implementada | Dataset de frases por categoría |
| CurrencyConverterPage | Implementada | API real ExchangeRate, 15 monedas, swap |
| SplitBillPage | Implementada | Modo simple + avanzado por consumo |
| LocalTipsPage | Implementada | Dataset por categoría (safety, transport, etc.) |
| SurvivalTipsPage | Implementada | Dataset camping/montaña/playa/naturaleza |
| SettingsPage | Implementada | Selector idioma (5 idiomas), link a Premium |
| PremiumPage | Implementada — PLACEHOLDER | Sin paywall real |

### Módulos FALTANTES vs. manifiesto
| Módulo | Estado | Prioridad |
|---|---|---|
| CountryPickerPage | NO existe | Alta — va entre TravelType y Destination |
| ProfilePage | Existe como esqueleto | Media |
| TripsList / múltiples viajes | No implementado | Media |
| LaundryPage standalone (fuera de onboarding) | No tiene UI propia | Media |
| Modo offline | NO — Fase 2 | Baja |
| Scan My Bag | NO — Fase 3 | Baja |
| IA/recomendaciones | NO — Fase 3 | Baja |
| Compartir viaje/lista | NO — Fase 2 | Baja |

## COMPONENTES UI — ESTADO REAL

### Implementados
- `AppButton.tsx`
- `AppCard.tsx`
- `AppHeader.tsx`
- `AppInput.tsx`
- `AppSelect.tsx`
- `BottomNav.tsx` (pill flotante con bubble naranja + íconos duotone)
- `VIcon.tsx`

### Faltantes vs. manifiesto
- `AppChip.tsx` — NO existe (chips se hacen inline)
- `ProgressBar.tsx` — NO existe (progreso se hace inline)
- `SectionTitle.tsx` — NO existe (se hace inline)
- `EmptyState.tsx` — NO existe (se hace inline por pantalla)
- `ModalSheet.tsx` — NO existe
- Componentes del directorio `travel/` — vacío (TravelTypeCard, PackingItemRow, etc. se hacen inline)

## SERVICIOS DEVICE — PENDIENTES

El manifiesto pide:
- `locationService.ts` — NO implementado
- `shareService.ts` — NO implementado
- `hapticsService.ts` — NO implementado
- `notificationsService.ts` — NO implementado (solo stub en DepartureReminderPage)
- `storageService.ts` — NO implementado (Zustand persist hace su trabajo pero no hay wrapper explícito)

## PENDIENTES CRÍTICOS (PRÓXIMA SESIÓN)

En orden de impacto para el usuario:

1. **HomeScreen** — No muestra datos en tiempo real del viaje activo: días restantes, clima real, moneda del destino automática
2. **CountryPickerPage** — Pantalla `/onboarding/country` falta. El flujo correcto es: TravelType → País → Destino filtrado por país+tipo
3. **DestinationPage — búsqueda mejorada** — originCity no se geocodifica para TransportPage (tiempo estimado no funciona si no hay lat/lon de origen)
4. **PackingChecklist — generación automática** — Si `packingItems` está vacío para un `currentTripId`, no se generan automáticamente al entrar
5. **SummaryPage — transporte completo** — No muestra tipo de transporte, número de vuelo, aerolínea en el resumen final
6. **TripDetailsPage** — Muy básica, no tiene diseño premium
7. **Múltiples viajes** — No hay pantalla de lista de viajes
8. **DepartureReminderPage** — Solo calcula la hora, no crea recordatorio nativo real
9. **TranslatorPage** — Solo mock, no usa la API real de traducción
10. **HomeScreen tips** — El carousel de tips en Home no está filtrando por destino del viaje activo

## DECISIONES DE ARQUITECTURA TOMADAS (no documentadas en manifiesto original)

1. **Auth simulado** — Login/Register guardan en Zustand persist sin backend real. Preparado para conectar a Firebase/Supabase en Fase 2.
2. **`onboardingCompleted` flag** — Previene bypass del onboarding si el store persiste sesión anterior.
3. **`onboardingDraft`** — El draft se mantiene en el store durante el onboarding y se convierte en `Trip` al final.
4. **`TransportType`** — Campo adicional al manifiesto para el medio de traslado al destino. Crítico para generar ruta Maps/Waze y para saber si se necesitan reglas de aerolínea.
5. **`family_baby`** — Nuevo grupo de viajero para viajes con bebés. Genera una maleta completamente diferente.
6. **Íconos duotone SVG inline** — En lugar de una librería de íconos externa, todos los íconos son SVG inline con estilo duotone usando la paleta VIAZA. Más control, cero dependencias externas.
7. **packingRules bidimensional** — `travelType × travelerGroup` en vez del enfoque unidimensional del manifiesto.

---

*Manifiesto actualizado: 12 de marzo de 2026*
 adicionales Manifiesto 

 MANIFIESTO DE PRODUCTO
VIAZA — Travel Intelligence Companion
Visión

VIAZA es un asistente inteligente de planificación y acompañamiento de viajes.
No es una app de turismo.
No es una app de vuelos.

Es una compañera de viaje que ayuda al usuario antes, durante y después del viaje.

VIAZA analiza:

destino

fechas

clima

tipo de viaje

actividades

transporte

acompañantes

y con eso planifica automáticamente todo lo necesario.

Desde la maleta hasta las rutas, actividades y recomendaciones.

OBJETIVO DEL PRODUCTO

Convertirse en el centro de planificación de cualquier viaje.

Que el usuario piense:

“Si no abro VIAZA, no estoy listo para viajar”.

EXPERIENCIA PRINCIPAL

El flujo completo del usuario se divide en 5 etapas:

1️⃣ Crear viaje
2️⃣ Analizar destino
3️⃣ Preparar viaje
4️⃣ Asistencia durante el viaje
5️⃣ Historial del viaje

1 CREAR VIAJE

Pantalla inicial.

Botón principal:

+ Crear viaje

El usuario configura:

Tipo de viaje

Playa

Ciudad

Montaña

Naturaleza

Trabajo

Road trip

Crucero

Destino

Input inteligente.

Ejemplo:

Cancun

El sistema muestra lista:

Cancún, México
Cancún Airport (CUN)
Cancún Hotel Zone

Usa:

Google Places API

Geocoding API

El usuario selecciona destino.

Fechas del viaje

Selecciona:

fecha salida
fecha regreso

Con esto se calcula:

duración del viaje

clima esperado

temporada turística

Tipo de compañía
Solo
Pareja
Amigos
Familia
Familia con niños
Familia con bebé
Grupo
Trabajo

Esto afecta:

equipaje

actividades

logística

Transporte

Opciones:

Avión
Auto
Autobús
Crucero
Aún no decidido
2 DASHBOARD DEL VIAJE

Una vez creado el viaje, VIAZA genera automáticamente un Dashboard del viaje.

Pantalla con tarjetas inteligentes.

Cada tarjeta representa algo que el usuario debe preparar.

Ejemplo de tarjetas:

Clima esperado
Actividades recomendadas
Checklist de maleta
Transporte y rutas
Reservas pendientes
Costos aproximados
Lugares populares
Alertas del viaje

Diseño:

Tarjetas cuadradas con iconos elegantes.

Ejemplo:

🏖 Clima
🎒 Maleta
🚗 Ruta
🎟 Actividades
🍽 Restaurantes
🌙 Vida nocturna

3 TARJETA CLIMA

La app calcula automáticamente el clima del destino según las fechas.

Datos:

temperatura promedio

probabilidad de lluvia

humedad

viento

sensación térmica

API:

Open Meteo

Ejemplo de resultado:

Cancún
28°C promedio
70% humedad
Posibilidad de lluvia ligera

Esto afecta directamente:

recomendaciones de ropa
actividades sugeridas
4 TARJETA ACTIVIDADES

VIAZA recomienda actividades según:

tipo de viaje

destino

clima

compañía

Ejemplo Cancún:

Actividades:

Buceo
Snorkel
Xcaret
Playa Delfines
Isla Mujeres
Cenotes

Cada actividad muestra:

descripción

costo aproximado

reseñas

duración

distancia

Ejemplo:

Xcaret

Costo promedio:
$2,800 MXN

Tiempo recomendado:
6 a 8 horas

Tip VIAZA:
Compra boletos en línea para evitar filas.

Fila promedio en taquilla:
20 a 30 minutos
5 TARJETA TRANSPORTE

Dependiendo del tipo elegido.

Avión

Se muestra:

aeropuerto destino

terminal

hora estimada

estado del vuelo

API:

AviationStack
Auto

Se calcula:

ruta

distancia

tiempo estimado

costo aproximado de gasolina

casetas

API:

Google Maps Directions
6 TARJETA MALETA INTELIGENTE

Una de las funciones principales de VIAZA.

El sistema calcula automáticamente qué llevar.

Basado en:

clima

duración

actividades

compañía

Ejemplo:

Viaje a Cancún
5 días
Clima 28°C
Actividades playa

Resultado:

Checklist:

5 playeras
2 shorts
1 sandalias
1 tenis
1 traje de baño
1 bloqueador solar
1 lentes de sol
Maleta por persona

El usuario puede agregar viajeros:

Adulto
Niño
Bebé

Cada uno tiene su maleta.

Ejemplo:

Maleta mamá
Maleta papá
Maleta niño
Maleta bebé
7 TARJETA RUTAS

Para viajes por tierra.

Muestra:

ruta
distancia
tiempo estimado

Ejemplo:

CDMX → Cancún

1,620 km
18 horas

También permite abrir:

Google Maps
Waze
8 ALERTAS INTELIGENTES

VIAZA anticipa situaciones.

Ejemplo:

Temporada alta
Compra boletos anticipadamente
Clima lluvioso
Lleva impermeable
Actividad popular
Compra entrada antes
9 DURANTE EL VIAJE

La app sigue funcionando.

Ofrece:

mapas
lugares cercanos
restaurantes
vida nocturna
clima actual
10 HISTORIAL DE VIAJES

Cuando el viaje termina:

El viaje se guarda automáticamente.

El usuario puede ver:

viajes pasados
destinos visitados
actividades realizadas

Pantalla:

Historial de viajes

Ejemplo:

Cancún 2026
Puerto Vallarta 2025
Nueva York 2024
11 NUEVO VIAJE

Siempre visible:

+ Crear nuevo viaje
FILOSOFÍA DE VIAZA

La app debe sentirse como:

tu compañera de viaje

Debe ayudar a:

planear

anticipar

organizar

disfrutar

PRINCIPIOS DE DISEÑO

Interfaz limpia.

Inspiración:

travel minimal

tarjetas elegantes

iconos claros

animaciones suaves

Ejemplos:

avión
fogata
torre eiffel

STACK TECNOLÓGICO

Frontend:

React
Vite
Capacitor

APIs:

Google Maps
Open Meteo
ExchangeRate
AviationStack
Nominatim
Overpass
OBJETIVO FINAL

Que VIAZA se convierta en:

tu asistente personal de viajes

Patty, te digo algo importante antes de cerrar.

Si esto se construye bien, VIAZA no compite con apps de turismo.

Compite con:

TripIt

Google Travel

Kayak

pero con un enfoque mucho más humano.

VIAZA
Núcleo funcional actualizado
Maleta inteligente + pronóstico útil + verificación visual
VISIÓN CENTRAL

VIAZA no es una app que solo diga “lleva 5 playeras”.
VIAZA debe ayudar al usuario a:

entender el clima real de cada día del viaje

decidir qué llevar según ese clima y sus actividades

organizar la maleta por categorías

confirmar visualmente qué sí metió

recibir sugerencias de acomodo dentro de la maleta

cerrar la maleta con mayor seguridad y menos estrés

La app debe sentirse como:

“tu copiloto para no olvidar, no sobreempacar y acomodar mejor.”

1. PRONÓSTICO DEL VIAJE COMPLETO
Objetivo

El clima no se debe mostrar como un dato genérico del viaje.
Debe mostrarse por día y, si es posible, por franja horaria:

mañana

tarde

noche

Regla funcional

Si el viaje dura 14 días, VIAZA debe mostrar los 14 días completos con clima proyectado.

Componente
Modal cristal / panel expandible:

Clima esperado

Contenido por cada día:

Día 1 — 12 mayo
Mañana: 24°C / soleado
Tarde: 29°C / húmedo
Noche: 26°C / lluvia ligera

Día 2 — 13 mayo
Mañana: 25°C / soleado
Tarde: 30°C / calor intenso
Noche: 27°C / despejado
Qué debe calcular el sistema

A partir del pronóstico diario, VIAZA debe identificar patrones:

días de lluvia

noches frías

días de calor fuerte

humedad alta

viento

exposición solar fuerte

Para qué sirve

Ese pronóstico no es decorativo. Alimenta directamente:

lista de ropa

accesorios

calzado

protección solar

impermeables

ropa de noche

equipo especial

Insight de producto

No mostrar solo “28°C promedio”.
Mostrar:

qué clima tendrá realmente

cuántos días de cada tipo

qué impacto tiene en la maleta

Ejemplo:

Tu viaje tendrá:
- 8 días calurosos
- 3 días con lluvia ligera
- 4 noches húmedas y templadas

Recomendación:
Incluye 2 cambios ligeros extra, impermeable ligero y sandalias resistentes al agua.
2. LA MALETA ES EL CORAZÓN DE VIAZA
Declaración

La maleta no debe ser una lista lineal aburrida.
Debe ser un sistema de categorías, verificación y acomodo.

3. ESTRUCTURA DE LA MALETA INTELIGENTE
Vista principal de maleta

Pantalla: Mi maleta

Se organiza por categorías dinámicas, según el viaje:

Categorías base

playeras / tops

pantalones / shorts / faldas

chamarras / sacos / abrigos

ropa interior

calzado

higiene personal

tecnología

documentos

medicamentos

extras del viaje

accesorios de actividad

Categorías variables según contexto

Si es playa:

traje de baño

bloqueador

sandalias

dry bag

Si es montaña:

chamarra térmica

botas

capas

guantes

Si es trabajo:

saco

laptop

cargadores

documentos de junta

4. SISTEMA DE ITEMS POR CATEGORÍA

Cada item debe tener:

nombre

cantidad sugerida

razón por la que se sugiere

estado

evidencia opcional

prioridad

Ejemplo
Playeras

6 playeras ligeras

motivo: 7 días de calor + 1 día de margen

Impermeable ligero

1 pieza

motivo: 3 tardes con lluvia pronosticada

Sandalias

1 par

motivo: destino playa + humedad alta

5. EVIDENCIA VISUAL OPCIONAL

Aquí está el factor “inteligente” que hace que se sienta diferente.

Regla

Cada item puede tener un botón:

Tomar foto de evidencia

La foto no es obligatoria para marcar el item como preparado, pero sí agrega seguridad visual.

Estados posibles de un item

sugerido

marcado como listo

con evidencia visual

pendiente importante

alerta

Ejemplo

Playeras

sugeridas: 6

listas: 5

evidencia: sí

Impermeable

sugerido: 1

listo: no

evidencia: no

estado: alerta por lluvia en pronóstico

6. ALERTAS INTELIGENTES DE LA MALETA

La app debe detectar inconsistencias.

Ejemplos
Te faltan 2 items importantes para días lluviosos.
Aún no has marcado bloqueador, aunque tu viaje tiene índice UV alto.
No has agregado abrigo ligero para 4 noches templadas.
Has marcado 3 pares de zapatos para un viaje de 4 días. ¿Quieres revisar si vas sobreempacando?
7. FOTO DE LA MALETA COMPLETA

Aquí está la función premium poderosa.

Paso

Cuando el usuario ya preparó buena parte de su equipaje, puede usar:

Analizar mi maleta

Opción 1:

subir foto de maleta abierta

Opción 2:

seleccionar tamaño de maleta antes de la foto

8. TAMAÑO DE MALETA

Antes del análisis visual, VIAZA pregunta:

¿Qué tipo de maleta usarás?

mochila

carry-on / cabina

maleta mediana

maleta grande

backpacking

equipaje mixto

También puede pedir medida opcional:

chica

mediana

grande

Esto sirve para recomendar:

distribución

qué va más accesible

qué puede ir al fondo

si el volumen está rebasado

9. ASISTENTE DE ACOMODO DE MALETA

Esta es la joya.

Objetivo

No solo decir qué llevar.
También sugerir cómo acomodarlo.

Lógica del acomodo

VIAZA debe sugerir por zonas:

Lado izquierdo

ropa enrollada

prendas blandas

playeras

shorts

Lado derecho

calzado

neceser

accesorios compactos

Centro

objetos estructurales

sacos doblados

pouch de tecnología

objetos que no quieres que se aplasten

Acceso rápido / tapa / bolsillo superior

documentos

medicamentos

cargador

cepillo dental

power bank

audífonos

Ejemplo de recomendación
Para tu carry-on:
- lado izquierdo: ropa ligera enrollada
- lado derecho: sandalias + neceser + traje de baño
- centro: vestido / saco ligero
- bolsillo superior: cargador, documentos y medicamentos
10. FOTO FINAL DE MALETA COMPLETA

Después del acomodo, el usuario puede tomar una foto final.

Objetivo

guardar evidencia

comparar contra checklist

recibir recomendaciones de acceso y orden

Qué debe sugerir la app
Tu maleta parece bien distribuida.
Te recomendamos mover el neceser a la parte superior para acceso rápido.
Tus zapatos ocupan mucho volumen en el centro. Muévelos al costado para liberar espacio.
Los documentos no deberían ir en la maleta principal. Muévelos al bolso personal.
Nota realista

En MVP no prometemos visión computacional perfecta.
Podemos manejarlo en fases:

Fase MVP

foto solo como evidencia y memoria visual

recomendaciones guiadas según reglas y checklist

Fase V2

detección básica de categorías visuales

estimación de volumen

validaciones semiautomáticas

Fase V3

análisis más inteligente por IA visual

11. MALETA POR INTEGRANTE

Esto es importantísimo y sí te lo compro completo.

Si viaja familia

No debe existir una sola maleta global.
Debe haber una estructura por persona.

Ejemplo

Viaje a Cancún

mamá

papá

hijo

bebé

Cada uno tiene:

su perfil

su checklist

su maleta

su evidencia

Vista recomendada
Tabs o cards por integrante

Maleta Mamá

Maleta Papá

Maleta Niño

Maleta Bebé

Para bebé

La app debe activar módulos especiales:

pañales

fórmula

cobija

ropa extra

medicamentos

toallitas

snacks

12. VIAJE DE TRABAJO

Esto cambia el comportamiento del sistema.

Regla

No todos los viajes requieren maleta completa.
VIAZA debe permitir esto:

Tipo de viaje: Trabajo

Subopciones:

ida y vuelta el mismo día

con pernocta

con juntas / eventos

con laptop y documentos

viaje ejecutivo ligero

Resultado

Si es ida y vuelta sin equipaje, la app no fuerza maleta grande.
Activa:

documentos

ruta

clima

horarios

juntas / agenda

transportes

essentials rápidos

Ejemplo:

Viaje de trabajo de un día.
No se requiere maleta completa.
Checklist sugerido:
- laptop
- cargador
- documentos
- identificación
- audífonos
- agua / snack
13. DASHBOARD INTELIGENTE DEL VIAJE

El dashboard no debe ser solo informativo.
Debe ser operativo.

Módulos / tarjetas principales

clima esperado del viaje completo

maleta inteligente

actividades y reservas

transporte y rutas

costos aproximados

alertas importantes

integrantes / maletas

viaje activo / historial

Ejemplo de tarjetas cuadradas elegantes

🌤 Clima

🧳 Maleta

👨‍👩‍👧 Integrantes

🎟 Actividades

🚗 Ruta

📄 Documentos

🌙 Vida nocturna

🍽 Lugares / descanso

14. ACTIVIDADES CON CONTEXTO REAL

No basta poner “snorkeling”.
Debe aparecer con contexto útil.

Cada actividad puede incluir:

reseña breve

costo aproximado

duración

nivel de demanda

recomendación de compra anticipada

tip práctico

qué llevar para esa actividad

Ejemplo
Xcaret
Costo promedio: $2,800 MXN
Duración ideal: 1 día completo
Compra anticipada recomendada: sí
Fila estimada en taquilla: 20 a 30 min
Qué llevar:
- traje de baño
- sandalias
- bloqueador eco-friendly
- cambio de ropa

Y eso debe impactar la maleta:
si marca “Xcaret”, VIAZA añade esos elementos o los sugiere.

15. RELACIÓN ENTRE DASHBOARD Y MALETA

Todo debe alimentar la maleta.

Variables que alteran packing:

destino

duración

clima por día

compañía

integrantes

actividades

tipo de transporte

estilo de viaje

viaje de trabajo vs vacaciones

La maleta es el producto final de toda esa inteligencia.

16. CIERRE DEL EVENTO “MALETA COMPLETA”

Al final debe existir una pantalla de cierre:

Estado del viaje

maleta 85% lista

4 pendientes

2 alertas importantes

O:

Evento completado
Tu maleta está lista.
Has confirmado 92% de los artículos sugeridos.
Hay 1 alerta de revisión: documentos fuera de acceso rápido.
17. DESPUÉS DEL VIAJE

VIAZA debe guardar historial.

Historial del viaje

destino

fechas

clima vivido

actividades hechas

maletas usadas

fotos de evidencia

observaciones / aprendizajes

Objetivo

Que el siguiente viaje sea más fácil.

Ejemplo:

Tu viaje anterior a Cancún fue de 5 días.
Empacaste de más en calzado.
La próxima vez puedes reducir 1 par.

Eso sí es compañera de viaje.

18. DEFINICIÓN FINAL DEL PRODUCTO
VIAZA es:

Una app que:

entiende tu viaje

anticipa necesidades

te ayuda a empacar

te ayuda a acomodar

te ayuda a moverte

te acompaña durante el viaje

aprende de tus viajes pasados

VIAZA no es:

una simple checklist

una app solo de clima

una app solo de mapas

una app solo de turismo

19. PRIORIDADES DE CONSTRUCCIÓN
Fase 1

flujo correcto de viaje

clima por día

actividades

dashboard inteligente

maleta por categorías

maleta por integrante

fotos de evidencia por item

Fase 2

recomendación de acomodo por tamaño de maleta

foto final de maleta

sugerencias de acceso rápido

alertas inteligentes

Fase 3

análisis visual real de maleta por IA

optimización de acomodo automática

historial inteligente con aprendizaje

20. FRASE RECTORA DEL PRODUCTO

La maleta es el corazón de VIAZA.
Todo lo demás existe para ayudar a que el usuario llegue listo, ligero y sin olvidar lo importante.


APIs del proyecto — estado real
✅ YA TIENES LA KEY Y ESTÁ CONECTADA
API	Variable	Usada en	Estado
Open-Meteo	(sin key, gratis)	weatherEngine.ts → forecast del viaje	✅ Funcionando
Nominatim / OSM	(sin key, gratis)	destinationSearch.ts → autocomplete de destino	✅ Funcionando
Overpass / OSM	(sin key, gratis)	attractionService.ts → actividades sugeridas	✅ Funcionando
OpenWeatherMap	VITE_OPENWEATHERMAP_KEY ✅	weatherEngine.ts → condiciones actuales	✅ Key puesta, conectada
ExchangeRate-API	VITE_EXCHANGE_RATE_KEY ✅	currencyService.ts → tasas reales	✅ Key puesta, conectada
AviationStack	VITE_AVIATIONSTACK_KEY ✅	airlineService.ts → tracker de vuelo	✅ Key puesta, conectada
Google Maps	VITE_GOOGLE_MAPS_KEY ✅	mapsService.ts → static maps + deep links	✅ Key puesta, conectada
❌ TIENES LA KEY PERO NO ESTÁ CONECTADA AL CÓDIGO
API	Variable	Dónde debería usarse	Estado
OpenAI	VITE_OPENAI_API_KEY ✅	translateService.ts → traducción real	❌ El servicio devuelve mock — la key no se usa
Anthropic	VITE_ANTHROPIC_API_KEY ✅	(no usado en ningún archivo)	❌ No está conectado a nada
Groq	VITE_GROQ_API_KEY ✅	(no usado en ningún archivo)	❌ No está conectado a nada
⚠️ TIENES LA KEY PERO NUNCA SE USA EN PRODUCCIÓN
API	Variable	Motivo
Supabase	VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY ✅	El auth usa un store local falso (registeredUsers[] en Zustand). Supabase está configurado pero ningún archivo lo importa.



MANIFIESTO VIAZA — ACTUALIZACIÓN COMPLETA

Versión: 12 de marzo de 2026 — Documento para desarrollo




REGLAS ABSOLUTAS (NO NEGOCIABLES — NUNCA TOCAR)

CERO EMOJIS en la UI ni en el contenido de la app. CERO COLORES fuera de la paleta oficial. TIPOGRAFÍA: Questrial en toda la app, 100% sin excepción. TODO TEXTO vía i18n, nada hardcodeado en componentes. LÓGICA FUERA DE COMPONENTES, engines y utils separados. TIPADO FUERTE, TypeScript estricto en todo el proyecto. MOBILE-FIRST, diseñado para pantalla de celular. BUILD LIMPIO, verificar npm run build antes de cerrar sesión.




PALETA OFICIAL (INMUTABLE)

Token
Hex
Uso
Primary
#12212E
Fondos oscuros, textos principales, botones CTA
Secondary
#307082
Acentos, chips, íconos secundarios
Soft Teal
#6CA3A2
Acentos suaves, bordes, íconos terciarios
Background
#ECE7DC
Fondo general (arena/crema)
Accent
#EA9940
CTA, highlights, badges, capa base de iconos duotone
Error
#C0392B
Solo para estados de error — no usar en UI decorativa







SISTEMA DE ICONOS DUOTONE — ESPECIFICACIÓN COMPLETA

Este es el sistema visual central de VIAZA. Todos los iconos de la app siguen este estilo sin excepción.

Estructura de cada icono: Dos capas SVG superpuestas con un offset diagonal. La capa base es la forma principal en color #EA9940 (accent) con opacidad 100%. La capa superior es la misma forma o una forma complementaria en color #6CA3A2 o blanco con opacidad entre 55% y 70%, desplazada entre 4 y 8 píxeles hacia arriba-derecha o abajo-izquierda. El resultado es un icono con profundidad visual, sensación de volumen y personalidad sin recurrir a 3D real.

Regla de color por contexto: Cuando el icono aparece sobre fondo oscuro (#12212E), la capa base es #EA9940 y la capa superior es rgba(255,255,255,0.55). Cuando aparece sobre fondo claro (#ECE7DC), la capa base es #307082 y la capa superior es rgba(18,33,46,0.25). Cuando aparece dentro de una tarjeta de herramienta (quick tools), la capa base usa el color del módulo y la capa superior es siempre blanco semitransparente.

Tamaños estándar: 48×48px para tarjetas de dashboard, 32×32px para quick tools, 24×24px para listas y menús, 18×18px para chips y badges.

Iconos requeridos por módulo:

Módulo
Icono
Descripción del SVG
Maleta / Packing
Maleta cerrada
Cuerpo rectangular redondeado + asa en capa superior
Clima
Nube + sol
Sol naranja base + nube gris encima con offset
Actividades
Rayo / Zap
Triángulo naranja + rayo gris superpuesto
Transporte avión
Avión
Silueta naranja + ala gris encima
Transporte auto
Auto
Cuerpo naranja + ventanas grises encima
Ruta / Mapa
Map Pin
Pin naranja + sombra elipse gris debajo
Moneda
Moneda
Círculo naranja + símbolo gris encima
Traductor
Burbujas de chat
Burbuja naranja + burbuja gris con offset
Split Bill
División
Rectángulo naranja + línea divisoria gris
Adaptadores
Enchufe
Cuerpo naranja + pines grises encima
Tips locales
Bombilla
Bulbo naranja + destellos grises
Survival
Fuego / Llama
Llama naranja + punta gris encima
Recordatorio
Campana
Campana naranja + badajo gris
Perfil / Usuario
Silueta
Cuerpo naranja + cabeza gris con offset
Checklist
Check en caja
Caja naranja + checkmark gris
Foto evidencia
Cámara
Cuerpo naranja + lente gris
Historial
Reloj con flecha
Círculo naranja + manecillas grises
Nuevo viaje
Plus en círculo
Círculo naranja + cruz gris
Reglas aerolínea
Avión en caja
Caja naranja + avión gris encima
Documentos
Hoja doblada
Hoja naranja + esquina doblada gris







SISTEMA DE TARJETAS DEL DASHBOARD

Las tarjetas del dashboard son el elemento visual más importante de la app. Siguen el estilo de las imágenes de referencia: cuadradas, esquinas muy redondeadas (radius 24px), fondo blanco/surface con sombra suave, sin bordes duros.

Tarjeta estándar (1×1): 160×160px aprox. Icono duotone arriba a la izquierda (48×48px). Título en Questrial 600 debajo. Subtítulo o dato clave en Questrial 400 más pequeño. Sin bordes. Sombra: 0 4px 12px rgba(18,33,46,0.09).

Tarjeta ancha (2×1): Misma altura, doble ancho. Usada para progreso de maleta, clima hero, y resumen de viaje activo.

Tarjeta hero (full width): Ancho completo, altura 180px. Imagen de fondo del destino con overlay oscuro rgba(18,33,46,0.55). Texto blanco encima. Chips de datos (clima, moneda, idioma) en la parte inferior de la tarjeta.

Grid del dashboard: 2 columnas con gap de 12px. Las tarjetas hero y anchas ocupan las 2 columnas. Las tarjetas estándar se alternan en pares.




FLUJO COMPLETO DEL USUARIO — VERSIÓN DEFINITIVA

Etapa 0 — Splash e Intro

La app abre con una pantalla splash de fondo #12212E durante 900ms. El logo VIAZA aparece en el centro con una animación sutil: el punto del logo cae como un map pin. Inmediatamente después aparecen 3 slides de intro con swipe horizontal, cada uno con una ilustración SVG grande (320×320px), un título en Questrial 700 y un subtítulo en Questrial 400. El botón "Start my trip" en el tercer slide lleva al login.

Etapa 1 — Auth

Login y registro con diseño neumórfico. Card elevada, inputs con sombra inset, logo-blue.png sobre fondo claro. El auth en MVP usa Zustand persist. En Fase 2 se conecta a Supabase.

Etapa 2 — Onboarding inteligente (menos de 45 segundos)

El onboarding no es un formulario. Es un motor de decisión visual. Cada pantalla tiene una sola pregunta, respuesta visual con tarjetas grandes, y avanza automáticamente al seleccionar.

Paso 1 — Tipo de viaje. Grid 2×4 de tarjetas grandes con iconos duotone. Los 8 tipos: Beach, City, Mountain, Camping, Snow/Ski, Roadtrip, Work, Adventure. Al tocar una tarjeta se activa el tema visual del tipo de viaje y se guarda travelType.

Paso 2 — Destino. Input de búsqueda con autocomplete Nominatim. Al escribir "Cancun" aparece una lista: "Cancún, Quintana Roo, México", "Cancún Airport (CUN)", "Cancún Hotel Zone". El usuario toca el resultado y el sistema guarda automáticamente: destination, lat, lon, country, countryCode, currencyCode, languageCode, plugType. Este paso es el disparador de toda la inteligencia del viaje.

Paso 3 — Fechas. Selector de fecha de salida y regreso. El sistema calcula durationDays automáticamente y muestra "X días" en tiempo real. Al confirmar fechas, el sistema dispara en segundo plano la llamada a Open-Meteo para obtener el pronóstico completo del viaje.

Paso 4 — Transporte. 5 opciones con iconos duotone: Avión, Auto, Autobús, Crucero, Tren. Si elige Avión: sub-formulario con número de vuelo, aerolínea, aeropuerto. Si elige Auto: campo de ciudad de origen para calcular ruta y tiempo estimado con Haversine. Si elige Crucero: puerto de salida.

Paso 5 — Smart Detection (automático). Pantalla de carga elegante que muestra qué está detectando: clima esperado, moneda, idioma, tipo de enchufe. Los datos vienen de Open-Meteo + OpenWeatherMap en paralelo. Al terminar muestra un resumen tipo "card de inteligencia": temperatura promedio, descripción del clima, moneda del destino, idioma local, tipo de adaptador necesario.

Paso 6 — Actividades. Cards seleccionables generadas según travelType y destination. El usuario puede seleccionar múltiples. Cada actividad tiene icono duotone y subtítulo descriptivo. Estas selecciones alimentan directamente el motor de packing y el dashboard de actividades.

Paso 7 — Viajeros. Stepper de adultos (1-8) y niños (0-6). Selector de grupo: Solo, Pareja, Amigos, Familia, Familia con bebé. Este paso es crítico porque determina cuántas maletas se generan y qué módulos especiales se activan (módulo bebé).

Paso 8 — Preferencias. Tres toggles: "Llevo laptop" (agrega accesorios tech), "Viajo ligero" (fuerza packingStyle=light), "¿Lavarás ropa?" con 3 opciones (No / Lavandería / Lavadora).

Paso 9 — Resumen. Hero card con todos los datos del viaje. Botón grande "Crear mi viaje". Al tocar: se crea el Trip, se genera la packing list automáticamente, se redirige al Home/Dashboard.

Etapa 3 — Dashboard del viaje (el cockpit)

Esta es la pantalla principal de la app. No es un menú. Es el panel de control del viaje activo. Se construye con el grid de tarjetas cuadradas del sistema visual.

Estructura del dashboard (de arriba hacia abajo):

El header tiene el logo VIAZA a la izquierda y el ícono de perfil/settings a la derecha, sobre fondo #12212E. Debajo, la tarjeta hero del viaje activo ocupa el ancho completo: imagen de fondo del destino (foto real via Google Static Maps o imagen local por tipo de viaje), overlay oscuro, nombre del destino en Questrial 700 blanco, fechas y duración, chips de clima/moneda/idioma en la parte inferior de la tarjeta, botón "Ver viaje" en accent naranja.

Debajo de la hero card aparece el grid 2×2 de tarjetas de módulos activos. El orden y contenido de las tarjetas cambia según el tipo de viaje:

Tarjeta
Icono
Contenido
Clima
Nube+sol duotone
Temperatura del día, descripción, tap abre modal cristal con 14 días
Maleta
Maleta duotone
"X de Y ítems listos", barra de progreso, tap abre packing
Actividades
Rayo duotone
"X actividades seleccionadas", tap abre módulo actividades
Ruta
Map pin duotone
Tiempo estimado de viaje si es por tierra, o "Vuelo AM401" si es avión




Debajo del grid principal aparece la sección "Before you go" con 3 accesos en lista: Reglas de aerolínea, Qué puedo llevar en el avión, Recordatorio de salida. Cada ítem tiene su icono duotone a la izquierda y una flecha a la derecha.

Finalmente, la sección "Tips para tu destino" muestra un scroll horizontal de tarjetas de tips locales filtradas por el destino del viaje activo.

Etapa 4 — Módulo de Clima Completo

El clima no es un dato decorativo. Es el motor que alimenta la maleta.

Al tocar la tarjeta de clima del dashboard se abre un modal cristal (glass modal con backdrop blur) que muestra el pronóstico completo día por día durante toda la duración del viaje. Si el viaje es de 14 días, aparecen los 14 días. Cada día muestra tres franjas horarias: mañana, tarde y noche, con temperatura e ícono del estado del cielo.

El sistema calcula automáticamente patrones del viaje completo: cuántos días de lluvia, cuántas noches frías, cuántos días de calor fuerte, nivel de humedad promedio, índice UV máximo. Estos patrones se traducen directamente en alertas de maleta: "Tu viaje tendrá 3 tardes con lluvia — incluimos impermeable ligero en tu lista."

Etapa 5 — Módulo de Actividades con Contexto Real

Cada actividad seleccionada en el onboarding aparece en el dashboard con información de contexto real, no solo el nombre.

La tarjeta de cada actividad muestra: nombre de la actividad, descripción breve (2-3 líneas), costo aproximado en la moneda del destino, duración recomendada, nivel de demanda física (bajo/medio/alto), recomendación de compra anticipada (sí/no), tip práctico de VIAZA, y lista de ítems de maleta que requiere esa actividad.

Ejemplo — Xcaret (Cancún, beach trip):


Xcaret — Parque ecoarqueológico con actividades acuáticas y culturales.
Costo promedio: $2,800 MXN por persona.
Duración ideal: 1 día completo (8-10 horas).
Compra anticipada: Recomendada. Compra en línea en xcaret.com para evitar fila.
Fila en taquilla: 20-30 minutos en temporada alta.
Qué llevar: traje de baño, sandalias, bloqueador eco-friendly, cambio de ropa, efectivo para extras.
Impacto en maleta: agrega traje de baño extra, bloqueador eco, sandalias de agua.

Cuando el usuario marca una actividad como "confirmada", los ítems de esa actividad se agregan automáticamente a la packing list si no estaban ya.

El sistema también anticipa situaciones: si el usuario tiene seleccionado "Xcaret" pero no ha comprado boletos, aparece una alerta en el dashboard: "Aún no has comprado boletos para Xcaret. Temporada alta: compra con anticipación."

Etapa 6 — Módulo de Ruta y Transporte

Si el usuario viaja en auto, el módulo de ruta muestra: ciudad de origen, destino, distancia en km, tiempo estimado de manejo, costo aproximado de gasolina (calculado con precio promedio del país destino), número estimado de casetas. Botones para abrir Google Maps, Waze o Apple Maps directamente.

Si viaja en avión, el módulo muestra el estado del vuelo en tiempo real via AviationStack: número de vuelo, aerolínea, terminal de salida, gate, hora programada, hora estimada, delay si aplica. También muestra la hora recomendada de salida de casa hacia el aeropuerto (calculada con el departureCalculator).

Etapa 7 — La Maleta Inteligente (el corazón de VIAZA)

La maleta no es una lista. Es un sistema de preparación por categorías, verificación visual y asistencia de acomodo.

Vista principal de la maleta. La pantalla "Mi maleta" se organiza por categorías dinámicas según el viaje. Las categorías base siempre presentes son: Documentos, Ropa superior (playeras/tops/chamarras), Ropa inferior (pantalones/shorts/faldas), Ropa interior, Calzado, Higiene personal, Tecnología, Medicamentos, Extras del viaje. Las categorías variables aparecen según el contexto: si es playa agrega "Playa & agua", si es montaña agrega "Montaña & frío", si es trabajo agrega "Trabajo & presentaciones".

Cada ítem de la maleta tiene los siguientes campos:

Campo
Descripción
Nombre
Label del ítem (vía i18n)
Cantidad sugerida
Calculada por el motor de packing
Razón de la sugerencia
Por qué se incluye (clima, actividad, duración)
Estado
sugerido / marcado listo / con evidencia / alerta
Foto de evidencia
Opcional — captura de cámara
Prioridad
alta / media / baja




Sistema de estados de un ítem:

Un ítem puede estar en cuatro estados. "Sugerido" es el estado inicial, cuando el motor lo generó pero el usuario no ha interactuado. "Marcado listo" significa que el usuario lo marcó como preparado con un tap. "Con evidencia" significa que además tomó una foto. "Alerta" significa que hay una razón contextual para que ese ítem sea crítico (lluvia pronosticada, actividad que lo requiere, etc.) y aún no está marcado.

Foto de evidencia por ítem. Cada ítem tiene un botón de cámara. Al tocar, se abre la cámara del dispositivo (Capacitor Camera). La foto queda asociada al ítem y cambia su estado a "con evidencia". La foto NO es obligatoria para marcar el ítem como listo ni para cerrar el evento de maleta completa. Es una herramienta de seguridad visual, no un bloqueo.

Alertas inteligentes de maleta. El sistema detecta inconsistencias y las muestra como alertas en la parte superior de la pantalla de maleta:

•
"Te faltan 2 ítems importantes para los días lluviosos del pronóstico."

•
"Tienes 3 pares de zapatos para un viaje de 4 días. ¿Quieres revisar si vas sobreempacando?"

•
"No has marcado el bloqueador solar. Tu viaje tiene índice UV alto."

•
"Los documentos no están en acceso rápido. Muévelos al bolso personal."

Maleta por integrante. Si el viaje es en familia (grupo family, family_baby, o couple), la pantalla de maleta muestra tabs o cards por integrante. Cada integrante tiene su propio perfil, checklist, maleta y evidencia fotográfica. Los tabs se llaman con el nombre del integrante o con el rol (Mamá, Papá, Niño, Bebé).

Para viajes con bebé (family_baby), el sistema activa módulos especiales de maleta: pañales (calculados por días), toallitas húmedas, bloqueador bebé, ropa extra bebé (x2 por día), moisés portátil, fórmula o snacks, porta bebé, medicamentos bebé.

Cierre del evento "Maleta completa". Cuando el usuario ha marcado suficientes ítems (umbral configurable, default 80%), aparece una pantalla de cierre con el estado final: porcentaje listo, ítems pendientes, alertas activas. Si todo está bien: "Tu maleta está lista. Has confirmado el 92% de los artículos sugeridos." Si hay alertas: "Hay 2 alertas de revisión antes de cerrar tu maleta."

Etapa 8 — Asistente de Acomodo de Maleta

Esta es la función premium diferenciadora de VIAZA.

Paso 1 — Tamaño de maleta. Antes del análisis, VIAZA pregunta: ¿Qué tipo de maleta usarás? Las opciones son: Mochila pequeña, Carry-on/Cabina, Maleta mediana, Maleta grande, Backpacking, Equipaje mixto. También puede indicar el tamaño aproximado: chica, mediana, grande.

Paso 2 — Recomendación de acomodo por zonas. Basado en los ítems de la maleta y el tamaño elegido, VIAZA genera un plan de acomodo por zonas:

•
Lado izquierdo: ropa ligera enrollada, playeras, shorts, ropa interior.

•
Lado derecho: calzado (en bolsas), neceser, accesorios compactos.

•
Centro: objetos estructurales, sacos doblados, pouch de tecnología, objetos que no deben aplastarse.

•
Acceso rápido / tapa / bolsillo superior: documentos, medicamentos, cargador, cepillo dental, power bank, audífonos.

La recomendación es específica para el viaje: si es playa, el traje de baño va en acceso rápido; si es trabajo, los documentos de junta van en el centro protegidos.

Paso 3 — Foto final de maleta completa. Cuando el usuario ya acomodó todo, puede tomar una foto de la maleta abierta completa. En MVP esta foto es solo evidencia visual y memoria. En Fase 2 se agrega análisis básico de distribución. En Fase 3 se agrega visión computacional con IA para detectar objetos y sugerir optimizaciones.

Ejemplo de recomendación de acomodo para carry-on:


Para tu carry-on de 5 días en Cancún:
Lado izquierdo: 5 playeras enrolladas + 2 shorts + ropa interior.
Lado derecho: sandalias en bolsa + neceser + traje de baño.
Centro: vestido/saco ligero doblado + pouch de cables.
Bolsillo superior: pasaporte, cargador, medicamentos, audífonos.
Nota: el bloqueador solar (>100ml) debe ir en maleta documentada o comprar en destino.

Etapa 9 — Viaje de Trabajo (modo especial)

El viaje de trabajo cambia el comportamiento del sistema completo.

Al seleccionar travelType = work, el sistema pregunta el subtipo: ida y vuelta el mismo día, con pernocta, con juntas/eventos, con laptop y documentos, viaje ejecutivo ligero.

Si es ida y vuelta sin equipaje, la app no fuerza la generación de maleta completa. En su lugar activa un checklist rápido de essentials: laptop, cargador, documentos, identificación, audífonos, agua/snack. El dashboard muestra las tarjetas relevantes para trabajo: Ruta al aeropuerto/destino, Clima del día, Documentos necesarios, Agenda/juntas (campo libre para notar reuniones), Reglas de aerolínea si aplica.

Si es con pernocta, se genera una maleta ligera de trabajo: ropa formal, laptop, cargadores, documentos de junta, artículos de higiene mínimos. El sistema no sugiere traje de baño ni bloqueador solar a menos que el usuario lo active manualmente.

Etapa 10 — Durante el viaje

Cuando la fecha de inicio del viaje llega, tripStatus cambia a active. El dashboard se transforma: aparece el clima actual del día (no el pronóstico, sino el dato en tiempo real de OpenWeatherMap), las actividades del día si el usuario las organizó por fecha, y las herramientas de uso inmediato (Traductor, Moneda, Split Bill, Tips locales).

Las herramientas durante el viaje son:

Traductor. Input de texto libre, selector de idioma origen/destino, botón traducir. Resultado grande y claro. Acceso a frases rápidas por categoría (aeropuerto, hotel, restaurante, emergencia, transporte). En MVP usa la API de OpenAI con la key disponible. La key VITE_OPENAI_API_KEY debe conectarse al translateService.ts — esto es pendiente crítico.

Conversor de moneda. Monto, moneda origen, moneda destino, resultado grande, botón swap. API real de ExchangeRate con cache de 1 hora. 15 monedas disponibles.

Split Bill. Modo simple (total + personas + propina = por persona) y modo avanzado (cada persona ingresa su consumo individual). Resultado grande y claro.

Tips locales. Filtrados por el destino del viaje activo. Categorías: seguridad, transporte, cultura, dinero, comida. Cards horizontales deslizables.

Etapa 11 — Historial del viaje

Cuando la fecha de regreso del viaje llega, tripStatus cambia a completed. Aparece una pantalla de cierre: "¿Cómo estuvo tu viaje?" con opciones para guardar memorias, exportar la packing list, o duplicar el viaje para el próximo.

El viaje queda guardado en el historial con todos sus datos: destino, fechas, clima vivido, actividades realizadas, maletas usadas, fotos de evidencia, y un campo de observaciones/aprendizajes libre.

En el historial el usuario puede ver todos sus viajes pasados con una card por viaje. La app usa el historial para hacer sugerencias inteligentes en el siguiente viaje: "Tu viaje anterior a Cancún fue de 5 días. Empacaste de más en calzado. La próxima vez puedes reducir 1 par."

La pantalla principal siempre muestra el botón "+ Crear nuevo viaje" de forma prominente, tanto cuando hay un viaje activo como cuando no hay ninguno.




ARQUITECTURA TÉCNICA — ESTADO ACTUAL Y PENDIENTES

Stack confirmado y funcionando

React 18 + Vite 5 + TypeScript 5.6 (strict), Tailwind CSS 3.4, Framer Motion 11, React Router v6, Zustand 4 con persist, i18next con react-i18next, Capacitor 6. Build limpio sin errores de TypeScript.

APIs conectadas con key

API
Variable
Estado
Open-Meteo
Sin key
Funcionando — pronóstico del viaje
Nominatim/OSM
Sin key
Funcionando — autocomplete destino
OpenWeatherMap
VITE_OPENWEATHERMAP_KEY
Conectada — condiciones actuales
ExchangeRate-API
VITE_EXCHANGE_RATE_KEY
Conectada — tasas reales con cache
AviationStack
VITE_AVIATIONSTACK_KEY
Conectada — tracker de vuelo
Google Maps
VITE_GOOGLE_MAPS_KEY
Conectada — deeplinks + mapa estático




APIs con key disponible pero SIN conectar al código

API
Variable
Dónde debe conectarse
OpenAI
VITE_OPENAI_API_KEY
translateService.ts — traducción real
Anthropic
VITE_ANTHROPIC_API_KEY
Reservada para Fase 3 (IA de maleta)
Groq
VITE_GROQ_API_KEY
Reservada para Fase 3 (IA de maleta)
Supabase
VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
Auth real — Fase 2




Pendientes críticos para cerrar MVP

Los siguientes ítems deben resolverse en la próxima sesión de desarrollo, en este orden de prioridad:

Prioridad 1 — Translator real. Conectar translateService.ts a la API de OpenAI. La key existe. El servicio actual devuelve mock. Esto rompe una función core del MVP.

Prioridad 2 — Pronóstico diario completo. El weatherEngine.ts ya llama a Open-Meteo. Falta crear el componente WeatherForecastModal que muestre los datos día por día (mañana/tarde/noche) en un modal cristal. Los datos ya están en trip.weatherForecast pero solo se muestra el promedio.

Prioridad 3 — Maleta por integrante. El motor de packing ya genera ítems multiplicados por numberOfAdults + numberOfKids. Falta la UI de tabs por integrante en PackingChecklistPage y la lógica de asignación de ítems por persona.

Prioridad 4 — Foto de evidencia por ítem. Agregar botón de cámara en cada ítem de la packing list. Usar Capacitor Camera (ya instalado). Guardar la foto en el store asociada al itemId.

Prioridad 5 — Notificaciones nativas. Conectar DepartureReminderPage a @capacitor/local-notifications (ya instalado). El botón "Crear recordatorio" debe llamar a LocalNotifications.schedule().

Prioridad 6 — Dashboard de actividades con contexto. Crear la pantalla de actividades del viaje con las cards de contexto real (costo, duración, tip, link de compra anticipada) para los destinos del dataset.

Prioridad 7 — CountryPickerPage. Agregar pantalla entre TravelType y Destination para filtrar destinos por país. Mejora la UX del autocomplete.

Prioridad 8 — Asistente de acomodo. Crear la pantalla PackingArrangementPage con la lógica de zonas por tamaño de maleta y la opción de foto final.

Prioridad 9 — Historial de viajes. Crear TripHistoryPage con la lista de viajes completados y la pantalla de cierre de viaje.

Prioridad 10 — Strings hardcodeados. Migrar a i18n: "Terminal salida", "Gate", "Terminal llegada" en AirlineRulesPage.tsx y "Smart Travel Companion" en HomePage.tsx.




SISTEMA VISUAL COMPLETO — ESPECIFICACIONES PARA DESARROLLO

Tipografía

Questrial es la única fuente permitida. Pesos: 700 para títulos de pantalla y números grandes, 600 para títulos de sección y labels de tarjetas, 400 para cuerpo de texto y descripciones. Tamaños: 28-32px para títulos hero, 20-24px para títulos de pantalla, 16-18px para títulos de sección, 14px para cuerpo, 12px para labels y chips, 10px para metadata.

Botones

Botón CTA primario: pill grande (border-radius 9999px), fondo #12212E, texto blanco Questrial 600, altura 52px, ancho mínimo 200px. Sombra: 0 4px 12px rgba(18,33,46,0.25). Al presionar: scale(0.97) + sombra reducida.

Botón secundario: pill grande, fondo rgba(18,33,46,0.06), texto #12212E Questrial 600, sin borde. Al presionar: fondo rgba(18,33,46,0.10).

Botón accent: pill grande, fondo #EA9940, texto #12212E Questrial 700. Solo para acciones de máxima prioridad.

Botón ghost: sin fondo, sin borde, texto #307082 Questrial 500. Para acciones secundarias en contexto.

Inputs

Fondo rgba(18,33,46,0.04), border-radius 16px, sin borde visible en estado normal, borde #307082 al focus, altura 48px, padding horizontal 16px. Placeholder en rgba(18,33,46,0.40). Texto en #12212E Questrial 400.

Modal cristal

Fondo rgba(255,255,255,0.45), backdrop-filter blur(20px), border 1px solid rgba(255,255,255,0.35), border-radius 24px, sombra 0 12px 32px rgba(18,33,46,0.13). Se abre desde abajo con animación spring (Framer Motion).

Menú lateral (filtros y categorías)

Panel blanco/crema con border-radius 24px en las esquinas exteriores. Título de sección en Questrial 700 16px. Items de lista con radio button grande (24px) a la izquierda y flecha > a la derecha. Botón CTA al fondo: pill grande fondo #12212E texto blanco. Separadores de sección con línea rgba(18,33,46,0.08).

Chips y badges

Border-radius 9999px, padding 6px 12px, Questrial 600 12px. Chip de estado activo: fondo #EA9940, texto #12212E. Chip de dato: fondo rgba(18,33,46,0.08), texto #12212E. Chip de alerta: fondo rgba(192,57,43,0.10), texto #C0392B.

Bottom navigation

Pill flotante centrado en la parte inferior, fondo #12212E, border-radius 9999px, sombra 0 8px 24px rgba(18,33,46,0.20). 5 tabs: Home, Packing, Tools, Tips, Settings. Tab activo: bubble naranja #EA9940 detrás del icono. Iconos: duotone 24×24px. Labels: Questrial 400 10px debajo del icono.




MÓDULOS — ESTADO Y ESPECIFICACIÓN COMPLETA

Módulos implementados (funcionando en commit 798a946)

Onboarding completo (14 pantallas), creación de viaje, motor de packing avanzado bidimensional, packing checklist con accordions y FAB, laundry planner integrado, reglas de aerolínea con AviationStack, allowed items search, adapter guide, currency converter con API real, split bill simple + avanzado, local tips, survival tips, departure reminder (cálculo), settings con selector de idioma, premium placeholder.

Módulos con implementación parcial

Translator: UI completa, servicio es mock. Conectar a OpenAI.
DepartureReminder: Cálculo correcto, notificación nativa es stub. Conectar a Capacitor Local Notifications.
HomePage: Muestra datos del viaje activo pero no calcula días restantes en tiempo real. Agregar countdown.
TripDetailsPage: Existe pero es básica. Necesita diseño premium completo.

Módulos nuevos a implementar

WeatherForecastModal: Modal cristal con pronóstico día por día (mañana/tarde/noche) por toda la duración del viaje. Datos de Open-Meteo ya disponibles en el store.

ActivityDashboardPage: Pantalla de actividades del viaje con cards de contexto real. Dataset de actividades por destino con costo, duración, tip, link de compra.

PackingArrangementPage: Asistente de acomodo de maleta. Selector de tamaño, recomendación por zonas, foto final.

PackingEvidencePage / ítem con foto: Botón de cámara en cada ítem del checklist. Capacitor Camera.

TripHistoryPage: Lista de viajes completados. Card por viaje. Pantalla de cierre de viaje activo.

CountryPickerPage: Entre TravelType y Destination. Filtro de destinos por país.

MultiTravelerPackingView: Tabs por integrante en PackingChecklistPage. Vista de maleta individual.

WorkTripMode: Modo especial para viajes de trabajo. Checklist rápido sin maleta completa.




ROADMAP DE FASES

Fase 1 — MVP completo (sesión actual)

Conectar translator a OpenAI, pronóstico diario en modal cristal, maleta por integrante con tabs, foto de evidencia por ítem, notificaciones nativas, dashboard de actividades con contexto, historial básico de viajes, strings hardcodeados a i18n, CountryPickerPage.

Fase 2 — Experiencia completa

Auth real con Supabase, modo offline (Capacitor Preferences + datos cacheados), compartir viaje y lista, múltiples viajes simultáneos, asistente de acomodo de maleta con foto, alertas inteligentes de maleta, análisis básico de distribución de maleta por foto, tips geolocalizados en tiempo real, modo premium con paywall real ($4.99 USD).

Fase 3 — Inteligencia

Análisis visual de maleta con IA (OpenAI Vision o Anthropic), optimización de acomodo automática, historial inteligente con aprendizaje entre viajes, recomendaciones de actividades con datos reales de APIs de turismo, sincronización en nube, integración con reservas (Airbnb, Booking, etc.), Scan My Bag.




Documento redactado el 12 de marzo de 2026. Este documento reemplaza y amplía todas las versiones anteriores del manifiesto en lo que respecta a funcionalidad, sistema visual y pendientes de desarrollo.

