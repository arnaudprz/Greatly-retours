# Audit de couverture : Formulaires vs Dashboard — "Vos retours"

**Date** : 15 juin 2026
**Perimetre** : Formulaires (membres, intervenants, prospects) et dashboard de l'outil "Vos retours" de Greatly.

---

## 1. Synthese

Le dashboard est actuellement alimente par des **donnees fictives codees en dur** (`charts.js` lignes 64-218) et ne consomme aucune donnee reelle des formulaires. L'architecture de collecte (formulaires + serialisation + API) est coherente et complete. En revanche, le mapping entre les cles JSON envoyees par les formulaires et les donnees affichees dans le dashboard presente plusieurs ecarts : des questions sont collectees mais jamais restituees (phases du deroule, certaines echelles intervenants), des labels du dashboard ne correspondent pas aux cles du formulaire, et certains graphiques consomment des donnees fabriquees qui n'existent dans aucun formulaire (taux de reponse, noms d'ateliers). Quand le mode reel remplacera le mode demo, ces ecarts devront etre corriges pour que le dashboard reflete fidelement ce qui est collecte.

---

## 2. Inventaire des questions collectees

### 2.1 Formulaire MEMBRES (index.html)

| # | Cle JSON | Libelle affiche | Type | Parcours | Conditionnelle |
|---|----------|----------------|------|----------|----------------|
| M1 | `type` | "De quelle experience souhaitez-vous nous parler ?" | Choix unique (`energie`/`lucidite`) | Tous | Non |
| M2 | `contexte.sport` | "Quelle activite avez-vous pratiquee ?" (Yoga/Padel) | Choix unique | Energie | Oui (type=energie) |
| M3 | `contexte.atelier` | "Quel atelier avez-vous vecu ?" (7 ateliers) | Choix unique | Lucidite | Oui (type=lucidite) |
| M4 | `phases["Comment avez-vous vecu l'accueil ?"]` etc. | 6 phases Energie / 5 phases Lucidite (voir scales.js L13-29) | Notes 0-10 | Selon type | Non |
| M5a | `echelles.avant` | "Comment vous sentiez-vous en arrivant ?" | Note 0-10 | Energie | Oui (membre_energie) |
| M5b | `echelles.apres` | "Et maintenant, comment vous sentez-vous ?" | Note 0-10 | Energie | Oui (membre_energie) |
| M5c | `echelles.rythme` | "La seance etait-elle a votre rythme ?" | Note 0-10 | Energie | Oui (membre_energie) |
| M5d | `echelles.plaisir` | "Avez-vous pris du plaisir a bouger ?" | Note 0-10 | Energie | Oui (membre_energie) |
| M5e | `echelles.coach` | "Comment avez-vous trouve l'accompagnement du coach ?" | Note 0-10 | Energie | Oui (membre_energie) |
| M6a | `echelles.echanges` | "Comment avez-vous trouve les echanges avec le groupe ?" | Note 0-10 | Lucidite | Oui (membre_lucidite) |
| M6b | `echelles.clarte` | "Cet atelier vous a-t-il aide a voir plus clair ?" | Note 0-10 | Lucidite | Oui (membre_lucidite) |
| M6c | `echelles.outils` | "Repartez-vous avec quelque chose de concret ?" | Note 0-10 | Lucidite | Oui (membre_lucidite) |
| M6d | `echelles.elan` | "Sentez-vous une envie de faire bouger les choses ?" | Note 0-10 | Lucidite | Oui (membre_lucidite) |
| M6e | `echelles.animation` | "Comment avez-vous trouve l'animation de l'atelier ?" | Note 0-10 | Lucidite | Oui (membre_lucidite) |
| M7 | `nps` | NPS : "Imaginez qu'un proche..." | Note 0-10 | Tous | Non |
| M8a | `ouvertes["Qu'emportez-vous avec vous apres cette seance ?"]` | Texte libre | Energie | Oui |
| M8b | `ouvertes["Y a-t-il un moment qui vous a particulierement marque ?"]` | Texte libre | Energie | Oui |
| M8c | `ouvertes["Si vous pouviez changer une chose pour la prochaine fois ?"]` | Texte libre | Energie | Oui |
| M9a | `ouvertes["Qu'est-ce qui vous a le plus touche ou surpris aujourd'hui ?"]` | Texte libre | Lucidite | Oui |
| M9b | `ouvertes["Si vous pouviez changer une chose pour le prochain atelier ?"]` | Texte libre | Lucidite | Oui |

### 2.2 Formulaire INTERVENANTS (intervenant.html)

| # | Cle JSON | Libelle affiche | Type | Parcours | Conditionnelle |
|---|----------|----------------|------|----------|----------------|
| I1 | `type` | "Quelle seance venez-vous d'animer ?" | Choix unique | Tous | Non |
| I2 | `contexte.sport` | "Quelle activite avez-vous animee ?" | Choix unique | Energie | Oui |
| I3 | `contexte.atelier` | "Quel atelier avez-vous anime ?" | Choix unique | Lucidite | Oui |
| I4 | `phases[...]` | 6 phases Energie / 4 phases Lucidite (PHASES_INTERVENANT, scales.js L32-47) | Notes 0-10 | Selon type | Non |
| I5a | `echelles.groupe` | "Comment avez-vous senti le groupe aujourd'hui ?" | Note 0-10 | Energie | Oui (intervenant_energie) |
| I5b | `echelles.adapt` | "Avez-vous pu adapter la seance comme vous le souhaitiez ?" | Note 0-10 | Energie | Oui |
| I5c | `echelles.cadre` | "Les conditions etaient-elles reunies pour bien travailler ?" | Note 0-10 | Energie | Oui |
| I5d | `echelles.moi` | "Comment vous etes-vous senti dans votre role ?" | Note 0-10 | Energie | Oui |
| I6a | `echelles.groupe` | "Comment avez-vous senti le groupe pendant l'atelier ?" | Note 0-10 | Lucidite | Oui (intervenant_lucidite) |
| I6b | `echelles.contenu` | "Le contenu de l'atelier a-t-il bien fonctionne ?" | Note 0-10 | Lucidite | Oui |
| I6c | `echelles.cadre` | "Les conditions etaient-elles reunies pour un bon atelier ?" | Note 0-10 | Lucidite | Oui |
| I6d | `echelles.moi` | "Comment vous etes-vous senti dans l'animation ?" | Note 0-10 | Lucidite | Oui |
| I7 | `nps` | NPS intervenants | Note 0-10 | Tous | Non |
| I8a-c | `ouvertes[...]` | 3 questions ouvertes Energie (scales.js L163-170) | Texte libre | Energie | Oui |
| I9a-c | `ouvertes[...]` | 3 questions ouvertes Lucidite (scales.js L174-180) | Texte libre | Lucidite | Oui |
| I10a | `greatly.logistique` | "Comment trouvez-vous la logistique autour de vos interventions ?" | Note 0-10 | Tous | Non |
| I10b | `greatly.admin` | "Etes-vous satisfait du suivi administratif ?" | Note 0-10 | Tous | Non |
| I10c | `greatly.pedagogie` | "Comment vivez-vous l'accompagnement pedagogique ?" | Note 0-10 | Tous | Non |
| I10d | `greatly.communication` | "La communication interne vous convient-elle ?" | Note 0-10 | Tous | Non |
| I10e | `greatly.cadre` | "Que pensez-vous du cadre et du confort des lieux ou vous intervenez ?" | Note 0-10 | Tous | Non |
| I10f | `greatly.relation` | "Comment decririez-vous votre relation avec l'equipe Greatly ?" | Note 0-10 | Tous | Non |
| I11a | `greatly_ouvertes["Y a-t-il quelque chose qui vous faciliterait la vie au quotidien ?"]` | Texte libre | Tous | Non |
| I11b | `greatly_ouvertes["Qu'aimeriez-vous nous partager pour que notre collaboration grandisse ?"]` | Texte libre | Tous | Non |

### 2.3 Formulaire PROSPECTS (prospect.html)

| # | Cle JSON | Libelle affiche | Type | Conditionnelle |
|---|----------|----------------|------|----------------|
| P1 | `source` | "Comment nos chemins se sont-ils croises ?" | Choix unique (6 options) | Non |
| P2 | `impression` | "Votre premiere impression en decouvrant Greatly" | Note 0-10 | Non |
| P3 | `clarte` | "Vous avez compris ce que Greatly propose" | Note 0-10 | Non |
| P4 | `pertinence` | "Ce que Greatly propose resonne avec ce que vous vivez" | Note 0-10 | Non |
| P5 | `freins` | "Y a-t-il des choses qui vous retiennent aujourd'hui ?" | Multi-choix (7 options) | Non |
| P6 | `attraits` | "Et a l'inverse, qu'est-ce qui vous a touche ou donne envie ?" | Multi-choix (6 options) | Non |
| P7 | `valeur` | "Le programme vous semble a la hauteur de ce qu'il represente" | Note 0-10 | Non |
| P8 | `projection` | "Vous vous imaginez rejoindre un groupe Greatly ?" | Note 0-10 | Non |
| P9 | `nps` | "Parleriez-vous de Greatly a un dirigeant de votre entourage ?" | Note 0-10 | Non |
| P10 | `ouvertes["Ce qui ferait franchir le pas"]` | Texte libre | Non |
| P11 | `ouvertes["Un dernier mot"]` | Texte libre | Non |

---

## 3. Inventaire des elements du dashboard

### 3.1 Vue standard (Tous / Energie / Lucidite)

| # | Element | Type | Donnees consommees | Source |
|---|---------|------|-------------------|--------|
| D1 | KPI "NPS global" | Texte | `D.npsGlobal` / `D.npsEnergie` / `D.npsLucidite` | **Fictif** (charts.js L66-68) |
| D2 | KPI "Energie avant -> apres" | Texte | `D.energieAvant`, `D.energieApres` | **Fictif** (charts.js L71-72) |
| D3 | KPI "Recul & clarte (Lucidite)" | Texte | `D.qLucidite[0].data` | **Fictif** (charts.js L106) |
| D4 | KPI "Taux de reponse" | Texte | Valeurs en dur (76/82/78%) | **Fictif** (charts.js L424-426) |
| D5 | Graphique "Evolution du NPS" | Line chart | `D.npsEnergie`, `D.npsLucidite`, `D.npsGlobal` | **Fictif** |
| D6 | Graphique "Energie ressentie avant/apres seance" | Line chart | `D.energieAvant`, `D.energieApres` | **Fictif** |
| D7 | Graphique "Repartition NPS" | Stacked bar | `D.npsPromo`, `D.npsPassif`, `D.npsDetrac` | **Fictif** |
| D8 | Graphique "NPS par atelier Lucidite" | Bar chart | `D.ateliersNoms`, `D.ateliersNPS` | **Fictif** |
| D9 | Graphique "Par sport Yoga vs Padel" | Bar chart | `D.sportsNPS`, `D.sportsNote` | **Fictif** |
| D10 | Graphique "Seance Energie, etape par etape" | Horizontal bar | `D.phasesENoms`, `D.phasesENote` | **Fictif** |
| D11 | Graphique "Rencontre Lucidite, etape par etape" | Horizontal bar | `D.phasesLNoms`, `D.phasesLNote` | **Fictif** |
| D12 | Grille "Detail par question" Energie | Mini cards + sparklines | `D.qEnergie` (4 items) | **Fictif** |
| D13 | Grille "Detail par question" Lucidite | Mini cards + sparklines | `D.qLucidite` (5 items) | **Fictif** |
| D14 | Graphique "Par intervenant" | Line chart | `D.coachYoga`, `D.coachPadel` | **Fictif** |
| D15 | Graphique "Les lieux" (synthese) | Horizontal bar | `D.lieuxNoms`, `D.lieuxNotes` | **Fictif** |
| D16 | Bloc "Derniers retours" | Verbatims | `VERBATIMS.energie`, `VERBATIMS.lucidite` | **Fictif** |
| D17 | Bloc "Points d'attention" | Alertes | `ALERTES` | **Fictif** |

### 3.2 Vue Lieux

| # | Element | Donnees consommees | Source |
|---|---------|-------------------|--------|
| D18 | KPI Greatly House | `D.lieuxNotes[0]` | **Fictif** |
| D19 | KPI Lieux sportifs | `D.lieuxNotes[1,2]` | **Fictif** |
| D20 | Vue d'ensemble | `D.lieuxNoms`, `D.lieuxNotes` | **Fictif** |
| D21 | Mini line Greatly House | `D.lieuxHouse` | **Fictif** |
| D22 | Mini line Lieux sportifs | `D.lieuxSport` | **Fictif** |
| D23 | Evolution par lieu | `D.lieuxHouse`, `D.lieuxSport` | **Fictif** |
| D24 | Verbatims lieux | `VERBATIMS.lieux` | **Fictif** |

### 3.3 Vue Futurs membres (Prospect)

| # | Element | Donnees consommees | Source |
|---|---------|-------------------|--------|
| D25 | KPI NPS prospect | `D.prospectNPS` | **Fictif** |
| D26 | KPI Premiere impression | `D.prospectImpression` | **Fictif** |
| D27 | KPI Clarte de l'offre | `D.prospectClarte` | **Fictif** |
| D28 | KPI Projection | `D.prospectProjection` | **Fictif** |
| D29 | Sources de decouverte (doughnut) | `D.sourcesLabels`, `D.sourcesData` | **Fictif** |
| D30 | Perception valeur (line) | `D.prospectImpression` (!) | **Fictif** |
| D31 | Freins (hbar) | `D.freinsLabels`, `D.freinsData` | **Fictif** |
| D32 | Attraits (hbar) | `D.attraitsLabels`, `D.attraitsData` | **Fictif** |
| D33 | NPS prospect (line) | `D.prospectNPS` | **Fictif** |
| D34 | Pertinence vs Projection | `D.prospectPertinence`, `D.prospectProjection` | **Fictif** |
| D35 | Verbatims "franchir le pas" | `VERBATIMS.prospect.pas` | **Fictif** |
| D36 | Verbatims suggestions | `VERBATIMS.prospect.suggestions` | **Fictif** |

### 3.4 Vue Intervenants + Greatly

| # | Element | Donnees consommees | Source |
|---|---------|-------------------|--------|
| D37 | KPI Satisfaction globale | Moyenne de `D.igScores` | **Fictif** |
| D38 | KPI Logistique | `D.igScores[0]` | **Fictif** |
| D39 | KPI Accompagnement pedagogique | `D.igScores[2]` | **Fictif** |
| D40 | KPI Relation equipe | `D.igScores[5]` | **Fictif** |
| D41 | Radar/bar 6 dimensions | `D.igLabels`, `D.igScores` | **Fictif** |
| D42 | Evolution satisfaction | `D.igEvol` | **Fictif** |
| D43 | KPI + sparkline Administratif | `D.igScores[1]`, `D.igAdmin` | **Fictif** |
| D44 | KPI + sparkline Communication | `D.igScores[3]`, `D.igComm` | **Fictif** |
| D45 | Cadre & lieux intervenants | `D.igCadre`, `D.lieuxSport` | **Fictif** |
| D46 | Verbatims "faciliterait la vie" | `VERBATIMS_IG.facilite` | **Fictif** |
| D47 | Verbatims "collaboration grandisse" | `VERBATIMS_IG.collab` | **Fictif** |

### 3.5 Filtres du dashboard

| Filtre | Cle | Valeurs | Fichier | Ligne |
|--------|-----|---------|---------|-------|
| Type de vue | `F.type` | `tous`, `energie`, `lucidite`, `lieux`, `ivgreatly`, `prospect` | filters.js L6 | dashboard.html L236-241 |
| Qui | `F.who` | `tous`, `membres`, `intervenants` | filters.js L6 | dashboard.html L243-247 |
| Periode | `F.period` | `3`, `6`, `12` (mois) | filters.js L6 | dashboard.html L248-252 |
| Activite (navbar) | `F.act` | `tous`, `yoga`, `padel` | filters.js L6 | dashboard.html L170-173 |
| Coach | `F.coach` | `yoga`, `padel` | filters.js L6 | dashboard.html L335-338 |

---

## 4. Matrice de correspondance

### 4.1 Questions membres/intervenants -> Dashboard

| Question collectee | Cle JSON | Element(s) dashboard | Couvert ? |
|-------------------|----------|---------------------|-----------|
| Type (energie/lucidite) | `type` | Filtre F.type | OUI (filtre) |
| Sport (Yoga/Padel) | `contexte.sport` | Filtre F.act, D9 (Yoga vs Padel) | OUI (filtre + graphique) |
| Atelier (1-7) | `contexte.atelier` | D8 (NPS par atelier) | PARTIEL (voir ecart E3) |
| **Phases du deroule** (6 Energie, 5 Lucidite membres / 6+4 intervenants) | `phases[nom_phase]` | D10 (phases Energie), D11 (phases Lucidite) | PARTIEL (voir ecarts E1, E2) |
| Echelle `avant` (membre Energie) | `echelles.avant` | D2 (KPI), D6 (graphique) | OUI (intention) |
| Echelle `apres` (membre Energie) | `echelles.apres` | D2 (KPI), D6 (graphique) | OUI (intention) |
| Echelle `rythme` (membre Energie) | `echelles.rythme` | D12 label "Rythme de la seance" | OUI (intention) |
| Echelle `plaisir` (membre Energie) | `echelles.plaisir` | D12 label "Plaisir a bouger" | OUI (intention) |
| Echelle `coach` (membre Energie) | `echelles.coach` | D12 label "Qualite de l'intervenant", D14 | OUI (intention) |
| Echelle `echanges` (membre Lucidite) | `echelles.echanges` | D13 label "Qualite des echanges" | OUI (intention) |
| Echelle `clarte` (membre Lucidite) | `echelles.clarte` | D3 (KPI), D13 label "Recul & clarte" | OUI (intention) |
| Echelle `outils` (membre Lucidite) | `echelles.outils` | D13 label "Outils & methodes" | OUI (intention) |
| Echelle `elan` (membre Lucidite) | `echelles.elan` | D13 label "Elan apres la rencontre" | OUI (intention) |
| Echelle `animation` (membre Lucidite) | `echelles.animation` | -- | **NON** (voir ecart E4) |
| NPS (membre + intervenant) | `nps` | D1 (KPI), D5, D7, D8, D9 | OUI (intention) |
| Questions ouvertes membres | `ouvertes[...]` | D16 (Derniers retours) | PARTIEL (voir ecart E5) |
| Questions ouvertes intervenants | `ouvertes[...]` | D17 (Points d'attention) | PARTIEL (voir ecart E6) |
| **Echelle `groupe` (intervenant)** | `echelles.groupe` | -- | **NON** (voir ecart E7) |
| **Echelle `adapt` (intervenant Energie)** | `echelles.adapt` | -- | **NON** (voir ecart E7) |
| **Echelle `cadre` (intervenant)** | `echelles.cadre` | -- | **NON** (voir ecart E7) |
| **Echelle `moi` (intervenant)** | `echelles.moi` | -- | **NON** (voir ecart E7) |
| **Echelle `contenu` (intervenant Lucidite)** | `echelles.contenu` | -- | **NON** (voir ecart E7) |
| Greatly `logistique` | `greatly.logistique` | D38 (KPI), D41 (radar) | OUI (intention) |
| Greatly `admin` | `greatly.admin` | D43 (KPI + sparkline) | OUI (intention) |
| Greatly `pedagogie` | `greatly.pedagogie` | D39 (KPI), D41 | OUI (intention) |
| Greatly `communication` | `greatly.communication` | D44 (KPI + sparkline) | OUI (intention) |
| Greatly `cadre` | `greatly.cadre` | D45 | OUI (intention) |
| Greatly `relation` | `greatly.relation` | D40 (KPI), D41 | OUI (intention) |
| Greatly ouvertes "faciliterait la vie" | `greatly_ouvertes[...]` | D46 | OUI (intention) |
| Greatly ouvertes "collaboration grandisse" | `greatly_ouvertes[...]` | D47 | OUI (intention) |

### 4.2 Questions prospects -> Dashboard

| Question collectee | Cle JSON | Element dashboard | Couvert ? |
|-------------------|----------|------------------|-----------|
| Source | `source` | D29 (Sources doughnut) | OUI (intention, mais labels divergents -- voir E8) |
| Impression | `impression` | D26 (KPI), D30 (!) | PARTIEL (voir ecart E9) |
| Clarte | `clarte` | D27 (KPI) | OUI (intention) |
| Pertinence | `pertinence` | D34 (Pertinence vs Projection) | OUI (intention) |
| Freins | `freins` | D31 (Freins hbar) | PARTIEL (voir ecart E10) |
| Attraits | `attraits` | D32 (Attraits hbar) | PARTIEL (voir ecart E11) |
| Valeur | `valeur` | -- pas de KPI dedie | **NON** (voir ecart E12) |
| Projection | `projection` | D28 (KPI), D34 | OUI (intention) |
| NPS prospect | `nps` | D25 (KPI), D33 | OUI (intention) |
| Ouvertes "franchir le pas" | `ouvertes[...]` | D35 | OUI (intention) |
| Ouvertes "dernier mot" | `ouvertes[...]` | D36 (label "Suggestions d'amelioration") | PARTIEL (voir ecart E13) |

---

## 5. Liste des ecarts

### Categorie A : Questions collectees mais jamais affichees (orphelines)

| ID | Description | Fichier/Ligne | Gravite |
|----|-------------|---------------|---------|
| **E4** | **`echelles.animation` (membre Lucidite)** : "Comment avez-vous trouve l'animation de l'atelier ?" est collecte (scales.js L88-90) et serialise (submit.js L42-47) mais n'apparait nulle part dans le dashboard. Le graphique D13 affiche 5 questions Lucidite dont "Greatly House (cadre)" (charts.js L110) qui provient de la question phases "Que pensez-vous de la Greatly House ?", pas de `echelles.animation`. | scales.js L88-90, charts.js L97-111 | **Elevee** |
| **E7** | **Toutes les echelles intervenants** (`groupe`, `adapt`, `cadre`, `moi`, `contenu`) sont collectees (scales.js L94-123) mais aucune n'est restituee dans le dashboard. La vue "Intervenants + Greatly" (charts.js L1022-1119) n'affiche que les 6 dimensions "Greatly & vous", pas les echelles de seance des intervenants. | scales.js L94-123, charts.js L1022-1119 | **Elevee** |
| **E12** | **`valeur` (prospect)** : "Le programme vous semble a la hauteur de ce qu'il represente" est collecte (prospect.html L280) mais n'a aucun KPI ni graphique dedie dans la vue prospect du dashboard. Le graphique "Perception de la valeur" (D30) utilise `D.prospectImpression` (charts.js L933), pas `D.prospectValeur` qui n'existe meme pas. | prospect.html L280, charts.js L929-936 | **Elevee** |

### Categorie B : Elements fantomes (dashboard lit des donnees non collectees)

| ID | Description | Fichier/Ligne | Gravite |
|----|-------------|---------------|---------|
| **E14** | **Taux de reponse (D4)** : Le KPI affiche 76%/82%/78% codes en dur (charts.js L424-426). Aucun formulaire ne collecte cette information. Le calcul reel necessitera de connaitre le nombre d'envois (non prevu dans l'API). | charts.js L424-426 | **Moyenne** |
| **E15** | **Repartition NPS (D7)** : Le graphique affiche promoteurs/passifs/detracteurs sous forme de pourcentages pre-calcules (`D.npsPromo/Passif/Detrac`, charts.js L75-77). En realite, ces categories doivent etre calculees a partir des notes NPS brutes collectees (note 9-10 = promoteur, 7-8 = passif, 0-6 = detracteur). Les donnees fictives sont des pourcentages fictifs, pas un calcul reel. | charts.js L75-77, L492-516 | **Faible** (normal en mode demo) |
| **E16** | **D13 "Greatly House (cadre)"** : Le dashboard affiche un item "Greatly House (cadre)" dans le detail par question Lucidite (charts.js L110). Cet item ne correspond a aucune echelle collectee -- la question lieu pour les membres Lucidite est dans les `phases` ("Que pensez-vous de la Greatly House ?", scales.js L27), pas dans les `echelles`. | charts.js L110, scales.js L27 | **Moyenne** |
| **E17** | **Lieux avec noms specifiques** : Le dashboard nomme les lieux "Greatly House", "Studio Yoga (Lille)", "Club Padel (Villeneuve)" (charts.js L118). Or, les formulaires ne collectent pas le nom du lieu -- seulement une note par phase "lieu" (phases Energie L20-21, phases Lucidite L27). Il n'y a pas de champ pour distinguer quel lieu sportif. | charts.js L118, scales.js L20-21, L27 | **Moyenne** |

### Categorie C : Cles/labels incoherents

| ID | Description | Fichier/Ligne | Gravite |
|----|-------------|---------------|---------|
| **E1** | **Phases Energie -- noms divergents** : Le formulaire collecte les phases avec les libelles complets comme cles (ex: `phases["Comment avez-vous vecu l'accueil ?"]`, via submit.js L34). Le dashboard affiche des labels raccourcis differents : "Accueil & briefing", "Echauffement", "Corps de seance", "Retour au calme", "Temps d'echange" (charts.js L89). Or, les phases du formulaire sont : "Accueil", "Echauffement", "Coeur de seance", "Recuperation", "Cloture", "Lieu" (scales.js L14-21). Les noms ne correspondent pas, et la phase "Lieu" (6e) n'apparait pas dans le graphique D10 (qui n'a que 5 barres). | submit.js L34, charts.js L89, scales.js L14-21 | **Elevee** |
| **E2** | **Phases Lucidite -- noms divergents et nombre different** : Le formulaire collecte 5 phases Lucidite : Accueil, Brunch, Atelier, Debrief/Cloture, Greatly House (scales.js L22-28). Le dashboard n'affiche que 4 labels : "Accueil", "Brunch", "Atelier", "Greatly House" (charts.js L93). La phase "Debrief et cloture" (scales.js L26) est absente du graphique. | scales.js L22-28, charts.js L93-94 | **Elevee** |
| **E3** | **Noms d'ateliers Lucidite divergents** : Le formulaire propose les ateliers "1 . Le cadre (juin)", "2 . Les decisions (juillet)", etc. (scales.js L221-229). Le dashboard affiche des noms d'ateliers completement differents : "1. Miroir", "2. Gouvernail", "3. Compas", etc. (charts.js L80). | scales.js L221-229, charts.js L80 | **Elevee** |
| **E8** | **Sources prospect -- labels divergents** : Le formulaire propose les sources "Bouche-a-oreille", "Reseaux sociaux", "Site web", "Evenement", "Presse", "Autre" (prospect.html L46-51, serialisees via `data-v`). Le dashboard affiche "Bouche-a-oreille", "LinkedIn", "Site web", "Evenement", "Autre" (charts.js L131). "Reseaux sociaux" != "LinkedIn", et "Presse" est absente du dashboard. | prospect.html L46-51, charts.js L131 | **Moyenne** |
| **E9** | **Graphique "Perception de la valeur"** utilise `D.prospectImpression` (charts.js L933) au lieu de `D.prospectValeur` qui n'existe pas. Le libelle du graphique dit "L'investissement est justifie" ce qui correspond a la question `valeur`, pas `impression`. Confusion entre deux questions distinctes. | charts.js L929-936 | **Elevee** |
| **E13** | **Verbatim prospect "Un dernier mot"** affiche comme "Suggestions d'amelioration" dans le dashboard (dashboard.html L475-476). La question reelle est "Un dernier mot, une idee, quelque chose que vous aimeriez nous dire ?" (prospect.html L144), ce qui est plus large que de simples suggestions. | prospect.html L144, dashboard.html L475 | **Faible** |

### Categorie D : Echelles incoherentes

| ID | Description | Fichier/Ligne | Gravite |
|----|-------------|---------------|---------|
| **E18** | **NPS dashboard vs NPS formulaire** : Le formulaire collecte le NPS sur une echelle 0-10 (note brute). Le dashboard affiche le NPS sous forme de score NPS calcule (-100 a +100) dans les donnees fictives (ex: "+82", charts.js L66-68). La conversion entre notes brutes et score NPS devra etre implementee cote serveur. Ce n'est pas un bug mais une transformation a prevoir. | charts.js L66-68, submit.js L52-53 | **Faible** (attendu) |

### Categorie E : Filtres sans effet reel

| ID | Description | Fichier/Ligne | Gravite |
|----|-------------|---------------|---------|
| **E19** | **Filtre "Qui" (membres/intervenants)** : Le filtre `F.who` (filters.js L6, dashboard.html L243-247) n'est utilise nulle part dans la fonction `render()` ni dans aucune sous-fonction de `charts.js`. Les donnees fictives ne distinguent pas les reponses membres des reponses intervenants. | filters.js L6, charts.js passim | **Moyenne** |
| **E20** | **Filtre "Activites" (navbar)** : Le filtre `F.act` (yoga/padel/tous) est stocke (dashboard.html L718) mais n'est lu dans aucune fonction de rendu de `charts.js`. Le clic declenche bien `render()` mais les graphiques ne filtrent pas par activite. | dashboard.html L713-723, charts.js passim | **Moyenne** |

### Categorie F : Profils/parcours non couverts dans le dashboard

| ID | Description | Fichier/Ligne | Gravite |
|----|-------------|---------------|---------|
| **E21** | **Aucune vue dediee "seance intervenants"** : Les intervenants remplissent des echelles de seance (groupe, adapt, cadre, moi, contenu) et des phases. Le dashboard n'a aucune section pour visualiser ces donnees. La vue "Intervenants + Greatly" ne montre que les 6 dimensions "Greatly & vous". | charts.js L1022-1119 | **Elevee** |
| **E22** | **Phases intervenants** : Les intervenants ont leurs propres libelles de phases (PHASES_INTERVENANT, scales.js L32-47), differents des membres. Le dashboard ne distingue pas les deux sources et n'affiche pas les phases intervenants separement. | scales.js L32-47 | **Moyenne** |

---

## 6. Tableau recapitulatif des ecarts par gravite

| Gravite | Nombre | IDs |
|---------|--------|-----|
| **Elevee** | 7 | E1, E2, E3, E4, E7, E9, E21 |
| **Moyenne** | 7 | E8, E14, E16, E17, E19, E20, E22 |
| **Faible** | 4 | E13, E15, E18, E12 (recategorise en Elevee ci-dessus) |

Correction : E12 est Elevee (question collectee mais jamais affichee, et graphique "valeur" utilise les mauvaises donnees).

---

## 7. Recommandations

### Priorite 1 -- A corriger avant le passage en mode reel

1. **Aligner les noms d'ateliers Lucidite** (E3) : Remplacer les noms fictifs "Miroir", "Gouvernail", etc. dans `charts.js` L80 par les vrais noms "Le cadre", "Les decisions", etc. definis dans `scales.js` L221-229, ou mieux, lire les noms directement depuis les donnees collectees.

2. **Aligner les labels de phases Energie** (E1) : Les 5 labels de `D.phasesENoms` (charts.js L89) doivent correspondre aux 6 phases reelles du formulaire (scales.js L14-21). Ajouter la phase "Lieu" manquante.

3. **Ajouter la phase "Debrief et cloture" Lucidite** (E2) : `D.phasesLNoms` (charts.js L93) n'a que 4 labels alors que le formulaire collecte 5 phases (scales.js L22-28).

4. **Creer un graphique pour `echelles.animation`** (E4) : Ajouter une carte dans le detail par question Lucidite (D13), ou integrer la note d'animation dans la grille existante.

5. **Corriger le graphique "Perception de la valeur"** (E9, E12) : Ce graphique doit consommer la cle `valeur` (note prospect sur le rapport qualite/prix) et non `impression`. Creer le jeu de donnees `D.prospectValeur` quand les donnees reelles seront disponibles.

6. **Ajouter une section "Seance vue par les intervenants"** (E7, E21) : Creer une sous-vue ou un onglet dans la section "Intervenants + Greatly" pour afficher les echelles de seance des intervenants (groupe, adapt, cadre, moi, contenu) et leurs phases.

### Priorite 2 -- A corriger pour la coherence

7. **Aligner les labels de sources prospect** (E8) : Harmoniser les labels entre le formulaire (`data-v` de prospect.html L46-51) et le dashboard (charts.js L131). Notamment "Reseaux sociaux" vs "LinkedIn" et l'absence de "Presse".

8. **Implementer les filtres "Qui" et "Activites"** (E19, E20) : Ces filtres existent dans l'UI mais ne modifient pas le rendu. Quand les donnees reelles arriveront, chaque fonction de rendu devra lire `F.who` et `F.act` pour filtrer les reponses.

9. **Renommer le bloc "Suggestions d'amelioration"** (E13) : Le titre dans le dashboard ne correspond pas a la question posee ("Un dernier mot, une idee..."). Adapter le titre du bloc.

10. **Clarifier la source de donnees "Lieux"** (E17) : Soit ajouter une question de lieu explicite dans le formulaire (quel studio de yoga ? quel club de padel ?), soit alimenter les donnees lieux a partir des phases existantes et du contexte (sport=Yoga/Padel).

### Priorite 3 -- A prevoir pour le passage en mode reel

11. **Implementer le calcul NPS reel** (E18) : Transformer les notes brutes 0-10 en score NPS (-100 a +100) cote relais Apps Script.

12. **Implementer le taux de reponse** (E14) : Prevoir un mecanisme pour connaitre le nombre d'envois (via un compteur dans Google Sheets ou une liste de membres actifs) afin de calculer le taux de reponse reel.

13. **Prevoir la restitution des phases intervenants** (E22) : Quand les donnees reelles arriveront, distinguer les phases membres des phases intervenants (labels differents) pour eviter de melanger les deux.

14. **Supprimer `D.qLucidite[4]` "Greatly House (cadre)"** (E16) : Cet item dans le detail par question n'est pas une echelle collectee mais une phase. Le deplacer dans le bloc phases ou le renommer pour indiquer clairement sa source.
