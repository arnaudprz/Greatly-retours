/**
 * GREATLY — Vos retours · Backend Apps Script
 * Point d'entrée principal (Web App)
 *
 * Toutes les requêtes POST arrivent ici.
 * Le champ "action" détermine le routage.
 */

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // Routes publiques (pas de token requis)
    if (action === 'magic-link')     return json(sendMagicLink(body));
    if (action === 'verify-token')   return json(verifyMagicToken(body));
    if (action === 'submit')         return json(submitFeedback(body));
    if (action === 'request-access') return json(handleAccessRequest(body));

    // Routes authentifiées (token requis)
    const session = verifySessionToken(body.token);
    if (!session) return json({ error: 'Session invalide ou expirée. Reconnectez-vous.' });

    if (action === 'data')           return json(getData(body, session));
    if (action === 'chat.send')      return json(sendChatMessage(body, session));
    if (action === 'chat.list')      return json(getChatMessages(body));

    // Routes admin (Super-admin requis)
    if (!session.isAdmin) return json({ error: 'Accès réservé aux super-admins.' });

    if (action === 'admin.people')   return json(getPeople());
    if (action === 'admin.invite')   return json(invitePerson(body, session));
    if (action === 'admin.suspend')  return json(suspendPerson(body, session));
    if (action === 'admin.restore')  return json(restorePerson(body, session));
    if (action === 'admin.remove')   return json(removePerson(body, session));
    if (action === 'admin.approve')  return json(approveRequest(body, session));
    if (action === 'admin.reject')   return json(rejectRequest(body, session));

    return json({ error: 'Action inconnue : ' + action });
  } catch (err) {
    Logger.log('Erreur doPost: ' + err.message);
    return json({ error: 'Erreur serveur. Réessayez.' });
  }
}

/** Retourne une réponse JSON (Content-Type text/plain pour éviter CORS) */
function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Accès GET → message d'info */
function doGet() {
  return ContentService.createTextOutput('Greatly — Vos retours · API active');
}
