# 🚀 Démarrage Rapide - 5 minutes chrono !

## Étape 1️⃣ : MongoDB Atlas (2 min)

1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Créez un compte → Créez un cluster **FREE M0**
3. Dans "Database Access" → Ajoutez un utilisateur avec mot de passe
4. Dans "Network Access" → Ajoutez `0.0.0.0/0` (Allow from Anywhere)
5. Cliquez sur "Connect" → "Connect your application" → **Copiez la chaîne de connexion**

Exemple : `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/`

---

## Étape 2️⃣ : Backend sur Render (2 min)

1. Allez sur https://render.com/ → Créez un compte
2. Connectez votre GitHub
3. New + → Web Service → Votre dépôt
4. **Configuration** :
   - Build : `cd backend && pip install -r requirements.txt`
   - Start : `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Plan : **Free**
5. **Variables d'environnement** (Advanced) :
   ```
   MONGO_URL = mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/
   DB_NAME = bms_inventory
   JWT_SECRET = un-secret-aleatoire-tres-long
   CORS_ORIGINS = https://votre-app.netlify.app,http://localhost:3000
   ```
6. Deploy ! → **Copiez l'URL** (ex: `https://bms-backend-xxxx.onrender.com`)

---

## Étape 3️⃣ : Frontend sur Netlify (1 min)

1. Allez sur https://www.netlify.com/ → Créez un compte
2. Add new site → Import from Git → GitHub → Votre dépôt
3. **Configuration** :
   - Build : `cd frontend && yarn install && yarn build`
   - Publish : `frontend/build`
4. **Variables d'environnement** (Advanced) :
   ```
   REACT_APP_BACKEND_URL = https://bms-backend-xxxx.onrender.com
   ```
5. Deploy ! → **Copiez l'URL** (ex: `https://random-name.netlify.app`)

---

## Étape 4️⃣ : Mise à jour CORS (30 sec)

Retournez sur **Render.com** :
- Modifiez `CORS_ORIGINS` pour inclure votre URL Netlify :
  ```
  https://votre-app.netlify.app,http://localhost:3000
  ```
- Sauvegardez (redémarrage auto)

---

## ✅ C'est prêt !

🌐 **Votre app** : https://votre-app.netlify.app  
🔐 **Login** : `AdminLudo` / `AdminLudo`

---

## 🔄 Pour les mises à jour

```bash
git add .
git commit -m "Vos changements"
git push
```

Render et Netlify se redéploient automatiquement ! 🎉

---

## 📝 Checklist

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster gratuit configuré
- [ ] Utilisateur de base de données créé
- [ ] Network Access configuré (0.0.0.0/0)
- [ ] Chaîne de connexion copiée
- [ ] Compte Render créé
- [ ] Backend déployé sur Render
- [ ] Variables d'environnement Backend configurées
- [ ] URL Backend copiée
- [ ] Compte Netlify créé
- [ ] Frontend déployé sur Netlify
- [ ] Variable REACT_APP_BACKEND_URL configurée
- [ ] CORS_ORIGINS mis à jour avec URL Netlify
- [ ] Test de connexion réussi
- [ ] Création d'article test réussie

---

**Des problèmes ?** Consultez [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) pour plus de détails !

