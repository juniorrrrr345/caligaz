'use client';
import { useState, useEffect } from 'react';

interface CloudflareVideoProps {
  url: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
}

export default function CloudflareVideo({
  url,
  title = 'Video',
  className = '',
  autoplay = true,
  loop = true,
  muted = true,
  controls = true,
  poster
}: CloudflareVideoProps) {
  const [isCloudflare, setIsCloudflare] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    // Détecter si c'est une URL Cloudflare Stream
    if (url?.includes('videodelivery.net')) {
      setIsCloudflare(true);
      // Extraire l'ID de la vidéo
      const match = url.match(/videodelivery\.net\/([a-zA-Z0-9]+)/);
      if (match) {
        setVideoId(match[1]);
      }
    } else {
      setIsCloudflare(false);
    }
  }, [url]);

  // Si c'est une vidéo Cloudflare Stream, utiliser l'iframe
  if (isCloudflare && videoId) {
    const iframeUrl = new URL(`https://iframe.videodelivery.net/${videoId}`);
    
    // Ajouter les paramètres
    if (autoplay) iframeUrl.searchParams.set('autoplay', 'true');
    if (loop) iframeUrl.searchParams.set('loop', 'true');
    if (muted) iframeUrl.searchParams.set('muted', 'true');
    if (!controls) iframeUrl.searchParams.set('controls', 'false');
    if (poster) iframeUrl.searchParams.set('poster', poster);
    
    // Paramètres supplémentaires pour une meilleure expérience
    iframeUrl.searchParams.set('preload', 'auto');
    iframeUrl.searchParams.set('primaryColor', '#000000');

    return (
      <div className={`cloudflare-video-container ${className}`}>
        <iframe
          src={iframeUrl.toString()}
          title={title}
          className="w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    );
  }

  // Fallback pour les vidéos non-Cloudflare (Cloudinary, etc.)
  return (
    <video
      src={url}
      className={className}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline
      poster={poster}
    >
      Votre navigateur ne supporte pas la lecture de vidéos.
    </video>
  );
}