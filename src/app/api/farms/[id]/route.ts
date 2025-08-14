import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 PUT Farm - ID reçu:', params.id);
    
    const { db } = await connectToDatabase();
    const farmsCollection = db.collection('farms');
    
    const data = await request.json();
    console.log('📝 Données reçues:', data);
    
    const { ObjectId } = require('mongodb');
    
    // Vérifier si l'ID est valide
    if (!ObjectId.isValid(params.id)) {
      console.log('❌ ID invalide:', params.id);
      return NextResponse.json({ error: 'ID farm invalide' }, { status: 400 });
    }
    
    // Nettoyer les données
    const { _id, ...updateData } = data;
    updateData.updatedAt = new Date();
    
    console.log('🔄 Tentative de mise à jour avec:', updateData);
    
    // Utiliser updateOne pour éviter les problèmes de compatibilité
    const updateResult = await farmsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    console.log('📊 Résultat updateOne:', updateResult);

    if (updateResult.matchedCount === 0) {
      console.log('❌ Farm non trouvée');
      return NextResponse.json({ error: 'Farm non trouvée' }, { status: 404 });
    }

    if (updateResult.modifiedCount === 0) {
      console.log('⚠️ Aucune modification effectuée (données identiques)');
    }

    // Récupérer la farm mise à jour
    const updatedFarm = await farmsCollection.findOne({ _id: new ObjectId(params.id) });
    
    console.log('✅ Farm mise à jour avec succès');
    return NextResponse.json(updatedFarm);
  } catch (error) {
    console.error('❌ Erreur lors de la modification:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    return NextResponse.json({ 
      error: 'Erreur lors de la modification',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 DELETE Farm - ID reçu:', params.id);
    
    const { db } = await connectToDatabase();
    const farmsCollection = db.collection('farms');
    
    const { ObjectId } = require('mongodb');
    
    // Vérifier si l'ID est valide
    if (!ObjectId.isValid(params.id)) {
      console.log('❌ ID invalide:', params.id);
      return NextResponse.json({ error: 'ID farm invalide' }, { status: 400 });
    }
    
    // Utiliser deleteOne pour plus de compatibilité
    const result = await farmsCollection.deleteOne({ _id: new ObjectId(params.id) });

    console.log('📊 Résultat deleteOne:', result);

    if (result.deletedCount === 0) {
      console.log('⚠️ Farm non trouvée ou déjà supprimée');
      return NextResponse.json({ message: 'Farm non trouvée' }, { status: 404 });
    }

    console.log('✅ Farm supprimée avec succès');
    return NextResponse.json({ message: 'Farm supprimée avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}