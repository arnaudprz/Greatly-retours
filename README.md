# Greatly — Vos retours

Outil de recueil de feedback anonyme pour les programmes Greatly (Énergie et Lucidité).

## Architecture

```
public/          → Front (GitHub Pages)
  index.html     → Formulaire de feedback (anonyme, mobile-first)
  dashboard.html → Dashboard équipe + console super-admin
  assets/        → CSS et JS modulaires

worker/          → Relais Google Apps Script (Web App)
  Code.gs        → Point d'entrée doPost + router
  auth.gs        → Authentification, tokens HMAC
  submit.gs      → Traitement des réponses
  data.gs        → Lecture/agrégation pour le dashboard
  admin.gs       → Actions admin (invite, suspend…)
  github.gs      → Client API GitHub
  email.gs       → Templates et envoi d'emails

data/            → Données persistées (JSON, committées par le relais)
```

## Principes

- **Anonyme** : aucun nom demandé, aucune IP stockée, aucun cookie identifiant.
- **Notes sur 0–10** (échelle unique type NPS).
- **Deux répondants** : membres et intervenants.
- **Deux parcours** : Énergie (Yoga, Padel) et Lucidité (6 ateliers + bilan).
- **Charte Greatly** : DM Sans + Playfair Display, palette crème/sauge/énergie/lucidité.

## Stack

- HTML / CSS / JS vanilla (pas de framework front)
- Chart.js (CDN) pour les graphiques du dashboard
- Google Apps Script comme relais backend
- GitHub Pages pour l'hébergement
- Données en JSON dans le repo (committées par le relais via API GitHub)

## Configuration

Les secrets sont stockés dans les Script Properties de Google Apps Script (voir `worker/.env.example`).
