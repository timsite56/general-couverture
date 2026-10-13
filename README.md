# Général Couverture — site « studio » (3D + multipage)

Site de Général Couverture (Isaac, couvreur à Angers), en ligne sur https://generalcouverture.com. Direction artistique du 13/10/2026 inspirée de composites.archi : fond gris chaud, titres en capitales grasses (Archivo), en-tête minimal avec indicateur de section, carrousel 3D de cartes pour les services, bande de réalisations en perspective avec curseurs avant/après.

## Structure

- `gen.py` : **générateur**. Tout le contenu (coordonnées, 6 services, 16 communes, avis, FAQ, avant/après) est dans ce fichier. `python3 gen.py` réécrit toutes les pages, `sitemap.xml` et `robots.txt`. Les liens sont générés sans `.html` (le Worker Cloudflare sert `/page`). Python 3.9 : pas de backslash ni de guillemets imbriqués dans les f-strings.
- `index.html` : expérience 3D au scroll (scène Three.js épinglée, textes à côté sur grand écran, sous la scène sur mobile), carrousel des services, méthode, entreprise, réalisations, avis, zone, FAQ, contact.
- Pages : `renovation-reparation-toiture`, `pose-toiture-neuve`, `entretien-demoussage`, `zinguerie`, `pose-velux`, `peinture-toiture`, `zones-intervention`, `contact`, `mentions-legales`, `404`.
- `css/studio.css` : la feuille de style. `js/app.js` : scène 3D générée en code (fond clair, la scène passe en sombre avec le bouton « Nuit »). `js/site.js` : indicateur de section, menu plein écran, carrousel 3D (CSS 3D, glisser / molette / flèches / numéros), bande en perspective, curseurs avant/après, formulaire Web3Forms.
- `images/ba/` : paires avant/après. Les « après » sont les vraies photos de chantier d'Isaac ; les « avant » ont été générés avec kie.ai (Nano Banana Pro) à partir de ces photos, même cadrage.
- `images/srv-*.jpg` : photos de service (banque Passion Couverture, tuile).

## Modifier le site

1. Éditer `gen.py` (textes, services, communes, avant/après), puis lancer `python3 gen.py`.
2. Pour le style : `css/studio.css`. Pour la 3D : `js/app.js` (dimensions de la maison en tête de fichier).
3. Recopier le dossier dans un clone du dépôt `timsite56/general-couverture` et pousser sur `main` : le Worker Cloudflare se redéploie seul en une minute.

Paramètres d'URL utiles pour les captures de contrôle : `?step=3&f=0.6` (chapitre 3D), `?to=%23services` (défiler jusqu'à une section), `?no3d=1` (masquer l'expérience 3D).
