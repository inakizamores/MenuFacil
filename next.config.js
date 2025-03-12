/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'menufacil.com.mx',
      // Add your Supabase storage domain here
      // e.g., 'your-project-id.supabase.co'
    ],
  },
  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
};

module.exports = nextConfig; 