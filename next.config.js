/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com'],
    // For development with local images, whitelist local domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // Enable Server Components
    serverComponents: true,
    // Enable App Router
    appDir: true,
  },
};

module.exports = nextConfig;
