// This file is used to initialize Sentry instrumentation for the entire application
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import { init as initServerSentry } from '@sentry/nextjs';

// This function is called once on server startup
export function register() {
  // Only initialize Sentry if it's in production or explicitly enabled
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && (process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLE_TRACING)) {
    console.log('Initializing Sentry instrumentation...');
    
    initServerSentry({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Sample 10% of transactions in production, all in development
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Debug mode in non-production environments
      debug: process.env.NODE_ENV !== 'production',
      
      // Additional server-specific configuration
      serverName: 'menufacil-server',
      initialScope: {
        tags: {
          'app.type': 'server',
          'app.version': process.env.npm_package_version || '0.0.0',
        },
      },
    });
  } else {
    console.log('Skipping Sentry initialization, DSN not provided or not in production mode.');
  }
} 