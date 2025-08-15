/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuration optimisée pour Vercel
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  // Augmenter limites pour upload vidéos/GIFs
  serverRuntimeConfig: {
    maxDuration: 300
  },
  // AUCUNE LIMITE de payload 
  api: {
    bodyParser: {
      sizeLimit: '1gb'
    },
    responseLimit: false
  },
  // Images et uploads sans limite
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      }
    ]
  }
}

module.exports = nextConfig