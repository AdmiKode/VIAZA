# VIAZA - Checklist DoD por Módulo (Release Gate)
Fecha: 2026-03-25
Estado: Activo

## 1. Regla de cierre
Un módulo solo pasa a `COMPLETADO` si cumple todos los checks obligatorios y tiene evidencia adjunta.

## 2. Checklist obligatorio
| Check | Criterio | Evidencia requerida |
|---|---|---|
| UI funcional | Pantallas y acciones principales operativas | captura/nota de validación manual |
| Lógica de negocio | reglas clave implementadas y coherentes | referencia a servicio/hook/función |
| Persistencia real | lectura/escritura real en Supabase/APIs | prueba manual o test automatizado |
| Manejo de errores | mensajes y fallback básico sin crash | caso de error validado |
| Seguridad | RLS/buckets/secretos revisados | fila en matriz RLS/Buckets |
| QA automatizado | smoke o test mínimo del flujo crítico | salida `npm run test:smoke` |
| Calidad técnica | build + lint en verde (sin errores) | salida `npm run build` y `npm run lint` |
| Observabilidad mínima | errores críticos capturados | log estructurado/handler activo |

## 3. Plantilla de cierre por módulo
- Módulo/Stream:
- Estado:
- Archivos tocados:
- Migraciones:
- Variables nuevas:
- Evidencia build/lint/tests:
- Validación manual:
- Riesgos vivos:
- Decisiones técnicas:

## 4. Gate de release (global)
1. `npm run ci:check` en verde.
2. Matriz RLS/Buckets actualizada con acciones tomadas.
3. Secrets validados (frontend vs edge).
4. Flujo crítico completo validado manualmente.
5. No hay features vendidas como cerradas sin evidencia.
