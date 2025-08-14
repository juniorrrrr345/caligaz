import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Category } from '@/lib/models/Category';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Récupérer le menu depuis les query params
    const { searchParams } = new URL(req.url);
    const menu = searchParams.get('menu') || 'caligaz';
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    console.log('Récupération des catégories pour le menu:', menu, 'includeInactive:', includeInactive);
    
    // Construire le filtre
    const filter: any = { menu: menu };
    
    // Pour l'affichage public, on ne veut que les catégories actives
    // Pour l'admin, on veut toutes les catégories
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    // Filtrer les catégories par menu
    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    
    console.log(`✅ ${categories.length} catégorie(s) trouvée(s) pour le menu ${menu}`);
    console.log('🔍 Filtre utilisé:', JSON.stringify(filter));
    console.log('📋 Catégories trouvées:', categories.map(c => ({ name: c.name, menu: c.menu })));
    
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
    
    console.log('📝 Création catégorie - Données reçues:', data);
    console.log('📝 Menu spécifié:', data.menu);
    
    const category = new Category(data);
    await category.save();
    
    console.log('✅ Catégorie créée:', { name: category.name, menu: category.menu });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}