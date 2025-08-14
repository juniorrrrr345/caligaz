import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const menuSlug = searchParams.get('menu') || 'caligaz';
    
    // Récupérer TOUT pour ce menu
    const [categories, farms, products] = await Promise.all([
      db.collection('categories').find({ menu: menuSlug }).toArray(),
      db.collection('farms').find({ menu: menuSlug }).toArray(),
      db.collection('products').find({ menu: menuSlug }).toArray()
    ]);
    
    // Récupérer aussi les infos du menu
    const menu = await db.collection('menus').findOne({ slug: menuSlug });
    
    return NextResponse.json({
      menuDemande: menuSlug,
      menuTrouve: menu ? {
        name: menu.name,
        slug: menu.slug,
        _id: menu._id
      } : null,
      stats: {
        categories: categories.length,
        farms: farms.length,
        products: products.length
      },
      details: {
        categories: categories.map(c => ({ 
          name: c.name, 
          menu: c.menu,
          isActive: c.isActive 
        })),
        farms: farms.map(f => ({ 
          name: f.name, 
          menu: f.menu,
          isActive: f.isActive 
        })),
        products: products.map(p => ({ 
          name: p.name, 
          menu: p.menu,
          category: p.category,
          farm: p.farm 
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}