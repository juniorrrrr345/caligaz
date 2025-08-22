# 🤖 Configuration du Bot Telegram

## 📋 Pourquoi le bot ne répond plus après 4 jours ?

### Problèmes identifiés :
1. **Bot non implémenté** : Le code d'envoi était en TODO
2. **Pas de token configuré** : Variables d'environnement manquantes
3. **Pas de keep-alive** : Les services gratuits s'endorment après inactivité
4. **Pas de monitoring** : Aucun moyen de détecter les problèmes

## ✅ Solutions implémentées

### 1. Module Telegram complet (`/src/lib/telegram.ts`)
- ✅ Envoi de messages avec retry automatique
- ✅ Gestion des erreurs
- ✅ Backoff exponentiel en cas d'échec
- ✅ Logs détaillés

### 2. Routes API
- `/api/send-order` : Envoi des commandes
- `/api/test-telegram` : Test de connexion
- `/api/health` : Health check complet
- `/api/cron/keep-alive` : Maintien de l'activité

## 🚀 Configuration étape par étape

### Étape 1 : Créer votre bot Telegram

1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez `/newbot`
3. Choisissez un nom pour votre bot (ex: "FreshSwiss Orders")
4. Choisissez un username unique (ex: "freshswiss_orders_bot")
5. **Copiez le token** fourni par BotFather

### Étape 2 : Obtenir votre Chat ID

**Méthode 1 : Via l'API Telegram**
1. Envoyez un message à votre bot sur Telegram
2. Ouvrez ce lien dans votre navigateur :
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. Cherchez `"chat":{"id":` dans la réponse JSON
4. Copiez ce numéro (c'est votre Chat ID)

**Méthode 2 : Via un bot helper**
1. Cherchez **@userinfobot** sur Telegram
2. Envoyez `/start`
3. Il vous donnera votre Chat ID

### Étape 3 : Configurer les variables d'environnement

Dans Vercel :
1. Allez dans Settings → Environment Variables
2. Ajoutez ces variables :

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
CRON_SECRET=un_secret_aleatoire_securise
MONGODB_URI=mongodb+srv://...
```

### Étape 4 : Configurer un Cron Job

**Option A : Service externe gratuit (Recommandé)**

1. Allez sur [cron-job.org](https://cron-job.org)
2. Créez un compte gratuit
3. Créez un nouveau job :
   - **URL** : `https://votre-app.vercel.app/api/cron/keep-alive`
   - **Schedule** : Every 5 minutes
   - **Method** : GET
   - **Headers** : `Authorization: Bearer YOUR_CRON_SECRET`

**Option B : Vercel Cron (Plan Pro requis)**

Créez `/vercel.json` :
```json
{
  "crons": [{
    "path": "/api/cron/keep-alive",
    "schedule": "*/5 * * * *"
  }]
}
```

## 🧪 Tester votre configuration

### 1. Test de connexion
```bash
curl https://votre-app.vercel.app/api/test-telegram
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "botInfo": {
    "username": "your_bot_username",
    "id": 123456789
  }
}
```

### 2. Health Check
```bash
curl https://votre-app.vercel.app/api/health
```

Tous les services doivent être "ok".

### 3. Test d'envoi de commande
Passez une commande depuis votre application. Vous devriez recevoir le message sur Telegram.

## 🔍 Monitoring et Debugging

### Logs Vercel
1. Allez dans votre dashboard Vercel
2. Cliquez sur "Functions"
3. Vérifiez les logs de `/api/send-order`

### Messages d'erreur courants

| Erreur | Solution |
|--------|----------|
| "Bot non configuré - Token manquant" | Ajoutez `TELEGRAM_BOT_TOKEN` dans Vercel |
| "Chat ID manquant" | Ajoutez `TELEGRAM_CHAT_ID` dans Vercel |
| "401 Unauthorized" | Le token est incorrect, vérifiez avec BotFather |
| "400 Bad Request: chat not found" | Le Chat ID est incorrect |
| "429 Too Many Requests" | Trop de messages, le bot a un retry automatique |

## 🛡️ Sécurité

1. **Ne commitez JAMAIS** vos tokens dans Git
2. Utilisez `.env.local` en local (déjà dans .gitignore)
3. Configurez les variables dans Vercel pour la production
4. Utilisez `CRON_SECRET` pour protéger vos endpoints cron

## 📊 Métriques recommandées

Pour un monitoring avancé, considérez :
- **UptimeRobot** : Monitoring gratuit avec alertes
- **BetterUptime** : Plus d'options de monitoring
- **Sentry** : Pour tracker les erreurs en production

## 🆘 Support

Si le bot s'arrête encore :
1. Vérifiez `/api/health` pour identifier le problème
2. Consultez les logs Vercel
3. Vérifiez que le cron job fonctionne
4. Testez manuellement avec `/api/test-telegram`

## 📝 Checklist de déploiement

- [ ] Bot créé avec BotFather
- [ ] Token récupéré et configuré
- [ ] Chat ID obtenu et configuré
- [ ] Variables d'environnement sur Vercel
- [ ] Cron job configuré (toutes les 5 minutes)
- [ ] Test de connexion réussi
- [ ] Test d'envoi de commande réussi
- [ ] Monitoring en place