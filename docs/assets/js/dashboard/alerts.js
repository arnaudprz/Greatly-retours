/* ============================================
   Greatly — Vos retours · Popups (retours + alertes)
   ============================================ */

/** Ouvrir/fermer la popup des retours */
function openVerbatims() {
  document.getElementById('verbatims-overlay').classList.add('open');
}
function closeVerbatims() {
  document.getElementById('verbatims-overlay').classList.remove('open');
}

/** Ouvrir/fermer la popup des points d'attention */
function openAlerts() {
  document.getElementById('alerts-overlay').classList.add('open');
}
function closeAlerts() {
  document.getElementById('alerts-overlay').classList.remove('open');
}

// Fermeture par Échap (toutes les popups)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAlerts();
    closeVerbatims();
  }
});

// Fermeture par clic sur l'arrière-plan
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) {
    closeAlerts();
    closeVerbatims();
  }
});
