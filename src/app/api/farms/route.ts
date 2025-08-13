import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Farm } from '@/lib/models/Farm';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Récupérer le menu depuis les query params
    const { searchParams } = new URL(req.url);
    const menu = searchParams.get('menu') || 'caligaz';
    
    console.log('Récupération des farms pour le menu:', menu);
    
    // Filtrer les farms par menu
    const farms = await Farm.find({ 
      menu: menu,
      isActive: true 
    }).sort({ order: 1, name: 1 });
    
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
    const farm = new Farm(data);
    await farm.save();
    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error('Error creating farm:', error);
    return NextResponse.json({ error: 'Failed to create farm' }, { status: 500 });
  }
}