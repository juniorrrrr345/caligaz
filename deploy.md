# 🚀 Guide de Déploiement Vercel - REINAFARM

## ⚡ Déploiement Rapide

### 1. Via GitHub (Recommandé)

1. **Push votre code sur GitHub** :
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connecter à Vercel** :
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez "New Project"
   - Importez votre repository GitHub
   - Cliquez "Deploy"

### 2. Configuration des Variables d'Environnement

Dans Vercel Dashboard > Settings > Environment Variables :

```
Variable: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/reinafarm?retryWrites=true&w=majority
```

### 3. Configuration MongoDB Atlas

1. **Network Access** : Ajouter `0.0.0.0/0` (toutes IPs)
2. **Database User** : Créer un utilisateur avec droits lecture/écriture

### 4. Après Déploiement

1. **Initialiser la base** : Visitez `https://votre-app.vercel.app/api/init-db`
2. **Tester l'admin** : Allez sur `https://votre-app.vercel.app/admin`
3. **Mot de passe** : `admin123`

## ✅ Checklist de Déploiement

- [ ] Code poussé sur GitHub
- [ ] Repository connecté à Vercel
- [ ] Variable MONGODB_URI configurée
- [ ] MongoDB Atlas IP autorisée
- [ ] API /api/init-db exécutée
- [ ] Panel admin testé
- [ ] Upload d'images testé

## 🔧 En cas de Problème

### Erreur de Build
```bash
npm run build
# Vérifier les erreurs TypeScript
```

### Erreur MongoDB
- Vérifier l'URI MongoDB
- Confirmer les permissions utilisateur
- Vérifier la connexion réseau

### Erreur d'Upload
- Le dossier `/public/uploads` sera créé automatiquement
- Vercel gère les fichiers statiques

## 🌐 URLs Importantes

- **Site principal** : `https://votre-app.vercel.app`
- **Panel admin** : `https://votre-app.vercel.app/admin`
- **Init DB** : `https://votre-app.vercel.app/api/init-db`
- **Test DB** : `https://votre-app.vercel.app/api/test-db`

## 🎯 Prêt !

Votre boutique REINAFARM est maintenant en ligne ! 🍃