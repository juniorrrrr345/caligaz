# 📊 GUIDE COMPLET - Configuration MongoDB Atlas

## Introduction

MongoDB Atlas est une base de données cloud gratuite qui hébergera toutes les données de votre boutique (produits, paramètres, catégories, etc.). Ce guide vous accompagne pas à pas pour créer et configurer votre propre base de données MongoDB.

---

## 🎯 Ce que vous allez obtenir

- ✅ **Base de données cloud gratuite** (512 MB)
- ✅ **Accès sécurisé** avec authentification
- ✅ **Sauvegardes automatiques** quotidiennes
- ✅ **Monitoring** en temps réel
- ✅ **URI de connexion** pour votre boutique

---

## 📋 Temps nécessaire : 10-15 minutes

---

## ÉTAPE 1 : Création du compte MongoDB Atlas

### 1.1 Inscription

1. Rendez-vous sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. Cliquez sur le bouton **"Try Free"** en haut à droite

3. Choisissez votre méthode d'inscription :
   - **Google** (recommandé pour la rapidité)
   - **GitHub**
   - **Email classique**

4. Remplissez les informations :
   ```
   Prénom : [Votre prénom]
   Nom : [Votre nom]
   Email : [Votre email]
   Mot de passe : [Minimum 8 caractères]
   ```

5. Acceptez les conditions et cliquez sur **"Create account"**

6. **Vérifiez votre email** et cliquez sur le lien de confirmation

### 1.2 Configuration initiale

Après connexion, MongoDB vous pose quelques questions :

1. **"What are you building?"**
   - Sélectionnez : "Application or Software"

2. **"What is your preferred language?"**
   - Sélectionnez : "JavaScript"

3. Cliquez sur **"Finish"**

---

## ÉTAPE 2 : Création du Cluster (Base de données)

### 2.1 Démarrage

1. Vous arrivez sur le dashboard MongoDB Atlas

2. Cliquez sur le bouton vert **"Build a Database"**

### 2.2 Choix du plan

1. **IMPORTANT** : Sélectionnez **"M0 FREE"** (Shared)
   ```
   ✅ FREE Forever
   ✅ 512 MB Storage
   ✅ Shared RAM
   ✅ No credit card required
   ```

2. Ne choisissez PAS les options payantes (M10, M20, etc.)

### 2.3 Configuration du cluster

1. **Provider & Region** :
   ```
   Provider : AWS (par défaut)
   Region : Choisissez la plus proche
   - France : eu-west-3 (Paris)
   - Belgique : eu-west-1 (Ireland)
   - Canada : ca-central-1 (Montreal)
   - Autre : Sélectionnez la plus proche
   ```

2. **Cluster Name** :
   ```
   Nom : boutique-cluster (ou un nom de votre choix)
   Note : Ce nom ne peut pas être changé après création
   ```

3. Cliquez sur **"Create"**

4. **Attendez 1-3 minutes** pour la création du cluster

---

## ÉTAPE 3 : Configuration de la Sécurité

### 3.1 Création d'un utilisateur de base de données

1. Pendant la création, une fenêtre **"Security Quickstart"** apparaît

2. **Username and Password** :
   ```
   Username : boutique-admin (ou votre choix)
   Password : Cliquez sur "Autogenerate Secure Password"
   
   ⚠️ IMPORTANT : Copiez et sauvegardez ce mot de passe !
   ```

3. **CONSEIL** : Sauvegardez immédiatement ces informations :
   ```
   MongoDB Username : [votre username]
   MongoDB Password : [votre password généré]
   ```

4. Cliquez sur **"Create User"**

### 3.2 Configuration de l'accès réseau

1. Dans la section **"Where would you like to connect from?"**

2. Sélectionnez **"My Local Environment"**

3. **IMPORTANT** : Pour autoriser les connexions depuis n'importe où :
   - Cliquez sur **"Add My Current IP Address"**
   - Puis cliquez sur **"Add IP Address"**
   - Dans le champ IP, entrez : `0.0.0.0/0`
   - Description : "Allow from anywhere"
   - Cliquez sur **"Add Entry"**

4. Cliquez sur **"Finish and Close"**

5. Cliquez sur **"Go to Databases"**

---

## ÉTAPE 4 : Récupération de l'URI de Connexion

### 4.1 Accès aux paramètres de connexion

1. Dans la vue **"Database Deployments"**, vous voyez votre cluster

2. Cliquez sur le bouton **"Connect"** à côté de votre cluster

### 4.2 Choix de la méthode de connexion

1. Sélectionnez **"Connect your application"**

2. Dans **"Driver"** :
   ```
   Driver : Node.js
   Version : 5.5 or later
   ```

### 4.3 Copie de l'URI

1. Vous verrez une URI qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@boutique-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

2. **Modifiez l'URI** :
   - Remplacez `<username>` par votre username (ex: boutique-admin)
   - Remplacez `<password>` par votre mot de passe
   - Ajoutez le nom de votre base après `.net/` (ex: maboutique)

### 4.4 URI finale

Votre URI finale devrait ressembler à :
```
mongodb+srv://boutique-admin:VotreMotDePasse123@boutique-cluster.xxxxx.mongodb.net/maboutique?retryWrites=true&w=majority
```

**Décomposition de l'URI :**
- `mongodb+srv://` : Protocole de connexion
- `boutique-admin` : Votre username
- `VotreMotDePasse123` : Votre password
- `boutique-cluster.xxxxx` : Nom de votre cluster
- `maboutique` : Nom de votre base de données
- `?retryWrites=true&w=majority` : Options de connexion

---

## ÉTAPE 5 : Vérification et Tests

### 5.1 Test avec MongoDB Compass (Optionnel)

1. Téléchargez [MongoDB Compass](https://www.mongodb.com/products/compass) (GUI gratuit)

2. Ouvrez Compass et collez votre URI

3. Cliquez sur **"Connect"**

4. Si la connexion réussit, vous verrez vos bases de données

### 5.2 Vérifications dans Atlas

1. **Database Access** :
   - Vérifiez que votre utilisateur est bien créé
   - Statut : "Active"

2. **Network Access** :
   - Vérifiez que `0.0.0.0/0` est dans la liste
   - Statut : "Active"

3. **Metrics** :
   - Vous pouvez voir l'utilisation en temps réel
   - Connexions actives
   - Opérations par seconde

---

## 🔧 Résolution des Problèmes Courants

### Problème 1 : "Authentication failed"

**Solutions :**
- Vérifiez le username et password
- Attention aux caractères spéciaux dans le password (encodez-les)
- Recréez l'utilisateur si nécessaire

### Problème 2 : "Connection timed out"

**Solutions :**
- Vérifiez Network Access (0.0.0.0/0 doit être autorisé)
- Attendez 2 minutes après l'ajout de l'IP
- Vérifiez votre connexion internet

### Problème 3 : "Invalid connection string"

**Solutions :**
- Vérifiez le format de l'URI
- Assurez-vous d'avoir remplacé `<username>` et `<password>`
- Vérifiez qu'il n'y a pas d'espaces dans l'URI

### Problème 4 : Caractères spéciaux dans le mot de passe

Si votre mot de passe contient des caractères spéciaux, encodez-les :
- `@` devient `%40`
- `:` devient `%3A`
- `/` devient `%2F`
- `?` devient `%3F`
- `#` devient `%23`
- `[` devient `%5B`
- `]` devient `%5D`

**Exemple :**
```
Password original : P@ss:word#123
Password encodé : P%40ss%3Aword%23123
```

---

## 📊 Gestion de votre Base de Données

### Collections créées automatiquement

Votre boutique créera automatiquement ces collections :

1. **products** : Tous vos produits
2. **categories** : Catégories de produits
3. **farms** : Fournisseurs/producteurs
4. **settings** : Paramètres de la boutique
5. **pages** : Pages Info et Contact
6. **sociallinks** : Liens réseaux sociaux

### Limites du plan gratuit

- **Stockage** : 512 MB (suffisant pour ~10,000 produits)
- **Connexions** : 100 connexions simultanées
- **Clusters** : 1 cluster gratuit par compte
- **Sauvegardes** : Snapshots quotidiens (7 jours)

### Monitoring

Dans MongoDB Atlas, vous pouvez surveiller :
- **Performance** : Temps de réponse des requêtes
- **Utilisation** : Espace disque utilisé
- **Connexions** : Nombre de connexions actives
- **Alertes** : Notifications si problèmes

---

## ✅ Checklist Finale

Avant de passer à l'étape suivante, vérifiez :

- [ ] Compte MongoDB Atlas créé et vérifié
- [ ] Cluster M0 (gratuit) créé
- [ ] Utilisateur de base de données créé
- [ ] Mot de passe sauvegardé en lieu sûr
- [ ] IP 0.0.0.0/0 ajoutée dans Network Access
- [ ] URI de connexion complète récupérée
- [ ] URI testée (optionnel avec Compass)

---

## 🎉 Félicitations !

Votre base de données MongoDB est maintenant prête ! 

**Votre URI MongoDB :**
```
mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]?retryWrites=true&w=majority
```

**Prochaine étape :** Configuration de Cloudinary pour le stockage des images

---

## 💡 Conseils de Sécurité

1. **Ne partagez JAMAIS** votre URI complète
2. **Changez régulièrement** le mot de passe
3. **Surveillez** l'utilisation dans Atlas
4. **Activez** l'authentification à deux facteurs
5. **Limitez** les IP en production (pas 0.0.0.0/0)

---

## 📚 Ressources Utiles

- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) (cours gratuits)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (GUI)
- [Support MongoDB](https://www.mongodb.com/community/forums/)

---

*Ce guide fait partie du package de duplication de la boutique universelle*