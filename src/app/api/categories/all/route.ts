import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Category } from '@/lib/models/Category';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    console.log('Récupération de TOUTES les catégories (admin)');
    
    // Récupérer TOUTES les catégories sans filtre
    const categories = await Category.find({}).sort({ menu: 1, order: 1, name: 1 });
    
    console.log(`✅ ${categories.length} catégories trouvées au total`);
    
    // Headers pour éviter le cache
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}