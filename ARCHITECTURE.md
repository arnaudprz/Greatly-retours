# Architecture technique — Greatly Vos retours

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Pages (docs/)                                   │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ index    │  │ intervenant  │  │ prospect          │ │
│  │ .html    │  │ .html        │  │ .html             │ │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘ │
│       │               │                   │             │
│       └───────┬───────┘                   │             │
│               ▼                           │             │
│  ┌─────────────────────────────┐          │             │
│  │  dashboard.html             │◀─────────┘             │
│  │  (filtres, graphiques,      │                        │
│  │   verbatims, admin, chat)   │                        │
│  └─────────────┬───────────────┘                        │
│                │                                        │
│  assets/js/    │   assets/css/                          │
│  ├─ config.js  │   ├─ shared.css    (variables, reset)  │
│  ├─ api.js     │   ├─ form.css      (formulaires)       │
│  ├─ form/      │   └─ dashboard.css (dashboard)         │
│  └─ dashboard/ │                                        │
└────────────────┼────────────────────────────────────────┘
                 │ POST JSON (Content-Type: text/plain)
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Google Apps Script — Web App (worker/)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Code.gs  │  │ auth.gs  │  │ submit.gs│              │
│  │ (router) │  │ (HMAC)   │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ data.gs  │  │ admin.gs │  │ email.gs │              │
│  │ (lecture) │  │ (invite) │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐                                           │
│  │github.gs │─── API GitHub ──▶ commit JSON ──▶ data/   │
│  └──────────┘                                           │
└─────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  data/  (JSON dans le repo, committés par le relais)    │
│  └─ réponses anonymes, agrégées par le dashboard        │
└─────────────────────────────────────────────────────────┘
```

## Structure des fichiers

```
vos-retours/
├── README.md                    Présentation, changelog, statut
├── ARCHITECTURE.md              Ce fichier
├── data/                        Données persistées (JSON)
│   └── .gitkeep
├── docs/                        Front — servi par GitHub Pages
│   ├── index.html               Formulaire membre
│   ├── intervenant.html         Formulaire intervenant
│   ├── prospect.html            Formulaire prospect (futurs membres)
│   ├── dashboard.html           Dashboard équipe + admin
│   └── assets/
│       ├── css/
│       │   ├── shared.css       Variables CSS, reset, typo, composants communs
│       │   ├── form.css         Styles formulaires (steps, chips, NPS, textarea)
│       │   └── dashboard.css    Styles dashboard (filtres, KPIs, cards, charts, chat)
│       ├── js/
│       │   ├── config.js        Configuration (URL relais, mode démo, clés localStorage)
│       │   ├── api.js           Client HTTP vers le relais Apps Script
│       │   ├── form/
│       │   │   ├── state.js     État global du formulaire (role, type, step)
│       │   │   ├── scales.js    Définition des questions par rôle × type
│       │   │   ├── steps.js     Navigation entre étapes + validation
│       │   │   ├── ui.js        Construction dynamique du DOM (chips, NPS, textarea)
│       │   │   └── submit.js    Sérialisation JSON + envoi au relais
│       │   └── dashboard/
│       │       ├── auth.js      Login, profil, onboarding, session localStorage
│       │       ├── filters.js   État des filtres + binding boutons
│       │       ├── data.js      Chargement données depuis le relais
│       │       ├── charts.js    Tous les graphiques Chart.js (NPS, énergie, phases…)
│       │       ├── alerts.js    Points d'attention intervenants
│       │       ├── chat.js      Chat communautaire (fil unique)
│       │       └── admin.js     Console admin (invitations, suspensions)
│       └── og-retours.svg       Image Open Graph formulaire
│       └── og-prospect.svg      Image Open Graph prospect
└── worker/                      Backend Google Apps Script
    └── .env.example             Variables d'environnement requises
```

## Front-end

### Stack
- **HTML / CSS / JS vanilla** — aucun framework, aucun bundler
- **Chart.js 4.4** (CDN) pour les graphiques du dashboard
- **Google Fonts** : DM Sans (corps) + Playfair Display (titres)
- Hébergement : **GitHub Pages** depuis le dossier `docs/`

### Palette CSS (variables dans shared.css)
| Variable | Couleur | Usage |
|----------|---------|-------|
| `--sage` | #6B7D5C | Couleur principale Greatly |
| `--energie` | #C0814E | Parcours Énergie |
| `--lucidite` | #4F7C82 | Parcours Lucidité |
| `--cream` | #F7F4EF | Fond de page |
| `--ink` | #1A1A1A | Texte principal |
| `--warm-grey` | #6B6460 | Texte secondaire |
| `--line` | #E7E1D7 | Bordures, séparateurs |

### Formulaires (3 pages distinctes)

**Parcours utilisateur commun :**
1. Choix du rôle (membre/intervenant) et du type (Énergie/Lucidité)
2. Contexte : activité (Yoga/Padel) ou atelier (1 à 7)
3. Notes 0-10 : phases de la séance + questions spécifiques au rôle × type
4. NPS + questions ouvertes (textarea)
5. Écran "Merci"

**Questions personnalisées** : le fichier `scales.js` contient 4 jeux de questions :
- `membre_energie` : énergie avant/après, rythme, plaisir, lieu
- `membre_lucidite` : recul, échanges, outils, élan, Greatly House
- `intervenant_energie` : groupe, conditions, lieu, animation
- `intervenant_lucidite` : groupe, conditions, House, animation

**Validation** : toutes les questions sont obligatoires. La validation se fait étape par étape (fonction `validateStep`). Les cartes non remplies reçoivent la classe `.err`.

**Sérialisation** (`submit.js`) : le formulaire est sérialisé en JSON avec la structure :
```json
{
  "ts": "2026-06-15T14:30:00.000Z",
  "role": "membre",
  "type": "energie",
  "contexte": { "sport": "Yoga", "atelier": null },
  "phases": { "Accueil & cadre": 9, "Échauffement": 8, ... },
  "echelles": { "avant": 5, "apres": 8, "rythme": 9, ... },
  "nps": 9,
  "ouvertes": { "Ce que j'emporte avec moi": "..." }
}
```

### Dashboard

**Authentification** (`auth.js`) :
- Mode démo : n'importe quel mot de passe fonctionne (comparaison locale contre un hash SHA-256 provisoire en dur dans `config.js`)
- Mode réel (à venir) : le mot de passe est envoyé au relais qui vérifie le hash + sel côté serveur et retourne un token HMAC
- Session stockée dans `localStorage` (clé `greatly_retours_token`), durée 4h
- Profil utilisateur (prénom, nom, email) stocké en `localStorage`, affiché dans le widget header
- Onboarding en 3 étapes au premier login

**Filtres** (`filters.js`) :
- Type : Tous / Énergie / Lucidité
- Activité : Toutes / Yoga / Padel (visible seulement si Énergie)
- Qui : Membres + intervenants / Membres / Intervenants
- Période : 3 / 6 / 12 mois
- Coach : Yoga / Padel (dans la carte "Par intervenant")

Chaque clic met à jour l'objet `F` et appelle `render()` qui reconstruit tous les graphiques.

**Graphiques** (`charts.js` — 1119 lignes) :
- NPS par mois (ligne, Énergie vs Lucidité)
- Énergie avant/après séance (ligne)
- Répartition NPS promoteurs/passifs/détracteurs (barres empilées)
- NPS par atelier Lucidité (barres)
- Yoga vs Padel (barres groupées)
- Phases Énergie et Lucidité (barres horizontales)
- Détail par question (mini-graphes ligne + barres de volume)
- Par intervenant (double axe note + NPS)
- Lieux (barres horizontales)

En mode démo, toutes les données sont fictives et générées dans `charts.js`.

**Chat** (`chat.js`) : fil communautaire unique, messages stockés en localStorage en démo.

**Admin** (`admin.js`) : UI d'invitation/suspension/suppression d'utilisateurs. Appelle `API.invite()`, `API.suspend()`, etc. Non fonctionnel en mode démo.

## Backend (à développer)

### Google Apps Script — Rôle
Le relais Apps Script est une Web App déployée qui sert d'intermédiaire entre le front (GitHub Pages) et les données (JSON dans le repo GitHub). Il gère :
- L'authentification (hash + HMAC)
- La réception et validation des réponses
- L'écriture des données via l'API GitHub (commit JSON)
- La lecture et l'agrégation des données pour le dashboard
- La gestion des utilisateurs (invitations, suspensions)
- L'envoi d'emails (notifications, invitations)

### Flux de soumission d'un retour
```
Navigateur                    Apps Script               GitHub
    │                              │                       │
    │──POST {action:"submit",...}─▶│                       │
    │                              │── valide le JSON      │
    │                              │── anonymise           │
    │                              │──PUT data/xxx.json───▶│
    │                              │                       │── commit
    │◀── {ok: true} ──────────────│◀── 200 ───────────────│
```

### Flux d'authentification
```
Navigateur                    Apps Script
    │                              │
    │──POST {action:"login",       │
    │        password:"..."}──────▶│
    │                              │── SHA-256(password + sel) == hash ?
    │                              │── si oui : token = HMAC(email + ts)
    │◀── {token:"...", role:"..."}─│
    │                              │
    │  (requêtes suivantes)        │
    │──POST {action:"data",        │
    │        token:"..."}─────────▶│
    │                              │── vérifie HMAC(token)
    │◀── {données agrégées}────────│
```

### Variables d'environnement (Script Properties)
| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | Personal access token GitHub (scope: repo) |
| `GITHUB_REPO` | `arnaudprz/Greatly-retours` |
| `GITHUB_BRANCH` | `main` |
| `PASSWORD_HASH` | Hash SHA-256 du mot de passe équipe |
| `PASSWORD_SALT` | Sel aléatoire pour le hash |
| `HMAC_SECRET` | Clé secrète pour signer les tokens de session |
| `ADMIN_EMAIL` | Email du super-admin |

### Communication front ↔ relais
- Toutes les requêtes passent par `API.call()` dans `api.js`
- Méthode : `POST` avec `Content-Type: text/plain` (évite le preflight CORS)
- Corps : JSON avec `{ action, token, ...payload }`
- Le relais Apps Script redirige (302) vers le résultat JSON
- Actions disponibles : `submit`, `login`, `forgot`, `request-access`, `data`, `admin.*`

## Données

### Stockage
Les réponses sont des fichiers JSON dans `data/`, committés par le relais via l'API GitHub. Le dashboard les lit au chargement.

### Anonymat
- Aucun nom, email ou identifiant dans les réponses
- Aucune IP stockée
- Aucun cookie identifiant
- Le timestamp est la seule métadonnée temporelle

## Déploiement

### Front (GitHub Pages)
Le dossier `docs/` est configuré comme source GitHub Pages sur le repo `arnaudprz/Greatly-retours`. Chaque push sur `main` met à jour le site automatiquement.

**Cache-busting** : les imports CSS et JS dans les HTML utilisent un paramètre `?v=N` incrémenté manuellement à chaque déploiement.

### Backend (Apps Script)
1. Créer un projet Google Apps Script
2. Copier les fichiers `.gs` du dossier `worker/`
3. Configurer les Script Properties (voir `.env.example`)
4. Déployer en Web App (accès : "Tout le monde")
5. Copier l'URL de déploiement dans `config.js` (`RELAY_URL`)
6. Passer `DEMO_MODE` à `false`
