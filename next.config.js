/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.menufacil.app',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es',
  },
  eslint: {
    // Warning instead of error during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning instead of error during builds
    ignoreBuildErrors: true,
  },
  // Security Headers Configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ];
  },
  // Customize poweredByHeader (remove "Powered by Next.js" header)
  poweredByHeader: false,
  transpilePackages: ["lucide-react"],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'menufacil.vercel.app', '*.menufacil.app'],
    },
  },
};

// Sentry webpack plugin options
const sentryWebpackPluginOptions = {
  // Additional options for the Sentry webpack plugin
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
};

// Wrap with Sentry config only in production to avoid issues in development
module.exports = process.env.NODE_ENV === 'production' 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig; 