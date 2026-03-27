# VIAZA - Observabilidad Base (Fase 0)
Fecha: 2026-03-25
Estado: Implementada

## 1. Alcance implementado
- Servicio `src/services/observabilityService.ts` con:
  - `reportError(source, error, context)`
  - `reportWarning(source, warning, context)`
  - `initGlobalErrorObservers()`
  - buffer local en memoria (`getObservabilityBuffer`)
- Captura global de:
  - `window.error`
  - `window.unhandledrejection`
- Envío opcional a endpoint HTTP con `VITE_OBSERVABILITY_ENDPOINT`.

## 2. Integración en app
- `AppProviders` inicializa observadores globales al montar.
- Se reportan errores de sesión en `getSession` mediante `reportError`.

## 3. Variable opcional
- `VITE_OBSERVABILITY_ENDPOINT`
  - Uso: endpoint de ingesta de errores cliente.
  - Si está vacío, la observabilidad queda local (console + buffer).

## 4. Límites actuales
- No incluye aún agregación remota con dashboard dedicado.
- No hay trazas distribuidas ni métricas de performance.
- Baseline enfocado a capturar errores críticos de runtime sin romper UX.
