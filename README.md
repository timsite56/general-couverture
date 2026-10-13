# Général Couverture — site « atelier » (3D + multipage)

Site de Général Couverture (Isaac, couvreur à Angers), en ligne sur https://generalcouverture.com. Direction artistique sombre et éditoriale du 13/10/2026 : serif Fraunces, accents cuivre, logo SVG (toit et cheminée), grain, apparitions au défilement, curseurs avant/après.

## Structure

- `generate.py` : **générateur**. Tout le contenu (coordonnées, 6 services, 16 communes, avis, FAQ, avant/après) est dans ce fichier. `python3 generate.py` réécrit toutes les pages, `sitemap.xml` et `robots.txt`. Les liens sont générés sans `.html` (le Worker Cloudflare sert `/page`).
- `index.html` : expérience 3D au scroll (scène Three.js épinglée, textes à côté sur grand écran, sous la scène sur mobile), puis chiffres clés, services en liste éditoriale, méthode, entreprise, avant/après à curseur, avis, zone, FAQ, contact.
- `renovation-reparation-toiture.html`, `pose-toiture-neuve.html`, `entretien-demoussage.html`, `zinguerie.html`, `pose-velux.html`, `peinture-toiture.html`, `zones-intervention.html`, `contact.html`, `mentions-legales.html`, `404.html`.
- `css/atelier.css` : la feuille de style. `js/app.js` : scène 3D générée en code. `js/site.js` : en-tête transparent → verre au défilement, menu mobile, apparitions, curseurs avant/après, formulaire (Web3Forms).
- `images/ba/` : paires avant/après. Les « après » sont les vraies photos de chantier d'Isaac ; les « avant » ont été générés à partir de ces photos avec kie.ai (Nano Banana Pro), même cadrage, pour un curseur parfaitement aligné.
- `images/srv-*.jpg` : photos de service (banque Passion Couverture, tuile).

## Modifier le site

1. Éditer `generate.py` (textes, services, communes, avant/après), puis lancer `python3 generate.py`.
2. Pour le style : `css/atelier.css`. Pour la 3D : `js/app.js` (dimensions de la maison en tête de fichier).
3. Recopier le dossier dans un clone du dépôt `timsite56/general-couverture` et pousser sur `main` : le Worker Cloudflare se redéploie seul en une minute.

Paramètres d'URL utiles pour les captures de contrôle : `?step=3&f=0.6` (chapitre 3D), `?to=%23services` (défiler jusqu'à une section), `?no3d=1` (masquer l'expérience 3D).
