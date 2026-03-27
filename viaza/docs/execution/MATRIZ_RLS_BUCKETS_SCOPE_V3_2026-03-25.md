# VIAZA - Matriz RLS y Buckets (Scope V3)
Fecha: 2026-03-25
Estado: Inicial publicada (Fase 0)
Fuente: `supabase/schema_viaza.sql` + migración `20260325_emergency_qr_access_logs.sql`

## 1. Matriz de tablas
| Tabla / Vista | Read | Write | Auth required | Riesgo detectado | Acción tomada |
|---|---|---|---|---|---|
| `profiles` | owner only (RLS) | insert/update owner | Sí | perfil sensible expuesto si falla filtro | políticas owner-by-uid activas |
| `emergency_profiles` | owner only (RLS); acceso público controlado por token vía función | owner CRUD | Sí (excepto endpoint tokenizado) | exposición de PII en flujo emergency | función pública devuelve solo campos con consent flags |
| `emergency_qr_access_logs` | owner only (RLS) | insert por RPC pública `log_emergency_qr_access` | No para insert (anon/auth), sí para lectura owner | abuso de spam de logs públicos | función limita datos guardados (sin PII cruda); pendiente rate-limit edge |
| `trips` | owner only (RLS) | owner CRUD | Sí | manipulación cruzada entre usuarios | políticas por `auth.uid() = user_id` |
| `travelers` | owner vía join a trip (RLS) | owner CRUD | Sí | fuga de integrantes por join mal definido | políticas usan pertenencia al viaje |
| `packing_items` | owner vía trip (RLS) | owner CRUD | Sí | ítems custom no sincronizados | fix de `addCustomPackingItem` aplicado |
| `packing_evidence` | owner only (RLS) | owner insert/delete | Sí | fuga de evidencias de maleta | RLS + bucket privado `evidence` |
| `luggage_photos` | owner only (RLS) | owner CRUD | Sí | imágenes completas accesibles por terceros | RLS + bucket privado `luggage` |
| `agenda_items` | owner only (RLS) | owner CRUD | Sí | recordatorios visibles fuera de cuenta | políticas owner activas |
| `itinerary_events` | owner only (RLS) | owner CRUD | Sí | edición cruzada por trip compartido no definido | mantener owner único en V3 |
| `trip_places` | owner only (RLS) | owner CRUD | Sí | caching inconsistente de lugares | persistencia separada en `places_cache` |
| `wallet_docs` | owner only (RLS) | owner CRUD | Sí | datos documentales sensibles | RLS + bucket privado + OCR controlado |
| `payments` | owner read only (RLS) | sin write cliente directo | Sí | elevación de plan por write cliente | write restringido a backend/webhook |
| `user_subscription` (view) | derivada de `profiles` | N/A | Sí | consumo incorrecto si no respeta RLS heredado | mantener lectura autenticada y controlada |
| `trip_recommendations` | owner only (RLS) | owner CRUD | Sí | recomendaciones sin persistencia consistente | tabla activa; pendiente hardening de deduplicación |
| `places_cache` | owner only (RLS) | owner CRUD | Sí | crecimiento no controlado | pendiente TTL/limpieza programada |

## 2. Matriz de buckets
| Bucket | Read | Write | Auth required | Riesgo detectado | Acción tomada |
|---|---|---|---|---|---|
| `evidence` | owner folder only | owner insert/delete | Sí | evidencia de equipaje sensible | políticas `storage.foldername(name)[1] = auth.uid()` |
| `luggage` | owner folder only | owner insert/delete | Sí | fotos de maleta completas sensibles | bucket privado + políticas owner |
| `wallet_docs` | owner folder only | owner insert/delete | Sí | documentos de identidad/pago sensibles | bucket privado + políticas owner |
| `avatars` | lectura pública | owner insert/update por carpeta | No para read / Sí para write | exposición pública intencional de avatar | mantener solo imágenes de perfil no sensibles |

## 3. Hallazgos y acciones inmediatas
1. Falta explícita de control de rate-limit para `log_emergency_qr_access` (recomendado en Edge/API Gateway).
2. `payments` está bien restringido para cliente; mantener webhook/backend como único writer.
3. `places_cache` requiere política operativa de expiración para evitar crecimiento indefinido.
4. Buckets críticos (`evidence`, `luggage`, `wallet_docs`) ya están privados; mantener auditoría periódica de políticas.

## 4. Resultado F0-09
- Matriz base publicada y utilizable para hardening Fase 1.
- Pendiente Fase 1: validación en entorno remoto (`supabase policies list` + pruebas de acceso por rol).
