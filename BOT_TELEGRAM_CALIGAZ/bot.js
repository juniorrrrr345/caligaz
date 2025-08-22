require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');

// Configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/caligaz';
const port = process.env.PORT || 3001;

// Initialisation du bot
const bot = new TelegramBot(token, { polling: true });
const app = express();

// Connexion à MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schéma pour les commandes
const OrderSchema = new mongoose.Schema({
  userId: String,
  username: String,
  firstName: String,
  lastName: String,
  products: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: Number,
  status: {
    type: String,
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', OrderSchema);

// Commandes du bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🌟 Bienvenue chez Caligaz Shop! 🌟

Je suis votre assistant shopping. Voici ce que je peux faire pour vous:

📦 /catalogue - Voir nos produits
🛒 /commande - Passer une commande
📋 /mescommandes - Voir vos commandes
ℹ️ /aide - Obtenir de l'aide
📞 /contact - Nous contacter

Comment puis-je vous aider aujourd'hui?
  `;
  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/catalogue/, (msg) => {
  const chatId = msg.chat.id;
  const catalogueMessage = `
📦 *NOTRE CATALOGUE*

🔥 *Produits Populaires:*
• Product 1 - 10€
• Product 2 - 15€
• Product 3 - 20€

Pour commander, utilisez /commande
  `;
  bot.sendMessage(chatId, catalogueMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/commande/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Pour passer une commande, veuillez nous contacter directement via /contact ou visitez notre site web.');
});

bot.onText(/\/mescommandes/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const orders = await Order.find({ userId: userId.toString() }).sort({ createdAt: -1 }).limit(5);
    
    if (orders.length === 0) {
      bot.sendMessage(chatId, 'Vous n\'avez pas encore de commandes.');
    } else {
      let message = '📋 *Vos dernières commandes:*\n\n';
      orders.forEach((order, index) => {
        message += `${index + 1}. Commande du ${order.createdAt.toLocaleDateString()}\n`;
        message += `   Total: ${order.totalPrice}€\n`;
        message += `   Statut: ${order.status}\n\n`;
      });
      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    bot.sendMessage(chatId, 'Erreur lors de la récupération de vos commandes.');
  }
});

bot.onText(/\/aide/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
ℹ️ *AIDE*

Voici comment utiliser notre bot:

• /start - Démarrer le bot
• /catalogue - Voir tous nos produits
• /commande - Passer une nouvelle commande
• /mescommandes - Voir l'historique de vos commandes
• /contact - Obtenir nos coordonnées
• /aide - Afficher ce message d'aide

Pour toute question, n'hésitez pas à nous contacter!
  `;
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/contact/, (msg) => {
  const chatId = msg.chat.id;
  const contactMessage = `
📞 *NOUS CONTACTER*

📧 Email: contact@caligaz.shop
📱 Téléphone: +33 1 23 45 67 89
🌐 Site web: https://caligaz.shop

Heures d'ouverture:
Lundi - Vendredi: 9h00 - 18h00
Samedi: 10h00 - 16h00
  `;
  bot.sendMessage(chatId, contactMessage, { parse_mode: 'Markdown' });
});

// Gestion des messages non-commandes
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Ignorer les commandes
  if (text && text.startsWith('/')) return;
  
  // Réponse par défaut
  bot.sendMessage(chatId, 'Je ne comprends pas votre message. Utilisez /aide pour voir les commandes disponibles.');
});

// Serveur Express pour health check
app.get('/', (req, res) => {
  res.send('Bot Telegram Caligaz is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', bot: 'running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Telegram bot is running...');
});

// Gestion des erreurs
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});