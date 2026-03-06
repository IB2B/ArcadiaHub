/**
 * Structured logger for ArcadiaHub.
 *
 * - In development: pretty-prints to console with level prefix and timestamp.
 * - In production: outputs newline-delimited JSON (NDJSON) suitable for log
 *   aggregation services (Axiom, Datadog, Vercel Log Drains, etc.).
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *
 *   logger.info('User logged in', { userId: 'abc123' });
 *   logger.warn('Slow query', { table: 'cases', durationMs: 1200 });
 *   logger.error('Failed to send email', { error, userId });
 *
 * To integrate with an external service, replace the `sendToExternalService`
 * stub below with your provider's SDK call.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogMeta = { [key: string]: unknown };

interface LogEntry extends LogMeta {
  level: LogLevel;
  message: string;
  timestamp: string;
}

const isDev = process.env.NODE_ENV === 'development';

/** Stub: replace with Axiom, Sentry, Datadog, etc. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sendToExternalService(_entry: LogEntry): void {
  // Example Axiom integration (install @axiomhq/js):
  // axiomClient.ingest('arcadiahub-logs', [entry]);
}

function serialize(error: unknown): LogMeta | undefined {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isDev ? error.stack : undefined,
    };
  }
  return undefined;
}

function log(level: LogLevel, message: string, meta: LogMeta = {}): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
    // Serialize Error objects for structured output
    ...(meta.error ? { error: serialize(meta.error) ?? meta.error } : {}),
  };

  if (isDev) {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message, Object.keys(meta).length ? meta : '');
        break;
      case 'info':
        console.info(prefix, message, Object.keys(meta).length ? meta : '');
        break;
      case 'warn':
        console.warn(prefix, message, Object.keys(meta).length ? meta : '');
        break;
      case 'error':
        console.error(prefix, message, Object.keys(meta).length ? meta : '');
        break;
    }
    return;
  }

  // Production: NDJSON to stdout
  // Vercel/edge environments pick this up automatically for log drains.
  console.log(JSON.stringify(entry));

  // Optionally send to an external service
  sendToExternalService(entry);
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
  info:  (message: string, meta?: LogMeta) => log('info',  message, meta),
  warn:  (message: string, meta?: LogMeta) => log('warn',  message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};
