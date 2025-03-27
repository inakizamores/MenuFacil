// This file configures the initialization of Sentry on the edge runtime.
// The config you add here will be used whenever an edge function handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const Sentry = require('@sentry/nextjs');

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
}); 