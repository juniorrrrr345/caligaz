import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

// Configuration Next.js 14
export const maxDuration = 300; // 5 minutes pour les grosses vidéos
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Upload Cloudinary démarré...');
    
    // Vérifier la configuration Cloudinary
    console.log('🔧 Configuration Cloudinary:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key ? 'OK' : 'MANQUANT',
      api_secret: cloudinary.config().api_secret ? 'OK' : 'MANQUANT'
    });
    
    // NOUVELLE APPROCHE: Cloner la requête pour éviter "body disturbed"
    const clonedRequest = request.clone();
    const formData = await clonedRequest.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('❌ Aucun fichier dans la requête');
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    console.log('📁 Fichier reçu:', {
      name: file.name,
      type: file.type,
      size: Math.round(file.size / 1024 / 1024 * 100) / 100 + 'MB'
    });

    // Vérifier le type de fichier
    const allowedTypes = [
      'video/mp4', 
      'video/webm',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/mpeg',
      'video/3gpp',
      'image/jpeg',
      'image/jpg', 
      'image/png', 
      'image/webp',
      'image/gif'  // GIF ajouté
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Type non supporté: ${file.type}` 
      }, { status: 400 });
    }

    // AUCUNE LIMITE de taille pour TOUS les fichiers
    // Images, vidéos, GIFs - tout est autorisé
    const isVideo = file.type.startsWith('video/') || file.type === 'image/gif';

    console.log('☁️ Upload vers Cloudinary...');

    // Upload vers Cloudinary avec timeout
    console.log('⚡ Début upload vers Cloudinary...');
    const uploadResult = await Promise.race([
      new Promise((resolve, reject) => {
        // Configuration d'upload
        const uploadOptions: any = {
          resource_type: 'auto', // Cloudinary détecte automatiquement
          folder: isVideo ? 'boutique_videos' : 'boutique_images',
          public_id: `upload_${Date.now()}`,
          overwrite: true
        };

        // Ajouter optimisations seulement pour images
        if (!isVideo) {
          uploadOptions.quality = 'auto';
          uploadOptions.width = 800;
          uploadOptions.crop = 'limit';
        }

        console.log('☁️ Options upload:', uploadOptions);

        // MÉTHODE DIRECTE: Upload depuis le stream du fichier
        const uploadFromBuffer = async () => {
          try {
            // Lire le fichier une seule fois
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            console.log('📋 Buffer créé:', buffer.length, 'bytes');

            // Upload vers Cloudinary
            const uploadStream = cloudinary.uploader.upload_stream(
              uploadOptions,
              (error, result) => {
                if (error) {
                  console.error('❌ Erreur Cloudinary:', error);
                  reject(error);
                } else {
                  console.log('✅ Upload réussi:', result?.public_id);
                  resolve(result);
                }
              }
            );

            // Envoyer le buffer
            uploadStream.end(buffer);

          } catch (error) {
            console.error('❌ Erreur buffer:', error);
            reject(new Error('Erreur lecture fichier'));
          }
        };

        uploadFromBuffer();
      }),
    // Timeout de 4.5 minutes (moins que maxDuration)
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout - 4.5 minutes dépassées')), 270000)
    )
  ]);

    const result = uploadResult as any;
    
    const response = {
      url: result.secure_url,
      public_id: result.public_id,
      type: isVideo ? 'video' : 'image',
      filename: file.name,
      size: file.size,
      width: result.width,
      height: result.height,
      duration: result.duration || null, // Pour les vidéos
      format: result.format
    };

    console.log('🎯 Upload terminé:', {
      url: result.secure_url,
      type: response.type,
      size: Math.round(file.size / 1024 / 1024 * 100) / 100 + 'MB'
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erreur upload Cloudinary:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}