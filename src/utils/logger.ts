/**
 * Frontend Logger Utility
 *
 * A lightweight wrapper around console that:
 * - Suppresses debug/info logs in production
 * - Formats messages consistently
 * - Allows easy future extension (e.g., send errors to a remote logging service)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV !== 'production';

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  return meta !== undefined
    ? `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`
    : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

const logger = {
  debug: (message: string, meta?: unknown) => {
    if (isDev) {
       
      console.debug(formatMessage('debug', message, meta));
    }
  },

  info: (message: string, meta?: unknown) => {
    if (isDev) {
       
      console.info(formatMessage('info', message, meta));
    }
  },

  warn: (message: string, meta?: unknown) => {
    // Warnings always show in dev; suppressed in production
    if (isDev) {
       
      console.warn(formatMessage('warn', message, meta));
    }
  },

  error: (message: string, meta?: unknown) => {
    // Errors always logged to console (both dev and prod)
    // In production you could also send to a remote service here
     
    console.error(formatMessage('error', message, meta));
  },
};

export default logger;
