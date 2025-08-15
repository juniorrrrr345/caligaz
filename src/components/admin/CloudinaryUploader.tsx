'use client';
import { useState } from 'react';

interface CloudinaryUploaderProps {
  onMediaSelected: (url: string, type: 'image' | 'video') => void;
  acceptedTypes?: string;
  className?: string;
}

export default function CloudinaryUploader({ 
  onMediaSelected, 
  acceptedTypes = "image/*,video/*,.mov,.avi,.3gp,.gif",
  className = ""
}: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.type === 'image/gif';
    const maxSize = 10 * 1024 * 1024; // 10MB pour images statiques seulement
    
    // Pas de limite pour les vidéos ET GIFs, limite seulement pour les images statiques
    if (!isVideo && file.size > maxSize) {
      setError(`Image trop volumineuse: ${Math.round(file.size / 1024 / 1024)}MB. Maximum 10MB pour les images`);
      return;
    }

    setUploading(true);
    setError('');
    setProgress('Préparation upload...');

    try {
      console.log('🚀 Début upload Cloudinary:', {
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024 / 1024 * 100) / 100 + 'MB'
      });
      
      setProgress('Upload vers Cloudinary...');
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Si la réponse n'est pas JSON (timeout Vercel par exemple)
          const errorText = await response.text();
          if (errorText.includes('Function timeout')) {
            errorMessage = 'Timeout - Vidéo trop longue à uploader';
          } else if (errorText.includes('Request Entity Too Large')) {
            errorMessage = 'Fichier trop volumineux pour Vercel';
          } else {
            errorMessage = `Erreur serveur: ${response.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Upload Cloudinary réussi:', result);
      
      setProgress('Upload terminé !');
      setTimeout(() => setProgress(''), 2000);
      
      onMediaSelected(result.url, result.type);
      
      // Reset l'input
      event.target.value = '';
      
    } catch (error) {
      console.error('❌ Erreur upload Cloudinary:', error);
      setError(error instanceof Error ? error.message : 'Erreur upload inconnue');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`cloudinary-uploader ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className={`
            inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg 
            bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
            text-white cursor-pointer transition-all duration-300 shadow-lg
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
          `}>
            <input
              type="file"
              className="hidden"
              accept={acceptedTypes}
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Upload...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                ☁️ Upload Cloudinary
              </>
            )}
          </label>
          
          <span className="text-sm text-gray-400">
            Images (10MB) & Vidéos/GIFs (sans limite) - Hébergement cloud
          </span>
        </div>

        {progress && (
          <div className="text-sm text-blue-400 bg-blue-900/20 px-3 py-2 rounded border border-blue-500">
            {progress}
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}