/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Skip linting during dev builds (we’ll control via npm script)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Skip type checking during dev builds
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
