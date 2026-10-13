# Général Couverture — site 3D multipage

Site de Général Couverture (Isaac, couvreur à Angers), en ligne sur https://generalcouverture.com. Refonte du 13/10/2026.

## Structure

- `build.py` : **générateur**. Tout le contenu (coordonnées, 6 services, 16 communes, avis, FAQ, galerie) est dans ce fichier. `python3 build.py` réécrit toutes les pages HTML, `sitemap.xml` et `robots.txt`.
- `index.html` : accueil, avec l'expérience 3D au scroll (scène Three.js épinglée, textes à côté sur grand écran et sous la scène sur mobile) puis services, méthode, à propos, réalisations, avis, zone, FAQ, contact.
- `renovation-reparation-toiture.html`, `pose-toiture-neuve.html`, `entretien-demoussage.html`, `zinguerie.html`, `pose-velux.html`, `peinture-toiture.html` : une page par service (les services de Passion Couverture sans la peinture et le ravalement).
- `zones-intervention.html`, `contact.html`, `mentions-legales.html`, `404.html`.
- `css/site.css` : thème (ivoire + terre cuite, Manrope), mobile-first.
- `js/app.js` : scène 3D générée en code (maison, charpente, tuiles, cheminée, fuite, pluie), chronologie pilotée par le scroll. `js/site.js` : menu mobile, formulaire (Web3Forms).
- `images/` : photos de service (banque Passion Couverture, tuile), vraies photos de chantier d'Isaac (`photo-*.webp`), avant/après (`gallery*.jpg`).

## Modifier le site

1. Éditer `build.py` (textes, services, communes…), puis lancer `python3 build.py`.
2. Pour le style : `css/site.css`. Pour la 3D : `js/app.js` (dimensions de la maison en tête de fichier).
3. Recopier le dossier dans un clone du dépôt `timsite56/general-couverture` et pousser sur `main` : le Worker Cloudflare se redéploie seul en une minute.

Paramètres d'URL utiles pour les captures de contrôle : `?step=3&f=0.6` (chapitre 3D), `?to=%23services` (défiler jusqu'à une section), `?no3d=1` (masquer l'expérience 3D).
