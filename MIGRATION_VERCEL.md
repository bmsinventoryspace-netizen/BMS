# 🚀 Migration Netlify → Vercel (5 minutes)

## Pourquoi Vercel ?
- ✅ **6000 minutes de build/mois** (vs 300 sur Netlify)
- ✅ 100 GB bande passante
- ✅ Exactement pareil que Netlify
- ✅ Gratuit à vie

---

## 📋 Étapes (super simple !) :

### 1️⃣ Créer un compte Vercel (1 min)
1. Va sur **https://vercel.com/signup**
2. Clique sur **"Continue with GitHub"**
3. Autorise Vercel à accéder à ton GitHub
4. ✅ C'est tout !

---

### 2️⃣ Déployer ton projet (2 min)
1. Sur Vercel, clique sur **"Add New..."** → **"Project"**
2. Trouve ton repo **BMS** dans la liste
3. Clique sur **"Import"**
4. **Configuration** :
   - **Framework Preset** : Create React App
   - **Root Directory** : `./` (laisser par défaut)
   - **Build Command** : `cd frontend && yarn install && yarn build`
   - **Output Directory** : `frontend/build`
   
5. **Variables d'environnement** (cliquer sur "Environment Variables") :
   ```
   REACT_APP_BACKEND_URL = https://bms-uudc.onrender.com
   ```
   
6. Clique sur **"Deploy"** !

7. ⏳ Attends 2-3 minutes

8. ✅ **C'est en ligne !**

---

### 3️⃣ Mettre à jour CORS sur Render (1 min)
1. Va sur **Render.com** → Ton service BMS
2. **Environment** → `CORS_ORIGINS`
3. **Ajoute** ton URL Vercel :
   ```
   https://ton-url-vercel.vercel.app,http://localhost:3000
   ```
4. Sauvegarde (redémarre auto)

---

## ✅ C'est fini !

Ton site sera sur : `https://ton-projet.vercel.app`

**Tu peux supprimer le site Netlify** si tu veux.

---

## 🎁 Bonus Vercel :

- Déploiements **2× plus rapides**
- **6000 minutes** de build (tu es tranquille !)
- Dashboard plus moderne
- Analytics gratuits
- Domaine custom facile

---

## 💡 Astuce :

Pour éviter de consommer les minutes :
- Ne commit que quand tout est prêt
- Teste en local avant de commit
- Un gros commit vaut mieux que 10 petits

Avec Vercel et 6000 minutes, tu es large ! 🚀

---

**Prêt ? Crée ton compte Vercel et suis ces 3 étapes !** 😊

