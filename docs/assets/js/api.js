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
  async call(action, payload = {}) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const body = JSON.stringify({ action, token, ...payload });

    const res = await fetch(CONFIG.RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',  // Apps Script redirige 302 vers le résultat
    });

    if (!res.ok) throw new Error(`Erreur réseau (${res.status})`);

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  // --- Formulaire ---
  submit(reponse)            { return this.call('submit', reponse); },

  // --- Authentification ---
  login(password)            { return this.call('login', { password }); },
  forgot(email)              { return this.call('forgot', { email }); },
  requestAccess(form)        { return this.call('request-access', form); },

  // --- Dashboard ---
  getData(filtres = {})      { return this.call('data', filtres); },

  // --- Admin ---
  getPeople()                { return this.call('admin.people'); },
  invite(email, role)        { return this.call('admin.invite', { email, role }); },
  resend(email)              { return this.call('admin.resend', { email }); },
  suspend(email)             { return this.call('admin.suspend', { email }); },
  restore(email)             { return this.call('admin.restore', { email }); },
  remove(email)              { return this.call('admin.remove', { email }); },
  approve(email)             { return this.call('admin.approve', { email }); },
  reject(email)              { return this.call('admin.reject', { email }); },
};
