# 🛍️ Guide Complet de Duplication - REINAFARM Boutique

Ce guide vous permettra de dupliquer entièrement la boutique REINAFARM avec toutes les fonctionnalités ajoutées.

## 📋 Table des matières

1. [Fonctionnalités incluses](#fonctionnalités-incluses)
2. [Prérequis](#prérequis)
3. [Installation rapide](#installation-rapide)
4. [Configuration détaillée](#configuration-détaillée)
5. [Déploiement](#déploiement)
6. [Utilisation du panel admin](#utilisation-du-panel-admin)

## 🎯 Fonctionnalités incluses

### Nouvelles fonctionnalités ajoutées :
- ✅ **Système de panier complet**
  - Ajout/suppression de produits
  - Gestion des quantités
  - Persistance dans le localStorage
  - Interface moderne avec slide-in

- ✅ **Système de promotions**
  - Promotions par poids/prix
  - Affichage des prix barrés
  - Badges de réduction

- ✅ **Intégration Telegram**
  - Envoi direct des commandes via Telegram
  - Configuration du username dans le panel admin
  - Message formaté avec tous les détails

- ✅ **Améliorations UI/UX**
  - Header avec logo
  - Bouton panier visible
  - Design responsive optimisé
  - Compatible mini-app Telegram

### Fonctionnalités de base :
- Panel administrateur complet
- Gestion des produits avec vidéos
- Catégories et farms
- Pages d'information personnalisables
- Réseaux sociaux
- Système de cache pour performance

## 🔧 Prérequis

- Node.js 18+ installé
- Compte MongoDB Atlas (gratuit)
- Compte Cloudinary (gratuit)
- Compte Vercel (gratuit)
- Compte GitHub

## 🚀 Installation rapide

### 1. Cloner le repository

```bash
git clone https://github.com/juniorrrrr345/REINAFARM.git
cd REINAFARM
npm install
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reinafarm?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Admin (choisissez vos identifiants)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=votre_mot_de_passe_securise

# URL de production (après déploiement)
NEXT_PUBLIC_BASE_URL=https://votre-domaine.vercel.app
```

### 3. Lancer en développement

```bash
npm run dev
```

Accédez à :
- Boutique : http://localhost:3000
- Panel admin : http://localhost:3000/admin

## 📚 Configuration détaillée

### MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Dans "Database Access", créez un utilisateur
4. Dans "Network Access", ajoutez `0.0.0.0/0` (Allow from anywhere)
5. Cliquez sur "Connect" > "Connect your application"
6. Copiez l'URI et remplacez `<password>` par votre mot de passe

### Cloudinary

1. Créez un compte sur [Cloudinary](https://cloudinary.com)
2. Dans le Dashboard, copiez :
   - Cloud Name
   - API Key
   - API Secret

### Configuration du panel admin

1. Connectez-vous à `/admin` avec vos identifiants
2. Dans "Paramètres" :
   - Configurez le nom de la boutique
   - Ajoutez le username Telegram (ex: @VotreBoutique)
   - Personnalisez l'apparence

### Structure des collections MongoDB

Les collections suivantes seront créées automatiquement :

```javascript
// products
{
  name: String,
  farm: String,
  category: String,
  image: String,
  video: String,
  prices: {
    '5g': Number,
    '10g': Number,
    '20g': Number,
    // etc...
  },
  promotions: {
    '5g': Number, // Pourcentage de réduction
    '10g': Number,
    // etc...
  },
  description: String,
  isActive: Boolean
}

// settings
{
  shopTitle: String,
  shopSubtitle: String,
  bannerText: String,
  scrollingText: String,
  backgroundImage: String,
  backgroundOpacity: Number,
  backgroundBlur: Number,
  telegramUsername: String
}

// categories, farms, pages, sociallinks
```

## 🌐 Déploiement sur Vercel

### 1. Préparer le repository

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### 2. Déployer sur Vercel

1. Allez sur [Vercel](https://vercel.com)
2. Importez votre repository GitHub
3. Ajoutez les variables d'environnement :
   - Toutes celles du `.env.local`
   - Vercel les cryptera automatiquement
4. Cliquez sur "Deploy"

### 3. Configuration post-déploiement

1. Mettez à jour `NEXT_PUBLIC_BASE_URL` avec l'URL Vercel
2. Redéployez si nécessaire

## 👨‍💼 Utilisation du panel admin

### Gestion des produits

1. **Ajouter un produit** :
   - Nom, catégorie, farm
   - Upload d'image (obligatoire)
   - Upload de vidéo (optionnel)
   - Prix par poids
   - Promotions en % par poids

2. **Modifier les prix** :
   - Cliquez sur "Modifier"
   - Onglet "Prix"
   - Ajoutez/modifiez les prix
   - Ajoutez des promotions en %

### Gestion des commandes

1. Les clients ajoutent au panier
2. Cliquent sur "Envoyer à @username"
3. Sont redirigés vers Telegram avec le message pré-rempli
4. Vous recevez la commande formatée

### Personnalisation

- **Catégories** : Créez vos propres catégories
- **Farms** : Ajoutez vos fournisseurs
- **Pages** : Modifiez Info et Contact
- **Réseaux sociaux** : Ajoutez tous vos liens

## 🛠️ Maintenance

### Sauvegardes

MongoDB Atlas fait des sauvegardes automatiques, mais vous pouvez aussi :

```bash
# Exporter les données
mongodump --uri="votre_mongodb_uri" --out=backup/

# Importer les données
mongorestore --uri="votre_mongodb_uri" backup/
```

### Mises à jour

```bash
# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit fix
```

## 🆘 Dépannage

### Erreur de connexion MongoDB
- Vérifiez l'IP whitelist (0.0.0.0/0)
- Vérifiez le nom d'utilisateur/mot de passe
- Vérifiez le nom de la base de données

### Images qui ne s'affichent pas
- Vérifiez les credentials Cloudinary
- Vérifiez la taille des images (max 10MB)

### Erreur de build Vercel
- Vérifiez toutes les variables d'environnement
- Vérifiez les imports de dépendances

## 📱 Test de la mini-app Telegram

1. Ouvrez Telegram
2. Cherchez @BotFather
3. Créez un bot avec `/newbot`
4. Configurez le Web App avec l'URL de votre boutique

## 🎉 Félicitations !

Votre boutique est maintenant opérationnelle avec toutes les fonctionnalités :
- ✅ Catalogue de produits avec vidéos
- ✅ Système de panier complet
- ✅ Promotions par prix
- ✅ Envoi de commandes via Telegram
- ✅ Panel d'administration complet
- ✅ Design responsive moderne

Pour toute question, consultez le code source qui est bien commenté.

---

**Note** : Ce projet est une base solide pour une boutique en ligne. N'hésitez pas à l'adapter selon vos besoins spécifiques !