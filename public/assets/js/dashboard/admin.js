/* ============================================
   Greatly — Vos retours · Console admin
   ============================================ */

/** Charge et affiche la liste des personnes */
async function loadPeople() {
  try {
    const res = await API.getPeople();
    renderPeopleTable(res.people || []);
    renderPendingRequests(res.requests || []);
    renderActivityLog(res.log || []);
  } catch (err) {
    console.error('Erreur chargement admin:', err);
  }
}

function renderPeopleTable(people) {
  // TODO: implémenter le rendu du tableau
}

function renderPendingRequests(requests) {
  // TODO: implémenter le rendu des demandes en attente
}

function renderActivityLog(log) {
  // TODO: implémenter le journal d'activité
}

/** Actions admin avec confirmation */
async function adminAction(action, email, confirmMsg) {
  if (confirmMsg && !confirm(confirmMsg)) return;
  try {
    await API[action](email);
    await loadPeople(); // Rafraîchir la liste
  } catch (err) {
    alert('Erreur : ' + err.message);
  }
}
