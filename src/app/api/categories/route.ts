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
    
    console.log('📝 Création catégorie - Données reçues:', JSON.stringify(data, null, 2));
    
    // Valider les champs requis
    if (!data.name || !data.menu) {
      return NextResponse.json({ 
        error: 'Champs requis manquants',
        details: 'name et menu sont obligatoires' 
      }, { status: 400 });
    }
    
    // Générer le slug si manquant
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    const category = new Category(data);
    await category.save();
    
    console.log('✅ Catégorie créée avec succès:', { 
      id: category._id,
      name: category.name, 
      menu: category.menu,
      slug: category.slug 
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erreur création catégorie:', error);
    
    // Gestion spécifique des erreurs de duplication
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Catégorie déjà existante',
        details: `Une catégorie avec ce slug existe déjà pour ce menu`,
        duplicateKey: error.keyValue
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Erreur lors de la création',
      details: error.message || 'Erreur inconnue'
    }, { status: 500 });
  }
}