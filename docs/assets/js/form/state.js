/* ============================================
   Greatly — Vos retours · État du formulaire
   ============================================ */

let TOTAL_STEPS = 4;

const state = {
  role: null,   // 'membre' | 'intervenant'
  type: null,   // 'energie' | 'lucidite'
  step: 0,
};

/** Clé d'échelle : 'membre_energie', 'membre_lucidite', 'intervenant_energie', 'intervenant_lucidite' */
function scaleKey() {
  return state.role + '_' + state.type;
}
