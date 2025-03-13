/** @type {import('next').NextConfig} */
const nextConfig = {
  // New optimizations from Next.js 15+
  optimizePackageImports: ['@supabase/auth-helpers-nextjs', 'react-dom'],
  
  // Add Supabase storage as an image source
  images: {
    domains: ['aejxheybvxbwvjuyfhfh.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aejxheybvxbwvjuyfhfh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Disable TypeScript checking completely during the build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 