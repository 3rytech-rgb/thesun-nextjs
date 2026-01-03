/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Images configuration - TAMBAHKAN 'thesun.my'
  images: {
    domains: [
      'localhost',
      'sunmedia-local.local',
      '190.254.4.127',
      'thesun.my', // ✅ TAMBAHKAN INI
      'www.thesun.my', // ✅ JIKA ADA VERSI WWW
    ],
    
    // Atau gunakan remotePatterns (lebih aman untuk Next.js versi baru)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thesun.my',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.thesun.my',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'sunmedia-local.local',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'http',
        hostname: '190.254.4.127',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/wp-content/**',
      },
    ],
    
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig