/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ndfqysbzwckegfrmrgan.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ndfqysbzwckegfrmrgan.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
