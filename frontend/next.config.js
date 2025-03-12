/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'menufacil.com.mx',
      // Supabase storage domain
      'aejxheybvxbwvjuyfhfh.supabase.co',
    ],
  },
  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
};

module.exports = nextConfig; 