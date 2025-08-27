'use client';
import { useState, useEffect } from 'react';

interface CloudflareImageProps {
  url: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  variant?: 'public' | 'thumbnail' | 'large';
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onError?: () => void;
}

export default function CloudflareImage({
  url,
  alt,
  className = '',
  width,
  height,
  variant = 'public',
  loading = 'lazy',
  sizes,
  onError
}: CloudflareImageProps) {
  const [imageUrl, setImageUrl] = useState(url);
  const [isCloudflare, setIsCloudflare] = useState(false);

  useEffect(() => {
    if (!url) return;

    // Détecter si c'est une URL Cloudflare Images
    if (url.includes('imagedelivery.net')) {
      setIsCloudflare(true);
      
      // Si l'URL n'a pas déjà de variant, l'ajouter
      if (!url.includes('/public') && !url.includes('/thumbnail') && !url.includes('/large')) {
        // Extraire l'ID et reconstruire l'URL avec le variant
        const parts = url.split('/');
        const imageId = parts[parts.length - 1];
        const accountHash = parts[parts.length - 2];
        
        setImageUrl(`https://imagedelivery.net/${accountHash}/${imageId}/${variant}`);
      } else {
        setImageUrl(url);
      }
    } else {
      setIsCloudflare(false);
      setImageUrl(url);
    }
  }, [url, variant]);

  // Générer les paramètres de transformation pour Cloudflare
  const getCloudflareUrl = () => {
    if (!isCloudflare) return imageUrl;

    let cfUrl = imageUrl;
    const params = [];

    // Ajouter les dimensions si spécifiées
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);

    // Optimisations automatiques
    params.push('fit=scale-down'); // Ajuste l'image sans la déformer
    params.push('quality=85'); // Qualité optimale
    params.push('format=auto'); // Format automatique (WebP si supporté)

    // Si des paramètres existent, les ajouter à l'URL
    if (params.length > 0) {
      const separator = cfUrl.includes('?') ? '&' : '?';
      cfUrl = `${cfUrl}${separator}${params.join('&')}`;
    }

    return cfUrl;
  };

  const handleError = () => {
    console.error(`Erreur chargement image: ${imageUrl}`);
    
    // Fallback vers l'URL originale si erreur
    if (isCloudflare && imageUrl !== url) {
      setImageUrl(url);
      setIsCloudflare(false);
    }
    
    if (onError) {
      onError();
    }
  };

  return (
    <img
      src={getCloudflareUrl()}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      sizes={sizes}
      onError={handleError}
      // Attributs pour une meilleure performance
      decoding="async"
      fetchPriority={loading === 'eager' ? 'high' : 'auto'}
    />
  );
}