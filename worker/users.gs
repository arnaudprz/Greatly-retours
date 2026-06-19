/**
 * GREATLY — Vos retours · Gestion des utilisateurs
 *
 * Les utilisateurs sont stockés dans une feuille Google Sheets "users".
 * Colonnes : email | firstname | lastname | role | status | lastLogin | createdAt
 *
 * L'admin principal (ADMIN_EMAIL) est toujours Super-admin et ne peut pas être supprimé.
 */

var SHEET_NAME_USERS = 'users';
var SHEET_NAME_REQUESTS = 'requests';
var SHEET_NAME_LOG = 'log';

/** Obtient la spreadsheet de données */
function getSheet(name) {
  const ssId = getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(ssId);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_NAME_USERS) {
      sheet.appendRow(['email', 'firstname', 'lastname', 'role', 'status', 'lastLogin', 'createdAt', 'totalMinutes']);
    } else if (name === SHEET_NAME_REQUESTS) {
      sheet.appendRow(['email', 'firstname', 'lastname', 'role', 'message', 'date', 'status']);
    } else if (name === SHEET_NAME_LOG) {
      sheet.appendRow(['date', 'action', 'who', 'detail']);
    }
  }
  return sheet;
}

/** Cherche un utilisateur par email */
function findUser(email) {
  const sheet = getSheet(SHEET_NAME_USERS);
  const data = sheet.getDataRange().getValues();
  const emailLower = email.toLowerCase();

  // Toujours autoriser l'admin principal
  const adminEmail = getProperty('ADMIN_EMAIL');
  if (emailLower === adminEmail.toLowerCase()) {
    // Chercher s'il existe dans la feuille
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toLowerCase() === emailLower) {
        return { email: data[i][0], firstname: data[i][1], lastname: data[i][2], role: 'Super-admin', status: 'actif', row: i + 1 };
      }
    }
    // S'il n'existe pas, le créer automatiquement
    sheet.appendRow([adminEmail, 'Arnaud', '', 'Super-admin', 'actif', '', new Date().toISOString()]);
    return { email: adminEmail, firstname: 'Arnaud', lastname: '', role: 'Super-admin', status: 'actif' };
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === emailLower) {
      return { email: data[i][0], firstname: data[i][1], lastname: data[i][2], role: data[i][3], status: data[i][4], row: i + 1 };
    }
  }
  return null;
}

/** Met à jour la dernière connexion */
function updateLastLogin(email) {
  const sheet = getSheet(SHEET_NAME_USERS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, 6).setValue(new Date().toISOString());
      // Première connexion : passer le statut de 'invité' à 'actif'
      if (data[i][4] === 'invité') {
        sheet.getRange(i + 1, 5).setValue('actif');
      }
      return;
    }
  }
}

/** Incrémente le temps cumulé (minutes) passé sur la plateforme par l'utilisateur */
function trackTime(body, session) {
  // Heartbeat : on ajoute au plus quelques minutes par appel pour éviter tout gonflage
  let minutes = Number(body.minutes) || 0;
  if (minutes <= 0) return { ok: true };
  if (minutes > 5) minutes = 5;

  const sheet = getSheet(SHEET_NAME_USERS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === session.email.toLowerCase()) {
      const current = Number(data[i][7]) || 0;
      sheet.getRange(i + 1, 8).setValue(current + minutes);
      return { ok: true, totalMinutes: current + minutes };
    }
  }
  return { ok: true };
}

/** Liste tous les utilisateurs + demandes + log (pour l'admin) */
function getPeople() {
  const usersSheet = getSheet(SHEET_NAME_USERS);
  const usersData = usersSheet.getDataRange().getValues();
  const people = [];
  for (let i = 1; i < usersData.length; i++) {
    people.push({
      email: usersData[i][0],
      firstname: usersData[i][1],
      lastname: usersData[i][2],
      role: usersData[i][3],
      status: usersData[i][4],
      lastLogin: usersData[i][5] || '—',
      totalMinutes: Number(usersData[i][7]) || 0,
    });
  }

  const reqSheet = getSheet(SHEET_NAME_REQUESTS);
  const reqData = reqSheet.getDataRange().getValues();
  const requests = [];
  for (let i = 1; i < reqData.length; i++) {
    if (reqData[i][6] === 'en attente') {
      requests.push({
        email: reqData[i][0],
        name: reqData[i][1] + ' ' + reqData[i][2],
        firstname: reqData[i][1],
        lastname: reqData[i][2],
        role: reqData[i][3],
        message: reqData[i][4],
        date: reqData[i][5],
      });
    }
  }

  const logSheet = getSheet(SHEET_NAME_LOG);
  const logData = logSheet.getDataRange().getValues();
  const log = [];
  for (let i = Math.max(1, logData.length - 20); i < logData.length; i++) {
    log.push({ date: logData[i][0], action: logData[i][1], who: logData[i][2], detail: logData[i][3] });
  }
  log.reverse();

  return { people, requests, log };
}

/** Inviter une personne */
function invitePerson(body, session) {
  const email = (body.email || '').trim().toLowerCase();
  const role = body.role || 'Membre';
  const firstname = body.firstname || '';
  const lastname = body.lastname || '';

  if (!email) return { error: 'Email requis.' };

  const existing = findUser(email);
  if (existing) return { error: 'Cette personne a déjà un accès.' };

  const sheet = getSheet(SHEET_NAME_USERS);
  sheet.appendRow([email, firstname, lastname, role, 'invité', '', new Date().toISOString()]);

  // Envoyer l'email d'invitation
  sendInviteEmail(email, firstname, session.email);

  logActivity('Invitation envoyée', session.email + ' → ' + email + ' (' + role + ')');

  return { ok: true };
}

/** Suspendre un accès */
function suspendPerson(body, session) {
  const email = (body.email || '').trim().toLowerCase();
  const adminEmail = getProperty('ADMIN_EMAIL').toLowerCase();
  if (email === adminEmail) return { error: 'Impossible de suspendre l\'admin principal.' };

  return updateUserStatus(email, 'suspendu', session);
}

/** Restaurer un accès */
function restorePerson(body, session) {
  return updateUserStatus((body.email || '').trim().toLowerCase(), 'actif', session);
}

/** Supprimer un accès */
function removePerson(body, session) {
  const email = (body.email || '').trim().toLowerCase();
  const adminEmail = getProperty('ADMIN_EMAIL').toLowerCase();
  if (email === adminEmail) return { error: 'Impossible de supprimer l\'admin principal.' };

  const sheet = getSheet(SHEET_NAME_USERS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email) {
      sheet.deleteRow(i + 1);
      logActivity('Accès supprimé', session.email + ' → ' + email);
      return { ok: true };
    }
  }
  return { error: 'Utilisateur non trouvé.' };
}

/** Mettre à jour le statut d'un utilisateur */
function updateUserStatus(email, newStatus, session) {
  const sheet = getSheet(SHEET_NAME_USERS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email) {
      sheet.getRange(i + 1, 5).setValue(newStatus);
      logActivity('Statut → ' + newStatus, session.email + ' → ' + email);
      return { ok: true };
    }
  }
  return { error: 'Utilisateur non trouvé.' };
}

/** Approuver une demande d'accès */
function approveRequest(body, session) {
  const email = (body.email || '').trim().toLowerCase();

  const reqSheet = getSheet(SHEET_NAME_REQUESTS);
  const reqData = reqSheet.getDataRange().getValues();
  let request = null;
  for (let i = 1; i < reqData.length; i++) {
    if (reqData[i][0].toLowerCase() === email && reqData[i][6] === 'en attente') {
      request = { firstname: reqData[i][1], lastname: reqData[i][2], role: reqData[i][3] };
      reqSheet.getRange(i + 1, 7).setValue('approuvé');
      break;
    }
  }
  if (!request) return { error: 'Demande non trouvée.' };

  // Créer l'utilisateur
  const usersSheet = getSheet(SHEET_NAME_USERS);
  usersSheet.appendRow([email, request.firstname, request.lastname, 'Membre', 'actif', '', new Date().toISOString()]);

  // Envoyer l'email d'invitation
  sendInviteEmail(email, request.firstname, session.email);

  logActivity('Demande approuvée', session.email + ' → ' + email);

  return { ok: true };
}

/** Rejeter une demande d'accès */
function rejectRequest(body, session) {
  const email = (body.email || '').trim().toLowerCase();

  const reqSheet = getSheet(SHEET_NAME_REQUESTS);
  const reqData = reqSheet.getDataRange().getValues();
  for (let i = 1; i < reqData.length; i++) {
    if (reqData[i][0].toLowerCase() === email && reqData[i][6] === 'en attente') {
      reqSheet.getRange(i + 1, 7).setValue('refusé');
      logActivity('Demande refusée', session.email + ' → ' + email);
      return { ok: true };
    }
  }
  return { error: 'Demande non trouvée.' };
}

/** Traiter une demande d'accès (depuis le formulaire public) */
function handleAccessRequest(body) {
  // Rate limit global: max 5 access requests per hour
  var cache = CacheService.getScriptCache();
  var reqKey = 'access_req_global';
  var reqCount = parseInt(cache.get(reqKey) || '0');
  if (reqCount >= 5) {
    return { ok: true }; // Silent success to not reveal rate limiting
  }
  cache.put(reqKey, String(reqCount + 1), 3600); // 1 hour

  const sheet = getSheet(SHEET_NAME_REQUESTS);
  sheet.appendRow([
    (body.email || '').trim().toLowerCase(),
    body.firstname || '',
    body.lastname || '',
    body.role || '',
    body.message || '',
    new Date().toISOString(),
    'en attente',
  ]);

  // Notifier les admins
  notifyAdminsNewRequest(body);

  logActivity('Demande d\'accès', (body.email || '') + ' (' + (body.role || '—') + ')');

  return { ok: true };
}

/** Logger une activité */
function logActivity(action, detail) {
  try {
    const sheet = getSheet(SHEET_NAME_LOG);
    sheet.appendRow([new Date().toISOString(), action, '', detail]);
  } catch (err) {
    Logger.log('Erreur log: ' + err.message);
  }
}
