import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function GET() {
  try {
    console.log('🔍 API Settings - GET Request');
    
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('settings');
    
    let settings = await settingsCollection.findOne({});
    
    // Si aucun paramètre n'existe, créer les valeurs par défaut
    if (!settings) {
      console.log('📦 Aucun settings trouvé, création des défauts');
      const defaultSettings = {
        shopTitle: 'CaliGaz',
        shopSubtitle: '⛽ Votre boutique en ligne',
        scrollingText: '🔥 CaliGaz - Premium Quality 🔥',
        loadingText: 'CaliGaz se charge...',
        bannerText: 'CaliGaz - Livraison rapide',
        backgroundImage: '',
        backgroundOpacity: 20,
        backgroundBlur: 5,
        whatsappLink: '',
        whatsappOrderLink: '',
        telegramLink: '', // Gardé pour compatibilité
        telegramOrderLink: '', // Gardé pour compatibilité
        email: '',
        address: 'France',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await settingsCollection.insertOne(defaultSettings);
      settings = defaultSettings;
    }
    
    console.log('✅ Settings récupérés de DB:', {
      backgroundImage: settings.backgroundImage,
      backgroundOpacity: settings.backgroundOpacity,
      backgroundBlur: settings.backgroundBlur,
      hasBackgroundImage: !!settings.backgroundImage,
      telegramOrderLink: settings.telegramOrderLink
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('❌ Erreur API Settings GET:', error);
    
    // Fallback settings si erreur DB
    const fallbackSettings = {
      shopTitle: 'CaliGaz',
      shopSubtitle: '⛽ Votre boutique en ligne',
      scrollingText: '🔥 CaliGaz - Premium Quality 🔥',
      bannerText: 'CaliGaz - Livraison rapide',
      backgroundImage: '',
      backgroundOpacity: 20,
      backgroundBlur: 5,
      whatsappLink: '',
      whatsappOrderLink: '',
      email: '',
      address: ''
    };
    
    console.log('⚠️ Utilisation fallback settings');
    return NextResponse.json(fallbackSettings);
  }
}

async function updateSettings(request: Request) {
  try {
    console.log('🔧 API Settings - POST/PUT Request');
    
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('settings');
    
    const data = await request.json();
    console.log('📝 Données reçues pour sauvegarde:', {
      backgroundImage: data.backgroundImage,
      backgroundOpacity: data.backgroundOpacity,
      backgroundBlur: data.backgroundBlur,
      hasBackgroundImage: !!data.backgroundImage,
      telegramOrderLink: data.telegramOrderLink
    });
    
    // Ajouter la date de mise à jour
    data.updatedAt = new Date();
    
    // Upsert : mise à jour si existe, création sinon
    const result = await settingsCollection.replaceOne(
      {}, // Critère de recherche (vide = premier document)
      data,
      { upsert: true } // Créer si n'existe pas
    );
    
    console.log('✅ Paramètres sauvegardés en DB:', result);
    
    // Récupérer les paramètres mis à jour pour vérification
    const updatedSettings = await settingsCollection.findOne({});
    console.log('🔍 Vérification après sauvegarde:', {
      backgroundImage: updatedSettings?.backgroundImage,
      backgroundOpacity: updatedSettings?.backgroundOpacity,
      backgroundBlur: updatedSettings?.backgroundBlur,
      telegramOrderLink: updatedSettings?.telegramOrderLink
    });
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('❌ Erreur API Settings POST/PUT:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour des paramètres',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return updateSettings(request);
}

export async function POST(request: Request) {
  return updateSettings(request);
}