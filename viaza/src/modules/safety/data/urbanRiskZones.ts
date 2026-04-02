/**
 * urbanRiskZones.ts
 * Base de datos curada de zonas de riesgo urbano, natural y de ruta.
 *
 * Fuentes:
 *  - US State Dept Travel Advisories
 *  - Secretariado Nacional de Seguridad Pública México (SNSP)
 *  - UK Foreign, Commonwealth & Development Office
 *  - Reportes de seguridad ciudadana y prensa local
 *
 * Estructura:
 *  - country: código ISO 3166-1 alpha-2
 *  - city: nombre normalizado (lowercase, sin acentos, para matching)
 *  - zones[]: zonas específicas a evitar o cuidar
 *    - name: nombre de la colonia/barrio/zona
 *    - level: 1=precaución, 2=mayor cuidado, 3=evitar de noche, 4=evitar
 *    - tip: qué hacer / qué evitar
 *    - type: 'urban'|'natural'|'road'
 *  - naturalRisks[]: riesgos geográficos/climáticos del destino
 *  - emergencyNumber: número de emergencias local
 *  - safetyTips[]: máximo 4 tips accionables específicos para este destino
 */

export type RiskLevel = 1 | 2 | 3 | 4;
export type RiskType = 'urban' | 'natural' | 'road' | 'scam';

export interface UrbanZone {
  name: string;
  level: RiskLevel;
  tip: string;
  type: RiskType;
}

export interface NaturalRisk {
  name: string;
  level: RiskLevel;
  tip: string;
  season?: string; // "jun-oct" etc
}

export interface CityRiskProfile {
  country: string;          // ISO code
  cityKey: string;          // lowercase sin acentos para matching
  cityLabel: string;        // nombre a mostrar
  countryLabel: string;
  overallLevel: RiskLevel;  // nivel general de la ciudad
  zones: UrbanZone[];
  naturalRisks: NaturalRisk[];
  emergencyNumber: string;
  safetyTips: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MÉXICO
// ─────────────────────────────────────────────────────────────────────────────
const MEXICO_CITY: CityRiskProfile = {
  country: 'MX', cityKey: 'ciudad de mexico', cityLabel: 'Ciudad de México', countryLabel: 'México',
  overallLevel: 2,
  emergencyNumber: '911',
  zones: [
    { name: 'Tepito', level: 4, tip: 'Zona de alto riesgo conocida. Evita completamente, especialmente de noche.', type: 'urban' },
    { name: 'Doctores (Roma Sur)', level: 3, tip: 'Evita caminar solo de noche. Robos frecuentes a peatones.', type: 'urban' },
    { name: 'Lagunilla', level: 3, tip: 'Precaución en el mercado y sus alrededores. Carteristas activos.', type: 'urban' },
    { name: 'Guerrero (metro)', level: 3, tip: 'Zona con alta incidencia de robos. Evita de noche y en horarios de poca afluencia.', type: 'urban' },
    { name: 'Tacuba / Vallejo', level: 3, tip: 'Robos frecuentes a automovilistas. Mantén ventanas cerradas y puertas bloqueadas.', type: 'urban' },
    { name: 'Metro Balderas / Salto del Agua', level: 2, tip: 'Carteristas frecuentes en hora pico. Cuida bolsos y teléfonos.', type: 'scam' },
    { name: 'Xochimilco (trasbordos)', level: 2, tip: 'Robos documentados cerca de los embarcaderos de noche.', type: 'urban' },
    { name: 'Barrancas de Huentitán (Periférico)', level: 3, tip: 'Zona de barrancas profundas. No transites de noche y evita caminos no señalizados.', type: 'natural' },
  ],
  naturalRisks: [
    { name: 'Sismo', level: 3, tip: 'CDMX es zona sísmica activa. Conoce la ruta de evacuación de tu hotel. Alerta: 911.', season: 'todo el año' },
    { name: 'Inundaciones', level: 2, tip: 'Jun-Sep: colonias del oriente y norte se inundan. Evita circular por vías bajas en lluvias.', season: 'jun-sep' },
    { name: 'Contaminación / Contingencia', level: 2, tip: 'Días con contingencia ambiental: evita actividad física al aire libre. Consulta SEDEMA.', season: 'dic-mar' },
  ],
  safetyTips: [
    'Usa solo taxis de plataforma (Uber/DiDi). Nunca taxis de calle.',
    'Retira efectivo solo en cajeros dentro de tiendas o centros comerciales, nunca en la calle.',
    'Evita mostrar teléfono o joyería en la vía pública.',
    'En caso de "secuestro exprés", cede sin resistir y llama al 911 al llegar a un lugar seguro.',
  ],
};

const GUADALAJARA: CityRiskProfile = {
  country: 'MX', cityKey: 'guadalajara', cityLabel: 'Guadalajara', countryLabel: 'México',
  overallLevel: 2,
  emergencyNumber: '911',
  zones: [
    { name: 'Mercado Libertad / San Juan de Dios', level: 3, tip: 'Carteristas activos. Cuida bolsos y teléfonos, especialmente en el mercado interior.', type: 'scam' },
    { name: 'Zonas de Tlaquepaque de noche', level: 2, tip: 'Evita callejones oscuros después de las 22h. Permanece en zonas iluminadas y turísticas.', type: 'urban' },
    { name: 'Periférico norte (hacia Zapopan industrial)', level: 3, tip: 'Robos a vehículos en semáforos. Ventanas cerradas y puertas bloqueadas.', type: 'road' },
    { name: 'Barranca de Huentitán', level: 3, tip: 'Acantilados de hasta 500m sin señalización adecuada. No te acerques al borde, especialmente con niños.', type: 'natural' },
  ],
  naturalRisks: [
    { name: 'Sismo', level: 2, tip: 'Jalisco tiene actividad sísmica. Identifica las salidas de emergencia en tu hospedaje.', season: 'todo el año' },
    { name: 'Lluvias extremas', level: 2, tip: 'Jun-Sep: tormentas eléctricas fuertes. Evita circular bajo pasos a desnivel en lluvia intensa.', season: 'jun-sep' },
  ],
  safetyTips: [
    'Usa transporte de plataforma. El macrobús tiene zonas con poca vigilancia.',
    'Zona Centro y Tlaquepaque son seguros de día. De noche, quédate en zonas iluminadas.',
    'Cuidado con "marías" (vendedores agresivos) que distraen para robar.',
    'El Tequila Express (ruta hacia Tequila) es seguro. No viajes en auto por esa carretera de noche.',
  ],
};

const CANCUN: CityRiskProfile = {
  country: 'MX', cityKey: 'cancun', cityLabel: 'Cancún', countryLabel: 'México',
  overallLevel: 2,
  emergencyNumber: '911',
  zones: [
    { name: 'Región 100 / Zona Norte', level: 3, tip: 'Alta incidencia de robos. Evita completamente si no conoces la zona.', type: 'urban' },
    { name: 'Playa del Carmen - 5ta Avenida de noche', level: 2, tip: 'Mantente en el área central iluminada. Reportes de asaltos en calles secundarias.', type: 'urban' },
    { name: 'Tulum - Carretera nocturna', level: 3, tip: 'No viajes en moto o bici por la carretera Tulum-Cobá de noche. Asaltos documentados.', type: 'road' },
    { name: 'Corrientes de mar (Riviera Maya)', level: 3, tip: 'Corrientes peligrosas. Respeta bandera roja. Nunca nades solo en playas abiertas sin vigilancia.', type: 'natural' },
  ],
  naturalRisks: [
    { name: 'Huracanes', level: 3, tip: 'Jun-Nov: temporada de huracanes. Registra tu hotel en la embajada y conoce el refugio más cercano.', season: 'jun-nov' },
    { name: 'Sargazo', level: 1, tip: 'Mar-Sep: sargazo en playas del Caribe. Puede cerrar algunas playas. Consulta antes de ir.', season: 'mar-sep' },
    { name: 'Rayos UV extremos', level: 2, tip: 'Caribe tiene índice UV máximo. Protector solar SPF 50+ y evita el sol entre 11h-15h.', season: 'todo el año' },
  ],
  safetyTips: [
    'La Zona Hotelera es segura. El riesgo está en la ciudad de Cancún (regiones).',
    'Usa solo taxis autorizados con tarifa fija desde el aeropuerto.',
    'No consumas bebidas en envase abierto que no hayas pedido tú.',
    'En caso de huracán: sigue instrucciones de Protección Civil, no de redes sociales.',
  ],
};

const MONTERREY: CityRiskProfile = {
  country: 'MX', cityKey: 'monterrey', cityLabel: 'Monterrey', countryLabel: 'México',
  overallLevel: 2,
  emergencyNumber: '911',
  zones: [
    { name: 'Anillo Periférico noreste de noche', level: 3, tip: 'Robos a vehículos frecuentes. Evita detenerte en semáforos aislados de noche.', type: 'road' },
    { name: 'Mercado Juárez y alrededores', level: 2, tip: 'Carteristas activos. Cuida pertenencias en el mercado y las calles cercanas.', type: 'scam' },
    { name: 'Cañón de la Huasteca', level: 2, tip: 'Zona de montaña con paredes de roca. Sigue señalizaciones y no te separes de los senderos marcados.', type: 'natural' },
  ],
  naturalRisks: [
    { name: 'Inundaciones', level: 3, tip: 'MTY tiene historial de inundaciones severas (Río Santa Catarina). Nunca cruces arroyos o vías con agua.', season: 'jun-sep' },
    { name: 'Calor extremo', level: 2, tip: 'Jul-Ago: temperaturas de hasta 45°C. Hidratación constante y evita actividad física al aire libre al mediodía.', season: 'jul-ago' },
  ],
  safetyTips: [
    'San Pedro Garza García y Cumbres son zonas seguras. Fondo/Topo Chico, precaución.',
    'No dejes objetos visibles en el auto. Los robos a vehículo son comunes.',
    'El metro y metrobús son seguros durante el día. De noche, usa Uber.',
    'Cuidado con el "rolido" en carreteras: vehículos que frenan para robarte.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTADOS UNIDOS
// ─────────────────────────────────────────────────────────────────────────────
const NEW_YORK: CityRiskProfile = {
  country: 'US', cityKey: 'new york', cityLabel: 'Nueva York', countryLabel: 'Estados Unidos',
  overallLevel: 1,
  emergencyNumber: '911',
  zones: [
    { name: 'East New York / Brownsville (Brooklyn)', level: 3, tip: 'Zonas con alta tasa de crimen. Si no tienes destino específico ahí, evítalas.', type: 'urban' },
    { name: 'Partes del Bronx (Mott Haven / Hunts Point)', level: 3, tip: 'Evita de noche. Si debes ir, permanece en áreas comerciales iluminadas.', type: 'urban' },
    { name: 'Subway de noche (líneas A, C, J, Z)', level: 2, tip: 'De noche prefiere los vagones centrales y espera en zonas vigiladas. Reportes de asaltos aumentaron.', type: 'urban' },
    { name: 'Times Square - carteristas', level: 2, tip: 'Zona turística con alta presencia de carteristas y estafadores (personajes disfrazados piden dinero agresivamente).', type: 'scam' },
    { name: 'Hudson River Park de noche', level: 2, tip: 'Evita caminar solo por el parque pasada las 22h.', type: 'urban' },
  ],
  naturalRisks: [
    { name: 'Huracanes / tormentas', level: 2, tip: 'Sep-Nov: ciclones ocasionales. Sigue alertas de la Guardia Costera y NYC Emergency Management.', season: 'sep-nov' },
    { name: 'Frío extremo', level: 2, tip: 'Dic-Mar: temperaturas bajo cero y nevadas. Hipotermia real si no vas bien equipado.', season: 'dic-mar' },
    { name: 'Calor extremo', level: 2, tip: 'Jul-Ago: olas de calor. Hidratación y centros de refrigeración públicos disponibles.', season: 'jul-ago' },
  ],
  safetyTips: [
    'Mantén tu billetera en el bolsillo delantero. Usa bolsas cruzadas.',
    'No mires el teléfono caminando — objetivo fácil de arrebatón.',
    'Los taxis amarillos y Uber son seguros. Evita conductores no identificados.',
    'En emergencia: llama al 911. Para asuntos menores, busca el NYPD más cercano.',
  ],
};

const LOS_ANGELES: CityRiskProfile = {
  country: 'US', cityKey: 'los angeles', cityLabel: 'Los Ángeles', countryLabel: 'Estados Unidos',
  overallLevel: 2,
  emergencyNumber: '911',
  zones: [
    { name: 'Skid Row (Downtown)', level: 4, tip: 'Zona de alta concentración de personas sin hogar y crimen. Evita completamente si no tienes un propósito específico.', type: 'urban' },
    { name: 'Compton / Watts', level: 3, tip: 'Alta incidencia de crimen violento. Sin destino específico, evítalas.', type: 'urban' },
    { name: 'Hollywood Blvd de noche', level: 2, tip: 'Carteristas y estafadores activos en zona turística. Cuida pertenencias.', type: 'scam' },
    { name: 'Malibu Creek / Santa Monica Mountains', level: 2, tip: 'Incendios forestales frecuentes. Sigue evacuaciones de Cal Fire. No hagas fogata.', type: 'natural' },
  ],
  naturalRisks: [
    { name: 'Incendios forestales', level: 3, tip: 'Nov-Feb: temporada crítica de incendios. Sigue alertas de Cal Fire y evacúa inmediatamente si se ordena.', season: 'oct-feb' },
    { name: 'Sismo', level: 3, tip: 'LA es zona de falla sísmica (San Andrés). Conoce protocolo "cúbrete-agárrate" y rutas de evacuación.', season: 'todo el año' },
    { name: 'Inundaciones y deslaves', level: 2, tip: 'Ene-Mar en años de lluvias fuertes. Evita cañones y colinas en lluvia intensa.', season: 'ene-mar' },
  ],
  safetyTips: [
    'Nunca dejes nada visible en el auto — los "smash and grab" son muy comunes.',
    'Usa Uber/Lyft. El sistema de metro es seguro durante el día, con precaución de noche.',
    'Beaches seguras: Santa Monica, Venice (de día). Evita Venice de noche.',
    'En sismo: aléjate de ventanas, cúbrete bajo mesa sólida. No corras al exterior.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// COLOMBIA
// ─────────────────────────────────────────────────────────────────────────────
const BOGOTA: CityRiskProfile = {
  country: 'CO', cityKey: 'bogota', cityLabel: 'Bogotá', countryLabel: 'Colombia',
  overallLevel: 2,
  emergencyNumber: '123',
  zones: [
    { name: 'La Candelaria de noche', level: 3, tip: 'Centro histórico seguro de día, peligroso de noche. Regresa al hotel antes de las 20h.', type: 'urban' },
    { name: 'Santa Fe / Bronx', level: 4, tip: 'Zona de alto riesgo. Evita completamente, especialmente si no conoces la ciudad.', type: 'urban' },
    { name: 'TransMilenio hora pico', level: 3, tip: 'Carteristas y robos en el sistema BRT. Guarda celular y dinero antes de abordar.', type: 'scam' },
    { name: 'Chapinero Alto de noche', level: 2, tip: 'Robos a turistas documentados. Evita calles secundarias oscuras.', type: 'urban' },
  ],
  naturalRisks: [
    { name: 'Altitud', level: 2, tip: 'Bogotá está a 2600m. Mal de altura es común: hidratación y descanso el primer día.', season: 'todo el año' },
    { name: 'Lluvia / frío nocturno', level: 1, tip: 'Temperatura cae a 7°C de noche. Lleva chaqueta aunque sea "tropical".', season: 'todo el año' },
  ],
  safetyTips: [
    'La "burundanga" (escopolamina) es real. No aceptes bebidas ni cigarros de desconocidos.',
    'Usa solo taxis verificados por app (InDriver, Cabify) o del hotel.',
    'Zona Rosa, Usaquén y Parque 93 son las áreas más seguras para turistas.',
    'No camines con mochilas grandes ni mostrando electrónicos en la calle.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BRASIL
// ─────────────────────────────────────────────────────────────────────────────
const RIO_DE_JANEIRO: CityRiskProfile = {
  country: 'BR', cityKey: 'rio de janeiro', cityLabel: 'Río de Janeiro', countryLabel: 'Brasil',
  overallLevel: 3,
  emergencyNumber: '190',
  zones: [
    { name: 'Favelas (sin tour guiado)', level: 4, tip: 'Nunca entres a una favela sin guía local autorizado. Aplica incluso en zonas "pacificadas".', type: 'urban' },
    { name: 'Centro histórico de noche', level: 3, tip: 'El centro se vacía de noche. Quédate en Ipanema/Copacabana/Leblon donde hay más presencia policial.', type: 'urban' },
    { name: 'Copacabana (arrebatones)', level: 2, tip: 'Playa y paseo con alta presencia de carteristas. Lleva solo lo necesario.', type: 'scam' },
    { name: 'Cristo Redentor - tren', level: 1, tip: 'Zona segura de día. Evita la caminata por el bosque, usa el tren oficial.', type: 'natural' },
  ],
  naturalRisks: [
    { name: 'Lluvias / deslaves', level: 3, tip: 'Nov-Mar: lluvias extremas causan deslaves en favelas y vías. Sigue alertas del Río Alerta.', season: 'nov-mar' },
    { name: 'Calor extremo', level: 2, tip: 'Dic-Feb: sensación térmica hasta 50°C. Hidratación extrema y evita playa de 11h-15h.', season: 'dic-feb' },
  ],
  safetyTips: [
    'No lleves passport ni tarjetas de crédito a la playa. Solo efectivo mínimo.',
    'El "arrastão" (robo masivo en playa) ocurre. Si ves gente corriendo, sigue.', 
    'Usa Uber siempre. Los taxis del aeropuerto son seguros, los de calle no.',
    'Aprende a decir "pode ficar" (puedes quedarte) si un ladrón amenaza — no resistas.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ESPAÑA
// ─────────────────────────────────────────────────────────────────────────────
const BARCELONA: CityRiskProfile = {
  country: 'ES', cityKey: 'barcelona', cityLabel: 'Barcelona', countryLabel: 'España',
  overallLevel: 1,
  emergencyNumber: '112',
  zones: [
    { name: 'Las Ramblas', level: 2, tip: 'Mayor concentración de carteristas de Europa. Bolso cruzado, teléfono guardado, no saques la billetera.', type: 'scam' },
    { name: 'Barrio Gótico de noche', level: 2, tip: 'Turistas robados frecuentemente en callejones. Quédate en calles principales.', type: 'urban' },
    { name: 'Raval (zona norte)', level: 2, tip: 'Zona con mayor incidencia de robos. Evita de noche las calles más alejadas del Liceu.', type: 'urban' },
    { name: 'Metro L3 (sardines hours)', level: 2, tip: 'Carteristas operan en grupos coordinados. Cremallera bloqueada, mochila al frente.', type: 'scam' },
  ],
  naturalRisks: [
    { name: 'Calor extremo', level: 2, tip: 'Jul-Ago: olas de calor 38-42°C frecuentes. Busca zonas frescas de 13h-17h.', season: 'jul-ago' },
    { name: 'Mar picado (Maresme)', level: 1, tip: 'Corrientes ocasionales en el litoral norte. Respeta bandera amarilla/roja en las playas.', season: 'jun-sep' },
  ],
  safetyTips: [
    'El método más usado: "te acaban de manchar la ropa" — distracción para robar.',
    'Usa mochila antipiratas (con cremalleras en la espalda) en Las Ramblas.',
    'Si alguien te "abraza" en la calle, aléjate inmediatamente — es técnica de robo.',
    'Los taxis oficiales (amarillo y negro) son seguros. App: Free Now o Cabify.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ÍNDICE GLOBAL — ciudades indexadas para búsqueda rápida
// ─────────────────────────────────────────────────────────────────────────────
export const CITY_RISK_PROFILES: CityRiskProfile[] = [
  MEXICO_CITY,
  GUADALAJARA,
  CANCUN,
  MONTERREY,
  NEW_YORK,
  LOS_ANGELES,
  BOGOTA,
  RIO_DE_JANEIRO,
  BARCELONA,
];

// Aliases de búsqueda — términos que mapean a un cityKey
const CITY_ALIASES: Record<string, string> = {
  'cdmx': 'ciudad de mexico',
  'df': 'ciudad de mexico',
  'ciudad de méxico': 'ciudad de mexico',
  'mexico city': 'ciudad de mexico',
  'gdl': 'guadalajara',
  'ny': 'new york',
  'nyc': 'new york',
  'nueva york': 'new york',
  'la': 'los angeles',
  'los ángeles': 'los angeles',
  'bogotá': 'bogota',
  'río de janeiro': 'rio de janeiro',
  'rio': 'rio de janeiro',
  'mty': 'monterrey',
  'bcn': 'barcelona',
};

/** Normaliza texto para búsqueda: lowercase + quita acentos */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca el perfil de riesgo de una ciudad por nombre.
 * Hace matching parcial — "New York City" encuentra "new york".
 */
export function findCityRiskProfile(destination: string): CityRiskProfile | null {
  const norm = normalize(destination);

  // 1. Alias exacto
  const aliasKey = CITY_ALIASES[norm];
  if (aliasKey) {
    const profile = CITY_RISK_PROFILES.find((p) => p.cityKey === aliasKey);
    if (profile) return profile;
  }

  // 2. Buscar en alias parcialmente
  for (const [alias, key] of Object.entries(CITY_ALIASES)) {
    if (norm.includes(alias) || alias.includes(norm)) {
      const profile = CITY_RISK_PROFILES.find((p) => p.cityKey === key);
      if (profile) return profile;
    }
  }

  // 3. Match directo en cityKey
  const direct = CITY_RISK_PROFILES.find((p) => norm.includes(p.cityKey) || p.cityKey.includes(norm));
  if (direct) return direct;

  // 4. Match por país — retorna el perfil más representativo del país
  // (cuando viajas a "México" sin ciudad específica)
  return null;
}

/**
 * Detecta código de país desde el nombre del destino.
 * Incluye ciudades, países y regiones comunes.
 */
export function detectCountryFromDestination(destination: string): string | null {
  const norm = normalize(destination);
  const MAP: Record<string, string> = {
    // México
    'mexico': 'MX', 'mexican': 'MX', 'cdmx': 'MX', 'guadalajara': 'MX',
    'cancun': 'MX', 'monterrey': 'MX', 'puebla': 'MX', 'oaxaca': 'MX',
    'merida': 'MX', 'jalisco': 'MX', 'tulum': 'MX', 'playa del carmen': 'MX',
    'tijuana': 'MX', 'chihuahua': 'MX', 'culiacan': 'MX', 'leon': 'MX',
    // USA
    'united states': 'US', 'usa': 'US', 'estados unidos': 'US',
    'new york': 'US', 'los angeles': 'US', 'chicago': 'US', 'houston': 'US',
    'miami': 'US', 'san francisco': 'US', 'seattle': 'US', 'boston': 'US',
    'las vegas': 'US', 'orlando': 'US', 'dallas': 'US', 'denver': 'US',
    'washington': 'US', 'atlanta': 'US', 'nashville': 'US', 'austin': 'US',
    // Colombia
    'colombia': 'CO', 'bogota': 'CO', 'medellin': 'CO', 'cartagena': 'CO',
    'cali': 'CO', 'barranquilla': 'CO',
    // Brasil
    'brasil': 'BR', 'brazil': 'BR', 'rio de janeiro': 'BR', 'sao paulo': 'BR',
    'salvador': 'BR', 'fortaleza': 'BR', 'brasilia': 'BR',
    // España
    'espana': 'ES', 'spain': 'ES', 'barcelona': 'ES', 'madrid': 'ES',
    'sevilla': 'ES', 'valencia': 'ES', 'malaga': 'ES', 'granada': 'ES',
    // Argentina
    'argentina': 'AR', 'buenos aires': 'AR', 'mendoza': 'AR', 'cordoba': 'AR',
    // Perú
    'peru': 'PE', 'lima': 'PE', 'cusco': 'PE', 'machu picchu': 'PE', 'arequipa': 'PE',
    // Chile
    'chile': 'CL', 'santiago': 'CL', 'valparaiso': 'CL',
    // Francia
    'france': 'FR', 'paris': 'FR', 'nice': 'FR', 'lyon': 'FR', 'marsella': 'FR',
    // Italia
    'italia': 'IT', 'italy': 'IT', 'roma': 'IT', 'milan': 'IT', 'venecia': 'IT',
    'florencia': 'IT', 'napoles': 'IT',
    // Japón
    'japon': 'JP', 'japan': 'JP', 'tokio': 'JP', 'tokyo': 'JP', 'osaka': 'JP', 'kioto': 'JP',
    // UK
    'reino unido': 'GB', 'united kingdom': 'GB', 'london': 'GB', 'londres': 'GB',
    'manchester': 'GB', 'edinburgh': 'GB',
    // Alemania
    'alemania': 'DE', 'germany': 'DE', 'berlin': 'DE', 'munich': 'DE', 'hamburg': 'DE',
    // Tailandia
    'tailandia': 'TH', 'thailand': 'TH', 'bangkok': 'TH', 'phuket': 'TH', 'chiang mai': 'TH',
    // Venezuela
    'venezuela': 'VE', 'caracas': 'VE',
    // Peligrosos
    'afganistan': 'AF', 'somalia': 'SO', 'yemen': 'YE', 'haiti': 'HT',
    'sudan': 'SD', 'myanmar': 'MM', 'birmania': 'MM', 'nigeria': 'NG',
    'pakistan': 'PK',
  };

  for (const [key, code] of Object.entries(MAP)) {
    if (norm.includes(key)) return code;
  }
  return null;
}

/** Nivel de riesgo general por país (para destinos sin perfil de ciudad) */
export const COUNTRY_RISK_LEVELS: Record<string, { level: RiskLevel; tip: string; emergencyNumber: string }> = {
  MX: { level: 3, tip: 'Verifica el nivel de riesgo específico de tu destino en México. Hay grandes diferencias entre estados.', emergencyNumber: '911' },
  US: { level: 1, tip: 'Generalmente seguro. Varía por ciudad y barrio. Sigue el sentido común.', emergencyNumber: '911' },
  CO: { level: 2, tip: 'Colombia ha mejorado mucho. Sé precavido en centros históricos y transporte público.', emergencyNumber: '123' },
  BR: { level: 3, tip: 'Brasil tiene alta disparidad. Las zonas turísticas son relativamente seguras, las favelas no.', emergencyNumber: '190' },
  ES: { level: 1, tip: 'España es muy segura. Principal riesgo: carteristas en zonas turísticas.', emergencyNumber: '112' },
  AR: { level: 2, tip: 'Argentina tiene robos en ciudades grandes. Buenos Aires: precaución en el microcentro de noche.', emergencyNumber: '911' },
  PE: { level: 2, tip: 'Perú: cuidado en Lima (Miraflores es seguro) y en rutas de senderismo remotas.', emergencyNumber: '105' },
  CL: { level: 1, tip: 'Chile es relativamente seguro. Santiago: precaución en metro y zonas periféricas.', emergencyNumber: '133' },
  FR: { level: 1, tip: 'Francia segura. París: carteristas activos en Eiffel, Louvre y metro.', emergencyNumber: '17' },
  IT: { level: 1, tip: 'Italia segura. Roma y Nápoles: carteristas activos en transporte público.', emergencyNumber: '112' },
  JP: { level: 1, tip: 'Japón es uno de los países más seguros del mundo. Riesgo principal: sismos.', emergencyNumber: '110' },
  GB: { level: 1, tip: 'UK seguro. Londres: precaución con arrebatones de teléfono en ciertas zonas.', emergencyNumber: '999' },
  DE: { level: 1, tip: 'Alemania muy segura. Precaución mínima en zonas de celebraciones masivas.', emergencyNumber: '110' },
  TH: { level: 2, tip: 'Tailandia segura para turistas. Cuidado: estafas de tuk-tuk y gemas falsas en Bangkok.', emergencyNumber: '191' },
  VE: { level: 4, tip: 'Venezuela: riesgo muy alto. Evita moverte de noche. Usa acompañante local de confianza.', emergencyNumber: '171' },
  AF: { level: 4, tip: 'No viajar. Conflicto armado activo.', emergencyNumber: '119' },
  SO: { level: 4, tip: 'No viajar. Alto riesgo de terrorismo y secuestro.', emergencyNumber: '888' },
  YE: { level: 4, tip: 'No viajar. Guerra civil activa.', emergencyNumber: '191' },
  HT: { level: 4, tip: 'No viajar. Violencia de pandillas extrema.', emergencyNumber: '114' },
  NG: { level: 3, tip: 'Nigeria: alta criminalidad en Lagos y Abuja. Evita viajar solo.', emergencyNumber: '199' },
  PK: { level: 3, tip: 'Pakistán: terrorismo en zonas fronterizas. Islamabad y Lahore tienen menos riesgo.', emergencyNumber: '115' },
  SD: { level: 4, tip: 'Sudán: conflicto armado generalizado. No viajar.', emergencyNumber: '999' },
  MM: { level: 4, tip: 'Myanmar: golpe de estado y conflicto armado. No viajar.', emergencyNumber: '199' },
  ET: { level: 3, tip: 'Etiopía: conflictos regionales activos. Addis Abeba es más estable.', emergencyNumber: '911' },
};
