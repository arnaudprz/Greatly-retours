# Déploiement du backend — Greatly Vos retours

## ⚡ Déploiement rapide (clasp déjà configuré)

clasp est installé localement (`worker/node_modules`) et `.clasp.json` pointe sur le bon projet.
**La prod = la version live Apps Script. Toujours partir d'elle, jamais écraser à l'aveugle.**

```bash
cd worker
# 1. Récupérer la version live AVANT de modifier (le repo peut être en retard) :
./node_modules/.bin/clasp pull
# 2. Appliquer ses changements aux .gs, puis pousser + redéployer (garde la même URL) :
./node_modules/.bin/clasp push -f
./node_modules/.bin/clasp deploy -i AKfycbyxnTKKMvIFG_TUJIvOnRofGPeNUw04CKjUdRO40SVaOlutGB0TZfnBIaATRAWdbDfYKQ -d "maj"
# 3. Committer les .gs pour garder repo == prod.
```

- **scriptId** : `1FAwTMKL5VDAxPl52GK8N86njUKURKzYjtUjRWfT5DPKCkhDNFlkGoYvr`
- **deploymentId live** (URL de `config.js`) : `AKfycbyxnTKKMvIFG_TUJIvOnRofGPeNUw04CKjUdRO40SVaOlutGB0TZfnBIaATRAWdbDfYKQ`
- Si `node_modules` disparaît : `cd worker && npm install`. Auth clasp : `~/.clasprc.json`.

---

## Installation initiale (pour mémoire)

## Étape 1 : Créer une Google Sheets

1. Aller sur https://sheets.google.com
2. Créer une nouvelle feuille vide
3. Copier l'ID de la feuille (dans l'URL : `docs.google.com/spreadsheets/d/XXXXXXX/edit`)
4. Les onglets "users", "requests", "responses", "log" seront créés automatiquement

## Étape 2 : Créer le projet Apps Script

1. Aller sur https://script.google.com
2. Cliquer "Nouveau projet"
3. Renommer le projet en "Greatly — Vos retours"
4. Supprimer le contenu de Code.gs
5. Copier-coller le contenu de chaque fichier .gs :
   - `Code.gs` → Code.gs (fichier par défaut)
   - `auth.gs` → Nouveau fichier → auth
   - `email.gs` → Nouveau fichier → email
   - `users.gs` → Nouveau fichier → users
   - `submit.gs` → Nouveau fichier → submit

## Étape 3 : Configurer les Script Properties

1. Dans Apps Script → ⚙️ Paramètres du projet → Propriétés du script
2. Ajouter ces propriétés :

| Propriété | Valeur |
|-----------|--------|
| `HMAC_SECRET` | Une chaîne aléatoire de 64+ caractères (ex: générer sur random.org) |
| `ADMIN_EMAIL` | `arnaudprz@gmail.com` |
| `SPREADSHEET_ID` | L'ID de la Google Sheets créée à l'étape 1 |

## Étape 4 : Déployer en Web App

1. Dans Apps Script → Déployer → Nouveau déploiement
2. Type : Application Web
3. Description : "Greatly Vos retours — API"
4. Exécuter en tant que : **Moi**
5. Accès : **Tout le monde**
6. Cliquer "Déployer"
7. Copier l'URL du déploiement (format : `https://script.google.com/macros/s/XXXXX/exec`)

## Étape 5 : Configurer le front

Dans `docs/assets/js/config.js`, remplacer :

```js
RELAY_URL: 'https://script.google.com/macros/s/DEPLOY_ID/exec',
DEMO_MODE: true,
```

Par :

```js
RELAY_URL: 'https://script.google.com/macros/s/TON_ID_DE_DEPLOIEMENT/exec',
DEMO_MODE: false,
```

## Étape 6 : Tester

1. Aller sur https://arnaudprz.github.io/Greatly-retours/dashboard.html
2. Entrer `arnaudprz@gmail.com`
3. Vérifier la réception de l'email magic link
4. Cliquer le lien → connexion automatique en Super-admin

## Sécurité

- Le `HMAC_SECRET` ne doit JAMAIS être partagé ni commité dans le code
- L'`ADMIN_EMAIL` (arnaudprz@gmail.com) est Super-admin permanent, ne peut pas être supprimé
- Les Script Properties ne sont visibles que dans l'éditeur Apps Script
- Les tokens magic link expirent après 15 min et sont à usage unique
- Les sessions expirent après 4h
