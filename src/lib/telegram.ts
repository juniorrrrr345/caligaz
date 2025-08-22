import TelegramBot from 'node-telegram-bot-api';

// Configuration du bot
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Créer une instance du bot uniquement si le token est disponible
let bot: TelegramBot | null = null;

if (BOT_TOKEN) {
  // Utiliser polling: false pour éviter les conflits avec les webhooks
  bot = new TelegramBot(BOT_TOKEN, { polling: false });
}

/**
 * Envoie un message via Telegram avec retry automatique
 */
export async function sendTelegramMessage(
  message: string,
  chatId?: string,
  retries: number = 3
): Promise<boolean> {
  if (!bot || !BOT_TOKEN) {
    console.error('❌ Bot Telegram non configuré - Token manquant');
    return false;
  }

  const targetChatId = chatId || CHAT_ID;
  
  if (!targetChatId) {
    console.error('❌ Chat ID manquant');
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📤 Tentative ${attempt}/${retries} d'envoi du message...`);
      
      // Envoyer le message avec parse_mode Markdown
      await bot.sendMessage(targetChatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
      
      console.log('✅ Message envoyé avec succès');
      return true;
      
    } catch (error: any) {
      console.error(`❌ Erreur tentative ${attempt}:`, error.message);
      
      // Si c'est la dernière tentative, on abandonne
      if (attempt === retries) {
        console.error('❌ Échec après toutes les tentatives');
        
        // Logger l'erreur complète pour debug
        if (error.response?.body) {
          console.error('Détails de l\'erreur:', error.response.body);
        }
        
        return false;
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`⏳ Attente de ${waitTime}ms avant nouvelle tentative...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return false;
}

/**
 * Envoie un message de notification pour une nouvelle commande
 */
export async function sendOrderNotification(
  orderMessage: string,
  customerInfo?: { name?: string; phone?: string }
): Promise<boolean> {
  let fullMessage = orderMessage;
  
  // Ajouter les informations client si disponibles
  if (customerInfo) {
    if (customerInfo.name) {
      fullMessage += `\n👤 Client: ${customerInfo.name}`;
    }
    if (customerInfo.phone) {
      fullMessage += `\n📞 Téléphone: ${customerInfo.phone}`;
    }
  }
  
  // Ajouter un timestamp
  const timestamp = new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris'
  });
  fullMessage += `\n\n⏰ Reçu le: ${timestamp}`;
  
  return sendTelegramMessage(fullMessage);
}

/**
 * Teste la connexion au bot Telegram
 */
export async function testTelegramConnection(): Promise<{
  success: boolean;
  message: string;
  botInfo?: any;
}> {
  if (!bot || !BOT_TOKEN) {
    return {
      success: false,
      message: 'Bot non configuré - Token manquant'
    };
  }
  
  try {
    const botInfo = await bot.getMe();
    
    // Essayer d'envoyer un message de test
    const testMessage = '🤖 Test de connexion - Bot opérationnel';
    const sent = await sendTelegramMessage(testMessage);
    
    return {
      success: sent,
      message: sent ? 'Connexion réussie' : 'Échec de l\'envoi du message test',
      botInfo
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: `Erreur de connexion: ${error.message}`
    };
  }
}

/**
 * Obtenir les informations du bot
 */
export async function getBotInfo() {
  if (!bot || !BOT_TOKEN) {
    return null;
  }
  
  try {
    return await bot.getMe();
  } catch (error) {
    console.error('Erreur lors de la récupération des infos du bot:', error);
    return null;
  }
}