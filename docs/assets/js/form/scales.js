/* ============================================
   Greatly — Vos retours · Données du formulaire
   ============================================
   Échelles, phases, NPS, questions ouvertes.
   Source unique de vérité pour le formulaire.
*/

// Déroulé complet de la rencontre, étape par étape
const PHASES = {
  energie: [
    { n: 'Comment avez-vous vécu l\'accueil ?',       d: 'L\'intention posée, la déconnexion du quotidien, la mise en confiance…' },
    { n: 'Que pensez-vous de l\'échauffement ?',       d: 'La montée en mouvement, le souffle, la préparation du corps…' },
    { n: 'Comment avez-vous vécu le cœur de séance ?', d: 'Les exercices, les variantes proposées, les ajustements à votre rythme…' },
    { n: 'Que pensez-vous du temps de récupération ?', d: 'Le retour au calme, la respiration, l\'ancrage…' },
    { n: 'Comment avez-vous vécu la clôture ?',        d: 'Le partage des ressentis, le micro-rituel de fin…' },
  ],
  lucidite: [
    { n: 'Comment avez-vous vécu l\'accueil ?',        d: 'L\'arrivée, la déconnexion, la mise en confiance…' },
    { n: 'Que pensez-vous du brunch ?',                d: 'La convivialité, la qualité des échanges informels…' },
    { n: 'Comment avez-vous vécu l\'atelier ?',        d: 'Le contenu, l\'animation, les outils proposés…' },
    { n: 'Que pensez-vous du debrief et de la clôture ?', d: 'Le bilan, le défi d\'intersession, ce que vous en gardez…' },
  ],
};

// Échelles spécifiques par clé (role × type)
const SCALES = {
  membre_energie: [
    { id: 'avant',   t: "Comment vous sentiez-vous en arrivant ?",          hint: "Votre niveau d'énergie avant la séance.", labels: ['Épuisé·e', 'Plein·e d\'élan'] },
    { id: 'apres',   t: "Et maintenant, comment vous sentez-vous ?",        hint: "Votre niveau d'énergie après la séance.", labels: ['Épuisé·e', 'Plein·e d\'élan'] },
    { id: 'rythme',  t: "La séance était-elle à votre rythme ?",            hint: "Les variantes, l'intensité, l'écoute de vos besoins…", labels: ['Pas du tout', 'Totalement'] },
    { id: 'plaisir', t: "Avez-vous pris du plaisir à bouger ?",             labels: ['Pas vraiment', 'Beaucoup'] },
    { id: 'lieu',    t: "Que pensez-vous du lieu de la séance ?",            hint: "L'accès, les équipements, les vestiaires, le confort, l'ambiance…", labels: ['À revoir', 'Excellent'] },
  ],
  membre_lucidite: [
    { id: 'clarte',   t: "L'atelier vous a-t-il aidé à prendre du recul ?",                     labels: ['Pas vraiment', 'Beaucoup'] },
    { id: 'echanges', t: "Comment avez-vous trouvé la qualité des échanges ?",                   labels: ['Faible', 'Très riche'] },
    { id: 'outils',   t: "Repartez-vous avec quelque chose d'activable ?",                       hint: "Un outil, un déclic, une pratique à expérimenter…", labels: ['Pas vraiment', 'Clairement'] },
    { id: 'elan',     t: "Cet atelier a-t-il créé une envie de faire bouger les choses ?",       hint: "Un mouvement, une envie d'évolution dans votre quotidien…", labels: ['Pas du tout', 'Très fort'] },
    { id: 'lieu',     t: "Que pensez-vous de la Greatly House ?",                                 hint: "L'accueil, le confort, le cadre, l'atmosphère du lieu…", labels: ['À revoir', 'Excellente'] },
  ],
  intervenant: [
    { id: 'groupe', t: "Comment avez-vous senti le groupe ?",               labels: ['En difficulté', 'Très engagé'] },
    { id: 'cadre',  t: "Que pensez-vous des conditions de la séance ?",     hint: "Le matériel, la logistique, la coordination…", labels: ['À améliorer', 'Idéales'] },
    { id: 'lieu',   t: "Que pensez-vous du lieu de l'intervention ?",       hint: "Greatly House ou lieu extérieur : accès, équipements, adéquation à l'activité…", labels: ['À revoir', 'Excellent'] },
    { id: 'moi',    t: "Comment vous êtes-vous senti dans l'animation ?",   labels: ['Inconfortable', 'Très à l\'aise'] },
  ],
};

// Question NPS par clé
const NPS = {
  membre_energie:  "Si un proche vous demandait, parleriez-vous de cette expérience ?",
  membre_lucidite: "Si un proche vous demandait, parleriez-vous de cette expérience ?",
  intervenant:     "Parleriez-vous de votre expérience chez Greatly à un confrère ?",
};

// Questions ouvertes par clé
const OPENS = {
  membre_energie: [
    { t: "Qu'emportez-vous avec vous après cette séance ?",       h: "Une sensation, un repère, un micro-rituel à refaire…" },
    { t: "Y a-t-il un moment qui vous a particulièrement marqué ?", h: "Quelque chose de facile, de difficile, de surprenant…" },
    { t: "Avez-vous une envie ou une suggestion pour la suite ?",  h: "Une discipline, un format, un rythme…" },
  ],
  membre_lucidite: [
    { t: "Qu'est-ce qui vous a surpris ou touché ?",               h: "Un échange, une idée, un déclic…" },
    { t: "Avez-vous une envie ou une suggestion pour la suite ?",  h: "Un thème, un format, une idée…" },
  ],
  intervenant: [
    { t: "Qu'est-ce qui a bien fonctionné selon vous ?",                          h: "La dynamique, les exercices, les moments clés…" },
    { t: "Avez-vous repéré des points d'attention ?",                             h: "Des signaux faibles, de la fatigue, des demandes particulières… (sans nommer les membres)" },
    { t: "Quels ajustements proposeriez-vous pour la suite ?",                    h: "Le format, la progression, la coordination…" },
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
