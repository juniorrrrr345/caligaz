/**
 * Configuration centralisée pour Cloudflare
 */

export const CLOUDFLARE_CONFIG = {
  // Account ID
  accountId: '7979421604bd07b3bd34d3ed96222512',
  
  // Tokens
  tokens: {
    images: process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_TOKEN || '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh',
    stream: process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_TOKEN || '8_sayjltoEjPdiyyPTDcr3YI7ikZpRypVmli5bOl'
  },
  
  // URLs
  urls: {
    imageAccountHash: 'ARYXrwYsY_ECAYN3cIpzBg',
    imageDelivery: 'https://imagedelivery.net',
    videoDelivery: 'https://iframe.videodelivery.net',
    customerDomain: 'https://customer-kydq3j0ibf8o7lm7.cloudflarestream.com'
  },
  
  // Configuration par défaut
  defaults: {
    boutique: 'CALIGAZ',
    maxSizeMB: {
      image: 20,
      video: 100
    },
    acceptedFormats: {
      image: 'image/jpeg,image/png,image/gif,image/webp',
      video: 'video/mp4,video/webm,video/quicktime,video/x-msvideo'
    }
  },
  
  // Messages
  messages: {
    uploading: {
      image: '📸 Upload de l\'image vers Cloudflare Images...',
      video: '🎬 Upload de la vidéo vers Cloudflare Stream...'
    },
    success: {
      image: '✅ Image uploadée avec succès sur Cloudflare !',
      video: '✅ Vidéo uploadée avec succès sur Cloudflare Stream !'
    },
    error: {
      image: '❌ Erreur lors de l\'upload de l\'image',
      video: '❌ Erreur lors de l\'upload de la vidéo',
      size: '⚠️ Le fichier est trop volumineux',
      format: '⚠️ Format de fichier non supporté'
    }
  }
};

/**
 * Génère l'URL publique d'une image Cloudflare
 */
export function getCloudflareImageUrl(imageId: string, variant: 'public' | 'thumbnail' | 'large' = 'public'): string {
  return `${CLOUDFLARE_CONFIG.urls.imageDelivery}/${CLOUDFLARE_CONFIG.urls.imageAccountHash}/${imageId}/${variant}`;
}

/**
 * Génère l'URL d'une vidéo Cloudflare Stream
 */
export function getCloudflareVideoUrl(videoId: string): string {
  return `${CLOUDFLARE_CONFIG.urls.videoDelivery}/${videoId}`;
}

/**
 * Vérifie si une URL est déjà sur Cloudflare
 */
export function isCloudflareUrl(url: string): boolean {
  return url.includes('imagedelivery.net') || url.includes('videodelivery.net') || url.includes('cloudflarestream.com');
}

/**
 * Extrait l'ID d'une URL Cloudflare
 */
export function extractCloudflareId(url: string): string | null {
  // Pour les vidéos
  const videoMatch = url.match(/videodelivery\.net\/([a-zA-Z0-9]+)/);
  if (videoMatch) return videoMatch[1];
  
  // Pour les images
  const imageMatch = url.match(/imagedelivery\.net\/[^\/]+\/([^\/]+)/);
  if (imageMatch) return imageMatch[1];
  
  return null;
}