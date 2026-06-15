/* ============================================
   Greatly — Vos retours · Graphiques Chart.js
   Données de démonstration + render complet
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

/** Formater un nombre avec virgule */
function fr(n) {
  return String(n.toFixed(1)).replace('.', ',');
}

/** Extraire les m derniers éléments d'un tableau */
function last(arr, m) {
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


/* =============================================
   DONNÉES FICTIVES (12 mois : Juil. 2025 → Juin 2026)
   ============================================= */

const MOIS = ['Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.', 'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin'];

const D = {
  // --- NPS par mois ---
  npsEnergie:   [62, 58, 65, 68, 72, 70, 74, 71, 76, 78, 80, 82],
  npsLucidite:  [55, 60, 58, 63, 66, 64, 68, 70, 72, 75, 73, 77],
  npsGlobal:    [58, 59, 62, 66, 69, 67, 71, 71, 74, 77, 77, 80],

  // --- Énergie avant/après (0-10) ---
  energieAvant: [4.2, 4.5, 4.1, 4.8, 4.3, 4.6, 4.4, 4.7, 4.2, 4.5, 4.3, 4.6],
  energieApres: [7.8, 8.0, 7.6, 8.2, 8.1, 8.3, 8.0, 8.4, 8.2, 8.5, 8.3, 8.6],

  // --- Répartition NPS par mois (promoteurs, passifs, détracteurs) ---
  npsPromo:     [52, 50, 55, 58, 62, 60, 64, 62, 66, 68, 70, 72],
  npsPassif:    [30, 32, 28, 27, 25, 28, 24, 26, 23, 22, 20, 20],
  npsDetrac:    [18, 18, 17, 15, 13, 12, 12, 12, 11, 10, 10,  8],

  // --- NPS par atelier Lucidité ---
  ateliersNoms: ['1. Miroir', '2. Gouvernail', '3. Compas', '4. Ancre', '5. Boussole', '6. Horizon', 'Bilan'],
  ateliersNPS:  [72, 78, 68, 80, 74, 82, 85],

  // --- Yoga vs Padel ---
  sportsNoms: ['Yoga', 'Padel'],
  sportsNPS:  [78, 74],
  sportsNote: [8.4, 8.1],

  // --- Séance Énergie étape par étape ---
  phasesENoms:  ['Accueil & briefing', 'Échauffement', 'Corps de séance', 'Retour au calme', 'Temps d\'échange'],
  phasesENote:  [8.6, 7.9, 8.5, 8.8, 8.2],

  // --- Rencontre Lucidité étape par étape ---
  phasesLNoms:  ['Accueil Greatly House', 'Ice-breaker', 'Contenu / atelier', 'Échanges en groupe', 'Clôture & élan'],
  phasesLNote:  [9.0, 7.8, 8.4, 8.7, 8.1],

  // --- Détail par question Énergie ---
  qEnergie: [
    { label: 'Rythme de la séance',      val: 8.3, delta: +0.4, data: [7.5, 7.8, 7.9, 8.0, 8.1, 8.0, 8.2, 8.1, 8.2, 8.3, 8.2, 8.3] },
    { label: 'Plaisir à bouger',          val: 8.6, delta: +0.2, data: [8.0, 8.1, 8.2, 8.3, 8.4, 8.3, 8.4, 8.5, 8.5, 8.6, 8.5, 8.6] },
    { label: 'Lieu & cadre (sport)',       val: 7.9, delta: -0.1, data: [8.0, 7.8, 8.0, 7.9, 7.8, 8.0, 7.9, 7.8, 8.0, 7.9, 8.0, 7.9] },
    { label: 'Qualité de l\'intervenant',  val: 8.8, delta: +0.3, data: [8.2, 8.3, 8.4, 8.5, 8.5, 8.6, 8.6, 8.7, 8.7, 8.8, 8.7, 8.8] },
  ],

  // --- Détail par question Lucidité ---
  qLucidite: [
    { label: 'Recul & clarté',            val: 8.1, delta: +0.5, data: [7.2, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.8, 7.9, 8.0, 8.0, 8.1] },
    { label: 'Qualité des échanges',      val: 8.5, delta: +0.3, data: [7.8, 7.9, 8.0, 8.1, 8.2, 8.2, 8.3, 8.3, 8.4, 8.4, 8.5, 8.5] },
    { label: 'Outils & méthodes',         val: 7.7, delta: +0.2, data: [7.2, 7.3, 7.3, 7.4, 7.5, 7.4, 7.5, 7.6, 7.6, 7.7, 7.6, 7.7] },
    { label: 'Élan après la rencontre',   val: 8.0, delta: +0.4, data: [7.2, 7.4, 7.4, 7.5, 7.6, 7.7, 7.7, 7.8, 7.8, 7.9, 7.9, 8.0] },
    { label: 'Greatly House (cadre)',     val: 8.9, delta: +0.1, data: [8.5, 8.6, 8.6, 8.7, 8.7, 8.8, 8.8, 8.8, 8.9, 8.9, 8.8, 8.9] },
  ],

  // --- Par intervenant (note moyenne par mois) ---
  coachYoga:  [8.2, 8.3, 8.1, 8.4, 8.5, 8.4, 8.6, 8.5, 8.7, 8.6, 8.8, 8.7],
  coachPadel: [7.9, 8.0, 8.1, 8.0, 8.2, 8.1, 8.3, 8.2, 8.4, 8.3, 8.5, 8.4],

  // --- Lieux (note 0-10) ---
  lieuxNoms:   ['Greatly House', 'Studio Yoga (Lille)', 'Club Padel (Villeneuve)'],
  lieuxNotes:  [8.9, 7.8, 7.6],
  lieuxHouse:  [8.4, 8.5, 8.5, 8.6, 8.7, 8.7, 8.8, 8.8, 8.9, 8.9, 8.8, 8.9],
  lieuxSport:  [7.5, 7.6, 7.5, 7.7, 7.6, 7.8, 7.7, 7.8, 7.7, 7.9, 7.8, 7.7],

  // --- Prospect ---
  prospectNPS:        [45, 48, 52, 50, 55, 58, 60, 62, 58, 65, 63, 68],
  prospectImpression: [7.2, 7.4, 7.5, 7.6, 7.8, 7.7, 8.0, 7.9, 8.1, 8.0, 8.2, 8.3],
  prospectClarte:     [6.8, 7.0, 7.2, 7.1, 7.4, 7.5, 7.6, 7.8, 7.7, 7.9, 8.0, 8.1],
  prospectProjection: [5.8, 6.0, 6.2, 6.4, 6.5, 6.8, 7.0, 6.9, 7.2, 7.1, 7.4, 7.5],
  prospectPertinence: [7.0, 7.2, 7.3, 7.5, 7.6, 7.8, 7.9, 8.0, 8.1, 8.0, 8.2, 8.3],

  // Sources de découverte (prospect)
  sourcesLabels: ['Bouche-à-oreille', 'LinkedIn', 'Site web', 'Événement', 'Autre'],
  sourcesData:   [38, 24, 18, 14, 6],
  sourcesColors: ['#6B7D5C', '#C0814E', '#4F7C82', '#8B6E4E', '#E7E1D7'],

  // Freins (prospect)
  freinsLabels: ['Prix / investissement', 'Manque de temps', 'Pas assez d\'info', 'Distance / logistique', 'Doute sur la valeur'],
  freinsData:   [42, 28, 18, 15, 12],

  // Attraits (prospect)
  attraitsLabels: ['Approche corps + esprit', 'Réseau de dirigeants', 'Cadre intimiste', 'Accompagnement sur-mesure', 'Greatly House'],
  attraitsData:   [48, 35, 30, 26, 22],
};


/* =============================================
   VERBATIMS & ALERTES (données fictives)
   ============================================= */

const VERBATIMS = {
  energie: [
    { date: '12 juin 2026', tag: 'Yoga', text: 'La séance de ce matin m\'a remis d\'aplomb pour la journée. Le format court est parfait pour ne pas culpabiliser de s\'absenter du bureau.' },
    { date: '9 juin 2026', tag: 'Padel', text: 'Excellente ambiance, on sent que le groupe se soude de séance en séance. Le coach adapte bien le niveau.' },
    { date: '3 juin 2026', tag: 'Yoga', text: 'J\'arrive avec la tête pleine et je repars avec un vrai calme intérieur. Le lieu est top, bien situé.' },
    { date: '28 mai 2026', tag: 'Padel', text: 'Le padel c\'est le moment où on décroche vraiment. J\'aurais juste aimé un vestiaire un peu mieux équipé.' },
    { date: '22 mai 2026', tag: 'Yoga', text: 'Je n\'aurais jamais fait de yoga seul. Le fait que ce soit intégré au programme change tout.' },
  ],
  lucidite: [
    { date: '10 juin 2026', tag: 'Atelier 5', text: 'L\'exercice sur la posture de leader m\'a fait prendre conscience de certains angles morts. Très utile.' },
    { date: '5 juin 2026', tag: 'Atelier 4', text: 'Les échanges avec les autres dirigeants sont d\'une richesse incroyable. On ne trouve ça nulle part ailleurs.' },
    { date: '30 mai 2026', tag: 'Atelier 5', text: 'La Greatly House crée une atmosphère qui facilite la prise de recul. On se sent en confiance pour partager.' },
    { date: '20 mai 2026', tag: 'Atelier 3', text: 'J\'ai enfin mis des mots sur ce que je ressentais comme dirigeant. L\'outil compas est très éclairant.' },
    { date: '15 mai 2026', tag: 'Atelier 4', text: 'Rencontre intense et bienveillante. Je repars avec un vrai élan pour les semaines à venir.' },
  ],
  prospect: {
    pas: [
      'Pouvoir assister à une séance découverte avant de m\'engager.',
      'Un échange individuel avec Arnaud pour comprendre comment le programme s\'adapte à ma situation.',
      'Voir des témoignages vidéo de membres actuels.',
      'Une offre trimestrielle pour tester sans engagement long.',
      'Savoir qu\'il y a d\'autres dirigeants de mon secteur dans le groupe.',
    ],
    suggestions: [
      'Rendre l\'offre plus lisible sur le site, j\'ai dû chercher pour comprendre le programme.',
      'Proposer un format hybride avec quelques sessions en visio pour les semaines chargées.',
      'Afficher plus clairement le calendrier des séances.',
      'Un petit livret de présentation PDF à partager avec mon associé.',
      'Plus de contenu sur LinkedIn pour montrer l\'ambiance du groupe.',
    ],
  },
  lieux: [
    { date: '11 juin 2026', lieu: 'Greatly House', text: 'Le cadre est exceptionnel. On sent que chaque détail a été pensé pour favoriser les échanges.' },
    { date: '8 juin 2026', lieu: 'Studio Yoga', text: 'Salle agréable et bien chauffée. Petit bémol sur le parking qui est parfois complet.' },
    { date: '4 juin 2026', lieu: 'Club Padel', text: 'Les terrains sont en bon état. L\'accès est facile depuis la métropole. Vestiaires corrects.' },
    { date: '28 mai 2026', lieu: 'Greatly House', text: 'L\'atmosphère de la maison met tout le monde à l\'aise. Le café d\'accueil est un vrai plus.' },
    { date: '21 mai 2026', lieu: 'Studio Yoga', text: 'Espace calme et lumineux. Idéal pour déconnecter. Un peu juste en places quand on est 10.' },
  ],
};

const ALERTES = [
  { ico: '⚠️', titre: 'Vestiaires club padel', text: 'Plusieurs retours négatifs sur la propreté des vestiaires depuis mars. À remonter au club.', severity: 'mid' },
  { ico: '📉', titre: 'Énergie avant en baisse', text: 'L\'énergie déclarée avant séance baisse légèrement en mai. Possible signe de fatigue saisonnière.', severity: 'low' },
  { ico: '💬', titre: 'Demande de format plus long', text: '3 membres ont mentionné qu\'ils aimeraient des séances yoga de 1h15 au lieu d\'1h.', severity: 'info' },
  { ico: '🔔', titre: 'Atelier 3 — score en retrait', text: 'Le NPS de l\'atelier Compas est en retrait par rapport aux autres. Voir si le contenu doit évoluer.', severity: 'mid' },
];


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
  const isEnergie = F.type === 'energie';
  const isLucidite = F.type === 'lucidite';
  const isTous = F.type === 'tous';
  const isStandard = !isLieux && !isProspect;

  // Basculer entre les trois sections
  show('standard-section', isStandard);
  show('lieux-section', isLieux);
  show('prospect-section', isProspect);

  // Filtres secondaires
  show('f-act', isStandard);
  show('f-who', isStandard);
  show('f-period', true);

  // Verbatims et alertes membres
  show('card-verbatims', isStandard);
  show('card-alerts', isStandard);

  // Sous-sections selon le filtre actif
  if (isStandard) renderStandard(isTous, isEnergie, isLucidite);
  if (isLieux) renderLieux();
  if (isProspect) renderProspect();
}


/* =============================================
   VUE STANDARD (Tous / Énergie / Lucidité)
   ============================================= */

function renderStandard(isTous, isEnergie, isLucidite) {
  const m = F.period;
  const mois = last(MOIS, m);

  // --- Masquer/afficher les cartes selon le filtre ---
  show('card-energie',   isTous || isEnergie);
  show('card-ateliers',  isTous || isLucidite);
  show('card-sports',    isTous || isEnergie);
  show('card-phases-e',  isTous || isEnergie);
  show('card-phases-l',  isTous || isLucidite);
  show('card-lieux',     isTous);
  show('kpi-ea',         isTous || isEnergie);
  show('kpi-cl',         isTous || isLucidite);

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
  renderVerbatims(isTous, isEnergie, isLucidite);

  // --- Alertes ---
  renderAlertes();
}


/* ---- KPIs ---- */
function renderKPIs(isTous, isEnergie, isLucidite, m) {
  // NPS
  const npsArr = isEnergie ? D.npsEnergie : isLucidite ? D.npsLucidite : D.npsGlobal;
  const npsVal = last(npsArr, m);
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

  // Énergie avant → après
  if (isTous || isEnergie) {
    const avArr = last(D.energieAvant, m);
    const apArr = last(D.energieApres, m);
    const avMoy = avArr.reduce((a, b) => a + b) / avArr.length;
    const apMoy = apArr.reduce((a, b) => a + b) / apArr.length;
    txt('k-ea', fr(avMoy) + ' → ' + fr(apMoy));
    txt('k-ea-d', '+' + fr(apMoy - avMoy));
  }

  // Recul & clarté
  if (isTous || isLucidite) {
    const clArr = last(D.qLucidite[0].data, m);
    const clMoy = clArr[clArr.length - 1];
    txt('k-cl', fr(clMoy));
  }

  // Taux de réponse
  const tx = isEnergie ? 76 : isLucidite ? 82 : 78;
  txt('k-tx', tx);
  txt('k-tx-sub', isEnergie ? '142 réponses sur 187 envois' : isLucidite ? '98 réponses sur 120 envois' : '240 réponses sur 307 envois');

  // Adapter les labels KPI selon le filtre
  const kpiNpsEl = document.querySelector('.k-nps .lab');
  if (kpiNpsEl) {
    kpiNpsEl.textContent = isEnergie ? 'NPS Énergie' : isLucidite ? 'NPS Lucidité' : 'NPS global';
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
    const plArr = last(D.qEnergie[1].data, F.period);
    txt('k-cl', fr(plArr[plArr.length - 1]));
  } else if (isLucidite) {
    const qeArr = last(D.qLucidite[1].data, F.period);
    txt('k-cl', fr(qeArr[qeArr.length - 1]));
  }
}


/* ---- NPS évolution ---- */
function renderNPS(mois, m, isTous, isEnergie, isLucidite) {
  const datasets = [];
  if (isTous || isEnergie) {
    datasets.push(lineds('Énergie', last(D.npsEnergie, m), C.energie));
  }
  if (isTous || isLucidite) {
    datasets.push(lineds('Lucidité', last(D.npsLucidite, m), C.lucidite));
  }
  if (isTous) {
    datasets.push(lineds('Global', last(D.npsGlobal, m), C.sage, true));
  }
  mk('c-nps', {
    type: 'line',
    data: { labels: mois, datasets },
    options: lineOpts(30, 100),
  });
}


/* ---- Énergie avant/après ---- */
function renderEnergie(mois, m) {
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
  mk('c-ateliers', {
    type: 'bar',
    data: {
      labels: D.ateliersNoms,
      datasets: [{
        label: 'NPS',
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
  mk('c-sports', {
    type: 'bar',
    data: {
      labels: D.sportsNoms,
      datasets: [
        { label: 'NPS', data: D.sportsNPS, backgroundColor: [C.lucidite + 'CC', C.energie + 'CC'], borderRadius: 6 },
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
  if (isTous || isEnergie) {
    sections.push({ titre: '⛷️ Parcours Énergie', questions: D.qEnergie, color: C.energie });
  }
  if (isTous || isLucidite) {
    sections.push({ titre: '🦉 Parcours Lucidité', questions: D.qLucidite, color: C.lucidite });
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
        <div class="qval">
          ${fr(q.val)}<span style="font-size:.85rem;color:var(--warm-grey)">/10</span>
          <span class="qdelta" style="color:${deltaColor}">${deltaSign}${fr(q.delta)}</span>
          <span class="qn">n=${Math.floor(18 + Math.random() * 30)}</span>
        </div>
        <div class="qchart"><canvas id="${id}"></canvas></div>
      `;
      grid.appendChild(card);

      // Sparkline
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
    });
  });
}


/* ---- Par intervenant ---- */
function renderCoach(mois, m) {
  const data = F.coach === 'padel' ? D.coachPadel : D.coachYoga;
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

  // Popup détail
  const detail = document.getElementById('verbatims-detail');
  if (detail) {
    const all = [...VERBATIMS.energie, ...VERBATIMS.lucidite];
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


/* ---- Alertes ---- */
function renderAlertes() {
  const list = document.getElementById('alerts-list');
  if (!list) return;

  list.innerHTML = ALERTES.map(a => `
    <div class="alert">
      <span class="ico">${a.ico}</span>
      <div>
        <b>${a.titre}</b>
        <div style="font-size:.82rem;color:var(--warm-grey);margin-top:2px">${a.text}</div>
      </div>
    </div>
  `).join('');

  // Popup détail
  const detail = document.getElementById('alerts-detail');
  if (detail) {
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


/* =============================================
   VUE LIEUX
   ============================================= */

function renderLieux() {
  const m = F.period;
  const mois = last(MOIS, m);

  // KPIs
  txt('lx-house', fr(D.lieuxNotes[0]));
  txt('lx-sport', fr((D.lieuxNotes[1] + D.lieuxNotes[2]) / 2));

  // Vue d'ensemble (horizontal bar)
  mk('c-lieux-overview', {
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

  // Greatly House mini line
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

  // Lieux sportifs mini line
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

  // Évolution par lieu
  mk('c-lieux-evol', {
    type: 'line',
    data: {
      labels: mois,
      datasets: [
        lineds('Greatly House', last(D.lieuxHouse, m), C.sage),
        lineds('Lieux sportifs', last(D.lieuxSport, m), C.energie),
      ],
    },
    options: lineOpts(6, 10),
  });

  // Verbatims lieux
  const vList = document.getElementById('lieux-verbatims-list');
  if (vList) {
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


/* =============================================
   VUE FUTURS MEMBRES (PROSPECT)
   ============================================= */

function renderProspect() {
  const m = F.period;
  const mois = last(MOIS, m);

  // --- KPIs ---
  const npsArr = last(D.prospectNPS, m);
  txt('pk-nps', '+' + npsArr[npsArr.length - 1]);

  const impArr = last(D.prospectImpression, m);
  txt('pk-impression', fr(impArr[impArr.length - 1]));

  const clArr = last(D.prospectClarte, m);
  txt('pk-clarte', fr(clArr[clArr.length - 1]));

  const prArr = last(D.prospectProjection, m);
  txt('pk-projection', fr(prArr[prArr.length - 1]));

  // --- Sources de découverte (doughnut) ---
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

  // --- Perception valeur (line) ---
  mk('c-prospect-valeur', {
    type: 'line',
    data: {
      labels: mois,
      datasets: [lineds('Perception valeur', last(D.prospectImpression, m), C.sage)],
    },
    options: lineOpts(5, 10),
  });

  // --- Freins (horizontal bar) ---
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

  // --- Attraits (horizontal bar) ---
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

  // --- NPS prospect (line) ---
  mk('c-prospect-nps', {
    type: 'line',
    data: {
      labels: mois,
      datasets: [lineds('NPS prospect', last(D.prospectNPS, m), '#8B6E4E')],
    },
    options: lineOpts(20, 90),
  });

  // --- Pertinence vs Projection ---
  mk('c-prospect-pertproj', {
    type: 'line',
    data: {
      labels: mois,
      datasets: [
        lineds('Pertinence perçue', last(D.prospectPertinence, m), C.sage),
        lineds('Projection', last(D.prospectProjection, m), '#8B6E4E'),
      ],
    },
    options: lineOpts(4, 10),
  });

  // --- Verbatims prospect ---
  const pasList = document.getElementById('prospect-verbatims-pas');
  if (pasList) {
    pasList.innerHTML = VERBATIMS.prospect.pas.map(t => `
      <div class="verb"><p>« ${t} »</p></div>
    `).join('');
  }

  const sugList = document.getElementById('prospect-verbatims-suggestions');
  if (sugList) {
    sugList.innerHTML = VERBATIMS.prospect.suggestions.map(t => `
      <div class="verb"><p>« ${t} »</p></div>
    `).join('');
  }
}
