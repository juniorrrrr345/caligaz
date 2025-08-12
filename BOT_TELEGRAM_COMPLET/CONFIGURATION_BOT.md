# 🤖 GUIDE DE CONFIGURATION - BOT TELEGRAM

## ❌ PROBLÈME : La commande /start ne fonctionne pas

### Cause : Le fichier `.env` n'est pas configuré

---

## 🔧 SOLUTION COMPLÈTE

### ÉTAPE 1 : Obtenir le Token du Bot

1. **Ouvrez Telegram** et cherchez **@BotFather**

2. **Créez votre bot** (ou récupérez le token existant) :
   ```
   /start
   /mybots
   Sélectionnez votre bot
   API Token
   ```

3. **Copiez le token** qui ressemble à :
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
   ```

### ÉTAPE 2 : Obtenir votre ID Telegram

**Option 1 : Avec @userinfobot**
1. Cherchez **@userinfobot** sur Telegram
2. Envoyez `/start`
3. Le bot vous donnera votre ID (ex: 123456789)

**Option 2 : Avec @getidsbot**
1. Cherchez **@getidsbot** sur Telegram
2. Envoyez `/start`
3. Notez votre "User ID"

### ÉTAPE 3 : Configurer MongoDB

Si vous n'avez pas encore MongoDB :
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Récupérez l'URI de connexion (voir GUIDE_MONGODB_CONFIG.md)

### ÉTAPE 4 : Modifier le fichier .env

Ouvrez le fichier `.env` et remplacez les valeurs :

```env
# Token obtenu de @BotFather
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789

# Votre ID Telegram
ADMIN_ID=123456789

# URI MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telegram_bot?retryWrites=true&w=majority

# Port (ne pas changer)
PORT=3000

# Webhook (laisser vide pour le moment)
WEBHOOK_URL=
```

### ÉTAPE 5 : Installer les dépendances

```bash
cd BOT_TELEGRAM_COMPLET
npm install
```

### ÉTAPE 6 : Lancer le bot

```bash
# Mode normal
node bot.js

# Ou avec nodemon (redémarrage automatique)
npm run dev
```

---

## ✅ VÉRIFICATION

Si tout fonctionne, vous devriez voir :
```
✅ Bot démarré et en attente de messages...
✅ Connecté à MongoDB
✅ Configuration chargée depuis MongoDB
```

Puis testez sur Telegram :
1. Ouvrez votre bot
2. Envoyez `/start`
3. Le bot devrait répondre avec le menu principal

---

## 🆘 DÉPANNAGE

### Erreur : "BOT_TOKEN n'est pas défini"
- Le fichier `.env` n'existe pas ou est mal configuré
- Vérifiez que le token est correct

### Erreur : "ADMIN_ID n'est pas défini"
- L'ID admin n'est pas dans le `.env`
- Utilisez @userinfobot pour obtenir votre ID

### Erreur : "Cannot connect to MongoDB"
- L'URI MongoDB est incorrecte
- Vérifiez l'IP whitelist (0.0.0.0/0) dans MongoDB Atlas
- Vérifiez le username/password

### Le bot ne répond pas
1. Vérifiez que le bot n'est pas déjà lancé ailleurs
2. Arrêtez tous les processus : `pkill -f node`
3. Relancez : `node bot.js`

### Commande /start ne fait rien
1. Vérifiez les logs dans le terminal
2. Assurez-vous que MongoDB est connecté
3. Vérifiez que vous utilisez le bon bot sur Telegram

---

## 📝 COMMANDES DISPONIBLES

Une fois configuré, votre bot supportera :

- `/start` - Menu principal
- `/id` - Afficher votre ID Telegram
- `/admin` - Panel admin (si vous êtes admin)
- `/stats` - Statistiques du bot (admin)
- `/broadcast` - Envoyer un message à tous (admin)

---

## 🚀 DÉPLOIEMENT (Optionnel)

Pour déployer sur Render ou Railway :
1. Pushez votre code sur GitHub
2. Connectez votre repo à Render/Railway
3. Ajoutez les variables d'environnement
4. Déployez

---

## 💡 CONSEILS

1. **Sécurité** : Ne partagez JAMAIS votre token de bot
2. **Backup** : Sauvegardez votre `.env` en lieu sûr
3. **Monitoring** : Utilisez `pm2` pour la production
4. **Logs** : Gardez les logs pour débugger

---

## 📞 SUPPORT

Si le problème persiste après avoir suivi ce guide :
1. Vérifiez tous les logs d'erreur
2. Assurez-vous que toutes les dépendances sont installées
3. Testez avec un nouveau token de bot
4. Vérifiez la connexion MongoDB