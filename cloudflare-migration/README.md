# 🚀 Migration Médias vers Cloudflare - CALIGAZ

## 📋 Vue d'ensemble

Ce système de migration permet de transférer automatiquement tous les médias (vidéos et images) depuis Cloudinary vers Cloudflare, avec une organisation claire par boutique GitHub.

### ✅ Avantages

- **💰 Réduction des coûts**: ~70% moins cher que Cloudinary
- **⚡ Performance optimisée**: CDN global Cloudflare
- **📁 Organisation claire**: Médias organisés par boutique (CALIGAZ/videos, CALIGAZ/images)
- **🔄 Migration automatique**: Scripts intelligents avec détection de doublons
- **📊 Monitoring complet**: Vérification et rapports détaillés

## 🏗️ Architecture

```
🌐 Cloudflare Account
├── 📁 CALIGAZ/
│   ├── videos/     # Vidéos sur Cloudflare Stream
│   └── images/     # Images sur Cloudflare Images
├── 📁 CALITEK/     # Autre boutique (déjà migrée)
│   ├── videos/
│   └── images/
└── 📁 [AUTRE-BOUTIQUE]/
    ├── videos/
    └── images/
```

## 🔧 Installation

```bash
# 1. Installer les dépendances
cd cloudflare-migration
npm install

# 2. Tester les connexions
npm run test
```

## 🚀 Utilisation

### Migration complète de CALIGAZ

```bash
# Migrer tous les médias de CALIGAZ
npm run migrate:caligaz
```

### Migration de toutes les boutiques

```bash
# Migrer toutes les boutiques configurées
npm run migrate:all
```

### Vérification de la migration

```bash
# Vérifier l'état de toutes les migrations
npm run verify
```

## 📊 Fonctionnalités

### 1. Migration intelligente

- ✅ Détection automatique des médias Cloudinary
- ✅ Évite les doublons (vérifie si déjà migré)
- ✅ Metadata complètes (boutique, dossier, produit)
- ✅ Mise à jour automatique de la base de données

### 2. Support Frontend

Les composants React sont automatiquement compatibles :

```tsx
// CloudflareVideo - Support automatique des iframes
<CloudflareVideo 
  url="https://iframe.videodelivery.net/abc123"
  autoplay={true}
  loop={true}
/>

// CloudflareImage - Optimisation automatique
<CloudflareImage
  url="https://imagedelivery.net/hash/image-id/public"
  variant="public"
  loading="lazy"
/>
```

### 3. Organisation par boutique

Chaque boutique a ses propres dossiers :
- **CALIGAZ**: `CALIGAZ/videos` et `CALIGAZ/images`
- **CALITEK**: `CALITEK/videos` et `CALITEK/images`
- Facilite la gestion et le monitoring

## 📈 Résultats attendus

### Avant (Cloudinary)
```
https://res.cloudinary.com/dagnmkw0e/video/upload/v1234/product.mp4
https://res.cloudinary.com/dagnmkw0e/image/upload/v1234/product.jpg
```

### Après (Cloudflare)
```
https://iframe.videodelivery.net/abc123def456
https://imagedelivery.net/7979421604bd07b3bd34d3ed96222512/image-id/public
```

## 🛠️ Configuration

Le fichier `config.js` contient toutes les configurations :

```javascript
{
  cloudflare: {
    accountId: '7979421604bd07b3bd34d3ed96222512',
    apiToken: 'Ksi7W6LLmFZ7OdVz69b1IM9-MwCklAK-5Gv_z9Hx'
  },
  boutiques: {
    'CALIGAZ': {
      name: 'caligaz-shop',
      github: 'CALIGAZ',
      folders: {
        videos: 'CALIGAZ/videos',
        images: 'CALIGAZ/images'
      }
    }
  }
}
```

## 📝 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run migrate:caligaz` | Migre tous les médias de CALIGAZ |
| `npm run migrate:all` | Migre toutes les boutiques |
| `npm run verify` | Vérifie l'état des migrations |
| `npm run test` | Teste les connexions aux APIs |

## 🔍 Monitoring

Le script de vérification génère un rapport détaillé :

```bash
npm run verify
```

Génère `migration-report.json` avec :
- État de chaque boutique
- Nombre de médias migrés
- URLs accessibles
- Erreurs éventuelles

## 💡 Conseils

1. **Toujours tester les connexions avant la migration**
   ```bash
   npm run test
   ```

2. **Vérifier après chaque migration**
   ```bash
   npm run verify
   ```

3. **Les médias déjà migrés sont automatiquement détectés**
   - Pas de duplication
   - Reprise possible en cas d'interruption

4. **Organisation claire**
   - Chaque boutique a son dossier
   - Facilite la facturation par projet

## 🚨 Troubleshooting

### Erreur de connexion Cloudflare
- Vérifier l'Account ID et l'API Token
- S'assurer que le token a les permissions Stream et Images

### Erreur MongoDB
- Vérifier l'URI de connexion
- S'assurer que l'IP est whitelistée

### Médias non accessibles
- Vérifier que requireSignedURLs est désactivé
- Attendre quelques minutes après la migration (propagation CDN)

## 📊 Économies estimées

| Service | Coût mensuel | Économie |
|---------|--------------|----------|
| Cloudinary | ~$100-200 | - |
| Cloudflare | ~$30-50 | **70%** |

## 🎯 Résultat final

✅ **Tous les médias sur Cloudflare**
✅ **Organisation par boutique**
✅ **Performance optimisée**
✅ **Coûts réduits de 70%**
✅ **Gestion centralisée**

---

**Support**: Pour toute question, consulter les logs détaillés ou exécuter `npm run verify` pour un diagnostic complet.