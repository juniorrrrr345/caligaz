# 🚀 Déploiement CaliGaz ⛽️ sur Vercel

## ✅ Statut
- **Code source** : Basé sur reinaplug ✅
- **Nom** : CaliGaz ⛽️
- **GitHub** : https://github.com/juniorrrrr345/caligaz ✅
- **MongoDB** : Configuré ✅
- **Cloudinary** : Configuré ✅

## 📋 Variables d'Environnement pour Vercel

Copiez et collez ces variables dans Vercel :

```env
# Shop Configuration
NEXT_PUBLIC_SHOP_NAME=CaliGaz ⛽️
NEXT_PUBLIC_SHOP_DESCRIPTION=Station-service de qualité - Carburants et services
NEXT_PUBLIC_SHOP_URL=https://caligaz.vercel.app

# MongoDB
MONGODB_URI=mongodb+srv://caligaz641:laVfS1ZDvnGFrQjs@caligaz.w8db4kp.mongodb.net/caligaz?retryWrites=true&w=majority&appName=caligaz
DATABASE_NAME=caligaz

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dwobmx6zy
CLOUDINARY_API_KEY=825178941816529
CLOUDINARY_API_SECRET=7JHtq74fqCsUBSj7uau9h2e5xvI
CLOUDINARY_URL=cloudinary://825178941816529:7JHtq74fqCsUBSj7uau9h2e5xvI@dwobmx6zy

# Security
JWT_SECRET=caligaz_secret_key_2024_xKj9Lm2Np5Qr8St_secure
ADMIN_EMAIL=admin@caligaz.com
ADMIN_PASSWORD=CaliGaz2024!

# Contact
NEXT_PUBLIC_CONTACT_EMAIL=contact@caligaz.com
NEXT_PUBLIC_CONTACT_PHONE=+1234567890
NEXT_PUBLIC_WHATSAPP=+1234567890
NEXT_PUBLIC_TELEGRAM=@caligaz_shop

# Features
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_CURRENCY=USD
NEXT_PUBLIC_CURRENCY_SYMBOL=$
```

## 🔧 Configuration Build Vercel

| Paramètre | Valeur |
|-----------|--------|
| **Framework Preset** | Next.js (auto-détecté) |
| **Root Directory** | `./` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

## 📱 Accès Admin

| URL | Credentials |
|-----|-------------|
| `/admin` | Email: `admin@caligaz.com` |
| | Password: `CaliGaz2024!` |

## ⚡ Étapes de Déploiement

1. **Allez sur Vercel**
   - https://vercel.com/new

2. **Importez le projet**
   - Sélectionnez : `juniorrrrr345/caligaz`

3. **Configurez les variables**
   - Copiez TOUTES les variables ci-dessus
   - Collez dans Environment Variables

4. **Déployez**
   - Cliquez sur Deploy
   - Attendez 2-3 minutes

## ✅ Vérifications Post-Déploiement

- [ ] Site accessible
- [ ] Admin accessible sur `/admin`
- [ ] Images s'affichent (Cloudinary)
- [ ] Base de données connectée (MongoDB)

## 🎨 Personnalisation

Pour changer le nom de la boutique après déploiement :
1. Vercel → Settings → Environment Variables
2. Modifiez `NEXT_PUBLIC_SHOP_NAME`
3. Redéployez

---

**CaliGaz ⛽️ - Votre station-service en ligne**