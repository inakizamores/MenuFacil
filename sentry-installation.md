# Sentry Installation Guide

To integrate Sentry for error tracking in the MenuFacil project, you need to install the following packages:

```bash
npm install @sentry/nextjs @sentry/react @sentry/tracing
```

## Configuration Files

After installing the packages, you need to create the following Sentry configuration files:

1. `sentry.client.config.js` - For client-side configuration
2. `sentry.server.config.js` - For server-side configuration
3. `sentry.edge.config.js` - For edge runtime (optional)

### Next.js Configuration

Update your `next.config.js` to include Sentry:

```js
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config
};

const sentryWebpackPluginOptions = {
  // Additional options for the Sentry webpack plugin
  silent: true, // Suppresses all logs
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
```

## Environment Variables

Make sure to add the following environment variables to your `.env` file:

```
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

## Usage

You can now use Sentry in your code by importing from our wrapper or directly from `@sentry/nextjs`:

```typescript
import { captureException } from '@/lib/sentry'; 
// or
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  captureException(error, { context: 'additional context' });
}
```

For more information, visit the [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/). 