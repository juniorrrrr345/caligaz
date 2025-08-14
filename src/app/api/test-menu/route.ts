import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb-fixed';
import { Category } from '@/lib/models/Category';
import { Farm } from '@/lib/models/Farm';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const menuSlug = searchParams.get('menu') || 'caligaz';
    
    console.log('🔍 Test de filtrage pour le menu:', menuSlug);
    
    // Récupérer les catégories pour ce menu
    const categories = await Category.find({ menu: menuSlug, isActive: true }).sort({ order: 1, name: 1 });
    const farms = await Farm.find({ menu: menuSlug, isActive: true }).sort({ order: 1, name: 1 });
    
    const result = {
      menuDemande: menuSlug,
      nombreCategories: categories.length,
      nombreFarms: farms.length,
      categories: categories.map(c => ({ name: c.name, menu: c.menu })),
      farms: farms.map(f => ({ name: f.name, menu: f.menu }))
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}