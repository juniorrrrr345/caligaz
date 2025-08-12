#!/usr/bin/env node

/**
 * 🛍️ SCRIPT DE CONFIGURATION AUTOMATIQUE - BOUTIQUE UNIVERSELLE
 * 
 * Ce script vous guide pas à pas pour configurer votre nouvelle boutique
 * avec vos propres configurations MongoDB et Cloudinary.
 * 
 * Usage: node setup-boutique.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Configuration des couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Création de l'interface readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Fonction pour afficher un message coloré
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}▶${colors.reset}  ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`)
};

// Fonction pour valider une URI MongoDB
const validateMongoUri = (uri) => {
  const regex = /^mongodb(\+srv)?:\/\/.+/;
  return regex.test(uri);
};

// Fonction pour valider un username
const validateUsername = (username) => {
  return username.length >= 3 && !username.includes(' ');
};

// Fonction pour valider un mot de passe
const validatePassword = (password) => {
  return password.length >= 8;
};

// Fonction pour créer le fichier .env.local
const createEnvFile = (config) => {
  const envContent = `# ========================================
# Configuration générée automatiquement
# Date : ${new Date().toLocaleString('fr-FR')}
# ========================================

# ========================================
# 🔗 MONGODB
# ========================================
MONGODB_URI=${config.mongoUri}

# ========================================
# 🖼️ CLOUDINARY
# ========================================
CLOUDINARY_CLOUD_NAME=${config.cloudName}
CLOUDINARY_API_KEY=${config.apiKey}
CLOUDINARY_API_SECRET=${config.apiSecret}

# ========================================
# 🔐 ADMINISTRATION
# ========================================
ADMIN_USERNAME=${config.adminUsername}
ADMIN_PASSWORD=${config.adminPassword}

# ========================================
# 📱 TELEGRAM
# ========================================
TELEGRAM_USERNAME=${config.telegramUsername || ''}

# ========================================
# 🌐 APPLICATION
# ========================================
NEXT_PUBLIC_BASE_URL=${config.baseUrl || 'http://localhost:3000'}

# ========================================
# 🔒 SÉCURITÉ
# ========================================
JWT_SECRET=${config.jwtSecret || generateSecret()}
`;

  fs.writeFileSync('.env.local', envContent);
  log.success('Fichier .env.local créé avec succès !');
};

// Fonction pour générer une clé secrète
const generateSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

// Fonction pour vérifier les dépendances
const checkDependencies = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['mongodb', 'cloudinary', 'next', 'react'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      log.warning(`Dépendances manquantes : ${missingDeps.join(', ')}`);
      return false;
    }
    return true;
  } catch (error) {
    log.error('Impossible de lire package.json');
    return false;
  }
};

// Fonction principale
async function setupBoutique() {
  console.clear();
  
  // En-tête
  console.log(colors.bright + colors.cyan);
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║     🛍️  CONFIGURATION DE VOTRE NOUVELLE BOUTIQUE 🛍️      ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  log.info('Ce script va vous aider à configurer votre boutique en quelques minutes.');
  log.info('Assurez-vous d\'avoir créé vos comptes MongoDB Atlas et Cloudinary.\n');
  
  // Vérification des prérequis
  log.title('📋 VÉRIFICATION DES PRÉREQUIS');
  
  if (!fs.existsSync('package.json')) {
    log.error('package.json introuvable. Êtes-vous dans le bon dossier ?');
    process.exit(1);
  }
  
  if (!checkDependencies()) {
    log.warning('Certaines dépendances sont manquantes.');
    const install = await question('Voulez-vous les installer maintenant ? (o/n) : ');
    if (install.toLowerCase() === 'o') {
      log.info('Installation des dépendances...');
      try {
        execSync('npm install', { stdio: 'inherit' });
        log.success('Dépendances installées !');
      } catch (error) {
        log.error('Erreur lors de l\'installation des dépendances');
        process.exit(1);
      }
    }
  } else {
    log.success('Toutes les dépendances sont installées');
  }
  
  // Collecte des informations
  const config = {};
  
  // MongoDB
  log.title('📊 CONFIGURATION MONGODB');
  log.info('Connectez-vous à MongoDB Atlas et récupérez votre URI de connexion');
  log.info('Format : mongodb+srv://username:password@cluster.mongodb.net/database\n');
  
  let mongoValid = false;
  while (!mongoValid) {
    config.mongoUri = await question('URI MongoDB : ');
    if (validateMongoUri(config.mongoUri)) {
      mongoValid = true;
      log.success('URI MongoDB valide');
    } else {
      log.error('URI MongoDB invalide. Vérifiez le format.');
    }
  }
  
  // Cloudinary
  log.title('🖼️ CONFIGURATION CLOUDINARY');
  log.info('Récupérez vos credentials depuis le Dashboard Cloudinary\n');
  
  config.cloudName = await question('Cloud Name : ');
  config.apiKey = await question('API Key : ');
  config.apiSecret = await question('API Secret : ');
  
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    log.warning('Configuration Cloudinary incomplète');
  } else {
    log.success('Configuration Cloudinary enregistrée');
  }
  
  // Admin
  log.title('🔐 CONFIGURATION ADMINISTRATEUR');
  log.info('Choisissez des identifiants sécurisés pour le panel admin\n');
  
  let usernameValid = false;
  while (!usernameValid) {
    config.adminUsername = await question('Username admin (min 3 caractères, sans espaces) : ');
    if (validateUsername(config.adminUsername)) {
      usernameValid = true;
      log.success('Username valide');
    } else {
      log.error('Username invalide (min 3 caractères, sans espaces)');
    }
  }
  
  let passwordValid = false;
  while (!passwordValid) {
    config.adminPassword = await question('Password admin (min 8 caractères) : ');
    if (validatePassword(config.adminPassword)) {
      passwordValid = true;
      log.success('Password valide');
    } else {
      log.error('Password trop court (min 8 caractères)');
    }
  }
  
  // Telegram (optionnel)
  log.title('📱 CONFIGURATION TELEGRAM (Optionnel)');
  log.info('Laissez vide si vous ne souhaitez pas utiliser Telegram\n');
  
  config.telegramUsername = await question('Username Telegram (@votreboutique) : ');
  if (config.telegramUsername && !config.telegramUsername.startsWith('@')) {
    config.telegramUsername = '@' + config.telegramUsername;
  }
  
  // Informations boutique
  log.title('🏪 INFORMATIONS DE LA BOUTIQUE');
  
  config.shopName = await question('Nom de votre boutique : ');
  config.shopDescription = await question('Description courte : ');
  
  // Création du fichier .env.local
  log.title('📝 CRÉATION DE LA CONFIGURATION');
  
  // Vérifier si .env.local existe déjà
  if (fs.existsSync('.env.local')) {
    log.warning('Un fichier .env.local existe déjà');
    const overwrite = await question('Voulez-vous le remplacer ? (o/n) : ');
    if (overwrite.toLowerCase() !== 'o') {
      log.info('Configuration annulée');
      rl.close();
      return;
    }
    // Backup de l'ancien fichier
    const backupName = `.env.local.backup.${Date.now()}`;
    fs.renameSync('.env.local', backupName);
    log.info(`Ancien fichier sauvegardé : ${backupName}`);
  }
  
  // Créer le fichier
  createEnvFile(config);
  
  // Créer un fichier de configuration pour la boutique
  const shopConfig = {
    name: config.shopName,
    description: config.shopDescription,
    telegramUsername: config.telegramUsername,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync('shop-config.json', JSON.stringify(shopConfig, null, 2));
  log.success('Configuration de la boutique sauvegardée');
  
  // Instructions finales
  log.title('🎉 CONFIGURATION TERMINÉE !');
  
  console.log('\n' + colors.bright + 'Prochaines étapes :' + colors.reset);
  console.log('1. ' + colors.cyan + 'npm run dev' + colors.reset + ' - Pour lancer en développement');
  console.log('2. Accédez à ' + colors.blue + 'http://localhost:3000' + colors.reset);
  console.log('3. Connectez-vous à ' + colors.blue + 'http://localhost:3000/admin' + colors.reset);
  console.log('   Username : ' + colors.green + config.adminUsername + colors.reset);
  console.log('   Password : ' + colors.green + '[caché pour sécurité]' + colors.reset);
  
  console.log('\n' + colors.bright + 'Pour déployer sur Vercel :' + colors.reset);
  console.log('1. Committez vos changements : ' + colors.cyan + 'git add . && git commit -m "Configuration initiale"' + colors.reset);
  console.log('2. Poussez sur GitHub : ' + colors.cyan + 'git push origin main' + colors.reset);
  console.log('3. Importez sur Vercel et ajoutez les variables d\'environnement');
  
  console.log('\n' + colors.yellow + '⚠️  IMPORTANT :' + colors.reset);
  console.log('- Ne partagez JAMAIS votre fichier .env.local');
  console.log('- Assurez-vous que .env.local est dans .gitignore');
  console.log('- Changez régulièrement vos mots de passe admin');
  
  // Test de connexion MongoDB (optionnel)
  const testConnection = await question('\nVoulez-vous tester la connexion MongoDB ? (o/n) : ');
  if (testConnection.toLowerCase() === 'o') {
    log.info('Test de connexion...');
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(config.mongoUri);
      await client.connect();
      await client.close();
      log.success('Connexion MongoDB réussie !');
    } catch (error) {
      log.error('Échec de la connexion MongoDB');
      log.error(error.message);
      log.warning('Vérifiez votre URI et l\'IP whitelist dans MongoDB Atlas');
    }
  }
  
  rl.close();
  
  console.log('\n' + colors.bright + colors.green);
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║        🚀 VOTRE BOUTIQUE EST PRÊTE À DÉMARRER ! 🚀       ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  log.error('Une erreur est survenue :');
  console.error(error);
  process.exit(1);
});

// Lancement du script
setupBoutique().catch((error) => {
  log.error('Erreur lors de la configuration :');
  console.error(error);
  process.exit(1);
});