/* ============================================
   Greatly — Vos retours · Chargement des données
   ============================================ */

let dashboardData = null;

/** Charge les données depuis le relais selon les filtres actifs */
async function loadData() {
  if (CONFIG.DEMO_MODE) {
    // Mode démo : pas d'appel réseau, le dashboard affichera des états vides
    dashboardData = null;
    return null;
  }
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
