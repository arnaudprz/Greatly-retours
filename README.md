# Greatly — Vos retours

Outil de recueil de feedback anonyme pour les programmes Greatly (Énergie et Lucidité).

**URL live** : https://arnaudprz.github.io/Greatly-retours/
**Repo GitHub** : https://github.com/arnaudprz/Greatly-retours

## Version actuelle : v0.1.0 — Maquette front (15 juin 2026)

Le front est complet en mode démo (données fictives, auth locale).
Le backend (Google Apps Script) n'est pas encore développé.

## Changelog

### v0.1.0 — Maquette front complète (15 juin 2026)

| Heure | Commit | Description |
|-------|--------|-------------|
| 11:09 | `909436f` | Init repo : structure modulaire front + worker + data |
| 11:11 | `33a1b1c` | Rename `public/` → `docs/` pour GitHub Pages |
| 11:15 | `e07789a` | Auth démo avec mot de passe provisoire |
| 11:17 | `2c2c396` | Fix mode démo : skip appels réseau |
| 11:20 | `73ba2c0` | Simplification auth démo (comparaison directe) |
| 11:22 | `d975241` | Cache-busters sur les imports JS du dashboard |
| 11:23 | `8e49811` | Lien vers le formulaire dans le dashboard |
| 11:25 | `0192687` | Widget profil dans le header (remplace lien logout) |
| 11:26 | `32b35cf` | Renommage verbatims + popups + lien formulaire dans tabs |
| 11:28 | `b583eaa` | Bump cache-busters v=7 |
| 11:29 | `d665a3e` | Renommage tab "Formulaire membres & intervenants" |
| 11:29 | `bd6ecaa` | Suppression compteur "sur la période" du header |
| 11:30 | `5c2a0a6` | Message d'accueil personnalisé |
| 11:32 | `52c0cd4` | Onboarding en 3 étapes au premier login |
| 11:34 | `a86baa0` | Filtre "Lieux" + section dédiée |
| 11:38 | `2302cfe` | Formulaire prospect + vue dashboard prospect |
| 11:43 | `1617353` | Réécriture formulaire prospect (ton empathique) + OG meta |
| 11:54 | `8142c6c` | Dashboard complet avec données fictives détaillées |
| 11:59 | `2e5b58a` | Chat communautaire + boutons "Voir tous les retours" |
| 12:18 | `5ca88b7` | Réduction hauteur chat |
| 12:26 | `376d9e8` | Split formulaire : membre / intervenant séparés |
| 12:28 | `9ed33de` | Renommage "Fiche d'observation" → "Vos retours intervenants" |
| 12:41 | `e6d0ee2` | Chat : suppression channels, fil unique |
| 12:49 | `87f3201` | Réécriture empathique de toutes les questions |
| 12:51 | `f8ef8ac` | Réécriture empathique appliquée aux 3 formulaires |
| 12:55 | `9eff22f` | Questions personnalisées par rôle × type |
| 12:59 | `b6ebb12` | Lieu/House intégrés dans le bloc phases |
| 13:01 | `e3042ab` | NPS empathique ("recommander à un proche") |
| 13:03 | `703f773` | Labels NPS : "Je le garde pour moi" → "Oui, sans hésiter" |
| 13:05 | `5fd581b` | Suppression question ouverte redondante (lucidité) |
| 13:09 | `5ac700d` | Bump cache-busters v=11 |
| 13:21 | `08bb155` | Section "Greatly & vous" (formulaire intervenant) |
| 13:24 | `cabc481` | **Fix** : `TOTAL_STEPS` const → let (parcours intervenant 5 étapes) |
| 13:29 | `31afe45` | Suppression question debrief intervenant Lucidité |
| 14:58 | `e424efc` | Navbar fixe avec dropdown menus |

## Statut des composants

| Composant | Statut | Notes |
|-----------|--------|-------|
| Formulaire membre | ✅ Fait | Énergie + Lucidité, questions personnalisées |
| Formulaire intervenant | ✅ Fait | Énergie + Lucidité + section "Greatly & vous" |
| Formulaire prospect | ✅ Fait | Ton empathique, OG meta |
| Dashboard équipe | ✅ Fait | Filtres, graphiques, verbatims, alertes, détail/question |
| Auth (mode démo) | ✅ Fait | Mot de passe local, onboarding 3 étapes |
| Chat communautaire | ✅ Fait | Fil unique, mode démo |
| Backend Apps Script | ❌ À faire | worker/ vide (sauf .env.example) |
| Données réelles | ❌ À faire | data/ vide, JSON committés par le relais |
| Auth réelle (relais) | ❌ À faire | HMAC tokens, hash SHA-256 côté serveur |
| Admin (invitations) | ❌ À faire | UI prête, API non connectée |

## Voir aussi

- [ARCHITECTURE.md](ARCHITECTURE.md) — documentation technique détaillée (code, infrastructure, flux de données)
