/**
 * GREATLY — Vos retours · Soumission des réponses
 */

var SHEET_NAME_RESPONSES = 'responses';

/** Traiter une soumission de formulaire */
function submitFeedback(body) {
  var cache = CacheService.getScriptCache();

  // Rate limit par fingerprint: 1 soumission par 5 minutes
  var fp = body._fp || 'unknown';
  var fpKey = 'sub_' + fp;
  if (cache.get(fpKey)) {
    return { error: 'Vous avez déjà envoyé un retour récemment. Merci de patienter quelques minutes.' };
  }

  // Rate limit global: max 10 par minute
  var globalKey = 'submit_global';
  var globalCount = parseInt(cache.get(globalKey) || '0');
  if (globalCount >= 10) {
    return { error: 'Trop de soumissions. Réessayez dans quelques instants.' };
  }

  // Nettoyer les champs internes
  delete body.action;
  delete body.token;
  delete body._fp;
  body.ts_server = new Date().toISOString();

  // Stocker
  var sheet = getSheet(SHEET_NAME_RESPONSES);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['timestamp', 'type', 'role', 'json']);
  }
  sheet.appendRow([
    body.ts_server,
    body.type || 'inconnu',
    body.role || '—',
    JSON.stringify(body),
  ]);

  // Marquer le fingerprint (5 minutes = 300 secondes)
  cache.put(fpKey, '1', 300);
  cache.put(globalKey, String(globalCount + 1), 60);

  return { ok: true };
}

/** Lire les données pour le dashboard */
function getData(body, session) {
  var sheet = getSheet(SHEET_NAME_RESPONSES);
  var data = sheet.getDataRange().getValues();
  var responses = [];

  for (var i = 0; i < data.length; i++) {
    var cell = data[i][3];
    if (!cell || typeof cell !== 'string') continue;
    if (cell === 'json') continue;
    try {
      responses.push(JSON.parse(cell));
    } catch (e) {}
  }

  return { ok: true, count: responses.length, responses: responses };
}
