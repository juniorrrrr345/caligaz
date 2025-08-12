# 📱 CONFIGURATION WHATSAPP - REINAFARM

## 🎯 **OBJECTIF**
Configuration du système de commande WhatsApp pour remplacer Telegram dans la boutique REINAFARM.

## ⚙️ **CONFIGURATION ADMIN**

### 1. **Accéder aux paramètres**
- Aller sur `/admin`
- Section "Paramètres généraux"
- Onglet "Contacts et liens"

### 2. **Configurer le lien WhatsApp**
```
Lien WhatsApp: https://wa.me/33123456789
```

**Format recommandé :**
- `https://wa.me/[code pays][numéro sans 0]`
- Exemple France : `https://wa.me/33123456789` (pour 01 23 45 67 89)
- Exemple Belgique : `https://wa.me/32123456789`

### 3. **Numéro de secours (optionnel)**
Si le lien WhatsApp n'est pas configuré, le système utilisera le "Numéro WhatsApp pour commandes" :
```
+33123456789
```

## 🛒 **FONCTIONNEMENT DU PANIER**

### **Avant (Telegram)**
- Bouton : "Envoyer à @username"
- Ouvre : `https://t.me/username?text=...`

### **Après (WhatsApp)**
- Bouton : "📱 Commander sur WhatsApp"
- Ouvre : `https://wa.me/33123456789?text=...`

## 📄 **FORMAT DU MESSAGE**

Le message envoyé contient :
```
🛒 **DÉTAIL DE LA COMMANDE:**

1. 🍒 Produit 1
   • Quantité: 2x 500g
   • Prix unitaire: 5.00€
   • Total: 10.00€
   • Remise: -10%

2. 🍒 Produit 2
   • Quantité: 1x 1kg
   • Prix unitaire: 8.00€
   • Total: 8.00€

💰 **TOTAL: 18.00€**
```

## 🔧 **MIGRATION DEPUIS TELEGRAM**

### **Étapes de migration**
1. Configurer le lien WhatsApp dans l'admin
2. Tester avec une commande test
3. L'ancien champ Telegram reste pour compatibilité

### **Compatibilité**
- Si WhatsApp configuré → utilise WhatsApp
- Si seulement Telegram configuré → utilise WhatsApp avec ce numéro
- Transition en douceur sans perte de données

## 🎨 **PERSONNALISATION UI**

### **Nouveau bouton**
- Couleur : Vert WhatsApp (`bg-gradient-to-r from-green-500 to-green-600`)
- Icône : 📱
- Texte : "Commander sur WhatsApp"

### **Message de succès**
- Ancien : "Redirection vers Telegram..."
- Nouveau : "Redirection vers WhatsApp..."

## 🧪 **TEST**

1. Ajouter des produits au panier
2. Cliquer sur "Commander sur WhatsApp"
3. Vérifier l'ouverture de WhatsApp avec le message pré-rempli
4. Confirmer le format du message

## 🚀 **AVANTAGES WHATSAPP**

- ✅ Plus populaire que Telegram
- ✅ Installé sur tous les téléphones
- ✅ Interface familière pour les clients
- ✅ Meilleure conversion commande
- ✅ Support des numéros internationaux