# ⛽ Bot Telegram Caligaz - Mode Webhook avec MongoDB

## ✅ Configuration actuelle

Le bot est configuré pour fonctionner **automatiquement en mode webhook** avec MongoDB.

### 📋 Caractéristiques

- ✅ **Mode Webhook automatique** - Pas de conflit 409
- ✅ **MongoDB** - Base de données Caligaz partagée
- ✅ **Configuration Caligaz** - Messages et thème station-service
- ✅ **Panel admin complet** - Toutes les fonctionnalités de gestion

### 🗄️ Base de données MongoDB

Le bot utilise MongoDB avec :
- **URI** : MongoDB Atlas (Caligaz)
- **Collections** :
  - `botconfigs` - Configuration du bot
  - `botusers` - Utilisateurs du bot
- **Synchronisation** : Temps réel avec la boutique

### ⛽ Configuration par défaut Caligaz

```json
{
  "welcomeMessage": "⛽️ Bienvenue {firstname} chez CaliGaz !",
  "welcomeImage": "https://i.imgur.com/F1Hopru.jpeg",
  "miniApp": {
    "url": "https://caligaz.vercel.app",
    "text": "⛽️ Boutique CaliGaz"
  },
  "socialNetworks": [
    { "name": "Telegram", "emoji": "✈️" },
    { "name": "Instagram", "emoji": "📷" },
    { "name": "WhatsApp", "emoji": "💬" }
  ]
}
```

### 📱 Commandes disponibles

**Commandes publiques :**
- `/start` - Démarrer le bot
- `/help` - Afficher l'aide
- `/id` - Obtenir son ID Telegram
- `/status` - Vérifier l'état du webhook

**Commandes admin :**
- `/admin` - Menu administrateur complet
- `/stats` - Statistiques rapides
- `/reset` - Réinitialiser la configuration Caligaz

### 🔧 Menu Administrateur

Le menu `/admin` permet de :
- 📝 Modifier le message d'accueil
- 🖼️ Changer la photo d'accueil
- 🌐 Gérer les réseaux sociaux
- 📱 Configurer la mini application
- 👥 Gérer les administrateurs
- 📢 Diffuser des messages
- 📊 Voir les statistiques
- 📥 Exporter les utilisateurs

### 🚀 Variables d'environnement

```env
BOT_TOKEN=8128299360:AAEWmbRLjkTaQYP17GsiGm5vhQv8AcJLKIY
ADMIN_ID=7670522278
MONGODB_URI=mongodb+srv://...@cluster0.mongodb.net/caligaz
WEBHOOK_URL=https://bottelegramplug.onrender.com
PORT=10000
```

### 📊 Monitoring

- **Health Check** : https://bottelegramplug.onrender.com/health
- **Métriques** : https://bottelegramplug.onrender.com/metrics
- **Status webhook** : `/status` dans le bot

### 🔄 Synchronisation avec la boutique

Le bot partage la même base MongoDB que la boutique Caligaz :
- Les configurations sont synchronisées
- Les utilisateurs sont partagés
- Les modifications sont en temps réel

### ⚠️ Points importants

- ✅ **MongoDB partagée** - Synchronisation avec la boutique
- ✅ **Mode webhook** - Réponses instantanées
- ✅ **Configuration persistante** - Sauvegardée dans MongoDB
- ✅ **Pas de conflit** - Une seule instance active

### 🛠️ Déploiement sur Render

1. Le bot se déploie automatiquement à chaque push sur `main`
2. Les variables d'environnement sont configurées sur Render
3. Le webhook est configuré automatiquement au démarrage
4. MongoDB se connecte automatiquement

### 📝 Notes

- Le bot utilise la même base MongoDB que la boutique Caligaz
- Les modifications dans le bot sont visibles dans la boutique
- La configuration est persistante et partagée