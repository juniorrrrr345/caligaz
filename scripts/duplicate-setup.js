#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 REINAFARM - Assistant de Duplication de Boutique\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  try {
    // Collecte des informations
    console.log('📝 Configuration de votre nouvelle boutique :\n');
    
    const shopTitle = await question('Nom de votre boutique : ');
    const shopSubtitle = await question('Description/sous-titre : ');
    const telegramChannel = await question('Canal Telegram (@votre_channel) : ');
    const scrollingText = await question('Texte défilant (ou ENTER pour défaut) : ') || `REJOIGNEZ NOUS SUR ${shopTitle.toUpperCase()} 📲 • CONTACT`;
    
    console.log('\n🔐 Configuration Admin :');
    const adminUsername = await question('Nom d\'utilisateur admin : ');
    const adminPassword = await question('Mot de passe admin : ');
    
    console.log('\n🗄️ Configuration Base de Données :');
    const mongoUri = await question('MongoDB URI : ');
    
    console.log('\n☁️ Configuration Cloudinary :');
    const cloudinaryName = await question('Cloud Name : ');
    const cloudinaryKey = await question('API Key : ');
    const cloudinarySecret = await question('API Secret : ');
    
    // Génération d'une clé secrète aléatoire
    const nextAuthSecret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    
    console.log('\n🚀 Configuration de votre boutique...\n');
    
    // 1. Création du fichier .env.local
    const envContent = `# MongoDB
MONGODB_URI=${mongoUri}

# Cloudinary
CLOUDINARY_CLOUD_NAME=${cloudinaryName}
CLOUDINARY_API_KEY=${cloudinaryKey}
CLOUDINARY_API_SECRET=${cloudinarySecret}

# Admin
ADMIN_USERNAME=${adminUsername}
ADMIN_PASSWORD=${adminPassword}

# NextAuth Secret
NEXTAUTH_SECRET=${nextAuthSecret}
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Fichier .env.local créé');
    
    // 2. Mise à jour du contentCache.ts
    const contentCachePath = 'src/lib/contentCache.ts';
    let contentCache = fs.readFileSync(contentCachePath, 'utf8');
    
    // Remplacer les valeurs par défaut
    contentCache = contentCache.replace(/shopTitle: 'REINAFARM'/, `shopTitle: '${shopTitle}'`);
    contentCache = contentCache.replace(/shopSubtitle: 'Premium Concentrés'/, `shopSubtitle: '${shopSubtitle}'`);
    contentCache = contentCache.replace(/scrollingText: 'REJOIGNEZ NOUS SUR NOS RÉSEAUX 📲 • CONTACT'/, `scrollingText: '${scrollingText}'`);
    contentCache = contentCache.replace(/telegramLink: 'https:\/\/t\.me\/reinafarmchannel'/, `telegramLink: 'https://t.me/${telegramChannel.replace('@', '')}'`);
    
    // Mise à jour du contenu Info
    const infoContent = `# À propos de ${shopTitle}

**${shopTitle}** est ${shopSubtitle.toLowerCase()}.

## Nos Spécialités
- Produit Premium 1
- Produit Premium 2
- Produit Premium 3

## Nos Services
- Livraison rapide
- Support client
- Qualité garantie`;
    
    contentCache = contentCache.replace(/# À propos de REINAFARM[\s\S]*?Support 24\/7`/, infoContent + '`');
    
    // Mise à jour du contenu Contact
    const contactContent = `# Contactez ${shopTitle}

## Contact
**Telegram:** ${telegramChannel}
**Disponibilité:** 24h/24

## Livraison
**Zone:** À définir
**Délais:** Rapide et sécurisé`;
    
    contentCache = contentCache.replace(/# Contactez REINAFARM[\s\S]*?Expédition sécurisée`/, contactContent + '`');
    
    fs.writeFileSync(contentCachePath, contentCache);
    console.log('✅ Configuration de base mise à jour');
    
    // 3. Mise à jour du message de bienvenue
    const pagePath = 'src/app/page.tsx';
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    pageContent = pageContent.replace(/Bienvenu\(e\)s sur Notre Mini App 📲/, `Bienvenu(e)s chez ${shopTitle} 📲`);
    fs.writeFileSync(pagePath, pageContent);
    console.log('✅ Message de bienvenue personnalisé');
    
    // 4. Mise à jour des métadonnées
    const layoutPath = 'src/app/layout.tsx';
    if (fs.existsSync(layoutPath)) {
      let layoutContent = fs.readFileSync(layoutPath, 'utf8');
      layoutContent = layoutContent.replace(/title: 'REINAFARM'/, `title: '${shopTitle}'`);
      layoutContent = layoutContent.replace(/description: '.*?'/, `description: '${shopTitle} - ${shopSubtitle}'`);
      fs.writeFileSync(layoutPath, layoutContent);
      console.log('✅ Métadonnées SEO mises à jour');
    }
    
    // 5. Création du fichier de configuration personnalisé
    const configContent = `// Configuration personnalisée pour ${shopTitle}
export const SHOP_CONFIG = {
  name: '${shopTitle}',
  subtitle: '${shopSubtitle}',
  telegram: '${telegramChannel}',
  scrollingText: '${scrollingText}',
  admin: {
    username: '${adminUsername}',
    // Le mot de passe est dans .env.local pour la sécurité
  },
  created: '${new Date().toISOString()}',
  version: '1.0.0'
};
`;
    
    fs.writeFileSync('shop-config.js', configContent);
    console.log('✅ Fichier de configuration créé');
    
    // 6. Mise à jour du package.json
    const packagePath = 'package.json';
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      packageJson.name = shopTitle.toLowerCase().replace(/\s+/g, '-');
      packageJson.description = `${shopTitle} - ${shopSubtitle}`;
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Package.json mis à jour');
    }
    
    console.log('\n🎉 Configuration terminée avec succès !\n');
    console.log('📋 Prochaines étapes :');
    console.log('1. Vérifiez votre fichier .env.local');
    console.log('2. Testez en local : npm run dev');
    console.log('3. Déployez sur Vercel avec vos variables d\'environnement');
    console.log('4. Configurez votre boutique depuis /admin');
    console.log('\n🚀 Votre boutique est prête à être déployée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
  } finally {
    rl.close();
  }
}

main();