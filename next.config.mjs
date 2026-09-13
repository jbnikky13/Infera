const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1440, 1920, 2400],
    imageSizes: [256, 384, 512, 640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60 * 60 * 24,
  },
};

export default nextConfig;
