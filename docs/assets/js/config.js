/* ============================================
   Greatly — Vos retours · Configuration
   ============================================ */

const CONFIG = {
  // URL du Web App Google Apps Script
  RELAY_URL: 'https://script.google.com/macros/s/AKfycbwqQ2n3wJdlrIyja5D1a4ePXgfESj9JLJtUD74W-12Z_MFZ6GJZgHJdOFQxTju82gmrgA/exec',

  // Mode production
  DEMO_MODE: false,

  // Durée de session (ms) — 4 heures
  SESSION_TTL: 4 * 60 * 60 * 1000,

  // Clé localStorage pour le token de session
  TOKEN_KEY: 'greatly_retours_token',

  // Clé localStorage pour le rôle
  ROLE_KEY: 'greatly_retours_role',

  // Clé localStorage pour le timestamp de début de session (calcul durée)
  SESSION_START_KEY: 'greatly_retours_session_start',
};
