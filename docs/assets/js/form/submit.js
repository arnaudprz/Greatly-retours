/* ============================================
   Greatly — Vos retours · Sérialisation & envoi
   ============================================ */

/** Sérialise le formulaire en JSON conforme au schéma §7.2 */
function serializeForm() {
  const key = scaleKey();
  const result = {
    ts: new Date().toISOString(),
    role: state.role,
    type: state.type,
    contexte: {
      sport: null,
      atelier: null,
    },
    phases: {},
    echelles: {},
    nps: null,
    ouvertes: {},
  };

  // Contexte
  if (state.type === 'energie') {
    const sportSel = document.querySelector('#q-sport .chip.sel');
    result.contexte.sport = sportSel ? sportSel.dataset.v : null;
  } else {
    const atelierSel = document.querySelector('#ateliers .chip.sel');
    result.contexte.atelier = atelierSel ? atelierSel.textContent : null;
  }

  // Phases (étape 2 — déroulé)
  const step2 = document.querySelector('[data-step="2"]');
  step2.querySelectorAll('.phase').forEach(row => {
    const name = row.querySelector('.pname').childNodes[0].textContent.trim();
    const sel = row.querySelector('.nps button.sel');
    result.phases[name] = sel ? +sel.dataset.n : null;
  });

  // Échelles (étape 2 — questions spécifiques)
  const scaleCards = step2.querySelectorAll(':scope > .q');
  // La première carte est le déroulé (phases), les suivantes sont les échelles
  SCALES[key].forEach((scale, i) => {
    const card = scaleCards[i + 1]; // +1 pour sauter la carte phases
    if (!card) return;
    const sel = card.querySelector('.nps button.sel');
    result.echelles[scale.id] = sel ? +sel.dataset.n : null;
  });

  // NPS (étape 3 — première carte)
  const step3 = document.querySelector('[data-step="3"]');
  const npsCards = step3.querySelectorAll('.q');
  const npsSel = npsCards[0]?.querySelector('.nps button.sel');
  result.nps = npsSel ? +npsSel.dataset.n : null;

  // Questions ouvertes (étape 3 — cartes suivantes)
  OPENS[key].forEach((open, i) => {
    const card = npsCards[i + 1];
    const textarea = card?.querySelector('textarea');
    result.ouvertes[open.t] = textarea ? textarea.value.trim() : '';
  });

  return result;
}

/** Envoie le formulaire au relais */
async function submitForm() {
  const btn = document.getElementById('btn-send');
  const originalText = btn.textContent;

  // État chargement
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Envoi en cours…';

  try {
    const data = serializeForm();
    await API.submit(data);
    // Succès → écran merci
    go(4);
  } catch (err) {
    // Erreur réseau → toast
    btn.disabled = false;
    btn.textContent = originalText;
    showToast('Erreur lors de l\'envoi. Vérifiez votre connexion et réessayez.');
    console.error('Erreur submit:', err);
  }
}

/** Affiche un toast d'erreur temporaire */
function showToast(message) {
  // Retirer un toast existant
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}
