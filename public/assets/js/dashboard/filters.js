/* ============================================
   Greatly — Vos retours · Filtres du dashboard
   ============================================ */

// État des filtres
const F = { type: 'tous', act: 'tous', who: 'tous', period: 6, coach: 'yoga' };

/** Bind un groupe de filtres sur un état + re-render */
function bindFilter(id, key, parse) {
  document.querySelectorAll('#' + id + ' button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#' + id + ' button').forEach(x => x.classList.remove('on'));
      btn.classList.add('on');
      F[key] = parse ? parse(btn.dataset.v) : btn.dataset.v;
      render();
    });
  });
}
