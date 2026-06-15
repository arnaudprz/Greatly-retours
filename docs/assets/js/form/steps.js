/* ============================================
   Greatly — Vos retours · Navigation & validation
   ============================================ */

/** Aller à l'étape n */
function go(n) {
  state.step = n;
  document.querySelectorAll('.step').forEach(s =>
    s.classList.toggle('active', +s.dataset.step === n)
  );

  // Barre de progression
  const bar = document.getElementById('progress');
  bar.innerHTML = '';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const sp = document.createElement('span');
    if (i <= n) sp.classList.add('on');
    bar.appendChild(sp);
  }
  bar.style.display = n === 0 ? 'none' : 'flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Validation d'une étape : toutes les notes sont obligatoires, les textarea sont facultatifs */
function validateStep(n) {
  let ok = true;
  let first = null;
  const host = document.querySelector(`[data-step="${n}"]`);

  host.querySelectorAll('.q').forEach(q => {
    if (q.offsetParent === null) return; // question masquée

    let filled = true;
    const phases = q.querySelectorAll('.phase');

    if (phases.length) {
      // Carte déroulé : chaque phase doit avoir une note
      phases.forEach(row => {
        if (!row.querySelector('.sel')) filled = false;
      });
    } else if (q.querySelector('.nps,.chips')) {
      // Carte avec NPS ou chips : au moins une sélection
      if (!q.querySelector('.sel')) filled = false;
    }
    // Les textarea ne bloquent pas la validation (facultatifs)

    q.classList.toggle('err', !filled);
    if (!filled) {
      ok = false;
      if (!first) first = q;
    }
  });

  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return ok;
}

/** Bind navigation (retour / continuer) dans un conteneur */
function bindNav(scope) {
  scope.querySelectorAll('.nav-back').forEach(btn =>
    btn.addEventListener('click', () => go(state.step - 1))
  );
  scope.querySelectorAll('.nav-next').forEach(btn =>
    btn.addEventListener('click', () => {
      if (validateStep(state.step)) go(state.step + 1);
    })
  );
}

// Retirer le marquage d'erreur dès que la personne répond
document.addEventListener('click', e => {
  const q = e.target.closest('.q.err');
  if (!q) return;
  setTimeout(() => {
    let filled = true;
    const phases = q.querySelectorAll('.phase');
    if (phases.length) {
      phases.forEach(row => { if (!row.querySelector('.sel')) filled = false; });
    } else if (q.querySelector('.nps,.chips')) {
      if (!q.querySelector('.sel')) filled = false;
    }
    if (filled) q.classList.remove('err');
  }, 0);
});

document.addEventListener('input', e => {
  const q = e.target.closest('.q.err');
  if (q && e.target.value.trim()) q.classList.remove('err');
});
