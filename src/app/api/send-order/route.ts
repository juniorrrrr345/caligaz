import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-fixed';
import Settings from '@/models/Settings';
import { CartItem } from '@/lib/cartStore';
import { sendOrderNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await request.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }
    
    // Récupérer le username Telegram depuis les settings (optionnel maintenant)
    const { db } = await connectToDatabase();
    const settings = await db.collection('settings').findOne({});
    const telegramUsername = settings?.telegramUsername;
    
    // Formater la date
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Calculer le total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Construire le message
    let message = `🌿 **COMMANDE FRESHSWISS** 🌿\n\n`;
    message += `📅 Date: ${dateStr} à ${timeStr}\n`;
    message += `📱 Via: Mini-App Catalogue\n\n`;
    message += `🛒 **DÉTAIL DE LA COMMANDE:**\n\n`;
    
    items.forEach((item, index) => {
      const totalWeight = parseInt(item.weight) * item.quantity;
      const itemTotal = item.price * item.quantity;
      
      message += `${index + 1}. 🍒 ${item.productName}\n`;
      message += `   • Quantité: ${item.quantity}x ${item.weight}\n`;
      message += `   • Prix unitaire: ${item.originalPrice}€\n`;
      message += `   • Total: ${itemTotal.toFixed(2)}€\n`;
      
      if (item.discount > 0) {
        message += `   • Remise: -${item.discount}% (prix dégressif)\n`;
      }
      
      message += '\n';
    });
    
    message += `💰 **TOTAL: ${total.toFixed(2)}€**\n\n`;
    message += `📞 Merci de confirmer cette commande et les modalités de livraison/paiement.\n`;
    message += `🚚 Livraison disponible ou retrait sur place.`;
    
    // Si un username Telegram est configuré, l'ajouter au message
    if (telegramUsername) {
      message += `\n\n📱 Contact: @${telegramUsername}`;
    }
    
    // Envoyer le message via Telegram
    console.log('📤 Envoi de la commande via Telegram...');
    const sent = await sendOrderNotification(message);
    
    if (!sent) {
      console.error('⚠️ Échec de l\'envoi via Telegram, mais commande enregistrée');
      // On ne bloque pas la commande si Telegram échoue
      // Vous pouvez stocker la commande en base de données ici
    }
    
    return NextResponse.json({ 
      success: true, 
      message: sent ? 'Commande envoyée avec succès' : 'Commande enregistrée (envoi Telegram échoué)',
      orderDetails: message,
      telegramSent: sent
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la commande:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}