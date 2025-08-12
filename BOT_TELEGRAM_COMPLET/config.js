const mongoose = require('mongoose');
require('dotenv').config();

// Connexion MongoDB avec options améliorées
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-bot', mongoOptions)
    .then(() => {
        console.log('✅ Connecté à MongoDB');
        console.log('📍 Database:', mongoose.connection.name);
    })
    .catch(err => {
        console.error('❌ Erreur connexion MongoDB:', err);
        process.exit(1);
    });

// Schéma pour la configuration du bot
const configSchema = new mongoose.Schema({
    botId: { type: String, default: 'main', unique: true, required: true },
    welcomeMessage: { type: String, default: "🌾 Bienvenue {firstname} chez CaliGaz ⛽️ !\n\n🛍️ Découvrez notre boutique de produits premium\n🌿 Qualité garantie et livraison rapide\n\nUtilisez les boutons ci-dessous pour naviguer." },
    welcomeImage: { type: String, default: null },
    infoText: { type: String, default: "🌾 À propos de CaliGaz ⛽️\n\n🛍️ Station-service de qualité spécialisée dans les produits premium\n🌿 Qualité garantie\n🚚 Livraison rapide et sécurisée\n📱 Support client 24/7\n\n💚 Votre satisfaction est notre priorité !" },
    miniApp: {
        url: { type: String, default: null },
        text: { type: String, default: "🛍️ Boutique CaliGaz ⛽️" }
    },
    socialNetworks: [{
        name: String,
        url: String,
        emoji: String
    }],
    socialButtonsPerRow: { type: Number, default: 3 },
    lastModified: { type: Date, default: Date.now }
}, { timestamps: true });

const Config = mongoose.model('BotConfig', configSchema);

// Configuration par défaut
const defaultConfig = {
    botId: 'main',
    welcomeMessage: "🌾 Bienvenue {firstname} chez CaliGaz ⛽️ !\n\n🛍️ Découvrez notre boutique de produits premium\n🌿 Qualité garantie et livraison rapide\n\nUtilisez les boutons ci-dessous pour naviguer.",
    welcomeImage: "https://i.imgur.com/TZVe6uQ.png",
    infoText: "🌾 À propos de CaliGaz ⛽️\n\n🛍️ Station-service de qualité spécialisée dans les produits premium\n🌿 Qualité garantie\n🚚 Livraison rapide et sécurisée\n📱 Support client 24/7\n\n💚 Votre satisfaction est notre priorité !",
    miniApp: {
        url: null,
        text: "🛍️ Boutique CaliGaz ⛽️"
    },
    socialNetworks: [
        { name: "Instagram", url: "https://instagram.com/caligaz", emoji: "📷" },
        { name: "Telegram", url: "https://t.me/caligazchannel", emoji: "💬" },
        { name: "WhatsApp", url: "https://wa.me/contact", emoji: "📱" }
    ],
    socialButtonsPerRow: 3
};

// Charger la configuration depuis MongoDB
async function loadConfig() {
    try {
        console.log('📖 Chargement de la configuration...');
        let config = await Config.findOne({ botId: 'main' }).lean();
        
        if (!config) {
            console.log('⚠️ Aucune configuration trouvée, création de la configuration par défaut...');
            config = await Config.create(defaultConfig);
            console.log('✅ Configuration par défaut créée');
            return config.toObject();
        }
        
        console.log('✅ Configuration chargée:', {
            welcomeMessage: config.welcomeMessage?.substring(0, 50) + '...',
            welcomeImage: config.welcomeImage ? 'Définie' : 'Non définie',
            socialNetworks: config.socialNetworks?.length || 0,
            lastModified: config.lastModified
        });
        
        return config;
    } catch (error) {
        console.error('❌ Erreur lors du chargement de la configuration:', error);
        return defaultConfig;
    }
}

// Sauvegarder la configuration dans MongoDB
async function saveConfig(configData) {
    try {
        console.log('💾 Sauvegarde de la configuration...');
        
        // Nettoyer les données avant sauvegarde
        const dataToSave = {
            botId: 'main',
            welcomeMessage: configData.welcomeMessage,
            welcomeImage: configData.welcomeImage,
            infoText: configData.infoText,
            miniApp: configData.miniApp,
            socialNetworks: configData.socialNetworks,
            socialButtonsPerRow: configData.socialButtonsPerRow || 3,
            lastModified: new Date()
        };
        
        const config = await Config.findOneAndUpdate(
            { botId: 'main' },
            { $set: dataToSave },
            { 
                new: true, 
                upsert: true,
                runValidators: true
            }
        );
        
        console.log('✅ Configuration sauvegardée avec succès');
        console.log('📝 Détails sauvegardés:', {
            welcomeMessage: config.welcomeMessage?.substring(0, 50) + '...',
            welcomeImage: config.welcomeImage ? 'Définie' : 'Non définie',
            socialNetworks: config.socialNetworks?.length || 0
        });
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde de la configuration:', error);
        return false;
    }
}

// Réinitialiser la configuration (utile pour debug)
async function resetConfig() {
    try {
        await Config.deleteOne({ botId: 'main' });
        const newConfig = await Config.create(defaultConfig);
        console.log('🔄 Configuration réinitialisée');
        return newConfig.toObject();
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error);
        return defaultConfig;
    }
}

// Obtenir l'URL d'une image (stockée dans Cloudinary ou base64)
function getImagePath(imageUrl) {
    return imageUrl; // Retourne directement l'URL ou file_id Telegram
}

module.exports = {
    loadConfig,
    saveConfig,
    resetConfig,
    getImagePath,
    Config, // Exporter le modèle pour debug si nécessaire
    IMAGES_DIR: null // Plus utilisé avec MongoDB
};