/**
 * GREATLY — Vos retours · Authentification (Magic Links)
 *
 * Flux :
 * 1. L'utilisateur entre son email
 * 2. On vérifie qu'il est autorisé (feuille "users")
 * 3. On génère un token signé (HMAC-SHA256) valable 15 min
 * 4. On envoie un email avec le lien magic
 * 5. Au clic, le front envoie le token → on vérifie → on retourne un session token (4h)
 */

var MAGIC_LINK_TTL = 15 * 60 * 1000;   // 15 minutes
var SESSION_TTL    = 4 * 60 * 60 * 1000; // 4 heures
var BASE_URL = 'https://arnaudprz.github.io/Greatly-retours/dashboard.html';

/** Envoie un magic link par email */
function sendMagicLink(body) {
  const email = (body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { error: 'Email invalide.' };
  }

  // Rate limit per email: max 3 per 15 min
  var cache = CacheService.getScriptCache();
  var emailKey = 'ml_' + email.replace(/[^a-z0-9]/g, '_');
  var emailCount = parseInt(cache.get(emailKey) || '0');
  if (emailCount >= 3) {
    return { ok: true, message: 'Si un compte est associé à cette adresse, un lien de connexion a été envoyé.' };
  }

  // Rate limit global: max 20 per hour
  var globalKey = 'ml_global';
  var globalCount = parseInt(cache.get(globalKey) || '0');
  if (globalCount >= 20) {
    return { ok: true, message: 'Si un compte est associé à cette adresse, un lien de connexion a été envoyé.' };
  }

  // Vérifier que l'email est autorisé
  const user = findUser(email);
  if (!user) {
    // Ne pas révéler si l'email existe ou non (sécurité)
    return { ok: true, message: 'Si un compte est associé à cette adresse, un lien de connexion a été envoyé.' };
  }

  if (user.status === 'suspendu') {
    return { ok: true, message: 'Si un compte est associé à cette adresse, un lien de connexion a été envoyé.' };
  }

  // Générer le token magic link
  const secret = getProperty('HMAC_SECRET');
  const ts = Date.now();
  const payload = email + '|' + ts + '|' + MAGIC_LINK_TTL;
  const signature = hmacSHA256(payload, secret);
  const token = Utilities.base64EncodeWebSafe(payload + '|' + signature);

  // Construire le lien
  const link = BASE_URL + '?magic=' + encodeURIComponent(token);

  // Envoyer l'email
  sendMagicLinkEmail(email, user.firstname || '', link);

  // Incrémenter les compteurs de rate limit
  cache.put(emailKey, String(emailCount + 1), 900);   // 15 min
  cache.put(globalKey, String(globalCount + 1), 3600); // 1 hour

  // Logger
  logActivity('Magic link envoyé', email);

  return { ok: true, message: 'Lien de connexion envoyé.' };
}

/** Vérifie un magic token et retourne un session token */
function verifyMagicToken(body) {
  const rawToken = body.token;
  if (!rawToken) return { error: 'Token manquant.' };

  try {
    const decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(rawToken)).getDataAsString();
    const parts = decoded.split('|');
    if (parts.length !== 4) return { error: 'Token invalide.' };

    const [email, ts, ttl, signature] = parts;
    const secret = getProperty('HMAC_SECRET');
    const expectedPayload = email + '|' + ts + '|' + ttl;
    const expectedSig = hmacSHA256(expectedPayload, secret);

    // Vérifier la signature
    if (signature !== expectedSig) return { error: 'Token invalide.' };

    // Vérifier l'expiration
    const age = Date.now() - parseInt(ts);
    if (age > parseInt(ttl)) return { error: 'Lien expiré. Demandez un nouveau lien de connexion.' };

    // Vérifier usage unique (stocker dans cache)
    const cache = CacheService.getScriptCache();
    const cacheKey = 'magic_' + signature.substring(0, 16);
    if (cache.get(cacheKey)) return { error: 'Ce lien a déjà été utilisé.' };
    cache.put(cacheKey, '1', 900); // 15 min

    // Trouver l'utilisateur
    const user = findUser(email);
    if (!user) return { error: 'Accès non autorisé.' };

    // Créer un session token
    const sessionTs = Date.now();
    const sessionPayload = email + '|' + sessionTs + '|' + SESSION_TTL + '|' + user.role;
    const sessionSig = hmacSHA256(sessionPayload, secret);
    const sessionToken = Utilities.base64EncodeWebSafe(sessionPayload + '|' + sessionSig);

    // Mettre à jour la dernière connexion
    updateLastLogin(email);
    logActivity('Connexion', email + ' (' + user.role + ')');

    return {
      ok: true,
      token: sessionToken,
      role: user.role,
      email: email,
      firstname: user.firstname || '',
      lastname: user.lastname || '',
    };
  } catch (err) {
    Logger.log('Erreur verifyMagicToken: ' + err.message);
    return { error: 'Token invalide.' };
  }
}

/** Vérifie un session token — retourne les infos de session ou null */
function verifySessionToken(token) {
  if (!token) return null;

  try {
    const decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(token)).getDataAsString();
    const parts = decoded.split('|');
    if (parts.length !== 5) return null;

    const [email, ts, ttl, role, signature] = parts;
    const secret = getProperty('HMAC_SECRET');
    const expectedPayload = email + '|' + ts + '|' + ttl + '|' + role;
    const expectedSig = hmacSHA256(expectedPayload, secret);

    if (signature !== expectedSig) return null;

    const age = Date.now() - parseInt(ts);
    if (age > parseInt(ttl)) return null;

    return {
      email: email,
      role: role,
      isAdmin: role === 'Super-admin',
    };
  } catch (err) {
    return null;
  }
}

/** HMAC-SHA256 */
function hmacSHA256(message, secret) {
  const sig = Utilities.computeHmacSha256Signature(message, secret);
  return sig.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

/** Lire une Script Property */
function getProperty(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}
