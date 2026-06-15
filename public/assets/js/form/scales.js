/* ============================================
   Greatly — Vos retours · Données du formulaire
   ============================================
   Échelles, phases, NPS, questions ouvertes.
   Source unique de vérité pour le formulaire.
*/

// Déroulé complet de la rencontre, étape par étape
const PHASES = {
  energie: [
    { n: 'Accueil & cadre',       d: 'intention, déconnexion, mise en confiance' },
    { n: 'Échauffement',          d: 'mobilisation progressive, corps-souffle' },
    { n: 'Cœur de séance',        d: 'exercices, variantes, ajustements' },
    { n: 'Récupération',          d: 'retour au calme, respiration, ancrage' },
    { n: 'Clôture & échanges',    d: 'partage des ressentis, micro-rituel' },
  ],
  lucidite: [
    { n: 'Accueil',               d: 'arrivée, déconnexion, mise en confiance' },
    { n: 'Brunch',                d: 'convivialité, qualité des échanges' },
    { n: 'Atelier',               d: 'contenu, animation, outils proposés' },
    { n: 'Debrief & clôture',     d: 'bilan, défi d\'intersession' },
  ],
};

// Échelles spécifiques par clé (role × type)
const SCALES = {
  membre_energie: [
    { id: 'avant',   t: "Mon niveau d'énergie avant la séance",    labels: ['Épuisé·e', 'Plein·e d\'élan'] },
    { id: 'apres',   t: "Mon niveau d'énergie après la séance",    labels: ['Épuisé·e', 'Plein·e d\'élan'] },
    { id: 'rythme',  t: "La séance était à mon rythme",            hint: "Variantes, intensité, écoute de mes besoins…", labels: ['Pas du tout', 'Totalement'] },
    { id: 'plaisir', t: "J'ai pris du plaisir à bouger",           labels: ['Pas vraiment', 'Beaucoup'] },
    { id: 'lieu',    t: "Le lieu de la séance",                    hint: "Accès, équipements, vestiaires, confort, ambiance…", labels: ['À revoir', 'Excellent'] },
  ],
  membre_lucidite: [
    { id: 'clarte',   t: "L'atelier m'a aidé·e à prendre du recul",                        labels: ['Pas vraiment', 'Beaucoup'] },
    { id: 'echanges', t: "La qualité des échanges dans le groupe",                          labels: ['Faible', 'Très riche'] },
    { id: 'outils',   t: "Je repars avec quelque chose d'activable",                        hint: "Un outil, un déclic, une pratique à expérimenter…", labels: ['Pas vraiment', 'Clairement'] },
    { id: 'elan',     t: "Cet atelier a créé un mouvement, une envie d'évolution",          hint: "L'envie de faire bouger les choses dans mon quotidien…", labels: ['Pas du tout', 'Très fort'] },
    { id: 'lieu',     t: "La Greatly House",                                                 hint: "Accueil, confort, cadre, atmosphère du lieu…", labels: ['À revoir', 'Excellente'] },
  ],
  intervenant: [
    { id: 'groupe', t: "Le ressenti général du groupe",          labels: ['En difficulté', 'Très engagé'] },
    { id: 'cadre',  t: "Les conditions de la séance",            hint: "Matériel, logistique, coordination…", labels: ['À améliorer', 'Idéales'] },
    { id: 'lieu',   t: "Le lieu de l'intervention",              hint: "Greatly House ou lieu extérieur : accès, équipements, adéquation à l'activité…", labels: ['À revoir', 'Excellent'] },
    { id: 'moi',    t: "Mon propre ressenti d'animation",        labels: ['Inconfortable', 'Très à l\'aise'] },
  ],
};

// Question NPS par clé
const NPS = {
  membre_energie:  "Recommanderiez-vous l'expérience vécue lors de cette séance à un membre de votre entourage ?",
  membre_lucidite: "Recommanderiez-vous l'expérience vécue lors de cet atelier à un membre de votre entourage ?",
  intervenant:     "Recommanderiez-vous l'expérience d'intervenant·e chez Greatly à un·e professionnel·le de votre réseau ?",
};

// Questions ouvertes par clé
const OPENS = {
  membre_energie: [
    { t: "Ce que j'emporte avec moi",                 h: "Une sensation, un repère, un micro-rituel à refaire…" },
    { t: "Un moment qui m'a marqué·e",                h: "Facile, difficile, surprenant…" },
    { t: "Une envie ou une suggestion pour la suite",  h: "Discipline, format, rythme…" },
  ],
  membre_lucidite: [
    { t: "Ce qui m'a surpris·e ou que j'ai aimé",     h: "Un échange, une idée, un déclic…" },
    { t: "Une envie ou une suggestion pour la suite",  h: "Thème, format…" },
  ],
  intervenant: [
    { t: "Ce qui a bien fonctionné",                                    h: "Dynamique, exercices, moments clés…" },
    { t: "Points d'attention ou besoins spécifiques observés",          h: "Signaux faibles, fatigue, demandes particulières… (sans nommer les membres)" },
    { t: "Ajustements proposés pour la suite",                          h: "Format, progression, coordination…" },
  ],
};

// Les 6 ateliers Lucidité + bilan
const ATELIERS = [
  '1 · Le cadre (juin)',
  '2 · Les décisions (juillet)',
  '3 · L\'énergie (septembre)',
  '4 · Les émotions (octobre)',
  '5 · Le temps (novembre)',
  '6 · Le collectif (décembre)',
  '7 · Bilan (janvier 2027)',
];
