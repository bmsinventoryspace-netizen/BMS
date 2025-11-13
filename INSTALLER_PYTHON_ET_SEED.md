# 🚀 GUIDE RAPIDE : INSTALLER PYTHON ET LANCER LE SEED

## Étape 1 : Installer Python (2 MINUTES)

### Méthode 1 : Via winget (RAPIDE)
Ouvrez PowerShell et tapez :
```powershell
winget install Python.Python.3.12 --accept-source-agreements --accept-package-agreements
```
Appuyez sur **Y** puis **Entrée** si demandé.

### Méthode 2 : Téléchargement direct
1. Allez sur https://www.python.org/downloads/
2. Cliquez sur "Download Python 3.12"
3. **IMPORTANT** : Cochez ☑️ "Add Python to PATH"
4. Cliquez sur "Install Now"

---

## Étape 2 : Vérifier l'installation
Fermez et rouvrez PowerShell, puis tapez :
```powershell
python --version
```
Vous devriez voir : `Python 3.12.x`

---

## Étape 3 : Installer les dépendances
```powershell
cd backend
pip install motor python-dotenv
```

---

## Étape 4 : Lancer le seed ! 🎉
```powershell
python seed_inventory.py
```

**OU** double-cliquez sur :
```
backend/run_seed.bat
```

---

## ✨ Résultat attendu :

```
🚀 Démarrage du peuplement ULTRA RÉALISTE de la base de données...
📦 Inventaire complet de garage automobile

🔧 Ajout des pièces détachées...
  ✅ Alternateur Bosch 14V 90A - 0124525015 (#1)
  ✅ Démarreur Valeo 12V 1.1kW - D6RA133 (#2)
  ✅ Batterie Varta Blue Dynamic E11 - E11 574012068 (#3)
  ...

🛢️  Ajout des huiles et liquides...
  ✅ Huile Moteur Castrol Edge 5W30 C3 - 15669E (45.0L) (#61)
  ✅ Huile Moteur Total Quartz 9000 5W40 - 183199 (35.0L) (#62)
  ...

🎉 Terminé ! 78 articles ajoutés avec succès !

📊 Résumé détaillé :
   - Pièces détachées : 60
   - Huiles & Liquides : 18
   - Total articles : 78

✨ Ton inventaire de DÉMO ULTRA RÉALISTE est prêt !
```

---

## 🆘 En cas de problème

**"python n'est pas reconnu"**
→ Fermez et rouvrez PowerShell après installation
→ Ou redémarrez votre ordinateur

**"MONGO_URL not set"**
→ Vérifiez que le fichier `backend/.env` existe et contient MONGO_URL

**"Module not found: motor"**
→ Lancez : `pip install motor python-dotenv`

---

## 🎉 C'est tout !

Après ces 4 étapes simples, vous aurez :
- ✅ 78 articles ultra réalistes
- ✅ Vraies références (Bosch, Valeo, Brembo, Castrol...)
- ✅ Descriptions techniques complètes
- ✅ Prix et stocks réalistes
- ✅ Prêt pour votre démo ! 🚗✨

