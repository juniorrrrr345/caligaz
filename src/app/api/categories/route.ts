import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import Category from '@/models/Category';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const menuFilter = searchParams.get('menu');
    
    // Créer le filtre de base
    const filter: any = { isActive: true };
    
    // Ajouter le filtre par menu si spécifié
    if (menuFilter && ['principal', 'barcelone'].includes(menuFilter)) {
      filter.menu = menuFilter;
    }
    
    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    
    // Headers pour éviter le cache et assurer la synchronisation instantanée
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    console.log('📥 API: Données reçues:', data);
    
    // Valider que le menu est correct
    if (!data.menu || !['principal', 'barcelone'].includes(data.menu)) {
      console.log('⚠️ API: Menu invalide, correction:', data.menu, '→ principal');
      data.menu = 'principal'; // Valeur par défaut
    }
    
    console.log('💾 API: Création catégorie avec:', data);
    
    const category = new Category(data);
    await category.save();
    
    console.log('✅ API: Catégorie créée:', category._id);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('❌ API: Erreur création catégorie:', error);
    console.error('❌ API: Stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to create category', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}