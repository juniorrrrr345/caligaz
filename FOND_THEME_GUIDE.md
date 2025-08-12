# 🎨 Configuration du Fond de Thème - CaliGaz ⛽️

## ✅ Ce qui a été corrigé

1. **Logo CaliGaz** : Remplacé partout par votre logo https://i.imgur.com/dRCR7PM.png
   - Page de chargement ✅
   - Header/Accueil ✅

2. **Centrage du fond** : Le fond sera maintenant TOUJOURS centré sur toutes les pages
   - CSS optimisé pour desktop et mobile
   - Position: center center
   - Attachment: fixed (ne bouge pas au scroll)

## 📋 Comment configurer une image de fond

### Depuis le Panel Admin

1. **Connectez-vous** au panel admin : `/admin`
   - Email: admin@caligaz.com
   - Password: CaliGaz2024!

2. **Allez dans "Configuration"** (⚙️)

3. **Section "Apparence"**
   - Trouvez le champ "Image de fond"
   - Collez l'URL de votre image de fond
   - Exemple: `https://exemple.com/mon-fond.jpg`

4. **Ajustez les paramètres** :
   - **Opacité de l'overlay** : 0-100 (30 par défaut)
   - **Flou de l'overlay** : 0-20 (3 par défaut)

5. **Cliquez sur "Enregistrer"**

### Caractéristiques du fond

Votre image de fond sera automatiquement :
- ✅ **Centrée** sur toutes les pages (center center)
- ✅ **En mode Cover** (couvre tout l'écran)
- ✅ **Fixe** (ne bouge pas au scroll)
- ✅ **Avec overlay** semi-transparent personnalisable
- ✅ **Responsive** (s'adapte mobile/desktop)

## 🖼️ Recommandations pour l'image de fond

### Format et taille
- **Format** : JPG ou PNG
- **Résolution minimale** : 1920x1080
- **Poids max recommandé** : 500KB (pour chargement rapide)

### Conseils design
- Utilisez une image sombre pour un meilleur contraste
- Évitez les images trop chargées (ça distrait)
- Préférez les motifs ou textures subtiles
- L'overlay noir ajoutera automatiquement du contraste

## 🔧 Scripts utiles

### Pour retirer l'image de fond
```bash
node scripts/reset-background.js
```

### Pour définir une image de fond manuellement
```bash
node scripts/update-background.js
```
(Modifiez le script pour mettre votre URL)

## 📝 Structure actuelle

- **Logo** : https://i.imgur.com/dRCR7PM.png (votre logo CaliGaz)
- **Fond** : Aucun (noir par défaut)
- **Overlay** : 30% d'opacité, 3px de flou

## ✨ Résumé

Votre boutique CaliGaz ⛽️ est maintenant configurée avec :
- ✅ Votre logo personnalisé sur le chargement et l'accueil
- ✅ Système de fond centré sur toutes les pages
- ✅ Configuration facile depuis le panel admin
- ✅ CSS optimisé pour mobile et desktop

**Pour ajouter une image de fond, utilisez simplement le panel admin !**