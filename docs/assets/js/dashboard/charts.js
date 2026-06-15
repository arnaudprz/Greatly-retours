/* ============================================
   Greatly — Vos retours · Graphiques Chart.js
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
  if (el && el.offsetParent !== null) {
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

/** Render principal — sera complété quand on branche les données réelles */
function render() {
  const isLieux = F.type === 'lieux';

  // Basculer entre vue standard et vue Lieux
  show('standard-section', !isLieux);
  show('lieux-section', isLieux);

  // Masquer les filtres secondaires en mode Lieux (pas pertinents)
  show('f-act', !isLieux);
  show('f-who', !isLieux);

  if (isLieux) {
    renderLieux();
  }

  console.log('render() appelé avec filtres:', JSON.stringify(F));
}

/** Render de la vue Lieux */
function renderLieux() {
  // TODO: remplacer par les données réelles du relais
  // Pour l'instant, données de démonstration
}
