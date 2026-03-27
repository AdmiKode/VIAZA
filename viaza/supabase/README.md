# VIAZA — Supabase Schema

## Implementación paso a paso

### 1. Crear el proyecto en Supabase

Ve a [supabase.com](https://supabase.com), crea un nuevo proyecto y guarda:
- `Project URL` → `VITE_SUPABASE_URL`
- `anon public key` → `VITE_SUPABASE_ANON_KEY`

### 2. Ejecutar el schema

En el **SQL Editor** de tu proyecto Supabase, pega y ejecuta el contenido de `schema_viaza.sql` completo.

Nota: `schema.sql` queda deprecado. La fuente de verdad del schema es `schema_viaza.sql`.

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
- `wallet_docs` — privado
- `avatars` — público

### 6. Configurar Stripe (pagos Premium)

1. Crea una cuenta en [stripe.com](https://stripe.com)
2. Crea un producto "VIAZA Premium" con precio de **149 MXN / mes**
3. Configura secrets en Supabase (Edge Functions):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_PREMIUM_MXN_149_MONTHLY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo server)
4. Despliega Edge Functions:
   - `stripe-create-checkout-session`
   - `stripe-webhook`
5. Configura el webhook de Stripe apuntando a `stripe-webhook`
6. El trigger `on_payment_status_change` actualiza el plan automáticamente

### 7. Edge Functions (obligatorio por seguridad)

No se permiten API keys en frontend. Configura secrets (Edge):
- `GOOGLE_MAPS_API_KEY` (Places + Time Zone API)
- `OPENAI_API_KEY` (IA Orchestrator)
- `ANTHROPIC_API_KEY` (IA Orchestrator)
- `GROQ_API_KEY` (IA Orchestrator)
- `AVIATIONSTACK_API_KEY` (vuelos)
- `EXCHANGE_RATE_KEY` (tipo de cambio)
- `TRAVEL_RISK_API_KEY` (risk zones / safety alerts)
- `TRAVEL_RISK_BASE_URL` (default: `https://travelriskapi.com/api/v1`)
- `APP_URL` (para success/cancel URL de Stripe; en local: `http://localhost:5173`)

Funciones incluidas en este repo:
- `places-autocomplete`
- `places-details`
- `destination-resolve`
- `weather-cache`
- `routes-transit`
- `ai-orchestrator`
- `flight-info`
- `exchange-rates`
- `risk-zones`
- `stripe-create-checkout-session`
- `stripe-customer-portal`
- `stripe-webhook`

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
- La tabla `payments` **no tiene política de INSERT para el cliente**. Los pagos solo los puede insertar el backend (Edge Function / webhook de Stripe). Esto evita que alguien se otorgue el plan Premium sin pagar.
- El trigger `on_payment_status_change` actualiza el perfil automáticamente cuando un pago se completa o se reembolsa, sin que el cliente pueda manipular este campo directamente.
- Los buckets de Storage usan la carpeta `{user_id}/...` para aislar archivos por usuario.
