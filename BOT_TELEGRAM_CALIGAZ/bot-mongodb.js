require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const { loadConfig, saveConfig } = require('./config');
const { User, Image } = require('./models');
const { getMainKeyboard, getAdminKeyboard, getSocialManageKeyboard, getSocialLayoutKeyboard, getConfirmKeyboard } = require('./keyboards');

// Vérifier les variables d'environnement
if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN n\'est pas défini dans le fichier .env');
    process.exit(1);
}

if (!process.env.ADMIN_ID) {
    console.error('❌ ADMIN_ID n\'est pas défini dans le fichier .env');
    process.exit(1);
}

const ADMIN_ID = parseInt(process.env.ADMIN_ID);

// Configuration pour éviter les conflits
const botConfig = {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10,
            allowed_updates: ['message', 'callback_query', 'inline_query']
        }
    },
    onlyFirstMatch: true,
    filepath: false
};

// Variables globales
let bot;
let retryCount = 0;
const maxRetries = 3;

// État des utilisateurs
const userStates = {};
const activeMessages = {};
const messageHistory = {};

// Configuration globale
let config = {};

// Temps de démarrage
const botStartTime = new Date();

// Fonction pour sauvegarder/mettre à jour un utilisateur
async function saveUser(userId, userInfo = {}) {
    try {
        await User.findOneAndUpdate(
            { userId },
            {
                userId,
                username: userInfo.username,
                firstName: userInfo.first_name,
                lastName: userInfo.last_name,
                lastSeen: new Date(),
                $inc: { messageCount: 1 }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Erreur sauvegarde utilisateur:', error);
    }
}

// Vérifier si un utilisateur est admin
async function isAdmin(userId) {
    try {
        const user = await User.findOne({ userId, isAdmin: true });
        return !!user;
    } catch (error) {
        return userId === ADMIN_ID;
    }
}

// Fonction pour supprimer tous les messages d'un chat
async function deleteAllMessages(chatId) {
    if (!messageHistory[chatId]) return;
    
    for (const msgId of messageHistory[chatId]) {
        try {
            await bot.deleteMessage(chatId, msgId);
        } catch (error) {
            // Message déjà supprimé ou erreur
        }
    }
    messageHistory[chatId] = [];
}

// Fonction pour ajouter un message à l'historique
function addToHistory(chatId, messageId) {
    if (!messageHistory[chatId]) {
        messageHistory[chatId] = [];
    }
    messageHistory[chatId].push(messageId);
    
    // Garder seulement les 10 derniers messages
    if (messageHistory[chatId].length > 10) {
        messageHistory[chatId].shift();
    }
}

// Fonction améliorée pour envoyer ou éditer un message
async function sendOrEditMessage(chatId, text, keyboard, parseMode = 'HTML', forceNew = false) {
    try {
        // Si forceNew, supprimer tous les anciens messages
        if (forceNew) {
            await deleteAllMessages(chatId);
            delete activeMessages[chatId];
        }
        
        if (activeMessages[chatId] && !forceNew) {
            try {
                await bot.editMessageText(text, {
                    chat_id: chatId,
                    message_id: activeMessages[chatId],
                    reply_markup: keyboard,
                    parse_mode: parseMode
                });
                return activeMessages[chatId];
            } catch (error) {
                // Si l'édition échoue, envoyer un nouveau message
            }
        }
        
        const sentMsg = await bot.sendMessage(chatId, text, {
            reply_markup: keyboard,
            parse_mode: parseMode
        });
        activeMessages[chatId] = sentMsg.message_id;
        addToHistory(chatId, sentMsg.message_id);
        return sentMsg.message_id;
    } catch (error) {
        console.error('Erreur envoi message:', error);
    }
}

// Définir tous les handlers du bot
function setupBotHandlers() {
    // Commande /start
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        // Sauvegarder l'utilisateur et marquer qu'il a démarré le bot
        await saveUser(userId, msg.from);
        await User.updateOne({ userId }, { hasStarted: true });
        
        // NE PAS supprimer la commande /start - la laisser visible
        
        // Supprimer tous les anciens messages du bot
        await deleteAllMessages(chatId);
        
        // Message personnalisé
        const firstName = msg.from.first_name || 'là';
        const welcomeText = config.welcomeMessage
            ? config.welcomeMessage.replace('{firstname}', firstName)
            : `Bienvenue ${firstName}! 👋`;
        
        // Envoyer le message d'accueil
        if (config.welcomeImage) {
            try {
                const sentMsg = await bot.sendPhoto(chatId, config.welcomeImage, {
                    caption: welcomeText,
                    reply_markup: getMainKeyboard(config),
                    parse_mode: 'HTML'
                });
                activeMessages[chatId] = sentMsg.message_id;
                addToHistory(chatId, sentMsg.message_id);
            } catch (error) {
                // Si l'image échoue, envoyer juste le texte
                await sendOrEditMessage(chatId, welcomeText, getMainKeyboard(config), 'HTML', true);
            }
        } else {
            await sendOrEditMessage(chatId, welcomeText, getMainKeyboard(config), 'HTML', true);
        }
    });

    // Commande /admin
    bot.onText(/\/admin/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        // Supprimer le message de commande
        try {
            await bot.deleteMessage(chatId, msg.message_id);
        } catch (error) {}
        
        // Vérifier si l'utilisateur est admin
        if (!await isAdmin(userId)) {
            const errorMsg = await bot.sendMessage(chatId, '❌ Accès refusé. Cette commande est réservée aux administrateurs.');
            setTimeout(() => bot.deleteMessage(chatId, errorMsg.message_id).catch(() => {}), 3000);
            return;
        }
        
        // Supprimer tous les anciens messages
        await deleteAllMessages(chatId);
        
        // Afficher le menu admin
        await showAdminMenu(chatId);
    });

    // Callback pour les boutons
    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id;
        const userId = callbackQuery.from.id;
        const data = callbackQuery.data;
        
        // Répondre au callback pour enlever le "chargement"
        await bot.answerCallbackQuery(callbackQuery.id);
        
        // Gestion des différents callbacks
        switch(data) {
            case 'info':
                await handleInfo(chatId);
                break;
                
            case 'back_to_menu':
                await handleBackToMenu(chatId, userId);
                break;
                
            case 'admin_message':
                if (await isAdmin(userId)) {
                    userStates[userId] = 'waiting_welcome_message';
                    await sendOrEditMessage(chatId, 
                        '📝 <b>Modifier le message d\'accueil</b>\n\n' +
                        'Envoyez le nouveau message d\'accueil.\n' +
                        'Vous pouvez utiliser {firstname} pour personnaliser le message.\n\n' +
                        '<i>Envoyez /cancel pour annuler.</i>',
                        { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_back' }]] }
                    );
                }
                break;
                
            case 'admin_photo':
                if (await isAdmin(userId)) {
                    userStates[userId] = 'waiting_welcome_photo';
                    await sendOrEditMessage(chatId,
                        '🖼️ <b>Modifier la photo d\'accueil</b>\n\n' +
                        'Envoyez la nouvelle photo d\'accueil.\n' +
                        'La photo sera affichée avec le message d\'accueil.\n\n' +
                        '<i>Envoyez /cancel pour annuler.</i>',
                        { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_back' }]] }
                    );
                }
                break;
                
            case 'admin_miniapp':
                if (await isAdmin(userId)) {
                    await handleMiniAppConfig(chatId, userId);
                }
                break;
                
            case 'admin_social':
                if (await isAdmin(userId)) {
                    await handleSocialConfig(chatId);
                }
                break;
                
            case 'admin_info':
                if (await isAdmin(userId)) {
                    userStates[userId] = 'waiting_info_text';
                    await sendOrEditMessage(chatId,
                        'ℹ️ <b>Modifier les informations</b>\n\n' +
                        'Envoyez le nouveau texte pour la section informations.\n\n' +
                        '<i>Envoyez /cancel pour annuler.</i>',
                        { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_back' }]] }
                    );
                }
                break;
                
            case 'admin_broadcast':
                if (await isAdmin(userId)) {
                    await handleBroadcast(chatId, userId);
                }
                break;
                
            case 'admin_admins':
                if (await isAdmin(userId)) {
                    await handleAdminManagement(chatId, userId);
                }
                break;
                
            case 'admin_stats':
                if (await isAdmin(userId)) {
                    await handleStats(chatId);
                }
                break;
                
            case 'admin_back':
                if (await isAdmin(userId)) {
                    // Nettoyer l'état et retourner au menu admin
                    delete userStates[userId];
                    
                    // Supprimer tous les anciens messages
                    await deleteAllMessages(chatId);
                    
                    // Afficher le menu admin
                    await showAdminMenu(chatId);
                }
                break;
                
            // Gestion des réseaux sociaux
            case 'social_add':
                if (await isAdmin(userId)) {
                    userStates[userId] = 'adding_social_name';
                    await sendOrEditMessage(chatId,
                        '➕ <b>Ajouter un réseau social</b>\n\n' +
                        '1️⃣ Envoyez le nom du réseau (ex: Instagram)\n\n' +
                        '<i>Envoyez /cancel pour annuler.</i>',
                        { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_social' }]] }
                    );
                }
                break;
                
            case 'social_remove':
                if (await isAdmin(userId)) {
                    await handleSocialRemove(chatId);
                }
                break;
                
            case 'social_layout':
                if (await isAdmin(userId)) {
                    await handleSocialLayout(chatId);
                }
                break;
                
            // Gestion des admins
            case 'admin_add':
                if (userId === ADMIN_ID) {
                    userStates[userId] = 'adding_admin';
                    await sendOrEditMessage(chatId,
                        '➕ <b>Ajouter un administrateur</b>\n\n' +
                        'Envoyez l\'ID Telegram du nouvel admin.\n' +
                        'Pour obtenir un ID, la personne doit utiliser @userinfobot\n\n' +
                        '<i>Envoyez /cancel pour annuler.</i>',
                        { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_admins' }]] }
                    );
                }
                break;
                
            case 'admin_remove':
                if (userId === ADMIN_ID) {
                    await handleAdminRemove(chatId);
                }
                break;
                
            case 'broadcast_all':
                if (await isAdmin(userId)) {
                    userStates[userId] = 'broadcast_message';
                    await sendOrEditMessage(chatId,
                        '📢 <b>Message à tous les utilisateurs</b>\n\n' +
                        'Envoyez le message à diffuser.\n' +
                        'Il sera envoyé à tous les utilisateurs du bot.\n\n' +
                        '<i>Envoyez /cancel pour annuler.</i>',
                        { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_back' }]] }
                    );
                }
                break;
        }
        
        // Callbacks pour supprimer un réseau social
        if (data.startsWith('remove_social_')) {
            const index = parseInt(data.replace('remove_social_', ''));
            if (config.socialNetworks && config.socialNetworks[index]) {
                config.socialNetworks.splice(index, 1);
                await saveConfig(config);
                await sendOrEditMessage(chatId, '✅ Réseau social supprimé!', { inline_keyboard: [] });
                setTimeout(() => handleSocialConfig(chatId), 1000);
            }
        }
        
        // Callbacks pour supprimer un admin
        if (data.startsWith('remove_admin_')) {
            const adminId = parseInt(data.replace('remove_admin_', ''));
            if (userId === ADMIN_ID && adminId !== ADMIN_ID) {
                await User.findOneAndUpdate({ userId: adminId }, { isAdmin: false });
                await sendOrEditMessage(chatId, '✅ Administrateur supprimé!', { inline_keyboard: [] });
                setTimeout(() => handleAdminManagement(chatId, userId), 1000);
            }
        }
        
        // Callbacks pour le layout des réseaux sociaux
        if (data.startsWith('layout_')) {
            const buttonsPerRow = parseInt(data.replace('layout_', ''));
            config.socialButtonsPerRow = buttonsPerRow;
            await saveConfig(config);
            await sendOrEditMessage(chatId, `✅ Disposition mise à jour: ${buttonsPerRow} boutons par ligne`, { inline_keyboard: [] });
            setTimeout(() => handleSocialConfig(chatId), 1000);
        }
    });

    // Gestion des messages texte
    bot.on('message', async (msg) => {
        if (msg.text && msg.text.startsWith('/')) return;
        if (msg.photo) return; // Géré séparément
        
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userState = userStates[userId];
        
        // Supprimer le message de l'utilisateur pour garder le chat propre
        if (userState) {
            try {
                await bot.deleteMessage(chatId, msg.message_id);
            } catch (error) {}
        }
        
        // Gérer les annulations
        if (msg.text === '/cancel') {
            delete userStates[userId];
            await sendOrEditMessage(chatId, '❌ Action annulée.', { inline_keyboard: [] });
            setTimeout(() => showAdminMenu(chatId), 1000);
            return;
        }
        
        // Gérer les différents états
        switch(userState) {
            case 'waiting_welcome_message':
                config.welcomeMessage = msg.text;
                await saveConfig(config);
                delete userStates[userId];
                await sendOrEditMessage(chatId, '✅ Message d\'accueil mis à jour!', { inline_keyboard: [] });
                setTimeout(() => showAdminMenu(chatId), 1000);
                break;
                
            case 'waiting_info_text':
                config.infoText = msg.text;
                await saveConfig(config);
                delete userStates[userId];
                await sendOrEditMessage(chatId, '✅ Texte des informations mis à jour!', { inline_keyboard: [] });
                setTimeout(() => showAdminMenu(chatId), 1000);
                break;
                
            case 'config_miniapp':
                if (msg.text.toLowerCase() === 'remove') {
                    config.miniApp = { url: null, text: '🎮 Mini Application' };
                    await saveConfig(config);
                    delete userStates[userId];
                    await sendOrEditMessage(chatId, '✅ Mini application supprimée!', { inline_keyboard: [] });
                    setTimeout(() => showAdminMenu(chatId), 1000);
                } else if (msg.text.startsWith('http')) {
                    userStates[userId] = 'config_miniapp_text';
                    userStates[userId + '_url'] = msg.text;
                    await sendOrEditMessage(chatId,
                        '📱 <b>Configuration Mini App - Étape 2/2</b>\n\n' +
                        'Maintenant, envoyez le texte du bouton.\n' +
                        'Exemple: 🎮 Jouer maintenant',
                        { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_back' }]] }
                    );
                } else {
                    await sendOrEditMessage(chatId, '❌ URL invalide. Elle doit commencer par http:// ou https://', { inline_keyboard: [] });
                }
                break;
                
            case 'config_miniapp_text':
                const url = userStates[userId + '_url'];
                config.miniApp = { url, text: msg.text };
                await saveConfig(config);
                delete userStates[userId];
                delete userStates[userId + '_url'];
                await sendOrEditMessage(chatId, '✅ Mini application configurée!', { inline_keyboard: [] });
                setTimeout(() => showAdminMenu(chatId), 1000);
                break;
                
            case 'adding_social_name':
                userStates[userId] = 'adding_social_url';
                userStates[userId + '_social_name'] = msg.text;
                await sendOrEditMessage(chatId,
                    '➕ <b>Ajouter un réseau social - Étape 2/3</b>\n\n' +
                    '2️⃣ Maintenant, envoyez l\'URL complète.\n' +
                    'Exemple: https://instagram.com/votrepage',
                    { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_social' }]] }
                );
                break;
                
            case 'adding_social_url':
                userStates[userId] = 'adding_social_emoji';
                userStates[userId + '_social_url'] = msg.text;
                await sendOrEditMessage(chatId,
                    '➕ <b>Ajouter un réseau social - Étape 3/3</b>\n\n' +
                    '3️⃣ Enfin, envoyez un emoji pour ce réseau.\n' +
                    'Exemple: 📷 ou 🐦 ou 👍',
                    { inline_keyboard: [[{ text: '❌ Annuler', callback_data: 'admin_social' }]] }
                );
                break;
                
            case 'adding_social_emoji':
                const name = userStates[userId + '_social_name'];
                const socialUrl = userStates[userId + '_social_url'];
                const emoji = msg.text;
                
                if (!config.socialNetworks) config.socialNetworks = [];
                config.socialNetworks.push({ name, url: socialUrl, emoji });
                await saveConfig(config);
                
                delete userStates[userId];
                delete userStates[userId + '_social_name'];
                delete userStates[userId + '_social_url'];
                
                await sendOrEditMessage(chatId, '✅ Réseau social ajouté!', { inline_keyboard: [] });
                setTimeout(() => handleSocialConfig(chatId), 1000);
                break;
                
            case 'adding_admin':
                const newAdminId = parseInt(msg.text);
                if (!isNaN(newAdminId)) {
                    await User.findOneAndUpdate(
                        { userId: newAdminId },
                        { userId: newAdminId, isAdmin: true },
                        { upsert: true }
                    );
                    delete userStates[userId];
                    await sendOrEditMessage(chatId, '✅ Nouvel administrateur ajouté!', { inline_keyboard: [] });
                    setTimeout(() => handleAdminManagement(chatId, userId), 1000);
                } else {
                    await sendOrEditMessage(chatId, '❌ ID invalide. Envoyez un nombre.', { inline_keyboard: [] });
                }
                break;
                
            case 'broadcast_message':
                await handleBroadcastSend(chatId, userId, msg.text);
                break;
        }
    });

    // Gestion des photos
    bot.on('photo', async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userState = userStates[userId];
        
        // Supprimer le message photo pour garder le chat propre
        if (userState === 'waiting_welcome_photo') {
            try {
                await bot.deleteMessage(chatId, msg.message_id);
            } catch (error) {}
            
            try {
                // Récupérer la photo la plus grande
                const photo = msg.photo[msg.photo.length - 1];
                const fileId = photo.file_id;
                
                // Sauvegarder l'ID de la photo (Telegram garde les photos)
                config.welcomeImage = fileId;
                await saveConfig(config);
                
                delete userStates[userId];
                await sendOrEditMessage(chatId, '✅ Photo d\'accueil mise à jour!', { inline_keyboard: [] });
                
                setTimeout(() => showAdminMenu(chatId), 1000);
            } catch (error) {
                console.error('Erreur sauvegarde photo:', error);
                await sendOrEditMessage(chatId, '❌ Erreur lors de la sauvegarde de la photo.', { inline_keyboard: [] });
            }
        }
    });

    // Gestion des erreurs
    bot.on('polling_error', async (error) => {
        console.error('Erreur polling:', error.message);
        
        // Si c'est une erreur 409 (conflit), essayer de redémarrer
        if (error.message && error.message.includes('409')) {
            console.log('⚠️ Conflit détecté, tentative de reconnexion...');
            
            try {
                // Arrêter le polling actuel
                await bot.stopPolling();
                
                // Attendre un peu
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Redémarrer
                await createBot();
            } catch (restartError) {
                console.error('❌ Impossible de redémarrer:', restartError.message);
            }
        }
    });
}

// Fonctions helper
async function showAdminMenu(chatId) {
    // Afficher le menu admin
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const uptime = Math.floor((Date.now() - botStartTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const adminText = `🔧 <b>Panel d'administration</b>\n\n` +
        `📊 <b>Statistiques:</b>\n` +
        `• Utilisateurs: ${totalUsers}\n` +
        `• Administrateurs: ${totalAdmins}\n` +
        `• En ligne depuis: ${hours}h ${minutes}min\n\n` +
        `Que souhaitez-vous faire?`;
    
    await sendOrEditMessage(chatId, adminText, getAdminKeyboard(), 'HTML', true);
}

async function handleInfo(chatId) {
    const infoText = config.infoText || 'ℹ️ Aucune information disponible.';
    
    // Supprimer tous les anciens messages
    await deleteAllMessages(chatId);
    
    if (config.welcomeImage) {
        try {
            const sentMsg = await bot.sendPhoto(chatId, config.welcomeImage, {
                caption: infoText,
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔙 Retour', callback_data: 'back_to_menu' }
                    ]]
                },
                parse_mode: 'HTML'
            });
            activeMessages[chatId] = sentMsg.message_id;
            addToHistory(chatId, sentMsg.message_id);
        } catch (error) {
            // Si l'image échoue, envoyer juste le texte
            await sendOrEditMessage(chatId, infoText, {
                inline_keyboard: [[
                    { text: '🔙 Retour', callback_data: 'back_to_menu' }
                ]]
            }, 'HTML', true);
        }
    } else {
        await sendOrEditMessage(chatId, infoText, {
            inline_keyboard: [[
                { text: '🔙 Retour', callback_data: 'back_to_menu' }
            ]]
        }, 'HTML', true);
    }
}

async function handleBackToMenu(chatId, userId) {
    // Supprimer tous les anciens messages
    await deleteAllMessages(chatId);
    
    const user = await User.findOne({ userId });
    const firstName = user?.firstName || 'là';
    const welcomeText = config.welcomeMessage
        ? config.welcomeMessage.replace('{firstname}', firstName)
        : `Bienvenue ${firstName}! 👋`;
    
    // Afficher le message d'accueil avec l'image si elle existe
    if (config.welcomeImage) {
        try {
            const sentMsg = await bot.sendPhoto(chatId, config.welcomeImage, {
                caption: welcomeText,
                reply_markup: getMainKeyboard(config),
                parse_mode: 'HTML'
            });
            activeMessages[chatId] = sentMsg.message_id;
            addToHistory(chatId, sentMsg.message_id);
        } catch (error) {
            // Si l'image échoue, envoyer juste le texte
            await sendOrEditMessage(chatId, welcomeText, getMainKeyboard(config), 'HTML', true);
        }
    } else {
        await sendOrEditMessage(chatId, welcomeText, getMainKeyboard(config), 'HTML', true);
    }
}

async function handleMiniAppConfig(chatId, userId) {
    userStates[userId] = 'config_miniapp';
    await sendOrEditMessage(chatId,
        '📱 <b>Configuration Mini App</b>\n\n' +
        `URL actuelle: ${config.miniApp?.url || 'Non définie'}\n` +
        `Texte du bouton: ${config.miniApp?.text || '🎮 Mini Application'}\n\n` +
        'Envoyez l\'URL de votre mini application ou "remove" pour la supprimer.\n' +
        'Format: https://votre-app.com\n\n' +
        '<i>Envoyez /cancel pour annuler.</i>',
        { inline_keyboard: [[{ text: '🔙 Retour', callback_data: 'admin_back' }]] }
    );
}

async function handleSocialConfig(chatId) {
    const text = '🌐 <b>Gestion des réseaux sociaux</b>\n\n' +
        'Réseaux actuels:\n' +
        (config.socialNetworks?.map((n, i) => `${i + 1}. ${n.emoji} ${n.name}`).join('\n') || 'Aucun') +
        '\n\nQue voulez-vous faire?';
    
    await sendOrEditMessage(chatId, text, getSocialManageKeyboard());
}

async function handleSocialRemove(chatId) {
    if (!config.socialNetworks || config.socialNetworks.length === 0) {
        await sendOrEditMessage(chatId, '❌ Aucun réseau social à supprimer.', { inline_keyboard: [] });
        setTimeout(() => handleSocialConfig(chatId), 1000);
        return;
    }
    
    const keyboard = config.socialNetworks.map((network, index) => [{
        text: `❌ ${network.emoji} ${network.name}`,
        callback_data: `remove_social_${index}`
    }]);
    
    keyboard.push([{ text: '🔙 Retour', callback_data: 'admin_social' }]);
    
    await sendOrEditMessage(chatId,
        '❌ <b>Supprimer un réseau social</b>\n\nCliquez sur le réseau à supprimer:',
        { inline_keyboard: keyboard }
    );
}

async function handleSocialLayout(chatId) {
    await sendOrEditMessage(chatId,
        '📐 <b>Disposition des boutons</b>\n\n' +
        `Actuellement: ${config.socialButtonsPerRow || 3} boutons par ligne\n\n` +
        'Choisissez le nombre de boutons par ligne:',
        getSocialLayoutKeyboard()
    );
}

async function handleBroadcast(chatId, userId) {
    const totalUsers = await User.countDocuments();
    
    await sendOrEditMessage(chatId,
        '📢 <b>Diffusion de message</b>\n\n' +
        `Ce message sera envoyé à ${totalUsers} utilisateurs.\n\n` +
        'Choisissez une option:',
        {
            inline_keyboard: [
                [{ text: '📤 Envoyer à tous', callback_data: 'broadcast_all' }],
                [{ text: '🔙 Retour', callback_data: 'admin_back' }]
            ]
        }
    );
}

async function handleBroadcastSend(chatId, userId, message) {
    delete userStates[userId];
    
    await sendOrEditMessage(chatId, '📤 Envoi en cours...', { inline_keyboard: [] });
    
    // Ne récupérer que les utilisateurs qui acceptent les notifications et ont démarré le bot
    const users = await User.find({ 
        acceptsNotifications: { $ne: false },
        hasStarted: { $ne: false }
    });
    let sent = 0;
    let failed = 0;
    let startTime = Date.now();
    
    // Message d'information sur le processus
    await sendOrEditMessage(chatId,
        `📤 <b>Diffusion en cours...</b>\n\n` +
        `Total d'utilisateurs: ${users.length}\n` +
        `⏱️ Temps estimé: ${Math.ceil(users.length * 40 / 1000)} secondes\n\n` +
        `<i>Merci de patienter...</i>`,
        { inline_keyboard: [] }
    );
    
    for (const user of users) {
        try {
            await bot.sendMessage(user.userId, message, { parse_mode: 'HTML' });
            sent++;
            
            // ⚠️ IMPORTANT: Respecter les limites de Telegram
            // Pause de 40ms entre chaque message (25 messages/seconde max)
            await new Promise(resolve => setTimeout(resolve, 40));
            
            // Pause supplémentaire tous les 25 messages
            if (sent % 25 === 0) {
                // Pause de 1 seconde tous les 25 messages
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mise à jour du statut tous les 25 messages
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                await sendOrEditMessage(chatId,
                    `📤 <b>Diffusion en cours...</b>\n\n` +
                    `• Envoyés: ${sent}/${users.length}\n` +
                    `• Échecs: ${failed}\n` +
                    `• Temps écoulé: ${elapsed}s\n\n` +
                    `<i>Ne pas interrompre...</i>`,
                    { inline_keyboard: [] }
                );
            }
        } catch (error) {
            failed++;
            // L'utilisateur a probablement bloqué le bot
            console.log(`Échec envoi à ${user.userId}:`, error.message);
        }
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    
    await sendOrEditMessage(chatId,
        `✅ <b>Diffusion terminée!</b>\n\n` +
        `• Messages envoyés: ${sent}\n` +
        `• Échecs: ${failed}\n` +
        `• Temps total: ${totalTime}s\n` +
        `• Vitesse: ~${Math.round(sent / totalTime)} msg/s`,
        { inline_keyboard: [[{ text: '🔙 Retour', callback_data: 'admin_back' }]] }
    );
}

async function handleAdminManagement(chatId, userId) {
    const admins = await User.find({ isAdmin: true });
    
    const adminList = admins.map(admin => 
        `• ${admin.userId === ADMIN_ID ? '👑' : '👤'} ${admin.firstName || admin.username || admin.userId}`
    ).join('\n');
    
    const keyboard = [];
    
    if (userId === ADMIN_ID) {
        keyboard.push([{ text: '➕ Ajouter un admin', callback_data: 'admin_add' }]);
        if (admins.length > 1) {
            keyboard.push([{ text: '❌ Retirer un admin', callback_data: 'admin_remove' }]);
        }
    }
    
    keyboard.push([{ text: '🔙 Retour', callback_data: 'admin_back' }]);
    
    await sendOrEditMessage(chatId,
        `👥 <b>Gestion des administrateurs</b>\n\n` +
        `Administrateurs actuels:\n${adminList}\n\n` +
        `${userId === ADMIN_ID ? 'Vous êtes le super-admin 👑' : ''}`,
        { inline_keyboard: keyboard }
    );
}

async function handleAdminRemove(chatId) {
    const admins = await User.find({ isAdmin: true, userId: { $ne: ADMIN_ID } });
    
    if (admins.length === 0) {
        await sendOrEditMessage(chatId, '❌ Aucun admin à retirer.', { inline_keyboard: [] });
        setTimeout(() => handleAdminManagement(chatId, ADMIN_ID), 1000);
        return;
    }
    
    const keyboard = admins.map(admin => [{
        text: `❌ ${admin.firstName || admin.username || admin.userId}`,
        callback_data: `remove_admin_${admin.userId}`
    }]);
    
    keyboard.push([{ text: '🔙 Retour', callback_data: 'admin_admins' }]);
    
    await sendOrEditMessage(chatId,
        '❌ <b>Retirer un administrateur</b>\n\nCliquez sur l\'admin à retirer:',
        { inline_keyboard: keyboard }
    );
}

async function handleStats(chatId) {
    const totalUsers = await User.countDocuments();
    const activeToday = await User.countDocuments({
        lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    
    const uptime = Math.floor((Date.now() - botStartTime) / 1000);
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    await sendOrEditMessage(chatId,
        `📊 <b>Statistiques détaillées</b>\n\n` +
        `👥 <b>Utilisateurs:</b>\n` +
        `• Total: ${totalUsers}\n` +
        `• Actifs aujourd'hui: ${activeToday}\n` +
        `• Administrateurs: ${totalAdmins}\n\n` +
        `⏱️ <b>Uptime:</b>\n` +
        `${days}j ${hours}h ${minutes}min\n\n` +
        `🤖 <b>Version:</b> 1.0.0`,
        {
            inline_keyboard: [[
                { text: '🔙 Retour', callback_data: 'admin_back' }
            ]]
        }
    );
}

// Créer et démarrer le bot
async function createBot() {
    try {
        // Créer le bot sans polling d'abord
        bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
        
        // Supprimer le webhook s'il existe
        try {
            await bot.deleteWebHook();
            console.log('✅ Webhook supprimé (si existant)');
        } catch (error) {
            // Ignorer l'erreur si pas de webhook
        }
        
        // Attendre un peu avant de démarrer le polling
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Configurer tous les handlers
        setupBotHandlers();
        
        // Démarrer le polling
        await bot.startPolling(botConfig.polling);
        console.log('✅ Bot démarré avec succès en mode polling!');
        
        // Réinitialiser le compteur de retry
        retryCount = 0;
        
    } catch (error) {
        console.error('❌ Erreur lors du démarrage du bot:', error.message);
        
        if (error.message.includes('409') && retryCount < maxRetries) {
            retryCount++;
            console.log(`⏳ Nouvelle tentative dans 5 secondes... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return createBot();
        } else {
            console.error('❌ Impossible de démarrer le bot après', maxRetries, 'tentatives');
            process.exit(1);
        }
    }
}

// Connexion MongoDB et initialisation
async function initializeBot() {
    try {
        console.log('🚀 Initialisation du bot...');
        
        // Charger la configuration
        config = await loadConfig();
        console.log('✅ Configuration chargée');
        
        // S'assurer que l'admin principal est dans la DB
        await User.findOneAndUpdate(
            { userId: ADMIN_ID },
            { userId: ADMIN_ID, isAdmin: true },
            { upsert: true }
        );
        
        // Créer et démarrer le bot
        await createBot();
        
        console.log('✅ Bot prêt!');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du bot...');
    try {
        if (bot) {
            await bot.stopPolling();
        }
        await mongoose.connection.close();
    } catch (error) {
        console.error('Erreur lors de l\'arrêt:', error);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Arrêt du bot...');
    try {
        if (bot) {
            await bot.stopPolling();
        }
        await mongoose.connection.close();
    } catch (error) {
        console.error('Erreur lors de l\'arrêt:', error);
    }
    process.exit(0);
});

// Démarrer l'initialisation
initializeBot();

// Serveur HTTP minimal pour Render (optionnel)
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot Telegram LANATION is running! 🤖');
});

server.listen(PORT, () => {
    console.log(`🌐 Serveur HTTP démarré sur le port ${PORT} (pour Render)`);
});