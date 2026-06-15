/* ============================================
   Greatly — Vos retours · Chargement des données
   ============================================ */

let dashboardData = null;

/** Charge les données depuis le relais selon les filtres actifs */
async function loadData() {
  try {
    dashboardData = await API.getData({
      type: F.type,
      act: F.act,
      who: F.who,
      period: F.period,
    });
    return dashboardData;
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
