# 🚀 Guide de Déploiement - BMS Inventory

Ce guide vous explique comment déployer votre application **gratuitement** sur Netlify (frontend) et Render.com (backend).

---

## 📋 Prérequis

- Un compte GitHub
- Un compte MongoDB Atlas (gratuit)
- Un compte Netlify (gratuit)
- Un compte Render.com (gratuit)

---

## 1️⃣ Étape 1 : Configuration de MongoDB Atlas (Base de données)

### Créer un cluster gratuit :

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Créez un compte gratuit
3. Créez un nouveau cluster (choisissez le plan **FREE** M0)
4. Sélectionnez une région proche de vous
5. Cliquez sur "Create Cluster"

### Configurer l'accès :

1. Dans le menu de gauche, cliquez sur **Database Access**
2. Cliquez sur **Add New Database User**
   - Choisissez "Password" comme méthode d'authentification
   - Username : `bms_user` (ou autre)
   - Password : générez un mot de passe sécurisé (NOTEZ-LE!)
   - Database User Privileges : "Read and write to any database"
   - Cliquez sur "Add User"

3. Dans le menu de gauche, cliquez sur **Network Access**
4. Cliquez sur **Add IP Address**
   - Sélectionnez "Allow Access from Anywhere" (0.0.0.0/0)
   - Cliquez sur "Confirm"

### Obtenir la chaîne de connexion :

1. Retournez sur **Database** dans le menu
2. Cliquez sur **Connect** sur votre cluster
3. Choisissez **Connect your application**
4. Copiez la chaîne de connexion (ressemble à ça) :
   ```
   mongodb+srv://bms_user:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. Remplacez `<password>` par le mot de passe que vous avez créé
6. **GARDEZ CETTE CHAÎNE PRÉCIEUSEMENT** ✅

---

## 2️⃣ Étape 2 : Préparer le code

### Créer un dépôt GitHub :

1. Initialisez Git dans votre projet (si pas déjà fait) :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Créez un nouveau dépôt sur GitHub
3. Liez votre projet au dépôt :
   ```bash
   git remote add origin https://github.com/votre-username/bms-inventory.git
   git branch -M main
   git push -u origin main
   ```

### Créer le fichier .env pour le backend :

Dans le dossier `backend/`, créez un fichier `.env` (pour vos tests locaux) :

```env
MONGO_URL=mongodb+srv://bms_user:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/
DB_NAME=bms_inventory
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
CORS_ORIGINS=http://localhost:3000
```

⚠️ **NE JAMAIS commiter le fichier `.env` sur GitHub !**

Ajoutez `.env` au `.gitignore` :
```bash
echo "backend/.env" >> .gitignore
echo "frontend/.env" >> .gitignore
```

---

## 3️⃣ Étape 3 : Déployer le Backend sur Render.com

1. Allez sur [Render.com](https://render.com/) et créez un compte

2. Cliquez sur **New +** puis **Web Service**

3. Connectez votre dépôt GitHub

4. Configuration du service :
   - **Name** : `bms-backend` (ou autre)
   - **Region** : choisissez la région la plus proche
   - **Branch** : `main`
   - **Root Directory** : laissez vide
   - **Runtime** : `Python 3`
   - **Build Command** : 
     ```bash
     cd backend && pip install -r requirements.txt
     ```
   - **Start Command** :
     ```bash
     cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type** : **Free** (512 MB RAM)

5. **Variables d'environnement** (cliquez sur "Advanced") :
   
   Ajoutez ces variables :
   
   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | `mongodb+srv://bms_user:VOTRE_PASSWORD@cluster0.xxxxx.mongodb.net/` |
   | `DB_NAME` | `bms_inventory` |
   | `JWT_SECRET` | `un-secret-aleatoire-tres-long-et-securise` |
   | `CORS_ORIGINS` | `https://votre-app.netlify.app` (vous changerez après) |
   | `PYTHON_VERSION` | `3.11.0` |

6. Cliquez sur **Create Web Service**

7. Attendez que le déploiement se termine (5-10 minutes)

8. **NOTEZ L'URL** de votre backend (ex: `https://bms-backend-xxxx.onrender.com`) ✅

⚠️ **Note importante** : Le plan gratuit de Render met le service en veille après 15 minutes d'inactivité. Le premier accès peut prendre 30-60 secondes pour "réveiller" le service.

---

## 4️⃣ Étape 4 : Déployer le Frontend sur Netlify

### Option A : Déploiement via l'interface web (recommandé)

1. Allez sur [Netlify](https://www.netlify.com/) et créez un compte

2. Cliquez sur **Add new site** puis **Import an existing project**

3. Choisissez **GitHub** et autorisez l'accès

4. Sélectionnez votre dépôt `bms-inventory`

5. Configuration du build :
   - **Branch to deploy** : `main`
   - **Build command** : `cd frontend && yarn install && yarn build`
   - **Publish directory** : `frontend/build`

6. **Variables d'environnement** (cliquez sur "Advanced") :
   
   Ajoutez :
   
   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | `https://bms-backend-xxxx.onrender.com` (votre URL Render) |

7. Cliquez sur **Deploy site**

8. Attendez que le déploiement se termine (3-5 minutes)

9. **NOTEZ L'URL** de votre site (ex: `https://random-name-xxxxx.netlify.app`) ✅

### Option B : Déploiement via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

---

## 5️⃣ Étape 5 : Configuration CORS (Important!)

Maintenant que vous avez l'URL Netlify, retournez sur **Render.com** :

1. Allez sur votre service backend
2. Cliquez sur **Environment**
3. Modifiez la variable `CORS_ORIGINS` :
   ```
   https://votre-app.netlify.app,http://localhost:3000
   ```
4. Sauvegardez (le service va redémarrer automatiquement)

---

## 6️⃣ Étape 6 : Personnaliser le nom de domaine Netlify (Optionnel)

1. Sur Netlify, allez dans **Site settings**
2. Cliquez sur **Change site name**
3. Choisissez un nom plus sympa (ex: `bms-inventory`)
4. Votre site sera disponible sur `https://bms-inventory.netlify.app`

Si vous avez un nom de domaine personnalisé :
1. Allez dans **Domain settings**
2. Cliquez sur **Add custom domain**
3. Suivez les instructions

---

## ✅ Étape 7 : Tester l'application

1. Ouvrez votre site Netlify : `https://votre-app.netlify.app`

2. Testez la connexion :
   - Username : `AdminLudo`
   - Password : `AdminLudo`

3. Créez quelques articles de test

4. Vérifiez que tout fonctionne :
   - ✅ Connexion/Déconnexion
   - ✅ Création d'articles
   - ✅ Upload de photos
   - ✅ Dashboard
   - ✅ Catalogue public

---

## 🔧 Dépannage

### Le backend ne démarre pas sur Render

**Vérifiez** :
- Les variables d'environnement sont bien configurées
- La chaîne MongoDB est correcte
- Les logs Render pour voir l'erreur

### Le frontend ne se connecte pas au backend

**Vérifiez** :
- La variable `REACT_APP_BACKEND_URL` sur Netlify
- La variable `CORS_ORIGINS` sur Render contient bien l'URL Netlify
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### "Service Unavailable" sur le backend

- C'est normal ! Le plan gratuit de Render met le service en veille
- Attendez 30-60 secondes, puis réessayez

### Les images ne s'affichent pas

- Vérifiez que la compression d'images fonctionne
- Testez avec des images plus petites (<5 MB)

---

## 🔄 Mises à jour

Pour déployer des modifications :

```bash
# Faire vos modifications
git add .
git commit -m "Description des changements"
git push origin main
```

- **Render** se redéploiera automatiquement
- **Netlify** se redéploiera automatiquement

---

## 💰 Limites du plan gratuit

### MongoDB Atlas (Free M0)
- ✅ 512 MB de stockage
- ✅ Connexions illimitées
- ✅ Parfait pour un petit projet

### Render.com (Free)
- ✅ 512 MB RAM
- ✅ Bande passante illimitée
- ⚠️ Service en veille après 15 min d'inactivité
- ⚠️ Réveil en ~30-60 secondes

### Netlify (Free)
- ✅ 100 GB bande passante/mois
- ✅ Builds illimités
- ✅ CDN global
- ✅ HTTPS automatique

---

## 🎉 Félicitations !

Votre application BMS Inventory est maintenant déployée et accessible depuis n'importe où dans le monde, **totalement gratuitement** ! 🚀

### URLs importantes à garder :

- 🌐 **Frontend** : `https://votre-app.netlify.app`
- 🔧 **Backend** : `https://bms-backend-xxxx.onrender.com`
- 📊 **Database** : MongoDB Atlas Dashboard

### Prochaines étapes :

1. Partagez l'URL avec votre équipe
2. Créez des comptes employés
3. Ajoutez vos articles
4. Profitez ! 🎊

---

## 📞 Support

Si vous rencontrez des problèmes :
- Documentation Render : https://render.com/docs
- Documentation Netlify : https://docs.netlify.com
- Documentation MongoDB Atlas : https://docs.atlas.mongodb.com

Bon déploiement ! 🚀

