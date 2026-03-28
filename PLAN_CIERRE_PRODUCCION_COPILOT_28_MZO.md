# PLAN OPERATIVO REAL — CIERRE A PRODUCCIÓN VIAZA
### Auditor: GitHub Copilot | Fecha: 28 Mar 2026 | Versión: 1.0
> Base: Auditoria_Copilot_28_Mzo.md + lectura directa del codebase. Sin suposiciones. Sin mocks.

---

## ÍNDICE

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Closure Matrix — 6 módulos prioritarios](#2-closure-matrix)
   - [MÓDULO 1: Safety Layer (20% → 100%)](#módulo-1-safety-layer)
   - [MÓDULO 2: Smart Trip Brain (40% → 100%)](#módulo-2-smart-trip-brain)
   - [MÓDULO 3: Wallet + OCR (40% → 100%)](#módulo-3-wallet--ocr)
   - [MÓDULO 4: Finanzas persistentes (12% → 100%)](#módulo-4-finanzas-persistentes)
   - [MÓDULO 5: Push Notifications (5% → 100%)](#módulo-5-push-notifications)
   - [MÓDULO 6: Movilidad por lugar visitado (25% → 100%)](#módulo-6-movilidad-por-lugar-visitado)
3. [Plan de fases (3 fases, 14 semanas)](#3-plan-de-fases)
4. [Lo que necesito de Patty](#4-lo-que-necesito-de-patty)
5. [Sprint 1 — 5 bloques de trabajo](#5-sprint-1--5-bloques-de-trabajo)
6. [Qué puede empezar Copilot hoy sin preguntar nada](#6-qué-puede-empezar-copilot-hoy)
7. [Qué NO tocar todavía](#7-qué-no-tocar-todavía)

---

## 1. RESUMEN EJECUTIVO

| Indicador | Valor |
|-----------|-------|
| Avance global real | **38%** |
| Módulos ≥ 70% | 4 (Packing 70%, Emergency 68%, Currency 90%, Translator 65%) |
| Módulos ≤ 20% | 5 (Safety 20%, Budget 0%, Memory 5%, Offline 5%, Health 0%) |
| Tablas faltantes en DB | 8 críticas |
| Edge functions faltantes | 5 |
| APIs externas sin conectar | FCM, Gmail, Speech-to-Text, geofencing |
| Blocker Android build | `gradlew` no tiene permisos de ejecución |
| Semanas para producción real | **14 semanas** (3 fases) |

### El mayor riesgo del producto hoy mismo
**Safety Layer es el módulo más falso del producto.** El SOS es un link de WhatsApp. No hay tracking real, no hay sesiones registradas en base de datos, no hay recuperación ante desconexión. Si un usuario activa SOS en un destino de riesgo medio-alto, el app no hace nada diferente a abrir WhatsApp. Esto es el bloqueo número 1.

---

## 2. CLOSURE MATRIX

---

### MÓDULO 1: Safety Layer

| Campo | Detalle |
|-------|---------|
| **Estado actual** | 20% |
| **Qué existe** | `locationService.ts` (geolocation real ✅), `emergencyAssistService.ts` (SOS = WhatsApp link), `riskZonesService.ts` (advisory por país), `EmergencyCardPage.tsx` (perfil + QR real) |
| **Qué NO existe** | Safe Walk/Return session, live tracking backend, SOS log en DB, compañero como receptor real, geofencing de zonas de riesgo |

#### FRONTEND — Archivos a crear

```
src/modules/safety/pages/SafeWalkPage.tsx        ← NUEVO (sesión segura: start/checkin/end)
src/modules/safety/pages/LiveTrackingPage.tsx     ← NUEVO (vista del compañero en tiempo real)
src/modules/safety/components/SafeWalkPanel.tsx   ← NUEVO (timer, last checkin, cancelar)
src/modules/safety/components/CompanionMapView.tsx ← NUEVO (Supabase Realtime subscription)
src/modules/safety/hooks/useSafeWalk.ts           ← NUEVO (maneja sesión activa)
src/services/safeTrackingService.ts               ← NUEVO
```

#### FRONTEND — Archivos a modificar

```
src/services/emergencyAssistService.ts
  └── buildSosMessage(): añadir SOS_EVENT INSERT antes de WhatsApp redirect
  └── sendAssistedSos(): llamar edge function 'sos-handler' antes del wa.me

src/modules/emergency/pages/EmergencyCardPage.tsx
  └── Añadir botón "Activar Safe Walk" que navega a /safety/safewalk
  └── La visibility UI (show_blood_type etc.) YA ESTÁ en el tipo — solo necesita 
      exponerse en EmergencyCardForm.tsx si aún no hay toggles en la UI

src/app/router/index.tsx
  └── Añadir rutas: /safety/safewalk, /safety/tracking/:sessionToken
```

#### SQL — Tablas a crear (nueva migración)

```sql
-- migrations/20260328_safety_layer.sql

-- 1. Sesiones de Safe Walk / Safe Return
CREATE TABLE safety_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  session_type  TEXT NOT NULL CHECK (session_type IN ('safe_walk','safe_return','live_share')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','expired','sos_triggered')),
  companion_token TEXT UNIQUE NOT NULL,         -- token que recibe el compañero
  companion_name  TEXT,
  companion_phone TEXT,
  expected_duration_min INTEGER,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_end_at TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ,
  last_checkin_at TIMESTAMPTZ,
  last_lat      NUMERIC,
  last_lon      NUMERIC,
  last_accuracy NUMERIC,
  is_public     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE safety_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON safety_sessions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Public view via token (compañero):
CREATE POLICY "Companion read by token" ON safety_sessions
  FOR SELECT USING (is_public = true);

-- 2. Check-ins periódicos de la sesión
CREATE TABLE safety_checkins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES safety_sessions(id) ON DELETE CASCADE NOT NULL,
  lat        NUMERIC NOT NULL,
  lon        NUMERIC NOT NULL,
  accuracy   NUMERIC,
  note       TEXT,
  checkin_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE safety_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner read" ON safety_checkins
  USING (EXISTS (
    SELECT 1 FROM safety_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Companion read" ON safety_checkins
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM safety_sessions s WHERE s.id = session_id AND s.is_public = true
  ));

-- 3. Log de eventos SOS
CREATE TABLE sos_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  trip_id       UUID REFERENCES trips(id) ON DELETE SET NULL,
  session_id    UUID REFERENCES safety_sessions(id) ON DELETE SET NULL,
  triggered_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat           NUMERIC,
  lon           NUMERIC,
  accuracy      NUMERIC,
  contact_notified TEXT,    -- nombre del contacto
  contact_phone TEXT,
  method        TEXT NOT NULL CHECK (method IN ('whatsapp','sms','push','manual')),
  status        TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','acknowledged','resolved')),
  resolved_at   TIMESTAMPTZ,
  notes         TEXT
);

ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON sos_events
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Cola offline (para SOS sin señal)
CREATE TABLE offline_queue (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users NOT NULL,
  event_type   TEXT NOT NULL CHECK (event_type IN ('sos','checkin','location_update')),
  payload      JSONB NOT NULL,
  queued_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at    TIMESTAMPTZ,
  is_synced    BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full" ON offline_queue
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_safety_sessions_user ON safety_sessions(user_id);
CREATE INDEX idx_safety_sessions_token ON safety_sessions(companion_token);
CREATE INDEX idx_safety_checkins_session ON safety_checkins(session_id, checkin_at DESC);
CREATE INDEX idx_sos_events_user ON sos_events(user_id, triggered_at DESC);
```

#### EDGE FUNCTIONS — A crear

```
supabase/functions/safety-tracking/index.ts
  ├── POST /start  → crea safety_session, genera companion_token, devuelve URL pública
  ├── POST /checkin → inserta safety_checkin, actualiza last_lat/lon en safety_session
  ├── POST /end    → marca session completed
  └── GET  /view/:token → vista pública (para el compañero, no requiere auth)

supabase/functions/sos-handler/index.ts
  ├── POST / → inserta sos_event, notifica via push (si hay FCM token), devuelve confirmación
  └── Puede llamarse sin auth (usando trip_id + emergency_profile public_token como validación)
```

#### ENV VARS requeridas

```bash
# Ya deberían estar configuradas (confirmar en Supabase Dashboard → Settings → Edge Functions)
SUPABASE_SERVICE_ROLE_KEY   # para el edge function (ya existe)
# Para sos-handler con push (si FCM ya configurado):
FCM_SERVER_KEY              # NUEVA — ver Módulo 5
```

#### APIs externas

- **Supabase Realtime** (ya incluido, solo activar `SUBSCRIBE` en `safety_sessions` y `safety_checkins`)
- **FCM** — opcional para SOS push (ver Módulo 5)
- Sin costo adicional en el stack actual

#### Definition of Done (DoD)

- [ ] Usuario puede iniciar Safe Walk con duración estimada y nombre del compañero
- [ ] Cada 5 minutos se registra checkin automático en `safety_checkins`
- [ ] Compañero accede a URL pública `/safety/tracking/:companionToken` y ve la ubicación en mapa (actualización en tiempo real via Supabase Realtime)
- [ ] Al vencer el tiempo sin checkin → notificación local "¿Sigues bien?"
- [ ] SOS: inserta en `sos_events` + abre WhatsApp (actual) + si hay FCM → push al compañero
- [ ] Sesiones anteriores visibles en historial

#### Riesgos técnicos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Supabase Realtime latencia alta en Android | Media | Polling fallback cada 30s si Realtime falla |
| GPS no disponible sin señal | Alta | Cache última posición + offline_queue para sync posterior |
| FCM no configurado para SOS push | Alta | WhatsApp es el fallback actual — documentar como limitación known |
| `gradlew` no ejecutable | **INMEDIATA** | `cd viaza/android && chmod +x gradlew` |

#### Dependencias

- FCM configurado → ver Módulo 5
- Rutas en router (`/safety/safewalk`, `/safety/tracking/:token`)
- No depende de ningún otro módulo nuevo

---

### MÓDULO 2: Smart Trip Brain

| Campo | Detalle |
|-------|---------|
| **Estado actual** | 40% — `HomePage.tsx` es un menú visual, no un cerebro operativo |
| **Qué existe** | Hero con clima, risk chip, módulos filtrados por fase/premium/coords. Auto-resolve de coords. Weather forecast diario. |
| **Qué NO existe** | Motor de prioridad dinámica, alertas proactivas, sugerencias contextuales, estado de preparación del viaje, acciones urgentes destacadas |

#### El cambio conceptual

`HomePage.tsx` debe evolucionar de **"menú de funciones"** a **"dashboard operativo"**. La pantalla debe responder: *"¿Qué debería hacer el usuario ahora mismo?"*

#### FRONTEND — Archivos a crear

```
src/engines/tripBrainEngine.ts              ← NUEVO — motor de prioridad y alertas
src/modules/trips/components/ActionAlerts.tsx ← NUEVO — sección "Acciones urgentes"
src/modules/trips/components/TripReadiness.tsx ← NUEVO — barra de preparación del viaje
src/modules/trips/components/ContextualSuggestions.tsx ← NUEVO
src/hooks/useTripBrain.ts                   ← NUEVO — hook que consume tripBrainEngine
```

#### FRONTEND — Archivos a modificar

```
src/modules/trips/pages/HomePage.tsx
  └── Insertar <ActionAlerts> encima de los módulos (si hay alertas activas)
  └── Insertar <TripReadiness> debajo del hero (días restantes + % preparación)
  └── Lógica de ordenamiento dinámico de módulos ya filtrados

src/engines/activeModulesEngine.ts
  └── Exportar puntuación de urgencia por módulo (base para ordenar en Brain)
```

#### Lógica de `tripBrainEngine.ts`

```typescript
// Inputs: trip, packingItems, itineraryEvents, walletDocs, emergencyProfile, daysLeft
// Output: TripBrainResult { urgentAlerts[], suggestions[], readinessPct, moduleOrder[] }

// Reglas de urgencia (ejemplos):
// - daysLeft <= 3 && packingProgress < 80% → ALERTA: "Tienes pendiente armar la maleta"
// - daysLeft <= 7 && !emergencyProfile → ALERTA: "Sin tarjeta de emergencia"
// - daysLeft <= 1 && !itineraryEvents.length → SUGERENCIA: "¿Tienes confirmada la ruta al aeropuerto?"
// - riskLevel >= 'high' && !safeWalkActive → SUGERENCIA: "Zona de riesgo alto — activa Safe Walk"
// - walletDocs.some(d => isExpiringSoon(d)) → ALERTA: "Documento próximo a vencer"
// - En viaje (phase === 'in_trip') → mostrar Safety, Emergency, Translator como prioritarios
// - Post-viaje → mostrar acceso a bitácora/Memory primero
```

#### SQL — Sin nuevas tablas

El brain opera sobre datos existentes. Sin migración nueva.

#### EDGE FUNCTIONS — Sin nuevas

Opera en cliente. Si se quisiera IA proactiva, usaría `ai-orchestrator` existente.

#### ENV VARS

Ninguna nueva.

#### Definition of Done (DoD)

- [ ] Si faltan < 3 días, se muestra banner rojo "Acciones urgentes" con items específicos
- [ ] Barra de preparación visible en hero mostrando % (packing + emergency + wallet + itinerary)
- [ ] En fase `in_trip`: Safety y Emergency aparecen como primeros módulos (no al fondo)
- [ ] En fase `post_trip`: módulo Memory aparece destacado
- [ ] `daysLeft` calcula correctamente con la fecha actual (ya existe, mantener)

#### Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Engine demasiado agresivo con alertas | Media | Límite de 3 alertas simultáneas, dismiss por sesión |
| Reglas hardcoded difíciles de mantener | Baja | Definir como array de objetos Rule[] configurable |

#### Dependencias

- `packingItems`, `itineraryEvents`, `walletDocs`, `emergencyProfile` ya en Zustand store
- `daysLeft` ya calculado en HomePage
- No depende de Safety ni Finanzas

---

### MÓDULO 3: Wallet + OCR

| Campo | Detalle |
|-------|---------|
| **Estado actual** | 40% — Upload real + lista + "Analizar" botón. Sin visor. Sin expiración. Sin modo robo/pérdida. |
| **Qué existe** | `walletDocsService.ts` (upload/CRUD real), `WalletPage.tsx` (lista + upload), `parsedData` campo en `WalletDoc` (OCR ya puede guardarse ahí), bucket `wallet_docs` en Supabase Storage |
| **Qué NO existe** | Visor de documentos, `expiration_date` en tipo+DB, OCR estructurado extraído, modo robo/pérdida, alertas de vencimiento |

#### FRONTEND — Archivos a crear

```
src/modules/wallet/components/DocViewer.tsx       ← NUEVO (iframe PDF + img para imágenes)
src/modules/wallet/components/DocOcrResult.tsx    ← NUEVO (muestra datos extraídos: nombre, número, vencimiento)
src/modules/wallet/pages/WalletLostModePage.tsx   ← NUEVO (modo robo/pérdida: lista contactos, pasos, números de bloqueo)
src/modules/wallet/components/ExpirationBadge.tsx ← NUEVO (chip "Vence en X días")
```

#### FRONTEND — Archivos a modificar

```
src/modules/wallet/pages/WalletPage.tsx
  └── Al tap sobre un doc → abrir DocViewer (modal/sheet)
  └── Mostrar ExpirationBadge en cada card si expiration_date existe
  └── Mostrar datos OCR extraídos (parsedData) en la card si existen
  └── Añadir botón "Modo Emergencia" → navegar a WalletLostModePage

src/services/walletDocsService.ts
  └── toRow(): añadir expiration_date al mapeo
  └── fromRow(): añadir expiration_date al mapeo inverso

src/types/wallet.ts
  └── Añadir: expiration_date?: string | null;   (ISO date string)
  └── Añadir: ocr_name?: string | null;           (nombre extraído)
  └── Añadir: ocr_doc_number?: string | null;     (número de documento)
```

#### SQL — Columnas a añadir (nueva migración)

```sql
-- migrations/20260328_wallet_expiration.sql

ALTER TABLE wallet_docs
  ADD COLUMN IF NOT EXISTS expiration_date DATE,
  ADD COLUMN IF NOT EXISTS ocr_name TEXT,
  ADD COLUMN IF NOT EXISTS ocr_doc_number TEXT,
  ADD COLUMN IF NOT EXISTS is_reported_lost BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lost_reported_at TIMESTAMPTZ;

-- Para alertas de vencimiento (consultable desde cliente):
CREATE INDEX IF NOT EXISTS idx_wallet_docs_expiration
  ON wallet_docs(user_id, expiration_date)
  WHERE expiration_date IS NOT NULL;
```

#### EDGE FUNCTIONS — Modificar ai-orchestrator

```
supabase/functions/ai-orchestrator/index.ts
  Task type existente: 'document_ocr' (confirmar o añadir si falta)
  
  Prompt para OCR debe retornar:
  {
    "doc_type": "passport|id_card|visa|insurance|other",
    "full_name": "...",
    "doc_number": "...",
    "expiration_date": "YYYY-MM-DD",  ← crítico
    "issuing_country": "...",
    "nationality": "...",
    "raw_text": "..."                  ← texto completo extraído
  }
  
  El frontend guarda esto en parsedData, ocr_name, ocr_doc_number, expiration_date.
```

#### DocViewer — Implementación

```typescript
// src/modules/wallet/components/DocViewer.tsx
// Para PDF: <iframe src={publicUrl} /> dentro de un modal full-screen
// Para imágenes: <img src={publicUrl} /> con pinch-to-zoom (CSS touch-action: pinch-zoom)
// Generar publicUrl con supabase.storage.from('wallet_docs').getPublicUrl(storagePath)
// ⚠️ El bucket debe ser PÚBLICO o usar signed URLs (confirmar política en Supabase)
```

#### ENV VARS

Ninguna nueva (OpenAI ya configurado para ai-orchestrator).

#### Definition of Done (DoD)

- [ ] Tap sobre documento abre visor — PDF como iframe, imagen con zoom
- [ ] "Analizar" extrae: nombre, número de documento, fecha vencimiento, país
- [ ] Documentos con vencimiento próximo (< 90 días) muestran chip naranja
- [ ] Documentos vencidos muestran chip rojo
- [ ] Modo Emergencia muestra: documentos importantes + números de teléfono para bloquear tarjetas por país + pasos si te roban la cartera
- [ ] Campo `is_reported_lost` se puede activar en una card para marcarla visualmente

#### Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Bucket `wallet_docs` es privado → iframe no carga | Alta | Usar `createSignedUrl` con TTL de 1 hora para viewer |
| OCR impreciso en documentos de baja calidad | Media | Permitir edición manual de campos extraídos |
| PDF viewer no funciona en WebView Android | Alta | Detectar Android + usar plugin `@capacitor-community/file-opener` o descargar |

#### Dependencias

- Acceso al bucket `wallet_docs` (verificar política de Supabase)
- `ai-orchestrator` debe tener task `document_ocr` (verificar o añadir)

---

### MÓDULO 4: Finanzas Persistentes

| Campo | Detalle |
|-------|---------|
| **Estado actual** | 12% — Split Bill es calculadora local. Budget no existe. |
| **Qué existe** | `split_bill_sessions` + `split_bill_expenses` tables EN DB (✅ sin usar), `SplitBillPage.tsx` (calculadora local), `splitBillCalculator.ts` (utilidad matemática) |
| **Qué NO existe** | `SplitBillPage.tsx` conectada a DB, tabla `trip_budget`, tabla `trip_expenses`, `BudgetPage.tsx`, historial de sesiones |

#### El quickwin más rápido del producto

Las tablas `split_bill_sessions` y `split_bill_expenses` **ya existen en producción**. Solo hay que reemplazar el estado local de `SplitBillPage.tsx` con llamadas a Supabase. Es el cambio de mayor ratio esfuerzo/impacto del backlog completo.

#### FRONTEND — Archivos a crear

```
src/modules/finances/pages/BudgetPage.tsx          ← NUEVO (presupuesto por categoría + gastos reales)
src/modules/finances/components/ExpenseForm.tsx    ← NUEVO (añadir gasto: monto, categoría, moneda)
src/modules/finances/components/BudgetBar.tsx      ← NUEVO (barra de progreso por categoría)
src/modules/finances/hooks/useBudget.ts            ← NUEVO
src/services/splitBillService.ts                   ← NUEVO (CRUD split_bill_sessions + expenses)
src/services/budgetService.ts                      ← NUEVO (CRUD trip_budget + trip_expenses)
```

#### FRONTEND — Archivos a modificar

```
src/modules/split-bill/pages/SplitBillPage.tsx
  └── REEMPLAZAR useState local con splitBillService
  └── Al guardar → INSERT en split_bill_sessions + split_bill_expenses
  └── Mostrar sesiones anteriores del viaje actual
  └── Mantener la calculadora rápida para uso offline + guardar al recuperar señal
```

#### SQL — Tablas a crear

```sql
-- migrations/20260328_finances.sql

-- Presupuesto del viaje por categoría
CREATE TABLE trip_budget (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  trip_id     UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  category    TEXT NOT NULL CHECK (category IN (
                'transport','accommodation','food','activities',
                'shopping','health','emergency','other')),
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  currency_code  TEXT NOT NULL DEFAULT 'USD',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, category)
);

ALTER TABLE trip_budget ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full" ON trip_budget
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Gastos reales del viaje
CREATE TABLE trip_expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users NOT NULL,
  trip_id      UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  category     TEXT NOT NULL,
  amount       NUMERIC NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  amount_local  NUMERIC,                   -- monto en moneda local del destino
  exchange_rate NUMERIC,
  description  TEXT,
  paid_by      TEXT,                       -- para split bill reference
  split_session_id UUID REFERENCES split_bill_sessions(id) ON DELETE SET NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url  TEXT,                       -- foto del recibo (Storage)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE trip_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full" ON trip_expenses
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_trip_expenses_trip ON trip_expenses(trip_id, expense_date DESC);
```

#### EDGE FUNCTIONS — Opcional (Fase 2)

```
supabase/functions/budget-insights/index.ts
  ├── POST /analyze → recibe trip_id, calcula varianza presupuesto vs real por categoría
  └── Llama ai-orchestrator con task 'budget_analysis' para sugerencias IA
```

#### ENV VARS

Ninguna nueva.

#### Definition of Done (DoD)

- [ ] Split Bill: guardar sesión en DB, ver historial de sesiones por viaje
- [ ] Split Bill: los participantes y montos persisten entre sesiones de app
- [ ] Budget: crear presupuesto por categoría al inicio del viaje
- [ ] Budget: añadir gastos reales durante el viaje (monto, categoría, moneda)
- [ ] Budget: ver barra de progreso "gastado vs planificado" por categoría
- [ ] Convertir gasto: usar tasa de cambio del día (llamar `exchange-rates` edge function)
- [ ] Total gastado visible en hero de HomePage (opcional Fase 2)

#### Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| `split_bill_sessions` schema puede no coincidir 100% con lo que SplitBillPage espera | Media | Leer exactamente el schema antes de escribir el service |
| Múltiples monedas complican el resumen | Media | Convertir siempre a moneda base del viaje usando tasa cacheada |

#### Dependencias

- Confirmar schema exacto de `split_bill_sessions` + `split_bill_expenses` en `schema_viaza.sql`
- `exchange-rates` edge function ya existe (conectar para conversión)

---

### MÓDULO 5: Push Notifications

| Campo | Detalle |
|-------|---------|
| **Estado actual** | 5% — Solo `LocalNotifications` de Capacitor. Sin FCM. Sin push desde servidor. |
| **Qué existe** | `notificationsService.ts` (local notifications, web fallback), `google-services.json` en `android/app/` (Firebase configurado), `@capacitor/push-notifications` en `package.json` (confirmar) |
| **Qué NO existe** | FCM token capture, `push_tokens` table, edge function `send-push`, push desde servidor para SOS/alertas/vuelos |

#### Verificar primero

```bash
# ¿Está instalado @capacitor/push-notifications?
grep "push-notifications" viaza/package.json

# Si no está:
cd viaza && npm install @capacitor/push-notifications
npx cap sync android
```

#### FRONTEND — Archivos a crear

```
src/services/pushNotificationService.ts    ← NUEVO
  └── requestPermission(): solicita permiso + obtiene FCM token
  └── saveFcmToken(token): guarda token en push_tokens table vía Supabase
  └── onNotificationReceived(callback): listener para notificaciones en foreground
  └── onNotificationActionPerformed(callback): listener para tap en notificación
```

#### FRONTEND — Archivos a modificar

```
src/App.tsx o src/app/providers/
  └── Al autenticar → llamar pushNotificationService.requestPermission()
  └── Guardar FCM token obtenido en push_tokens

src/services/notificationsService.ts
  └── Mantener LocalNotifications para alertas de salida/packing
  └── Delegar SOS y alertas remotas a pushNotificationService
```

#### SQL — Tabla a crear

```sql
-- migrations/20260328_push_tokens.sql

CREATE TABLE push_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  fcm_token   TEXT NOT NULL,
  device_id   TEXT,
  platform    TEXT CHECK (platform IN ('android','ios','web')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, fcm_token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full" ON push_tokens
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- El edge function 'send-push' necesita service_role para leer tokens de otros usuarios
-- (caso SOS: notificar al compañero)
```

#### EDGE FUNCTIONS — A crear

```
supabase/functions/send-push/index.ts
  ├── POST / → recibe { user_id, title, body, data }
  ├── Lee push_tokens WHERE user_id = $1 AND is_active = true
  ├── Envía via FCM HTTP v1 API (Bearer token con Service Account)
  └── Registra en un log si falla (retry logic opcional)
```

#### ENV VARS — Nuevas requeridas

```bash
# En Supabase Dashboard → Edge Functions → Secrets:
FCM_SERVER_KEY        # Firebase Cloud Messaging Server Key
                      # O mejor: usar Firebase Admin SDK con Service Account JSON

FIREBASE_SERVICE_ACCOUNT_JSON  # Service Account completo para FCM HTTP v1 API
                                # Más seguro que server key deprecated
```

#### Pasos de configuración Firebase

1. Ir a Firebase Console → Proyecto → Settings → Service Accounts
2. Generar nueva clave privada → descargar JSON
3. Añadir `FIREBASE_SERVICE_ACCOUNT_JSON` a Supabase Secrets
4. Verificar que en `google-services.json` el `package_name` coincide con `viaza/android/app/build.gradle`

#### Definition of Done (DoD)

- [ ] Al abrir la app (autenticado), solicita permiso de push notifications
- [ ] FCM token se guarda en `push_tokens` table
- [ ] SOS activa push al compañero si éste tiene la app instalada
- [ ] Alerta de vuelo (delay/cancelación) llega como push sin necesidad de app abierta
- [ ] Push de recordatorio de salida llega en background
- [ ] Token se actualiza si cambia (FCM rota tokens)

#### Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| FCM HTTP v1 requiere OAuth2 (más complejo que server key) | Media | Usar google-auth-library en edge function (Deno-compatible) |
| iOS requiere APNs certificate adicional | Alta | Fase 3 — por ahora solo Android |
| Usuario deniega permiso de push | Media | Degradar gracefully a LocalNotifications |

#### Dependencias

- Firebase project activo con FCM habilitado (confirmar con Patty)
- Service Account JSON de Firebase
- Módulo Safety (para SOS push)

---

### MÓDULO 6: Movilidad por Lugar Visitado

| Campo | Detalle |
|-------|---------|
| **Estado actual** | 25% — OSRM para distancia/tiempo + deep links a Waze/Maps/Apple Maps |
| **Qué existe** | `TripRoutePage.tsx` (origen→destino vía OSRM), `routes-transit` edge function (Google Directions), `trip_places` table en DB, `itinerary_events` table |
| **Qué NO existe** | Ruta entre lugares del itinerario, optimización de orden de visitas, tránsito público real integrado en flujo, movilidad por día de itinerario |

#### El cambio clave

Conectar el **itinerario diario** con la **ruta entre lugares**. Cuando el usuario ve el día 2 de su itinerario con 3 actividades, debería ver: cómo llegar de A→B→C, cuánto tiempo, qué transporte.

#### FRONTEND — Archivos a crear

```
src/modules/itinerary/components/DayRoutePanel.tsx  ← NUEVO (panel con ruta entre eventos del día)
src/modules/itinerary/components/LegCard.tsx         ← NUEVO (tramo A→B con tiempo/modo/instrucciones)
src/services/routeLegService.ts                      ← NUEVO
  └── getDayRoute(events[]): llama routes-transit para cada par de eventos consecutivos
  └── getOptimalOrder(events[]): llama ai-orchestrator task 'route_optimization' (Fase 2)
```

#### FRONTEND — Archivos a modificar

```
src/modules/itinerary/pages/ItineraryPage.tsx
  └── Añadir botón "Ver ruta del día" en cada tab diario
  └── Abrir DayRoutePanel como bottom sheet

src/modules/trips/pages/TripRoutePage.tsx
  └── Mantener origen→destino actual
  └── Añadir sección "Accede al itinerario del día" para conectar con DayRoutePanel
```

#### EDGE FUNCTIONS — Modificar routes-transit

```
supabase/functions/routes-transit/index.ts
  Estado actual: recibe origin + destination → devuelve una ruta
  
  Añadir soporte para waypoints:
  Body: { origin, destination, waypoints?: string[], mode?: 'driving'|'transit'|'walking' }
  
  Esto permite calcular A→B→C→D en una sola llamada a Google Directions API
```

#### SQL — Sin nuevas tablas

`itinerary_events` ya tiene `lat`/`lon`/`address`. Solo necesita que los eventos tengan coordenadas.
`trip_places` ya tiene coordenadas. Se puede usar para sugerir orden de visita.

#### ENV VARS

`GOOGLE_MAPS_API_KEY` — ya debe estar configurada (usada por `routes-transit` y `places-nearby`).

#### Definition of Done (DoD)

- [ ] En cada día del itinerario, botón "Cómo llegar" calcula ruta entre todos los eventos del día
- [ ] Cada tramo muestra: distancia, tiempo estimado, modo de transporte sugerido
- [ ] Deep link a Waze/Google Maps para ese tramo específico
- [ ] Si evento no tiene coordenadas → botón "Localizar" llama `places-autocomplete`
- [ ] Modo tránsito (transporte público) disponible si destino lo soporta

#### Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Eventos del itinerario sin lat/lon | Alta | Resolución lazy via places-autocomplete al abrir el panel |
| Google Directions API costo por llamada | Media | Cachear rutas en `trip_places` o localStorage por 24h |
| Waypoints limit (máx 8 en plan gratuito) | Baja | Dividir itinerarios con > 8 paradas en sub-rutas |

#### Dependencias

- `GOOGLE_MAPS_API_KEY` configurada en Supabase
- `itinerary_events` con coordenadas (o resolver lazy)

---

## 3. PLAN DE FASES

### FASE 1 — NÚCLEO IRRENUNCIABLE (Semanas 1–4)
> Objetivo: los 4 módulos firma en estado vendible

| Semana | Bloque | Entrega |
|--------|--------|---------|
| S1 | Safety DB + SafeWalkPage MVP | Check-in cada 5min, sesión persiste en DB |
| S1 | Split Bill → DB | `split_bill_sessions` y `split_bill_expenses` wired |
| S2 | Wallet DocViewer + OCR structured | PDF viewer, extracción nombre/número/vencimiento |
| S2 | Push infrastructure | FCM token capture + `push_tokens` table + `send-push` edge |
| S3 | SOS handler real | `sos_events` table + push al compañero + log |
| S3 | Budget MVP | `trip_budget` + `trip_expenses` + BudgetPage |
| S4 | Trip Brain básico | Alertas urgentes + barra de preparación en HomePage |
| S4 | Android build fix | `chmod +x gradlew` + build de prueba + APK |

**Criterio de salida Fase 1:** Safety, Wallet, Split Bill y Budget funcionan con datos reales en Android. APK instalable y testeable en dispositivo físico.

---

### FASE 2 — FORTALECER PARCIALES (Semanas 5–8)
> Objetivo: módulos existentes a 80%+

| Semana | Bloque | Entrega |
|--------|--------|---------|
| S5 | Movilidad por día (DayRoutePanel) | Ruta entre eventos del itinerario |
| S5 | OCR mejorado (modo robo/pérdida) | WalletLostModePage + marcado de doc robado |
| S6 | Companion mode (LiveTrackingPage) | Vista pública para el compañero via Realtime |
| S6 | Email import (texto estructurado) | ImportReservationPage mejorado con regex para emails copiados |
| S7 | Smart Trip Brain completo | Sugerencias contextuales + orden dinámico de módulos |
| S7 | Itinerary: colaboración básica | Compartir itinerario (solo lectura) via link público |
| S8 | Alertas de vuelo | `flight-alerts` edge function + cron polling + push |

**Criterio de salida Fase 2:** App demostrable a inversores. 8 de los 10 módulos core al 80%+.

---

### FASE 3 — NUEVOS MÓDULOS CRÍTICOS (Semanas 9–14)
> Objetivo: diferenciadores de mercado reales

| Semana | Bloque | Entrega |
|--------|--------|---------|
| S9-10 | Offline mode | Cache estratégica, offline_queue, sync al reconectar |
| S9-10 | Health module | `health_profiles` + `medication_schedules` + alertas medicamentos |
| S11-12 | Travel Memory | `trip_memories` table + bitácora de fotos + resumen IA |
| S11-12 | Roadtrip intelligence real | Casetas México + gasolineras + segmentos por highway |
| S13-14 | IA Assistant | Chat interface sobre `ai-orchestrator` + contexto del viaje |
| S13-14 | iOS prep | APNs, provisioning, App Store assets |

---

## 4. LO QUE NECESITO DE PATTY

### 🔴 CRÍTICO — Sin esto no puedo continuar

| Item | Por qué es bloqueante | Formato requerido |
|------|-----------------------|-------------------|
| **Firebase Service Account JSON** | FCM push notifications — el `google-services.json` existe pero el Service Account para el servidor es diferente | JSON descargado desde Firebase Console → Settings → Service Accounts → Generate new private key |
| **Confirmar que FCM está habilitado** en el proyecto Firebase | `google-services.json` tiene el config del cliente pero FCM puede no estar activado en el proyecto | Ir a Firebase Console → Build → Cloud Messaging → verificar que está habilitado |
| **GOOGLE_MAPS_API_KEY con permisos** | `routes-transit` y `places-nearby` ya la usan — confirmar que tiene habilitados: Maps SDK, Directions API, Places API, Geocoding API | Solo confirmar en Google Cloud Console qué APIs están activadas para la key existente |
| **Decisión: duración de tokens QR** | Los tokens de Emergency Card son permanentes hoy. ¿Deben vencer? ¿Cada cuánto? | Respuesta de producto: "permanentes" o "X días / regenerar manual" |

### 🟡 IMPORTANTE — Necesario para Fase 2

| Item | Por qué | Formato |
|------|---------|---------|
| **OpenAI API Key** | `ai-orchestrator` la usa — confirmar que está en Supabase Secrets como `OPENAI_API_KEY` | Solo confirmar que está configurada en Supabase Dashboard → Edge Functions → Secrets |
| **AviationStack API Key** | `flight-info` edge function. Confirmar tier (free = 100 calls/mes, insuficiente para prod) | Verificar en aviationstack.com — el plan gratuito es muy limitado |
| **ExchangeRate API Key** | `exchange-rates` edge function. Free tier = 1,500 calls/mes | Confirmar en exchangerate-api.com |
| **Stripe Keys** | Ya conectado — solo confirmar que son keys de PRODUCCIÓN, no test | En Supabase Secrets: `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` |
| **Decisión: categorías de presupuesto** | Las 8 categorías de `trip_budget` son fijas. ¿Agregar más? | Lista de Patty o aprobar las 8 definidas: transport, accommodation, food, activities, shopping, health, emergency, other |

### 🟢 DECISIONES DE PRODUCTO que necesito

| Pregunta | Impacto técnico |
|----------|-----------------|
| **¿Companion mode requiere que el compañero tenga cuenta VIAZA?** | Si sí → auth + RLS estándar. Si no → token público sin auth (más simple, ya diseñado así) |
| **¿Safe Walk gratis o Premium?** | Afecta qué se muestra en activeModulesEngine |
| **¿Budget Companion gratis o Premium?** | Mismo |
| **¿Modo robo/pérdida de Wallet muestra números de bloqueo hardcoded por país o cargados desde DB?** | Si hardcoded → simple array. Si DB → tabla nueva `card_block_contacts` |
| **¿Hay diseño Figma para SafeWalkPage, BudgetPage, DayRoutePanel?** | Sin Figma → Copilot implementa siguiendo el design system existente (Tailwind + colores VIAZA) |
| **¿Quieres IA Assistant (chat) en Fase 3 o puedes vivir sin ella para el lanzamiento?** | Si no → eliminar de Fase 3 y liberar 2 semanas |

### 📦 ASSETS que necesito

| Asset | Dónde va |
|-------|---------|
| Ícono del módulo Safety (SVG) | `src/assets/icons/` o inline en activeModulesEngine |
| Ícono del módulo Budget | Mismo |
| Textos de "números de bloqueo de tarjeta" por país para modo robo/pérdida | `src/config/cardBlockContacts.ts` o Patty proporciona JSON |

---

## 5. SPRINT 1 — 5 BLOQUES DE TRABAJO

> Duración estimada: 5–7 días de trabajo intensivo
> Orden de ejecución: secuencial (cada bloque depende del anterior sólo donde se indica)

---

### BLOQUE 1: Fix Android + Safety Tables (Día 1)

**Objetivo:** Base lista para compilar en dispositivo físico y schema de safety en producción.

```bash
# Paso 1: Fix Android build blocker
cd /Users/pg/Documents/VIAZA/viaza/android
chmod +x gradlew
./gradlew --version   # verificar que funciona

# Paso 2: Aplicar migración de safety en producción
# En Supabase Dashboard → SQL Editor → ejecutar:
# contenido de migrations/20260328_safety_layer.sql (definido en Módulo 1)
```

**Archivos a crear:**
- `viaza/supabase/migrations/20260328_safety_layer.sql` ← copiar SQL de Módulo 1

**Criterio de aceptación:**
- `./gradlew --version` ejecuta sin error
- Las 4 tablas safety existen en Supabase (safety_sessions, safety_checkins, sos_events, offline_queue)
- RLS activado en las 4 tablas

**Validar en Android:** Compilar APK debug: `./gradlew assembleDebug` → instalar en dispositivo

---

### BLOQUE 2: SafeWalkPage MVP (Días 1–2)

**Objetivo:** Primera versión funcional de Safe Walk con tracking real en DB.

**Archivos a crear:**
```
viaza/src/services/safeTrackingService.ts
viaza/src/modules/safety/pages/SafeWalkPage.tsx
viaza/src/modules/safety/hooks/useSafeWalk.ts
viaza/supabase/functions/safety-tracking/index.ts
```

**Archivos a modificar:**
```
viaza/src/app/router/index.tsx     → añadir ruta /safety/safewalk
viaza/src/engines/activeModulesEngine.ts → añadir 'safety' como ActiveModuleId
viaza/src/modules/trips/pages/HomePage.tsx → añadir Safety en módulos visibles
```

**Flujo mínimo:**
1. Usuario abre SafeWalkPage → introduce nombre del compañero + duración estimada
2. Tap "Iniciar Safe Walk" → crea `safety_session` en DB vía edge function
3. App obtiene GPS cada 5 minutos → `POST /checkin` al edge function
4. Botón "Llegué bien" → marca sesión como `completed`
5. Botón rojo "SOS" → inserta `sos_event` + abre WhatsApp (comportamiento actual mantenido)

**Criterio de aceptación:**
- Iniciar sesión crea registro en `safety_sessions` visible en Supabase Table Editor
- Cada 5 minutos aparece nuevo registro en `safety_checkins`
- Al terminar, `safety_sessions.status = 'completed'` y `ended_at` tiene valor
- SOS crea registro en `sos_events`

**Validar en Android:** Instalar APK debug, iniciar Safe Walk, verificar en Supabase Dashboard que los datos llegan.

---

### BLOQUE 3: Split Bill → DB (Día 2–3)

**Objetivo:** Split Bill persiste en Supabase. El quickwin más rápido del backlog.

**Paso previo:** Leer el schema exacto de `split_bill_sessions` y `split_bill_expenses` en `schema_viaza.sql`.

**Archivos a crear:**
```
viaza/src/services/splitBillService.ts
  └── createSession(tripId, title, currency): INSERT split_bill_sessions
  └── addExpense(sessionId, amount, paidBy, participants): INSERT split_bill_expenses
  └── getSessionsByTrip(tripId): SELECT split_bill_sessions WHERE trip_id
  └── getExpensesBySession(sessionId): SELECT split_bill_expenses WHERE session_id
  └── calculateSplit(sessionId): compute who owes whom
```

**Archivos a modificar:**
```
viaza/src/modules/split-bill/pages/SplitBillPage.tsx
  └── Añadir opción "Guardar esta cuenta" → llama splitBillService.createSession()
  └── Añadir sección "Cuentas anteriores" → lista de split_bill_sessions del viaje
  └── Mantener calculadora local para uso inmediato (no bloquear por red)
```

**Criterio de aceptación:**
- "Guardar cuenta" crea sesión en DB con monto total y participantes
- Al reabrir la app, las sesiones anteriores del viaje están visibles
- La calculadora rápida sigue funcionando sin conexión

---

### BLOQUE 4: Wallet DocViewer + Expiration (Días 3–4)

**Objetivo:** Los documentos se pueden ver en la app. La fecha de vencimiento se extrae y alerta.

**Migración SQL (aplicar primero):**
```sql
-- Ejecutar en Supabase SQL Editor:
-- contenido de migrations/20260328_wallet_expiration.sql (definido en Módulo 3)
```

**Archivos a crear:**
```
viaza/src/modules/wallet/components/DocViewer.tsx
viaza/src/modules/wallet/components/ExpirationBadge.tsx
viaza/supabase/migrations/20260328_wallet_expiration.sql
```

**Archivos a modificar:**
```
viaza/src/types/wallet.ts           → añadir expiration_date, ocr_name, ocr_doc_number
viaza/src/services/walletDocsService.ts → añadir campos al toRow()/fromRow()
viaza/src/modules/wallet/pages/WalletPage.tsx
  └── Tap en documento → abrir DocViewer
  └── Mostrar ExpirationBadge si expiration_date existe
  └── Al recibir respuesta OCR → actualizar expiration_date, ocr_name, ocr_doc_number
```

**DocViewer — implementación mínima:**
```typescript
// signed URL temporal (1 hora) para el viewer:
const { data } = await supabase.storage
  .from('wallet_docs')
  .createSignedUrl(doc.storagePath, 3600);

// Render:
if (doc.mimeType?.startsWith('image/')) {
  return <img src={data.signedUrl} className="max-w-full" />;
}
if (doc.mimeType === 'application/pdf') {
  return <iframe src={data.signedUrl} className="h-full w-full" />;
}
```

**Criterio de aceptación:**
- Tap en documento PDF → se abre viewer (iframe) con el documento real
- Tap en imagen → se abre con posibilidad de zoom
- Botón "Analizar" extrae y guarda `expiration_date` en DB
- Card del documento muestra badge naranja si vence en < 90 días

---

### BLOQUE 5: Push Infrastructure (Días 4–5)

**Objetivo:** FCM token capturado y guardado. Base para push en Safety y Flight Alerts.

**Requisito previo de Patty:** Firebase Service Account JSON (ver §4).

**Migración SQL:**
```sql
-- Ejecutar en Supabase SQL Editor:
-- contenido de migrations/20260328_push_tokens.sql (definido en Módulo 5)
```

**Archivos a crear:**
```
viaza/src/services/pushNotificationService.ts
viaza/supabase/functions/send-push/index.ts
viaza/supabase/migrations/20260328_push_tokens.sql
```

**Archivos a modificar:**
```
viaza/src/App.tsx o viaza/src/app/providers/AppProviders.tsx
  └── useEffect → pushNotificationService.requestPermission() después de auth
```

**Instalar si no está:**
```bash
cd viaza
npm install @capacitor/push-notifications
npx cap sync android
```

**Criterio de aceptación:**
- Al abrir la app autenticado, solicita permiso de notificaciones
- Si acepta, token FCM se guarda en `push_tokens` (visible en Supabase)
- Edge function `send-push` responde 200 a llamada de prueba
- Token se actualiza si ya existe (upsert por user_id + fcm_token)

---

## 6. QUÉ PUEDE EMPEZAR COPILOT HOY

Sin necesitar nada de Patty, puedo empezar inmediatamente:

### ✅ Sin dependencias externas

1. **Fix `gradlew`**: `chmod +x android/gradlew` — 30 segundos
2. **Migración SQL Safety**: escribir el SQL completo + crear archivo de migración
3. **`safeTrackingService.ts`**: escribir servicio completo basado en schema ya definido
4. **`SafeWalkPage.tsx`**: UI + lógica con GPS real (Capacitor ya instalado)
5. **`safety-tracking` edge function**: crear función Deno completa
6. **`splitBillService.ts`**: escribir service completo (leyendo schema de `schema_viaza.sql`)
7. **Wiring `SplitBillPage.tsx`**: conectar al service — el cambio más rápido del backlog
8. **`DocViewer.tsx`**: componente con signed URL — no requiere nueva API
9. **`ExpirationBadge.tsx`**: componente visual puro
10. **Tipos `wallet.ts`**: añadir `expiration_date` y campos OCR
11. **`walletDocsService.ts`**: añadir campos al mapeo
12. **Migración SQL Wallet**: escribir y aplicar
13. **`tripBrainEngine.ts`**: motor de alertas basado solo en datos existentes en Zustand
14. **`TripReadiness` component**: barra de preparación, cálculo puro
15. **`routeLegService.ts`**: conectar `routes-transit` edge function existente a itinerario
16. **`DayRoutePanel.tsx`**: UI del panel de ruta diaria

### ⏳ Esperando confirmación de Patty (pero puedo escribir el código mientras tanto)

17. **`pushNotificationService.ts`**: el código está listo, solo falta el Service Account JSON para el edge function
18. **`send-push` edge function**: puedo escribirlo completo, solo necesita `FIREBASE_SERVICE_ACCOUNT_JSON` en Secrets
19. **`BudgetPage.tsx`**: implementar UI, tabla `trip_budget` + `trip_expenses` — no depende de Patty
20. **Migración SQL finances**: escribir completo hoy

---

## 7. QUÉ NO TOCAR TODAVÍA

| Módulo | Por qué esperar |
|--------|-----------------|
| **iOS / APNs** | Android primero. APNs requiere Mac + certificate + Apple Developer account |
| **IA Assistant (chat)** | Consume tokens caros. Necesita diseño UX. Fase 3. |
| **Roadtrip con casetas México** | No hay dataset público bueno. Necesita investigación de fuente de datos. Fase 3. |
| **Email import automático** | Requiere Gmail API auth (OAuth2 complejo) o Graph API. Fase 3. |
| **Travel Memory (bitácora)** | Cero urgencia para el lanzamiento. Fase 3. |
| **Health profiles** | Complejidad regulatoria (datos médicos). Necesita decisión de producto sobre privacidad. Fase 3. |
| **Stripe flows** | Ya funciona en producción — NO tocar a menos que haya un bug reportado. |
| **Geofencing de zonas de riesgo** | Requiere dataset de polígonos + background location. Costo alto, impacto medio. Fase 3. |
| **Schema existente sin migración** | NUNCA modificar tablas existentes sin migración versionada. Siempre `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` |

---

## APÉNDICE: INVENTARIO RÁPIDO DE ARCHIVOS CLAVE

### Archivos que más se tocarán en Sprint 1

| Archivo | Cambio |
|---------|--------|
| `viaza/src/app/router/index.tsx` | +3 rutas: /safety/safewalk, /safety/tracking/:token, /budget |
| `viaza/src/engines/activeModulesEngine.ts` | +2 módulos: 'safety', 'budget' |
| `viaza/src/modules/trips/pages/HomePage.tsx` | +ActionAlerts, +TripReadiness, +Safety en TOOLS |
| `viaza/src/modules/wallet/pages/WalletPage.tsx` | +DocViewer tap, +OCR field update, +ExpirationBadge |
| `viaza/src/modules/split-bill/pages/SplitBillPage.tsx` | +Guardar sesión, +historial |
| `viaza/src/types/wallet.ts` | +expiration_date, +ocr_name, +ocr_doc_number |
| `viaza/src/services/walletDocsService.ts` | +toRow/fromRow campos nuevos |
| `viaza/android/gradlew` | `chmod +x` |

### Edge functions — Estado real

| Función | Estado | Sprint |
|---------|--------|--------|
| `ai-orchestrator` | ✅ Funciona | — |
| `risk-zones` | ✅ Funciona | — |
| `flight-info` | ✅ Funciona (AviationStack) | — |
| `places-nearby` | ✅ Funciona (Google) | — |
| `routes-transit` | ✅ Funciona (Google) | Modificar en Bloque 5 |
| `weather-cache` | ✅ Funciona (Open-Meteo) | — |
| `exchange-rates` | ✅ Funciona | — |
| `safety-tracking` | ❌ No existe | **Bloque 2** |
| `sos-handler` | ❌ No existe | Fase 1 S3 |
| `send-push` | ❌ No existe | **Bloque 5** |
| `flight-alerts` | ❌ No existe | Fase 2 S8 |
| `budget-insights` | ❌ No existe | Fase 2 |
| `email-import` | ❌ No existe | Fase 3 |

---

*Documento generado por GitHub Copilot — Auditor independiente — 28 Mar 2026*
*Basado en lectura directa del codebase, sin asumir nada de reportes previos.*
*Próxima revisión recomendada: al completar Sprint 1 (aprox. 7 días)*
