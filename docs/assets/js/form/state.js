/* ============================================
   Greatly — Vos retours · État du formulaire
   ============================================ */

const TOTAL_STEPS = 4;

const state = {
  role: null,   // 'membre' | 'intervenant'
  type: null,   // 'energie' | 'lucidite'
  step: 0,
};

/** Clé d'échelle : 'intervenant' ou 'membre_energie' / 'membre_lucidite' */
function scaleKey() {
  return state.role === 'intervenant' ? 'intervenant' : 'membre_' + state.type;
}
