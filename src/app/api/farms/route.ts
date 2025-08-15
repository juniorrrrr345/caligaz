import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import Farm from '@/models/Farm';

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
    
    const farms = await Farm.find(filter).sort({ name: 1 });
    
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
    
    // Valider que le menu est correct
    if (!data.menu || !['principal', 'barcelone'].includes(data.menu)) {
      data.menu = 'principal'; // Valeur par défaut
    }
    
    // Générer le slug à partir du nom
    if (data.name && !data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const farm = new Farm(data);
    await farm.save();
    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error('Error creating farm:', error);
    return NextResponse.json({ error: 'Failed to create farm' }, { status: 500 });
  }
}