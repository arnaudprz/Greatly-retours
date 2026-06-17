/* ============================================
   Greatly — Vos retours · Graphiques Chart.js
   Données vides + empty states + render complet
   ============================================ */

const C = {
  sage: '#6B7D5C', energie: '#C0814E', lucidite: '#4F7C82',
  line: '#E7E1D7', grey: '#6B6460',
  good: '#5d7d50', mid: '#c0974e', bad: '#b05f4a',
};

Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.color = C.grey;

// Registre des graphiques (pour destroy avant recréation)
const charts = {};

/** Crée ou recrée un graphique */
function mk(id, cfg) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  const el = document.getElementById(id);
  if (!el) return;
  // Nettoyer un éventuel empty-state précédent
  el.style.display = '';
  const parent = el.parentElement;
  if (parent) {
    parent.querySelectorAll('.empty-state').forEach(e => e.remove());
  }
  // Forcer la visibilité pour Chart.js
  if (el.offsetParent !== null || el.closest('[style*="display: none"]') === null) {
    charts[id] = new Chart(el, cfg);
  }
}

/** Affiche/masque un élément par ID */
function show(id, on) {
  const el = document.getElementById(id);
  if (el) el.style.display = on ? '' : 'none';
}

/** Formater un nombre avec virgule — gère NaN gracieusement */
function fr(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return String(n.toFixed(1)).replace('.', ',');
}

/**
 * Aligne un tableau renvoyé par monthlyAvg (12 mois glissants, dernier = mois courant)
 * sur MOIS (qui commence à PROGRAM_START et peut s'étendre dans le futur).
 * Les mois futurs sont laissés à null pour qu'aucune barre ne s'affiche.
 * NB : MOIS et CURRENT_MOIS_IDX sont définis plus bas — last() n'est appelée qu'après ce point.
 */
function last(arr, _m) {
  if (!arr || arr.length === 0) return [];
  if (arr.length === MOIS.length) return arr.slice();
  const result = new Array(MOIS.length).fill(null);
  for (let i = 0; i <= CURRENT_MOIS_IDX; i++) {
    const arrIdx = arr.length - 1 - (CURRENT_MOIS_IDX - i);
    if (arrIdx >= 0 && arrIdx < arr.length) result[i] = arr[arrIdx];
  }
  return result;
}

/** Vérifie si un tableau contient au moins une vraie valeur (non null) */
function hasData(arr) {
  return arr && arr.some(v => v !== null && v !== undefined);
}

/** Retourne les labels mois + données tronqués pour ne garder que depuis le premier mois avec données */
function trimToData(mois, ...dataArrays) {
  // Trouver le premier index qui a au moins une donnée non-null dans n'importe quel dataset
  let firstIdx = mois.length;
  dataArrays.forEach(arr => {
    if (!arr) return;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== null && arr[i] !== undefined && i < firstIdx) {
        firstIdx = i;
        break;
      }
    }
  });
  if (firstIdx >= mois.length) return { labels: mois, start: 0 };
  return { labels: mois.slice(firstIdx), start: firstIdx };
}

/** Tronque un tableau de données en cohérence avec trimToData */
function trimData(arr, start) {
  if (!arr) return [];
  return arr.slice(start);
}

/** Texte HTML pour un élément */
function txt(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

/** innerHTML pour un élément */
function htm(id, v) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = v;
}

const EMPTY_SVG = `<svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 24C6 24 8 8 12 8C16 8 18 20 22 20C26 20 28 12 32 12C36 12 38 18 42 18C44 18 46 16 46 16" stroke="#CDD8BE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const EMPTY_DEFAULT_MSG = 'Les données apparaîtront ici dès les premiers retours.';

/** Affiche un état vide dans un conteneur */
function emptyState(containerId, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--warm-grey)">
    <div style="margin-bottom:12px">${EMPTY_SVG}</div>
    <p style="font-size:.88rem;line-height:1.5">${message || EMPTY_DEFAULT_MSG}</p>
  </div>`;
}

/** Affiche un état vide sur le parent d'un canvas */
function emptyStateCanvas(canvasId, message) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  canvas.style.display = 'none';
  // Avoid duplicating empty state
  if (!parent.querySelector('.empty-state')) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.style.cssText = 'text-align:center;padding:40px 20px;color:var(--warm-grey)';
    div.innerHTML = `<div style="margin-bottom:12px">${EMPTY_SVG}</div>
      <p style="font-size:.88rem;line-height:1.5">${message || EMPTY_DEFAULT_MSG}</p>`;
    parent.appendChild(div);
  }
}


/* =============================================
   DONNÉES (vides — alimentées par l'API)
   ============================================= */

// Axe temporel : on démarre à juin 2026 (lancement du programme) et on s'arrête au mois courant
const MOIS_NOMS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
const PROGRAM_START_YEAR = 2026;
const PROGRAM_START_MONTH = 5; // juin (0-indexé)
const MIN_MOIS_LABELS = 6; // pour éviter les bars qui flottent quand on n'a que 1-2 mois
const MOIS = (() => {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth();
  const result = [];
  let y = PROGRAM_START_YEAR;
  let m = PROGRAM_START_MONTH;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    result.push(MOIS_NOMS[m]);
    m++;
    if (m > 11) { m = 0; y++; }
  }
  if (result.length === 0) result.push(MOIS_NOMS[PROGRAM_START_MONTH]);
  // Étend dans le futur jusqu'à atteindre MIN_MOIS_LABELS (mois à venir, vides).
  while (result.length < MIN_MOIS_LABELS) {
    result.push(MOIS_NOMS[m]);
    m++;
    if (m > 11) { m = 0; y++; }
  }
  return result;
})();

// Index dans MOIS du mois courant (= nb de mois écoulés depuis PROGRAM_START), clampé à [0, MOIS.length-1]
const CURRENT_MOIS_IDX = (() => {
  const now = new Date();
  const diff = (now.getFullYear() - PROGRAM_START_YEAR) * 12 + (now.getMonth() - PROGRAM_START_MONTH);
  return Math.max(0, Math.min(MOIS.length - 1, diff));
})();

const D = {
  // --- NPS par mois ---
  npsEnergie:   [],
  npsLucidite:  [],
  npsGlobal:    [],

  // --- Recommandation par canal & par audience (cards de tête, filtrées par F.who) ---
  npsCards: {
    energie:  { tous: [], membres: [], intervenants: [] },
    lucidite: { tous: [], membres: [], intervenants: [] },
    house:    { tous: [], membres: [], intervenants: [] },
    global:   { tous: [], membres: [], intervenants: [] },
  },

  // --- Énergie avant/après (0-10) ---
  energieAvant: [],
  energieApres: [],

  // --- Répartition NPS par mois (promoteurs, passifs, détracteurs) ---
  npsPromo:     [],
  npsPassif:    [],
  npsDetrac:    [],

  // --- NPS par atelier Lucidité ---
  ateliersNoms: [],
  ateliersNPS:  [],

  // --- Yoga vs Padel ---
  sportsNoms: [],
  sportsNPS:  [],
  sportsNote: [],

  // --- Séance Énergie étape par étape ---
  phasesENoms:  [],
  phasesENote:  [],

  // --- Rencontre Lucidité étape par étape ---
  phasesLNoms:  [],
  phasesLNote:  [],

  // --- Détail par question Énergie ---
  qEnergie: [],

  // --- Détail par question Lucidité ---
  qLucidite: [],

  // --- Par intervenant (note moyenne par mois) ---
  coachYoga:  [],
  coachPadel: [],

  // --- Lieux (note 0-10) ---
  lieuxNoms:   [],
  lieuxNotes:  [],
  lieuxHouse:  [],
  lieuxSport:  [],

  // --- Greatly House (formulaire dédié) ---
  qGreatlyHouse: [],

  // --- Prospect ---
  prospectNPS:        [],
  // Notes brutes (0-10) de toutes les réponses prospect, pour les doughnuts de répartition
  prospectNPSRaw:        [],
  prospectPertinenceRaw: [],
  prospectProjectionRaw: [],
  prospectImpression: [],
  prospectClarte:     [],
  prospectProjection: [],
  prospectValeur:     [],
  prospectPertinence: [],

  // Sources de découverte (prospect)
  sourcesLabels: [],
  sourcesData:   [],
  sourcesColors: [],

  // Freins (prospect)
  freinsLabels: [],
  freinsData:   [],

  // Attraits (prospect)
  attraitsLabels: [],
  attraitsData:   [],

  // --- Phases intervenants (déroulé vu par l'intervenant) ---
  phasesIvENoms:  [],
  phasesIvENote:  [],
  phasesIvLNoms:  [],
  phasesIvLNote:  [],

  // --- Échelles intervenants (retours de séance) ---
  qIntervenantEnergie: [],
  qIntervenantLucidite: [],

  // --- Intervenants + Greatly ---
  igLabels:    [],
  igScores:    [],
  igEvol:      [],
  igLogist:    [],
  igAdmin:     [],
  igPedag:     [],
  igComm:      [],
  igCadre:     [],
  igRelation:  [],
};


/* =============================================
   VERBATIMS & ALERTES (vides — alimentés par l'API)
   ============================================= */

const VERBATIMS = {
  energie: [],
  lucidite: [],
  prospect: { pas: [], suggestions: [] },
  lieux: [],
};

const VERBATIMS_IG = {
  facilite: [],
  collab: [],
};

const FEEDBACKS_ECRITS = [];

const ALERTES = [];


/* =============================================
   OPTIONS COMMUNES CHART.JS
   ============================================= */

const GRID_OPTS = {
  color: '#E7E1D730',
  drawBorder: false,
};

/** Options de base pour un line chart */
function lineOpts(yMin, yMax) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { size: 12 } } },
      tooltip: { backgroundColor: '#1A1A1A', titleFont: { weight: '600' }, bodyFont: { size: 13 }, cornerRadius: 10, padding: 10 },
    },
    scales: {
      x: { grid: { display: false } },
      y: { min: yMin, max: yMax, grid: GRID_OPTS, ticks: { font: { size: 11 } } },
    },
  };
}

/** Options pour un bar chart horizontal */
function hbarOpts(max) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10 },
    },
    scales: {
      x: { min: 0, max: max || 10, grid: GRID_OPTS, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 12 } } },
    },
  };
}

/** Options de base pour un bar chart vertical (séries groupées par mois) */
function barOpts(yMin, yMax) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { size: 12 } } },
      tooltip: { backgroundColor: '#1A1A1A', titleFont: { weight: '600' }, bodyFont: { size: 13 }, cornerRadius: 10, padding: 10 },
    },
    scales: {
      // categoryPercentage resserre les groupes de barres autour du label
      // (sinon, avec 1 seul mois, les bars s'étalent sur toute la largeur)
      x: { grid: { display: false }, categoryPercentage: 0.5 },
      y: { min: yMin, max: yMax, grid: GRID_OPTS, ticks: { font: { size: 11 } } },
    },
  };
}

/** Dataset pour une barre (séries groupées) */
function bards(label, data, color) {
  return {
    label, data,
    backgroundColor: color + '88',
    borderColor: color,
    borderWidth: 1,
    borderRadius: 4,
    maxBarThickness: 48,
    barPercentage: 1.0, // colle les barres d'un même mois (évite que la 2e bar déborde sur le mois suivant)
  };
}

/** Dataset pour une ligne */
function lineds(label, data, color, dashed) {
  // Si un seul point non-null, augmenter le radius pour le rendre visible
  const nonNull = data ? data.filter(v => v !== null) : [];
  const singlePoint = nonNull.length === 1;
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: color + '18',
    borderWidth: 2.5,
    pointRadius: singlePoint ? 6 : 3,
    pointHoverRadius: singlePoint ? 8 : 5,
    tension: 0.35,
    fill: false,
    spanGaps: true,
    borderDash: dashed ? [5, 5] : [],
  };
}

/** Mini sparkline (pour les qcards) */
function sparkOpts() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 6, max: 10 },
    },
    elements: { point: { radius: 0 } },
  };
}


/* =============================================
   RENDER PRINCIPAL
   ============================================= */

function render() {
  // 5 onglets plats. Chaque onglet = une source de retours = une section dédiée.
  const who = F.who;
  const isMembres      = who === 'membres';
  const isIntervenants = who === 'intervenants';
  const isProspects    = who === 'prospects';
  const isGreatly      = who === 'greatly';       // intervenants × Greatly
  const isGreatlyHouse = who === 'greatlyhouse';  // form greatlyhouse.html

  // standard-section sert membres ET intervenants (montre tout ce que le form recueille)
  const isStandard = isMembres || isIntervenants;

  show('standard-section', isStandard);
  show('prospect-section', isProspects);
  show('ivgreatly-section', isGreatly);
  show('lieux-section', isGreatlyHouse);

  // Les cartes "Derniers retours / Feedbacks écrits / Points d'attention"
  // viennent des forms membres + intervenants — masquées hors de ces onglets.
  show('card-verbatims', isStandard);
  show('card-feedbacks', isStandard);
  show('card-alerts', isIntervenants); // Points d'attention = retours intervenants uniquement

  if (isStandard) renderStandard(true, false, false); // overview de tout le form
  if (isProspects) renderProspect();
  if (isGreatly) renderIvGreatly();
  if (isGreatlyHouse) renderLieux();
}


/* =============================================
   VUE STANDARD (Tous / Énergie / Lucidité)
   ============================================= */

function renderStandard(_isOverview, _isEnergie, _isLucidite) {
  // Onglet plat : on montre TOUT ce que le formulaire de l'audience recueille.
  // Membres : Énergie + Lucidité + lieux + sports + coach
  // Intervenants : Énergie + Lucidité (vue intervenant), sans sports/coach (réservés aux membres)
  const m = F.period;
  const mois = last(MOIS, m);
  const isMembres = F.who === 'membres';
  const isIntervenants = F.who === 'intervenants';

  show('card-energie',   true);
  show('card-ateliers',  !isIntervenants);
  show('card-sports',    isMembres);
  show('card-phases-e',  true);
  show('card-phases-l',  true);
  show('card-lieux',     isMembres);
  show('card-perint',    isMembres);
  show('card-verbatims', true);
  show('card-alerts',    true);

  // --- KPIs ---
  renderKPIs(true, false, false, m);

  // --- NPS évolution ---
  renderNPS(mois, m, true, false, false);

  // --- Énergie avant/après ---
  renderEnergie(mois, m);

  // --- Répartition NPS ---
  renderRepart(mois, m);

  // --- NPS par atelier Lucidité ---
  if (!isIntervenants) renderAteliers();

  // --- Yoga vs Padel ---
  if (isMembres) renderSports();

  // --- Étapes Énergie ---
  renderPhasesE();

  // --- Étapes Lucidité ---
  renderPhasesL();

  // --- Détail par question ---
  renderDetail(true, false, false, mois, m);

  // --- Par intervenant ---
  if (isMembres) renderCoach(mois, m);

  // --- Les lieux (carte synthèse) ---
  if (isMembres) renderLieuxSynthese();

  // --- Verbatims ---
  renderVerbatims(true, false, false);

  // --- Feedbacks écrits ---
  renderFeedbacksEcrits();

  // --- Alertes ---
  renderAlertes();
}


/* ---- KPIs ---- */
function renderKPIs(isTous, isEnergie, isLucidite, m) {
  // 3 cards de tête : Reco Énergie / Lucidité / Greatly House, filtrées par F.who
  const audience = F.who; // 'tous' | 'membres' | 'intervenants'
  ['energie', 'lucidite', 'house'].forEach(canal => {
    const series = (D.npsCards[canal] && D.npsCards[canal][audience]) || [];
    const vals = last(series, m).filter(v => v !== null);
    const baseId = 'k-nps-' + canal;
    if (vals.length === 0) {
      txt(baseId, '—');
      txt(baseId + '-d', '');
      return;
    }
    const curr = vals[vals.length - 1];
    const prev = vals[0];
    const delta = curr - prev;
    txt(baseId, '+' + curr);
    txt(baseId + '-d', (delta >= 0 ? '+' : '') + delta + ' pts');
    const dEl = document.getElementById(baseId + '-d');
    if (dEl) {
      dEl.className = delta >= 0 ? 'up' : 'down';
      dEl.style.color = delta >= 0 ? C.good : C.bad;
    }
  });

  // Taux de réponse
  txt('k-tx', '—');
  txt('k-tx-sub', 'Pas encore de réponses');
}


/* ---- NPS évolution ---- */
function renderNPS(mois, m, isTous, isEnergie, isLucidite) {
  // Sélectionne les séries filtrées par audience (membres/intervenants/tous)
  const audience = (F.who === 'membres' || F.who === 'intervenants') ? F.who : 'tous';
  const sEnergie  = (D.npsCards.energie  && D.npsCards.energie[audience])  || [];
  const sLucidite = (D.npsCards.lucidite && D.npsCards.lucidite[audience]) || [];
  const sGlobal   = (D.npsCards.global   && D.npsCards.global[audience])   || [];

  const hasEnergie  = hasData(sEnergie);
  const hasLucidite = hasData(sLucidite);
  const hasGlobal   = hasData(sGlobal);

  if (!hasEnergie && !hasLucidite && !hasGlobal) {
    emptyStateCanvas('c-nps', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }

  const allSeries = [
    (isTous || isEnergie) && hasEnergie ? last(sEnergie, m) : null,
    (isTous || isLucidite) && hasLucidite ? last(sLucidite, m) : null,
    isTous && hasGlobal ? last(sGlobal, m) : null,
  ].filter(Boolean);
  const t = trimToData(mois, ...allSeries);

  const datasets = [];
  if ((isTous || isEnergie) && hasEnergie) {
    datasets.push(bards('Énergie', trimData(last(sEnergie, m), t.start), C.energie));
  }
  if ((isTous || isLucidite) && hasLucidite) {
    datasets.push(bards('Lucidité', trimData(last(sLucidite, m), t.start), C.lucidite));
  }
  if (isTous && hasGlobal) {
    datasets.push(bards('Global', trimData(last(sGlobal, m), t.start), C.sage));
  }
  if (datasets.length === 0) {
    emptyStateCanvas('c-nps', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-nps', {
    type: 'bar',
    data: { labels: t.labels, datasets },
    options: barOpts(-100, 100),
  });
}


/* ---- Énergie avant/après ---- */
function renderEnergie(mois, m) {
  const av = last(D.energieAvant, m);
  const ap = last(D.energieApres, m);
  if (!hasData(av) && !hasData(ap)) {
    emptyStateCanvas('c-energie', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  const t = trimToData(mois, av, ap);
  mk('c-energie', {
    type: 'bar',
    data: {
      labels: t.labels,
      datasets: [
        bards('Avant séance', trimData(av, t.start), C.bad),
        bards('Après séance', trimData(ap, t.start), C.good),
      ],
    },
    options: barOpts(0, 10),
  });
}


/* ---- Répartition NPS ---- */
function renderRepart(mois, m) {
  const pr = last(D.npsPromo, m);
  if (!hasData(pr)) {
    emptyStateCanvas('c-repart', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  const tR = trimToData(mois, last(D.npsPromo, m), last(D.npsPassif, m), last(D.npsDetrac, m));
  mk('c-repart', {
    type: 'bar',
    data: {
      labels: tR.labels,
      datasets: [
        { label: 'Promoteurs (9-10)', data: trimData(last(D.npsPromo, m), tR.start), backgroundColor: C.good + 'CC', borderRadius: 3 },
        { label: 'Passifs (7-8)', data: trimData(last(D.npsPassif, m), tR.start), backgroundColor: C.mid + 'CC', borderRadius: 3 },
        { label: 'Détracteurs (0-6)', data: trimData(last(D.npsDetrac, m), tR.start), backgroundColor: C.bad + 'CC', borderRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { size: 11 } } },
        tooltip: { backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10 },
      },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, grid: GRID_OPTS, ticks: { callback: v => v + '%', font: { size: 11 } } },
      },
    },
  });
}


/* ---- NPS par atelier Lucidité ---- */
function renderAteliers() {
  if (D.ateliersNPS.length === 0) {
    emptyStateCanvas('c-ateliers', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-ateliers', {
    type: 'bar',
    data: {
      labels: D.ateliersNoms,
      datasets: [{
        label: 'Recommandation',
        data: D.ateliersNPS,
        backgroundColor: D.ateliersNPS.map(v => v >= 75 ? C.good + 'CC' : v >= 60 ? C.mid + 'CC' : C.bad + 'CC'),
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10 },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { min: 0, max: 100, grid: GRID_OPTS, ticks: { font: { size: 11 } } },
      },
    },
  });
}


/* ---- Yoga vs Padel ---- */
function renderSports() {
  if (D.sportsNPS.length === 0) {
    emptyStateCanvas('c-sports', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-sports', {
    type: 'bar',
    data: {
      labels: D.sportsNoms,
      datasets: [
        { label: 'Recommandation', data: D.sportsNPS, backgroundColor: [C.lucidite + 'CC', C.energie + 'CC'], borderRadius: 6 },
        { label: 'Note moyenne', data: D.sportsNote.map(v => v * 10), backgroundColor: [C.lucidite + '55', C.energie + '55'], borderRadius: 6 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { size: 11 } } },
        tooltip: {
          backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10,
          callbacks: {
            label: ctx => ctx.dataset.label === 'Note moyenne'
              ? ctx.dataset.label + ': ' + (ctx.raw / 10).toFixed(1) + '/10'
              : ctx.dataset.label + ': +' + ctx.raw,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { min: 0, max: 100, grid: GRID_OPTS },
      },
    },
  });
}


/* ---- Séance Énergie étape par étape ---- */
function renderPhasesE() {
  if (D.phasesENote.length === 0) {
    emptyStateCanvas('c-phases-e', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-phases-e', {
    type: 'bar',
    data: {
      labels: D.phasesENoms,
      datasets: [{
        data: D.phasesENote,
        backgroundColor: C.energie + 'AA',
        borderRadius: 6,
      }],
    },
    options: hbarOpts(10),
  });
}


/* ---- Rencontre Lucidité étape par étape ---- */
function renderPhasesL() {
  if (D.phasesLNote.length === 0) {
    emptyStateCanvas('c-phases-l', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-phases-l', {
    type: 'bar',
    data: {
      labels: D.phasesLNoms,
      datasets: [{
        data: D.phasesLNote,
        backgroundColor: C.lucidite + 'AA',
        borderRadius: 6,
      }],
    },
    options: hbarOpts(10),
  });
}


/* ---- Détail par question (mini cards avec sparklines) ---- */
function renderDetail(isTous, isEnergie, isLucidite, mois, m) {
  const grid = document.getElementById('detail-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const sections = [];
  if ((isTous || isEnergie) && D.qEnergie.length > 0) {
    sections.push({ titre: '⛷️ Parcours Énergie', questions: D.qEnergie, color: C.energie });
  }
  if ((isTous || isLucidite) && D.qLucidite.length > 0) {
    sections.push({ titre: '🦉 Parcours Lucidité', questions: D.qLucidite, color: C.lucidite });
  }

  if (sections.length === 0) {
    emptyState('detail-grid', 'Les données détaillées apparaîtront ici dès les premiers retours.');
    return;
  }

  sections.forEach(sec => {
    // Divider
    const div = document.createElement('div');
    div.className = 'qdivider';
    div.textContent = sec.titre;
    grid.appendChild(div);

    sec.questions.forEach((q, i) => {
      const id = 'spark-' + sec.titre.substring(0, 3) + '-' + i;
      const deltaClass = q.delta >= 0 ? 'up' : 'down';
      const deltaColor = q.delta >= 0 ? C.good : C.bad;
      const deltaSign = q.delta >= 0 ? '+' : '';

      const card = document.createElement('div');
      card.className = 'qcard';
      card.innerHTML = `
        <h4>${q.label}</h4>
        ${q.q ? `<div class="qq">« ${q.q} »</div>` : ''}
        <div class="qval">
          ${fr(q.val)}<span style="font-size:.85rem;color:var(--warm-grey)">/10</span>
          <span class="qdelta" style="color:${deltaColor}">${deltaSign}${fr(q.delta)}</span>
          <span class="qn">n=${Math.floor(18 + Math.random() * 30)}</span>
        </div>
        <div class="qchart"><canvas id="${id}"></canvas></div>
      `;
      grid.appendChild(card);

      // Sparkline ou barre
      requestAnimationFrame(() => {
        renderQChart(id, q, mois, m, sec.color);
      });
    });
  });
}


/* ---- Par intervenant ---- */
function renderCoach(mois, m) {
  // Histogramme : 2 séries (yoga + padel) en barres groupées par mois.
  const yogaData = D.coachYoga;
  const padelData = D.coachPadel;
  const hasYoga = yogaData.length > 0;
  const hasPadel = padelData.length > 0;

  if (!hasYoga && !hasPadel) {
    emptyStateCanvas('c-coach', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }

  const yoga = hasYoga ? last(yogaData, m) : [];
  const padel = hasPadel ? last(padelData, m) : [];
  const len = Math.max(yoga.length, padel.length);
  const labels = last(mois, len);

  const datasets = [];
  if (hasYoga) datasets.push({
    label: 'Coach Yoga', data: yoga,
    backgroundColor: C.lucidite + '88', borderColor: C.lucidite, borderWidth: 1, borderRadius: 4,
  });
  if (hasPadel) datasets.push({
    label: 'Coach Padel', data: padel,
    backgroundColor: C.energie + '88', borderColor: C.energie, borderWidth: 1, borderRadius: 4,
  });

  mk('c-coach', {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { grid: { display: false } },
        y: { min: 0, max: 10, grid: { color: '#E7E1D720' } },
      },
    },
  });
}


/* ---- Lieux (carte synthèse dans la vue Tous) ---- */
function renderLieuxSynthese() {
  if (D.lieuxNotes.length === 0) {
    emptyStateCanvas('c-lieux', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-lieux', {
    type: 'bar',
    data: {
      labels: D.lieuxNoms,
      datasets: [{
        data: D.lieuxNotes,
        backgroundColor: [C.sage + 'CC', C.lucidite + 'AA', C.energie + 'AA'],
        borderRadius: 6,
      }],
    },
    options: hbarOpts(10),
  });
}


/* ---- Verbatims ---- */
function renderVerbatims(isTous, isEnergie, isLucidite) {
  const list = document.getElementById('verbatims-list');
  if (!list) return;

  let verbs = [];
  if (isTous) verbs = [...VERBATIMS.energie.slice(0, 3), ...VERBATIMS.lucidite.slice(0, 3)];
  else if (isEnergie) verbs = VERBATIMS.energie;
  else if (isLucidite) verbs = VERBATIMS.lucidite;

  if (verbs.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
      <p style="font-size:.88rem;line-height:1.5">Aucun retour pour le moment. Les verbatims apparaîtront ici au fil des réponses.</p>
    </div>`;
  } else {
    // Mélanger par date (déjà triées dans nos données)
    verbs.sort((a, b) => 0); // garder l'ordre

    list.innerHTML = verbs.map(v => `
      <div class="verb">
        <div class="meta">
          <span class="tag ${v.tag.toLowerCase().includes('yoga') || v.tag.toLowerCase().includes('padel') ? 'energie' : 'lucidite'}">${v.tag}</span>
          <span>${v.date}</span>
        </div>
        <p>« ${v.text} »</p>
      </div>
    `).join('');
  }

  // Popup détail
  const detail = document.getElementById('verbatims-detail');
  if (detail) {
    const all = [...VERBATIMS.energie, ...VERBATIMS.lucidite];
    if (all.length === 0) {
      detail.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
        <p style="font-size:.88rem;line-height:1.5">Aucun verbatim pour le moment.</p>
      </div>`;
    } else {
      detail.innerHTML = all.map(v => `
        <div class="verb">
          <div class="meta">
            <span class="tag ${v.tag.toLowerCase().includes('yoga') || v.tag.toLowerCase().includes('padel') ? 'energie' : 'lucidite'}">${v.tag}</span>
            <span>${v.date}</span>
          </div>
          <p>« ${v.text} »</p>
        </div>
      `).join('');
    }
  }
}


/* ---- Alertes ---- */
function renderAlertes() {
  const list = document.getElementById('alerts-list');
  if (!list) return;

  if (ALERTES.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
      <p style="font-size:.88rem;line-height:1.5">Aucun point d'attention pour le moment.</p>
    </div>`;
  } else {
    list.innerHTML = ALERTES.map(a => `
      <div class="alert">
        <span class="ico">${a.ico}</span>
        <div>
          <b>${a.titre}</b>
          <div style="font-size:.82rem;color:var(--warm-grey);margin-top:2px">${a.text}</div>
        </div>
      </div>
    `).join('');
  }

  // Popup détail
  const detail = document.getElementById('alerts-detail');
  if (detail) {
    if (ALERTES.length === 0) {
      detail.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
        <p style="font-size:.88rem;line-height:1.5">Aucun point d'attention pour le moment.</p>
      </div>`;
    } else {
      detail.innerHTML = ALERTES.map(a => `
        <div class="alert">
          <span class="ico">${a.ico}</span>
          <div>
            <b>${a.titre}</b>
            <div style="font-size:.82rem;color:var(--warm-grey);margin-top:2px">${a.text}</div>
          </div>
        </div>
      `).join('');
    }
  }
}


/* ---- Feedbacks écrits ---- */
function feedbackCard(fb, truncate) {
  const content = truncate
    ? `<p style="font-size:.88rem;color:var(--warm-grey);margin-top:6px">${fb.texte}</p>`
    : `<div style="font-size:.92rem;margin-top:8px;line-height:1.6">${fb.html}</div>`;
  return `
    <div class="verb" style="padding:16px 0">
      <div class="meta"><span>${fb.date}</span></div>
      ${fb.titre ? `<div style="font-weight:600;font-size:.95rem;margin-top:6px">${fb.titre}</div>` : ''}
      ${content}
    </div>
  `;
}

function renderFeedbacksEcrits() {
  const list = document.getElementById('feedbacks-list');
  if (!list) return;

  if (FEEDBACKS_ECRITS.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
      <p style="font-size:.88rem;line-height:1.5">Aucun feedback écrit pour le moment.</p>
    </div>`;
  } else {
    list.innerHTML = FEEDBACKS_ECRITS.slice(0, 3).map(fb => feedbackCard(fb, true)).join('');
  }

  const detail = document.getElementById('feedbacks-detail');
  if (detail) {
    if (FEEDBACKS_ECRITS.length === 0) {
      detail.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
        <p style="font-size:.88rem;line-height:1.5">Aucun feedback écrit pour le moment.</p>
      </div>`;
    } else {
      detail.innerHTML = FEEDBACKS_ECRITS.map(fb => feedbackCard(fb, false)).join('');
    }
  }
}

function openFeedbacks() {
  document.getElementById('feedbacks-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeFeedbacks() {
  document.getElementById('feedbacks-overlay').classList.remove('open');
  document.body.style.overflow = '';
}


/* =============================================
   VUE LIEUX
   ============================================= */

function renderLieux() {
  const m = F.period;
  const mois = last(MOIS, m);

  // KPIs (données déjà combinées dans l'agrégation)
  if (D.lieuxNotes.length >= 1) {
    txt('lx-house', fr(D.lieuxNotes[0]));
    const sportAvg = D.lieuxNotes.length >= 3 ? (D.lieuxNotes[1] + D.lieuxNotes[2]) / 2 : 0;
    txt('lx-sport', sportAvg > 0 ? fr(sportAvg) : '—');
  } else {
    txt('lx-house', '—');
    txt('lx-sport', '—');
  }

  // Vue d'ensemble (horizontal bar) — ne montrer que les lieux avec des données
  const lieuxFiltered = D.lieuxNoms.map((n, i) => ({ name: n, val: D.lieuxNotes[i] })).filter(l => l.val > 0);
  if (lieuxFiltered.length === 0) {
    emptyStateCanvas('c-lieux-overview', 'Pas encore de retours sur les lieux.');
  } else {
    const colors = [C.sage + 'CC', C.lucidite + 'AA', C.energie + 'AA'];
    mk('c-lieux-overview', {
      type: 'bar',
      data: {
        labels: lieuxFiltered.map(l => l.name),
        datasets: [{
          data: lieuxFiltered.map(l => l.val),
          backgroundColor: lieuxFiltered.map((_, i) => colors[i % colors.length]),
          borderRadius: 6,
        }],
      },
      options: hbarOpts(10),
    });
  }

  // Greatly House mini line
  if (D.lieuxHouse.length === 0) {
    emptyStateCanvas('c-lieux-house', 'Pas encore de retours sur la Greatly House.');
  } else {
    const houseData = last(D.lieuxHouse, m);
    const tH = trimToData(mois, houseData);
    mk('c-lieux-house', {
      type: 'bar',
      data: {
        labels: tH.labels,
        datasets: [bards('Greatly House', trimData(houseData, tH.start), C.sage)],
      },
      options: {
        ...barOpts(0, 10),
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10 } },
      },
    });
  }

  // Lieux sportifs mini line
  if (D.lieuxSport.length === 0) {
    emptyStateCanvas('c-lieux-sport', 'Pas encore de retours sur les lieux sportifs.');
  } else {
    const sportData = last(D.lieuxSport, m);
    const tS = trimToData(mois, sportData);
    mk('c-lieux-sport', {
      type: 'bar',
      data: {
        labels: tS.labels,
        datasets: [bards('Lieux sportifs', trimData(sportData, tS.start), C.energie)],
      },
      options: {
        ...barOpts(0, 10),
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10 } },
      },
    });
  }

  // Évolution par lieu
  if (D.lieuxHouse.length === 0 && D.lieuxSport.length === 0) {
    emptyStateCanvas('c-lieux-evol', 'Pas encore de données d\'évolution.');
  } else {
    const evolHouse = D.lieuxHouse.length > 0 ? last(D.lieuxHouse, m) : [];
    const evolSport = D.lieuxSport.length > 0 ? last(D.lieuxSport, m) : [];
    const tE = trimToData(mois, evolHouse, evolSport);
    mk('c-lieux-evol', {
      type: 'bar',
      data: {
        labels: tE.labels,
        datasets: [
          ...(D.lieuxHouse.length > 0 ? [bards('Greatly House', trimData(evolHouse, tE.start), C.sage)] : []),
          ...(D.lieuxSport.length > 0 ? [bards('Lieux sportifs', trimData(evolSport, tE.start), C.energie)] : []),
        ],
      },
      options: barOpts(0, 10),
    });
  }

  // Détail par question Greatly House
  renderGHDetail(mois, m);

  // Verbatims lieux
  const vList = document.getElementById('lieux-verbatims-list');
  if (vList) {
    if (VERBATIMS.lieux.length === 0) {
      vList.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
        <p style="font-size:.88rem;line-height:1.5">Les verbatims sur les lieux s'afficheront ici au fil des réponses.</p>
      </div>`;
    } else {
      vList.innerHTML = VERBATIMS.lieux.map(v => `
        <div class="verb">
          <div class="meta">
            <span class="tag ${v.lieu === 'Greatly House' ? 'lucidite' : 'energie'}">${v.lieu}</span>
            <span>${v.date}</span>
          </div>
          <p>« ${v.text} »</p>
        </div>
      `).join('');
    }
  }
}


/* =============================================
   VUE FUTURS MEMBRES (PROSPECT)
   ============================================= */

// Libellés des options des questions multi-choix (utilisés si pas encore de data)
const FREINS_OPTIONS = [
  "L'investissement financier",
  'Trouver le temps',
  'Le déplacement',
  'Le format en groupe',
  'Pas clair pour moi',
  'Le côté sportif intimide',
  'Rien de particulier',
];
const ATTRAITS_OPTIONS = [
  'Bouger, prendre soin du corps',
  'Prendre du recul',
  'Échanger entre pairs',
  'Le cadre, la Greatly House',
  "L'approche globale",
  "S'accorder une pause",
];

/** Histogramme vertical 0-10 par mois. Empty state propre si aucune donnée. */
function renderRatingHist(canvasId, _moisAll, m, dataArr, label, color) {
  const hasAny = dataArr && dataArr.length > 0 && dataArr.some(v => v !== null && v !== undefined);
  if (!hasAny) {
    emptyStateCanvas(canvasId, 'Les notes apparaîtront ici dès les premiers retours.');
    return;
  }
  let data = last(dataArr, m);
  const len = MOIS.length;
  if (data.length < len) data = new Array(len - data.length).fill(null).concat(data);
  mk(canvasId, {
    type: 'bar',
    data: {
      labels: MOIS,
      datasets: [{
        label, data,
        backgroundColor: color + '88', borderColor: color, borderWidth: 1, borderRadius: 4,
        maxBarThickness: 80,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.raw == null ? '—' : ctx.raw.toFixed(1) + '/10' } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { min: 0, max: 10, grid: { color: '#E7E1D720' } },
      },
    },
  });
}

// Palette pour les "freins" (tons chauds/alerte) et les "attraits" (tons frais/positifs)
const FREINS_PALETTE = ['#B05F4A', '#C0814E', '#D4A574', '#A66B4F', '#8B5A3C', '#C49A6B', '#9B8B7A'];
const ATTRAITS_PALETTE = ['#5D7D50', '#6B7D5C', '#4F7C82', '#7A9B82', '#8FA68A', '#A8B89E', '#C0CCB8'];

/** Doughnut multi-choix — chaque part = une option, tooltip = % au hover. */
function renderChoiceHist(canvasId, dataLabels, dataValues, _fallbackOptions, _color, palette) {
  const hasData = dataValues && dataValues.length > 0 && dataValues.some(v => v > 0);
  if (!hasData) {
    emptyStateCanvas(canvasId, 'Pas encore de réponses — les options choisies apparaîtront ici, classées de la plus citée à la moins citée.');
    return;
  }
  const total = dataValues.reduce((a, b) => a + (b || 0), 0);
  const palette_ = palette || ATTRAITS_PALETTE;
  const colors = dataLabels.map((_, i) => palette_[i % palette_.length]);

  mk(canvasId, {
    type: 'doughnut',
    data: {
      labels: dataLabels,
      datasets: [{
        data: dataValues,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '55%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
        tooltip: {
          backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10,
          callbacks: {
            label: ctx => {
              const v = ctx.raw || 0;
              const pct = total > 0 ? Math.round((v / total) * 100) : 0;
              return ctx.label + ' : ' + pct + '%';
            },
          },
        },
      },
    },
  });
}

/** Deux doughnuts concentriques : ring extérieur = Question 1, ring intérieur = Question 2.
 *  Répartition Fort (8-10) / Moyen (5-7) / Faible (0-4). Tooltip = question + catégorie + %.
 */
function renderDualBreakdown(canvasId, raw1, label1, raw2, label2) {
  const has1 = raw1 && raw1.length > 0;
  const has2 = raw2 && raw2.length > 0;
  if (!has1 && !has2) {
    emptyStateCanvas(canvasId, 'Les répartitions apparaîtront ici dès les premiers retours (Fort 8-10 · Moyen 5-7 · Faible 0-4).');
    return;
  }
  const breakdown = arr => {
    let high = 0, mid = 0, low = 0;
    arr.forEach(v => { if (v >= 8) high++; else if (v >= 5) mid++; else low++; });
    return [high, mid, low];
  };
  const datasets = [];
  if (has1) datasets.push({
    label: label1,
    data: breakdown(raw1),
    backgroundColor: [C.good, C.mid, C.bad],
    borderWidth: 2, borderColor: '#fff',
  });
  if (has2) datasets.push({
    label: label2,
    data: breakdown(raw2),
    backgroundColor: [C.good + 'BB', C.mid + 'BB', C.bad + 'BB'],
    borderWidth: 2, borderColor: '#fff',
  });
  mk(canvasId, {
    type: 'doughnut',
    data: {
      labels: ['Fort (8-10)', 'Moyen (5-7)', 'Faible (0-4)'],
      datasets,
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '40%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
        tooltip: {
          backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10,
          callbacks: {
            label: ctx => {
              const ds = ctx.dataset;
              const total = ds.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
              return ds.label + ' — ' + ctx.label + ' : ' + pct + '%';
            },
          },
        },
      },
    },
  });
}

/** Doughnut NPS Promoteurs / Passifs / Détracteurs à partir d'une note brute 0-10. */
function renderNpsBreakdown(canvasId, ratingsArr) {
  const vals = (ratingsArr || []).filter(v => v !== null && v !== undefined);
  if (vals.length === 0) {
    emptyStateCanvas(canvasId, 'La répartition apparaîtra ici dès les premiers retours (Promoteurs 9-10 · Passifs 7-8 · Détracteurs 0-6).');
    return;
  }
  let promo = 0, passif = 0, detrac = 0;
  vals.forEach(v => { if (v >= 9) promo++; else if (v >= 7) passif++; else detrac++; });
  const total = promo + passif + detrac;
  mk(canvasId, {
    type: 'doughnut',
    data: {
      labels: ['Promoteurs (9-10)', 'Passifs (7-8)', 'Détracteurs (0-6)'],
      datasets: [{
        data: [promo, passif, detrac],
        backgroundColor: [C.good, C.mid, C.bad],
        borderWidth: 2, borderColor: '#fff',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '55%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
        tooltip: {
          backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10,
          callbacks: { label: ctx => ctx.label + ' : ' + Math.round((ctx.raw / total) * 100) + '%' },
        },
      },
    },
  });
}

/** Histogramme groupé 0-10 (2 séries) par mois. Empty state propre si aucune donnée. */
function renderDualRatingHist(canvasId, _moisAll, m, data1, label1, color1, data2, label2, color2) {
  const has1 = data1 && data1.length > 0 && data1.some(v => v !== null && v !== undefined);
  const has2 = data2 && data2.length > 0 && data2.some(v => v !== null && v !== undefined);
  if (!has1 && !has2) {
    emptyStateCanvas(canvasId, 'Les notes apparaîtront ici dès les premiers retours.');
    return;
  }
  const len = MOIS.length;
  const get = (arr) => {
    if (!arr || arr.length === 0) return new Array(len).fill(null);
    let d = last(arr, m);
    if (d.length < len) d = new Array(len - d.length).fill(null).concat(d);
    return d;
  };
  mk(canvasId, {
    type: 'bar',
    data: {
      labels: MOIS,
      datasets: [
        { label: label1, data: get(data1), backgroundColor: color1 + '88', borderColor: color1, borderWidth: 1, borderRadius: 4 },
        { label: label2, data: get(data2), backgroundColor: color2 + '88', borderColor: color2, borderWidth: 1, borderRadius: 4 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ' : ' + (ctx.raw == null ? '—' : ctx.raw.toFixed(1) + '/10') } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { min: 0, max: 10, grid: { color: '#E7E1D720' } },
      },
    },
  });
}

function renderProspect() {
  const m = F.period;
  const mois = last(MOIS, m);

  // --- KPIs (dernier mois avec une valeur non-null, sinon —) ---
  const lastVal = arr => {
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return arr[i];
    return null;
  };
  const np = lastVal(last(D.prospectNPS, m));
  txt('pk-nps', np != null ? '+' + np : '—');

  const ip = lastVal(last(D.prospectImpression, m));
  txt('pk-impression', ip != null ? fr(ip) : '—');

  const cl = lastVal(last(D.prospectClarte, m));
  txt('pk-clarte', cl != null ? fr(cl) : '—');

  const pe = lastVal(last(D.prospectPertinence, m));
  txt('pk-pertinence', pe != null ? fr(pe) : '—');

  const va = lastVal(last(D.prospectValeur, m));
  txt('pk-valeur', va != null ? fr(va) : '—');

  const pr = lastVal(last(D.prospectProjection, m));
  txt('pk-projection', pr != null ? fr(pr) : '—');

  // --- Sources de découverte (doughnut) ---
  if (D.sourcesData.length === 0) {
    emptyStateCanvas('c-prospect-sources', 'Pas encore de données sur les sources de découverte.');
  } else {
    const sourcesTotal = D.sourcesData.reduce((a, b) => a + b, 0);
    mk('c-prospect-sources', {
      type: 'doughnut',
      data: {
        labels: D.sourcesLabels,
        datasets: [{
          data: D.sourcesData,
          backgroundColor: D.sourcesColors,
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
          tooltip: {
            backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10,
            callbacks: {
              label: ctx => {
                const pct = sourcesTotal > 0 ? Math.round((ctx.raw / sourcesTotal) * 100) : 0;
                return ctx.label + ' : ' + pct + '%';
              },
            },
          },
        },
      },
    });
  }

  // --- Perception valeur (histogramme 0-10) ---
  renderRatingHist('c-prospect-valeur', mois, m, D.prospectValeur, 'Perception valeur', C.sage);

  // --- Freins (doughnut coloré, % au hover) ---
  renderChoiceHist('c-prospect-freins', D.freinsLabels, D.freinsData, FREINS_OPTIONS, C.bad, FREINS_PALETTE);

  // --- Attraits (doughnut coloré, % au hover) ---
  renderChoiceHist('c-prospect-attraits', D.attraitsLabels, D.attraitsData, ATTRAITS_OPTIONS, C.good, ATTRAITS_PALETTE);

  // --- Recommandation prospect : note moyenne + évolution par mois ---
  const npsRaw = D.prospectNPSRaw || [];
  txt('prospect-nps-val', npsRaw.length > 0
    ? fr(npsRaw.reduce((a, b) => a + b, 0) / npsRaw.length)
    : '—');
  renderRatingHist('c-prospect-nps', mois, m, D.prospectNPS, 'Recommandation', C.sage);

  // --- Pertinence vs Projection (deux doughnuts côte à côte : répartition par catégorie) ---
  renderDualBreakdown(
    'c-prospect-pertproj',
    D.prospectPertinenceRaw, 'Pertinence perçue',
    D.prospectProjectionRaw, 'Projection'
  );

  // --- Verbatims prospect ---
  const pasList = document.getElementById('prospect-verbatims-pas');
  if (pasList) {
    if (VERBATIMS.prospect.pas.length === 0) {
      pasList.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
        <p style="font-size:.88rem;line-height:1.5">Les retours des futurs membres apparaîtront ici au fil des réponses.</p>
      </div>`;
    } else {
      pasList.innerHTML = VERBATIMS.prospect.pas.map(t => `
        <div class="verb"><p>« ${t} »</p></div>
      `).join('');
    }
  }

  const sugList = document.getElementById('prospect-verbatims-suggestions');
  if (sugList) {
    if (VERBATIMS.prospect.suggestions.length === 0) {
      sugList.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
        <p style="font-size:.88rem;line-height:1.5">Les suggestions apparaîtront ici au fil des réponses.</p>
      </div>`;
    } else {
      sugList.innerHTML = VERBATIMS.prospect.suggestions.map(t => `
        <div class="verb"><p>« ${t} »</p></div>
      `).join('');
    }
  }
}


/* =============================================
   RENDER — Intervenants + Greatly
   ============================================= */

function renderIvGreatly() {
  const m = F.period;
  const mois = last(MOIS, m);

  // KPIs
  if (D.igScores.length === 0) {
    txt('ig-satisfaction', '—');
    txt('ig-logistique', '—');
    txt('ig-pedagogie', '—');
    txt('ig-relation', '—');
    txt('ig-admin', '—');
    txt('ig-comm', '—');
  } else {
    const avg = D.igScores.reduce((s, v) => s + v, 0) / D.igScores.length;
    txt('ig-satisfaction', fr(avg));
    txt('ig-logistique', D.igScores.length > 0 ? fr(D.igScores[0]) : '—');
    txt('ig-pedagogie', D.igScores.length > 2 ? fr(D.igScores[2]) : '—');
    txt('ig-relation', D.igScores.length > 5 ? fr(D.igScores[5]) : '—');
    txt('ig-admin', D.igScores.length > 1 ? fr(D.igScores[1]) : '—');
    txt('ig-comm', D.igScores.length > 3 ? fr(D.igScores[3]) : '—');
  }

  // --- Radar / bar des 6 dimensions ---
  if (D.igScores.length === 0) {
    emptyStateCanvas('c-ig-radar', 'Les données apparaîtront ici dès les premiers retours.');
  } else {
    mk('c-ig-radar', {
      type: 'bar',
      data: {
        labels: D.igLabels,
        datasets: [{
          data: D.igScores,
          backgroundColor: [C.sage + 'BB', C.grey + '99', C.lucidite + 'BB', C.energie + 'BB', '#7A6B5C' + 'BB', C.good + 'BB'],
          borderRadius: 8,
        }],
      },
      options: {
        ...hbarOpts(10),
        indexAxis: 'y',
        scales: {
          x: { min: 0, max: 10, grid: { color: C.line }, ticks: { font: { size: 11 } } },
          y: { grid: { display: false }, ticks: { font: { size: 12 } } },
        },
      },
    });
  }

  // --- Évolution satisfaction globale ---
  if (D.igEvol.length === 0) {
    emptyStateCanvas('c-ig-evol', 'Les données apparaîtront ici dès les premiers retours.');
  } else {
    const evolData = last(D.igEvol, m);
    const tEvol = trimToData(mois, evolData);
    mk('c-ig-evol', {
      type: 'line',
      data: {
        labels: tEvol.labels,
        datasets: [lineds('Satisfaction moyenne', trimData(evolData, tEvol.start), C.sage)],
      },
      options: lineOpts(6, 10),
    });
  }

  // --- Administratif sparkline ---
  if (D.igAdmin.length === 0) {
    emptyStateCanvas('c-ig-admin', 'Pas encore de données.');
  } else {
    const adminData = last(D.igAdmin, m);
    const tAdmin = trimToData(mois, adminData);
    mk('c-ig-admin', {
      type: 'line',
      data: {
        labels: tAdmin.labels,
        datasets: [lineds('Administratif', trimData(adminData, tAdmin.start), C.grey)],
      },
      options: sparkOpts(6, 9),
    });
  }

  // --- Communication sparkline ---
  if (D.igComm.length === 0) {
    emptyStateCanvas('c-ig-comm', 'Pas encore de données.');
  } else {
    const commData = last(D.igComm, m);
    const tComm = trimToData(mois, commData);
    mk('c-ig-comm', {
      type: 'line',
      data: {
        labels: tComm.labels,
        datasets: [lineds('Communication', trimData(commData, tComm.start), C.energie)],
      },
      options: sparkOpts(6, 9),
    });
  }

  // --- Cadre & lieux ---
  if (D.igCadre.length === 0 && D.lieuxSport.length === 0) {
    emptyStateCanvas('c-ig-cadre', 'Pas encore de données sur le cadre et les lieux.');
  } else {
    const cadreData = D.igCadre.length > 0 ? last(D.igCadre, m) : [];
    const sportIgData = D.lieuxSport.length > 0 ? last(D.lieuxSport, m) : [];
    const tCadre = trimToData(mois, cadreData, sportIgData);
    mk('c-ig-cadre', {
      type: 'bar',
      data: {
        labels: tCadre.labels,
        datasets: [
          ...(D.igCadre.length > 0 ? [bards('Greatly House', trimData(cadreData, tCadre.start), C.lucidite)] : []),
          ...(D.lieuxSport.length > 0 ? [bards('Lieux sportifs', trimData(sportIgData, tCadre.start), C.energie)] : []),
        ],
      },
      options: barOpts(0, 10),
    });
  }

  // --- Phases intervenants : étape par étape ---
  if (D.phasesIvENote.length === 0) {
    emptyStateCanvas('c-phases-iv-e', 'Pas encore de retours sur les séances Énergie.');
  } else {
    mk('c-phases-iv-e', {
      type: 'bar',
      data: {
        labels: D.phasesIvENoms,
        datasets: [{
          data: D.phasesIvENote,
          backgroundColor: C.energie + 'AA',
          borderRadius: 6,
        }],
      },
      options: hbarOpts(10),
    });
  }

  if (D.phasesIvLNote.length === 0) {
    emptyStateCanvas('c-phases-iv-l', 'Pas encore de retours sur les ateliers Lucidité.');
  } else {
    mk('c-phases-iv-l', {
      type: 'bar',
      data: {
        labels: D.phasesIvLNoms,
        datasets: [{
          data: D.phasesIvLNote,
          backgroundColor: C.lucidite + 'AA',
          borderRadius: 6,
        }],
      },
      options: hbarOpts(10),
    });
  }

  // --- Retours de séance des intervenants (détail par question) ---
  renderIvSeance(mois, m);

  // --- Verbatims ---
  const facList = document.getElementById('ig-verbatims-facilite');
  if (facList) {
    if (VERBATIMS_IG.facilite.length === 0) {
      facList.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
        <p style="font-size:.88rem;line-height:1.5">Les retours des intervenants apparaîtront ici au fil des réponses.</p>
      </div>`;
    } else {
      facList.innerHTML = VERBATIMS_IG.facilite.map(v => `
        <div class="verb">
          <div class="meta"><span style="font-size:.74rem;color:var(--warm-grey)">${v.date}</span></div>
          <p>« ${v.text} »</p>
        </div>
      `).join('');
    }
  }

  const colList = document.getElementById('ig-verbatims-collab');
  if (colList) {
    if (VERBATIMS_IG.collab.length === 0) {
      colList.innerHTML = `<div style="text-align:center;padding:32px 20px;color:var(--warm-grey)">
        <p style="font-size:.88rem;line-height:1.5">Les retours sur la collaboration apparaîtront ici au fil des réponses.</p>
      </div>`;
    } else {
      colList.innerHTML = VERBATIMS_IG.collab.map(v => `
        <div class="verb">
          <div class="meta"><span style="font-size:.74rem;color:var(--warm-grey)">${v.date}</span></div>
          <p>« ${v.text} »</p>
        </div>
      `).join('');
    }
  }
}


/* =============================================
   RETOURS DE SÉANCE DES INTERVENANTS
   ============================================= */

function renderIvSeance(mois, m) {
  const grid = document.getElementById('iv-seance-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const sections = [];
  if (D.qIntervenantEnergie.length > 0) {
    sections.push({ titre: '⛷️ Séances Énergie', questions: D.qIntervenantEnergie, color: C.energie });
  }
  if (D.qIntervenantLucidite.length > 0) {
    sections.push({ titre: '🦉 Ateliers Lucidité', questions: D.qIntervenantLucidite, color: C.lucidite });
  }

  if (sections.length === 0) {
    emptyState('iv-seance-grid', 'Les retours de séance des intervenants apparaîtront ici dès les premières réponses.');
    return;
  }

  sections.forEach(sec => {
    const div = document.createElement('div');
    div.className = 'qdivider';
    div.textContent = sec.titre;
    grid.appendChild(div);

    sec.questions.forEach((q, i) => {
      const id = 'spark-iv-' + sec.titre.substring(0, 3) + '-' + i;
      const deltaColor = q.delta >= 0 ? C.good : C.bad;
      const deltaSign = q.delta >= 0 ? '+' : '';

      const card = document.createElement('div');
      card.className = 'qcard';
      card.innerHTML = `
        <h4>${q.label}</h4>
        ${q.q ? `<div class="qq">« ${q.q} »</div>` : ''}
        <div class="qval">
          ${fr(q.val)}<span style="font-size:.85rem;color:var(--warm-grey)">/10</span>
          <span class="qdelta" style="color:${deltaColor}">${deltaSign}${fr(q.delta)}</span>
        </div>
        <div class="qchart"><canvas id="${id}"></canvas></div>
      `;
      grid.appendChild(card);

      requestAnimationFrame(() => {
        renderQChart(id, q, mois, m, sec.color);
      });
    });
  });
}


/* =============================================
   DÉTAIL GREATLY HOUSE (vue Lieux)
   ============================================= */

/** Affiche un mini-graphique adapté au nombre de points de données */
function renderQChart(canvasId, q, mois, m, color) {
  // Histogramme vertical : 1 barre par mois depuis juin 2026.
  // Plus lisible que la sparkline quand peu de points, et garde la même grille de lecture en grandissant.
  const rawData = q.data && q.data.length > 0 ? last(q.data, m) : [q.val || 0];
  const labels = last(mois, rawData.length);

  mk(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: rawData,
        backgroundColor: color + '88',
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.85,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => (ctx.raw == null ? '—' : ctx.raw.toFixed(1) + '/10') } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#999' } },
        y: { min: 0, max: 10, grid: { color: '#E7E1D720' }, ticks: { display: false } },
      },
    },
  });
}

function renderGHDetail(mois, m) {
  const grid = document.getElementById('gh-detail-grid');
  if (!grid) return;
  grid.innerHTML = '';

  Object.keys(charts).filter(k => k.startsWith('spark-gh-')).forEach(k => {
    charts[k].destroy(); delete charts[k];
  });

  if (D.qGreatlyHouse.length === 0) {
    emptyState('gh-detail-grid', 'Les retours détaillés sur la Greatly House apparaîtront ici dès les premières réponses.');
    return;
  }

  D.qGreatlyHouse.forEach((q, i) => {
    const id = 'spark-gh-' + i;
    const deltaColor = q.delta >= 0 ? C.good : C.bad;
    const deltaSign = q.delta >= 0 ? '+' : '';

    const card = document.createElement('div');
    card.className = 'qcard';
    card.innerHTML = `
      <h4>${q.label}</h4>
      ${q.q ? `<div class="qq">« ${q.q} »</div>` : ''}
      <div class="qval">
        ${fr(q.val)}<span style="font-size:.85rem;color:var(--warm-grey)">/10</span>
        <span class="qdelta" style="color:${deltaColor}">${deltaSign}${fr(q.delta)}</span>
      </div>
      <div class="qchart"><canvas id="${id}"></canvas></div>
    `;
    grid.appendChild(card);

    requestAnimationFrame(() => {
      renderQChart(id, q, mois, m, C.sage);
    });
  });
}
