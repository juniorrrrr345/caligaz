# 🤖 Bot Telegram REINAFARM

Bot Telegram officiel intégré à la boutique e-commerce REINAFARM avec toutes les fonctionnalités premium.

## 🎯 Fonctionnalités

### Pour les utilisateurs
- 🌾 Message d'accueil personnalisé REINAFARM
- 🛍️ Lien direct vers la boutique e-commerce
- 📱 Réseaux sociaux REINAFARM
- ℹ️ Informations sur les produits et services
- 💬 Support client intégré

### Pour les administrateurs (/admin)
- 📝 Modifier le message d'accueil
- 🖼️ Modifier la photo d'accueil
- 🛍️ Configurer le lien vers la boutique
- 🌐 Gérer les réseaux sociaux
- ℹ️ Modifier les informations
- 📢 Broadcast à tous les utilisateurs
- 👥 Gérer les administrateurs
- 📊 Statistiques détaillées

## 🚀 Configuration

### 1. Variables d'environnement (.env)

```env
# Token du bot Telegram (obtenu via @BotFather)
BOT_TOKEN=votre_bot_token_ici

# MongoDB URI (même base que la boutique)
MONGODB_URI=mongodb+srv://harigon265:reina@reina.lwzsfti.mongodb.net/reinaplug?retryWrites=true&w=majority&appName=reina

# Admin ID (votre ID Telegram)
ADMIN_ID=votre_admin_id_ici

# Port pour le serveur (optionnel)
PORT=3001

# Nom du bot
BOT_NAME=REINAFARM Bot
```

### 2. Installation

```bash
cd BOT_TELEGRAM_COMPLET
npm install
```

### 3. Démarrage

```bash
# Mode production
npm start

# Mode développement
npm run dev

# Mode webhook (pour hébergement)
npm run webhook
```

## 🔧 Configuration initiale

1. **Créer le bot via @BotFather**
   - `/newbot`
   - Nom : `REINAFARM Bot`
   - Username : `@reinafarm_bot` (ou similaire)
   - Récupérer le token

2. **Obtenir votre Admin ID**
   - Envoyez `/start` à @userinfobot
   - Copiez votre ID

3. **Configurer le .env**
   - Remplacez `BOT_TOKEN` par votre token
   - Remplacez `ADMIN_ID` par votre ID

4. **Lancer le bot**
   ```bash
   npm start
   ```

## 🎮 Commandes disponibles

### Utilisateurs
- `/start` - Démarrer le bot et voir le menu principal
- `/info` - Informations sur REINAFARM

### Administrateurs
- `/admin` - Accéder au panel d'administration
- `/stats` - Voir les statistiques du bot
- `/broadcast` - Envoyer un message à tous les utilisateurs

## 🔗 Intégration avec la boutique

Le bot est conçu pour s'intégrer parfaitement avec la boutique REINAFARM :

- **Même base de données** : Utilise la même MongoDB que la boutique
- **Branding cohérent** : Messages et style alignés avec REINAFARM
- **Lien boutique** : Bouton direct vers la boutique e-commerce
- **Support client** : Canal de communication directe

## 📊 Base de données

Le bot utilise la collection `BotConfig` dans la même base MongoDB que la boutique pour stocker :
- Configuration du bot
- Messages personnalisés
- Réseaux sociaux
- Statistiques d'utilisation

## 🚀 Déploiement

### Render.com (Recommandé)
1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Railway.app
1. Connecter via GitHub
2. Configurer les variables
3. Déploiement automatique

### Heroku/Autres
Utilisez le `Procfile` fourni :
```
web: node bot.js
```

## 🛡️ Sécurité

- ✅ Variables d'environnement pour les secrets
- ✅ Validation des admins
- ✅ Protection contre le spam
- ✅ Logs sécurisés

## 📞 Support

Le bot est entièrement configuré pour REINAFARM et prêt à l'emploi !

**Commandes utiles :**
- `/admin` pour gérer le bot
- Configurez vos liens sociaux dans le panel admin
- Personnalisez les messages selon vos besoins

---

**Bot Telegram REINAFARM** - Intégration parfaite avec votre boutique e-commerce ! 🌾🤖