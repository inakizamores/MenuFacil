// This file is used to initialize Sentry instrumentation for client-side code
// https://nextjs.org/docs/app/api-reference/config/next-config-js/clientInstrumentationHook

import * as Sentry from '@sentry/nextjs';

// This function is called in client browser context
export function register() {
  // Only initialize Sentry if we have a DSN
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Sample 10% of transactions in production, all in development
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Debug mode (only in development)
      debug: process.env.NODE_ENV !== 'production',
      
      // Session Replay configuration
      replaysSessionSampleRate: 0.1, // 10% of all sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    });
  }
} 