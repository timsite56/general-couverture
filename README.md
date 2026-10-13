# Général Couverture — site 3D (démo)

Site vitrine « immersif » pour Isaac (Général Couverture, couvreur à Angers), inspiré des sites 3D de l'agence Bellabox.

- `index.html` : page complète (expérience 3D au scroll + sections services, à propos, réalisations, avis, zone, FAQ, contact).
- `css/style.css` : thème sombre, panneaux par chapitre, version mobile.
- `js/app.js` : scène Three.js générée en code (maison, charpente, tuiles, cheminée, pluie), chronologie pilotée par le scroll, boutons matières / lumière / fuite.
- `images/` : visuels repris du site CMS d'Isaac (repo `timsite56/general-couverture`).

Aucune dépendance à installer : Three.js est chargé depuis le CDN jsdelivr (version 0.170.0 épinglée), les polices depuis Google Fonts. Un simple hébergement statique suffit (Cloudflare Pages comme les autres sites).

Pour tester en local, servir le dossier avec n'importe quel serveur statique, par exemple :

```bash
python3 -m http.server 8793
```

Les 7 chapitres de l'expérience, dans l'ordre : hero → la charpente se construit → les tuiles prennent place → le toit s'ouvre couche par couche → une fuite (symptôme / cause / réparation) → explorer (tuile terre cuite, tuile vieillie, ardoise ; jour / coucher de soleil / nuit) → appel à l'action.

Pour adapter à un autre couvreur : textes dans `index.html`, teintes dans `colorInstances()` et dimensions de la maison (`W`, `D`, `Hw`, `A`) en tête de `js/app.js`.
