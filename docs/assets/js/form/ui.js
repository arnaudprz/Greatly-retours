/* ============================================
   Greatly — Vos retours · Rendu UI du formulaire
   ============================================ */

/** Crée une grille NPS 0–10 avec gestion de sélection */
function createNPS(container) {
  const div = document.createElement('div');
  div.className = 'nps';
  for (let n = 0; n <= 10; n++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.n = n;
    btn.textContent = n;
    btn.addEventListener('click', () => {
      div.querySelectorAll('button').forEach(x => x.classList.remove('sel'));
      btn.classList.add('sel');
    });
    div.appendChild(btn);
  }
  container.appendChild(div);
  return div;
}

/** Crée les labels bas/haut sous une grille NPS */
function createScaleLabels(container, labels) {
  const div = document.createElement('div');
  div.className = 'scale-labels';
  div.innerHTML = `<span>${labels[0]}</span><span>${labels[1]}</span>`;
  container.appendChild(div);
}

/** Construit le contexte (étape 1) : sport ou atelier */
function buildContext() {
  const hostSport = document.getElementById('q-sport');
  const hostAtelier = document.getElementById('q-atelier');
  const atelierChips = document.getElementById('ateliers');

  // Afficher sport ou atelier selon le parcours
  hostSport.style.display = state.type === 'energie' ? 'block' : 'none';
  hostAtelier.style.display = state.type === 'lucidite' ? 'block' : 'none';

  // Générer les chips d'atelier
  atelierChips.innerHTML = '';
  ATELIERS.forEach(name => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = name;
    btn.addEventListener('click', () => {
      atelierChips.querySelectorAll('.chip').forEach(x => x.classList.remove('sel'));
      btn.classList.add('sel');
    });
    atelierChips.appendChild(btn);
  });
}

/** Construit l'étape 2 : déroulé + échelles */
function buildScales() {
  const host = document.querySelector('[data-step="2"]');
  host.innerHTML = '';

  // Déroulé étape par étape
  const phCard = document.createElement('div');
  phCard.className = 'q';
  const isIntervenant = state.role === 'intervenant';
  const phasesTitle = isIntervenant
    ? `Comment s'est déroulé${state.type === 'energie' ? 'e la séance' : ' l\'atelier'} de votre point de vue ?`
    : `Comment avez-vous vécu ${state.type === 'energie' ? 'la séance' : 'la rencontre'} ?`;
  phCard.innerHTML = `<h3>${phasesTitle}</h3>
    <div class="hint">Étape par étape, partagez votre ressenti. (0 = à revoir · 10 = excellent)</div>`;

  const phasesData = (isIntervenant && typeof PHASES_INTERVENANT !== 'undefined')
    ? PHASES_INTERVENANT[state.type]
    : PHASES[state.type];
  phasesData.forEach(phase => {
    const row = document.createElement('div');
    row.className = 'phase';
    row.innerHTML = `<div class="pname">${phase.n}<small>${phase.d}</small></div>`;
    createNPS(row);
    phCard.appendChild(row);
  });
  host.appendChild(phCard);

  // Échelles spécifiques
  SCALES[scaleKey()].forEach(scale => {
    const card = document.createElement('div');
    card.className = 'q';
    card.innerHTML = `<h3>${scale.t}</h3>${scale.hint ? `<div class="hint">${scale.hint}</div>` : ''}`;
    createNPS(card);
    createScaleLabels(card, scale.labels);
    host.appendChild(card);
  });

  // Navigation
  host.insertAdjacentHTML('beforeend',
    '<div class="nav"><button type="button" class="btn-ghost nav-back">Retour</button><button type="button" class="btn-solid nav-next">Continuer</button></div>');
  bindNav(host);
}

/** Construit l'étape 3 : NPS + questions ouvertes */
function buildOpens() {
  const host = document.querySelector('[data-step="3"]');
  host.innerHTML = '';

  // NPS 0–10
  const npsCard = document.createElement('div');
  npsCard.className = 'q';
  npsCard.innerHTML = `<h3>${NPS[scaleKey()]}</h3>
    <div class="hint">Répondez spontanément, avec le cœur.</div>`;
  createNPS(npsCard);
  createScaleLabels(npsCard, ['Je le garde pour moi', 'Oui, sans hésiter']);
  host.appendChild(npsCard);

  // Questions ouvertes
  OPENS[scaleKey()].forEach(open => {
    const card = document.createElement('div');
    card.className = 'q';
    card.innerHTML = `<h3>${open.t}</h3><div class="hint">${open.h}</div><textarea placeholder="Écrivez librement…"></textarea>`;
    host.appendChild(card);
  });

  // Navigation — si étape Greatly existe → continuer, sinon envoyer
  const hasGreatly = !!document.querySelector('[data-step="4"]:not(.merci *)');
  if (hasGreatly && state.role === 'intervenant') {
    host.insertAdjacentHTML('beforeend',
      '<div class="nav"><button type="button" class="btn-ghost nav-back">Retour</button><button type="button" class="btn-solid nav-next">Continuer</button></div>');
  } else {
    host.insertAdjacentHTML('beforeend',
      '<div class="nav"><button type="button" class="btn-ghost nav-back">Retour</button><button type="button" class="btn-solid nav-send" id="btn-send">Envoyer mon retour</button></div>');
  }
  bindNav(host);

  // Bouton envoi (seulement si pas d'étape Greatly)
  const sendBtn = host.querySelector('.nav-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      if (validateStep(3)) submitForm();
    });
  }
}
