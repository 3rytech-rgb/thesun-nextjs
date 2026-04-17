/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Handle trailing slashes
  trailingSlash: false,
  
  // Redirect trailing slashes to non-trailing version
  async redirects() {
    return [
      // Handle multiple trailing slashes (e.g., /post/slug///)
      {
        source: '/:path+//:rest*',
        destination: '/:path+',
        permanent: true,
      },
      // Handle single trailing slash
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      // Redirect old post routes to new URL structure
      // Note: These redirects are handled by the pages themselves
      // /post/[slug].tsx redirects to /posts/[slug].tsx
      // /posts/[slug].tsx redirects to correct category-based URL using generatePostUrl
      // Redirect old category/post routes to new parent/child structure
      // This will be handled by the dynamic route [...slug].tsx
    ];
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Images configuration - TAMBAHKAN 'thesun.my'
  images: {
    domains: [
      'localhost',
      'sunmedia-local.local',
      '190.254.4.127',
      '190.254.2.223', // New API server
      'thesun.my', // Keep for backward compatibility
      'www.thesun.my', // Keep for backward compatibility
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
        hostname: '190.254.2.223',
        pathname: '/wp-content/**',
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