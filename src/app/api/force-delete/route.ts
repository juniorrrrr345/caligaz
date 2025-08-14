import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function DELETE(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'category' ou 'farm'
    const id = searchParams.get('id');
    
    if (!type || !id) {
      return NextResponse.json({ error: 'Type et ID requis' }, { status: 400 });
    }
    
    const { ObjectId } = require('mongodb');
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }
    
    let result;
    if (type === 'category') {
      result = await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
      console.log('🗑️ Suppression catégorie:', id, 'Résultat:', result);
    } else if (type === 'farm') {
      result = await db.collection('farms').deleteOne({ _id: new ObjectId(id) });
      console.log('🗑️ Suppression farm:', id, 'Résultat:', result);
    } else {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        error: 'Non trouvé', 
        message: `${type} avec ID ${id} non trouvé dans la base de données` 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${type} supprimé avec succès`,
      deletedCount: result.deletedCount 
    });
    
  } catch (error) {
    console.error('Erreur suppression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}