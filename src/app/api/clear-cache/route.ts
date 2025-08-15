import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    
    console.log('🧹 Nettoyage des données CaliGaz...');
    
    // Mettre à jour tous les settings qui contiennent encore d'anciennes références
    const settingsCollection = db.collection('settings');
    await settingsCollection.updateMany(
      {},
      {
        $set: {
          shopTitle: 'CaliGaz',
          shopSubtitle: '⛽ Votre boutique en ligne',
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ Nettoyage terminé');
    
    return NextResponse.json({
      success: true,
      message: 'Cache et base de données nettoyés'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du nettoyage'
    }, { status: 500 });
  }
}