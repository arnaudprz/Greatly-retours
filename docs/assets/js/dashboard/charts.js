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

/** Extraire les m derniers éléments d'un tableau */
function last(arr, m) {
  if (!arr || arr.length === 0) return [];
  return arr.slice(arr.length - m);
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

const MOIS = ['Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.', 'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin'];

const D = {
  // --- NPS par mois ---
  npsEnergie:   [],
  npsLucidite:  [],
  npsGlobal:    [],

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

/** Dataset pour une ligne */
function lineds(label, data, color, dashed) {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: color + '18',
    borderWidth: 2.5,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: 0.35,
    fill: false,
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
  const isLieux = F.type === 'lieux';
  const isProspect = F.type === 'prospect';
  const isIvGreatly = F.type === 'ivgreatly';
  const isEnergie = F.type === 'energie';
  const isLucidite = F.type === 'lucidite';
  const isTous = F.type === 'tous';
  const isStandard = !isLieux && !isProspect && !isIvGreatly;

  // Basculer entre les sections
  show('standard-section', isStandard);
  show('lieux-section', isLieux);
  show('prospect-section', isProspect);
  show('ivgreatly-section', isIvGreatly);

  // Filtres secondaires
  show('nav-act-wrap', isStandard);
  show('f-who', true);
  show('f-period', true);

  // Masquer verbatims/alertes/feedbacks hors vue standard
  if (!isStandard) {
    show('card-verbatims', false);
    show('card-feedbacks', false);
    show('card-alerts', false);
  }

  // Sous-sections selon le filtre actif
  if (isStandard) renderStandard(isTous, isEnergie, isLucidite);
  if (isLieux) renderLieux();
  if (isProspect) renderProspect();
  if (isIvGreatly) renderIvGreatly();
}


/* =============================================
   VUE STANDARD (Tous / Énergie / Lucidité)
   ============================================= */

function renderStandard(isTous, isEnergie, isLucidite) {
  const m = F.period;
  const mois = last(MOIS, m);
  const isMembres = F.who === 'membres';
  const isIntervenants = F.who === 'intervenants';

  // --- Masquer/afficher les cartes selon le filtre ---
  show('card-energie',   (isTous || isEnergie) && !isIntervenants);
  show('card-ateliers',  (isTous || isLucidite) && !isIntervenants);
  show('card-sports',    (isTous || isEnergie) && !isIntervenants && F.act === 'tous');
  show('card-phases-e',  (isTous || isEnergie) && !isIntervenants);
  show('card-phases-l',  (isTous || isLucidite) && !isIntervenants);
  show('card-lieux',     isTous && !isIntervenants);
  show('kpi-ea',         (isTous || isEnergie) && !isIntervenants);
  show('kpi-cl',         (isTous || isLucidite) && !isIntervenants);
  show('card-perint',    (isTous || isEnergie) && !isIntervenants);
  show('card-verbatims', !isIntervenants);
  show('card-alerts',    !isMembres);

  // --- KPIs ---
  renderKPIs(isTous, isEnergie, isLucidite, m);

  // --- NPS évolution ---
  renderNPS(mois, m, isTous, isEnergie, isLucidite);

  // --- Énergie avant/après ---
  if (isTous || isEnergie) renderEnergie(mois, m);

  // --- Répartition NPS ---
  renderRepart(mois, m);

  // --- NPS par atelier Lucidité ---
  if (isTous || isLucidite) renderAteliers();

  // --- Yoga vs Padel ---
  if (isTous || isEnergie) renderSports();

  // --- Étapes Énergie ---
  if (isTous || isEnergie) renderPhasesE();

  // --- Étapes Lucidité ---
  if (isTous || isLucidite) renderPhasesL();

  // --- Détail par question ---
  renderDetail(isTous, isEnergie, isLucidite, mois, m);

  // --- Par intervenant ---
  renderCoach(mois, m);

  // --- Les lieux (carte synthèse) ---
  if (isTous) renderLieuxSynthese();

  // --- Verbatims ---
  if (!isIntervenants) renderVerbatims(isTous, isEnergie, isLucidite);

  // --- Feedbacks écrits ---
  renderFeedbacksEcrits();

  // --- Alertes ---
  if (!isMembres) renderAlertes();
}


/* ---- KPIs ---- */
function renderKPIs(isTous, isEnergie, isLucidite, m) {
  // NPS
  const npsArr = isEnergie ? D.npsEnergie : isLucidite ? D.npsLucidite : D.npsGlobal;
  const npsVal = last(npsArr, m);
  if (npsVal.length === 0) {
    txt('k-nps', '—');
    txt('k-nps-d', '');
  } else {
    const npsCurr = npsVal[npsVal.length - 1];
    const npsPrev = npsVal[0];
    const npsDelta = npsCurr - npsPrev;
    txt('k-nps', '+' + npsCurr);
    txt('k-nps-d', (npsDelta >= 0 ? '+' : '') + npsDelta + ' pts');
    const npsD = document.getElementById('k-nps-d');
    if (npsD) {
      npsD.className = npsDelta >= 0 ? 'up' : 'down';
      npsD.style.color = npsDelta >= 0 ? C.good : C.bad;
    }
  }

  // Énergie avant → après
  if (isTous || isEnergie) {
    const avArr = last(D.energieAvant, m);
    const apArr = last(D.energieApres, m);
    if (avArr.length === 0 || apArr.length === 0) {
      txt('k-ea', '—');
      txt('k-ea-d', '');
    } else {
      const avMoy = avArr.reduce((a, b) => a + b, 0) / avArr.length;
      const apMoy = apArr.reduce((a, b) => a + b, 0) / apArr.length;
      txt('k-ea', fr(avMoy) + ' → ' + fr(apMoy));
      txt('k-ea-d', '+' + fr(apMoy - avMoy));
    }
  }

  // Recul & clarté
  if (isTous || isLucidite) {
    if (D.qLucidite.length === 0) {
      txt('k-cl', '—');
    } else {
      const clArr = last(D.qLucidite[0].data, m);
      if (clArr.length === 0) {
        txt('k-cl', '—');
      } else {
        const clMoy = clArr[clArr.length - 1];
        txt('k-cl', fr(clMoy));
      }
    }
  }

  // Taux de réponse
  txt('k-tx', '—');
  txt('k-tx-sub', 'Pas encore de réponses');

  // Adapter les labels KPI selon le filtre
  const kpiNpsEl = document.querySelector('.k-nps .lab');
  if (kpiNpsEl) {
    kpiNpsEl.textContent = isEnergie ? 'Recommandation Énergie' : isLucidite ? 'Recommandation Lucidité' : 'Recommandation';
  }

  // Adapter le KPI 2 selon filtre
  const kpiEaLab = document.querySelector('#kpi-ea .lab');
  if (kpiEaLab && isEnergie) kpiEaLab.textContent = 'Énergie avant → après';

  // Adapter le KPI 3 selon filtre
  const kpiClLab = document.querySelector('#kpi-cl .lab');
  if (kpiClLab) {
    if (isEnergie) kpiClLab.textContent = 'Plaisir à bouger';
    else if (isLucidite) kpiClLab.textContent = 'Qualité des échanges';
    else kpiClLab.textContent = 'Recul & clarté (Lucidité)';
  }
  if (isEnergie) {
    if (D.qEnergie.length > 1) {
      const plArr = last(D.qEnergie[1].data, F.period);
      if (plArr.length > 0) txt('k-cl', fr(plArr[plArr.length - 1]));
      else txt('k-cl', '—');
    } else {
      txt('k-cl', '—');
    }
  } else if (isLucidite) {
    if (D.qLucidite.length > 1) {
      const qeArr = last(D.qLucidite[1].data, F.period);
      if (qeArr.length > 0) txt('k-cl', fr(qeArr[qeArr.length - 1]));
      else txt('k-cl', '—');
    } else {
      txt('k-cl', '—');
    }
  }
}


/* ---- NPS évolution ---- */
function renderNPS(mois, m, isTous, isEnergie, isLucidite) {
  const hasEnergie = D.npsEnergie.length > 0;
  const hasLucidite = D.npsLucidite.length > 0;

  if (!hasEnergie && !hasLucidite) {
    emptyStateCanvas('c-nps', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }

  const datasets = [];
  if ((isTous || isEnergie) && hasEnergie) {
    datasets.push(lineds('Énergie', last(D.npsEnergie, m), C.energie));
  }
  if ((isTous || isLucidite) && hasLucidite) {
    datasets.push(lineds('Lucidité', last(D.npsLucidite, m), C.lucidite));
  }
  if (isTous && D.npsGlobal.length > 0) {
    datasets.push(lineds('Global', last(D.npsGlobal, m), C.sage, true));
  }
  if (datasets.length === 0) {
    emptyStateCanvas('c-nps', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-nps', {
    type: 'line',
    data: { labels: mois, datasets },
    options: lineOpts(30, 100),
  });
}


/* ---- Énergie avant/après ---- */
function renderEnergie(mois, m) {
  if (D.energieAvant.length === 0) {
    emptyStateCanvas('c-energie', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-energie', {
    type: 'line',
    data: {
      labels: mois,
      datasets: [
        lineds('Avant séance', last(D.energieAvant, m), C.bad),
        lineds('Après séance', last(D.energieApres, m), C.good),
      ],
    },
    options: lineOpts(2, 10),
  });
}


/* ---- Répartition NPS ---- */
function renderRepart(mois, m) {
  if (D.npsPromo.length === 0) {
    emptyStateCanvas('c-repart', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  mk('c-repart', {
    type: 'bar',
    data: {
      labels: mois,
      datasets: [
        { label: 'Promoteurs (9-10)', data: last(D.npsPromo, m), backgroundColor: C.good + 'CC', borderRadius: 3 },
        { label: 'Passifs (7-8)', data: last(D.npsPassif, m), backgroundColor: C.mid + 'CC', borderRadius: 3 },
        { label: 'Détracteurs (0-6)', data: last(D.npsDetrac, m), backgroundColor: C.bad + 'CC', borderRadius: 3 },
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

      // Sparkline
      if (q.data && q.data.length > 0) {
        requestAnimationFrame(() => {
          mk(id, {
            type: 'line',
            data: {
              labels: mois,
              datasets: [{
                data: last(q.data, m),
                borderColor: sec.color,
                backgroundColor: sec.color + '15',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
              }],
            },
            options: sparkOpts(),
          });
        });
      }
    });
  });
}


/* ---- Par intervenant ---- */
function renderCoach(mois, m) {
  const data = F.coach === 'padel' ? D.coachPadel : D.coachYoga;
  if (data.length === 0) {
    emptyStateCanvas('c-coach', 'Les données apparaîtront ici dès les premiers retours.');
    return;
  }
  const color = F.coach === 'padel' ? C.energie : C.lucidite;
  const label = F.coach === 'padel' ? 'Coach Padel — Note moyenne' : 'Coach Yoga — Note moyenne';

  mk('c-coach', {
    type: 'line',
    data: {
      labels: mois,
      datasets: [lineds(label, last(data, m), color)],
    },
    options: lineOpts(6, 10),
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
    mk('c-lieux-house', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [{
          data: last(D.lieuxHouse, m),
          borderColor: C.sage,
          backgroundColor: C.sage + '18',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.35,
          fill: true,
        }],
      },
      options: {
        ...lineOpts(7, 10),
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10 } },
      },
    });
  }

  // Lieux sportifs mini line
  if (D.lieuxSport.length === 0) {
    emptyStateCanvas('c-lieux-sport', 'Pas encore de retours sur les lieux sportifs.');
  } else {
    mk('c-lieux-sport', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [{
          data: last(D.lieuxSport, m),
          borderColor: C.energie,
          backgroundColor: C.energie + '18',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.35,
          fill: true,
        }],
      },
      options: {
        ...lineOpts(6, 10),
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1A1A', cornerRadius: 10, padding: 10 } },
      },
    });
  }

  // Évolution par lieu
  if (D.lieuxHouse.length === 0 && D.lieuxSport.length === 0) {
    emptyStateCanvas('c-lieux-evol', 'Pas encore de données d\'évolution.');
  } else {
    mk('c-lieux-evol', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [
          ...(D.lieuxHouse.length > 0 ? [lineds('Greatly House', last(D.lieuxHouse, m), C.sage)] : []),
          ...(D.lieuxSport.length > 0 ? [lineds('Lieux sportifs', last(D.lieuxSport, m), C.energie)] : []),
        ],
      },
      options: lineOpts(6, 10),
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

function renderProspect() {
  const m = F.period;
  const mois = last(MOIS, m);

  // --- KPIs ---
  const npsArr = last(D.prospectNPS, m);
  if (npsArr.length === 0) {
    txt('pk-nps', '—');
  } else {
    txt('pk-nps', '+' + npsArr[npsArr.length - 1]);
  }

  const impArr = last(D.prospectImpression, m);
  txt('pk-impression', impArr.length > 0 ? fr(impArr[impArr.length - 1]) : '—');

  const clArr = last(D.prospectClarte, m);
  txt('pk-clarte', clArr.length > 0 ? fr(clArr[clArr.length - 1]) : '—');

  const prArr = last(D.prospectProjection, m);
  txt('pk-projection', prArr.length > 0 ? fr(prArr[prArr.length - 1]) : '—');

  // --- Sources de découverte (doughnut) ---
  if (D.sourcesData.length === 0) {
    emptyStateCanvas('c-prospect-sources', 'Pas encore de données sur les sources de découverte.');
  } else {
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
            callbacks: { label: ctx => ctx.label + ' : ' + ctx.raw + '%' },
          },
        },
      },
    });
  }

  // --- Perception valeur (line) ---
  if (D.prospectValeur.length === 0) {
    emptyStateCanvas('c-prospect-valeur', 'Les données apparaîtront ici dès les premiers retours.');
  } else {
    mk('c-prospect-valeur', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [lineds('Perception valeur', last(D.prospectValeur, m), C.sage)],
      },
      options: lineOpts(5, 10),
    });
  }

  // --- Freins (horizontal bar) ---
  if (D.freinsData.length === 0) {
    emptyStateCanvas('c-prospect-freins', 'Pas encore de données sur les freins.');
  } else {
    mk('c-prospect-freins', {
      type: 'bar',
      data: {
        labels: D.freinsLabels,
        datasets: [{
          data: D.freinsData,
          backgroundColor: C.bad + 'AA',
          borderRadius: 6,
        }],
      },
      options: {
        ...hbarOpts(50),
        scales: {
          ...hbarOpts(50).scales,
          x: { ...hbarOpts(50).scales.x, ticks: { callback: v => v + '%', font: { size: 11 } } },
        },
      },
    });
  }

  // --- Attraits (horizontal bar) ---
  if (D.attraitsData.length === 0) {
    emptyStateCanvas('c-prospect-attraits', 'Pas encore de données sur les attraits.');
  } else {
    mk('c-prospect-attraits', {
      type: 'bar',
      data: {
        labels: D.attraitsLabels,
        datasets: [{
          data: D.attraitsData,
          backgroundColor: C.good + 'AA',
          borderRadius: 6,
        }],
      },
      options: {
        ...hbarOpts(60),
        scales: {
          ...hbarOpts(60).scales,
          x: { ...hbarOpts(60).scales.x, ticks: { callback: v => v + '%', font: { size: 11 } } },
        },
      },
    });
  }

  // --- NPS prospect (line) ---
  if (D.prospectNPS.length === 0) {
    emptyStateCanvas('c-prospect-nps', 'Les données apparaîtront ici dès les premiers retours.');
  } else {
    mk('c-prospect-nps', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [lineds('Recommandation prospect', last(D.prospectNPS, m), '#8B6E4E')],
      },
      options: lineOpts(20, 90),
    });
  }

  // --- Pertinence vs Projection ---
  if (D.prospectPertinence.length === 0 && D.prospectProjection.length === 0) {
    emptyStateCanvas('c-prospect-pertproj', 'Les données apparaîtront ici dès les premiers retours.');
  } else {
    mk('c-prospect-pertproj', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [
          ...(D.prospectPertinence.length > 0 ? [lineds('Pertinence perçue', last(D.prospectPertinence, m), C.sage)] : []),
          ...(D.prospectProjection.length > 0 ? [lineds('Projection', last(D.prospectProjection, m), '#8B6E4E')] : []),
        ],
      },
      options: lineOpts(4, 10),
    });
  }

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
    mk('c-ig-evol', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [lineds('Satisfaction moyenne', last(D.igEvol, m), C.sage)],
      },
      options: lineOpts(6, 10),
    });
  }

  // --- Administratif sparkline ---
  if (D.igAdmin.length === 0) {
    emptyStateCanvas('c-ig-admin', 'Pas encore de données.');
  } else {
    mk('c-ig-admin', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [lineds('Administratif', last(D.igAdmin, m), C.grey)],
      },
      options: sparkOpts(6, 9),
    });
  }

  // --- Communication sparkline ---
  if (D.igComm.length === 0) {
    emptyStateCanvas('c-ig-comm', 'Pas encore de données.');
  } else {
    mk('c-ig-comm', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [lineds('Communication', last(D.igComm, m), C.energie)],
      },
      options: sparkOpts(6, 9),
    });
  }

  // --- Cadre & lieux ---
  if (D.igCadre.length === 0 && D.lieuxSport.length === 0) {
    emptyStateCanvas('c-ig-cadre', 'Pas encore de données sur le cadre et les lieux.');
  } else {
    mk('c-ig-cadre', {
      type: 'line',
      data: {
        labels: mois,
        datasets: [
          ...(D.igCadre.length > 0 ? [lineds('Greatly House', last(D.igCadre, m), C.lucidite)] : []),
          ...(D.lieuxSport.length > 0 ? [lineds('Lieux sportifs', last(D.lieuxSport, m), C.energie)] : []),
        ],
      },
      options: lineOpts(6, 10),
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

      if (q.data && q.data.length > 0) {
        requestAnimationFrame(() => {
          mk(id, {
            type: 'line',
            data: {
              labels: mois,
              datasets: [{
                data: last(q.data, m),
                borderColor: sec.color,
                backgroundColor: sec.color + '15',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
              }],
            },
            options: sparkOpts(),
          });
        });
      }
    });
  });
}


/* =============================================
   DÉTAIL GREATLY HOUSE (vue Lieux)
   ============================================= */

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

    if (q.data && q.data.length > 0) {
      requestAnimationFrame(() => {
        mk(id, {
          type: 'line',
          data: {
            labels: mois,
            datasets: [{
              data: last(q.data, m),
              borderColor: C.sage,
              backgroundColor: C.sage + '15',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            }],
          },
          options: sparkOpts(),
        });
      });
    }
  });
}
