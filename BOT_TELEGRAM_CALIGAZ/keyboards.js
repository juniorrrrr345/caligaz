// Clavier principal
function getMainKeyboard(config) {
    const keyboard = [];
    
    // Première ligne - Mini App si configurée
    if (config.miniApp && config.miniApp.url) {
        keyboard.push([{
            text: config.miniApp.text || '🎮 Mini Application',
            web_app: { url: config.miniApp.url }
        }]);
    }
    
    // Bouton Informations
    keyboard.push([
        { text: 'ℹ️ Informations', callback_data: 'info' }
    ]);
    
    // Réseaux sociaux directement dans le menu
    if (config.socialNetworks && config.socialNetworks.length > 0) {
        const buttonsPerRow = config.socialButtonsPerRow || 3;
        
        for (let i = 0; i < config.socialNetworks.length; i += buttonsPerRow) {
            const row = [];
            for (let j = 0; j < buttonsPerRow && i + j < config.socialNetworks.length; j++) {
                const network = config.socialNetworks[i + j];
                row.push({
                    text: `${network.emoji} ${network.name}`,
                    url: network.url
                });
            }
            keyboard.push(row);
        }
    }
    
    return { inline_keyboard: keyboard };
}

// Clavier admin complet
function getAdminKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '📝 Modifier le message d\'accueil', callback_data: 'admin_edit_welcome' }
            ],
            [
                { text: '🖼️ Modifier la photo d\'accueil', callback_data: 'admin_edit_photo' }
            ],
            [
                { text: '📱 Modifier la mini application', callback_data: 'admin_edit_miniapp' }
            ],
            [
                { text: '🌐 Gérer les réseaux sociaux', callback_data: 'admin_manage_social' }
            ],
            [
                { text: 'ℹ️ Modifier les informations', callback_data: 'admin_edit_info' }
            ],
            [
                { text: '📢 Envoyer un message à tous', callback_data: 'admin_broadcast' }
            ],
            [
                { text: '👥 Gérer les administrateurs', callback_data: 'admin_manage_admins' }
            ],
            [
                { text: '📊 Statistiques du bot', callback_data: 'admin_stats' }
            ],
            [
                { text: '❌ Fermer', callback_data: 'admin_close' }
            ]
        ]
    };
}

// Clavier de gestion des réseaux sociaux
function getSocialManageKeyboard(config) {
    const keyboard = [];
    
    // Afficher les réseaux sociaux existants
    if (config.socialNetworks && config.socialNetworks.length > 0) {
        config.socialNetworks.forEach((network, index) => {
            keyboard.push([{
                text: `${network.emoji} ${network.name}`,
                callback_data: `social_view_${index}`
            }]);
        });
    }
    
    // Boutons d'action
    keyboard.push([
        { text: '➕ Ajouter', callback_data: 'admin_add_social' },
        { text: '📐 Disposition', callback_data: 'admin_social_layout' }
    ]);
    
    keyboard.push([
        { text: '⬅️ Retour', callback_data: 'admin_menu' }
    ]);
    
    return { inline_keyboard: keyboard };
}

// Clavier de disposition des réseaux sociaux
function getSocialLayoutKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '1️⃣', callback_data: 'layout_1' },
                { text: '2️⃣', callback_data: 'layout_2' },
                { text: '3️⃣', callback_data: 'layout_3' }
            ],
            [
                { text: '4️⃣', callback_data: 'layout_4' },
                { text: '5️⃣', callback_data: 'layout_5' },
                { text: '6️⃣', callback_data: 'layout_6' }
            ],
            [
                { text: '🔙 Retour', callback_data: 'admin_social' }
            ]
        ]
    };
}

// Clavier de confirmation
function getConfirmKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '✅ Confirmer', callback_data: 'confirm' },
                { text: '❌ Annuler', callback_data: 'cancel' }
            ]
        ]
    };
}

module.exports = {
    getMainKeyboard,
    getAdminKeyboard,
    getSocialManageKeyboard,
    getSocialLayoutKeyboard,
    getConfirmKeyboard
};