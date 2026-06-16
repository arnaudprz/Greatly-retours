/* ============================================
   Greatly — Vos retours · Console admin
   ============================================ */

// --- Données démo ---
const DEMO_PEOPLE = [
  { firstname: 'Arnaud', lastname: 'P.', email: 'arnaud@greatly.fr', role: 'Super-admin', status: 'actif', lastLogin: '15 juin 2026' },
  { firstname: 'Julie', lastname: 'L.', email: 'julie@greatly.fr', role: 'Super-admin', status: 'actif', lastLogin: '14 juin 2026' },
  { firstname: 'Marc', lastname: 'D.', email: 'marc@example.com', role: 'Membre', status: 'actif', lastLogin: '12 juin 2026' },
  { firstname: 'Sophie', lastname: 'B.', email: 'sophie@example.com', role: 'Membre', status: 'actif', lastLogin: '10 juin 2026' },
  { firstname: 'Thomas', lastname: 'R.', email: 'thomas@example.com', role: 'Membre', status: 'invité', lastLogin: '—' },
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


/** Charge et affiche la liste des personnes */
async function loadPeople() {
  if (CONFIG.DEMO_MODE) {
    renderPeopleTable(DEMO_PEOPLE);
    renderPendingRequests(DEMO_REQUESTS);
    renderActivityLog(DEMO_LOG);
    renderAdminKPIs();
    return;
  }
  try {
    const res = await API.getPeople();
    renderPeopleTable(res.people || []);
    renderPendingRequests(res.requests || []);
    renderActivityLog(res.log || []);
    renderAdminKPIs();
  } catch (err) {
    console.error('Erreur chargement admin:', err);
  }
}

function renderAdminKPIs() {
  const active = DEMO_PEOPLE.filter(p => p.status === 'actif').length;
  const pending = DEMO_PEOPLE.filter(p => p.status === 'invité').length + DEMO_REQUESTS.length;
  document.getElementById('ak-active').textContent = active;
  document.getElementById('ak-pending').textContent = pending;
  document.getElementById('ak-conn').textContent = DEMO_LOG.filter(l => l.action === 'Connexion').length;
  document.getElementById('ak-time').textContent = '12 min';
}

function renderPeopleTable(people) {
  const container = document.getElementById('people-container');
  if (!container) return;

  const roleColor = r => r === 'Super-admin' ? 'background:var(--sage-pale);color:var(--sage-dark)' : 'background:var(--energie-pale);color:#8a5a30';
  const statusDot = s => s === 'actif' ? '🟢' : s === 'invité' ? '🟡' : '🔴';

  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:.85rem">
      <thead>
        <tr style="text-align:left;border-bottom:1.5px solid var(--line)">
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Personne</th>
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Rôle</th>
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Statut</th>
          <th style="padding:10px 8px;font-weight:600;color:var(--warm-grey)">Dernière connexion</th>
          <th style="padding:10px 8px"></th>
        </tr>
      </thead>
      <tbody>
        ${people.map(p => `
          <tr style="border-bottom:1px solid var(--line)">
            <td style="padding:10px 8px">
              <div style="font-weight:600">${p.firstname} ${p.lastname}</div>
              <div style="font-size:.76rem;color:var(--warm-grey)">${p.email}</div>
            </td>
            <td style="padding:10px 8px"><span class="tag" style="${roleColor(p.role)}">${p.role}</span></td>
            <td style="padding:10px 8px">${statusDot(p.status)} ${p.status}</td>
            <td style="padding:10px 8px;color:var(--warm-grey)">${p.lastLogin}</td>
            <td style="padding:10px 8px;text-align:right">
              ${p.status === 'invité' ? `<button class="btn-ghost" style="padding:6px 12px;font-size:.78rem" onclick="adminAction('resend','${p.email}')">Relancer</button>` : ''}
              ${p.status === 'actif' ? `<button class="btn-ghost" style="padding:6px 12px;font-size:.78rem" onclick="adminAction('suspend','${p.email}','Suspendre l\\'accès de ${p.firstname} ?')">Suspendre</button>` : ''}
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
        <div style="font-weight:600;font-size:.9rem">${r.name}</div>
        <div style="font-size:.78rem;color:var(--warm-grey)">${r.email} · ${r.role} · ${r.scope}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn-solid" style="padding:7px 14px;font-size:.8rem" onclick="adminAction('approve','${r.email}')">Accepter</button>
        <button class="btn-ghost" style="padding:7px 14px;font-size:.8rem" onclick="adminAction('reject','${r.email}','Refuser la demande de ${r.name} ?')">Refuser</button>
      </div>
    </div>
  `).join('');
}

function renderActivityLog(log) {
  const container = document.getElementById('log-container');
  if (!container) return;

  container.innerHTML = log.map(l => `
    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.83rem">
      <span style="color:var(--warm-grey);white-space:nowrap;min-width:100px">${l.date}</span>
      <span style="font-weight:600">${l.action}</span>
      <span>${l.who}</span>
      <span style="color:var(--warm-grey)">${l.detail}</span>
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
      await API.invite(email, selectedInviteRole);
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
