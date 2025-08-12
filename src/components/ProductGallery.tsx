'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  video?: string;
  productName: string;
}

export default function ProductGallery({ images, video, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // Combiner vidéo et images dans un seul tableau
  const allMedia = video ? [{ type: 'video', url: video }, ...images.map(img => ({ type: 'image', url: img }))] : images.map(img => ({ type: 'image', url: img }));
  
  if (allMedia.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Aucune image disponible</p>
      </div>
    );
  }

  const currentMedia = allMedia[currentIndex];
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="relative w-full">
        {/* Media principal */}
        <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
          {currentMedia.type === 'video' ? (
            <video
              className="w-full h-full object-contain"
              controls
              autoPlay
              loop
              muted
              playsInline
              poster={images[0]}
            >
              <source src={currentMedia.url} type="video/mp4" />
              <source src={currentMedia.url} type="video/webm" />
              <source src={currentMedia.url} type="video/ogg" />
              Votre navigateur ne supporte pas la vidéo.
            </video>
          ) : (
            <img
              src={currentMedia.url}
              alt={`${productName} - Image ${currentIndex + 1}`}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => setShowFullscreen(true)}
            />
          )}
          
          {/* Indicateur vidéo */}
          {currentMedia.type === 'video' && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="text-sm">Vidéo</span>
            </div>
          )}
          
          {/* Navigation si plusieurs médias */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Indicateur de position */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full">
                <span className="text-sm">{currentIndex + 1} / {allMedia.length}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Miniatures */}
        {allMedia.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {allMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex ? 'border-blue-500' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {media.type === 'video' ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={`Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal plein écran pour les images */}
      {showFullscreen && currentMedia.type === 'image' && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-8 h-8" />
          </button>
          
          <img
            src={currentMedia.url}
            alt={productName}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Navigation en plein écran */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}