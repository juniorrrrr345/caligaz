import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Category } from '@/lib/models/Category';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Récupérer le menu depuis les query params
    const { searchParams } = new URL(req.url);
    const menu = searchParams.get('menu') || 'caligaz';
    
    console.log('Récupération des catégories pour le menu:', menu);
    
    // Filtrer les catégories par menu
    const categories = await Category.find({ 
      menu: menu,
      isActive: true 
    }).sort({ order: 1, name: 1 });
    
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
    const category = new Category(data);
    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}