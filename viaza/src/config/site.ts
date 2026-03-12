/**
 * ─── VIAZA – Configuración central del sitio ────────────────────────────────
 *
 * ÚNICO archivo que debes tocar para:
 *  1. Publicar la app en tiendas → poner IS_APP_PUBLISHED = true
 *  2. Actualizar links de App Store / Play Store
 *  3. Cambiar URL de acceso temporal o URL raíz
 *
 * Los componentes nunca hardcodean URLs. Siempre leen desde aquí.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ──────────────────────────────────────────────────────────────────────────────
// 1. Estado de publicación
//    false → app en desarrollo, botones de tienda apuntan a TEMP_APP_ACCESS_URL
//    true  → app publicada, botones de tienda apuntan a APP_STORE_URL / PLAY_STORE_URL
// ──────────────────────────────────────────────────────────────────────────────
export const IS_APP_PUBLISHED = false;

// ──────────────────────────────────────────────────────────────────────────────
// 2. URLs
// ──────────────────────────────────────────────────────────────────────────────

/** URL raíz del sitio / app web */
export const APP_URL = 'https://appviaza.com';

/**
 * Acceso temporal a la experiencia actual de la app
 * mientras se publica la versión nativa en tiendas.
 * Reemplaza este valor si el acceso cambia de ruta.
 */
export const TEMP_APP_ACCESS_URL = 'https://appviaza.com/splash';

/** URL real de App Store (activar cuando IS_APP_PUBLISHED = true) */
export const APP_STORE_URL = 'https://apps.apple.com/app/viaza/id000000000';

/** URL real de Google Play (activar cuando IS_APP_PUBLISHED = true) */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ikviaza.app';

// ──────────────────────────────────────────────────────────────────────────────
// 3. URLs resueltas para los botones de tienda
//    Este es el único lugar donde está la lógica "publicada / no publicada".
//    Los componentes simplemente importan RESOLVED_APP_STORE_URL y RESOLVED_PLAY_STORE_URL.
// ──────────────────────────────────────────────────────────────────────────────

export const RESOLVED_APP_STORE_URL  = IS_APP_PUBLISHED ? APP_STORE_URL  : TEMP_APP_ACCESS_URL;
export const RESOLVED_PLAY_STORE_URL = IS_APP_PUBLISHED ? PLAY_STORE_URL : TEMP_APP_ACCESS_URL;

// ──────────────────────────────────────────────────────────────────────────────
// 4. Copy dinámico de botones de tienda
// ──────────────────────────────────────────────────────────────────────────────

export const APP_STORE_LABEL  = IS_APP_PUBLISHED ? 'Descargar en App Store'    : 'Próximamente en App Store';
export const PLAY_STORE_LABEL = IS_APP_PUBLISHED ? 'Descargar en Google Play'  : 'Próximamente en Google Play';

// ──────────────────────────────────────────────────────────────────────────────
// 5. Contacto / soporte
// ──────────────────────────────────────────────────────────────────────────────

export const SUPPORT_EMAIL = 'support@appviaza.com';

// ──────────────────────────────────────────────────────────────────────────────
// 6. Legal
// ──────────────────────────────────────────────────────────────────────────────

export const PRIVACY_URL = '/privacy';
export const TERMS_URL   = '/terms';

// ──────────────────────────────────────────────────────────────────────────────
// 7. Brand
// ──────────────────────────────────────────────────────────────────────────────

export const BRAND_NAME    = 'VIAZA';
export const BRAND_TAGLINE = 'Smart Travel Companion';
export const COMPANY_NAME  = 'InfinityKode';
export const COPYRIGHT_YEAR = '2025';
