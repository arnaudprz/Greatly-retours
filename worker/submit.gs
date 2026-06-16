/**
 * GREATLY — Vos retours · Soumission des réponses
 *
 * Les réponses sont stockées dans une feuille Google Sheets "responses".
 * Chaque réponse est une ligne avec le JSON sérialisé.
 * Aucune donnée nominative n'est stockée.
 */

const SHEET_NAME_RESPONSES = 'responses';

/** Traiter une soumission de formulaire */
function submitFeedback(body) {
  // Retirer les champs d'authentification
  delete body.action;
  delete body.token;

  // Ajouter le timestamp serveur
  body.ts_server = new Date().toISOString();

  // Stocker dans la feuille
  const sheet = getSheet(SHEET_NAME_RESPONSES);
  const type = body.type || 'inconnu';
  const role = body.role || '—';

  sheet.appendRow([
    body.ts_server,
    type,
    role,
    JSON.stringify(body),
  ]);

  return { ok: true };
}

/** Lire et agréger les données pour le dashboard */
function getData(body, session) {
  const sheet = getSheet(SHEET_NAME_RESPONSES);
  const data = sheet.getDataRange().getValues();

  // Pour le moment, retourner les données brutes
  // TODO: implémenter l'agrégation par mois, par type, par période
  const responses = [];
  for (let i = 1; i < data.length; i++) {
    try {
      responses.push(JSON.parse(data[i][3]));
    } catch (e) {}
  }

  return { ok: true, count: responses.length, responses: responses };
}
