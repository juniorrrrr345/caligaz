# 🚀 Bot Telegram - Configuration Webhook

## ✅ État du déploiement

Le bot Telegram a été configuré avec succès en mode **WEBHOOK** pour un déploiement sur Render.

### 📋 Modifications effectuées

1. **Fichier .env créé** avec :
   - `BOT_TOKEN` : Token du bot Telegram
   - `ADMIN_ID` : ID de l'administrateur principal
   - `WEBHOOK_URL` : URL du service Render
   - `PORT` : Port 10000 pour Render

2. **bot-webhook.js complété** :
   - Code complet du bot intégré
   - Serveur Express configuré
   - Routes webhook et health check
   - Gestion complète des commandes et callbacks

3. **package.json modifié** :
   - Script `start` utilise maintenant `bot-webhook.js`
   - Scripts additionnels pour différents modes :
     - `webhook` : Mode webhook (par défaut)
     - `polling` : Mode polling local
     - `mongodb` : Version avec MongoDB

4. **render.yaml configuré** :
   - Type : `web` (pour supporter les webhooks)
   - Port : 10000
   - Health check : `/health`
   - Auto-deploy activé

### 🔧 Configuration sur Render

Les variables d'environnement suivantes doivent être configurées sur Render :

- `BOT_TOKEN` : 8128299360:AAEWmbRLjkTaQYP17GsiGm5vhQv8AcJLKIY
- `ADMIN_ID` : 7670522278
- `WEBHOOK_URL` : https://bottelegramplug.onrender.com

### 📱 Accès au bot

- Bot Telegram : [@jsjshsheejdbot](https://t.me/jsjshsheejdbot)
- Commandes disponibles :
  - `/start` : Démarrer le bot
  - `/id` : Obtenir son ID Telegram
  - `/admin` : Menu administrateur (réservé aux admins)

### 🚦 Statut

✅ **Prêt pour le déploiement automatique sur Render**

Le bot se redéploiera automatiquement à chaque push sur la branche `main`.