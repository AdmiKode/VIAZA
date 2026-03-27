export type ObservabilityLevel = 'error' | 'warn';

export interface ObservabilityEvent {
  level: ObservabilityLevel;
  source: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

const MAX_BUFFER_SIZE = 100;
const buffer: ObservabilityEvent[] = [];
let globalHandlersInstalled = false;

function toErrorShape(input: unknown): { message: string; stack?: string } {
  if (input instanceof Error) {
    return { message: input.message, stack: input.stack };
  }
  if (typeof input === 'string') {
    return { message: input };
  }
  try {
    return { message: JSON.stringify(input) };
  } catch {
    return { message: 'Unknown error' };
  }
}

function pushToBuffer(event: ObservabilityEvent): void {
  buffer.push(event);
  if (buffer.length > MAX_BUFFER_SIZE) {
    buffer.splice(0, buffer.length - MAX_BUFFER_SIZE);
  }
}

async function sendToEndpoint(event: ObservabilityEvent): Promise<void> {
  const endpoint = import.meta.env.VITE_OBSERVABILITY_ENDPOINT as string | undefined;
  if (!endpoint) return;

  const payload = JSON.stringify(event);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  if (typeof fetch !== 'undefined') {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // No romper UX por error de telemetría.
    });
  }
}

function publish(level: ObservabilityLevel, source: string, error: unknown, context?: Record<string, unknown>): void {
  const parsed = toErrorShape(error);
  const event: ObservabilityEvent = {
    level,
    source,
    message: parsed.message,
    stack: parsed.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  pushToBuffer(event);

  if (level === 'error') {
    console.error(`[observability:${source}]`, parsed.message, context ?? {});
  } else {
    console.warn(`[observability:${source}]`, parsed.message, context ?? {});
  }

  void sendToEndpoint(event);
}

export function reportError(source: string, error: unknown, context?: Record<string, unknown>): void {
  publish('error', source, error, context);
}

export function reportWarning(source: string, warning: unknown, context?: Record<string, unknown>): void {
  publish('warn', source, warning, context);
}

export function getObservabilityBuffer(): ObservabilityEvent[] {
  return [...buffer];
}

export function initGlobalErrorObservers(): void {
  if (globalHandlersInstalled || typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    reportError('window.error', event.error ?? event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError('window.unhandledrejection', event.reason);
  });

  globalHandlersInstalled = true;
}
