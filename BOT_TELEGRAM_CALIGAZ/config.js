const fs = require('fs-extra');
const path = require('path');

// Dossier pour stocker les images
const IMAGES_DIR = path.join(__dirname, 'images');
fs.ensureDirSync(IMAGES_DIR);

// Chemin du fichier de configuration
const CONFIG_FILE = path.join(__dirname, 'config.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const ADMINS_FILE = path.join(__dirname, 'admins.json');

// Configuration par défaut LAMAINVERTE
const defaultConfig = {
    welcomeMessage: "🌿 Bienvenue {firstname} sur LAMAINVERTE!\n\n🛍️ Découvrez notre boutique en ligne de produits naturels et bio.\n\nUtilisez les boutons ci-dessous pour naviguer.",
    welcomeImage: null,
    infoText: "ℹ️ À propos de LAMAINVERTE\n\n🌿 LAMAINVERTE est votre boutique en ligne spécialisée dans les produits naturels et biologiques.\n\n✅ Produits 100% naturels\n✅ Livraison rapide\n✅ Service client réactif\n\nVisitez notre boutique en ligne pour découvrir tous nos produits!",
    miniApp: {
        url: "https://lamainverte.onrender.com",
        text: "🛍️ Boutique LAMAINVERTE"
    },
    socialNetworks: [
        { name: "Instagram", url: "https://instagram.com/lamainverte", emoji: "📷" },
        { name: "Facebook", url: "https://facebook.com/lamainverte", emoji: "👍" },
        { name: "WhatsApp", url: "https://wa.me/", emoji: "💬" },
        { name: "Telegram", url: "https://t.me/lamainverte", emoji: "✈️" },
        { name: "Site Web", url: "https://lamainverte.onrender.com", emoji: "🌐" }
    ],
    socialButtonsPerRow: 3,
    lastModified: new Date().toISOString()
};

// Charger la configuration depuis le fichier local
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const config = fs.readJsonSync(CONFIG_FILE);
            console.log('✅ Configuration chargée depuis config.json');
            return config;
        } else {
            console.log('⚠️ Aucune configuration trouvée, création de la configuration par défaut...');
            fs.writeJsonSync(CONFIG_FILE, defaultConfig, { spaces: 2 });
            console.log('✅ Configuration par défaut créée');
            return defaultConfig;
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement de la configuration:', error);
        return defaultConfig;
    }
}

// Sauvegarder la configuration dans le fichier local
function saveConfig(config) {
    try {
        config.lastModified = new Date().toISOString();
        fs.writeJsonSync(CONFIG_FILE, config, { spaces: 2 });
        console.log('✅ Configuration sauvegardée dans config.json');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde de la configuration:', error);
        return false;
    }
}

// Charger les utilisateurs
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            return fs.readJsonSync(USERS_FILE);
        }
        return {};
    } catch (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        return {};
    }
}

// Sauvegarder les utilisateurs
function saveUsers(users) {
    try {
        fs.writeJsonSync(USERS_FILE, users, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des utilisateurs:', error);
        return false;
    }
}

// Charger les admins
function loadAdmins() {
    try {
        if (fs.existsSync(ADMINS_FILE)) {
            return new Set(fs.readJsonSync(ADMINS_FILE));
        }
        return new Set([parseInt(process.env.ADMIN_ID)]);
    } catch (error) {
        console.error('❌ Erreur lors du chargement des admins:', error);
        return new Set([parseInt(process.env.ADMIN_ID)]);
    }
}

// Sauvegarder les admins
function saveAdmins(admins) {
    try {
        fs.writeJsonSync(ADMINS_FILE, Array.from(admins), { spaces: 2 });
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des admins:', error);
        return false;
    }
}

// Réinitialiser la configuration
function resetConfig() {
    try {
        fs.writeJsonSync(CONFIG_FILE, defaultConfig, { spaces: 2 });
        console.log('🔄 Configuration réinitialisée');
        return defaultConfig;
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error);
        return defaultConfig;
    }
}

// Obtenir le chemin d'une image
function getImagePath(imageName) {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    return path.join(IMAGES_DIR, imageName);
}

module.exports = {
    loadConfig,
    saveConfig,
    loadUsers,
    saveUsers,
    loadAdmins,
    saveAdmins,
    resetConfig,
    getImagePath,
    IMAGES_DIR,
    defaultConfig
};