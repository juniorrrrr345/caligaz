import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import Farm from '@/models/Farm';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const menuFilter = searchParams.get('menu');
    
    // Pour l'admin, on peut vouloir voir toutes les farms ou filtrer par menu
    const filter: any = {};
    
    // Ajouter le filtre par menu si spécifié
    if (menuFilter && ['principal', 'barcelone'].includes(menuFilter)) {
      filter.menu = menuFilter;
    }
    
    const farms = await Farm.find(filter).sort({ menu: 1, name: 1 });
    
    // Headers pour éviter le cache et assurer la synchronisation instantanée
    return NextResponse.json(farms, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching all farms:', error);
    return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
  }
}