import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for the application
 * This should be called during the app initialization process
 */
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // Sample 10% in production, all in development
      // Debug mode in non-production environments
      debug: process.env.NODE_ENV !== 'production',
    });
  } else {
    console.warn('Sentry DSN not found. Error tracking is disabled.');
  }
}

/**
 * Capture an exception and send it to Sentry
 * @param error The error to capture
 * @param context Additional context to include with the error
 */
export function captureException(error: Error | unknown, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error captured but not sent to Sentry (DSN not configured):', error, context);
  }
}

/**
 * Set user information for Sentry
 * @param user User information
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Clear user information from Sentry (e.g., on logout)
 */
export function clearUser() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

/**
 * Set a tag for the current Sentry scope
 * @param key Tag key
 * @param value Tag value
 */
export function setTag(key: string, value: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setTag(key, value);
  }
}

/**
 * Create a transaction for performance monitoring
 * @param name Transaction name
 * @param options Transaction options
 */
export function startTransaction(name: string, options?: Sentry.TransactionOptions) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return Sentry.startTransaction({ name, ...options });
  }
  return null;
}

// Export initialized Sentry instance
export { Sentry };

// Helper function to capture errors with context
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
};

// Helper function to capture messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export default {
  initSentry,
  captureException,
  setUser,
  clearUser,
  setTag,
  startTransaction,
  captureError,
  captureMessage,
}; 