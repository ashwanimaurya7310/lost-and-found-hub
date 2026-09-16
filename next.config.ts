import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.50.121',
    '*.trycloudflare.com',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
