/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image2url.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_SITE_NAME: 'STARLINK TOKEN WIFI',
    NEXT_PUBLIC_SITE_LOGO: 'https://image2url.com/r2/default/images/1770549973575-cea4a9bb-754b-4deb-afa7-7e89653078ae.jpg',
  },
}

module.exports = nextConfig
