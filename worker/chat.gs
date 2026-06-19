/**
 * GREATLY — Vos retours · Chat communauté
 *
 * Stocke et récupère les messages du chat dans une feuille "chat".
 * Colonnes : timestamp | email | firstname | message
 */

var SHEET_NAME_CHAT = 'chat';

/**
 * Enregistre un message dans la feuille chat.
 * @param {object} body — { message }
 * @param {object} session — { email, firstname, ... }
 * @returns {object} — { ok: true }
 */
function sendChatMessage(body, session) {
  const text = (body.message || '').trim();
  if (!text) return { error: 'Message vide.' };
  if (text.length > 2000) return { error: 'Message trop long (2000 caractères max).' };

  const sheet = getSheet(SHEET_NAME_CHAT);
  const timestamp = new Date().toISOString();

  sheet.appendRow([
    timestamp,
    session.email || '',
    session.firstname || '',
    text,
  ]);

  return { ok: true, ts: timestamp };
}

/**
 * Récupère les 50 derniers messages du chat.
 * @param {object} body — (aucun paramètre requis)
 * @returns {object} — { ok: true, messages: [...] }
 */
function getChatMessages(body) {
  const sheet = getSheet(SHEET_NAME_CHAT);
  const data = sheet.getDataRange().getValues();

  // Skip header row, map to objects
  const messages = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    messages.push({
      date: row[0],
      email: row[1] || '',
      name: row[2] || 'Anonyme',
      text: row[3] || '',
    });
  }

  // Last 50, ordered by timestamp desc (newest first)
  messages.sort((a, b) => new Date(b.date) - new Date(a.date));
  const last50 = messages.slice(0, 50);

  // Return in chronological order for display
  last50.reverse();

  return { ok: true, messages: last50 };
}
