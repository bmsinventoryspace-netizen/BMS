# 🚗 GUIDE DE DÉMARRAGE - INVENTAIRE DÉMO ULTRA RÉALISTE

## 📦 Ce que contient l'inventaire de démo

### Pièces Détachées (60+ articles)
- ⚡ **Électricité** : Alternateurs, démarreurs, batteries, capteurs ABS, bobines
- 🛑 **Freinage** : Plaquettes Brembo, disques ATE, étriers, maître-cylindre
- 🔧 **Filtration** : Filtres à huile Mann, filtres à air Bosch, filtres carburant
- 🌡️ **Refroidissement** : Pompes à eau Gates, radiateurs Nissens, thermostats
- ⚙️ **Transmission** : Kits embrayage Valeo, cardans, soufflets
- 🔩 **Suspension** : Amortisseurs Sachs, ressorts, silent-blocs
- 🎯 **Direction** : Rotules TRW, crémaillères, biellettes Moog
- ⏰ **Distribution** : Kits courroie Gates, courroies accessoires
- 💨 **Échappement** : Silencieux Walker, catalyseurs, sondes lambda
- 🌪️ **Turbo/Admission** : Turbos Garrett, vannes EGR, débitmètres Bosch
- ❄️ **Climatisation** : Compresseurs Denso, condenseurs Valeo
- 🚙 **Carrosserie** : Rétroviseurs, pare-chocs
- 💡 **Éclairage** : Phares Hella, feux arrière LED, ampoules Philips
- 🔨 **Accessoires** : Balais essuie-glace Bosch, bougies NGK, joints

### Liquides & Lubrifiants (18 articles)
- 🛢️ **Huiles Moteur** : Castrol Edge 5W30, Total Quartz 5W40, Mobil 1 0W30, ELF 10W40
- ⚙️ **Huiles Boîte** : Motul Gear 75W90, Total Fluide Auto
- 🌡️ **Liquides Refroidissement** : Total Glacelf, Castrol Radicool
- 🛑 **Liquides Frein** : ATE DOT 4, Bosch DOT 5.1
- 🎯 **Liquides Direction** : Febi, ZF Lifeguard, LHM+ Citroën
- 🧼 **Entretien** : Lave-glace concentré, AdBlue, graisse lithium, WD-40

## 🚀 Comment lancer le seed

### Étape 1 : Vérifier les variables d'environnement
```bash
cd backend
# Vérifier que .env contient MONGO_URL et DB_NAME
```

### Étape 2 : Lancer le script
```bash
python seed_inventory.py
```

### Étape 3 : Confirmation
- Le script vous demandera confirmation si des articles existent déjà
- Tapez `y` pour continuer
- Le script ajoutera environ **78 articles** à votre base de données

## ✨ Caractéristiques des données

### Toutes les pièces incluent :
- ✅ **Vraies références constructeur** (Bosch, Valeo, Brembo, ATE, Gates, etc.)
- ✅ **Descriptions techniques détaillées**
- ✅ **Prix réalistes** (prix neuf, achat, vente)
- ✅ **Catégories et sous-catégories**
- ✅ **États** (Comme neuf, Très bon état, Bon état)
- ✅ **Quantités et emplacements**
- ✅ **Dates de publication**
- ✅ **SKU uniques** (générés automatiquement)

### Tous les liquides incluent :
- ✅ **Vraies références produit**
- ✅ **Normes techniques** (ACEA, API, DIN, ISO, etc.)
- ✅ **Viscosités précises**
- ✅ **Stock en litres**
- ✅ **Quantité minimale recommandée**
- ✅ **Usage hebdomadaire estimé**
- ✅ **Applications détaillées**

## 🎯 Parfait pour :
- ✨ Démonstrations clients
- 🧪 Tests de l'application
- 📊 Présentation des fonctionnalités
- 🎓 Formation des utilisateurs
- 🚀 Mise en production avec données réalistes

## 🔥 Exemples de recherche

Une fois les données chargées, vous pourrez chercher :
- Par référence : `0124525015`, `P85020`, `W 712/75`
- Par marque : `Bosch`, `Valeo`, `Castrol`, `Total`
- Par catégorie : `Freinage`, `Électricité`, `Huiles`
- Par ID : `#1`, `#2`, etc.

## 📝 Notes importantes

1. **Génération automatique des SKU** : Chaque article reçoit un SKU unique `BMS-XXXXXXXX`
2. **Dates variées** : Les articles ont des dates de publication entre 1 et 30 jours
3. **Tous publics** : Tous les articles sont marqués comme `public: True` par défaut
4. **Emplacements réalistes** : Étagères A-E, zones spécialisées, vitrine sécurisée

## 🛠️ En cas de problème

Si le script ne fonctionne pas :
1. Vérifier que MongoDB est bien connecté
2. Vérifier les variables d'environnement
3. Vérifier que les dépendances sont installées (`pip install motor python-dotenv`)

## 🎉 Profitez de votre inventaire ultra réaliste !

Vous avez maintenant un inventaire complet de garage automobile professionnel avec :
- 60+ pièces détachées de toutes catégories
- 18 liquides et lubrifiants professionnels
- Des vraies références, des vrais prix, des vraies normes
- Parfait pour impressionner vos clients ! 🚗✨

