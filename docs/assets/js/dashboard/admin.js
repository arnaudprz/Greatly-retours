/* ============================================
   Greatly — Vos retours · Console admin
   ============================================ */

/** Échappe le HTML pour prévenir les injections XSS */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Formate un nombre de minutes en durée lisible (ex: 0 → '—', 45 → '45 min', 130 → '2 h 10') */
function formatMinutes(min) {
  const m = Number(min) || 0;
  if (m < 1) return '—';
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? h + ' h' : h + ' h ' + r;
}

// --- Données démo ---
const DEMO_PEOPLE = [
  { firstname: 'Arnaud', lastname: 'P.', email: 'arnaud@greatly.fr', role: 'Super-admin', status: 'actif', lastLogin: '15 juin 2026', totalMinutes: 312 },
  { firstname: 'Julie', lastname: 'L.', email: 'julie@greatly.fr', role: 'Super-admin', status: 'actif', lastLogin: '14 juin 2026', totalMinutes: 187 },
  { firstname: 'Marc', lastname: 'D.', email: 'marc@example.com', role: 'Membre', status: 'actif', lastLogin: '12 juin 2026', totalMinutes: 42 },
  { firstname: 'Sophie', lastname: 'B.', email: 'sophie@example.com', role: 'Membre', status: 'actif', lastLogin: '10 juin 2026', totalMinutes: 15 },
  { firstname: 'Thomas', lastname: 'R.', email: 'thomas@example.com', role: 'Membre', status: 'invité', lastLogin: '—', totalMinutes: 0 },
];

const DEMO_REQUESTS = [
  { name: 'Claire M.', email: 'claire@example.com', role: 'Coach Yoga', scope: 'Tout le dashboard', date: '13 juin 2026' },
];

const DEMO_LOG = [
  { date: '15 juin 14:58', action: 'Connexion', who: 'Arnaud P.', detail: 'Super-admin' },
  { date: '14 juin 09:12', action: 'Connexion', who: 'Julie L.', detail: 'Super-admin' },
  { date: '14 juin 08:30', action: 'Invitation envoyée', who: 'Arnaud P.', detail: 'thomas@example.com → Membre' },
  { date: '12 juin 17:45', action: 'Connexion', who: 'Marc D.', detail: 'Membre' },
  { date: '10 juin 11:20', action: 'Connexion', who: 'Sophie B.', detail: 'Membre' },
];


// Données live (remplies par loadPeople)
let livePeople = [];
let liveRequests = [];
let liveLog = [];

/** Charge et affiche la liste des personnes */
async function loadPeople() {
  if (CONFIG.DEMO_MODE) {
    livePeople = DEMO_PEOPLE;
    liveRequests = DEMO_REQUESTS;
    liveLog = DEMO_LOG;
  } else {
    try {
      const res = await API.getPeople();
      livePeople = res.people || [];
      liveRequests = res.requests || [];
      liveLog = res.log || [];
    } catch (err) {
      console.error('Erreur chargement admin:', err);
      return;
    }
  }
  renderPeopleTable(livePeople);
  renderPendingRequests(liveRequests);
  renderActivityLog(liveLog);
  renderAdminKPIs();
}

function renderAdminKPIs() {
  const active = livePeople.filter(p => p.status === 'actif').length;
  const pending = livePeople.filter(p => p.status === 'invité').length + liveRequests.length;

  // Connexions des 30 derniers jours (les dates non parsables — démo — sont comptées par défaut)
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const connexions = liveLog.filter(l => {
    if (!l.action || !l.action.toLowerCase().includes('connexion')) return false;
    const t = new Date(l.date).getTime();
    return isNaN(t) ? true : (now - t) <= THIRTY_DAYS;
  }).length;

  // Temps moyen par personne (parmi celles ayant passé du temps)
  const withTime = livePeople.filter(p => (Number(p.totalMinutes) || 0) > 0);
  const totalMin = withTime.reduce((s, p) => s + (Number(p.totalMinutes) || 0), 0);
  const avgMin = withTime.length ? Math.round(totalMin / withTime.length) : 0;

  document.getElementById('ak-active').textContent = active;
  document.getElementById('ak-pending').textContent = pending;
  document.getElementById('ak-conn').textContent = connexions;
  document.getElementById('ak-time').textContent = formatMinutes(avgMin);
}

function renderPeopleTable(people) {
  const container = document.getElementById('people-container');
  if (!container) return;

  const roleColor = r => r === 'Super-admin' ? 'background:var(--sage-pale);color:var(--sage-dark)' : 'background:var(--energie-pale);color:#8a5a30';
  const statusDot = s => s === 'actif' ? '🟢' : s === 'invité' ? '🟡' : '🔴';
  const formatLogin = v => {
    if (!v || v === '—') return '—';
    const d = new Date(v);
    if (isNaN(d)) return v;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).replace(':', 'h');
  };

  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:.85rem">
      <thead>
        <tr style="text-align:left;border-bottom:1.5px solid var(--line)">
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Personne</th>
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Rôle</th>
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Statut</th>
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Dernière connexion</th>
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Temps cumulé</th>
          <th style="padding:10px 8px"></th>
        </tr>
      </thead>
      <tbody>
        ${people.map(p => `
          <tr style="border-bottom:1px solid var(--line)">
            <td style="padding:10px 8px">
              <div style="font-weight:600">${escapeHtml(p.firstname)} ${escapeHtml(p.lastname)}</div>
              <div style="font-size:.76rem;color:var(--warm-grey)">${escapeHtml(p.email)}</div>
            </td>
            <td style="padding:10px 8px"><span class="tag" style="${roleColor(p.role)}">${escapeHtml(p.role)}</span></td>
            <td style="padding:10px 8px">${statusDot(p.status)} ${escapeHtml(p.status)}</td>
            <td style="padding:10px 8px;color:var(--warm-grey)">${escapeHtml(formatLogin(p.lastLogin))}</td>
            <td style="padding:10px 8px;color:var(--warm-grey)">${escapeHtml(formatMinutes(p.totalMinutes))}</td>
            <td style="padding:10px 8px;text-align:right">
              ${p.status === 'invité' ? `<button class="btn-ghost" style="padding:6px 12px;font-size:.78rem" onclick="adminAction('resend','${escapeHtml(p.email)}')">Relancer</button>` : ''}
              ${p.status === 'actif' ? `<button class="btn-ghost" style="padding:6px 12px;font-size:.78rem" onclick="adminAction('suspend','${escapeHtml(p.email)}','Suspendre l\\'accès de ${escapeHtml(p.firstname)} ?')">Suspendre</button>` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderPendingRequests(requests) {
  const container = document.getElementById('requests-container');
  if (!container) return;

  if (requests.length === 0) {
    container.innerHTML = '<p style="color:var(--warm-grey);font-size:.85rem;padding:10px 0">Aucune demande en attente.</p>';
    return;
  }

  container.innerHTML = requests.map(r => `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)">
      <div>
        <div style="font-weight:600;font-size:.9rem">${escapeHtml(r.name)}</div>
        <div style="font-size:.78rem;color:var(--warm-grey)">${escapeHtml(r.email)} · ${escapeHtml(r.role)} · ${escapeHtml(r.scope)}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn-solid" style="padding:7px 14px;font-size:.8rem" onclick="adminAction('approve','${escapeHtml(r.email)}')">Accepter</button>
        <button class="btn-ghost" style="padding:7px 14px;font-size:.8rem" onclick="adminAction('reject','${escapeHtml(r.email)}','Refuser la demande de ${escapeHtml(r.name)} ?')">Refuser</button>
      </div>
    </div>
  `).join('');
}

function renderActivityLog(log) {
  const container = document.getElementById('log-container');
  if (!container) return;

  container.innerHTML = log.map(l => `
    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.83rem">
      <span style="color:var(--warm-grey);white-space:nowrap;min-width:100px">${escapeHtml(l.date)}</span>
      <span style="font-weight:600">${escapeHtml(l.action)}</span>
      <span>${escapeHtml(l.who)}</span>
      <span style="color:var(--warm-grey)">${escapeHtml(l.detail)}</span>
    </div>
  `).join('');
}

/** Actions admin avec confirmation */
async function adminAction(action, email, confirmMsg) {
  if (confirmMsg && !confirm(confirmMsg)) return;
  try {
    if (!CONFIG.DEMO_MODE) {
      await API[action](email);
    }
    // En démo, juste un feedback visuel
    alert('Action effectuée (démo) : ' + action + ' → ' + email);
    await loadPeople();
  } catch (err) {
    alert('Erreur : ' + err.message);
  }
}


// --- Popup invitation ---
let selectedInviteRole = null;

function openInvitePopup() {
  selectedInviteRole = null;
  document.querySelectorAll('.invite-role-btn').forEach(b => b.classList.remove('sel'));
  document.getElementById('invite-firstname').value = '';
  document.getElementById('invite-lastname').value = '';
  document.getElementById('invite-email').value = '';
  document.getElementById('invite-error').style.display = 'none';
  document.getElementById('invite-role-hint').textContent = 'Choisissez un rôle pour cette personne.';
  document.getElementById('invite-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeInvitePopup() {
  document.getElementById('invite-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function selectInviteRole(btn) {
  document.querySelectorAll('.invite-role-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  selectedInviteRole = btn.dataset.role;

  const hints = {
    'Membre': 'Accès au dashboard en lecture. Peut consulter les données et les verbatims.',
    'Super-admin': 'Accès complet : dashboard, administration, invitations, gestion des accès.',
  };
  document.getElementById('invite-role-hint').textContent = hints[selectedInviteRole] || '';
}

async function submitInvite() {
  const firstname = document.getElementById('invite-firstname').value.trim();
  const lastname = document.getElementById('invite-lastname').value.trim();
  const email = document.getElementById('invite-email').value.trim();
  const errEl = document.getElementById('invite-error');

  if (!firstname || !lastname) {
    errEl.textContent = 'Prénom et nom sont requis.';
    errEl.style.display = 'block';
    return;
  }
  if (!email || !email.includes('@')) {
    errEl.textContent = 'Email invalide.';
    errEl.style.display = 'block';
    return;
  }
  if (!selectedInviteRole) {
    errEl.textContent = 'Choisissez un rôle.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  const btn = document.getElementById('invite-submit');
  btn.disabled = true;
  btn.textContent = 'Envoi…';

  try {
    if (!CONFIG.DEMO_MODE) {
      await API.invite(email, selectedInviteRole, firstname, lastname);
    }

    // En démo, ajouter à la liste
    DEMO_PEOPLE.push({
      firstname, lastname, email,
      role: selectedInviteRole,
      status: 'invité',
      lastLogin: '—',
    });
    DEMO_LOG.unshift({
      date: new Date().toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      action: 'Invitation envoyée',
      who: getProfile().firstname + ' ' + getProfile().lastname,
      detail: email + ' → ' + selectedInviteRole,
    });

    closeInvitePopup();
    loadPeople();
    btn.disabled = false;
    btn.textContent = 'Envoyer l\'invitation';
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Envoyer l\'invitation';
    errEl.textContent = 'Erreur : ' + err.message;
    errEl.style.display = 'block';
  }
}
