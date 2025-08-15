import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('🔍 API Products/All - GET Request');
    
    const { searchParams } = new URL(request.url);
    const menu = searchParams.get('menu');
    
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');
    
    // Construire le filtre pour l'admin (pas seulement les actifs)
    let filter: any = {};
    
    // Filtrer par menu si spécifié
    if (menu && ['principal', 'barcelone'].includes(menu)) {
      filter.menu = menu;
      console.log(`🎯 Filtrage admin par menu: ${menu}`);
    }
    
    const products = await productsCollection.find(filter).sort({ createdAt: -1 }).toArray();
    console.log(`📦 Produits trouvés (admin): ${products.length} ${menu ? `(menu: ${menu})` : ''}`);
    
    // Ajouter des headers pour éviter le cache
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Erreur API Products/All GET:', error);
    
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  }
}