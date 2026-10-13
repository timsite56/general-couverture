# Général Couverture — site « studio » v6 (maquette racontée au défilement + anneaux 3D)

Site de Général Couverture (Isaac, couvreur à Angers), en ligne sur https://generalcouverture.com. Version du 13/10/2026 (soir) : palette bleu nuit / crème / or champagne (celle du Comptoir de l'Habitat), capitales Archivo. En tête de page, la **maquette 3D racontée au défilement** (hero, le toit qui s'ouvre couche par couche, six désordres diagnostiqués avec leur réparation, l'entretien du versant nord, les quatre matières). Ensuite trois **anneaux 3D pilotés par le défilement** : les services tournent autour d'une maquette filaire dorée, la méthode tourne autour du numéro de l'étape, les réalisations avant/après tournent sur une roue.

## Structure

- `gen.py` : **générateur**. Tout le contenu (coordonnées, 6 services, 16 communes, avis, FAQ, avant/après, textes de l'atelier : `MATS`, `LAYERS`, `HOTSPOTS`) est dans ce fichier. `python3 gen.py` réécrit toutes les pages, `sitemap.xml` et `robots.txt`. Les liens sont générés sans `.html` (le Worker Cloudflare sert `/page`). Python 3.9 : pas de backslash ni de guillemets imbriqués dans les f-strings.
- `index.html` : expérience épinglée (10 étapes `.step` à gauche, scène collante à droite ; sur mobile la scène prend l'écran et le texte de l'étape s'affiche dans `#m-caption`), anneau des services, anneau de la méthode, entreprise, roue des réalisations, avis, zone, FAQ, contact.
- Pages : `renovation-reparation-toiture`, `pose-toiture-neuve`, `entretien-demoussage`, `zinguerie`, `pose-velux`, `peinture-toiture`, `zones-intervention`, `contact`, `mentions-legales`, `404`.
- `css/studio.css` : la feuille de style. Les sections portent la classe `navy` ou `cream`, qui redéfinit les variables `--bg / --fg / --fg-2 / --fg-muted / --ln / --card` ; tout le reste s'appuie sur ces variables.
- `js/app.js` : la maquette 3D (Three.js, géométrie générée en code, aucun fichier 3D). Chaque `.step` porte `data-kind` (hero, coupe, hs + `data-hs`, entretien, matieres) ; `targets()` déduit de la progression l'éclaté, la mousse, les défauts, la réparation (seconde moitié de chaque étape diagnostic) et la matière ; la caméra interpole `KEYS`/`HS[...].cam` d'une étape à l'autre. Les pastilles numérotées sur la maquette ramènent à l'étape correspondante, les puces de matières forcent une couverture.
- `js/site.js` : en-tête (verre bleu nuit au défilement, indicateur de section), menu plein écran, **anneaux 3D** (`.ring-section` épinglée de N × 62 vh, cartes sur un cylindre `rotateY`/`rotateX` + `translateZ`, fondu et flou selon la profondeur, glisser à la souris, points et flèches), curseurs avant/après, formulaire Web3Forms.
- `images/ba/` : paires avant/après (maison-1, maison-2, faîtage). Les « après » sont les vraies photos de chantier d'Isaac ; les « avant » ont été générés avec kie.ai (Nano Banana Pro) à partir de ces photos, même cadrage.
- `images/srv-*.jpg` : photos de service (banque Passion Couverture, tuile).

## Modifier le site

1. Éditer `gen.py` (textes, services, communes, avant/après, textes de l'atelier), puis lancer `python3 gen.py`.
2. Pour le style : `css/studio.css`. Pour la 3D : `js/app.js` (dimensions de la maison en tête de fichier, `KEYS` pour les cadrages).
3. Recopier le dossier dans un clone du dépôt `timsite56/general-couverture` et pousser sur `main` : le Worker Cloudflare se redéploie seul en une minute.

Paramètres d'URL utiles pour les captures de contrôle : `?step=1&f=0.85&instant` (étape 0 hero, 1 coupe, 2-7 diagnostics, 8 entretien, 9 matières ; `f` = progression dans l'étape, `instant` saute les transitions), `?mat=ardoise`, `?to=%23services`, `?no3d=1`.
