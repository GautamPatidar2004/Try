/**
 * Conditional logger utility for development-only logging.
 * Prevents console noise in production while preserving warnings and errors.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /** Debug logging - only in development */
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[DEBUG]', ...args);
  },
  
  /** Info logging - only in development */
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  
  /** Info logging - only in development */
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  
  /** Warning logging - always shown */
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  
  /** Error logging - always shown */
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};

export default logger;
