import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Farm } from '@/lib/models/Farm';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Récupérer le menu depuis les query params
    const { searchParams } = new URL(req.url);
    const menu = searchParams.get('menu') || 'caligaz';
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    console.log('Récupération des farms pour le menu:', menu, 'includeInactive:', includeInactive);
    
    // Construire le filtre
    const filter: any = { menu: menu };
    
    // Pour l'affichage public, on ne veut que les farms actives
    // Pour l'admin, on veut toutes les farms
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    // Filtrer les farms par menu
    const farms = await Farm.find(filter).sort({ order: 1, name: 1 });
    
    console.log(`✅ ${farms.length} farm(s) trouvée(s) pour le menu ${menu}`);
    console.log('🔍 Filtre utilisé:', JSON.stringify(filter));
    console.log('📋 Farms trouvées:', farms.map(f => ({ name: f.name, menu: f.menu })));
    
    // Headers pour éviter le cache et assurer la synchronisation instantanée
    return NextResponse.json(farms, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching farms:', error);
    return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    console.log('📝 Création farm - Données reçues:', JSON.stringify(data, null, 2));
    
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
    
    const farm = new Farm(data);
    await farm.save();
    
    console.log('✅ Farm créée avec succès:', { 
      id: farm._id,
      name: farm.name, 
      menu: farm.menu,
      slug: farm.slug 
    });
    
    return NextResponse.json(farm, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erreur création farm:', error);
    
    // Gestion spécifique des erreurs de duplication
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Farm déjà existante',
        details: `Une farm avec ce slug existe déjà pour ce menu`,
        duplicateKey: error.keyValue
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Erreur lors de la création',
      details: error.message || 'Erreur inconnue'
    }, { status: 500 });
  }
}