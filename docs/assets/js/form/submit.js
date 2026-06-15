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

  // Greatly & vous (étape 4, intervenants uniquement)
  const step4 = document.querySelector('[data-step="4"]');
  if (step4 && typeof GREATLY_SCALES !== 'undefined') {
    result.greatly = {};
    result.greatly_ouvertes = {};

    const gCards = step4.querySelectorAll('.q');
    let scaleIdx = 0;
    GREATLY_SCALES.forEach(scale => {
      // +1 pour sauter la carte titre
      const card = gCards[scaleIdx + 1];
      scaleIdx++;
      if (!card) return;
      const sel = card.querySelector('.nps button.sel');
      result.greatly[scale.id] = sel ? +sel.dataset.n : null;
    });

    if (typeof GREATLY_OPENS !== 'undefined') {
      GREATLY_OPENS.forEach((open, i) => {
        const card = gCards[1 + GREATLY_SCALES.length + i];
        const textarea = card?.querySelector('textarea');
        result.greatly_ouvertes[open.t] = textarea ? textarea.value.trim() : '';
      });
    }
  }

  return result;
}

/** Envoie le formulaire au relais */
async function submitForm() {
  // Trouver le bouton d'envoi actif (btn-send ou btn-send-greatly)
  const btn = document.getElementById('btn-send-greatly') || document.getElementById('btn-send');
  const originalText = btn ? btn.textContent : '';

  // État chargement
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Envoi en cours…';
  }

  try {
    const data = serializeForm();
    await API.submit(data);
    // Succès → écran merci (dernière step)
    const allSteps = document.querySelectorAll('.step[data-step]');
    const lastStep = +allSteps[allSteps.length - 1].dataset.step;
    go(lastStep);
  } catch (err) {
    // Erreur réseau → toast
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
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
