#!/bin/bash
echo "🔧 Configuration Vercel pour gros uploads..."

# Augmenter limite payload Vercel 
export VERCEL_BODY_SIZE_LIMIT=50mb

# Build normal
npm run build