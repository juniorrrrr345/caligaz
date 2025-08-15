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
  // Limite de payload pour gros fichiers (4.5MB par défaut -> 100MB)
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    },
    responseLimit: false
  }
}

module.exports = nextConfig