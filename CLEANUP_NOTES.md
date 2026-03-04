# 🧹 Nettoyage de la gestion des Tokens

## Fichiers Redondants à SUPPRIMER :
- ❌ `assets/scripts/User.js` - Modèle Mongoose côté client (INUTILE + CONFUS)
  - Jamais importé nulle part
  - Contient des champs différents du vrai modèle backend
  - C'est du code qui ne s'exécutera JAMAIS

## Source Unique de Vérité :
- ✅ `backend/models/User.js` - Le SEUL modèle qui compte
- ✅ `backend/migrations/addTokensToUsers.js` - Mise à jour des anciens users

## Tokens par Défaut :
- **Création de compte** : 500 tokens (défaut dans `backend/models/User.js`)
- **Connexion quotidienne** : +50 tokens (généré par `handleDailyLogin()`)
- **Pack Premium** : coûte 200 tokens
- **Pack Legendary** : coûte 500 tokens

## Problème Possible si vous voyez "200 + 50" :
Si les anciens utilisateurs ont 200 tokens et ne sont pas passés à 500 :
- La migration `addTokensToUsers.js` n'met à jour que les users SANS champ `tokens`
- Les users avec `tokens: 200` ne sont PAS affectés
- Solution : Fair une migration pour remplacer 200 → 500

## Fichiers Cohérents ✓
- `backend/models/User.js` : `default: 500` ✓
- `backend/migrations/addTokensToUsers.js` : `tokens: 500` ✓
- `backend/controllers/authController.js` : `tokens: user.tokens || 500` ✓
- `backend/controllers/userController.js` : `tokens: user.tokens ?? 500` ✓
