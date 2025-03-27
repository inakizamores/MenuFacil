// This file configures the initialization of Sentry for Edge API routes.
// The config is used by the Sentry webpack plugin during the Next.js build process.

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value to control the sampling rate
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // Sample 10% in production, all in development
  
  // Enable Debug Mode only in non-production environments
  debug: process.env.NODE_ENV !== 'production',
  
  // Ensure environment is properly set
  environment: process.env.NODE_ENV,
  
  // Configure additional context for Edge runtime
  initialScope: {
    tags: {
      'app.type': 'edge',
      'app.version': process.env.npm_package_version || '0.0.0',
    },
  },
}); 