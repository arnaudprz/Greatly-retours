/* ============================================
   Greatly — Vos retours · Configuration
   ============================================ */

const CONFIG = {
  // URL du Web App Google Apps Script (à remplacer après déploiement)
  RELAY_URL: 'https://script.google.com/macros/s/DEPLOY_ID/exec',

  // Durée de session (ms) — 4 heures
  SESSION_TTL: 4 * 60 * 60 * 1000,

  // Clé localStorage pour le token de session
  TOKEN_KEY: 'greatly_retours_token',

  // Clé localStorage pour le rôle
  ROLE_KEY: 'greatly_retours_role',

  // Clé localStorage pour le timestamp de début de session (calcul durée)
  SESSION_START_KEY: 'greatly_retours_session_start',
};
