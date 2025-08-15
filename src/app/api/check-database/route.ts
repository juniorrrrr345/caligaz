import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Vérifier les catégories
    const categoriesCollection = db.collection('categories');
    const allCategories = await categoriesCollection.find({}).toArray();
    const categoryIndexes = await categoriesCollection.indexes();
    
    // Vérifier les farms
    const farmsCollection = db.collection('farms');
    const allFarms = await farmsCollection.find({}).toArray();
    const farmIndexes = await farmsCollection.indexes();
    
    // Chercher les doublons
    const duplicateCategories = await categoriesCollection.aggregate([
      { $group: { 
        _id: "$name", 
        count: { $sum: 1 },
        menus: { $push: "$menu" }
      }},
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    const duplicateFarms = await farmsCollection.aggregate([
      { $group: { 
        _id: "$name", 
        count: { $sum: 1 },
        menus: { $push: "$menu" }
      }},
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    const response = {
      categories: {
        total: allCategories.length,
        byMenu: {
          caligaz: allCategories.filter(c => c.menu === 'caligaz').length,
          barcelona: allCategories.filter(c => c.menu === 'barcelona').length,
          other: allCategories.filter(c => c.menu !== 'caligaz' && c.menu !== 'barcelona').length
        },
        duplicates: duplicateCategories.map(d => ({
          name: d._id,
          count: d.count,
          menus: d.menus
        })),
        indexes: categoryIndexes.map(i => ({
          name: i.name,
          key: i.key,
          unique: i.unique || false
        })),
        list: allCategories.map(c => ({
          id: c._id,
          name: c.name,
          menu: c.menu,
          isActive: c.isActive !== false
        }))
      },
      farms: {
        total: allFarms.length,
        byMenu: {
          caligaz: allFarms.filter(f => f.menu === 'caligaz').length,
          barcelona: allFarms.filter(f => f.menu === 'barcelona').length,
          other: allFarms.filter(f => f.menu !== 'caligaz' && f.menu !== 'barcelona').length
        },
        duplicates: duplicateFarms.map(d => ({
          name: d._id,
          count: d.count,
          menus: d.menus
        })),
        indexes: farmIndexes.map(i => ({
          name: i.name,
          key: i.key,
          unique: i.unique || false
        })),
        list: allFarms.map(f => ({
          id: f._id,
          name: f.name,
          menu: f.menu,
          isActive: f.isActive !== false
        }))
      },
      hasProblems: duplicateCategories.length > 0 || duplicateFarms.length > 0 ||
                   categoryIndexes.some(i => i.key && i.key.name === 1 && Object.keys(i.key).length === 1) ||
                   farmIndexes.some(i => i.key && i.key.name === 1 && Object.keys(i.key).length === 1)
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}