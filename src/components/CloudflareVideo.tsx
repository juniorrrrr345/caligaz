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
  defaultTextTrack?: string;
  preload?: 'auto' | 'metadata' | 'none';
  startTime?: number;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
}

export default function CloudflareVideo({
  url,
  title = 'Video',
  className = '',
  autoplay = true,
  loop = true,
  muted = true,
  controls = true,
  poster,
  defaultTextTrack,
  preload = 'auto',
  startTime = 0,
  aspectRatio = '16:9'
}: CloudflareVideoProps) {
  const [isCloudflare, setIsCloudflare] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Détecter si c'est une URL Cloudflare Stream
    if (url?.includes('videodelivery.net') || url?.includes('cloudflarestream.com')) {
      setIsCloudflare(true);
      // Extraire l'ID de la vidéo de différents formats d'URL
      const patterns = [
        /videodelivery\.net\/([a-zA-Z0-9]+)/,
        /cloudflarestream\.com\/([a-zA-Z0-9]+)/,
        /iframe\.videodelivery\.net\/([a-zA-Z0-9]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          setVideoId(match[1]);
          break;
        }
      }
    } else {
      setIsCloudflare(false);
    }
  }, [url]);

  // Calculer le ratio d'aspect
  const getAspectRatioPadding = () => {
    switch (aspectRatio) {
      case '16:9': return '56.25%';
      case '4:3': return '75%';
      case '1:1': return '100%';
      case '9:16': return '177.78%';
      default: return '56.25%';
    }
  };

  // Si c'est une vidéo Cloudflare Stream, utiliser l'iframe optimisé
  if (isCloudflare && videoId) {
    const iframeUrl = new URL(`https://iframe.videodelivery.net/${videoId}`);
    
    // Configuration des paramètres de l'iframe
    const params = {
      // Contrôles de lecture
      autoplay: autoplay ? 'true' : 'false',
      loop: loop ? 'true' : 'false',
      muted: muted ? 'true' : 'false',
      controls: controls ? 'true' : 'false',
      
      // Configuration du préchargement
      preload: preload,
      
      // Temps de démarrage
      startTime: startTime > 0 ? startTime.toString() : undefined,
      
      // Poster personnalisé
      poster: poster || undefined,
      
      // Piste de sous-titres par défaut
      defaultTextTrack: defaultTextTrack || undefined,
      
      // Personnalisation de l'interface
      primaryColor: '#10b981', // Vert Emerald pour correspondre au thème
      letterboxColor: 'transparent',
      
      // Optimisations de performance
      streamlined: 'true', // Interface épurée
      responsive: 'true',  // Adaptation responsive
      pip: 'true',        // Picture-in-picture autorisé
      
      // Qualité adaptative
      quality: 'auto',
      
      // Protection de la vie privée
      doNotTrack: 'true'
    };

    // Ajouter les paramètres non-undefined à l'URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        iframeUrl.searchParams.set(key, value);
      }
    });

    return (
      <div className={`cloudflare-video-wrapper relative w-full ${className}`}>
        {/* Container responsive avec ratio d'aspect */}
        <div 
          className="relative w-full overflow-hidden rounded-lg bg-black"
          style={{ paddingBottom: getAspectRatioPadding() }}
        >
          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          )}
          
          {/* Iframe Cloudflare Stream */}
          <iframe
            src={iframeUrl.toString()}
            title={title}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            style={{
              border: 'none',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent'
            }}
          />
        </div>
        
        {/* Overlay pour les informations (optionnel) */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
            <p className="text-white text-sm truncate">{title}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback pour les vidéos non-Cloudflare (Cloudinary, YouTube, etc.)
  return (
    <div className={`video-fallback-wrapper relative w-full ${className}`}>
      <div 
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: getAspectRatioPadding() }}
      >
        {/* Pour YouTube */}
        {url?.includes('youtube.com') || url?.includes('youtu.be') ? (
          <iframe
            src={url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
            title={title}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        ) : (
          // Vidéo HTML5 standard
          <video
            src={url}
            className="absolute top-0 left-0 w-full h-full object-contain"
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline
            poster={poster}
            preload={preload}
            onLoadedMetadata={() => setIsLoading(false)}
          >
            <track kind="captions" srcLang="fr" label="Français" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        )}
      </div>
    </div>
  );
}