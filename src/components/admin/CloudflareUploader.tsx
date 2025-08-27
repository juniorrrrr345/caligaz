'use client';

import { useState } from 'react';
import { Upload, X, Video, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CloudflareUploaderProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function CloudflareUploader({ 
  onUploadComplete, 
  accept = "image/*,video/*",
  maxSizeMB = 50
}: CloudflareUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      toast.error(`Le fichier est trop volumineux (max ${maxSizeMB}MB)`);
      return;
    }

    // Déterminer le type
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload vers Cloudflare
    await uploadToCloudflare(file, type);
  };

  const uploadToCloudflare = async (file: File, type: 'image' | 'video') => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Simuler la progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload-cloudflare', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Échec de l\'upload');
      }

      const data = await response.json();
      
      if (data.url) {
        toast.success(`${type === 'video' ? 'Vidéo' : 'Image'} uploadée avec succès !`);
        onUploadComplete(data.url, type);
        
        // Réinitialiser après un délai
        setTimeout(() => {
          setPreview(null);
          setUploadProgress(0);
          setMediaType(null);
        }, 1500);
      } else {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast.error(error.message || 'Erreur lors de l\'upload');
      setPreview(null);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setPreview(null);
    setUploadProgress(0);
    setMediaType(null);
    setUploading(false);
  };

  return (
    <div className="w-full">
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">
              Images et vidéos (Max {maxSizeMB}MB)
            </p>
            <p className="text-xs text-blue-600 mt-2">
              ⚡ Powered by Cloudflare
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="relative w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          {/* Aperçu */}
          {mediaType === 'video' ? (
            <video 
              src={preview} 
              className="w-full h-full object-contain"
              controls
              muted
            />
          ) : (
            <img 
              src={preview} 
              alt="Aperçu" 
              className="w-full h-full object-contain"
            />
          )}

          {/* Overlay de progression */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
              <div className="w-3/4 bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-white text-sm">Upload vers Cloudflare... {uploadProgress}%</p>
            </div>
          )}

          {/* Badge de type */}
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-md shadow-md flex items-center gap-1">
            {mediaType === 'video' ? (
              <>
                <Video className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium">Vidéo</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium">Image</span>
              </>
            )}
          </div>

          {/* Bouton annuler */}
          {!uploading && (
            <button
              onClick={cancelUpload}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Badge succès */}
          {!uploading && uploadProgress === 100 && (
            <div className="absolute bottom-2 left-2 right-2 bg-green-500 text-white px-3 py-2 rounded-md flex items-center justify-center">
              <span className="text-sm font-medium">✅ Upload réussi sur Cloudflare!</span>
            </div>
          )}
        </div>
      )}

      {/* Informations */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {mediaType === 'video' ? 
          '📹 Les vidéos seront hébergées sur Cloudflare Stream' : 
          mediaType === 'image' ?
          '🖼️ Les images seront hébergées sur Cloudflare Images' :
          '☁️ Hébergement sécurisé sur Cloudflare'
        }
      </div>
    </div>
  );
}