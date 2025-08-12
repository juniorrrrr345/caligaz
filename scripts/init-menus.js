const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Modèle Menu
const menuSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  emoji: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);

// Modèle Product pour mise à jour
const productSchema = new mongoose.Schema({
  name: String,
  menu: { type: String, default: 'caligaz' }
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function initMenus() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Menus par défaut
    const defaultMenus = [
      {
        name: 'CaliGaz',
        slug: 'caligaz',
        description: 'Menu principal - Station-service CaliGaz France',
        emoji: '⛽',
        isActive: true,
        order: 0
      },
      {
        name: 'CaliGaz Barcelone',
        slug: 'caligaz-barcelone',
        description: 'Menu spécial - Station-service CaliGaz Espagne',
        emoji: '🇪🇸',
        isActive: true,
        order: 1
      }
    ];

    console.log('\n📋 Initialisation des menus...');
    
    for (const menuData of defaultMenus) {
      try {
        // Vérifier si le menu existe déjà
        const existingMenu = await Menu.findOne({ slug: menuData.slug });
        
        if (existingMenu) {
          console.log(`✓ Menu "${menuData.name}" existe déjà`);
        } else {
          const menu = new Menu(menuData);
          await menu.save();
          console.log(`✅ Menu "${menuData.name}" créé avec succès`);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`ℹ️ Menu "${menuData.name}" existe déjà`);
        } else {
          console.error(`❌ Erreur lors de la création du menu "${menuData.name}":`, error.message);
        }
      }
    }

    // Mettre à jour les produits existants sans menu
    console.log('\n🔄 Mise à jour des produits sans menu...');
    const result = await Product.updateMany(
      { $or: [{ menu: { $exists: false } }, { menu: null }, { menu: '' }] },
      { $set: { menu: 'caligaz' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ ${result.modifiedCount} produits mis à jour avec le menu par défaut`);
    } else {
      console.log('ℹ️ Tous les produits ont déjà un menu assigné');
    }

    // Afficher le résumé
    console.log('\n📊 Résumé:');
    const menus = await Menu.find().sort({ order: 1 });
    console.log(`Total des menus: ${menus.length}`);
    menus.forEach(menu => {
      console.log(`  - ${menu.emoji} ${menu.name} (${menu.slug})`);
    });

    const productsByMenu = await Product.aggregate([
      { $group: { _id: '$menu', count: { $sum: 1 } } }
    ]);
    console.log('\nProduits par menu:');
    productsByMenu.forEach(group => {
      console.log(`  - ${group._id || 'Sans menu'}: ${group.count} produits`);
    });

    console.log('\n✅ Initialisation terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
initMenus();