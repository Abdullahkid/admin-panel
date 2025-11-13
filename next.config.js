/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.downxtown.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
