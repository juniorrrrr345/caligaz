#!/bin/bash

# ====================================
# REINAFARM Boutique - Script de Setup
# ====================================

echo "🛍️  Bienvenue dans le setup de REINAFARM Boutique!"
echo "================================================"
echo ""

# Vérifier Node.js
echo "📌 Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord."
    echo "👉 https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION détectée. Version 18+ requise."
    exit 1
fi
echo "✅ Node.js $(node -v) détecté"
echo ""

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install
echo "✅ Dépendances installées"
echo ""

# Créer le fichier .env.local si il n'existe pas
if [ ! -f .env.local ]; then
    echo "🔧 Création du fichier .env.local..."
    cp .env.example .env.local
    echo "✅ Fichier .env.local créé"
    echo ""
    echo "⚠️  IMPORTANT: Veuillez configurer votre fichier .env.local avec vos valeurs:"
    echo "   - MongoDB URI"
    echo "   - Cloudinary credentials"
    echo "   - Admin username/password"
    echo ""
else
    echo "✅ Fichier .env.local déjà existant"
    echo ""
fi

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p public/uploads
mkdir -p src/temp
echo "✅ Dossiers créés"
echo ""

# Afficher les prochaines étapes
echo "🎉 Setup terminé!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurez votre fichier .env.local"
echo "2. Lancez le serveur de développement: npm run dev"
echo "3. Accédez à http://localhost:3000"
echo "4. Panel admin: http://localhost:3000/admin"
echo ""
echo "📚 Documentation complète: DUPLICATION_GUIDE_COMPLETE.md"
echo "🚀 Nouvelles fonctionnalités: FEATURES_ADDED.md"
echo ""
echo "Bon développement! 🚀"