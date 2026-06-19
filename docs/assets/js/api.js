/* ============================================
   Greatly — Vos retours · Client API (relais)
   ============================================
   Toutes les communications avec le relais Apps Script passent par ici.
   Content-Type: text/plain pour éviter le pré-vol CORS.
*/

const API = {

  /**
   * Appel générique au relais.
   * @param {string} action — nom de l'action (submit, login, data, admin.invite…)
   * @param {object} payload — données à envoyer (sans action ni token)
   * @returns {Promise<object>} — réponse JSON du relais
   */
  /** Génère un fingerprint simple basé sur le navigateur */
  _fingerprint() {
    const nav = navigator;
    const raw = [nav.userAgent, nav.language, screen.width, screen.height, screen.colorDepth, new Date().getTimezoneOffset()].join('|');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash |= 0; }
    return 'fp_' + Math.abs(hash).toString(36);
  },

  async call(action, payload = {}) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    // Ajouter le fingerprint aux soumissions publiques (submit, request-access)
    if (action === 'submit' || action === 'request-access') {
      payload._fp = this._fingerprint();
    }
    const body = JSON.stringify({ action, token, ...payload });

    const res = await fetch(CONFIG.RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
    });

    if (!res.ok) throw new Error(`Erreur réseau (${res.status})`);

    // Apps Script redirige 302 → le content-type peut être text/html
    // On parse le texte brut en JSON
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Réponse non-JSON:', text.substring(0, 200));
      throw new Error('Réponse serveur invalide');
    }
    if (data.error) throw new Error(data.error);
    return data;
  },

  // --- Formulaire ---
  submit(reponse)            { return this.call('submit', reponse); },

  // --- Authentification ---
  login(password)            { return this.call('login', { password }); },
  forgot(email)              { return this.call('forgot', { email }); },

  // --- Dashboard ---
  getData(filtres = {})      { return this.call('data', filtres); },
  trackTime(minutes)         { return this.call('track-time', { minutes }); },

  // --- Admin ---
  getPeople()                { return this.call('admin.people'); },
  invite(email, role, firstname, lastname) { return this.call('admin.invite', { email, role, firstname, lastname }); },
  resend(email)              { return this.call('admin.resend', { email }); },
  suspend(email)             { return this.call('admin.suspend', { email }); },
  restore(email)             { return this.call('admin.restore', { email }); },
  remove(email)              { return this.call('admin.remove', { email }); },
  approve(email)             { return this.call('admin.approve', { email }); },
  reject(email)              { return this.call('admin.reject', { email }); },
};
