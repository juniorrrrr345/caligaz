import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Farm } from '@/lib/models/Farm';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    console.log('Récupération de TOUTES les farms (admin)');
    
    // Récupérer TOUTES les farms sans filtre
    const farms = await Farm.find({}).sort({ menu: 1, order: 1, name: 1 });
    
    console.log(`✅ ${farms.length} farms trouvées au total`);
    
    // Headers pour éviter le cache
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