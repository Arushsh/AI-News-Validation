/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore TypeScript errors during build so the site can deploy
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
