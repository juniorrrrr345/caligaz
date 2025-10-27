import { NextResponse } from 'next/server';
import { testTelegramConnection, getBotInfo } from '@/lib/telegram';

export async function GET() {
  try {
    // Vérifier les variables d'environnement
    const config = {
      hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasChatId: !!process.env.TELEGRAM_CHAT_ID,
      tokenPreview: process.env.TELEGRAM_BOT_TOKEN 
        ? `${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...` 
        : 'Non configuré',
      chatId: process.env.TELEGRAM_CHAT_ID || 'Non configuré'
    };
    
    // Tester la connexion
    const testResult = await testTelegramConnection();
    
    // Obtenir les infos du bot
    const botInfo = await getBotInfo();
    
    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      config,
      botInfo: botInfo || testResult.botInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Erreur lors du test Telegram:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        config: {
          hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
          hasChatId: !!process.env.TELEGRAM_CHAT_ID
        }
      },
      { status: 500 }
    );
  }
}