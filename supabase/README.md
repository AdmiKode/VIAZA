# VIAZA — Supabase Schema

## Implementación paso a paso

### 1. Crear el proyecto en Supabase

Ve a [supabase.com](https://supabase.com), crea un nuevo proyecto y guarda:
- `Project URL` → `VITE_SUPABASE_URL`
- `anon public key` → `VITE_SUPABASE_ANON_KEY`

### 2. Ejecutar el schema

En el **SQL Editor** de tu proyecto Supabase, pega y ejecuta el contenido de `schema.sql` completo.

### 3. Configurar el .env

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Configurar Auth

En **Authentication > Providers**:
- Email/Password: **habilitado**
- Google OAuth: opcional (requiere Google Cloud Console)
- Apple OAuth: opcional (requiere Apple Developer Account)

En **Authentication > Email Templates**: personaliza los correos de confirmación con la marca VIAZA.

### 5. Configurar Storage

Los buckets se crean automáticamente al ejecutar el schema. Verifica en **Storage** que existan:
- `evidence` — privado
- `luggage` — privado
- `avatars` — público

### 6. Configurar Stripe (pagos PRO)

1. Crea una cuenta en [stripe.com](https://stripe.com)
2. Crea un producto "VIAZA PRO" con precio de $4.99 USD/año
3. Crea una Edge Function en `supabase/functions/stripe-webhook/`
4. Configura el webhook de Stripe apuntando a tu Edge Function
5. El trigger `on_payment_status_change` actualiza el plan automáticamente

---

## Diagrama de tablas

```
auth.users (Supabase)
    │
    ▼
profiles ──────────────────────────────────────────────┐
    │                                                   │
    ├── trips ──────────────────────────────────────┐  │
    │       │                                       │  │
    │       ├── travelers                           │  │
    │       ├── packing_items ── packing_evidence   │  │
    │       ├── luggage_photos                      │  │
    │       ├── trip_activities                     │  │
    │       └── departure_reminders                 │  │
    │                                               │  │
    ├── split_bill_sessions ── split_bill_expenses  │  │
    │                                               │  │
    └── payments ───────────────────────────────────┘  │
            │                                          │
            └── (trigger) → actualiza plan en profiles ┘
```

---

## Notas de seguridad RLS

Todas las tablas tienen **Row Level Security habilitado**. Las políticas garantizan que:

- Cada usuario solo puede leer, crear, actualizar y eliminar **sus propios datos**.
- La tabla `payments` **no tiene política de INSERT para el cliente**. Los pagos solo los puede insertar el backend (Edge Function / webhook de Stripe). Esto evita que alguien se otorgue el plan PRO sin pagar.
- El trigger `on_payment_status_change` actualiza el perfil automáticamente cuando un pago se completa o se reembolsa, sin que el cliente pueda manipular este campo directamente.
- Los buckets de Storage usan la carpeta `{user_id}/...` para aislar archivos por usuario.
