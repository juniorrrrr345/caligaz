import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Récupérer toutes les collections
    const [menus, categories, farms] = await Promise.all([
      db.collection('menus').find({}).toArray(),
      db.collection('categories').find({}).toArray(),
      db.collection('farms').find({}).toArray()
    ]);
    
    // Grouper les catégories par menu
    const categoriesByMenu: Record<string, any[]> = {};
    categories.forEach(cat => {
      const menuName = cat.menu || 'SANS_MENU';
      if (!categoriesByMenu[menuName]) {
        categoriesByMenu[menuName] = [];
      }
      categoriesByMenu[menuName].push({
        name: cat.name,
        _id: cat._id,
        menu: cat.menu
      });
    });
    
    // Grouper les farms par menu
    const farmsByMenu: Record<string, any[]> = {};
    farms.forEach(farm => {
      const menuName = farm.menu || 'SANS_MENU';
      if (!farmsByMenu[menuName]) {
        farmsByMenu[menuName] = [];
      }
      farmsByMenu[menuName].push({
        name: farm.name,
        _id: farm._id,
        menu: farm.menu
      });
    });
    
    const result = {
      menus: menus.map(m => ({ name: m.name, slug: m.slug })),
      categoriesByMenu,
      farmsByMenu,
      stats: {
        totalMenus: menus.length,
        totalCategories: categories.length,
        totalFarms: farms.length,
        categoriesWithoutMenu: categories.filter(c => !c.menu).length,
        farmsWithoutMenu: farms.filter(f => !f.menu).length
      }
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur de connexion à la base de données' }, { status: 500 });
  }
}