# Guide de débogage - "Failed to load resource"

## Étape 1 : Vérifier l'URL du backend

1. Ouvre la console (F12) → Onglet "Network" (Réseau)
2. Recharge la page
3. Regarde l'URL qui est en erreur (en rouge)
   - Est-ce que c'est `https://ton-backend.onrender.com/api/...` ?
   - Ou `http://localhost:8000/api/...` ?

## Étape 2 : Vérifier que Render est en ligne

1. Va sur https://dashboard.render.com
2. Vérifie que ton service backend est "Live" (vert)
3. Clique dessus et vérifie les logs

## Étape 3 : Tester le backend directement

1. Ouvre un nouvel onglet
2. Va sur l'URL de ton backend : `https://ton-backend.onrender.com/api/settings`
3. Tu devrais voir du JSON s'afficher

## Solutions possibles

### Si le backend dort (Render free tier)
- Attends 1-2 minutes que Render se réveille
- Le composant `ServerWakeup` devrait gérer ça automatiquement

### Si l'URL est incorrecte
- Vérifie le fichier `.env` dans `frontend/`
- Il devrait contenir : `REACT_APP_BACKEND_URL=https://ton-backend.onrender.com`

### Si c'est une erreur CORS
- Le backend doit autoriser l'origine du frontend
- Vérifie les logs Render pour voir l'erreur exacte

## Que faire maintenant ?

1. **Ouvre la console (F12)**
2. **Va dans l'onglet "Console"**
3. **Copie-colle TOUTE l'erreur rouge**
4. **Dis-moi exactement ce qui est écrit**

Exemple d'erreur à copier :
```
GET https://mon-backend.onrender.com/api/articles net::ERR_CONNECTION_REFUSED
```

Dis-moi ce que tu vois ! 🔍

