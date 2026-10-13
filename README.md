# Général Couverture — site « studio » v5 (atelier 3D + multipage)

Site de Général Couverture (Isaac, couvreur à Angers), en ligne sur https://generalcouverture.com. Version du 13/10/2026 : palette bleu nuit / crème / or champagne (celle du Comptoir de l'Habitat), capitales Archivo, **atelier 3D interactif** en tête de page, **cartes de services pilotées par le défilement**, méthode illustrée par quatre animations SVG, réalisations avant/après à curseur.

## Structure

- `gen.py` : **générateur**. Tout le contenu (coordonnées, 6 services, 16 communes, avis, FAQ, avant/après, textes de l'atelier : `MATS`, `LAYERS`, `HOTSPOTS`) est dans ce fichier. `python3 gen.py` réécrit toutes les pages, `sitemap.xml` et `robots.txt`. Les liens sont générés sans `.html` (le Worker Cloudflare sert `/page`). Python 3.9 : pas de backslash ni de guillemets imbriqués dans les f-strings.
- `index.html` : expérience épinglée (hero → atelier 3D sur 300 vh), cartes de services au défilement, méthode, entreprise, réalisations, avis, zone, FAQ, contact.
- Pages : `renovation-reparation-toiture`, `pose-toiture-neuve`, `entretien-demoussage`, `zinguerie`, `pose-velux`, `peinture-toiture`, `zones-intervention`, `contact`, `mentions-legales`, `404`.
- `css/studio.css` : la feuille de style. Les sections portent la classe `navy` ou `cream`, qui redéfinit les variables `--bg / --fg / --fg-2 / --fg-muted / --ln / --card` ; tout le reste s'appuie sur ces variables.
- `js/app.js` : la maquette 3D (Three.js, géométrie générée en code, aucun fichier 3D). Quatre modes dans le panneau : **Matières** (tuile terre cuite, tuile béton, ardoise, zinc à joint debout), **Coupe** (vue éclatée des cinq couches, couche mise en avant, replay de la pose), **Diagnostic** (six désordres cliquables sur la maquette, chacun relié à une page service, bouton « voir après intervention »), **Entretien** (curseur de nettoyage du versant nord, mousse et hydrofuge). Caméra : `KEYS` par mode, `HS[...].cam` par désordre.
- `js/site.js` : en-tête (verre bleu nuit au défilement, indicateur de section), menu plein écran, cartes 3D au défilement (`.deck-section`, section épinglée de N × 85 vh), bande en perspective, curseurs avant/après, formulaire Web3Forms.
- `images/ba/` : paires avant/après (maison-1, maison-2, faîtage). Les « après » sont les vraies photos de chantier d'Isaac ; les « avant » ont été générés avec kie.ai (Nano Banana Pro) à partir de ces photos, même cadrage.
- `images/srv-*.jpg` : photos de service (banque Passion Couverture, tuile).

## Modifier le site

1. Éditer `gen.py` (textes, services, communes, avant/après, textes de l'atelier), puis lancer `python3 gen.py`.
2. Pour le style : `css/studio.css`. Pour la 3D : `js/app.js` (dimensions de la maison en tête de fichier, `KEYS` pour les cadrages).
3. Recopier le dossier dans un clone du dépôt `timsite56/general-couverture` et pousser sur `main` : le Worker Cloudflare se redéploie seul en une minute.

Paramètres d'URL utiles pour les captures de contrôle : `?p=0.6&mode=coupe&explode=80` (atelier), `?p=0.6&mode=diagnostic&hs=mousse&after=1`, `?p=0.6&mode=entretien&clean=70`, `?mat=ardoise`, `?instant` (saute l'intro), `?to=%23services` (défiler jusqu'à une section), `?no3d=1` (masquer l'expérience 3D).
