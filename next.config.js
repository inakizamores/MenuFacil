/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['iawspochdngompqmxyhf.supabase.co'],
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
};

module.exports = nextConfig; 