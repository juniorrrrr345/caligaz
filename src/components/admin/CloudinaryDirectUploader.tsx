'use client';
import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface CloudinaryDirectUploaderProps {
  onMediaSelected: (url: string, type: 'image' | 'video') => void;
  acceptedTypes?: string;
  className?: string;
  label?: string;
}

export default function CloudinaryDirectUploader({ 
  onMediaSelected, 
  acceptedTypes = "image/*,video/*",
  className = "",
  label = "Choisir un fichier"
}: CloudinaryDirectUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState(0);

  const CLOUD_NAME = 'dwobmx6zy';
  const UPLOAD_PRESET = 'caligaz';

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError('');
    setSuccess('');
    setProgress(0);

    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB vidéo, 10MB image
    
    if (file.size > maxSize) {
      setError(`Fichier trop volumineux: ${Math.round(file.size / 1024 / 1024)}MB. Maximum ${isVideo ? '100MB' : '10MB'}`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', isVideo ? 'caligaz/videos' : 'caligaz/products');
      
      // Upload direct vers Cloudinary (sans passer par notre API)
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo ? 'video' : 'image'}/upload`;
      
      const xhr = new XMLHttpRequest();
      
      // Suivre la progression
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Promesse pour gérer la réponse
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`Erreur ${xhr.status}: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Erreur réseau'));
      });

      xhr.open('POST', cloudinaryUrl);
      xhr.send(formData);

      const result: any = await uploadPromise;
      
      console.log('✅ Upload réussi:', result);
      
      // Utiliser l'URL sécurisée
      const mediaUrl = result.secure_url;
      const mediaType = isVideo ? 'video' : 'image';
      
      setSuccess(`${isVideo ? 'Vidéo' : 'Image'} uploadée avec succès !`);
      onMediaSelected(mediaUrl, mediaType);
      
      // Reset après 3 secondes
      setTimeout(() => {
        setSuccess('');
        setProgress(0);
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Erreur upload:', error);
      setError(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`cloudinary-direct-uploader ${className}`}>
      <div className="relative">
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id={`cloudinary-upload-${Date.now()}`}
        />
        
        <label
          htmlFor={`cloudinary-upload-${Date.now()}`}
          className={`
            flex items-center justify-center gap-2 px-4 py-3 
            bg-gradient-to-r from-blue-600 to-purple-600 
            text-white font-medium rounded-lg cursor-pointer
            transition-all duration-300 
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'}
          `}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Upload... {progress}%</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>{label}</span>
            </>
          )}
        </label>

        {/* Barre de progression */}
        {uploading && progress > 0 && (
          <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mt-2 flex items-start gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div className="mt-2 flex items-start gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Info sur la configuration */}
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="text-blue-400">☁️</span>
          <span>Upload direct vers Cloudinary</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-green-400">✅</span>
          <span>Preset: {UPLOAD_PRESET} (non signé)</span>
        </div>
      </div>
    </div>
  );
}