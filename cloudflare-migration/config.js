/**
 * Configuration Cloudflare pour la migration des médias
 * Organisation par boutique GitHub
 */

const config = {
  // Configuration Cloudflare
  cloudflare: {
    accountId: '7979421604bd07b3bd34d3ed96222512',
    apiToken: '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh',
    
    // URLs de base
    streamUrl: 'https://api.cloudflare.com/client/v4/accounts',
    imagesUrl: 'https://api.cloudflare.com/client/v4/accounts',
    
    // URLs de livraison
    videoDeliveryUrl: 'https://iframe.videodelivery.net',
    imageDeliveryUrl: 'https://imagedelivery.net',
    imageAccountHash: 'ARYXrwYsY_ECAYN3cIpzBg'
  },

  // Configuration par boutique
  boutiques: {
    'CALIGAZ': {
      name: 'caligaz-shop',
      github: 'CALIGAZ',
      folders: {
        videos: 'CALIGAZ/videos',
        images: 'CALIGAZ/images'
      },
      cloudinary: {
        cloudName: 'dagnmkw0e',
        apiKey: '656387237536358',
        apiSecret: 'APJe9o-RlgaWWHq9zLQ0JztpACI'
      }
    },
    'CALITEK': {
      name: 'calitek-shop',
      github: 'CALITEK',
      folders: {
        videos: 'CALITEK/videos',
        images: 'CALITEK/images'
      },
      status: 'migrated' // Déjà migrée
    }
  },

  // Configuration de migration
  migration: {
    batchSize: 5, // Nombre de médias à traiter en parallèle
    retryAttempts: 3,
    retryDelay: 2000, // ms
    
    // Options pour les vidéos
    videoOptions: {
      requireSignedURLs: false,
      allowedOrigins: ['*'],
      thumbnailTimestampPct: 0.1
    },
    
    // Options pour les images
    imageOptions: {
      requireSignedURLs: false,
      variants: ['public', 'thumbnail', 'large'],
      flexibility: 'high',
      metadata: {
        source: 'cloudinary',
        migrationDate: new Date().toISOString()
      }
    }
  },

  // Base de données MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://lmvrtt2:ALcWY4mLHwvtz1X2@lmvrtt.km9x4q9.mongodb.net/lmvrtt_shop?retryWrites=true&w=majority&appName=LMVRTT',
    database: 'lmvrtt_shop',
    collections: {
      products: 'products',
      migrations: 'media_migrations'
    }
  }
};

module.exports = config;