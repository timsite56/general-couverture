#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Générateur du site Général Couverture — direction « studio » v5 (bleu nuit, crème, or champagne ; atelier 3D, cartes au défilement).
Usage : python3 gen.py  → index.html, pages services, zones, contact, mentions, 404, sitemap, robots."""
import json, os, datetime, re, unicodedata

OUT = os.path.dirname(os.path.abspath(__file__))
V = "52"

SITE = dict(name="Général Couverture", tel="06 21 32 37 89", tel_link="+33621323789", url="https://generalcouverture.com",
            ville="Angers", dept="Maine-et-Loire", base="Les Garennes-sur-Loire", hours="Du lundi au samedi, 8h30 – 18h",
            web3forms="a6ffc352-1b91-4975-989e-b4e37e807f78", year="2026")
N = SITE["name"]

SERVICES = [
 dict(slug="renovation-reparation-toiture", title="Rénovation et réparation de toiture", nav="Rénovation et réparation", img="images/srv-renovation.jpg",
  ring_label="01 — Rénovation", ring_title="Rénovation /<br>réparation",
  short="Fuite, tuiles cassées, faîtage fissuré : diagnostic précis, réparation ciblée ou réfection complète.",
  h1="Rénovation et réparation de toiture <span class=\"h-light\">à Angers</span>",
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
  ring_label="02 — Toiture neuve", ring_title="Toiture<br>neuve",
  short="Construction, extension ou réfection totale : une couverture neuve posée dans les règles de l'art.",
  h1="Pose de toiture neuve <span class=\"h-light\">à Angers</span>",
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
  ring_label="03 — Entretien", ring_title="Entretien /<br>démoussage",
  short="Nettoyage, traitement anti-mousse et hydrofuge : un toit propre dure des années de plus.",
  h1="Démoussage et entretien de toiture <span class=\"h-light\">à Angers</span>",
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
  ring_label="04 — Zinguerie", ring_title="Zinguerie /<br>gouttières",
  short="Gouttières, chéneaux, noues et solins : l'eau évacuée loin de la maison, façades et fondations protégées.",
  h1="Zinguerie et gouttières <span class=\"h-light\">à Angers</span>",
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
  ring_label="05 — Fenêtres de toit", ring_title="Fenêtres<br>de toit",
  short="Plus de lumière sous les combles, une fenêtre de toit étanche et bien isolée, en pose neuve ou en remplacement.",
  h1="Pose et remplacement de Velux <span class=\"h-light\">à Angers</span>",
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
  ring_label="06 — Peinture", ring_title="Peinture<br>de toiture",
  short="Une toiture terne retrouve sa teinte et une protection durable contre la pluie, le soleil et les UV.",
  h1="Peinture de toiture <span class=\"h-light\">à Angers</span>",
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
# (slug, après, avant, titre affiché en bas, sous-titre, légende)
BA = [
 ("maison-1", "images/ba/maison-1-apres.jpg", "images/ba/maison-1-avant.jpg", "Réfection /<br>ardoise naturelle", "Rénovation de toiture", "Réfection complète d'une couverture en ardoise naturelle"),
 ("maison-2", "images/ba/maison-2-apres.jpg", "images/ba/maison-2-avant.jpg", "Côté jardin /<br>zinguerie reprise", "Rénovation de toiture", "La même maison, côté jardin : ardoise neuve et zinguerie reprise"),
 ("faitage",  "images/ba/faitage-apres.jpg",  "images/ba/faitage-avant.jpg",  "Faîtage neuf /<br>closoir ventilé", "Rénovation de toiture", "Faîtage neuf : closoir ventilé et tuiles faîtières"),
]
PHOTOS = []

# L'atelier 3D : matières, couches, désordres (textes affichés dans le panneau)
MATS = [
 ("tuile", "Tuile terre cuite", "Terre cuite", "La couverture angevine par excellence : chaude, durable, posée à l'emboîtement ou à recouvrement.", [("Durée de vie", "50 ans et plus"), ("Pente", "Moyenne à forte"), ("Entretien", "Démoussage régulier")]),
 ("beton", "Tuile béton", "Teinte ardoisée", "Économique et robuste. Elle se décolore avec les années, puis se nettoie et se peint très bien.", [("Durée de vie", "30 à 50 ans"), ("Pente", "Moyenne"), ("Entretien", "Nettoyage, peinture possible")]),
 ("ardoise", "Ardoise naturelle", "Schiste de Trélazé", "La fierté d'Angers : fine, sombre, quasi inusable, fixée au crochet inox.", [("Durée de vie", "80 à 100 ans"), ("Pente", "Forte"), ("Entretien", "Très faible")]),
 ("zinc", "Zinc à joint debout", "Métal", "Pour les faibles pentes, les extensions et les lucarnes : étanche, léger, patine naturelle.", [("Durée de vie", "50 ans et plus"), ("Pente", "Faible possible"), ("Entretien", "Aucun")]),
]
LAYERS = [
 ("couverture", "Couverture", "Tuiles, ardoises ou zinc : la peau qui évacue l'eau. C'est elle que l'on voit, c'est elle que l'on répare le plus souvent."),
 ("liteaux", "Liteaux", "Les tasseaux de bois qui portent chaque rang de tuiles. Un liteaunage régulier, c'est une couverture qui reste droite."),
 ("ecran", "Écran sous-toiture", "La membrane qui arrête l'eau et la neige poudreuse passées sous les tuiles, et qui laisse respirer la charpente."),
 ("isolation", "Isolation", "Le confort d'été, les économies d'hiver et les aides de l'État se jouent dans cette couche. Nous sommes certifiés RGE."),
 ("charpente", "Charpente", "Pannes, chevrons, fermes : la structure qui porte tout. Nous la vérifions et la traitons avant de couvrir."),
]
# (id, titre, où, symptôme, intervention, page, libellé du lien)
HOTSPOTS = [
 ("tuile", "Tuile glissée", "Versant sud", "Une tuile déplacée par le vent ou le gel laisse passer l'eau à chaque averse. Au plafond, l'auréole apparaît des mois plus tard.", "Remplacement de la tuile, contrôle des rangs voisins et de l'écran sous-toiture. Intervention rapide.", "renovation-reparation-toiture", "Rénovation et réparation"),
 ("usure", "Couverture en fin de vie", "Versant sud", "Tuiles poreuses, fendues, qui cassent au moindre passage : les réparations se multiplient et coûtent plus cher qu'une réfection.", "Dépose, écran sous-toiture, liteaunage et couverture neuve, sous garantie décennale.", "pose-toiture-neuve", "Pose de toiture neuve"),
 ("mousse", "Mousse sur le versant nord", "Versant nord", "Invisible depuis la rue, la mousse retient l'eau toute l'année, soulève les tuiles et bouche les gouttières.", "Démoussage manuel ou basse pression, traitement anti-mousse, hydrofuge de protection.", "entretien-demoussage", "Entretien et démoussage"),
 ("solin", "Solin de cheminée décollé", "Cheminée", "Le zinc s'est décollé au pied de la souche : l'eau s'infiltre derrière la cheminée et ruisselle sur l'isolant.", "Abergement en zinc neuf soudé sur place, étanchéité rétablie autour de la souche.", "zinguerie", "Zinguerie et gouttières"),
 ("velux", "Fenêtre de toit fatiguée", "Combles", "Joint usé, vitrage embué : la fenêtre laisse passer le froid, parfois l'eau, et les combles deviennent inconfortables.", "Remplacement par une fenêtre de toit neuve avec son raccord d'étanchéité, sans toucher aux finitions intérieures.", "pose-velux", "Pose de Velux"),
 ("teinte", "Tuiles ternes et poreuses", "Versant sud", "Les tuiles béton se décolorent et boivent l'eau : la couverture vieillit deux fois plus vite.", "Nettoyage, traitement, puis résine pigmentée en deux couches : teinte et protection retrouvées.", "peinture-toiture", "Peinture de toiture"),
]

# ----------------------------------------------------------------------------- utilitaires
def href(path):
    if path.startswith("http"): return path
    base, _, frag = path.partition("#")
    if base in ("", "index.html"): base = "/"
    elif base.endswith(".html"): base = "/" + base[:-5]
    return base + ("#" + frag if frag else "")
def esc(s): return re.sub(r"<[^>]+>", "", s).replace("&", "&amp;").replace('"', "&quot;")
def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

GLYPH = '<svg class="brand-glyph" viewBox="0 0 48 44" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 31 24 9l20 22"/><path d="M33 12.5V20M30.5 12.5h5"/></svg>'
FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230F1C2A'/%3E%3Cpath d='M12 41 32 19l20 22M41 22.5V30M38.5 22.5h5' fill='none' stroke='%23C9A47A' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"

def brand():
    return f'<a class="brand" href="/" aria-label="{N}, accueil">{GLYPH}<span class="brand-text"><span>Général</span><span>Couverture</span></span></a>'

def header(section="Accueil"):
    srv = "".join(f'<a href="{href(s["slug"] + ".html")}">{s["nav"]}</a>' for s in SERVICES)
    return f'''<header class="site-header" id="header">
  {brand()}
  <div class="nav-center" aria-hidden="true"><span class="label" id="nav-section">{section}</span><div class="nav-line"><span id="nav-fill"></span></div></div>
  <div class="nav-right">
    <a href="/#services">Services</a><a href="/#realisations">Réalisations</a><a href="{href("zones-intervention.html")}">Zone</a><a href="{href("contact.html")}">Contact</a><a class="nav-tel" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a>
    <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu"><span></span></button>
  </div>
</header>
<div class="menu" id="menu" aria-label="Menu">
  <div></div>
  <nav class="menu-list">
    <div><a href="/#services">Services</a><a href="/#realisations">Réalisations</a><a href="{href("zones-intervention.html")}">Zone d'intervention</a><a href="{href("contact.html")}">Contact</a></div>
    <div class="small">{srv}</div>
  </nav>
  <div class="menu-foot"><span>{N} · Angers · Maine-et-Loire</span><a href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a></div>
</div>'''

def footer():
    srv = "".join(f'<li><a href="{href(s["slug"] + ".html")}">{s["title"]}</a></li>' for s in SERVICES)
    return f'''<footer class="footer navy" data-nav="Contact">
  <div class="footer-grid">
    <div>{brand()}<p class="footer-desc">Couvreur certifié RGE à Angers. Rénovation, toiture neuve, entretien, zinguerie, fenêtres de toit et peinture de toiture dans tout le Maine-et-Loire.</p></div>
    <div><h4 class="label">Services</h4><ul>{srv}</ul></div>
    <div><h4 class="label">Contact</h4><ul><li><a href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a></li><li>{SITE["hours"]}</li><li>Angers · {SITE["dept"]}</li><li><a href="{href("zones-intervention.html")}">Zone d'intervention</a></li><li><a href="{href("contact.html")}">Demander un devis</a></li><li><a href="{href("mentions-legales.html")}">Mentions légales</a></li></ul></div>
  </div>
  <div class="footer-bottom"><span>© {SITE["year"]} {N} — Angers</span><span>Certifié RGE · Garantie décennale · Devis gratuit</span></div>
</footer>
<a class="call-bar" href="tel:{SITE["tel_link"]}">Appeler · {SITE["tel"]}</a>
<script src="/js/site.js?v={V}"></script>'''

def layout(title, desc, body, path, extra_head="", scripts="", og_image="images/og-image.jpg", section="Accueil"):
    canonical = SITE["url"] + href(path)
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#0F1C2A">
<link rel="icon" href="{FAVICON}">
<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="{N}">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{SITE["url"]}/{og_image}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/studio.css?v={V}">
{extra_head}
</head>
<body>
{header(section)}
<main>
{body}
</main>
{footer()}
{scripts}
</body>
</html>
'''

def jsonld(obj): return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, indent=1) + '</script>'
ORG = {"@context": "https://schema.org", "@type": "RoofingContractor", "@id": SITE["url"] + "/#org", "name": N, "url": SITE["url"] + "/", "telephone": SITE["tel_link"], "image": SITE["url"] + "/images/og-image.jpg",
  "description": "Couvreur certifié RGE à Angers et dans le Maine-et-Loire : rénovation de toiture, toiture neuve, démoussage, zinguerie, Velux, peinture de toiture.",
  "address": {"@type": "PostalAddress", "addressLocality": "Angers", "addressRegion": "Maine-et-Loire", "postalCode": "49000", "addressCountry": "FR"}, "areaServed": [z[0] for z in ZONES], "priceRange": "€€",
  "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "08:30", "closes": "18:00"}],
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": str(len(REVIEWS))},
  "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Services de couverture", "itemListElement": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": s["title"], "url": SITE["url"] + href(s["slug"] + ".html")}} for s in SERVICES]}}

# ----------------------------------------------------------------------------- illustrations animées de la méthode (SVG inline)
ILLU = {
"appel": '''<svg class="illu illu-phone" viewBox="0 0 200 200" aria-hidden="true">
<g class="ph-body"><rect class="f" x="70" y="30" width="60" height="120" rx="12"/><rect class="soft" x="78" y="42" width="44" height="88" rx="4"/><circle class="g" cx="100" cy="140" r="3"/>
<g class="ph-call"><rect class="f gs" x="84" y="52" width="32" height="14" rx="7"/><circle class="g" cx="92" cy="59" r="3"/><path d="M99 59h11"/></g>
<path d="M86 84h28M86 94h20M86 104h24"/></g>
<path class="ph-wave w1 gs" d="M140 76a24 24 0 0 1 0 48"/><path class="ph-wave w2 gs" d="M152 64a40 40 0 0 1 0 72"/>
<path class="ph-wave w1 gs" d="M60 76a24 24 0 0 0 0 48"/><path class="ph-wave w2 gs" d="M48 64a40 40 0 0 0 0 72"/>
<text class="illu-text" x="100" y="180" text-anchor="middle">06 21 32 37 89</text>
</svg>''',
"visite": '''<svg class="illu illu-diag" viewBox="0 0 200 200" aria-hidden="true">
<rect class="soft" x="124" y="56" width="12" height="26"/><path class="f" d="M44 152V96l56-44 56 44v56z"/><path d="M30 104l70-56 70 56"/><path d="M124 58V82M136 58V80M44 152h112"/>
<rect class="soft" x="90" y="118" width="20" height="34"/><rect x="60" y="112" width="16" height="16"/><rect x="124" y="112" width="16" height="16"/>
<g transform="translate(66 86)"><g class="dg-check" style="--d:0.4s"><circle class="g" r="8"/><path class="navy" d="M-3.5 0l2.5 2.5 5-5"/></g></g>
<g transform="translate(100 66)"><g class="dg-check" style="--d:1.9s"><circle class="g" r="8"/><path class="navy" d="M-3.5 0l2.5 2.5 5-5"/></g></g>
<g transform="translate(140 92)"><g class="dg-check" style="--d:3.4s"><circle class="g" r="8"/><path class="navy" d="M-3.5 0l2.5 2.5 5-5"/></g></g>
<g class="dg-lens"><circle class="f gs thick" cx="100" cy="80" r="17" style="fill:rgba(201,164,122,.14)"/><path class="gs thick" d="M112 92l17 17"/></g>
</svg>''',
"devis": '''<svg class="illu illu-devis" viewBox="0 0 200 200" aria-hidden="true">
<path class="f" d="M56 28h66l22 22v122H56z"/><path d="M122 28v22h22"/>
<path class="dv-line" style="--d:0.2s" d="M72 70h48"/><path class="dv-line" style="--d:0.6s" d="M72 86h56"/><path class="dv-line" style="--d:1s" d="M72 102h40"/><path class="dv-line" style="--d:1.4s" d="M72 118h52"/>
<path class="dv-line gs thick" style="--d:1.9s" d="M72 142h56"/>
<g class="dv-stamp"><rect class="gs thick" x="94" y="150" width="60" height="22" rx="3" transform="rotate(-10 124 161)" style="fill:rgba(201,164,122,.14)"/><text class="illu-text" x="124" y="165" text-anchor="middle" transform="rotate(-10 124 161)" style="fill:var(--gold-dark)">GRATUIT</text></g>
</svg>''',
"travaux": '''<svg class="illu illu-travaux" viewBox="0 0 200 200" aria-hidden="true">
<path d="M24 136h152"/><g transform="skewX(-34)"><rect class="f" x="110" y="58" width="96" height="70"/>
<rect class="tw-t soft" style="--d:0s" x="114" y="62" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:0.2s" x="137" y="62" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:0.4s" x="160" y="62" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:0.6s" x="183" y="62" width="20" height="18" rx="2"/>
<rect class="tw-t soft" style="--d:0.8s" x="114" y="84" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:1s" x="137" y="84" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:1.2s" x="160" y="84" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:1.4s" x="183" y="84" width="20" height="18" rx="2"/>
<rect class="tw-t soft" style="--d:1.6s" x="114" y="106" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:1.8s" x="137" y="106" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:2s" x="160" y="106" width="20" height="18" rx="2"/><rect class="tw-t soft" style="--d:2.2s" x="183" y="106" width="20" height="18" rx="2"/></g>
<path class="gs thick" d="M62 58h92"/>
<g transform="translate(150 152)"><g class="tw-shield"><path class="g" d="M0-24l22 8v15c0 13-10 22-22 26-12-4-22-13-22-26v-15z"/><text class="illu-text on-gold" y="4" text-anchor="middle">10 ANS</text></g></g>
</svg>''',
}

# ----------------------------------------------------------------------------- blocs
def faq_block(items): return "".join(f'<details{" open" if i == 0 else ""}><summary>{q}</summary><p>{a}</p></details>' for i, (q, a) in enumerate(items))

def wire_house():
    return '<div class="wire" aria-hidden="true"><div class="wire-spin"><i class="w-f"></i><i class="w-b"></i><i class="w-l"></i><i class="w-r"></i><i class="w-rf"></i><i class="w-rb"></i><i class="w-gl"></i><i class="w-gr"></i><i class="w-ch"></i></div></div>'

def ring_section(sid, nav, cls, label, hint, cards, center, caption, axis, n):
    dots = "".join(f'<button type="button" aria-label="Élément {i+1}"{" class=is-active" if i == 0 else ""}>0{i+1}</button>' for i in range(n))
    return f'''<section class="ring-section {cls}" id="{sid}" data-nav="{nav}" style="--n:{n}">
  <div class="ring-stage">
    <div class="ring-head"><span class="label gold">{label}</span><span class="label muted">{hint}</span></div>
    <div class="ring-wrap"><div class="ring" data-axis="{axis}">{center}{cards}</div></div>
    <div class="ring-foot">{caption}<div class="ring-nav"><div class="ring-dots">{dots}</div><div class="ring-arrows"><button type="button" class="ring-prev" aria-label="Précédent">←</button><button type="button" class="ring-next" aria-label="Suivant">→</button></div></div></div>
  </div>
</section>'''

def services_ring():
    cards = "".join(f'<figure class="ring-card srv-card" data-title="{s["ring_title"]}" data-desc="{esc(s["short"])}" data-href="{href(s["slug"] + ".html")}"><img src="/{s["img"]}" alt="{esc(s["title"])}" loading="lazy" draggable="false"><span class="ring-tag label">0{i+1}</span><figcaption>{s["title"]}</figcaption></figure>' for i, s in enumerate(SERVICES))
    caption = f'<div class="ring-caption"><div class="ring-index"><span class="ring-cur">01</span><span class="sep">/</span><span class="tot">0{len(SERVICES)}</span></div><h2 class="ring-title">{SERVICES[0]["ring_title"]}</h2><p class="ring-desc">{SERVICES[0]["short"]}</p><a class="link-u ring-link" href="{href(SERVICES[0]["slug"] + ".html")}">Voir le service</a></div>'
    return ring_section("services", "Services", "navy", "Nos services — six métiers, une seule exigence", "Faites défiler : les cartes tournent autour de la maquette", cards, wire_house(), caption, "y", len(SERVICES))

METHOD = [("appel", "Vous appelez", "Décrivez votre toiture et le problème. Pour une fuite, nous organisons une intervention rapide."),
          ("visite", "Visite et diagnostic", "Nous montons sur le toit, nous contrôlons couverture, zinguerie et charpente, photos à l'appui."),
          ("devis", "Devis détaillé", "Gratuit, chiffré poste par poste. Le prix indiqué est celui que vous payez."),
          ("travaux", "Travaux et garantie", "Chantier propre, maison hors d'eau chaque soir, garantie décennale sur nos réalisations.")]

def method_ring():
    cards = "".join(f'<figure class="ring-card method-card" data-title="{t}"><div class="method-illu">{ILLU[k]}</div><figcaption><span class="num">Étape 0{i+1}</span><h3>{t}</h3><p>{d}</p></figcaption></figure>' for i, (k, t, d) in enumerate(METHOD))
    center = '<div class="ring-num" aria-hidden="true"><span class="ring-num-val">01</span></div>'
    caption = '<div class="ring-caption"><h2>Simple, clair,<br><span class="h-light">sans surprise.</span></h2><p class="ring-desc">Quatre étapes, toujours les mêmes, du premier appel à la fin du chantier.</p></div>'
    return ring_section("methode", "Méthode", "cream", "La méthode — quatre étapes", "Faites défiler : les étapes tournent", cards, center, caption, "y", len(METHOD))

def ba_card(slug, after, before, title, sub, caption):
    return f'''<figure class="ring-card ba" data-ba data-title="{title}" data-sub="{sub}">
  <div class="ba-frame"><img src="/{after}" alt="Après : {esc(caption)}" loading="lazy" draggable="false"><div class="ba-before" style="--pos:50%"><img src="/{before}" alt="Avant les travaux" loading="lazy" draggable="false"></div><div class="ba-handle" style="--pos:50%"><span></span></div><input class="ba-range" type="range" min="2" max="98" value="50" aria-label="Comparer avant et après"><span class="ba-tag ba-tag-before">Avant</span><span class="ba-tag ba-tag-after">Après</span></div>
  <figcaption>{caption}</figcaption>
</figure>'''

def realisations_wheel():
    cards = "".join(ba_card(*b) for b in BA)
    caption = f'<div class="ring-caption"><span class="label gold ring-sub">{BA[0][4]}</span><h2 class="ring-title">{BA[0][3]}</h2><p class="ring-desc">Les « après » sont nos chantiers ; déplacez le curseur pour retrouver l\'état d\'avant.</p></div>'
    return ring_section("realisations", "Réalisations", "cream", "Réalisations — avant / après", "Faites défiler : la roue tourne, glissez le curseur", cards, "", caption, "x", len(BA))

def services_rows(exclude=None):
    rows, i = [], 0
    for s in SERVICES:
        if s["slug"] == exclude: continue
        i += 1
        rows.append(f'<li class="srv-row reveal" style="--i:{i-1}"><a href="{href(s["slug"] + ".html")}"><span class="srv-num">0{i}</span><span class="srv-title">{s["title"]}</span><span class="srv-desc">{s["short"]}</span><span class="srv-arrow">→</span></a></li>')
    return f'<ol class="srv-list">{"".join(rows)}</ol>'

def cta_band(title="Un projet de toiture ?<br>Parlons-en.", text="Devis gratuit et détaillé après visite sur site. Le prix annoncé est le prix payé."):
    return f'''<section class="section cta-band" data-nav="Contact"><div class="section-inner">
  <div class="reveal"><h2>{title}</h2><p>{text}</p></div>
  <div class="reveal" style="--i:1"><a class="contact-phone" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a><p>{SITE["hours"]} · Urgence fuite : appelez-nous.</p><div class="btn-row"><a class="btn btn-gold" href="{href("contact.html")}">Demander un devis</a><a class="btn btn-outline" href="{href("zones-intervention.html")}">Zone d'intervention</a></div></div>
</div></section>'''

def form_block():
    opts = "".join(f'<option value="{s["title"]}">{s["title"]}</option>' for s in SERVICES)
    return f'''<form class="form reveal" id="devisForm" action="https://api.web3forms.com/submit" method="POST" novalidate style="--i:1">
  <input type="hidden" name="access_key" value="{SITE["web3forms"]}"><input type="hidden" name="subject" value="Nouvelle demande de devis — {N}"><input type="hidden" name="from_name" value="Formulaire {N}"><input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">
  <div class="form-grid">
    <div class="field"><label for="f-nom">Nom</label><input id="f-nom" name="nom" type="text" autocomplete="name" required placeholder="Votre nom"></div>
    <div class="field"><label for="f-tel">Téléphone</label><input id="f-tel" name="telephone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="06 …"></div>
    <div class="field"><label for="f-email">E-mail (facultatif)</label><input id="f-email" name="email" type="email" autocomplete="email" placeholder="vous@exemple.fr"></div>
    <div class="field"><label for="f-ville">Commune</label><input id="f-ville" name="commune" type="text" placeholder="Angers, Trélazé…"></div>
    <div class="field full"><label for="f-prest">Prestation</label><select id="f-prest" name="prestation"><option value="">Je ne sais pas encore</option>{opts}<option value="Autre">Autre demande</option></select></div>
    <div class="field full"><label for="f-msg">Votre projet</label><textarea id="f-msg" name="message" placeholder="Décrivez votre toiture et le problème rencontré."></textarea></div>
  </div>
  <p class="form-note">Réponse sous 24 h ouvrées. Vos coordonnées servent uniquement à vous recontacter.</p>
  <button class="btn btn-gold btn-lg" type="submit" style="margin-top:1.4em">Envoyer ma demande</button>
  <p class="form-status" role="status"></p>
</form>'''

# ----------------------------------------------------------------------------- accueil : la maquette racontée au défilement
def experience():
    labels = "".join(f'<div class="lbl" data-layer="{k}"><span class="dot"></span><span class="tag"><b>{i+1} · {t}</b></span></div>' for i, (k, t, _) in enumerate(LAYERS))
    hots = "".join(f'<button type="button" class="hs" data-hs="{k}" aria-label="{esc(t)}"><span class="dot">{i+1}</span><span class="tag">{t}</span></button>' for i, (k, t, *_r) in enumerate(HOTSPOTS))
    hero = f'''<article class="step step-hero" data-kind="hero" data-nav="Accueil"><div class="step-inner">
      <span class="label gold">Couvreur à Angers — Maine-et-Loire</span>
      <h1>Votre toiture, <span class="h-light">entre de bonnes mains.</span></h1>
      <p class="lead"><span class="lead-long">Rénovation, toiture neuve, recherche de fuite, zinguerie : {N} entretient et refait les toits d'Angers depuis vingt ans. Certifié RGE, garantie décennale, devis gratuit.</span><span class="lead-short">Rénovation, toiture neuve, fuite, zinguerie : couvreur certifié RGE à Angers, devis gratuit.</span></p>
      <div class="btn-row"><a class="btn btn-gold" href="{href("contact.html")}">Demander un devis</a><a class="btn btn-outline" href="#coupe" data-goto="1" data-f="0.2">Découvrir la maquette</a></div>
      <ul class="hero-facts"><li><strong>20 ans</strong>d'expérience</li><li><strong>500</strong>chantiers</li><li><strong>RGE</strong>certifié</li><li><strong>5,0</strong>sur Google</li></ul>
    </div></article>'''
    legend = "".join(f'<li><span class="label">{t}</span><small>{d}</small></li>' for k, t, d in LAYERS)
    coupe = f'''<article class="step" id="coupe" data-kind="coupe" data-nav="La coupe"><div class="step-inner"><span class="label gold step-num">01 — La coupe</span><h2>Ce qui vous protège vraiment.</h2><p>Une toiture, c'est cinq couches. Faites défiler : la maquette s'ouvre et chaque couche prend sa place, de la charpente à la couverture.</p><ol class="layer-legend">{legend}</ol><a class="link-u" href="{href("pose-toiture-neuve.html")}">Pose de toiture neuve</a></div></article>'''
    hs = ""
    for i, (k, t, where, sym, fix, page, lbl) in enumerate(HOTSPOTS):
        hs += f'''<article class="step step-hs" data-kind="hs" data-hs="{k}" data-nav="Diagnostic"><div class="step-inner"><span class="label gold step-num">02 — Le diagnostic · {i+1}/6</span><span class="label muted where">{where}</span><h2>{t}</h2><p><b>Le symptôme.</b> {sym}</p><p><b>Notre intervention.</b> {fix}</p><a class="link-u" href="{href(page + ".html")}">{lbl}</a><span class="after-hint label muted">Continuez à défiler : la réparation apparaît sur la maquette</span></div></article>'''
    entretien = f'''<article class="step" data-kind="entretien" data-nav="Entretien"><div class="step-inner"><span class="label gold step-num">03 — L'entretien</span><h2>Le versant nord, celui qu'on ne voit pas.</h2><p>Invisible depuis la rue, la mousse retient l'eau toute l'année, soulève les tuiles et bouche les gouttières. Faites défiler : démoussage, traitement, puis hydrofuge.</p><div class="clean-meter"><span class="label">Nettoyage du versant nord</span><b class="clean-val">0 %</b></div><a class="link-u" href="{href("entretien-demoussage.html")}">Entretien et démoussage</a></div></article>'''
    chips = "".join(f'<button type="button" class="chip{" is-active" if i == 0 else ""}" data-mat="{k}">{t}</button>' for i, (k, t, _, _, _) in enumerate(MATS))
    infos = ""
    for i, (k, t, sub, desc, facts) in enumerate(MATS):
        dl = "".join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a, b in facts)
        infos += f'<div class="mat-info" data-mat-info="{k}"{"" if i == 0 else " hidden"}><span class="label muted">{sub}</span><h3>{t}</h3><p>{desc}</p><dl class="facts">{dl}</dl></div>'
    matieres = f'''<article class="step step-mat" data-kind="matieres" data-nav="Matières"><div class="step-inner"><span class="label gold step-num">04 — Les matières</span><h2>Chaque toiture a son caractère.</h2><p>Quatre couvertures sur la même maison, pente de 35° : la maquette change toute seule, ou choisissez.</p><div class="chips">{chips}</div>{infos}<div class="btn-row step-cta"><a class="btn btn-gold" href="{href("contact.html")}">Demander un devis gratuit</a></div></div></article>'''
    stage = f'''<div class="stage" id="stage" data-kind="hero">
    <div class="stage-grid" aria-hidden="true"></div>
    <canvas id="scene" aria-hidden="true"></canvas>
    <div class="labels" id="labels">{labels}{hots}</div>
    <div class="m-caption" id="m-caption"></div>
    <div class="stage-ui"><span class="label" id="stage-counter">01 / 05</span><span class="label muted stage-hint">Glissez pour pivoter la maquette</span></div>
    <div class="stage-loading" id="loader"><div><span></span></div></div>
  </div>'''
    return f'''<section class="experience" id="experience" aria-label="Votre toiture en 3D" data-nav="Accueil">
  <div class="steps">{hero}{coupe}{hs}{entretien}{matieres}</div>
  {stage}
</section>'''

def build_index():
    about = f'''<section class="section navy" id="apropos" data-nav="L'entreprise"><div class="wrap about-grid">
  <div class="about-media reveal"><img src="/images/apropos.webp" alt="Couvreur de Général Couverture sur une toiture en ardoise à Angers" loading="lazy" width="750" height="938"></div>
  <div class="about-text reveal" style="--i:1"><span class="label gold">L'entreprise</span><h2 style="margin-top:1.2em">Une entreprise angevine,<br><span class="h-light">un couvreur passionné.</span></h2>
    <p class="about-quote">De la tuile à l'ardoise en passant par le zinc, chaque chantier est traité avec le même niveau d'exigence.</p>
    <p>{N} est une entreprise angevine fondée par un couvreur passionné, fort de plus de quinze ans d'expérience dans la pose et la rénovation de toitures. Basés aux Garennes-sur-Loire, à dix minutes d'Angers, nous intervenons sur l'ensemble du Maine-et-Loire pour les particuliers comme pour les professionnels.</p>
    <p>Certifiés RGE, nous travaillons avec des matériaux de qualité, dans le respect des délais convenus. La garantie décennale couvre l'ensemble de nos réalisations.</p>
    <ul class="badges"><li>Certifié RGE</li><li>Garantie décennale</li><li>Devis gratuit</li></ul></div>
</div></section>'''
    revs = "".join(f'<blockquote class="reveal" style="--i:{i}"><p>« {t} »</p><footer>{n}</footer></blockquote>' for i, (n, t) in enumerate(REVIEWS))
    reviews = f'''<section class="section navy" id="avis" data-nav="Avis"><div class="wrap"><div class="section-head reveal"><div><span class="label gold">Avis clients</span><h2>Ce que disent<br><span class="h-light">nos clients.</span></h2></div><p class="google-badge"><span class="stars">★★★★★</span> 5,0 sur Google · {len(REVIEWS)} avis</p></div><div class="reviews">{revs}</div></div></section>'''
    towns = "".join(f'<li><a href="{href("zones-intervention.html#" + slugify(z[0]))}">{z[0]}</a></li>' for z in ZONES)
    zones = f'''<section class="section cream" id="zone" data-nav="Zone"><div class="wrap zone-grid"><div class="reveal"><span class="label gold">Zone d'intervention</span><h2 style="margin-top:1.2em">Angers et tout<br><span class="h-light">le Maine-et-Loire.</span></h2><p class="lead">Basés aux Garennes-sur-Loire, nous intervenons dans toute l'agglomération et le département, en urgence comme pour les chantiers programmés.</p><a class="link-u" href="{href("zones-intervention.html")}">Toutes les communes</a></div><ul class="towns reveal" style="--i:1">{towns}</ul></div></section>'''
    faq = f'''<section class="section navy" id="faq" data-nav="Questions"><div class="wrap"><div class="section-head reveal"><div><span class="label gold">Questions fréquentes</span><h2>Vos questions,<br><span class="h-light">nos réponses.</span></h2></div></div><div class="faq reveal" style="--i:1">{faq_block(FAQ_HOME)}</div></div></section>'''
    contact = f'''<section class="section cream" id="contact" data-nav="Contact"><div class="wrap contact-grid"><div class="reveal"><span class="label gold">Contact</span><h2 style="margin-top:1.2em">Parlons de<br><span class="h-light">votre toiture.</span></h2><a class="contact-phone" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a><ul class="info-list"><li><strong>Horaires</strong><span>{SITE["hours"]}<br>Urgence fuite : appelez, nous nous organisons.</span></li><li><strong>Secteur</strong><span>Angers, son agglomération et tout le Maine-et-Loire</span></li><li><strong>Devis</strong><span>Gratuit, après visite sur site, chiffré poste par poste</span></li><li><strong>Garanties</strong><span>Certifié RGE · Garantie décennale</span></li></ul></div>{form_block()}</div></section>'''
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ_HOME]}
    body = experience() + services_ring() + method_ring() + about + realisations_wheel() + reviews + zones + faq + contact
    extra = jsonld(ORG) + "\n" + jsonld(faq_ld) + '\n<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>'
    return layout("Couvreur à Angers — Général Couverture | Rénovation, toiture neuve, zinguerie", "Couvreur certifié RGE à Angers et dans le Maine-et-Loire : rénovation et réparation de toiture, toiture neuve, démoussage, zinguerie, Velux, peinture de toiture. Devis gratuit au 06 21 32 37 89.", body, "index.html", extra, f'<script type="module" src="/js/app.js?v={V}"></script>')

# ----------------------------------------------------------------------------- pages internes
def page_top(crumbs, label, h1, lead, img, nav):
    return f'''<section class="page-top" data-nav="{nav}"><div><nav class="crumbs label muted" aria-label="Fil d'Ariane">{crumbs}</nav><span class="label gold">{label}</span><h1 style="margin-top:0.9em">{h1}</h1></div><p class="lead">{lead}</p></section>
<div class="page-visual reveal"><img src="/{img}" alt="" aria-hidden="true" width="1600" height="686"></div>'''

def build_service(s):
    points = "".join(f"<li>{p}</li>" for p in s["points"])
    crumbs = f'<a href="/">Accueil</a><span>/</span><a href="/#services">Services</a><span>/</span><span>{s["nav"]}</span>'
    body = page_top(crumbs, "Couvreur à Angers — Maine-et-Loire", s["h1"], s["intro"], s["img"], s["nav"]) + f'''
<section class="section cream"><div class="wrap service-grid">
  <div class="service-main reveal"><p>{s["p1"]}</p><h2>Ce que nous faisons</h2><ul class="checklist">{points}</ul><p>{s["p2"]}</p><h2>Questions fréquentes</h2><div class="faq">{faq_block(s["faq"])}</div></div>
  <aside class="reveal" style="--i:1"><div class="aside-card"><h3>Devis gratuit</h3><p>Visite sur site, diagnostic et devis chiffré poste par poste, sans engagement.</p><a class="btn btn-gold" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a><a class="btn btn-outline" href="{href("contact.html")}" style="margin-top:0.7em">Écrire via le formulaire</a><ul><li>Certifié RGE</li><li>Garantie décennale</li><li>{SITE["hours"]}</li><li>Angers et Maine-et-Loire</li></ul></div></aside>
</div></section>
<section class="section navy" data-nav="Pourquoi nous"><div class="wrap"><div class="section-head reveal"><div><span class="label gold">Pourquoi {N}</span><h2>Ce qui fait la différence<br><span class="h-light">sur un toit.</span></h2></div></div><ul class="reasons">
  <li class="reveal" style="--i:0"><h3>Un diagnostic honnête</h3><p>Nous montons sur le toit avant de chiffrer. Si une réparation suffit, nous ne vous vendons pas une réfection.</p></li>
  <li class="reveal" style="--i:1"><h3>Des finitions soignées</h3><p>Rives, noues, faîtages et abords de cheminée sont traités avec le même soin que la surface courante : c'est là que les toits fuient.</p></li>
  <li class="reveal" style="--i:2"><h3>RGE et garantie décennale</h3><p>Entreprise certifiée, assurée, qui vous ouvre droit aux aides de l'État pour les travaux de rénovation énergétique.</p></li></ul></div></section>
<section class="section cream" data-nav="Services"><div class="wrap"><div class="section-head reveal"><div><span class="label gold">Nos autres services</span><h2>Tout ce qu'il faut<br><span class="h-light">pour votre toiture.</span></h2></div></div>{services_rows(exclude=s["slug"])}</div></section>
{cta_band()}'''
    ld = [{"@context": "https://schema.org", "@type": "Service", "name": s["title"], "serviceType": s["title"], "provider": {"@id": SITE["url"] + "/#org"}, "areaServed": [z[0] for z in ZONES], "url": SITE["url"] + href(s["slug"] + ".html"), "description": s["seo_desc"]},
          {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE["url"] + "/"}, {"@type": "ListItem", "position": 2, "name": "Services", "item": SITE["url"] + "/#services"}, {"@type": "ListItem", "position": 3, "name": s["title"], "item": SITE["url"] + href(s["slug"] + ".html")}]},
          {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in s["faq"]]}]
    return layout(s["seo_title"], s["seo_desc"], body, s["slug"] + ".html", "\n".join(jsonld(x) for x in ld), og_image=s["img"], section=s["nav"])

def build_zones():
    cards = "".join(f'<li id="{slugify(n)}" class="reveal" style="--i:{i % 2}"><h3>Couvreur à {n}</h3><p>{t}</p></li>' for i, (n, t) in enumerate(ZONES))
    body = page_top('<a href="/">Accueil</a><span>/</span><span>Zone d\'intervention</span>', "Zone d'intervention", 'Couvreur à Angers et <span class="h-light">dans tout le Maine-et-Loire.</span>', "Basés aux Garennes-sur-Loire, à dix minutes d'Angers, nous intervenons dans toute l'agglomération angevine et le département : dépannage de fuite, rénovation, toiture neuve, zinguerie, Velux et entretien.", "images/hero-bg.jpg", "Zone") + f'''
<section class="section cream" data-nav="Communes"><div class="wrap"><div class="section-head reveal"><div><span class="label gold">Nos communes</span><h2>Là où nous travaillons<br><span class="h-light">chaque semaine.</span></h2></div><p>Un déplacement rapide, une connaissance des toitures locales, de l'ardoise de Trélazé à la tuile des pavillons récents.</p></div><ul class="zone-cards">{cards}</ul><p class="muted" style="margin-top:2em">Votre commune n'est pas dans la liste ? Nous couvrons l'ensemble du Maine-et-Loire : appelez-nous, nous vous dirons tout de suite si nous pouvons venir.</p></div></section>
<section class="section navy" data-nav="Services"><div class="wrap"><div class="section-head reveal"><div><span class="label gold">Nos services</span><h2>Ce que nous faisons<br><span class="h-light">pour votre toit.</span></h2></div></div>{services_rows()}</div></section>
{cta_band("Un toit à réparer<br>près de chez vous ?", "Diagnostic sur place et devis gratuit dans toute l'agglomération angevine.")}'''
    return layout("Zone d'intervention : couvreur à Angers et dans le Maine-et-Loire | Général Couverture", "Général Couverture intervient à Angers, Trélazé, Les Ponts-de-Cé, Avrillé, Bouchemaine, Brissac Loire Aubance et dans tout le Maine-et-Loire. Devis gratuit au 06 21 32 37 89.", body, "zones-intervention.html", section="Zone")

def build_contact():
    body = page_top('<a href="/">Accueil</a><span>/</span><span>Contact</span>', "Contact et devis", 'Parlons de <span class="h-light">votre toiture.</span>', "Un appel suffit pour une urgence. Pour un devis, décrivez-nous votre projet : nous vous rappelons sous 24 h ouvrées et nous fixons une visite.", "images/apropos.webp", "Contact") + f'''
<section class="section cream" data-nav="Contact"><div class="wrap contact-grid"><div class="reveal"><span class="label gold">{N}</span><h2 style="margin-top:1.2em;font-size:1.8rem">Couvreur à Angers,<br><span class="h-light">Les Garennes-sur-Loire.</span></h2><a class="contact-phone" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a><ul class="info-list"><li><strong>Horaires</strong><span>{SITE["hours"]}<br>Urgence fuite : appelez, nous nous organisons.</span></li><li><strong>Secteur</strong><span>Angers, son agglomération et tout le Maine-et-Loire</span></li><li><strong>Devis</strong><span>Gratuit, après visite sur site, chiffré poste par poste</span></li><li><strong>Garanties</strong><span>Certifié RGE · Garantie décennale</span></li></ul></div>{form_block()}</div></section>
<section class="section navy" data-nav="Services"><div class="wrap"><div class="section-head reveal"><div><span class="label gold">Nos services</span><h2>Ce que nous pouvons faire<br><span class="h-light">pour vous.</span></h2></div></div>{services_rows()}</div></section>'''
    return layout("Contact et devis gratuit | Général Couverture, couvreur à Angers", "Appelez Général Couverture au 06 21 32 37 89 ou envoyez votre demande de devis : couvreur à Angers et dans le Maine-et-Loire, réponse sous 24 h.", body, "contact.html", section="Contact")

def build_mentions():
    body = f'''<section class="page-top" data-nav="Mentions"><div><nav class="crumbs label muted"><a href="/">Accueil</a><span>/</span><span>Mentions légales</span></nav><h1>Mentions <span class="h-light">légales.</span></h1></div></section>
<section class="section cream"><div class="wrap legal" style="max-width:860px"><h2>Éditeur du site</h2><p>{N}, entreprise de couverture, Les Garennes-sur-Loire – Angers (Maine-et-Loire). Téléphone : {SITE["tel"]}. Directeur de la publication : le gérant de l'entreprise.</p><h2>Hébergement</h2><p>Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis.</p><h2>Propriété intellectuelle</h2><p>L'ensemble des contenus de ce site (textes, visuels, maquette 3D) est la propriété de {N} ou de ses partenaires. Toute reproduction sans autorisation est interdite.</p><h2>Données personnelles</h2><p>Les informations transmises via le formulaire de contact (nom, téléphone, e-mail, message) sont utilisées uniquement pour répondre à votre demande et ne sont jamais cédées à des tiers. Vous pouvez demander leur suppression à tout moment par téléphone. Ce site n'utilise pas de cookies de suivi publicitaire.</p></div></section>'''
    return layout("Mentions légales | Général Couverture", "Mentions légales du site de Général Couverture, couvreur à Angers.", body, "mentions-legales.html", section="Mentions")

def build_404():
    body = f'''<section class="page-top" data-nav="404" style="min-height:70vh"><div><span class="label gold">Erreur 404</span><h1 style="margin-top:0.9em">Cette page <span class="h-light">n'existe pas.</span></h1></div><div><p class="lead">Le lien est peut-être ancien. Retrouvez nos services ou appelez-nous directement.</p><div class="btn-row" style="margin-top:1.4em"><a class="btn btn-gold" href="/">Retour à l'accueil</a><a class="tel-link" href="tel:{SITE["tel_link"]}">{SITE["tel"]}</a></div></div></section>'''
    return layout("Page introuvable | Général Couverture", "Page introuvable.", body, "404.html", section="404")

def write(name, html):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f: f.write(html)
    print("écrit", name, len(html))

def main():
    pages = ["index.html"] + [s["slug"] + ".html" for s in SERVICES] + ["zones-intervention.html", "contact.html", "mentions-legales.html"]
    write("index.html", build_index())
    for s in SERVICES: write(s["slug"] + ".html", build_service(s))
    write("zones-intervention.html", build_zones()); write("contact.html", build_contact()); write("mentions-legales.html", build_mentions()); write("404.html", build_404())
    today = datetime.date.today().isoformat()
    urls = "".join(f'  <url><loc>{SITE["url"]}{href(p)}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>{"1.0" if p == "index.html" else "0.8"}</priority></url>\n' for p in pages)
    write("sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    write("robots.txt", f'User-agent: *\nAllow: /\n\nSitemap: {SITE["url"]}/sitemap.xml\n')

if __name__ == "__main__":
    main()
