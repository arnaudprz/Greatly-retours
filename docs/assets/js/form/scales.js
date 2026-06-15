/* ============================================
   Greatly — Vos retours · Données du formulaire
   ============================================
   Questions par croisement rôle × parcours.
   Chaque combinaison a ses propres questions
   adaptées à l'audience et au contexte.
*/

// ============================================
// PHASES — déroulé de la séance/rencontre
// ============================================

const PHASES = {
  energie: [
    { n: 'Comment avez-vous vécu l\'accueil ?',            d: 'Le moment où vous arrivez, posez vos affaires, vous déconnectez du quotidien…' },
    { n: 'Que pensez-vous de l\'échauffement ?',            d: 'La mise en mouvement, l\'écoute du corps, la montée en énergie…' },
    { n: 'Comment avez-vous vécu le cœur de séance ?',      d: 'Les exercices, les variantes, l\'intensité, les ajustements à votre rythme…' },
    { n: 'Que pensez-vous du temps de récupération ?',      d: 'Le retour au calme, la respiration, ce moment pour soi…' },
    { n: 'Comment avez-vous vécu la clôture ?',             d: 'Le partage de ressentis, le petit rituel de fin, la transition vers la suite de votre journée…' },
    { n: 'Que pensez-vous du lieu ?',                       d: 'L\'accès, les équipements, les vestiaires, le confort, l\'ambiance du lieu…' },
  ],
  lucidite: [
    { n: 'Comment avez-vous vécu l\'accueil ?',             d: 'L\'arrivée à la Greatly House, la déconnexion, le premier contact avec le groupe…' },
    { n: 'Que pensez-vous du brunch ?',                     d: 'Le moment de convivialité, les échanges informels autour de la table…' },
    { n: 'Comment avez-vous vécu l\'atelier ?',             d: 'Le contenu, la façon dont il était animé, les outils proposés…' },
    { n: 'Que pensez-vous du debrief et de la clôture ?',   d: 'Le bilan partagé, le défi d\'intersession, ce que vous en gardez…' },
    { n: 'Que pensez-vous de la Greatly House ?',           d: 'L\'accueil, le confort, le cadre, l\'atmosphère — ce lieu est-il à la hauteur de ce qu\'on y vit ?' },
  ],
};

// Phases vues par les intervenants (regard d'animateur)
const PHASES_INTERVENANT = {
  energie: [
    { n: 'Comment s\'est passé l\'accueil du groupe ?',       d: 'L\'état d\'esprit des membres en arrivant, la mise en confiance, la connexion au groupe…' },
    { n: 'Que pensez-vous de la phase d\'échauffement ?',     d: 'L\'engagement des membres, l\'adaptation au niveau, la montée en énergie…' },
    { n: 'Comment s\'est déroulé le cœur de séance ?',        d: 'La dynamique, les ajustements que vous avez faits, la réceptivité du groupe…' },
    { n: 'Le temps de récupération était-il suffisant ?',     d: 'Le retour au calme, l\'état du groupe à ce moment, la qualité du silence…' },
    { n: 'Comment s\'est passée la clôture ?',                d: 'Les échanges spontanés, les ressentis partagés, la qualité du moment…' },
    { n: 'Que pensez-vous du lieu pour cette activité ?',     d: 'L\'espace, l\'adéquation à la pratique, les équipements, le confort pour les membres…' },
  ],
  lucidite: [
    { n: 'Comment s\'est passé l\'accueil ?',                 d: 'L\'état d\'esprit des membres, la qualité de la déconnexion, l\'ambiance…' },
    { n: 'Que pensez-vous du temps de brunch ?',              d: 'Les échanges entre membres, l\'énergie du groupe avant l\'atelier…' },
    { n: 'Comment s\'est déroulé l\'atelier ?',               d: 'La réceptivité, les réactions, les moments forts, les difficultés éventuelles…' },
    { n: 'Comment s\'est passé le debrief ?',                 d: 'La qualité des prises de parole, l\'adhésion au défi d\'intersession…' },
    { n: 'Que pensez-vous de la Greatly House ?',             d: 'L\'accueil, le confort, le cadre, l\'atmosphère — ce lieu est-il à la hauteur de ce qu\'on y vit ?' },
  ],
};


// ============================================
// ÉCHELLES — questions notées 0-10
// ============================================

const SCALES = {
  // --- MEMBRE × ÉNERGIE ---
  membre_energie: [
    { id: 'avant',   t: "Comment vous sentiez-vous en arrivant ?",
      hint: "Votre niveau d'énergie juste avant la séance — pas de jugement, juste un état des lieux.",
      labels: ['Vidé·e', 'Plein·e d\'élan'] },
    { id: 'apres',   t: "Et maintenant, comment vous sentez-vous ?",
      hint: "Votre niveau d'énergie en sortant. Ce qui compte, c'est le ressenti, pas la performance.",
      labels: ['Vidé·e', 'Plein·e d\'élan'] },
    { id: 'rythme',  t: "La séance était-elle à votre rythme ?",
      hint: "Les variantes proposées, l'intensité, l'attention portée à vos besoins…",
      labels: ['Trop vite / trop lent', 'Pile ce qu\'il fallait'] },
    { id: 'plaisir', t: "Avez-vous pris du plaisir à bouger ?",
      hint: "Le plaisir dans le mouvement, l'envie de revenir…",
      labels: ['Pas vraiment', 'Beaucoup'] },
    { id: 'coach',   t: "Comment avez-vous trouvé l'accompagnement du coach ?",
      hint: "Son écoute, ses conseils, sa capacité à s'adapter à chacun…",
      labels: ['À améliorer', 'Excellent'] },
  ],

  // --- MEMBRE × LUCIDITÉ ---
  membre_lucidite: [
    { id: 'echanges', t: "Comment avez-vous trouvé les échanges avec le groupe ?",
      hint: "La qualité d'écoute, la profondeur des discussions, le sentiment de confiance…",
      labels: ['Superficiels', 'Très riches'] },
    { id: 'clarte',   t: "Cet atelier vous a-t-il aidé à voir plus clair ?",
      hint: "Sur une situation, une question, un sujet qui vous occupe en ce moment…",
      labels: ['Pas vraiment', 'Oui, nettement'] },
    { id: 'outils',   t: "Repartez-vous avec quelque chose de concret ?",
      hint: "Un outil, une méthode, un déclic, une pratique à essayer dès demain…",
      labels: ['Pas vraiment', 'Clairement'] },
    { id: 'elan',     t: "Sentez-vous une envie de faire bouger les choses ?",
      hint: "Un élan, une motivation, l'envie de changer quelque chose dans votre quotidien…",
      labels: ['Pas pour le moment', 'Oui, fortement'] },
    { id: 'animation', t: "Comment avez-vous trouvé l'animation de l'atelier ?",
      hint: "Le rythme, la façon de guider les échanges, l'espace laissé à chacun…",
      labels: ['À améliorer', 'Excellente'] },
  ],

  // --- INTERVENANT × ÉNERGIE ---
  intervenant_energie: [
    { id: 'groupe',   t: "Comment avez-vous senti le groupe aujourd'hui ?",
      hint: "L'énergie collective, l'engagement, les signaux que vous avez perçus…",
      labels: ['En retrait', 'Très engagé'] },
    { id: 'adapt',    t: "Avez-vous pu adapter la séance comme vous le souhaitiez ?",
      hint: "Les variantes, le matériel, le temps — aviez-vous ce qu'il fallait ?",
      labels: ['Difficilement', 'Sans problème'] },
    { id: 'cadre',    t: "Les conditions étaient-elles réunies pour bien travailler ?",
      hint: "Le matériel, la logistique, la coordination avec l'équipe Greatly…",
      labels: ['À améliorer', 'Idéales'] },
    { id: 'moi',      t: "Comment vous êtes-vous senti dans votre rôle ?",
      hint: "Votre confort d'animation, votre plaisir, votre énergie personnelle…",
      labels: ['Pas à l\'aise', 'Dans mon élément'] },
  ],

  // --- INTERVENANT × LUCIDITÉ ---
  intervenant_lucidite: [
    { id: 'groupe',   t: "Comment avez-vous senti le groupe pendant l'atelier ?",
      hint: "L'ouverture, la qualité d'écoute, la profondeur des échanges…",
      labels: ['En retrait', 'Très impliqué'] },
    { id: 'contenu',  t: "Le contenu de l'atelier a-t-il bien fonctionné ?",
      hint: "La pertinence du thème, l'adhésion du groupe, les réactions…",
      labels: ['À retravailler', 'Très bien passé'] },
    { id: 'cadre',    t: "Les conditions étaient-elles réunies pour un bon atelier ?",
      hint: "Le timing, la coordination, la logistique du brunch…",
      labels: ['À améliorer', 'Idéales'] },
    { id: 'moi',      t: "Comment vous êtes-vous senti dans l'animation ?",
      hint: "Votre aisance, votre connexion au groupe, votre plaisir à animer…",
      labels: ['Inconfortable', 'Très à l\'aise'] },
  ],
};


// ============================================
// NPS — question de recommandation
// ============================================

const NPS = {
  membre_energie:       "Imaginez qu'un proche traverse une période intense — lui conseilleriez-vous de vivre cette expérience ?",
  membre_lucidite:      "Imaginez qu'un proche cherche à prendre du recul — lui conseilleriez-vous de vivre cette expérience ?",
  intervenant_energie:  "Si un confrère cherchait une expérience d'accompagnement enrichissante, lui parleriez-vous de Greatly ?",
  intervenant_lucidite: "Si un confrère cherchait une expérience d'accompagnement enrichissante, lui parleriez-vous de Greatly ?",
};


// ============================================
// QUESTIONS OUVERTES
// ============================================

const OPENS = {
  // --- MEMBRE × ÉNERGIE ---
  membre_energie: [
    { t: "Qu'emportez-vous avec vous après cette séance ?",
      h: "Une sensation dans le corps, un repère, un geste à refaire, un état d'esprit…" },
    { t: "Y a-t-il un moment qui vous a particulièrement marqué ?",
      h: "Un exercice, une difficulté, une surprise, un plaisir inattendu…" },
    { t: "Si vous pouviez changer une chose pour la prochaine fois ?",
      h: "Le rythme, le lieu, l'horaire, une activité, un format — tout est bon à dire." },
  ],

  // --- MEMBRE × LUCIDITÉ ---
  membre_lucidite: [
    { t: "Qu'est-ce qui vous a le plus touché ou surpris aujourd'hui ?",
      h: "Un échange, une prise de conscience, un moment de silence, un outil…" },
    { t: "Si vous pouviez changer une chose pour le prochain atelier ?",
      h: "Le thème, le format, la durée du brunch, un détail pratique — tout compte." },
  ],

  // --- INTERVENANT × ÉNERGIE ---
  intervenant_energie: [
    { t: "Qu'est-ce qui a bien fonctionné dans cette séance ?",
      h: "Les exercices, la dynamique, un moment particulier, la progression du groupe…" },
    { t: "Avez-vous repéré des signaux à partager avec l'équipe ?",
      h: "De la fatigue, un membre en retrait, une demande, un besoin non exprimé… (sans nommer personne)" },
    { t: "Qu'ajusteriez-vous pour la prochaine séance ?",
      h: "L'intensité, un exercice, le matériel, la coordination, le timing…" },
  ],

  // --- INTERVENANT × LUCIDITÉ ---
  intervenant_lucidite: [
    { t: "Qu'est-ce qui a bien fonctionné dans cet atelier ?",
      h: "Un exercice, un échange, une réaction du groupe, un moment de bascule…" },
    { t: "Avez-vous perçu des signaux à partager avec l'équipe ?",
      h: "Un membre en difficulté, une tension, un besoin non exprimé, un sujet sensible… (sans nommer personne)" },
    { t: "Qu'ajusteriez-vous pour le prochain atelier ?",
      h: "Le format, le rythme, le contenu, le brunch, la coordination…" },
  ],
};


// ============================================
// GREATLY & VOUS — questions intervenants sur la relation avec Greatly
// ============================================

const GREATLY_SCALES = [
  { id: 'logistique',    t: "Comment trouvez-vous la logistique autour de vos interventions ?",
    hint: "La planification, les horaires, le matériel mis à disposition, la fluidité du jour J…",
    labels: ['À revoir', 'Fluide et efficace'] },
  { id: 'admin',         t: "Êtes-vous satisfait du suivi administratif ?",
    hint: "Les contrats, la facturation, les échanges par email, la réactivité…",
    labels: ['Laborieux', 'Impeccable'] },
  { id: 'pedagogie',     t: "Comment vivez-vous l'accompagnement pédagogique ?",
    hint: "Le cadrage des séances, les échanges sur le contenu, le soutien de l'équipe Greatly…",
    labels: ['Insuffisant', 'Très soutenant'] },
  { id: 'communication', t: "La communication interne vous convient-elle ?",
    hint: "Les informations reçues en amont, les retours après les séances, la clarté des échanges…",
    labels: ['Pas assez fluide', 'Très claire'] },
  { id: 'cadre',         t: "Que pensez-vous du cadre et du confort des lieux où vous intervenez ?",
    hint: "Greatly House, salles de sport — l'espace, l'ambiance, ce qu'il faudrait améliorer…",
    labels: ['À améliorer', 'Très agréable'] },
  { id: 'relation',      t: "Comment décririez-vous votre relation avec l'équipe Greatly ?",
    hint: "La confiance, l'écoute, le respect de votre expertise, le plaisir de collaborer…",
    labels: ['Distante', 'Très enrichissante'] },
];

const GREATLY_OPENS = [
  { t: "Y a-t-il quelque chose qui vous faciliterait la vie au quotidien ?",
    h: "Un outil, un process, une information, un changement d'organisation — même un petit détail…" },
  { t: "Qu'aimeriez-vous nous partager pour que notre collaboration grandisse ?",
    h: "Une idée, un besoin, un ressenti, quelque chose que vous n'avez pas encore eu l'occasion de dire…" },
];


// ============================================
// ATELIERS LUCIDITÉ
// ============================================

const ATELIERS = [
  '1 · Le cadre (juin)',
  '2 · Les décisions (juillet)',
  '3 · L\'énergie (septembre)',
  '4 · Les émotions (octobre)',
  '5 · Le temps (novembre)',
  '6 · Le collectif (décembre)',
  '7 · Bilan (janvier 2027)',
];
