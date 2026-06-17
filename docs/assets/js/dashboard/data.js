/* ============================================
   Greatly — Vos retours · Chargement & agrégation
   ============================================ */

let dashboardData = null;
let rawResponses = [];

/** Charge les données depuis le relais */
async function loadData() {
  if (CONFIG.DEMO_MODE) {
    dashboardData = null;
    return null;
  }
  try {
    const result = await API.getData({});
    rawResponses = (result && result.responses) ? result.responses : [];
    aggregateData();
    return rawResponses;
  } catch (err) {
    console.error('Erreur chargement données:', err);
    return null;
  }
}

/** Initialise le dashboard après authentification */
async function initDashboard() {
  await loadData();
  render();
}

/* =============================================
   AGRÉGATION — transforme les réponses brutes en D
   ============================================= */

function aggregateData() {
  if (!rawResponses || rawResponses.length === 0) return;

  // Séparer par type
  const membres_e = rawResponses.filter(r => r.role === 'membre' && r.type === 'energie');
  const membres_l = rawResponses.filter(r => r.role === 'membre' && r.type === 'lucidite');
  const intervenants_e = rawResponses.filter(r => r.role === 'intervenant' && r.type === 'energie');
  const intervenants_l = rawResponses.filter(r => r.role === 'intervenant' && r.type === 'lucidite');
  const prospects = rawResponses.filter(r => r.type === 'prospect' || r.source !== undefined);
  const ghResponses = rawResponses.filter(r => r.type === 'greatly_house');
  const ecrits = rawResponses.filter(r => r.type === 'feedback_ecrit');
  const allMembres = [...membres_e, ...membres_l];
  const allIntervenants = [...intervenants_e, ...intervenants_l];
  const all = [...allMembres, ...allIntervenants];

  // --- Note moyenne de recommandation par mois (sur 10, plus lisible que le NPS %) ---
  const nps = r => r.nps;
  D.npsEnergie = monthlyAvg(membres_e, nps);
  D.npsLucidite = monthlyAvg(membres_l, nps);
  D.npsGlobal = monthlyAvg(allMembres, nps);

  // --- Reco par canal × audience pour les KPI cards de tête + chart évolution ---
  D.npsCards = {
    energie: {
      tous: monthlyAvg([...membres_e, ...intervenants_e], nps),
      membres: monthlyAvg(membres_e, nps),
      intervenants: monthlyAvg(intervenants_e, nps),
    },
    lucidite: {
      tous: monthlyAvg([...membres_l, ...intervenants_l], nps),
      membres: monthlyAvg(membres_l, nps),
      intervenants: monthlyAvg(intervenants_l, nps),
    },
    house: {
      // GH n'a pas de champ r.nps : la note "Recommanderiez-vous ce lieu ?" est dans echelles.recommander
      tous: monthlyAvg(ghResponses, r => r.echelles && r.echelles.recommander),
      membres: monthlyAvg(ghResponses, r => r.echelles && r.echelles.recommander),
      intervenants: monthlyAvg(ghResponses, r => r.echelles && r.echelles.recommander),
    },
    global: {
      tous: monthlyAvg(all, nps),
      membres: monthlyAvg(allMembres, nps),
      intervenants: monthlyAvg(allIntervenants, nps),
    },
  };

  // NPS répartition par mois (aligné sur 12 mois)
  const npsRepart = monthlyNPSRepart(all);
  D.npsPromo = npsRepart.promo;
  D.npsPassif = npsRepart.passif;
  D.npsDetrac = npsRepart.detrac;

  // --- Énergie avant/après ---
  D.energieAvant = monthlyAvg(membres_e, r => r.echelles && r.echelles.avant);
  D.energieApres = monthlyAvg(membres_e, r => r.echelles && r.echelles.apres);

  // --- Phases Énergie membres ---
  const phasesE = aggregatePhases(membres_e);
  if (phasesE.names.length > 0) {
    D.phasesENoms = phasesE.names;
    D.phasesENote = phasesE.values;
  }

  // --- Phases Lucidité membres ---
  const phasesL = aggregatePhases(membres_l);
  if (phasesL.names.length > 0) {
    D.phasesLNoms = phasesL.names;
    D.phasesLNote = phasesL.values;
  }

  // --- Détail par question Énergie ---
  D.qEnergie = aggregateScales(membres_e, [
    { id: 'avant', label: 'Énergie avant la séance', q: 'Comment vous sentiez-vous en arrivant ?' },
    { id: 'apres', label: 'Énergie après la séance', q: 'Et maintenant, comment vous sentez-vous ?' },
    { id: 'rythme', label: 'Séance à mon rythme', q: 'La séance était-elle à votre rythme ?' },
    { id: 'plaisir', label: 'Plaisir à bouger', q: 'Avez-vous pris du plaisir à bouger ?' },
    { id: 'coach', label: 'Accompagnement du coach', q: 'Comment avez-vous trouvé l\'accompagnement du coach ?' },
  ]);

  // --- Détail par question Lucidité ---
  D.qLucidite = aggregateScales(membres_l, [
    { id: 'clarte', label: 'Recul & clarté', q: 'Cet atelier vous a-t-il aidé à voir plus clair ?' },
    { id: 'echanges', label: 'Qualité des échanges', q: 'Comment avez-vous trouvé les échanges avec le groupe ?' },
    { id: 'outils', label: 'Outils & méthodes', q: 'Repartez-vous avec quelque chose de concret ?' },
    { id: 'elan', label: 'Élan après la rencontre', q: 'Sentez-vous une envie de faire bouger les choses ?' },
    { id: 'animation', label: 'Animation de l\'atelier', q: 'Comment avez-vous trouvé l\'animation de l\'atelier ?' },
  ]);

  // --- Échelles intervenants ---
  D.qIntervenantEnergie = aggregateScales(intervenants_e, [
    { id: 'groupe', label: 'Ressenti du groupe', q: 'Comment avez-vous senti le groupe aujourd\'hui ?' },
    { id: 'adapt', label: 'Adaptation de la séance', q: 'Avez-vous pu adapter la séance comme vous le souhaitiez ?' },
    { id: 'cadre', label: 'Conditions de travail', q: 'Les conditions étaient-elles réunies pour bien travailler ?' },
    { id: 'moi', label: 'Ressenti d\'animation', q: 'Comment vous êtes-vous senti dans votre rôle ?' },
  ]);

  D.qIntervenantLucidite = aggregateScales(intervenants_l, [
    { id: 'groupe', label: 'Ressenti du groupe', q: 'Comment avez-vous senti le groupe pendant l\'atelier ?' },
    { id: 'contenu', label: 'Contenu de l\'atelier', q: 'Le contenu de l\'atelier a-t-il bien fonctionné ?' },
    { id: 'cadre', label: 'Conditions de travail', q: 'Les conditions étaient-elles réunies pour un bon atelier ?' },
    { id: 'moi', label: 'Ressenti d\'animation', q: 'Comment vous êtes-vous senti dans l\'animation ?' },
  ]);

  // --- Phases intervenants ---
  const phasesIvE = aggregatePhases(intervenants_e);
  if (phasesIvE.names.length > 0) { D.phasesIvENoms = phasesIvE.names; D.phasesIvENote = phasesIvE.values; }
  const phasesIvL = aggregatePhases(intervenants_l);
  if (phasesIvL.names.length > 0) { D.phasesIvLNoms = phasesIvL.names; D.phasesIvLNote = phasesIvL.values; }

  // --- Greatly & vous (intervenants) ---
  const igData = allIntervenants.filter(r => r.greatly);
  if (igData.length > 0) {
    const dims = ['logistique', 'admin', 'pedagogie', 'communication', 'cadre', 'relation'];
    D.igLabels = ['Logistique', 'Administratif', 'Pédagogie', 'Communication', 'Cadre & lieux', 'Relation équipe'];
    D.igScores = dims.map(d => avg(igData.map(r => r.greatly[d]).filter(v => v !== null && v !== undefined)));
    D.igEvol = monthlyAvg(igData, r => {
      const vals = dims.map(d => r.greatly[d]).filter(v => v !== null && v !== undefined);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    });
  }

  // --- NPS par atelier Lucidité ---
  const atelierMap = {};
  [...membres_l, ...intervenants_l].forEach(r => {
    const a = r.contexte && r.contexte.atelier;
    if (a && r.nps !== null && r.nps !== undefined) {
      if (!atelierMap[a]) atelierMap[a] = [];
      atelierMap[a].push(r.nps);
    }
  });
  const atelierEntries = Object.entries(atelierMap);
  if (atelierEntries.length > 0) {
    D.ateliersNoms = atelierEntries.map(([name]) => name);
    D.ateliersNPS = atelierEntries.map(([, vals]) => Math.round(npsScore(vals)));
  }

  // --- Yoga vs Padel ---
  const yoga = membres_e.filter(r => r.contexte && r.contexte.sport === 'Yoga');
  const padel = membres_e.filter(r => r.contexte && r.contexte.sport === 'Padel');
  if (yoga.length > 0 || padel.length > 0) {
    D.sportsNoms = ['Yoga', 'Padel'];
    D.sportsNPS = [npsScore(yoga.map(r => r.nps).filter(n => n != null)), npsScore(padel.map(r => r.nps).filter(n => n != null))];
    D.sportsNote = [avg(yoga.map(r => r.echelles && r.echelles.plaisir).filter(n => n != null)), avg(padel.map(r => r.echelles && r.echelles.plaisir).filter(n => n != null))];
  }

  // --- Coach par mois ---
  D.coachYoga = monthlyAvg(yoga, r => r.echelles && r.echelles.coach);
  D.coachPadel = monthlyAvg(padel, r => r.echelles && r.echelles.coach);

  // --- Lieux (agrégation croisée : phases membres + formulaire dédié GH) ---

  // Greatly House : combiner les notes de la phase "Greatly House" des ateliers Lucidité
  // + la moyenne globale du formulaire dédié (9 questions)
  const houseFromPhases = membres_l.map(r => phaseValue(r, 'Greatly House')).filter(n => n != null);
  const houseFromForm = ghResponses.map(r => {
    // Moyenne des 9 notes du formulaire dédié pour avoir une note globale par réponse
    if (!r.echelles) return null;
    const vals = Object.values(r.echelles).filter(v => v !== null && v !== undefined);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }).filter(n => n != null);
  const allHouseNotes = [...houseFromPhases, ...houseFromForm];

  // Lieux sportifs : phase "Lieu" des séances Énergie
  const yogaLieu = yoga.map(r => phaseValue(r, 'Lieu')).filter(n => n != null);
  const padelLieu = padel.map(r => phaseValue(r, 'Lieu')).filter(n => n != null);
  const allSportNotes = [...yogaLieu, ...padelLieu];

  if (allHouseNotes.length > 0 || allSportNotes.length > 0) {
    D.lieuxNoms = ['Greatly House', 'Lieu Yoga', 'Lieu Padel'];
    D.lieuxNotes = [avg(allHouseNotes), avg(yogaLieu), avg(padelLieu)];

    // Évolution mensuelle : combiner les deux sources pour Greatly House
    const houseMonthly = monthlyAvgMulti([
      { responses: membres_l, getter: r => phaseValue(r, 'Greatly House') },
      { responses: ghResponses, getter: r => {
        if (!r.echelles) return null;
        const vals = Object.values(r.echelles).filter(v => v !== null && v !== undefined);
        return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      }},
    ]);
    D.lieuxHouse = houseMonthly;
    D.lieuxSport = monthlyAvg(membres_e, r => phaseValue(r, 'Lieu'));
  }

  // --- Greatly House (formulaire dédié) ---
  if (ghResponses.length > 0) {
    const ghKeys = [
      { id: 'arrivee', label: 'Arrivée & accueil', q: 'Comment vous êtes-vous senti en arrivant à la Greatly House ?' },
      { id: 'deconnexion', label: 'Déconnexion', q: 'Le lieu vous a-t-il aidé à vous poser et à déconnecter ?' },
      { id: 'atmosphere', label: 'Atmosphère', q: 'Comment trouvez-vous l\'atmosphère de la maison ?' },
      { id: 'echanges', label: 'Aisance à échanger', q: 'Vous êtes-vous senti à l\'aise pour échanger librement ?' },
      { id: 'confort', label: 'Confort des espaces', q: 'Que pensez-vous du confort des espaces ?' },
      { id: 'acces', label: 'Accès au lieu', q: 'L\'accès au lieu vous convient-il ?' },
      { id: 'adequation', label: 'Adéquation lieu / expérience', q: 'Le lieu est-il à la hauteur de ce qu\'on y vit ?' },
      { id: 'rester', label: 'Envie de rester', q: 'Avez-vous eu envie de rester un peu plus longtemps ?' },
      { id: 'recommander', label: 'Recommandation du lieu', q: 'Recommanderiez-vous ce lieu ?' },
    ];
    D.qGreatlyHouse = ghKeys.map(k => {
      const vals = ghResponses.map(r => r.echelles && r.echelles[k.id]).filter(v => v !== null && v !== undefined);
      const monthly = monthlyAvg(ghResponses, r => r.echelles && r.echelles[k.id]);
      return {
        label: k.label, q: k.q,
        val: vals.length > 0 ? avg(vals) : 0,
        delta: monthly.length >= 2 ? +(monthly[monthly.length - 1] - monthly[monthly.length - 2]).toFixed(1) : 0,
        data: monthly,
      };
    });
  }

  // --- Prospect ---
  if (prospects.length > 0) {
    D.prospectNPS = monthlyAvg(prospects, r => r.nps);
    D.prospectImpression = monthlyAvg(prospects, r => r.impression);
    D.prospectClarte = monthlyAvg(prospects, r => r.clarte);
    D.prospectProjection = monthlyAvg(prospects, r => r.projection);
    D.prospectValeur = monthlyAvg(prospects, r => r.valeur);
    D.prospectPertinence = monthlyAvg(prospects, r => r.pertinence);

    // Notes brutes 0-10 pour les doughnuts de répartition
    const num = v => (typeof v === 'number' && v >= 0 && v <= 10) ? v : null;
    D.prospectNPSRaw        = prospects.map(r => num(r.nps)).filter(v => v !== null);
    D.prospectPertinenceRaw = prospects.map(r => num(r.pertinence)).filter(v => v !== null);
    D.prospectProjectionRaw = prospects.map(r => num(r.projection)).filter(v => v !== null);

    // Sources
    const sourceCount = {};
    prospects.forEach(r => {
      if (r.source) { sourceCount[r.source] = (sourceCount[r.source] || 0) + 1; }
    });
    const sourceEntries = Object.entries(sourceCount).sort((a, b) => b[1] - a[1]);
    D.sourcesLabels = sourceEntries.map(([k]) => k);
    D.sourcesData = sourceEntries.map(([, v]) => v);
    D.sourcesColors = sourceEntries.map((_, i) => ['#6B7D5C', '#C0814E', '#4F7C82', '#8B6E4E', '#9B8B7A', '#7A6B8C', '#E7E1D7'][i % 7]);

    // Valeurs canoniques (mêmes clés que prospect.html) — sert de filtre anti-pollution
    // pour les anciennes soumissions où freins/attraits étaient mélangés.
    const FREINS_KEYS   = ['prix', 'temps', 'distance', 'format', 'comprehension', 'sport', 'aucun'];
    const ATTRAITS_KEYS = ['sport', 'reflexion', 'groupe', 'lieu', 'approche', 'pause'];
    // Libellés humains (mêmes que ATTRAITS_OPTIONS / FREINS_OPTIONS dans charts.js)
    const FREINS_LABEL = {
      prix: "L'investissement financier", temps: 'Trouver le temps', distance: 'Le déplacement',
      format: 'Le format en groupe', comprehension: 'Pas clair pour moi',
      sport: 'Le côté sportif intimide', aucun: 'Rien de particulier',
    };
    const ATTRAITS_LABEL = {
      sport: 'Bouger, prendre soin du corps', reflexion: 'Prendre du recul',
      groupe: 'Échanger entre pairs', lieu: 'Le cadre, la Greatly House',
      approche: "L'approche globale", pause: "S'accorder une pause",
    };

    // Freins (filtrés sur les clés autorisées)
    const freinCount = {};
    prospects.forEach(r => {
      if (r.freins && Array.isArray(r.freins)) r.freins.forEach(f => {
        if (FREINS_KEYS.includes(f)) freinCount[f] = (freinCount[f] || 0) + 1;
      });
    });
    const freinEntries = Object.entries(freinCount).sort((a, b) => b[1] - a[1]);
    D.freinsLabels = freinEntries.map(([k]) => FREINS_LABEL[k] || k);
    D.freinsData = freinEntries.map(([, v]) => v);

    // Attraits (filtrés sur les clés autorisées)
    const attraitCount = {};
    prospects.forEach(r => {
      if (r.attraits && Array.isArray(r.attraits)) r.attraits.forEach(a => {
        if (ATTRAITS_KEYS.includes(a)) attraitCount[a] = (attraitCount[a] || 0) + 1;
      });
    });
    const attraitEntries = Object.entries(attraitCount).sort((a, b) => b[1] - a[1]);
    D.attraitsLabels = attraitEntries.map(([k]) => ATTRAITS_LABEL[k] || k);
    D.attraitsData = attraitEntries.map(([, v]) => v);
  }

  // --- Verbatims ---
  VERBATIMS.energie = extractVerbatims(membres_e);
  VERBATIMS.lucidite = extractVerbatims(membres_l);

  // Verbatims prospect
  VERBATIMS.prospect.pas = prospects
    .filter(r => r.ouvertes)
    .map(r => Object.values(r.ouvertes)[0])
    .filter(v => v && v.trim());
  VERBATIMS.prospect.suggestions = prospects
    .filter(r => r.ouvertes)
    .map(r => { const vals = Object.values(r.ouvertes); return vals[1] || ''; })
    .filter(v => v && v.trim());

  // Verbatims lieux
  VERBATIMS.lieux = ghResponses
    .filter(r => r.verbatim)
    .map(r => ({ date: formatDate(r.ts || r.ts_server), lieu: 'Greatly House', text: r.verbatim }));

  // Verbatims intervenants Greatly
  VERBATIMS_IG.facilite = allIntervenants
    .filter(r => r.greatly_ouvertes)
    .map(r => ({ date: formatDate(r.ts || r.ts_server), text: Object.values(r.greatly_ouvertes)[0] || '' }))
    .filter(v => v.text);
  VERBATIMS_IG.collab = allIntervenants
    .filter(r => r.greatly_ouvertes)
    .map(r => ({ date: formatDate(r.ts || r.ts_server), text: Object.values(r.greatly_ouvertes)[1] || '' }))
    .filter(v => v.text);

  // Feedbacks écrits
  FEEDBACKS_ECRITS.length = 0;
  ecrits.forEach(r => {
    FEEDBACKS_ECRITS.push({
      date: formatDate(r.ts || r.ts_server),
      titre: r.titre || null,
      html: r.contenu_html || '<p>' + (r.contenu_texte || '') + '</p>',
      texte: r.contenu_texte || '',
    });
  });

  // Alertes (points d'attention intervenants)
  ALERTES.length = 0;
  allIntervenants.forEach(r => {
    if (!r.ouvertes) return;
    const entries = Object.entries(r.ouvertes);
    // 2e question = signaux
    if (entries[1] && entries[1][1] && entries[1][1].trim()) {
      ALERTES.push({
        ico: '⚠️',
        titre: r.type === 'energie' ? 'Séance Énergie' : 'Atelier Lucidité',
        text: entries[1][1],
        severity: 'mid',
      });
    }
  });
}

/* =============================================
   HELPERS D'AGRÉGATION
   ============================================= */

/** Moyenne simple */
function avg(arr) {
  const valid = arr.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return 0;
  return +(valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
}

/** Score NPS à partir de notes brutes */
function npsScore(notes) {
  if (!notes || notes.length === 0) return 0;
  const promo = notes.filter(n => n >= 9).length;
  const detrac = notes.filter(n => n < 7).length;
  return Math.round((promo - detrac) / notes.length * 100);
}

/** Répartition NPS par mois (promoteurs/passifs/détracteurs en %) */
function monthlyNPSRepart(responses) {
  const buckets = {};
  responses.forEach(r => {
    if (r.nps === null || r.nps === undefined) return;
    const ts = r.ts || r.ts_server;
    if (!ts) return;
    const d = new Date(ts);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(r.nps);
  });
  const months = getLast12MonthKeys();
  return {
    promo: months.map(k => {
      if (!buckets[k]) return null;
      return Math.round(buckets[k].filter(n => n >= 9).length / buckets[k].length * 100);
    }),
    passif: months.map(k => {
      if (!buckets[k]) return null;
      return Math.round(buckets[k].filter(n => n >= 7 && n < 9).length / buckets[k].length * 100);
    }),
    detrac: months.map(k => {
      if (!buckets[k]) return null;
      return Math.round(buckets[k].filter(n => n < 7).length / buckets[k].length * 100);
    }),
  };
}

/** Score NPS par mois — retourne un tableau aligné sur les 12 derniers mois */
function monthlyNPS(responses) {
  const buckets = {};
  responses.forEach(r => {
    if (r.nps === null || r.nps === undefined) return;
    const ts = r.ts || r.ts_server;
    if (!ts) return;
    const d = new Date(ts);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(r.nps);
  });
  const months = getLast12MonthKeys();
  return months.map(k => {
    if (!buckets[k] || buckets[k].length === 0) return null;
    return npsScore(buckets[k]);
  });
}

/** Génère les clés YYYY-MM des 12 derniers mois */
function getLast12MonthKeys() {
  const now = new Date();
  const keys = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }
  return keys;
}

/** Moyenne par mois — retourne un tableau aligné sur les 12 derniers mois */
function monthlyAvg(responses, getter) {
  const buckets = {};
  responses.forEach(r => {
    const val = getter(r);
    if (val === null || val === undefined) return;
    const ts = r.ts || r.ts_server;
    if (!ts) return;
    const d = new Date(ts);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(val);
  });
  // Aligner sur les 12 derniers mois, null pour les mois vides
  const months = getLast12MonthKeys();
  return months.map(k => {
    if (!buckets[k] || buckets[k].length === 0) return null;
    return +(buckets[k].reduce((a, b) => a + b, 0) / buckets[k].length).toFixed(1);
  });
}

/** Moyenne par mois combinant plusieurs sources */
function monthlyAvgMulti(sources) {
  const buckets = {};
  sources.forEach(src => {
    src.responses.forEach(r => {
      const val = src.getter(r);
      if (val === null || val === undefined) return;
      const ts = r.ts || r.ts_server;
      if (!ts) return;
      const d = new Date(ts);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(val);
    });
  });
  const months = getLast12MonthKeys();
  return months.map(k => {
    if (!buckets[k] || buckets[k].length === 0) return null;
    return +(buckets[k].reduce((a, b) => a + b, 0) / buckets[k].length).toFixed(1);
  });
}

/** Agrège les phases d'un ensemble de réponses */
function aggregatePhases(responses) {
  const phaseMap = {};
  responses.forEach(r => {
    if (!r.phases) return;
    Object.entries(r.phases).forEach(([name, val]) => {
      if (val === null || val === undefined) return;
      // Raccourcir le nom de la phase (prendre le premier mot clé)
      const short = shortenPhase(name);
      if (!phaseMap[short]) phaseMap[short] = [];
      phaseMap[short].push(val);
    });
  });
  const entries = Object.entries(phaseMap);
  return {
    names: entries.map(([k]) => k),
    values: entries.map(([, vals]) => avg(vals)),
  };
}

/** Raccourcit le nom d'une phase (les questions longues → labels courts) */
function shortenPhase(name) {
  const lower = name.toLowerCase();
  if (lower.includes('accueil')) return 'Accueil';
  if (lower.includes('échauffement') || lower.includes('echauffement')) return 'Échauffement';
  if (lower.includes('cœur') || lower.includes('coeur')) return 'Cœur de séance';
  if (lower.includes('récupération') || lower.includes('recuperation')) return 'Récupération';
  if (lower.includes('clôture') || lower.includes('cloture')) return 'Clôture';
  if (lower.includes('lieu')) return 'Lieu';
  if (lower.includes('brunch')) return 'Brunch';
  if (lower.includes('atelier')) return 'Atelier';
  if (lower.includes('debrief')) return 'Debrief & clôture';
  if (lower.includes('greatly house') || lower.includes('maison')) return 'Greatly House';
  return name.length > 30 ? name.substring(0, 30) + '…' : name;
}

/** Extrait la valeur d'une phase par nom partiel */
function phaseValue(response, partialName) {
  if (!response.phases) return null;
  const lower = partialName.toLowerCase();
  for (const [key, val] of Object.entries(response.phases)) {
    if (key.toLowerCase().includes(lower)) return val;
  }
  return null;
}

/** Agrège les échelles en objets pour le détail par question */
function aggregateScales(responses, definitions) {
  return definitions.map(def => {
    const vals = responses.map(r => r.echelles && r.echelles[def.id]).filter(v => v !== null && v !== undefined);
    const monthly = monthlyAvg(responses, r => r.echelles && r.echelles[def.id]);
    return {
      label: def.label,
      q: def.q,
      val: vals.length > 0 ? avg(vals) : 0,
      delta: monthly.length >= 2 ? +(monthly[monthly.length - 1] - monthly[monthly.length - 2]).toFixed(1) : 0,
      data: monthly,
    };
  }).filter(q => q.val > 0 || q.data.length > 0);
}

/** Extrait les verbatims d'un ensemble de réponses */
function extractVerbatims(responses) {
  const verbs = [];
  responses.forEach(r => {
    if (!r.ouvertes) return;
    const sport = r.contexte && r.contexte.sport;
    const atelier = r.contexte && r.contexte.atelier;
    const tag = sport || atelier || (r.type === 'lucidite' ? 'Lucidité' : 'Énergie');
    Object.values(r.ouvertes).forEach(text => {
      if (text && text.trim()) {
        verbs.push({ date: formatDate(r.ts || r.ts_server), tag: tag, text: text.trim() });
      }
    });
  });
  return verbs.slice(0, 20);
}

/** Formatte une date ISO en "12 juin 2026" */
function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return d.getDate() + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear();
  } catch (e) {
    return '—';
  }
}
