# 🤖 Bot Telegram CaliGaz ⛽️

Bot Telegram officiel pour la boutique **CaliGaz** - Station-service de qualité

## 🚀 Informations du Bot

- **Username**: @caligazbot_bot
- **Admin ID**: 7670522278
- **URL Boutique**: https://caligaz.vercel.app

## ✅ Configuration Complète

Le bot est entièrement configuré avec :
- ✅ Token Bot : Configuré
- ✅ Admin ID : 7670522278
- ✅ MongoDB : Même base que la boutique
- ✅ Messages personnalisés pour CaliGaz
- ✅ Logo : https://i.imgur.com/F1Hopru.jpeg

## 📋 Fonctionnalités

### Pour les Utilisateurs
- 🏠 **Accueil** : Message de bienvenue personnalisé
- ⛽️ **Boutique** : Lien direct vers la boutique CaliGaz
- ℹ️ **Infos** : Informations sur CaliGaz
- 🌐 **Réseaux Sociaux** : Liens vers vos réseaux
- 📱 **Contact** : Bouton de contact direct

### Pour l'Admin (ID: 7670522278)
- 📊 **Statistiques** : Voir les stats du bot
- 📢 **Diffusion** : Envoyer des messages à tous les utilisateurs
- ⚙️ **Configuration** : Modifier les paramètres du bot
- 👥 **Utilisateurs** : Gérer les utilisateurs
- 📝 **Logs** : Voir les logs d'activité

## 🔧 Installation Locale

1. **Installer les dépendances** :
```bash
cd BOT_TELEGRAM_CALIGAZ
npm install
```

2. **Lancer le bot** :
```bash
npm start
```

## 🌐 Déploiement

### Option 1 : Render (Gratuit)
1. Créez un compte sur [Render](https://render.com)
2. Créez un nouveau "Web Service"
3. Connectez votre GitHub
4. Sélectionnez le repository `caligaz`
5. Configuration :
   - **Root Directory**: `BOT_TELEGRAM_CALIGAZ`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Ajoutez les variables d'environnement depuis le fichier `.env`

### Option 2 : Railway
1. Créez un compte sur [Railway](https://railway.app)
2. Nouveau projet depuis GitHub
3. Sélectionnez `caligaz`
4. Ajoutez les variables d'environnement
5. Deploy !

### Option 3 : VPS (Recommandé pour production)
```bash
# Sur votre VPS
git clone https://github.com/juniorrrrr345/caligaz.git
cd caligaz/BOT_TELEGRAM_CALIGAZ
npm install
npm install -g pm2
pm2 start bot.js --name "caligaz-bot"
pm2 save
pm2 startup
```

## 📝 Commandes Admin

Envoyez ces commandes au bot (Admin seulement) :

- `/stats` - Voir les statistiques
- `/broadcast [message]` - Envoyer un message à tous
- `/users` - Liste des utilisateurs
- `/config` - Modifier la configuration
- `/help` - Aide admin

## 🔐 Sécurité

- ✅ Token sécurisé et non exposé
- ✅ Admin ID vérifié pour les commandes sensibles
- ✅ MongoDB sécurisé avec authentification
- ✅ Logs d'activité pour traçabilité

## 📊 Structure de la Base de Données

Le bot utilise les collections MongoDB suivantes :
- `users` - Utilisateurs du bot
- `botconfig` - Configuration du bot
- `logs` - Logs d'activité
- `broadcasts` - Historique des diffusions

## 🛠️ Maintenance

### Logs
```bash
# Voir les logs en temps réel
pm2 logs caligaz-bot

# Voir les logs stockés
pm2 logs caligaz-bot --lines 100
```

### Redémarrer le bot
```bash
pm2 restart caligaz-bot
```

### Mettre à jour
```bash
git pull
npm install
pm2 restart caligaz-bot
```

## 📱 Contact & Support

- **Bot**: @caligazbot_bot
- **Admin Telegram**: ID 7670522278
- **Boutique**: https://caligaz.vercel.app

## ✨ Personnalisation

Pour modifier les messages du bot :
1. Éditez le fichier `config.js`
2. Modifiez les textes dans `defaultConfig`
3. Redémarrez le bot

---

**CaliGaz ⛽️** - Votre station-service de qualité