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
    
    console.log('📥 Création catégorie avec données:', data);
    
    // Valider que le nom n'est pas vide
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Le nom de la catégorie est requis' }, { status: 400 });
    }
    
    // Valider que le menu est correct
    if (!data.menu || !['principal', 'barcelone'].includes(data.menu)) {
      data.menu = 'principal'; // Valeur par défaut
    }
    
    // S'assurer que tous les champs sont présents
    const categoryData = {
      name: data.name.trim(),
      emoji: data.emoji || '',
      menu: data.menu,
      isActive: data.isActive !== false,
      order: data.order || 0
    };
    
    console.log('💾 Sauvegarde catégorie:', categoryData);
    
    const category = new Category(categoryData);
    await category.save();
    
    console.log('✅ Catégorie créée:', category);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur création catégorie:', error);
    
    // Gérer les erreurs de duplication
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Une catégorie avec ce nom existe déjà',
        details: 'Nom en double'
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Erreur lors de la création de la catégorie',
      details: error.message 
    }, { status: 500 });
  }
}