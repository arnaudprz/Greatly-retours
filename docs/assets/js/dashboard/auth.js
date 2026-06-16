/* ============================================
   Greatly — Vos retours · Authentification dashboard
   ============================================ */

const PROFILE_KEY = 'greatly_retours_profile';

/** Profil par défaut */
function defaultProfile() {
  return { firstname: '', lastname: '', email: '' };
}

/** Lire le profil depuis localStorage */
function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || defaultProfile();
  } catch (_) {
    return defaultProfile();
  }
}

/** Initiales pour l'avatar (2 lettres max) */
function initials(profile) {
  const f = (profile.firstname || '').trim();
  const l = (profile.lastname || '').trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  if (l) return l.slice(0, 2).toUpperCase();
  return '?';
}

/** Met à jour tous les éléments profil dans le header */
function renderProfile() {
  const profile = getProfile();
  const role = localStorage.getItem(CONFIG.ROLE_KEY) || '';
  const ini = initials(profile);
  const displayName = [profile.firstname, profile.lastname].filter(Boolean).join(' ') || 'Mon profil';

  // Avatar (petit + grand)
  document.querySelectorAll('#profile-avatar, #profile-avatar-lg').forEach(el => {
    el.textContent = ini;
  });

  // Nom dans le trigger
  document.getElementById('profile-name').textContent = displayName;

  // Header du dropdown
  document.getElementById('profile-fullname').textContent = displayName;
  document.getElementById('profile-role').textContent = role;

  // Champs du formulaire
  document.getElementById('pf-firstname').value = profile.firstname;
  document.getElementById('pf-lastname').value = profile.lastname;
  document.getElementById('pf-email').value = profile.email;

  // Message d'accueil
  const welcome = document.getElementById('head-welcome');
  if (welcome) {
    const firstname = profile.firstname ? profile.firstname : '';
    const greeting = firstname ? `Bonjour ${firstname}.` : 'Bonjour.';
    welcome.textContent = `${greeting} Cet espace rassemble les ressentis partagés par les membres et les intervenants après chaque séance. Il vous aide à suivre ce qui fonctionne, repérer ce qui peut évoluer, et ajuster le programme au plus près des besoins du groupe.`;
  }
}

/** Sauvegarder le profil */
function saveProfile() {
  const profile = {
    firstname: document.getElementById('pf-firstname').value.trim(),
    lastname: document.getElementById('pf-lastname').value.trim(),
    email: document.getElementById('pf-email').value.trim(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  renderProfile();
  toggleProfile(); // fermer le dropdown
}

/** Toggle du dropdown profil */
function toggleProfile() {
  document.getElementById('profile-dropdown').classList.toggle('open');
}

// Fermer le dropdown au clic en dehors
document.addEventListener('click', e => {
  const widget = document.getElementById('profile-widget');
  if (widget && !widget.contains(e.target)) {
    document.getElementById('profile-dropdown').classList.remove('open');
  }
});

/** Gestion des panneaux de la gate */
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
    let role, token;

    if (CONFIG.DEMO_MODE) {
      if (pwd === 'greatly2026') {
        role = 'Membre';
      } else if (pwd === 'greatlyadmin2026') {
        role = 'Super-admin';
      } else {
        throw new Error('Mot de passe incorrect');
      }
      token = 'demo_' + Date.now();
    } else {
      const res = await API.login(pwd);
      role = res.role;
      token = res.token;
    }

    localStorage.setItem(CONFIG.TOKEN_KEY, token);
    localStorage.setItem(CONFIG.ROLE_KEY, role);
    localStorage.setItem(CONFIG.SESSION_START_KEY, Date.now().toString());
    enterDashboard(role);
  } catch (err) {
    console.error('Login error:', err);
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

  if (!CONFIG.DEMO_MODE) {
    try { await API.forgot(email); } catch (_) {}
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

  if (!CONFIG.DEMO_MODE) {
    try { await API.requestAccess(form); } catch (_) {}
  }
  showPanel('request-confirm');
}

/** Vérifie si le profil est complet (onboarding terminé) */
function isProfileComplete() {
  const p = getProfile();
  return !!(p.firstname && p.lastname && p.email);
}

/** Entrer dans le dashboard après authentification réussie */
function enterDashboard(role) {
  document.getElementById('gate').style.display = 'none';

  if (role === 'Super-admin') {
    document.body.classList.add('is-admin');
  }

  // Première connexion → onboarding
  if (!isProfileComplete()) {
    document.getElementById('onboarding').style.display = 'block';
    obGo(1);
    return;
  }

  document.getElementById('app').style.display = 'block';
  renderProfile();
  initDashboard();
}

// ---- Onboarding ----
let obStep = 1;

function obGo(n) {
  obStep = n;
  document.querySelectorAll('.onboarding-step').forEach(s =>
    s.classList.toggle('active', +s.dataset.ob === n)
  );
  const dots = document.querySelectorAll('.onboarding-progress span');
  dots.forEach((dot, i) => dot.classList.toggle('on', i < n));
}

function obNext() {
  if (obStep === 2) {
    // Valider le formulaire profil
    const firstname = document.getElementById('ob-firstname').value.trim();
    const lastname = document.getElementById('ob-lastname').value.trim();
    const email = document.getElementById('ob-email').value.trim();

    let valid = true;
    ['ob-firstname', 'ob-lastname', 'ob-email'].forEach(id => {
      const input = document.getElementById(id);
      const empty = !input.value.trim();
      input.classList.toggle('ob-err', empty);
      if (empty) valid = false;
    });

    // Validation email basique
    const emailInput = document.getElementById('ob-email');
    if (email && !email.includes('@')) {
      emailInput.classList.add('ob-err');
      valid = false;
    }

    if (!valid) {
      document.getElementById('ob-error').textContent = 'Tous les champs sont requis.';
      document.getElementById('ob-error').style.display = 'block';
      return;
    }

    document.getElementById('ob-error').style.display = 'none';

    // Sauvegarder le profil
    const profile = { firstname, lastname, email };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    // Pré-remplir l'étape 3
    document.getElementById('ob-hello').textContent = firstname;
  }

  obGo(obStep + 1);
}

function obPrev() {
  if (obStep > 1) obGo(obStep - 1);
}

function obFinish() {
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  renderProfile();
  initDashboard();
}

// Retirer le style erreur quand on tape
document.addEventListener('input', e => {
  if (e.target.classList.contains('ob-err')) {
    e.target.classList.remove('ob-err');
  }
});

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
