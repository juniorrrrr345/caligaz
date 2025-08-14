import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function DELETE(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const menu = searchParams.get('menu');
    const type = searchParams.get('type'); // 'categories', 'farms', ou 'all'
    
    if (!menu) {
      return NextResponse.json({ error: 'Menu requis' }, { status: 400 });
    }
    
    const results: any = {};
    
    if (type === 'categories' || type === 'all') {
      const catResult = await db.collection('categories').deleteMany({ menu: menu });
      results.categories = {
        deleted: catResult.deletedCount,
        message: `${catResult.deletedCount} catégorie(s) supprimée(s) du menu ${menu}`
      };
    }
    
    if (type === 'farms' || type === 'all') {
      const farmResult = await db.collection('farms').deleteMany({ menu: menu });
      results.farms = {
        deleted: farmResult.deletedCount,
        message: `${farmResult.deletedCount} farm(s) supprimée(s) du menu ${menu}`
      };
    }
    
    if (type === 'all' || type === 'products') {
      const prodResult = await db.collection('products').deleteMany({ menu: menu });
      results.products = {
        deleted: prodResult.deletedCount,
        message: `${prodResult.deletedCount} produit(s) supprimé(s) du menu ${menu}`
      };
    }
    
    return NextResponse.json({
      success: true,
      menu: menu,
      results: results
    });
    
  } catch (error) {
    console.error('Erreur nettoyage:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}