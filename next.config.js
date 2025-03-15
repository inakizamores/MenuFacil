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
};

module.exports = nextConfig; 