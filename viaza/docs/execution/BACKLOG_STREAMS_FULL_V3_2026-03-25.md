# VIAZA - Backlog Técnico por Stream (Full V3)
Fecha: 2026-03-25
Estado: Activo (base operativa de ejecución)

## 1. Supuestos de capacidad
- Equipo base: 3 FE + 1 BE + 1 QA.
- Cadencia: sprints semanales con corte diario de ejecución.
- Regla: no se marca `COMPLETADO` sin evidencia (`build + lint + test + validación manual`).

## 2. Backlog por stream (A-G)

### A. Planner Intelligence
| ID | Épica | Dependencias | Estimación | Prioridad |
|---|---|---|---|---|
| A-01 | Onboarding inteligente por tipo de viaje y contexto (completo) | F1-DB base | 6 días | P0 |
| A-02 | Itinerary optimizer (zona, tiempo, clima, presupuesto) | A-01 + clima + places | 8 días | P0 |
| A-03 | Replaneación automática por clima y cambios de agenda | A-02 + Weather API | 5 días | P1 |
| A-04 | Recomendaciones persistentes con feedback loop | A-01 + trip_recommendations | 5 días | P1 |

### B. Packing Ops
| ID | Épica | Dependencias | Estimación | Prioridad |
|---|---|---|---|---|
| B-01 | Sync remoto robusto checklist + custom items | packing_items + servicios | 3 días | P0 |
| B-02 | `Packing Validation Scan` (detección/faltantes/duplicados/confianza) | storage + EF vision | 9 días | P0 |
| B-03 | `Suitcase Fit & Layout Advisor` (perfil maleta + acomodo por zonas) | B-02 + IA layout | 8 días | P0 |
| B-04 | Progreso de equipaje por viajero/categoría y QA E2E | B-01/B-02/B-03 | 4 días | P1 |

### C. Mobility
| ID | Épica | Dependencias | Estimación | Prioridad |
|---|---|---|---|---|
| C-01 | Itinerario multimodal real (car/flight/bus/train) | trips + route services | 7 días | P1 |
| C-02 | Roadtrip avanzado (casetas/gasolineras/paradas seguras/check mecánico) | proveedor peajes + POI | 10 días | P1 |
| C-03 | Estado de vuelo y alertas contexto viaje | Aviation API + agenda | 4 días | P2 |

### D. Wallet & OCR
| ID | Épica | Dependencias | Estimación | Prioridad |
|---|---|---|---|---|
| D-01 | OCR robusto con clasificación documental | wallet_docs + EF OCR | 7 días | P0 |
| D-02 | Expiraciones y alertas por documento | D-01 + agenda/notifications | 5 días | P0 |
| D-03 | Modelo documental ampliado (campos por tipo) | migraciones wallet | 4 días | P1 |

### E. Emergency & Safety
| ID | Épica | Dependencias | Estimación | Prioridad |
|---|---|---|---|---|
| E-01 | Emergency QR real con auditoría de accesos | emergency_qr_access_logs | 4 días | P0 |
| E-02 | SOS asistido (WhatsApp deep link + ubicación + token) | contacto emergencia + geoloc | 5 días | P0 |
| E-03 | Safety tracking en vivo + modo sin señal básico | realtime + storage local | 10 días | P1 |
| E-04 | Risk zones y alertas de seguridad | proveedor risk API | 8 días | P1 |

### F. Finance & Shared Trip
| ID | Épica | Dependencias | Estimación | Prioridad |
|---|---|---|---|---|
| F-01 | Budget engine persistente por viaje | nuevas tablas presupuesto | 8 días | P1 |
| F-02 | Gasto colaborativo y split persistente | split_bill tables + shares | 6 días | P1 |
| F-03 | Premium móvil IAP/RevenueCat + backend sync | RevenueCat creds | 7 días | P0 |

### G. Ingestion & Memory
| ID | Épica | Dependencias | Estimación | Prioridad |
|---|---|---|---|---|
| G-01 | Importación de reservas por correo real (Gmail/Graph) | OAuth + creds proveedor | 9 días | P1 |
| G-02 | Bitácora/memoria del viaje (timeline + assets) | storage + timeline tables | 7 días | P2 |
| G-03 | Copiloto transversal con contexto del viaje | A/B/C/D/E/F + orquestador IA | 12 días | P2 |

## 3. Dependencias transversales críticas
| ID | Dependencia | Impacto | Estado |
|---|---|---|---|
| T-01 | Convención de migraciones y versionado | evita drift DB | RESUELTO (F0-08) |
| T-02 | Matriz RLS/Buckets y hardening | seguridad release | EN_CURSO |
| T-03 | CI gates (`lint/build/test:smoke`) | evita regresiones | EN_CURSO |
| T-04 | Observabilidad y errores críticos | release estable | PENDIENTE |
| T-05 | Feature flags internas por riesgo | control de rollout | PENDIENTE |

## 4. Ruta de ejecución sugerida (semanal)
1. Semana 1-2: Fase 0 completa + Fase 1 base (DB/RLS/CI/convenciones).
2. Semana 3-4: cierre P0 de A/B/D/E en paralelo.
3. Semana 5-6: completar C/F/G y estabilizar integraciones.
4. Semana 7+: hardening integral, QA E2E extendido y release stores.

## 5. Qué puede arrancar hoy sin proveedores adicionales
- B-02/B-03 (arquitectura DB+servicios base y flujo híbrido UI).
- D-01/D-02 (clasificación OCR y expiraciones con datos propios).
- E-01/E-02 (QR logs + SOS asistido client-side sin Twilio).
- A-02 base (optimizer con datos ya disponibles y reglas determinísticas).
- T-04 (observabilidad mínima y logging estructurado).

## 6. Bloqueantes externos actuales
- Risk zones provider (bloquea E-04).
- Gmail/Graph credentials (bloquea G-01).
- RevenueCat/IAP setup (bloquea F-03 cierre tiendas móvil).
- APNS/FCM producción (bloquea push productivo end-to-end).
