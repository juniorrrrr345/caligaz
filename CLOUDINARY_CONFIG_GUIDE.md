# 🎥 Configuration Cloudinary pour CaliGaz ⛽️

## ✅ Ce qui a été fait

1. **Upload Direct Cloudinary** : Le système utilise maintenant l'upload direct vers Cloudinary avec votre preset non signé "caligaz"

2. **Vos Credentials** :
   - Cloud Name: `dwobmx6zy`
   - API Key: `825178941816529`
   - API Secret: `7JHtq74fqCsUBSj7uau9h2e5xvI`
   - Upload Preset: `caligaz` (non signé)

3. **Galerie Photos/Vidéos** : Les produits peuvent maintenant afficher plusieurs photos et une vidéo avec navigation

## 📋 Configuration du Preset "caligaz" sur Cloudinary

### Étape 1: Connexion à Cloudinary
1. Allez sur https://cloudinary.com/console
2. Connectez-vous avec vos identifiants

### Étape 2: Vérifier/Créer le Preset
1. Dans le menu de gauche, cliquez sur **Settings** ⚙️
2. Puis cliquez sur **Upload**
3. Descendez jusqu'à **Upload presets**
4. Vérifiez que le preset `caligaz` existe avec ces paramètres :
   - **Preset name**: `caligaz`
   - **Signing Mode**: `Unsigned` ✅
   - **Folder**: `caligaz` (optionnel)

### Étape 3: Configuration du Preset (si nécessaire)
Si le preset n'existe pas ou doit être modifié :

1. Cliquez sur **Add upload preset**
2. Configurez comme suit :
   ```
   Preset name: caligaz
   Signing Mode: Unsigned
   Folder: caligaz
   Overwrite: OFF
   Use filename: ON
   Unique filename: ON
   Delivery type: upload
   Access mode: public
   ```

3. Dans **Upload Control** :
   - Max file size: 100MB (pour les vidéos)
   - Allowed formats: jpg, png, gif, webp, mp4, webm, mov, avi

4. Cliquez sur **Save**

## 🚀 Comment ça fonctionne maintenant

### Dans le Panel Admin

1. **Pour ajouter une image** :
   - Cliquez sur "📷 Choisir une image"
   - L'upload se fait directement vers Cloudinary
   - Une barre de progression s'affiche
   - L'URL est automatiquement ajoutée au produit

2. **Pour ajouter une vidéo** :
   - Cliquez sur "🎥 Choisir une vidéo"
   - Formats supportés : MP4, MOV, AVI, WebM
   - Taille max : 100MB
   - La vidéo sera automatiquement optimisée par Cloudinary

### Sur le Site Client

- Les produits affichent maintenant une **galerie** avec :
  - Navigation entre les images/vidéo
  - Miniatures en bas
  - Vue plein écran pour les images
  - Lecture automatique pour les vidéos

## 🎨 Image de Fond

L'image de fond a été configurée : https://i.imgur.com/dRCR7PM.png

Elle est :
- ✅ Centrée parfaitement
- ✅ En mode cover (couvre tout l'écran)
- ✅ Fixe (ne bouge pas au scroll)
- ✅ Avec un overlay semi-transparent

## 🔧 Dépannage

### Si l'upload ne fonctionne pas :

1. **Vérifiez le preset** sur Cloudinary Console
2. **Vérifiez la console du navigateur** (F12) pour les erreurs
3. **Assurez-vous que** :
   - Le preset est bien "unsigned"
   - Le nom est exactement "caligaz"
   - Les formats de fichiers sont autorisés

### Si les images/vidéos ne s'affichent pas :

1. Vérifiez que l'URL est bien https://
2. Testez l'URL directement dans le navigateur
3. Vérifiez les permissions sur Cloudinary

## 📝 Notes Importantes

- **Sécurité** : Le preset non signé permet l'upload direct depuis le navigateur
- **Organisation** : Les fichiers sont organisés dans des dossiers :
  - `caligaz/products` pour les images
  - `caligaz/videos` pour les vidéos
- **Optimisation** : Cloudinary optimise automatiquement les images/vidéos

## ✨ Résumé

Votre boutique CaliGaz ⛽️ est maintenant configurée avec :
- ✅ Upload direct vers Cloudinary (preset: caligaz)
- ✅ Support images ET vidéos
- ✅ Galerie de produits avec navigation
- ✅ Image de fond personnalisée
- ✅ Optimisation automatique des médias

**Tout est prêt pour uploader vos produits avec photos et vidéos !**