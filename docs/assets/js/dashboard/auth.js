/* ============================================
   Greatly — Vos retours · Authentification dashboard
   ============================================ */

/** Gestion des panneaux de la gate (connexion / mot de passe oublié / demande d'accès) */
function showPanel(name) {
  document.querySelectorAll('#gate .panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');
}

/** Connexion au dashboard */
async function login() {
  const pwd = document.getElementById('pwd').value;
  if (!pwd) return;

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Connexion…';

  try {
    const res = await API.login(pwd);
    localStorage.setItem(CONFIG.TOKEN_KEY, res.token);
    localStorage.setItem(CONFIG.ROLE_KEY, res.role);
    localStorage.setItem(CONFIG.SESSION_START_KEY, Date.now().toString());
    enterDashboard(res.role);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Entrer';
    document.getElementById('login-error').textContent = 'Mot de passe incorrect.';
    document.getElementById('login-error').style.display = 'block';
  }
}

/** Demande de réinitialisation */
async function forgotPassword() {
  const email = document.getElementById('forgot-email').value;
  if (!email) return;

  try {
    await API.forgot(email);
  } catch (_) {
    // Réponse neutre dans tous les cas
  }
  showPanel('forgot-confirm');
}

/** Demande d'accès */
async function requestAccess() {
  const form = {
    name: document.getElementById('req-name').value,
    email: document.getElementById('req-email').value,
    role: document.getElementById('req-role').value,
    scope: document.getElementById('req-scope').value,
    message: document.getElementById('req-message').value,
  };
  if (!form.name || !form.email) return;

  try {
    await API.requestAccess(form);
  } catch (_) {
    // Réponse neutre
  }
  showPanel('request-confirm');
}

/** Entrer dans le dashboard après authentification réussie */
function enterDashboard(role) {
  document.getElementById('gate').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  if (role === 'Super-admin') {
    document.body.classList.add('is-admin');
  }

  initDashboard();
}

/** Vérifier si une session existe au chargement */
function checkSession() {
  const token = localStorage.getItem(CONFIG.TOKEN_KEY);
  const role = localStorage.getItem(CONFIG.ROLE_KEY);
  const start = localStorage.getItem(CONFIG.SESSION_START_KEY);

  if (token && start) {
    const elapsed = Date.now() - parseInt(start);
    if (elapsed < CONFIG.SESSION_TTL) {
      enterDashboard(role);
      return;
    }
    // Session expirée
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.ROLE_KEY);
    localStorage.removeItem(CONFIG.SESSION_START_KEY);
  }
}

/** Déconnexion */
function logout() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  localStorage.removeItem(CONFIG.ROLE_KEY);
  localStorage.removeItem(CONFIG.SESSION_START_KEY);
  location.reload();
}
