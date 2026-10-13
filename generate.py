#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Générateur du site Général Couverture — direction artistique « atelier ».
Usage : python3 generate.py  → index.html, pages services, zones, contact, mentions, 404, sitemap, robots.
Tout le contenu est ici (SITE, SERVICES, ZONES, REVIEWS, FAQ_HOME, BA, PHOTOS)."""
import json, os, datetime, re, unicodedata

OUT = os.path.dirname(os.path.abspath(__file__))
V = "22"  # cache-busting css/js

SITE = dict(
    name="Général Couverture", tagline="Couvreur · Angers",
    tel="06 21 32 37 89", tel_link="+33621323789",
    url="https://generalcouverture.com", ville="Angers", dept="Maine-et-Loire", base="Les Garennes-sur-Loire",
    hours="Du lundi au samedi, 8h30 – 18h", web3forms="a6ffc352-1b91-4975-989e-b4e37e807f78", year="2026",
)
N = SITE["name"]

SERVICES = [
 dict(slug="renovation-reparation-toiture", title="Rénovation et réparation de toiture", nav="Rénovation et réparation", img="images/srv-renovation.jpg",
  short="Fuite, tuiles cassées, faîtage fissuré : diagnostic précis, réparation ciblée ou réfection complète.",
  h1="Rénovation et réparation de toiture à Angers",
  intro="Tuiles glissées, fuite, faîtage fissuré : nous trouvons l'origine du problème puis nous réparons, de la reprise ponctuelle à la réfection complète.",
  p1="Une toiture ne lâche jamais d'un coup. Une tuile déplacée, un crochet d'ardoise rouillé ou un solin décollé laissent passer l'eau pendant des mois avant que l'auréole n'apparaisse au plafond. Plus le diagnostic est précoce, plus la facture reste légère : une reprise ciblée coûte une fraction d'une réfection.",
  p2=f"<strong>{N}</strong> intervient sur toutes les couvertures de l'agglomération angevine et du Maine-et-Loire : tuile terre cuite, tuile béton, ardoise naturelle, zinc et bac acier, sur les maisons en tuffeau et en schiste comme sur les pavillons récents. Nous montons sur le toit, nous identifions la cause réelle de l'infiltration et nous remettons un devis chiffré poste par poste.",
  points=["Diagnostic complet de la couverture","Recherche de fuite et mise hors d'eau","Remplacement des tuiles ou ardoises","Reprise de la charpente et du support","Réfection partielle ou totale","Reprise des solins et des étanchéités"],
  faq=[("J'ai une fuite, sous combien de temps intervenez-vous ?","Nous intervenons en urgence à Angers et dans le Maine-et-Loire, en général sous 24 à 48 h, pour bâcher ou réparer et mettre la maison hors d'eau avant les travaux définitifs."),
       ("Réparer ou refaire toute la toiture ?","Tout dépend du support. Si la charpente est saine et que les dégâts restent localisés, une réparation suffit. Quand les désordres se multiplient, la réfection revient moins cher que des interventions répétées."),
       ("Travaillez-vous l'ardoise ?","Oui. À Angers, pays de l'ardoise de Trélazé, nous reprenons les couvertures en ardoise naturelle comme les toits en tuile, avec les crochets inox et les fixations adaptés.")],
  seo_title="Rénovation et réparation de toiture à Angers | Général Couverture",
  seo_desc="Couvreur à Angers : recherche de fuite, remplacement de tuiles ou d'ardoises, reprise de couverture et réfection complète dans le Maine-et-Loire. Devis gratuit au 06 21 32 37 89."),
 dict(slug="pose-toiture-neuve", title="Pose de toiture neuve", nav="Toiture neuve", img="images/srv-toiture-neuve.jpg",
  short="Construction, extension ou réfection totale : une couverture neuve posée dans les règles de l'art.",
  h1="Pose de toiture neuve à Angers",
  intro="Construction, extension ou réfection totale : une couverture neuve posée dans les règles, avec des matériaux choisis pour votre maison et pour le climat angevin.",
  p1="Refaire entièrement une toiture est un investissement pour plusieurs décennies. Le choix du matériau, la ventilation de la sous-toiture et la qualité des points singuliers (rives, noues, faîtage, abords de cheminée) décident de sa durée de vie bien plus que la tuile elle-même.",
  p2=f"Nous posons tuile terre cuite, tuile béton, ardoise naturelle et bac acier dans tout le Maine-et-Loire, en tenant compte du climat ligérien, doux et humide, et des vents d'ouest. <strong>{N}</strong> se charge de la dépose, de l'écran sous-toiture, du liteaunage et des finitions, et vous remet un devis détaillé avant tout engagement.",
  points=["Tuile, ardoise ou bac acier","Dépose de l'ancienne couverture","Pose de l'écran sous-toiture","Liteaunage et fixation","Isolation de la sous-toiture","Finitions de rives, arêtiers et faîtage"],
  faq=[("Combien de temps dure la pose d'une toiture neuve ?","Pour une maison individuelle, comptez en général une à trois semaines selon la surface, le matériau et la météo. La maison est mise hors d'eau chaque soir."),
       ("Faut-il une autorisation pour refaire sa toiture ?","Si vous changez de matériau ou de teinte, une déclaration préalable en mairie est nécessaire, et l'avis de l'architecte des Bâtiments de France peut être requis près d'un monument, fréquent dans le centre d'Angers. Nous vous aidons à constituer le dossier."),
       ("Peut-on isoler en même temps ?","Oui, c'est même le meilleur moment : la réfection permet de poser un écran performant et, si besoin, une isolation par l'extérieur sans toucher aux pièces habitées.")],
  seo_title="Pose de toiture neuve à Angers | Général Couverture",
  seo_desc="Couverture neuve à Angers et dans le Maine-et-Loire : dépose, écran sous-toiture, liteaunage, tuile ou ardoise, finitions de rives et de faîtage. Devis gratuit."),
 dict(slug="entretien-demoussage", title="Entretien et démoussage", nav="Entretien et démoussage", img="images/srv-demoussage.jpg",
  short="Nettoyage, traitement anti-mousse et hydrofuge : un toit propre dure des années de plus.",
  h1="Démoussage et entretien de toiture à Angers",
  intro="Mousses, lichens et gouttières bouchées retiennent l'humidité et abîment la couverture : un entretien régulier la fait durer des années de plus.",
  p1="Le climat angevin, doux et humide, est idéal pour les mousses et les lichens. Ils s'installent sur les versants nord, soulèvent les tuiles, bouchent les gouttières et gardent la couverture humide toute l'année : le gel finit par fendre les tuiles et l'eau s'infiltre.",
  p2=f"<strong>{N}</strong> réalise le démoussage manuel ou basse pression, le traitement curatif, l'hydrofuge de protection et le curage des gouttières. Nous en profitons pour contrôler les tuiles, les faîtages et la zinguerie, et nous vous signalons le moindre point faible.",
  points=["Démoussage manuel et mécanique","Traitement curatif anti-mousse","Hydrofuge de protection","Curage des gouttières","Contrôle des tuiles et des faîtages","Entretien annuel programmé"],
  faq=[("À quelle fréquence faut-il démousser un toit ?","Tous les quatre à six ans, selon l'exposition et la végétation autour de la maison. Un traitement préventif espace nettement les interventions."),
       ("Le nettoyage haute pression abîme-t-il les tuiles ?","Mal réglé, oui. Nous adaptons la pression et la technique à chaque matériau, et nous privilégions le brossage et le traitement pour les couvertures fragiles."),
       ("L'hydrofuge est-il utile ?","Il limite l'absorption d'eau et la repousse des mousses. Appliqué sur un toit propre et sain, il protège la couverture plusieurs années.")],
  seo_title="Démoussage et entretien de toiture à Angers | Général Couverture",
  seo_desc="Démoussage, traitement anti-mousse, hydrofuge et nettoyage de gouttières à Angers et dans le Maine-et-Loire. Devis gratuit au 06 21 32 37 89."),
 dict(slug="zinguerie", title="Zinguerie et gouttières", nav="Zinguerie et gouttières", img="images/srv-zinguerie.jpg",
  short="Gouttières, chéneaux, noues et solins : l'eau évacuée loin de la maison, façades et fondations protégées.",
  h1="Zinguerie et gouttières à Angers",
  intro="Gouttières, chéneaux, noues et solins : une zinguerie saine évacue l'eau loin de la maison et protège façades et fondations.",
  p1="La zinguerie est souvent la première cause d'infiltration. Une gouttière percée, un solin décollé au pied d'une cheminée ou une noue fatiguée envoient l'eau dans la charpente ou le long des murs, avec des dégâts qui ne se voient qu'une fois installés.",
  p2=f"<strong>{N}</strong> façonne et pose gouttières pendantes, chéneaux, descentes, noues, solins et habillages en zinc, aluminium ou acier laqué, à Angers et dans tout le Maine-et-Loire. Soudures faites sur place, raccords soignés et évacuations contrôlées.",
  points=["Gouttières pendantes et rampantes","Chéneaux et noues en zinc","Descentes d'eaux pluviales","Solins et raccords de cheminée","Bandeaux, rives et habillages","Soudure du zinc sur place"],
  faq=[("Zinc, alu ou PVC : que choisir ?","Le zinc reste la référence : durable, soudable, discret sur l'ardoise comme sur la tuile. L'aluminium laqué offre plus de teintes, le PVC reste l'entrée de gamme. Nous vous conseillons selon la maison et le budget."),
       ("Mes gouttières débordent, que faire ?","Souvent un simple curage suffit. Si le débordement persiste, la pente ou le diamètre ne sont plus adaptés et une reprise s'impose."),
       ("Réparez-vous les solins de cheminée ?","Oui, c'est une intervention fréquente : nous reprenons le solin et l'étanchéité autour de la souche pour stopper les infiltrations.")],
  seo_title="Zinguerie et gouttières à Angers | Général Couverture",
  seo_desc="Pose, réparation et remplacement de gouttières, chéneaux, noues et solins en zinc à Angers et dans le Maine-et-Loire. Devis gratuit."),
 dict(slug="pose-velux", title="Pose et remplacement de Velux", nav="Fenêtres de toit Velux", img="images/srv-velux.jpg",
  short="Plus de lumière sous les combles, une fenêtre de toit étanche et bien isolée, en pose neuve ou en remplacement.",
  h1="Pose et remplacement de Velux à Angers",
  intro="Plus de lumière sous les combles, une fenêtre de toit étanche et bien isolée : pose neuve ou remplacement, avec les raccords adaptés à votre couverture.",
  p1="Une fenêtre de toit transforme des combles sombres en pièce agréable. Mais c'est aussi un point sensible : un raccord mal posé ou une ancienne fenêtre fatiguée provoquent vite des infiltrations et des pertes de chaleur.",
  p2=f"<strong>{N}</strong> crée la trémie dans la charpente, pose la fenêtre avec son raccord d'étanchéité adapté à la couverture (tuile ou ardoise) et reprend la toiture autour. Nous remplaçons aussi les anciens modèles sans toucher aux finitions intérieures quand c'est possible.",
  points=["Création de la trémie dans la charpente","Pose du cadre et du raccord d'étanchéité","Remplacement de fenêtres anciennes","Reprise de la couverture autour","Finitions intérieures et habillage","Stores et volets roulants"],
  faq=[("Faut-il une autorisation pour poser un Velux ?","Oui, une déclaration préalable en mairie est nécessaire, car la pose modifie l'aspect de la toiture. Nous vous aidons à la préparer."),
       ("Combien de temps dure la pose ?","Une journée en général pour une fenêtre, finitions intérieures comprises selon le cas."),
       ("Peut-on remplacer un Velux sans refaire l'intérieur ?","Souvent oui : à dimensions identiques, le remplacement se fait par l'extérieur et l'habillage intérieur est conservé.")],
  seo_title="Pose et remplacement de Velux à Angers | Général Couverture",
  seo_desc="Pose et remplacement de fenêtres de toit Velux à Angers et dans le Maine-et-Loire : trémie, raccord d'étanchéité, finitions. Devis gratuit."),
 dict(slug="peinture-toiture", title="Peinture de toiture", nav="Peinture de toiture", img="images/srv-peinture-toiture.jpg",
  short="Une toiture terne retrouve sa teinte et une protection durable contre la pluie, le soleil et les UV.",
  h1="Peinture de toiture à Angers",
  intro="Une toiture terne ou délavée retrouve sa teinte et une protection durable contre la pluie, le soleil et les UV.",
  p1="Avec les années, les tuiles béton, le fibrociment et le bac acier se décolorent et deviennent poreux. Une résine pigmentée appliquée sur un support propre redonne de l'éclat à la couverture et la protège pour de nombreuses années, pour bien moins cher qu'une réfection.",
  p2=f"<strong>{N}</strong> nettoie, traite puis applique la peinture de toiture en deux couches, à Angers et dans le Maine-et-Loire. Nous vérifions d'abord l'état de la couverture : on ne peint qu'un toit sain, sinon on répare avant.",
  points=["Nettoyage et traitement préalable","Résine de protection pigmentée","Tuiles béton et terre cuite","Fibrociment et bac acier","Application en deux couches","Uniformisation de la teinte"],
  faq=[("Tous les toits peuvent-ils être peints ?","Les tuiles béton, le fibrociment et le bac acier se prêtent très bien à la peinture. Pour la terre cuite ancienne et l'ardoise, nous préférons un nettoyage et un hydrofuge incolore qui gardent leur aspect naturel."),
       ("Combien de temps tient une peinture de toiture ?","Dix ans et plus avec une résine de qualité appliquée sur un support bien préparé."),
       ("Peut-on changer de couleur ?","Oui, dans le respect du règlement d'urbanisme de la commune. Une déclaration préalable est souvent requise.")],
  seo_title="Peinture de toiture à Angers | Général Couverture",
  seo_desc="Peinture et résine de protection de toiture à Angers et dans le Maine-et-Loire : nettoyage, traitement et application en deux couches. Devis gratuit."),
]

ZONES = [
 ("Angers","Du centre historique en tuffeau et ardoise aux quartiers pavillonnaires de la Roseraie, Belle-Beille ou Monplaisir : nous connaissons chaque type de toiture angevine."),
 ("Les Garennes-sur-Loire","Notre base, entre Loire et Aubance : Juigné-sur-Loire et Saint-Jean-des-Mauvrets, à quelques minutes de l'atelier."),
 ("Trélazé","Capitale de l'ardoise : reprise des couvertures en ardoise naturelle, crochets inox et remplacement des ardoises fendues."),
 ("Les Ponts-de-Cé","Maisons de bord de Loire exposées à l'humidité : démoussage, zinguerie et reprise des points singuliers."),
 ("Avrillé","Pavillons des années 70 à 2000 en tuile béton : rénovation, peinture de toiture et pose de fenêtres de toit."),
 ("Saint-Barthélemy-d'Anjou","Habitat résidentiel et zone d'activités : toitures de maisons comme de bâtiments professionnels."),
 ("Beaucouzé","Lotissements récents et longères rénovées : entretien régulier et remplacement de Velux."),
 ("Bouchemaine","Villages de la Pointe et de Pruniers, maisons anciennes en schiste : rénovation de couverture et zinguerie."),
 ("Mûrs-Érigné","Coteaux de l'Aubance, toits exposés aux vents d'ouest : réparation après tempête et fixation des couvertures."),
 ("Brissac Loire Aubance","Secteur viticole, bâtisses anciennes et dépendances : réfection complète et reprise de charpente."),
 ("Écouflant","Quartiers de l'Éventard et bords de Sarthe : démoussage, hydrofuge et gouttières."),
 ("Montreuil-Juigné","Maisons individuelles en tuile et ardoise : intervention rapide en cas de fuite."),
 ("Verrières-en-Anjou","Saint-Sylvain et Pellouailles : toiture neuve sur extension et rénovation de couverture."),
 ("Loire-Authion","Vallée de l'Authion, longères et fermes rénovées : grandes surfaces de couverture et zinguerie."),
 ("Sainte-Gemmes-sur-Loire","Maisons de bord de Loire : entretien, réparation et remplacement de gouttières."),
 ("Saint-Melaine-sur-Aubance","Commune rurale voisine de notre atelier : dépannage rapide et devis sous 48 h."),
]

REVIEWS = [
 ("Marc Lefebvre","Très bon travail, rapide et propre. La toiture est impeccable, je recommande sans hésiter."),
 ("Samir Bouzidi","Intervention suite à une fuite importante sur ma maison à Angers. Diagnostic rapide, devis clair et travaux réalisés dans les délais. Artisan sérieux et à l'écoute, le résultat est vraiment top !"),
 ("Élise Renard","Remplacement des gouttières bien géré, ponctuel et propre. Prix honnête et travail soigné. Je ferai de nouveau appel à eux."),
]

FAQ_HOME = [
 ("Intervenez-vous en urgence pour une fuite de toiture ?","Oui, nous proposons des interventions d'urgence à Angers et dans le Maine-et-Loire. Contactez-nous au 06 21 32 37 89 et nous nous déplaçons dans les meilleurs délais pour sécuriser votre toiture."),
 ("Proposez-vous des devis gratuits ?","Absolument. Nous vous proposons un devis détaillé et gratuit après une visite sur site. Aucune mauvaise surprise : le prix indiqué est celui que vous payez."),
 ("Quels types de toitures prenez-vous en charge ?","Nous intervenons sur tous les types de toitures : tuiles, ardoises, zinc, bac acier et toitures-terrasses. Que ce soit pour une rénovation complète ou une simple réparation, nous avons les compétences nécessaires."),
 ("Êtes-vous assurés et certifiés ?","Oui, Général Couverture est titulaire de la garantie décennale et certifié RGE (Reconnu Garant de l'Environnement), ce qui vous permet d'accéder aux aides de l'État pour vos travaux de rénovation énergétique."),
 ("Quel est votre secteur d'intervention ?","Angers et toute son agglomération, et plus largement le Maine-et-Loire : Trélazé, Les Ponts-de-Cé, Avrillé, Bouchemaine, Brissac Loire Aubance et les communes voisines."),
]

# Avant / après : (slug, après, avant, classe de ratio, titre, type de chantier)
BA = [
 ("maison-1", "images/ba/maison-1-apres.jpg", "images/ba/maison-1-avant.jpg", "", "Réfection complète d'une couverture en ardoise naturelle", "Rénovation de toiture"),
 ("maison-2", "images/ba/maison-2-apres.jpg", "images/ba/maison-2-avant.jpg", "", "La même maison, côté jardin : ardoise neuve et zinguerie reprise", "Rénovation de toiture"),
 ("velux",    "images/ba/velux-apres.jpg",    "images/ba/velux-avant.jpg",    "", "Création d'une fenêtre de toit sur une couverture en tuiles", "Pose de Velux"),
 ("faitage",  "images/ba/faitage-apres.jpg",  "images/ba/faitage-avant.jpg",  "ratio-4-5", "Faîtage neuf : closoir ventilé et tuiles faîtières", "Rénovation de toiture"),
]
PHOTOS = [
 ("images/photo-velux-ardoise.webp", "Fenêtre de toit sur ardoise, liteaunage neuf"),
]

# ----------------------------------------------------------------------------- utilitaires
def href(path):
    """URL propre : index.html -> /, page.html -> /page (le Worker Cloudflare sert les pages sans extension)."""
    if path.startswith("http"): return path
    base, _, frag = path.partition("#")
    if base in ("", "index.html"): base = "/"
    elif base.endswith(".html"): base = "/" + base[:-5]
    return base + ("#" + frag if frag else "")

def esc(s): return s.replace("&", "&amp;").replace('"', "&quot;")

def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

GLYPH = '''<svg class="brand-glyph" viewBox="0 0 48 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 31 24 9l20 22"/><path d="M33 12.5V20M30.5 12.5h5"/><path d="M12 37h24" opacity=".45"/></svg>'''
FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230e1013'/%3E%3Cpath d='M12 41 32 19l20 22M41 22.5V30M38.5 22.5h5' fill='none' stroke='%23e0a070' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"

def brand(tag="a"):
    return f'''<{tag} class="brand" href="/" aria-label="{N}, accueil">{GLYPH}<span class="brand-text"><span class="brand-name">Général <em>Couverture</em></span><span class="brand-sub">{SITE["tagline"]}</span></span></{tag}>'''

def header():
    subs = "".join(f'<a href="{href(s["slug"] + ".html")}">{s["nav"]}</a>' for s in SERVICES)
    return f'''<header class="site-header" id="header">
  <div class="wrap header-inner">
    {brand()}
    <nav class="nav" id="nav" aria-label="Navigation principale">
      <div class="nav-item"><a href="/#services">Services</a><div class="sub">{subs}</div></div>
      <a href="/#realisations">Réalisations</a>
      <a href="{href("zones-intervention.html")}">Zone d'intervention</a>
      <a href="{href("contact.html")}">Contact</a>
      <a class="btn btn-outline nav-cta" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a>
    </nav>
    <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav"><span></span></button>
  </div>
</header>'''

def footer():
    srv = "".join(f'<li><a href="{href(s["slug"] + ".html")}">{s["title"]}</a></li>' for s in SERVICES)
    return f'''<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>{brand()}<p class="footer-desc">Couvreur certifié RGE à Angers. Rénovation, toiture neuve, entretien, zinguerie, fenêtres de toit et peinture de toiture dans tout le Maine-et-Loire.</p></div>
      <div><h4>Services</h4><ul>{srv}</ul></div>
      <div><h4>Contact</h4><ul>
        <li><a href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a></li>
        <li>{SITE["hours"]}</li>
        <li>Angers · {SITE["dept"]}</li>
        <li><a href="{href("zones-intervention.html")}">Zone d'intervention</a></li>
        <li><a href="{href("contact.html")}">Demander un devis</a></li>
        <li><a href="{href("mentions-legales.html")}">Mentions légales</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom"><span>© {SITE["year"]} {N} — Angers</span><span>Certifié RGE · Garantie décennale · Devis gratuit</span></div>
  </div>
</footer>
<a class="call-bar" href="tel:{SITE["tel_link"]}">Appeler · {SITE["tel"]}</a>
<script src="/js/site.js?v={V}"></script>'''

def layout(title, desc, body, path, extra_head="", scripts="", og_image="images/og-image.jpg"):
    canonical = SITE["url"] + href(path)
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#0e1013">
<link rel="icon" href="{FAVICON}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="{N}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE["url"]}/{og_image}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/atelier.css?v={V}">
{extra_head}
</head>
<body>
{header()}
<main>
{body}
</main>
{footer()}
{scripts}
</body>
</html>
'''

def jsonld(obj): return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, indent=1) + '</script>'

ORG = {
  "@context": "https://schema.org", "@type": "RoofingContractor", "@id": SITE["url"] + "/#org",
  "name": N, "url": SITE["url"] + "/", "telephone": SITE["tel_link"], "image": SITE["url"] + "/images/og-image.jpg",
  "description": "Couvreur certifié RGE à Angers et dans le Maine-et-Loire : rénovation de toiture, toiture neuve, démoussage, zinguerie, Velux, peinture de toiture.",
  "address": {"@type": "PostalAddress", "addressLocality": "Angers", "addressRegion": "Maine-et-Loire", "postalCode": "49000", "addressCountry": "FR"},
  "areaServed": [z[0] for z in ZONES], "priceRange": "€€",
  "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "08:30", "closes": "18:00"}],
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": str(len(REVIEWS))},
  "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Services de couverture", "itemListElement": [
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": s["title"], "url": SITE["url"] + href(s["slug"] + ".html")}} for s in SERVICES]},
}

# ----------------------------------------------------------------------------- blocs
def services_list(exclude=None):
    rows = []
    i = 0
    for s in SERVICES:
        if s["slug"] == exclude: continue
        i += 1
        rows.append(f'''<li class="srv-row reveal" style="--i:{i-1}"><a href="{href(s["slug"] + ".html")}"><span class="srv-num">0{i}</span><span class="srv-title">{s["title"]}</span><span class="srv-desc">{s["short"]}</span><span class="srv-arrow">→</span><img class="srv-img" src="/{s["img"]}" alt="" loading="lazy"></a></li>''')
    return f'<ol class="srv-list">{"".join(rows)}</ol>'

def faq_block(items):
    return "".join(f'<details{" open" if i == 0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i, (q, a) in enumerate(items))

def cta_band(title="Un projet de toiture ? <em>Parlons-en.</em>", text="Devis gratuit et détaillé après visite sur site. Le prix annoncé est le prix payé."):
    return f'''<section class="section cta-band">
  <div class="wrap cta-inner">
    <div class="reveal"><h2>{title}</h2><p>{text}</p></div>
    <div class="reveal" style="--i:1">
      <a class="contact-phone" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a>
      <p>{SITE["hours"]} · Urgence fuite : appelez-nous.</p>
      <div class="btn-row"><a class="btn btn-copper" href="{href("contact.html")}">Demander un devis</a><a class="link-u" href="{href("zones-intervention.html")}">Zone d'intervention</a></div>
    </div>
  </div>
</section>'''

def form_block():
    opts = "".join(f'<option value="{s["title"]}">{s["title"]}</option>' for s in SERVICES)
    return f'''<form class="form reveal" id="devisForm" action="https://api.web3forms.com/submit" method="POST" novalidate style="--i:1">
  <input type="hidden" name="access_key" value="{SITE["web3forms"]}">
  <input type="hidden" name="subject" value="Nouvelle demande de devis — {N}">
  <input type="hidden" name="from_name" value="Formulaire {N}">
  <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">
  <div class="form-grid">
    <div class="field"><label for="f-nom">Nom</label><input id="f-nom" name="nom" type="text" autocomplete="name" required placeholder="Votre nom"></div>
    <div class="field"><label for="f-tel">Téléphone</label><input id="f-tel" name="telephone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="06 …"></div>
    <div class="field"><label for="f-email">E-mail (facultatif)</label><input id="f-email" name="email" type="email" autocomplete="email" placeholder="vous@exemple.fr"></div>
    <div class="field"><label for="f-ville">Commune</label><input id="f-ville" name="commune" type="text" placeholder="Angers, Trélazé…"></div>
    <div class="field full"><label for="f-prest">Prestation</label><select id="f-prest" name="prestation"><option value="">Je ne sais pas encore</option>{opts}<option value="Autre">Autre demande</option></select></div>
    <div class="field full"><label for="f-msg">Votre projet</label><textarea id="f-msg" name="message" placeholder="Décrivez votre toiture et le problème rencontré."></textarea></div>
  </div>
  <p class="form-note">Réponse sous 24 h ouvrées. Vos coordonnées servent uniquement à vous recontacter.</p>
  <button class="btn btn-copper btn-lg" type="submit" style="margin-top:1.4em">Envoyer ma demande</button>
  <p class="form-status" role="status"></p>
</form>'''

def ba_block(slug, after, before, ratio, title, kind, i=0):
    return f'''<figure class="ba reveal" data-ba style="--i:{i}">
  <div class="ba-frame {ratio}">
    <img src="/{after}" alt="Après : {esc(title)}" loading="lazy">
    <div class="ba-before" style="--pos:50%"><img src="/{before}" alt="Avant les travaux" loading="lazy"></div>
    <div class="ba-handle" style="--pos:50%"><span></span></div>
    <input class="ba-range" type="range" min="2" max="98" value="50" aria-label="Comparer avant et après">
    <span class="ba-tag ba-tag-before">Avant</span><span class="ba-tag ba-tag-after">Après</span>
  </div>
  <figcaption>{title}<span>{kind}</span></figcaption>
</figure>'''

# ----------------------------------------------------------------------------- accueil
def build_index():
    labels = '''<div class="lbl" data-layer="tuiles"><span class="dot"></span><span class="tag"><b>Tuiles</b>terre cuite, ardoise ou zinc</span></div>
<div class="lbl" data-layer="liteaux"><span class="dot"></span><span class="tag"><b>Liteaux</b>le support des tuiles</span></div>
<div class="lbl" data-layer="ecran"><span class="dot"></span><span class="tag"><b>Écran sous-toiture</b>la barrière contre l'eau</span></div>
<div class="lbl" data-layer="isolation"><span class="dot"></span><span class="tag"><b>Isolation</b>confort et économies d'énergie</span></div>
<div class="lbl" data-layer="chevrons"><span class="dot"></span><span class="tag"><b>Chevrons</b>la charpente qui porte tout</span></div>
<div class="lbl leak" data-step="0"><span class="dot"></span><span class="tag"><b>1 · Le symptôme</b>une auréole au plafond</span></div>
<div class="lbl leak" data-step="1"><span class="dot"></span><span class="tag"><b>2 · La cause</b>le solin décollé derrière la cheminée</span></div>
<div class="lbl leak" data-step="2"><span class="dot"></span><span class="tag"><b>3 · La réparation</b>abergement zinc neuf, étanchéité rétablie</span></div>'''
    experience = f'''<section class="experience" id="experience" aria-label="Votre toiture en 3D">
  <div class="stage" id="stage">
    <canvas id="scene" aria-hidden="true"></canvas>
    <div class="labels" id="labels" aria-hidden="true">{labels}</div>
    <div class="stage-hint">Glissez pour pivoter</div>
    <div class="stage-ui"><span id="stage-counter">01 / 06</span><div class="stage-bar"><span id="stage-bar"></span></div></div>
    <div class="stage-loading" id="loader"><div><span></span></div></div>
  </div>
  <div class="steps">
    <article class="step step-hero" data-ch="0"><div class="step-inner">
      <span class="kicker">Couvreur à Angers — Maine-et-Loire</span>
      <h1>Votre toiture, <em>entre de bonnes mains.</em></h1>
      <p class="lead">Rénovation, toiture neuve, recherche de fuite, zinguerie : {N} entretient et refait les toits d'Angers depuis vingt ans. Certifié RGE, garantie décennale, devis gratuit.</p>
      <div class="btn-row"><a class="btn btn-copper" href="{href("contact.html")}">Demander un devis</a><a class="tel-link" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a></div>
      <ul class="hero-facts"><li><strong>20 ans</strong>d'expérience</li><li><strong>500</strong>chantiers</li><li><strong>RGE</strong>certifié</li><li><strong>5,0</strong>sur Google</li></ul>
    </div></article>
    <article class="step" data-ch="1"><div class="step-inner">
      <span class="step-num">01 — La charpente</span>
      <h2>Tout commence par une <em>charpente saine.</em></h2>
      <p>Sablières, entraits, arbalétriers, pannes, chevrons : chaque pièce de bois a un rôle. Avant de couvrir, nous vérifions la structure, nous traitons ou nous remplaçons ce qui doit l'être.</p>
    </div></article>
    <article class="step" data-ch="2"><div class="step-inner">
      <span class="step-num">02 — La couverture</span>
      <h2>Les tuiles, <em>rangée après rangée.</em></h2>
      <p>Écran sous-toiture, liteaux, puis les tuiles posées de l'égout jusqu'au faîtage. Une pose dans les règles de l'art, pour une toiture qui dure des décennies.</p>
      <a class="link-u step-cta" href="{href("pose-toiture-neuve.html")}">Pose de toiture neuve</a>
    </div></article>
    <article class="step" data-ch="3"><div class="step-inner">
      <span class="step-num">03 — Couche par couche</span>
      <h2>Ce qui vous <em>protège vraiment.</em></h2>
      <p class="mobile-hide">Une toiture, ce n'est pas que des tuiles. Charpente, isolation, écran sous-toiture, liteaux, couverture : nous intervenons sur chaque couche, de la rénovation complète à la simple réparation.</p>
      <ol class="layer-legend"><li>Tuiles</li><li>Liteaux</li><li>Écran sous-toiture</li><li>Isolation</li><li>Chevrons</li></ol>
    </div></article>
    <article class="step" data-ch="4"><div class="step-inner">
      <span class="step-num">04 — Une fuite ?</span>
      <h2>Suivez la goutte, <em>du symptôme à la réparation.</em></h2>
      <div class="controls"><div class="choice-row" role="tablist" aria-label="Étapes de la recherche de fuite">
        <button class="chip-btn step-btn is-active" data-step="0" role="tab">Le symptôme</button>
        <button class="chip-btn step-btn" data-step="1" role="tab">La cause</button>
        <button class="chip-btn step-btn" data-step="2" role="tab">La réparation</button>
      </div></div>
      <p class="step-text" data-step-text="0">Une auréole au plafond après la pluie : l'eau est entrée quelque part au-dessus. Nous intervenons rapidement pour diagnostiquer et sécuriser.</p>
      <p class="step-text" data-step-text="1" hidden>Derrière la cheminée, le solin s'est décollé. L'eau s'infiltre sous les tuiles et ruisselle sur l'isolant jusqu'au plafond.</p>
      <p class="step-text" data-step-text="2" hidden>Nous posons un abergement en zinc neuf et reprenons l'étanchéité. Intervention en urgence à Angers et dans le Maine-et-Loire.</p>
      <a class="btn btn-outline btn-sm step-cta" href="tel:{SITE["tel_link"]}">Une fuite ? Appelez-nous</a>
    </div></article>
    <article class="step" data-ch="5"><div class="step-inner">
      <span class="step-num">05 — Matières et lumières</span>
      <h2>Chaque toiture a <em>son caractère.</em></h2>
      <p class="mobile-hide">Tuile terre cuite, tuile vieillie ou ardoise d'Anjou : comparez les matériaux et projetez-vous, à toute heure de la journée.</p>
      <div class="controls">
        <p class="choice-label">Couverture</p>
        <div class="choice-row"><button class="chip-btn is-active" data-mat="tuile">Tuile terre cuite</button><button class="chip-btn" data-mat="vieillie">Tuile vieillie</button><button class="chip-btn" data-mat="ardoise">Ardoise</button></div>
        <p class="choice-label">Lumière</p>
        <div class="choice-row"><button class="chip-btn is-active" data-light="jour">Jour</button><button class="chip-btn" data-light="soir">Coucher de soleil</button><button class="chip-btn" data-light="nuit">Nuit</button></div>
      </div>
      <div class="btn-row step-cta"><a class="btn btn-copper" href="{href("contact.html")}">Demander un devis gratuit</a></div>
    </div></article>
  </div>
</section>'''
    facts = '''<section class="facts"><div class="wrap"><ul>
  <li><strong>20 <small>ans</small></strong><span>d'expérience sur les toits</span></li>
  <li><strong>500<small>+</small></strong><span>chantiers réalisés</span></li>
  <li><strong>RGE</strong><span>certifié, garantie décennale</span></li>
  <li><strong>5,0 <small>★</small></strong><span>note Google, 3 avis</span></li>
</ul></div></section>'''
    services = f'''<section class="section" id="services"><div class="wrap">
  <div class="section-head split reveal"><div><span class="kicker">Nos services</span><h2>Six métiers, <em>une seule exigence :</em> votre toit.</h2></div><p>De la tuile à l'ardoise en passant par le zinc, chaque chantier est traité avec le même soin, à Angers et dans le Maine-et-Loire.</p></div>
  {services_list()}
</div></section>'''
    method = '''<section class="section"><div class="wrap">
  <div class="section-head reveal"><span class="kicker">La méthode</span><h2>Simple, clair, <em>sans surprise.</em></h2></div>
  <ol class="method">
    <li class="reveal" style="--i:0"><span class="num">01</span><h3>Vous appelez</h3><p>Décrivez votre toiture et le problème. Pour une fuite, nous organisons une intervention rapide.</p></li>
    <li class="reveal" style="--i:1"><span class="num">02</span><h3>Visite et diagnostic</h3><p>Nous montons sur le toit, nous contrôlons couverture, zinguerie et charpente, photos à l'appui.</p></li>
    <li class="reveal" style="--i:2"><span class="num">03</span><h3>Devis détaillé</h3><p>Gratuit, chiffré poste par poste. Le prix indiqué est celui que vous payez.</p></li>
    <li class="reveal" style="--i:3"><span class="num">04</span><h3>Travaux et garantie</h3><p>Chantier propre, maison hors d'eau chaque soir, garantie décennale sur nos réalisations.</p></li>
  </ol>
</div></section>'''
    about = f'''<section class="section" id="apropos"><div class="wrap about-grid">
  <div class="about-media reveal"><img src="/images/apropos.webp" alt="Couvreur de Général Couverture sur une toiture en ardoise à Angers" loading="lazy" width="750" height="938"></div>
  <div class="about-text reveal" style="--i:1">
    <span class="kicker">L'entreprise</span>
    <h2>Une entreprise angevine, <em>un couvreur passionné.</em></h2>
    <p class="about-quote">« De la tuile à l'ardoise en passant par le zinc, chaque chantier est traité avec le même niveau d'exigence. »</p>
    <p>{N} est une entreprise angevine fondée par un couvreur passionné, fort de plus de quinze ans d'expérience dans la pose et la rénovation de toitures. Basés aux Garennes-sur-Loire, à dix minutes d'Angers, nous intervenons sur l'ensemble du Maine-et-Loire pour les particuliers comme pour les professionnels.</p>
    <p>Certifiés RGE, nous travaillons avec des matériaux de qualité, dans le respect des délais convenus. La garantie décennale couvre l'ensemble de nos réalisations.</p>
    <ul class="badges"><li>Certifié RGE</li><li>Garantie décennale</li><li>Devis gratuit</li></ul>
  </div>
</div></section>'''
    ba1 = ba_block(*BA[0], i=0)
    ba2 = ba_block(*BA[1], i=0); ba3 = ba_block(*BA[2], i=1)
    ba4 = ba_block(*BA[3], i=0)
    photo = f'''<figure class="photo reveal" style="--i:1"><img src="/{PHOTOS[0][0]}" alt="{esc(PHOTOS[0][1])}" loading="lazy"><figcaption>{PHOTOS[0][1]}</figcaption></figure>'''
    gallery = f'''<section class="section" id="realisations"><div class="wrap">
  <div class="section-head split reveal"><div><span class="kicker">Réalisations</span><h2>Avant, après : <em>faites glisser.</em></h2></div><p>Nos chantiers autour d'Angers. Déplacez le curseur pour comparer la toiture avant et après notre passage.</p></div>
  <div class="ba-grid">{ba1}<div class="ba-grid two">{ba2}{ba3}</div><div class="ba-grid two">{ba4}{photo}</div></div>
</div></section>'''
    revs = "".join(f'<blockquote class="reveal" style="--i:{i}"><p>{t}</p><footer>{n}</footer></blockquote>' for i, (n, t) in enumerate(REVIEWS))
    reviews = f'''<section class="section" id="avis"><div class="wrap">
  <div class="section-head split reveal"><div><span class="kicker">Avis clients</span><h2>Ce que disent <em>nos clients.</em></h2></div><p class="google-badge"><span class="stars">★★★★★</span> 5,0 sur Google · {len(REVIEWS)} avis</p></div>
  <div class="reviews">{revs}</div>
</div></section>'''
    towns = "".join(f'<li><a href="{href("zones-intervention.html#" + slugify(z[0]))}">{z[0]}</a></li>' for z in ZONES)
    zones = f'''<section class="section" id="zone"><div class="wrap zone-grid">
  <div class="reveal"><span class="kicker">Zone d'intervention</span><h2>Angers et <em>tout le Maine-et-Loire.</em></h2><p class="lead">Basés aux Garennes-sur-Loire, nous intervenons dans toute l'agglomération et le département, en urgence comme pour les chantiers programmés.</p><a class="link-u" href="{href("zones-intervention.html")}">Toutes les communes</a></div>
  <ul class="towns reveal" style="--i:1">{towns}</ul>
</div></section>'''
    faq = f'''<section class="section" id="faq"><div class="wrap">
  <div class="section-head reveal"><span class="kicker">Questions fréquentes</span><h2>Vos questions, <em>nos réponses.</em></h2></div>
  <div class="faq reveal" style="--i:1">{faq_block(FAQ_HOME)}</div>
</div></section>'''
    contact = f'''<section class="section" id="contact"><div class="wrap contact-grid">
  <div class="reveal"><span class="kicker">Contact</span><h2>Parlons de <em>votre toiture.</em></h2>
    <a class="contact-phone" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a>
    <ul class="info-list"><li><strong>Horaires</strong><span>{SITE["hours"]}<br>Urgence fuite : appelez, nous nous organisons.</span></li><li><strong>Secteur</strong><span>Angers, son agglomération et tout le Maine-et-Loire</span></li><li><strong>Devis</strong><span>Gratuit, après visite sur site, chiffré poste par poste</span></li><li><strong>Garanties</strong><span>Certifié RGE · Garantie décennale</span></li></ul>
  </div>
  {form_block()}
</div></section>'''
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ_HOME]}
    body = experience + facts + services + method + about + gallery + reviews + zones + faq + contact
    extra = jsonld(ORG) + "\n" + jsonld(faq_ld) + '''
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>'''
    scripts = f'<script type="module" src="/js/app.js?v={V}"></script>'
    return layout("Couvreur à Angers — Général Couverture | Rénovation, toiture neuve, zinguerie", "Couvreur certifié RGE à Angers et dans le Maine-et-Loire : rénovation et réparation de toiture, toiture neuve, démoussage, zinguerie, Velux, peinture de toiture. Devis gratuit au 06 21 32 37 89.", body, "index.html", extra, scripts)

# ----------------------------------------------------------------------------- pages services
def page_hero(img, crumbs, kicker, h1, lead="", ctas=True):
    cta = f'<div class="btn-row"><a class="btn btn-copper" href="{href("contact.html")}">Demander un devis</a><a class="tel-link" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a></div>' if ctas else ""
    return f'''<section class="page-hero"><img class="hero-bg" src="/{img}" alt="" aria-hidden="true" width="1600" height="900"><div class="wrap">
  <nav class="crumbs" aria-label="Fil d'Ariane">{crumbs}</nav>
  <span class="kicker">{kicker}</span>
  <h1>{h1}</h1>
  {f'<p class="lead">{lead}</p>' if lead else ""}
  {cta}
</div></section>'''

def build_service(s):
    points = "".join(f"<li>{p}</li>" for p in s["points"])
    reasons = '''<ul class="reasons">
  <li class="reveal" style="--i:0"><h3>Un diagnostic honnête</h3><p>Nous montons sur le toit avant de chiffrer. Si une réparation suffit, nous ne vous vendons pas une réfection.</p></li>
  <li class="reveal" style="--i:1"><h3>Des finitions soignées</h3><p>Rives, noues, faîtages et abords de cheminée sont traités avec le même soin que la surface courante : c'est là que les toits fuient.</p></li>
  <li class="reveal" style="--i:2"><h3>RGE et garantie décennale</h3><p>Entreprise certifiée, assurée, qui vous ouvre droit aux aides de l'État pour les travaux de rénovation énergétique.</p></li>
</ul>'''
    crumbs = f'<a href="/">Accueil</a><span>/</span><a href="/#services">Services</a><span>/</span><span>{s["title"]}</span>'
    h1 = s["h1"].replace(" à Angers", " <em>à Angers.</em>")
    hero = page_hero(s["img"], crumbs, "Couvreur à Angers — Maine-et-Loire", h1, s["intro"])
    main = f'''<section class="section"><div class="wrap service-grid">
  <div class="service-main reveal">
    <p>{s["p1"]}</p>
    <h2>Ce que nous faisons</h2>
    <ul class="checklist">{points}</ul>
    <p>{s["p2"]}</p>
    <h2>Questions fréquentes</h2>
    <div class="faq">{faq_block(s["faq"])}</div>
  </div>
  <aside class="reveal" style="--i:1"><div class="aside-card"><h3>Devis gratuit</h3><p>Visite sur site, diagnostic et devis chiffré poste par poste, sans engagement.</p>
    <a class="btn btn-copper" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a>
    <a class="btn btn-outline" href="{href("contact.html")}" style="margin-top:0.7em">Écrire via le formulaire</a>
    <ul><li>Certifié RGE</li><li>Garantie décennale</li><li>{SITE["hours"]}</li><li>Angers et Maine-et-Loire</li></ul></div></aside>
</div></section>
<section class="section"><div class="wrap"><div class="section-head reveal"><span class="kicker">Pourquoi {N}</span><h2>Ce qui fait la différence <em>sur un toit.</em></h2></div>{reasons}</div></section>
<section class="section"><div class="wrap"><div class="section-head reveal"><span class="kicker">Nos autres services</span><h2>Tout ce qu'il faut <em>pour votre toiture.</em></h2></div>{services_list(exclude=s["slug"])}</div></section>
{cta_band()}'''
    ld = [{"@context": "https://schema.org", "@type": "Service", "name": s["title"], "serviceType": s["title"], "provider": {"@id": SITE["url"] + "/#org"}, "areaServed": [z[0] for z in ZONES], "url": SITE["url"] + href(s["slug"] + ".html"), "description": s["seo_desc"]},
          {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE["url"] + "/"},
              {"@type": "ListItem", "position": 2, "name": "Services", "item": SITE["url"] + "/#services"},
              {"@type": "ListItem", "position": 3, "name": s["title"], "item": SITE["url"] + href(s["slug"] + ".html")}]},
          {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in s["faq"]]}]
    return layout(s["seo_title"], s["seo_desc"], hero + main, s["slug"] + ".html", "\n".join(jsonld(x) for x in ld), og_image=s["img"])

# ----------------------------------------------------------------------------- zones, contact, mentions, 404
def build_zones():
    cards = "".join(f'<li id="{slugify(n)}" class="reveal" style="--i:{i % 2}"><h3>Couvreur à {n}</h3><p>{t}</p></li>' for i, (n, t) in enumerate(ZONES))
    crumbs = '<a href="/">Accueil</a><span>/</span><span>Zone d\'intervention</span>'
    hero = page_hero("images/hero-bg.jpg", crumbs, "Zone d'intervention", "Couvreur à Angers et <em>dans tout le Maine-et-Loire.</em>", "Basés aux Garennes-sur-Loire, à dix minutes d'Angers, nous intervenons dans toute l'agglomération angevine et le département : dépannage de fuite, rénovation, toiture neuve, zinguerie, Velux et entretien.")
    body = hero + f'''<section class="section"><div class="wrap">
  <div class="section-head reveal"><span class="kicker">Nos communes</span><h2>Là où nous travaillons <em>chaque semaine.</em></h2><p>Un déplacement rapide, une connaissance des toitures locales, de l'ardoise de Trélazé à la tuile des pavillons récents.</p></div>
  <ul class="zone-cards">{cards}</ul>
  <p class="muted" style="margin-top:2em">Votre commune n'est pas dans la liste ? Nous couvrons l'ensemble du Maine-et-Loire : appelez-nous, nous vous dirons tout de suite si nous pouvons venir.</p>
</div></section>
<section class="section"><div class="wrap"><div class="section-head reveal"><span class="kicker">Nos services</span><h2>Ce que nous faisons <em>pour votre toit.</em></h2></div>{services_list()}</div></section>
{cta_band("Un toit à réparer <em>près de chez vous ?</em>", "Diagnostic sur place et devis gratuit dans toute l'agglomération angevine.")}'''
    return layout("Zone d'intervention : couvreur à Angers et dans le Maine-et-Loire | Général Couverture", "Général Couverture intervient à Angers, Trélazé, Les Ponts-de-Cé, Avrillé, Bouchemaine, Brissac Loire Aubance et dans tout le Maine-et-Loire. Devis gratuit au 06 21 32 37 89.", body, "zones-intervention.html")

def build_contact():
    crumbs = '<a href="/">Accueil</a><span>/</span><span>Contact</span>'
    hero = page_hero("images/apropos.webp", crumbs, "Contact et devis", "Parlons de <em>votre toiture.</em>", "Un appel suffit pour une urgence. Pour un devis, décrivez-nous votre projet : nous vous rappelons sous 24 h ouvrées et nous fixons une visite.", ctas=False)
    body = hero + f'''<section class="section"><div class="wrap contact-grid">
  <div class="reveal"><span class="kicker">{N}</span><h2 style="font-size:1.9rem">Couvreur à Angers, <em>Les Garennes-sur-Loire.</em></h2>
    <a class="contact-phone" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a>
    <ul class="info-list"><li><strong>Horaires</strong><span>{SITE["hours"]}<br>Urgence fuite : appelez, nous nous organisons.</span></li><li><strong>Secteur</strong><span>Angers, son agglomération et tout le Maine-et-Loire</span></li><li><strong>Devis</strong><span>Gratuit, après visite sur site, chiffré poste par poste</span></li><li><strong>Garanties</strong><span>Certifié RGE · Garantie décennale</span></li></ul>
  </div>
  {form_block()}
</div></section>
<section class="section"><div class="wrap"><div class="section-head reveal"><span class="kicker">Nos services</span><h2>Ce que nous pouvons faire <em>pour vous.</em></h2></div>{services_list()}</div></section>'''
    return layout("Contact et devis gratuit | Général Couverture, couvreur à Angers", "Appelez Général Couverture au 06 21 32 37 89 ou envoyez votre demande de devis : couvreur à Angers et dans le Maine-et-Loire, réponse sous 24 h.", body, "contact.html")

def build_mentions():
    crumbs = '<a href="/">Accueil</a><span>/</span><span>Mentions légales</span>'
    body = page_hero("images/hero-bg.jpg", crumbs, "Informations", "Mentions <em>légales.</em>", ctas=False) + f'''<section class="section"><div class="wrap legal" style="max-width:820px">
  <h2>Éditeur du site</h2>
  <p>{N}, entreprise de couverture, Les Garennes-sur-Loire – Angers (Maine-et-Loire). Téléphone : {SITE["tel"]}. Directeur de la publication : le gérant de l'entreprise.</p>
  <h2>Hébergement</h2>
  <p>Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis.</p>
  <h2>Propriété intellectuelle</h2>
  <p>L'ensemble des contenus de ce site (textes, visuels, animation 3D) est la propriété de {N} ou de ses partenaires. Toute reproduction sans autorisation est interdite.</p>
  <h2>Données personnelles</h2>
  <p>Les informations transmises via le formulaire de contact (nom, téléphone, e-mail, message) sont utilisées uniquement pour répondre à votre demande et ne sont jamais cédées à des tiers. Vous pouvez demander leur suppression à tout moment par téléphone. Ce site n'utilise pas de cookies de suivi publicitaire.</p>
</div></section>'''
    return layout("Mentions légales | Général Couverture", "Mentions légales du site de Général Couverture, couvreur à Angers.", body, "mentions-legales.html")

def build_404():
    body = page_hero("images/hero-bg.jpg", '<a href="/">Accueil</a><span>/</span><span>Erreur 404</span>', "Erreur 404", "Cette page <em>n'existe pas.</em>", "Le lien est peut-être ancien. Retrouvez nos services ou appelez-nous directement.")
    return layout("Page introuvable | Général Couverture", "Page introuvable.", body, "404.html")

# ----------------------------------------------------------------------------- écriture
def write(name, html):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f: f.write(html)
    print("écrit", name, len(html), "octets")

def main():
    pages = ["index.html"] + [s["slug"] + ".html" for s in SERVICES] + ["zones-intervention.html", "contact.html", "mentions-legales.html"]
    write("index.html", build_index())
    for s in SERVICES: write(s["slug"] + ".html", build_service(s))
    write("zones-intervention.html", build_zones())
    write("contact.html", build_contact())
    write("mentions-legales.html", build_mentions())
    write("404.html", build_404())
    today = datetime.date.today().isoformat()
    urls = "".join(f'  <url><loc>{SITE["url"]}{href(p)}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>{"1.0" if p == "index.html" else "0.8"}</priority></url>\n' for p in pages)
    write("sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    write("robots.txt", f'User-agent: *\nAllow: /\n\nSitemap: {SITE["url"]}/sitemap.xml\n')

if __name__ == "__main__":
    main()
