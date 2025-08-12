# 🤖 Bot Telegram CaliGaz ⛽️

Bot Telegram officiel pour la boutique **CaliGaz** - Station-service de qualité

## ✅ Configuration Complète

Le bot est entièrement configuré avec :
- ✅ **Token Bot** : Configuré
- ✅ **Admin ID** : 7670522278
- ✅ **Bot Username** : @caligazbot_bot
- ✅ **MongoDB** : Même base que la boutique
- ✅ **URL Boutique** : https://caligaz.vercel.app
- ✅ **Logo** : https://i.imgur.com/F1Hopru.jpeg

## 🚀 Démarrage Rapide

### 1. Installation
```bash
cd BOT_TELEGRAM_CALIGAZ
npm install
```

### 2. Lancement
```bash
npm start
# ou
node bot.js
```

## 📋 Fonctionnalités

### Pour les Utilisateurs
- 🏠 **Accueil** : Message de bienvenue personnalisé CaliGaz
- ⛽️ **Boutique** : Accès direct à https://caligaz.vercel.app
- ℹ️ **Infos** : Informations sur CaliGaz
- 🌐 **Réseaux Sociaux** : Liens vers vos réseaux
- 📱 **Contact** : Contact direct avec l'admin

### Pour l'Admin (7670522278)
- 📊 **Statistiques** : Voir les stats du bot
- 📢 **Diffusion** : Envoyer des messages à tous
- ⚙️ **Configuration** : Modifier les paramètres
- 👥 **Utilisateurs** : Gérer les utilisateurs
- 📝 **Logs** : Historique des activités

## 🌐 Déploiement

### Option 1 : Render (Gratuit)
1. Créez un compte sur [Render](https://render.com)
2. Nouveau "Web Service"
3. Connectez GitHub : `juniorrrrr345/caligaz`
4. Configuration :
   - **Root Directory** : `BOT_TELEGRAM_CALIGAZ`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Variables d'environnement (depuis .env)

### Option 2 : Railway
1. [Railway.app](https://railway.app)
2. Nouveau projet depuis GitHub
3. Sélectionnez `caligaz`
4. Variables d'environnement
5. Deploy !

### Option 3 : Heroku
```bash
heroku create caligaz-bot
heroku config:set BOT_TOKEN=8249693311:AAFErdIom1AwV5IgMKmIlDpr3iPqEPHmJCQ
heroku config:set ADMIN_ID=7670522278
heroku config:set MONGODB_URI=mongodb+srv://...
git push heroku main
```

## 📝 Commandes Admin

- `/stats` - Statistiques du bot
- `/broadcast [message]` - Message à tous
- `/users` - Liste utilisateurs
- `/config` - Configuration
- `/help` - Aide

## 🔐 Sécurité

- Token sécurisé
- Admin ID vérifié : 7670522278
- MongoDB avec authentification
- Logs d'activité

## 📱 Contact

- **Bot** : @caligazbot_bot
- **Admin** : ID 7670522278
- **Boutique** : https://caligaz.vercel.app

---

**CaliGaz ⛽️** - Votre station-service de qualité