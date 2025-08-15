import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    
    console.log('🔧 Correction des textes admin...');
    
    // Corriger les settings
    const settingsCollection = db.collection('settings');
    
    // Mettre à jour tous les documents qui contiennent "FULL OPTION IDF"
    await settingsCollection.updateMany(
      {},
      {
        $set: {
          shopTitle: 'CaliGaz',
          shopSubtitle: '⛽ Votre boutique en ligne',
          bannerText: 'CaliGaz - Livraison rapide',
          loadingText: 'CaliGaz se charge...',
          scrollingText: '🔥 CaliGaz - Premium Quality 🔥',
          updatedAt: new Date()
        }
      }
    );
    
    // Corriger aussi dans la collection admin si elle existe
    try {
      const adminCollection = db.collection('admin');
      await adminCollection.updateMany(
        {},
        {
          $set: {
            siteName: 'CaliGaz',
            adminTitle: 'Panel Admin - CaliGaz',
            updatedAt: new Date()
          }
        }
      );
    } catch (e) {
      console.log('Pas de collection admin à corriger');
    }
    
    // Corriger dans toute autre collection qui pourrait contenir ces textes
    try {
      const configCollection = db.collection('config');
      await configCollection.updateMany(
        {},
        {
          $set: {
            appName: 'CaliGaz',
            title: 'CaliGaz',
            subtitle: 'Panel Admin - CaliGaz',
            updatedAt: new Date()
          }
        }
      );
    } catch (e) {
      console.log('Pas de collection config à corriger');
    }
    
    console.log('✅ Correction des textes terminée');
    
    return NextResponse.json({
      success: true,
      message: 'Textes admin corrigés avec succès'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Erreur correction textes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la correction des textes'
    }, { status: 500 });
  }
}