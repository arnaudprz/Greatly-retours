/* ============================================
   Greatly — Vos retours · Configuration
   ============================================ */

const CONFIG = {
  // URL du Web App Google Apps Script (à remplacer après déploiement)
  RELAY_URL: 'https://script.google.com/macros/s/DEPLOY_ID/exec',

  // Mode démo : true = auth locale (pas de relais), false = auth via relais
  // Passer à false une fois le relais Apps Script déployé
  DEMO_MODE: true,

  // Hash SHA-256 du mot de passe provisoire
  // Ce hash ne compromet rien — le vrai mot de passe sera côté relais
  DEMO_PASSWORD_HASH: '2e2699135417c3ac5c5b6401619c2a61a1a78d1f74a599771f6e6f01ed482adc',

  // Durée de session (ms) — 4 heures
  SESSION_TTL: 4 * 60 * 60 * 1000,

  // Clé localStorage pour le token de session
  TOKEN_KEY: 'greatly_retours_token',

  // Clé localStorage pour le rôle
  ROLE_KEY: 'greatly_retours_role',

  // Clé localStorage pour le timestamp de début de session (calcul durée)
  SESSION_START_KEY: 'greatly_retours_session_start',
};
