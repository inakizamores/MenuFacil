// This file configures the initialization of Sentry on the client.
// The config is used by the Sentry webpack plugin during the Next.js build process.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value to control the sampling rate
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // Sample 10% in production, all in development
  
  // Session Replay for capturing user interactions (optional)
  replaysSessionSampleRate: 0.1, // Capture 10% of all sessions
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  
  // Enable Debug Mode only in non-production environments
  debug: process.env.NODE_ENV !== 'production',
  
  // Ensure environment is properly set
  environment: process.env.NODE_ENV,
  
  // Configure integrations
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/menufacil\.vercel\.app/],
    }),
    new Sentry.Replay({
      // Additional replay options
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
}); 