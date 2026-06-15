/* ============================================
   Greatly — Vos retours · Popup points d'attention
   ============================================ */

/** Ouvrir la popup des points d'attention */
function openAlerts() {
  const overlay = document.getElementById('alerts-overlay');
  if (overlay) overlay.classList.add('open');
}

/** Fermer la popup */
function closeAlerts() {
  const overlay = document.getElementById('alerts-overlay');
  if (overlay) overlay.classList.remove('open');
}

// Fermeture par clic extérieur ou Échap
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAlerts();
});

document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) closeAlerts();
});
