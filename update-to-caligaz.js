const fs = require('fs');
const path = require('path');

// Configuration des remplacements
const replacements = [
  { from: /REINAFARM/g, to: 'CaliGaz ⛽️' },
  { from: /ReinaFarm/g, to: 'CaliGaz' },
  { from: /reinafarm/g, to: 'caligaz' },
  { from: /Boutique en ligne/g, to: 'Station-service de qualité' },
  { from: /Votre boutique en ligne/g, to: 'Carburants et services de qualité' }
];

// Fichiers à mettre à jour
const filesToUpdate = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/info/page.tsx',
  'src/app/social/page.tsx',
  'src/components/Header.tsx',
  'src/components/admin/AdminLogin.tsx',
  'src/components/admin/AdminDashboard.tsx',
  'src/components/admin/ProductsManager.tsx',
  'src/components/admin/SettingsManager.tsx',
  'README.md',
  'package.json'
];

// Fonction pour remplacer dans un fichier
function updateFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Fichier non trouvé: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  replacements.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Mis à jour: ${filePath}`);
  } else {
    console.log(`⏭️  Pas de changement: ${filePath}`);
  }
}

console.log('🚀 Mise à jour vers CaliGaz ⛽️\n');

// Mettre à jour tous les fichiers
filesToUpdate.forEach(updateFile);

// Mettre à jour aussi tous les fichiers dans BOT_TELEGRAM_COMPLET
const botDir = path.join(__dirname, 'BOT_TELEGRAM_COMPLET');
if (fs.existsSync(botDir)) {
  const botFiles = fs.readdirSync(botDir);
  botFiles.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
      updateFile(path.join('BOT_TELEGRAM_COMPLET', file));
    }
  });
}

console.log('\n✨ Conversion terminée vers CaliGaz ⛽️!');