# 🌿 Bot Telegram LAMAINVERTE - Configuration Webhook

## ✅ Configuration actuelle

Le bot est configuré pour fonctionner **automatiquement en mode webhook** avec stockage local (sans MongoDB).

### 📋 Caractéristiques

- ✅ **Mode Webhook automatique** - Pas de conflit 409
- ✅ **Stockage local** - Fichiers JSON (indépendant de la boutique)
- ✅ **Configuration LAMAINVERTE** - Messages et réseaux sociaux par défaut
- ✅ **Panel admin complet** - Toutes les fonctionnalités de gestion

### 📁 Fichiers de stockage local

Le bot utilise ces fichiers locaux (créés automatiquement) :
- `config.json` - Configuration du bot
- `users.json` - Liste des utilisateurs
- `admins.json` - Liste des administrateurs
- `images/` - Dossier pour les images d'accueil

### 🎯 Configuration par défaut LAMAINVERTE

```json
{
  "welcomeMessage": "🌿 Bienvenue {firstname} sur LAMAINVERTE!\n\n🛍️ Découvrez notre boutique en ligne de produits naturels et bio.",
  "miniApp": {
    "url": "https://lamainverte.onrender.com",
    "text": "🛍️ Boutique LAMAINVERTE"
  },
  "socialNetworks": [
    { "name": "Instagram", "emoji": "📷" },
    { "name": "Facebook", "emoji": "👍" },
    { "name": "WhatsApp", "emoji": "💬" },
    { "name": "Telegram", "emoji": "✈️" },
    { "name": "Site Web", "emoji": "🌐" }
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
- `/reset` - Réinitialiser la configuration LAMAINVERTE

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

### 🚀 Déploiement sur Render

1. **Variables d'environnement requises :**
   ```
   BOT_TOKEN=8128299360:AAEWmbRLjkTaQYP17GsiGm5vhQv8AcJLKIY
   ADMIN_ID=7670522278
   WEBHOOK_URL=https://bottelegramplug.onrender.com
   PORT=10000
   ```

2. **Configuration Render :**
   - Type : Web Service
   - Start Command : `npm start`
   - Health Check : `/health`

3. **Le bot démarre automatiquement en mode webhook**

### 💡 Points importants

- ✅ **Indépendant de la boutique** - Utilise des fichiers locaux
- ✅ **Pas de MongoDB** - Aucune interférence avec la base de données
- ✅ **Configuration persistante** - Les données sont sauvegardées localement
- ✅ **Mode webhook automatique** - Pas besoin de configuration supplémentaire

### 🔄 Réinitialisation

Pour réinitialiser la configuration LAMAINVERTE par défaut :
```
/reset
```

Cette commande (admin uniquement) restaure tous les paramètres par défaut.

### 📊 Monitoring

- **Health Check** : https://bottelegramplug.onrender.com/health
- **Métriques** : https://bottelegramplug.onrender.com/metrics
- **Status dans le bot** : `/status`

### ⚠️ Note importante

Ce bot fonctionne **complètement indépendamment** de la boutique. Il utilise son propre stockage local et ne touche pas à MongoDB, donc aucun risque d'affecter l'autre boutique.