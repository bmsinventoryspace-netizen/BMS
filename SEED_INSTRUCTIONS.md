# 📦 Peupler l'inventaire avec des données de démo

## 🎯 Ce que le script va créer :

**20 articles réalistes** pour une démo professionnelle :

### Pièces (13 articles) :
- Alternateur Bosch 0124525015
- Démarreur Valeo D6RA133
- Batterie Varta E11 574012068
- Plaquettes de frein Brembo P85020
- Disques de frein ATE 24.0112-0154.1
- Filtre à huile Mann W 712/75
- Filtre à air Bosch 1457433529
- Pompe à eau Gates WP0045
- Radiateur Nissens 63002A
- Embrayage Valeo 826320
- Amortisseur Sachs 313527
- Rotule de direction TRW JTE1077
- Capteur ABS Bosch 0265006800
- Courroie de distribution Gates 5491XS
- Turbo Garrett 753420-5006S
- Échappement Walker 16862
- Compresseur clim Denso DCP17045
- Rétroviseur Peugeot 206
- Phare avant Hella
- Catalyseur Walker 20501

### Liquides (8 articles) :
- Huile moteur Castrol Edge 5W30
- Huile moteur Total Quartz 5W40
- Huile boîte Motul Gear 75W90
- Liquide de refroidissement Total
- Liquide de frein DOT 4 ATE
- Huile hydraulique LHM Citroën
- Liquide de direction assistée Febi
- Lave-glace concentré

**Tous les articles ont :**
- ✅ Vraies références constructeur
- ✅ Prix réalistes (neuf, achat, vente)
- ✅ Descriptions détaillées
- ✅ Catégories et sous-catégories
- ✅ États réalistes
- ✅ Marqués comme "public" pour le catalogue
- ✅ Stock et quantités

---

## 🚀 Comment lancer le script :

### Option 1 : Localement (Recommandé)

1. Assure-toi d'avoir un fichier `backend/.env` avec ta connexion MongoDB :
   ```env
   MONGO_URL=mongodb+srv://adminludo:AdminLudo123%21@cluster0.bp5tvld.mongodb.net/
   DB_NAME=bms_inventory
   ```

2. Active ton environnement Python (si tu en as un) :
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # ou
   source venv/bin/activate  # Linux/Mac
   ```

3. Installe les dépendances (si pas déjà fait) :
   ```bash
   pip install -r requirements.txt
   ```

4. **Lance le script** :
   ```bash
   python seed_inventory.py
   ```

5. Le script va te demander confirmation si tu as déjà des articles
6. Tape `y` pour confirmer

---

### Option 2 : Depuis Render.com (Plus compliqué)

Tu peux aussi l'exécuter via le shell Render, mais c'est plus compliqué.

---

## ⚠️ Notes importantes :

- Le script vérifie s'il y a déjà des articles et demande confirmation
- Les SKU sont générés automatiquement
- Les dates de post sont variées (entre 1 et 30 jours)
- Tous les articles sont publics par défaut

---

## 🎬 Après l'exécution :

1. Recharge ton site Netlify
2. Va sur le **Dashboard** ou **Inventaire**
3. Tu verras tous les articles avec leurs vraies refs !
4. Va sur le **Catalogue Public** - tout sera là aussi !

---

## 🧹 Pour nettoyer (si besoin) :

Si tu veux supprimer tous les articles de démo plus tard :
- Depuis l'interface : Supprime-les un par un
- Ou depuis MongoDB Atlas : Vide la collection "articles"

---

**Exécute le script et profite de ta démo réaliste !** 🚀

