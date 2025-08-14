# 📚 Guide Complet : Configuration Webhook pour Bot Telegram sur Render

## 🎯 Pourquoi utiliser le mode Webhook ?

### ❌ Problèmes du mode Polling :
- **Erreur 409 Conflict** : Plusieurs instances du bot tournent simultanément
- **Lenteur** : Le bot demande constamment s'il y a des messages
- **Consommation** : Utilise plus de ressources serveur
- **Conflits** : Si le bot tourne ailleurs (PC local, autre serveur)

### ✅ Avantages du mode Webhook :
- **Pas de conflit** : Une seule URL unique de réception
- **Instantané** : Telegram envoie directement les messages
- **Économique** : Moins de ressources utilisées
- **Fiable** : Pas d'erreur 409 Conflict

## 📋 Configuration actuelle de ce bot

### 🔧 Fichiers configurés

#### 1. `bot-webhook.js` (Fichier principal)
```javascript
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Configuration Express
const app = express();
const PORT = process.env.PORT || 10000;

// URL de votre app Render
const WEBHOOK_URL = process.env.WEBHOOK_URL || `https://bottelegramplug.onrender.com`;

// Initialiser le bot en mode webhook
const bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: true });

// Middleware Express
app.use(express.json());

// Route pour le webhook Telegram
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Route de santé pour Render (OBLIGATOIRE)
app.get('/', (req, res) => {
    res.send('Bot Telegram is running! 🤖');
});

// Route de santé détaillée
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        mode: 'webhook',
        timestamp: new Date().toISOString() 
    });
});

// Démarrer le serveur
app.listen(PORT, async () => {
    console.log(`🌐 Serveur démarré sur le port ${PORT}`);
    
    // Configurer le webhook
    const webhookUrl = `${WEBHOOK_URL}/bot${process.env.BOT_TOKEN}`;
    try {
        await bot.deleteWebHook();
        await bot.setWebHook(webhookUrl);
        console.log(`🔗 Webhook configuré: ${webhookUrl}`);
    } catch (error) {
        console.error('❌ Erreur webhook:', error);
    }
});
```

#### 2. `package.json` (Scripts configurés)
```json
{
  "scripts": {
    "start": "node bot-webhook.js",      // Mode webhook (par défaut)
    "webhook": "node bot-webhook.js",     // Alias webhook
    "polling": "node bot.js",             // Mode polling (développement)
    "mongodb": "node bot-mongodb.js",     // Version MongoDB
    "dev": "nodemon bot-webhook.js"       // Développement avec rechargement
  }
}
```

#### 3. `.env` (Variables d'environnement)
```bash
# Configuration du Bot Telegram
BOT_TOKEN=8128299360:AAEWmbRLjkTaQYP17GsiGm5vhQv8AcJLKIY
ADMIN_ID=7670522278

# Configuration Webhook pour Render
WEBHOOK_URL=https://bottelegramplug.onrender.com

# Port (utilisé automatiquement par Render)
PORT=10000
```

#### 4. `render.yaml` (Configuration Render)
```yaml
services:
  - type: web                      # IMPORTANT: web, pas worker!
    name: bottelegramplug
    runtime: node
    branch: main
    rootDir: BOT_TELEGRAM_CALIGAZ
    buildCommand: npm install
    startCommand: npm start         # Utilise bot-webhook.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: BOT_TOKEN
        sync: false
      - key: ADMIN_ID
        sync: false
      - key: WEBHOOK_URL
        sync: false
      - key: PORT
        value: 10000
    healthCheckPath: /health
    autoDeploy: true               # Déploiement automatique
```

## 🚀 Guide de déploiement étape par étape

### Étape 1 : Préparer le code

1. **Arrêter tous les bots locaux** :
```bash
# Vérifier les processus node
ps aux | grep node
# Tuer les processus si nécessaire
killall node
```

2. **Vérifier que le mode webhook est activé** :
```javascript
// ✅ BON
const bot = new TelegramBot(TOKEN, { webHook: true });

// ❌ MAUVAIS
const bot = new TelegramBot(TOKEN, { polling: true });
```

### Étape 2 : Configuration sur Render

1. **Créer un nouveau Web Service** sur [render.com](https://render.com)

2. **Connecter votre repository GitHub**

3. **Configuration du service** :
   - **Name** : bottelegramplug
   - **Root Directory** : BOT_TELEGRAM_CALIGAZ
   - **Environment** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`

4. **Variables d'environnement** (Settings → Environment) :
   ```
   BOT_TOKEN = [votre_token_telegram]
   ADMIN_ID = [votre_id_admin]
   WEBHOOK_URL = https://[votre-service].onrender.com
   PORT = 10000
   NODE_ENV = production
   ```

### Étape 3 : Déploiement

1. **Cliquer sur "Create Web Service"**
2. **Attendre le build** (2-3 minutes)
3. **Vérifier les logs** pour ces messages :
   ```
   ✅ Logs de succès :
   🌐 Serveur démarré sur le port 10000
   ✅ Ancien webhook supprimé
   🔗 Webhook configuré: https://bottelegramplug.onrender.com/bot...
   🤖 Bot démarré avec succès en mode webhook!
   ```

### Étape 4 : Vérification

1. **Tester la route de santé** :
   ```
   https://bottelegramplug.onrender.com/
   https://bottelegramplug.onrender.com/health
   ```

2. **Tester le bot sur Telegram** :
   - Ouvrir [@jsjshsheejdbot](https://t.me/jsjshsheejdbot)
   - Envoyer `/start`
   - Le bot doit répondre instantanément

3. **Commande de statut** (ajouter au bot) :
```javascript
bot.onText(/\/status/, async (msg) => {
    const webhookInfo = await bot.getWebHookInfo();
    const uptime = process.uptime();
    await bot.sendMessage(msg.chat.id, `
📊 **Status du Bot**
✅ Mode: Webhook
🔗 URL: ${webhookInfo.url ? 'Configuré' : 'Non configuré'}
📨 En attente: ${webhookInfo.pending_update_count || 0}
⏱️ Uptime: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s
🌐 Plateforme: Render
    `, { parse_mode: 'Markdown' });
});
```

## 🔍 Dépannage

### Problèmes courants et solutions

| Problème | Cause | Solution |
|----------|-------|----------|
| **Error 409 Conflict** | Bot tourne ailleurs | Arrêter tous les bots locaux |
| **MODULE_NOT_FOUND** | Mauvais chemin | Vérifier Root Directory |
| **Bot ne répond pas** | Webhook mal configuré | Vérifier WEBHOOK_URL |
| **Port error** | Port non défini | Ajouter PORT=10000 |
| **Timeout** | Serveur non démarré | Vérifier app.listen() |

### Commandes de diagnostic

```bash
# Vérifier le webhook via API Telegram
curl https://api.telegram.org/bot[TOKEN]/getWebhookInfo

# Tester la route de santé
curl https://bottelegramplug.onrender.com/health

# Voir les logs sur Render
# Dashboard → Logs
```

## ✅ Checklist de migration

- [x] Créer/modifier `bot-webhook.js`
- [x] Ajouter Express au projet
- [x] Remplacer `polling: true` par `webHook: true`
- [x] Ajouter routes Express (`/` et `/bot${TOKEN}`)
- [x] Configurer Render en **Web Service**
- [x] Définir Start Command: `node bot-webhook.js`
- [x] Ajouter toutes les variables d'environnement
- [x] Créer fichier `.env` local
- [x] Configurer `render.yaml`
- [x] Arrêter tous les bots locaux
- [x] Push sur GitHub
- [x] Déployer et tester

## 📝 Points importants à retenir

### ✅ À FAIRE :
- Utiliser **Web Service** sur Render (jamais Worker pour webhook)
- Ajouter Express pour recevoir les webhooks
- Route `/` obligatoire pour health check
- Mode `webHook: true` dans TelegramBot
- Configurer `WEBHOOK_URL` avec l'URL Render
- Port 10000 pour Render

### ❌ À ÉVITER :
- Ne PAS utiliser `polling: true` en production
- Ne PAS lancer le bot localement pendant le déploiement
- Ne PAS oublier `app.listen()`
- Ne PAS utiliser Worker sur Render pour webhook
- Ne PAS avoir plusieurs instances du bot

## 🎯 Résultat final

Après cette configuration, votre bot :

- ✅ **Plus d'erreur 409 Conflict**
- ✅ **Réponses instantanées** (pas de délai de polling)
- ✅ **Une seule instance active**
- ✅ **Économie de ressources** serveur
- ✅ **Compatible avec le plan gratuit** de Render
- ✅ **Déploiement automatique** à chaque push

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans Render Dashboard
2. Testez la route de santé
3. Vérifiez que le webhook est configuré avec `/getWebhookInfo`
4. Assurez-vous qu'aucun bot local ne tourne
5. Vérifiez les variables d'environnement

## 📊 Monitoring

Pour surveiller votre bot :

```javascript
// Ajouter un endpoint de métriques
app.get('/metrics', (req, res) => {
    res.json({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
        webhook: 'active',
        platform: 'Render'
    });
});
```

---

💡 **Note** : Ce guide est spécifiquement configuré pour le bot `bottelegramplug` sur Render. Adaptez les URLs et tokens selon votre propre bot.