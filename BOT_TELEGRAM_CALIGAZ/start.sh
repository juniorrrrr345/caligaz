#!/bin/bash

echo "🤖 Démarrage du Bot CaliGaz ⛽️"
echo "================================"
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  ATTENTION: Fichier .env non trouvé!"
    echo "Copiez .env.example vers .env et configurez vos variables"
    exit 1
fi

echo "✅ Configuration trouvée"
echo "🚀 Lancement du bot..."
echo ""
echo "Bot Username: @caligazbot_bot"
echo "Admin ID: 7670522278"
echo ""

# Lancer le bot
node bot.js