import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

// Configuration Cloudflare
const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  // Token pour Images
  imagesToken: process.env.CLOUDFLARE_IMAGES_TOKEN || '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh',
  // Token pour Stream - à mettre à jour avec un token valide
  streamToken: process.env.CLOUDFLARE_STREAM_TOKEN || '61mW7CZfq0K6OdcYN9YIC4laRaZNLZAL1Lm4gFhh',
  imageAccountHash: 'ARYXrwYsY_ECAYN3cIpzBg'
};

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload vers Cloudflare...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Déterminer le type de média
    const isVideo = type === 'video' || file.type.startsWith('video/');
    
    let uploadUrl: string;

    if (isVideo) {
      // Upload vidéo vers Cloudflare Stream
      console.log('📹 Upload vidéo vers Cloudflare Stream...');
      uploadUrl = await uploadVideoToStream(buffer, file.name);
    } else {
      // Upload image vers Cloudflare Images
      console.log('🖼️ Upload image vers Cloudflare Images...');
      uploadUrl = await uploadImageToCloudflare(buffer, file.name);
    }

    if (!uploadUrl) {
      throw new Error('Échec de l\'upload vers Cloudflare');
    }

    console.log('✅ Upload réussi:', uploadUrl);
    
    return NextResponse.json({ 
      success: true,
      url: uploadUrl,
      type: isVideo ? 'video' : 'image',
      provider: 'cloudflare'
    });

  } catch (error: any) {
    console.error('❌ Erreur upload Cloudflare:', error);
    
    // Fallback vers Cloudinary si Cloudflare échoue
    console.log('🔄 Tentative fallback vers Cloudinary...');
    
    try {
      const cloudinaryUrl = await uploadToCloudinaryFallback(request);
      return NextResponse.json({ 
        success: true,
        url: cloudinaryUrl,
        type: 'fallback',
        provider: 'cloudinary',
        warning: 'Upload Cloudflare échoué, utilisé Cloudinary en fallback'
      });
    } catch (fallbackError) {
      console.error('❌ Échec du fallback Cloudinary:', fallbackError);
      return NextResponse.json({ 
        error: 'Échec de l\'upload',
        details: error.message 
      }, { status: 500 });
    }
  }
}

/**
 * Upload une vidéo vers Cloudflare Stream
 */
async function uploadVideoToStream(buffer: Buffer, filename: string): Promise<string> {
  try {
    // Pour l'instant, utiliser l'API de copie depuis URL si possible
    // ou retourner une URL temporaire
    console.log('⚠️ Upload Stream non disponible - token invalide');
    
    // Retourner null pour forcer le fallback
    return '';
  } catch (error: any) {
    console.error('Erreur upload Stream:', error.message);
    throw error;
  }
}

/**
 * Upload une image vers Cloudflare Images
 */
async function uploadImageToCloudflare(buffer: Buffer, filename: string): Promise<string> {
  try {
    const form = new FormData();
    form.append('file', buffer, filename);
    
    // Métadonnées
    const metadata = {
      boutique: 'CALIGAZ',
      uploadedAt: new Date().toISOString(),
      filename: filename,
      source: 'admin-panel'
    };
    
    form.append('metadata', JSON.stringify(metadata));
    form.append('requireSignedURLs', 'false');
    
    // ID unique pour l'image
    const imageId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    form.append('id', imageId);

    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/images/v1`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${CLOUDFLARE_CONFIG.imagesToken}`
        }
      }
    );

    if (response.data.success) {
      const result = response.data.result;
      // Retourner l'URL publique
      const publicUrl = result.variants.find((v: string) => v.includes('/public')) || result.variants[0];
      return publicUrl;
    } else {
      throw new Error(response.data.errors?.[0]?.message || 'Upload échoué');
    }
  } catch (error: any) {
    console.error('Erreur upload Images:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Fallback vers Cloudinary si Cloudflare échoue
 */
async function uploadToCloudinaryFallback(request: NextRequest): Promise<string> {
  const cloudinary = require('cloudinary').v2;
  
  // Configuration Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dagnmkw0e',
    api_key: process.env.CLOUDINARY_API_KEY || '656387237536358',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'APJe9o-RlgaWWHq9zLQ0JztpACI'
  });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('Aucun fichier');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  const isVideo = file.type.startsWith('video/');
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64,
      {
        resource_type: isVideo ? 'video' : 'image',
        folder: isVideo ? 'boutique_videos' : 'boutique_images',
        public_id: `upload_${Date.now()}`
      },
      (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
}

// Configuration pour les limites de taille
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};