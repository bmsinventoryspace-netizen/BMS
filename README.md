# 🚀 BMS Inventory - Système de Gestion d'Inventaire

Application complète de gestion d'inventaire avec catalogue public, gestion d'équipe et statistiques.

![Tech Stack](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

---

## ✨ Fonctionnalités

### 🌐 Catalogue Public
- Affichage des articles avec filtres
- Système de publicités et offres
- Tracking des vues
- Contact direct par téléphone

### 📦 Gestion d'Inventaire
- CRUD complet pour les articles
- Support pièces et liquides
- Upload multiple de photos
- Compression automatique des images
- Génération automatique de SKU
- Export Excel

### 🛢️ Gestion des Liquides
- Niveaux de stock visuels
- Alertes automatiques (stock critique/faible)
- Ajout/retrait de quantités
- Calcul prévisionnel

### 👥 Collaboration
- Post-its d'équipe avec système de "vu"
- Agenda partagé
- Dashboard personnalisé avec mémo et to-do list
- Notifications temps réel (WebSocket)

### 📊 Statistiques
- Top 10 articles les plus vus
- Graphiques interactifs
- Historique de consultation

### 🔐 Administration
- Gestion des utilisateurs (admin/employé)
- Configuration des numéros de téléphone
- Gestion des pubs et offres
- Authentification JWT

---

## 🛠️ Technologies

### Backend
- **FastAPI** - Framework web moderne et rapide
- **MongoDB** + **Motor** - Base de données NoSQL asynchrone
- **JWT** + **BCrypt** - Authentification sécurisée
- **WebSocket** - Notifications en temps réel
- **Pillow** - Compression d'images
- **OpenPyXL** - Export Excel

### Frontend
- **React 19** - Bibliothèque UI
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI modernes
- **Recharts** - Graphiques interactifs
- **Socket.io** - Communication temps réel
- **Axios** - Client HTTP
- **React Router** - Routing

---

## 🚀 Déploiement (Gratuit !)

Ce projet peut être déployé **100% gratuitement** sur :

- **Frontend** : Netlify (100 GB/mois)
- **Backend** : Render.com (512 MB RAM)
- **Database** : MongoDB Atlas (512 MB)

📖 **Suivez le guide complet** : [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 💻 Installation Locale

### Prérequis
- Python 3.11+
- Node.js 18+
- MongoDB (ou compte MongoDB Atlas)

### Backend

```bash
# Aller dans le dossier backend
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
venv\Scripts\activate
# Ou (Linux/Mac)
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env
# Éditez .env avec vos configurations

# Lancer le serveur
uvicorn server:app --reload
```

Le backend sera disponible sur `http://localhost:8000`

### Frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
yarn install

# Créer le fichier .env
cp .env.example .env
# Éditez .env avec l'URL du backend

# Lancer le serveur de développement
yarn start
```

Le frontend sera disponible sur `http://localhost:3000`

---

## 🔑 Compte par défaut



⚠️ **Changez le mot de passe après la première connexion !**

---

## 📁 Structure du Projet

```
projet_emergent_complet/
├── backend/
│   ├── server.py              # API FastAPI
│   ├── requirements.txt       # Dépendances Python
│   ├── .env.example          # Template variables d'environnement
│   └── runtime.txt           # Version Python pour Render
├── frontend/
│   ├── public/               # Fichiers statiques
│   ├── src/
│   │   ├── components/       # Composants React
│   │   │   ├── ui/          # Composants shadcn/ui
│   │   │   └── Layout.js    # Layout principal
│   │   ├── pages/           # Pages de l'application
│   │   │   ├── admin/       # Pages admin
│   │   │   ├── Dashboard.js
│   │   │   ├── Inventaire.js
│   │   │   ├── Huiles.js
│   │   │   ├── CataloguePublic.js
│   │   │   └── Stats.js
│   │   ├── App.js           # Composant principal
│   │   └── index.js         # Point d'entrée
│   ├── package.json         # Dépendances Node.js
│   └── .env.example        # Template variables d'environnement
├── netlify.toml            # Configuration Netlify
├── render.yaml             # Configuration Render
├── DEPLOYMENT_GUIDE.md     # Guide de déploiement détaillé
└── README.md              # Ce fichier
```

---

## 🔧 Configuration

### Variables d'environnement Backend

Créez `backend/.env` :

```env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=bms_inventory
JWT_SECRET=votre-secret-jwt-super-securise
CORS_ORIGINS=http://localhost:3000
```

### Variables d'environnement Frontend

Créez `frontend/.env` :

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

---

## 🎨 Design

- **Couleur principale** : Bleu (#2563eb)
- **Style** : Glass morphism moderne
- **Responsive** : Mobile-first
- **Animations** : Transitions fluides
- **Icons** : Lucide React

---

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que MongoDB est accessible
- Vérifiez les variables d'environnement
- Vérifiez les logs d'erreur

### Le frontend ne se connecte pas
- Vérifiez que le backend est lancé
- Vérifiez `REACT_APP_BACKEND_URL` dans `.env`
- Ouvrez la console du navigateur (F12)

### Erreur CORS
- Ajoutez l'URL du frontend dans `CORS_ORIGINS` du backend

---

## 📝 Licence

Ce projet est sous licence MIT.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue !

---

**Fait avec ❤️ par l'équipe BMS**
