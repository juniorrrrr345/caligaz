'use client';
import { useState } from 'react';

interface CloudinaryDirectUploaderProps {
  onMediaSelected: (url: string, type: 'image' | 'video') => void;
  className?: string;
}

export default function CloudinaryDirectUploader({ 
  onMediaSelected, 
  className = ""
}: CloudinaryDirectUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setProgress('Upload direct vers Cloudinary...');

    try {
      console.log('🚀 Upload DIRECT Cloudinary:', {
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024 / 1024 * 100) / 100 + 'MB'
      });

      // Configuration Cloudinary
      const cloudName = 'dwobmx6zy'; // Votre cloud name
      const uploadPreset = 'caligaz'; // Votre preset unsigned

      // FormData pour Cloudinary direct
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', file.type.startsWith('video/') ? 'boutique_videos' : 'boutique_images');

      // Upload DIRECT vers Cloudinary (bypass Vercel)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erreur Cloudinary: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Upload direct réussi:', result);

      setProgress('Upload terminé !');
      setTimeout(() => setProgress(''), 2000);

      // Retourner l'URL
      const isVideo = file.type.startsWith('video/') || file.type === 'image/gif';
      onMediaSelected(result.secure_url, isVideo ? 'video' : 'image');

      // Reset
      event.target.value = '';

    } catch (error) {
      console.error('❌ Erreur upload direct:', error);
      setError(error instanceof Error ? error.message : 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`cloudinary-direct-uploader ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className={`
            inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg 
            bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 
            text-white cursor-pointer transition-all duration-300 shadow-lg
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
          `}>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*,.mov,.avi,.3gp,.gif"
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
                ⚡ Upload DIRECT Cloudinary
              </>
            )}
          </label>
          
          <span className="text-sm text-green-400">
            BYPASS VERCEL - Vidéos jusqu'à 100MB
          </span>
        </div>

        {progress && (
          <div className="text-sm text-green-400 bg-green-900/20 px-3 py-2 rounded border border-green-500">
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