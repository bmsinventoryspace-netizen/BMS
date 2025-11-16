# 🔧 Configuration des Variables d'Environnement

## Backend (.env)

Créez un fichier `backend/.env` avec ce contenu :

```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=bms_inventory

# JWT Secret (change this to a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origins (your Netlify URL)
CORS_ORIGINS=https://your-app.netlify.app,http://localhost:3000

# Server Configuration
PORT=8000

# Optional: SMTP (for DealFire email notifications)
# If set and an email is configured in Admin > Numéros > Email notification DealFire,
# an email is sent on each new Deal.
# Typical example for Gmail SMTP (be careful with app passwords):
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your.email@domain.com
# SMTP_PASS=your_app_password
# SMTP_FROM=your.email@domain.com
```

## Frontend (.env)

Créez un fichier `frontend/.env` avec ce contenu :

```env
# Backend API URL
# For local development: http://localhost:8000
# For production: your Render backend URL
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## 📝 Instructions rapides

### Créer le fichier backend/.env

**Windows (PowerShell)** :
```powershell
cd backend
New-Item -Path ".env" -ItemType File
notepad .env
```

Puis collez le contenu ci-dessus.

**Linux/Mac** :
```bash
cd backend
nano .env
```

Puis collez le contenu ci-dessus.

### Créer le fichier frontend/.env

**Windows (PowerShell)** :
```powershell
cd frontend
New-Item -Path ".env" -ItemType File
notepad .env
```

Puis collez le contenu ci-dessus.

**Linux/Mac** :
```bash
cd frontend
nano .env
```

Puis collez le contenu ci-dessus.

---

## ⚠️ Important

**Ne commitez JAMAIS ces fichiers .env sur Git !**

Ils sont déjà dans le `.gitignore`.

