# VIAZA - Convenciones de Migración y Versionado (Supabase)
Fecha: 2026-03-25
Estado: Activo

## 1. Objetivo
Eliminar drift entre esquema local y producción, y asegurar trazabilidad/rollback por cada cambio de DB.

## 2. Naming obligatorio de migraciones
Formato:
- `YYYYMMDD_HHMM_<slug>.sql`

Ejemplos:
- `20260325_1815_emergency_qr_access_logs.sql`
- `20260326_0930_packing_scan_sessions.sql`

Reglas:
- `slug` en `snake_case`, corto y descriptivo.
- Una migración por cambio lógico cohesivo.
- Prohibido mezclar cambios no relacionados en la misma migración.

## 3. Estructura mínima por migración
1. DDL de creación/alteración (`create table`, `alter table`, índices).
2. `enable row level security` cuando aplique.
3. Políticas RLS explícitas por operación (`select/insert/update/delete`).
4. Grants/RPC necesarios (`grant execute ...`) para funciones públicas.
5. Bloque de rollback operativo documentado en comentario al final.

## 4. Reglas de seguridad DB
- No exponer datos sensibles por defecto en vistas públicas.
- Toda tabla de dominio de usuario debe filtrar por `auth.uid()`.
- Para accesos públicos controlados (ej. QR emergency), usar función `security definer` con validación de token y sin devolver PII innecesaria.
- Buckets privados por defecto; bucket público solo con justificación explícita (ej. `avatars`).

## 5. Flujo operativo (obligatorio)
1. Crear migración con naming estándar.
2. Actualizar `schema_viaza.sql` en el mismo PR.
3. Ejecutar validación local:
   - `npm run lint`
   - `npm run build`
   - `npm run test:smoke`
4. Adjuntar evidencia en tablero (`ID tarea`, comando, resultado).
5. Solo después: deploy/controlado a entorno destino.

## 6. Versionado y control de cambios
- `schema_viaza.sql` es fuente de verdad de documentación técnica.
- `supabase/migrations/*.sql` es historial ejecutable y auditable.
- Todo cambio DB debe aparecer en ambos.
- No se aceptan cambios manuales en dashboard sin migración equivalente.

## 7. Criterio de cierre de tarea DB
Una tarea de datos pasa a `COMPLETADO` solo si tiene:
- migración creada,
- schema actualizado,
- RLS revisado,
- evidencia de validación técnica,
- riesgos residuales documentados.
