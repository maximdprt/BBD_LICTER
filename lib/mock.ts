import { addDays, formatISO, getDayOfYear, getMonth, getDay, startOfDay } from "date-fns";
import { signalToMentionRow } from "@/lib/metrics";
import type { DateRange, SignalRow, SignalSentiment, SignalSource, ThemeToken } from "@/lib/types";

/* ─── RNG déterministe ──────────────────────────────────── */
type Rng = () => number;
function mulberry32(seed: number): Rng {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* ─── Verbatims réalistes par thème × sentiment ─────────── */
const POOL: Record<ThemeToken, Record<"positive" | "negative" | "neutral", readonly string[]>> = {
  livraison: {
    positive: [
      "Commande reçue en 48h, emballage soigné et rien d'abîmé. Vraiment top !",
      "Livraison express, livreur ponctuel, colis impeccable. Je valide totalement.",
      "Click & Collect prêt en 1h comme promis, accueil en magasin au top.",
      "Livraison gratuite dès 40€, expédiée le soir même de ma commande.",
      "Reçu en 2 jours ouvrés, papier de soie et ruban doré — le packaging cadeau est parfait.",
      "Suivi en temps réel très pratique, livrée pile dans le créneau annoncé.",
      "Emballage anti-choc, aucun produit cassé malgré le voyage. Bravo logistique.",
      "Retrait en magasin hyper fluide, pas d'attente et personnel souriant.",
    ],
    negative: [
      "Commande passée il y a 12 jours, toujours rien. Le service client ne rappelle pas.",
      "Colis marqué 'livré' alors que je n'ai rien reçu. Le livreur a dû déposer ça n'importe où.",
      "Livraison annoncée en 3-5 jours, reçue au bout de 3 semaines. Aucune explication, aucune excuse.",
      "Click & Collect : commande 'prête' selon l'appli mais introuvable en magasin. 40 min perdues.",
      "Produit mal protégé, flacon de parfum cassé à l'arrivée. SAV a mis 10 jours à répondre.",
      "J'ai reçu la commande de quelqu'un d'autre. Échange de colis. Données perso en jeu.",
      "Retard de livraison sans notification. J'ai dû annuler mon cadeau d'anniversaire prévu.",
      "Colissimo qui repart systématiquement sans sonner. Dépôt en bureau de poste à 5km.",
      "Délai Black Friday catastrophique : commandé le 29/11, reçu le 18/12. Trop tard pour Noël.",
    ],
    neutral: [
      "Livraison conforme, délai standard. Rien à signaler de particulier.",
      "Reçu dans les temps annoncés. Emballage basique mais correct.",
      "Click & Collect fonctionnel, attente de 10 min en boutique.",
      "Livraison ok, j'aurais aimé un créneau plus précis mais ça reste acceptable.",
    ],
  },
  produits: {
    positive: [
      "La palette Natasha Denona est un chef-d'œuvre, les pigments sont d'une intensité folle.",
      "Fond de teint Charlotte Tilbury Airbrush Flawless : ma peau n'a jamais été aussi belle. Je ne changerai plus.",
      "Le sérum Ordinary Buffet a transformé ma peau en 4 semaines. Incroyable pour ce prix.",
      "Coffret Noël Dior absolument somptueux, ma mère en a pleuré. Ça vaut chaque centime.",
      "Sephora Collection a vraiment monté en gamme, le nouveau blush dure toute la journée.",
      "Le parfum Maison Margiela Replica est enivrant, compliments toute la soirée.",
      "Masque Charlotte Tilbury Goddess Skin : résultat visible dès la première utilisation.",
      "Les exclusivités Sephora arrivent vraiment en avance sur la concurrence, j'adore.",
      "Sol de Janeiro Bum Bum cream : parfum incroyable, peau douce pendant 2 jours. Vite re-commandé.",
      "Drunk Elephant C-Firma : la vitamine C la plus efficace que j'aie testée.",
    ],
    negative: [
      "J'ai reçu un fond de teint Fenty clairement déjà utilisé. Sceau brisé. Pas acceptable.",
      "La crème La Mer commandée avait une texture bizarre, date de péremption dépassée de 4 mois.",
      "Contrefaçon possible : le parfum YSL reçu ne tient pas du tout comme en boutique. Durée : 1h.",
      "La Sephora Collection a vraiment régressé. Le mascara grumelle, le fond de teint s'oxyde.",
      "Produit cassé à l'arrivée, flacon de Chanel N°5 en morceaux. Cadeau raté.",
      "Rupture de stock signalée après paiement. Si c'est indisponible, ne le vendez pas !",
      "Le rouge à lèvres viral TikTok reçu n'est pas du tout la couleur affichée en photo.",
      "Crème hydratante Tatcha presque vide à la livraison. Pot à moitié plein, clairement.",
    ],
    neutral: [
      "Produit conforme à la description, ni plus ni moins. Qualité standard pour le prix.",
      "La palette correspond aux photos. Les couleurs sont jolies mais pas transcendantes.",
      "Parfum reçu intact, sent comme en boutique. Rien à redire.",
      "Bonne qualité dans l'ensemble, mais rien de révolutionnaire par rapport à d'autres marques.",
    ],
  },
  magasin: {
    positive: [
      "La conseillère m'a fait un diagnostic peau complet et m'a trouvé mon fond de teint parfait. Merci !",
      "Sephora Champs-Élysées : ambiance incroyable, testeurs propres, personnel formé et passionné.",
      "Workshop maquillage de 45 min offert en boutique — expérience mémorable.",
      "Magasin bien approvisionné, j'ai trouvé ma teinte en 2 min alors que c'est souvent en rupture ailleurs.",
      "Équipe jeune, dynamique, aucun jugement sur mon budget. Vraiment agréable.",
      "Le réassort se fait vite en boutique, jamais déçue quand je me déplace.",
      "Cabines d'essai makeup propres, lumière naturelle simulée, top pour les swatches.",
      "Anniversaire surprise en boutique avec petit cadeau fidélité. Attentionné !",
    ],
    negative: [
      "20 min d'attente en caisse un samedi, 3 caisses sur 8 ouvertes. Incompréhensible.",
      "Impossible de trouver quelqu'un pour m'aider. Tout le personnel discutait ensemble.",
      "Magasin en désordre, produits hors de leur place, rayons mal étiquetés.",
      "Ambiance très snob, j'ai eu l'impression d'être jugée parce que je portais des marques abordables.",
      "Testeurs hors d'état, visiblement jamais nettoyés. Question d'hygiène basique.",
      "Le produit affiché disponible sur l'appli était introuvable en rayon. Perte de temps.",
      "Personnel peu formé sur les nouveautés, ne connaissait pas les produits en rupture.",
      "Magasin surchauffé, éclairage agressif, je suis ressortie avec migraine.",
    ],
    neutral: [
      "Magasin propre et bien tenu. Service correct mais sans plus.",
      "Ambiance standard, personnel poli mais pas très disponible.",
      "J'ai trouvé ce que je cherchais seule. Magasin classique.",
      "Attente raisonnable en caisse. Pas d'expérience particulière à signaler.",
    ],
  },
  "fidélité": {
    positive: [
      "J'ai atteint le niveau Gold ! Les avantages early-access aux nouvelles collections valent vraiment le détour.",
      "Cadeau anniversaire reçu avec une belle sélection. Fidèle depuis 7 ans, je le reste.",
      "Les points s'accumulent très vite avec les opérations double-points. Intelligent.",
      "Niveau Platinum : l'invitation à l'avant-première privée était une expérience unique.",
      "Le programme Beauty Insider me fait vraiment économiser sur le long terme.",
      "Points convertis en bon de réduction de 20€, utilisable en boutique comme en ligne. Top.",
    ],
    negative: [
      "Mes points ont expiré sans le moindre email d'alerte. 4 ans de fidélité partis à la poubelle.",
      "La refonte du programme fidélité a fait disparaître mes avantages sans explication.",
      "Impossible d'utiliser mes points en ligne, uniquement en magasin. En 2025 c'est une blague.",
      "Nocibé offre clairement plus d'avantages concrets. Le programme Sephora est en retard.",
      "Les conditions changent chaque année sans préavis. Aucune transparence.",
      "Points expirés pendant le confinement alors que les magasins étaient fermés. Honteux.",
      "Le palier Platinum est impossible à atteindre sans dépenser une fortune.",
    ],
    neutral: [
      "Programme fidélité fonctionnel, avantages dans la moyenne du secteur.",
      "Carte utilisée régulièrement, retours corrects. Rien d'exceptionnel.",
      "Les points s'accumulent bien, mais les récompenses pourraient être plus variées.",
    ],
  },
  SAV: {
    positive: [
      "Remboursement intégral en 48h après signalement d'un produit défectueux. Efficace.",
      "Le chat en ligne du service client a résolu mon problème en moins de 15 minutes. Bravo.",
      "Retour en boutique sans ticket de caisse, aucune résistance. Service impeccable.",
      "Conseillère SAV très humaine, elle a compris mon problème dès la première explication.",
      "Échange immédiat sans questions inutiles. C'est comme ça que ça devrait toujours fonctionner.",
      "Remboursement Express pour colis perdu, je n'ai pas eu à insister. Confiance renforcée.",
    ],
    negative: [
      "5 emails envoyés en 3 semaines, aucune réponse. Je vais saisir le médiateur.",
      "On m'a transféré 4 fois entre services pour un simple retour. 1h30 de téléphone pour rien.",
      "Retour refusé car 16 jours écoulés (limite : 15). Zéro flexibilité. Adieu Sephora.",
      "Le chatbot est inutile, tourne en rond, impossible de joindre un humain.",
      "Remboursement refusé avec la mention 'produit ouvert' alors qu'il était défectueux à la livraison.",
      "SAV qui nie avoir reçu mon colis de retour malgré le suivi Colissimo.",
      "Délai de réponse de 12 jours pour un simple échange. Inacceptable.",
    ],
    neutral: [
      "SAV correct, délai de réponse standard (3-4 jours). Problème finalement résolu.",
      "Retour accepté sans friction. Délai de remboursement habituel.",
      "Service client joignable, pas très rapide mais courtois.",
    ],
  },
  service: {
    positive: [
      "Service globalement excellent du début à la fin : commande, livraison, suivi.",
      "Expérience d'achat fluide et agréable, je recommande sans hésiter.",
      "Tout s'est passé comme sur des roulettes. Sephora reste ma référence beauté.",
      "Interface en ligne claire, paiement sécurisé, livraison parfaite. 10/10.",
      "Personnel en magasin vraiment à l'écoute. On se sent client et non numéro.",
    ],
    negative: [
      "L'expérience globale a vraiment baissé depuis 2 ans. Moins de service, plus de problèmes.",
      "Site web lent, appli qui plante, livraison en retard : tout en même temps. Record.",
      "Sephora semble avoir perdu le sens du service client. J'envisage de passer chez Nocibé.",
      "Trop de friction à chaque étape : connexion, panier, paiement, suivi. Épuisant.",
    ],
    neutral: [
      "Service standard, dans la moyenne du secteur. Ni mauvais ni exceptionnel.",
      "Expérience correcte sans plus. Rien qui ferait la différence avec un concurrent.",
    ],
  },
  application: {
    positive: [
      "L'appli Sephora est vraiment bien pensée. La recherche par teinte est révolutionnaire.",
      "Scan teinte en AR : bluffant. J'ai trouvé mon fond de teint parfait sans tester en boutique.",
      "Commande en 3 clics, Apple Pay, livré le lendemain. Parfait de A à Z.",
      "Les notifications de réapprovisionnement fonctionnent très bien, je n'ai plus raté ma crème.",
      "L'historique de commandes est très complet, pratique pour renouveler.",
      "L'appli beauté la plus intuitive du marché. Elle donne envie d'explorer.",
    ],
    negative: [
      "L'appli crashe systématiquement au moment du paiement. Panier perdu 3 fois de suite.",
      "Mise à jour catastrophique : mon compte est inaccessible depuis 5 jours.",
      "Les avis produits ont disparu après la dernière mise à jour. Comment choisir ?",
      "Paiement en 3 fois en panne depuis 2 semaines. Cas signalé, aucune réponse.",
      "Appli de plus en plus lente, catalogues interminables à charger. Pire qu'avant.",
      "Panier qui se vide tout seul entre deux sessions. Frustrant quand on prend le temps de sélectionner.",
      "Notifications push impossibles à désactiver, même en passant par les réglages système.",
    ],
    neutral: [
      "Appli fonctionnelle, interface correcte. Quelques bugs mineurs mais rien de bloquant.",
      "Utilisation standard. Le scan teinte est sympa mais pas toujours précis.",
      "Appli ok pour les basiques. Certaines fonctionnalités mériteraient d'être améliorées.",
    ],
  },
  conseil: {
    positive: [
      "La conseillère a analysé mon teint sous différentes lumières avant de me recommander le bon produit. Bluffant.",
      "Maquillage personnalisé offert en 30 min à Lyon Part-Dieu. Le résultat était vraiment professionnel.",
      "Les fiches produits en ligne sont vraiment détaillées. Les conseils par type de peau sont pertinents.",
      "Workshop skincare Sephora en boutique — une heure super instructive avec une vraie experte.",
      "Les conseillères connaissent parfaitement les marques de niche, ça change vraiment.",
      "Diagnostic peau complet offert sur demande. J'ai appris des choses sur ma propre peau.",
    ],
    negative: [
      "La conseillère voulait uniquement me vendre les produits les plus chers sans écouter mes besoins.",
      "Conseil totalement inadapté : crème riche recommandée pour une peau mixte. Résultat désastreux.",
      "Aucune conseillère disponible. J'ai dû choisir au hasard parmi 200 références.",
      "Les conseils en ligne sont du copier-coller de la fiche fabricant. Zéro valeur ajoutée.",
      "On m'a vendu un soin à 120€ en me disant que c'était indispensable. Marketing agressif.",
    ],
    neutral: [
      "Conseil standard, la conseillère a répondu à mes questions basiques. Sans plus.",
      "Fiche produit correcte mais générique. Difficile de se différencier sur ce critère.",
      "Personnel poli et disponible, mais niveau d'expertise variable selon les vendeurs.",
    ],
  },
  prix: {
    positive: [
      "Les promos Black Friday Sephora étaient vraiment généreuses cette année. Économisé 95€.",
      "Rapport qualité/prix Sephora Collection imbattable sur les essentiels du quotidien.",
      "Livraison gratuite dès 40€, facilement atteints. Un vrai avantage vs la concurrence.",
      "Les ventes flash du vendredi sont incroyables. Je programme mon réveil pour ça.",
      "Prix compétitifs sur les parfums de niche vs les revendeurs indépendants.",
      "Soldes janvier : -30% sur des marques premium, c'était une bonne affaire.",
    ],
    negative: [
      "Les mêmes produits sont 15-20% moins chers chez Nocibé. Difficile de justifier.",
      "Hausse des prix discrète de 8-12% cette année sans aucune communication. Honteux.",
      "50€ pour un fond de teint Sephora Collection, alors qu'il existait à 29€ il y a 2 ans.",
      "Les frais de livraison pour les petites commandes sont dissuasifs.",
      "Les soldes ne sont plus vraiment intéressants : les prix de référence ont augmenté.",
      "Panier moyen forcément élevé pour avoir la livraison gratuite. Stratégie agressive.",
    ],
    neutral: [
      "Prix dans la moyenne du marché. Ni cher ni vraiment abordable.",
      "Tarifs corrects sur les marques accessibles, moins compétitifs sur le luxe.",
      "Les promotions existent mais sont moins fréquentes qu'avant.",
    ],
  },
  stock: {
    positive: [
      "Réassort très rapide, j'ai toujours trouvé mon fond de teint NARS en stock.",
      "L'alerte de disponibilité fonctionne parfaitement, notifiée en moins de 12h.",
      "Large choix de teintes en stock vs d'autres revendeurs qui n'ont que les tons clairs.",
      "Ils ont enfin réapprovisionné le sérum Drunk Elephant, contente d'avoir activé l'alerte.",
      "Même en période de fêtes, les rayons étaient bien garnis. Bonne gestion.",
    ],
    negative: [
      "En rupture sur ma référence depuis 4 mois sans aucune communication sur le retour en stock.",
      "Commande acceptée et payée, puis annulée le lendemain pour rupture de stock. Inadmissible.",
      "La moitié des produits de ma wishlist sont indisponibles depuis des semaines.",
      "Alerte réapprovisionnement activée il y a 3 mois. Toujours rien. Ça ne sert à rien.",
      "Tailles populaires (teintes medium) en rupture permanente, les extrêmes restent.",
      "Site qui affiche 'en stock' mais la commande est annulée après paiement. Mensonge.",
    ],
    neutral: [
      "Stock globalement correct, quelques références manquantes mais rien de critique.",
      "Ruptures occasionnelles sur les nouveautés, normales au lancement.",
      "Disponibilité correcte en magasin, un peu moins bonne en ligne.",
    ],
  },
};

/* ─── Templates spécifiques par plateforme ───────────────── */
// Templates courts style réseaux sociaux (TikTok, Instagram)
const SOCIAL_POSITIVE = [
  "Haul Sephora ce mois-ci, vraiment satisfaite de tout ! ✨",
  "Le nouveau mascara viral est dispo chez Sephora et il est incroyable.",
  "J'ai testé la routine skincare Sephora recommandée et c'est top top top.",
  "Packaging trop beau pour le coffret de Noël, parfait pour offrir.",
  "Reçu en 48h, impeccable. Sephora ne déçoit jamais sur la livraison.",
  "Ce teint naturel grâce au fond de teint NARS, je suis obsédée.",
  "La collab exclusive Sephora × [marque] vaut vraiment le détour.",
  "Essayé le nouveau soin en magasin, ma peau était parfaite toute la journée.",
] as const;

const SOCIAL_NEGATIVE = [
  "Déçue par le fond de teint reçu, couleur complètement différente des photos.",
  "Colis abîmé pour la 2e fois, je lâche vraiment l'affaire.",
  "Honnêtement Nocibé est mieux côté rapport qualité/prix en ce moment.",
  "Le mascara viral TikTok ne tient pas du tout, panda au bout de 2h.",
  "Commande annulée après 3 jours d'attente. Vraiment nul.",
  "Je trouve que Sephora baisse en qualité de service depuis 1 an.",
] as const;

const LINKEDIN_POSITIVE = [
  "Sephora France continue d'innover en matière d'expérience client en magasin. Bel exemple de retail phygital réussi.",
  "Retour d'expérience très positif après ma visite en boutique flagship. Service personnalisé exemplaire.",
  "La stratégie omnicanale de Sephora reste une référence dans la distribution spécialisée beauté.",
  "Felicitations à l'équipe pour le lancement de la nouvelle appli. UX vraiment bien pensée.",
  "Sephora démontre comment le retail peut se réinventer grâce à la data et la personnalisation client.",
  "Très belle initiative Sephora sur l'inclusivité beauté. Référence sectorielle indéniable.",
] as const;

const LINKEDIN_NEUTRAL = [
  "Expérience client Sephora dans la moyenne du secteur premium. Quelques axes d'amélioration identifiables.",
  "Retour objectif : forces sur l'expérience produit, faiblesses sur le SAV digital.",
  "La transformation digitale de Sephora avance mais accuse du retard sur l'IA conversationnelle.",
] as const;

const REDDIT_NEGATIVE = [
  "Franchise avec vous : le programme fidélité Sephora est une arnaque comparé à Nocibé. Aucun avantage concret.",
  "Thread honnête — les prix ont augmenté de 15% en 2 ans alors que les promos sont moins généreuses. On se fait avoir.",
  "Quelqu'un d'autre trouve que le SAV Sephora est devenu nul ? 3 demandes ignorées en 2 semaines.",
  "Le site rame de plus en plus depuis la refonte. Mon panier disparaît à chaque session.",
  "Sephora ou Nocibé pour acheter en ligne ? Après 6 mois de comparaison, Nocibé gagne clairement.",
  "L'appli a crashé le jour des soldes. Impossible de commander. J'ai tout pris chez Douglas à la place.",
  "Service client qui répond 12 jours après. Problème déjà réglé par mes soins entretemps. Inutile.",
] as const;

const REDDIT_NEUTRAL = [
  "Retour d'expérience objectif Sephora vs Nocibé : avantages et inconvénients des deux côtés.",
  "La politique de retour Sephora est honorable mais il faudrait la simplifier en ligne.",
  "Avis partagé sur la nouvelle appli : mieux en termes de design, moins bien côté stabilité.",
] as const;

/* ─── Biais par plateforme (score01) ─────────────────────── */
// Google : bimodal mais majorité 5★ (marque forte)
function googleScoreBias(rng: Rng, baseScore: number): number {
  const p = rng();
  if (p < 0.52) return clamp(0.88 + (rng() - 0.5) * 0.12, 0.72, 1.0); // 5 étoiles
  if (p < 0.68) return clamp(0.12 + (rng() - 0.5) * 0.15, 0.0, 0.28); // 1-2 étoiles
  return clamp(baseScore + (rng() - 0.5) * 0.15, 0.42, 0.70); // 3-4 étoiles
}

// score01 moyen ciblé : Sephora ~0.68 → indice ~68, Nocibé ~0.62 → indice ~62
const SOURCE_BIAS: Record<SignalSource, number> = {
  google: 0.62,
  instagram: 0.68,
  tiktok: 0.64,
  linkedin: 0.72,
  reddit: 0.54,
};

const THEME_BIAS: Record<ThemeToken, number> = {
  prix: 0.52,
  livraison: 0.58,
  SAV: 0.56,
  stock: 0.58,
  application: 0.60,
  magasin: 0.66,
  service: 0.64,
  conseil: 0.68,
  produits: 0.70,
  "fidélité": 0.60,
};

/* ─── Volume saisonnier ──────────────────────────────────── */
// Multiplie le volume journalier de base selon la période
function seasonalMultiplier(date: Date): number {
  const m = getMonth(date); // 0=Jan … 11=Dec
  const d = getDay(date);   // 0=Sun … 6=Sat
  const MONTHLY = [1.35, 1.20, 1.00, 0.90, 1.10, 0.82, 0.72, 0.70, 1.00, 1.10, 1.85, 2.30];
  const WEEKLY = [1.10, 0.90, 0.92, 0.95, 1.00, 1.25, 1.30]; // dim>ven>sam>jeu>mer>mar>lun
  return (MONTHLY[m] ?? 1.0) * (WEEKLY[d] ?? 1.0);
}

/* ─── Événements ponctuels (Black Friday, soldes, etc.) ───── */
// Retourne un multiplicateur et un bias négatif si événement tendu
function eventModifier(date: Date): { volMult: number; scoreDelta: number } {
  const m = getMonth(date);
  const dom = date.getDate();

  // Black Friday = dernier vendredi de novembre
  if (m === 10 && dom >= 22 && dom <= 30 && getDay(date) === 5) {
    return { volMult: 3.2, scoreDelta: -0.04 }; // pic volume, tension livraison
  }
  // Semaine post-Black Friday (débordements livraison)
  if (m === 10 && dom >= 25) return { volMult: 2.1, scoreDelta: -0.07 };
  // Noël shopping peak (15–24 déc)
  if (m === 11 && dom >= 15 && dom <= 24) return { volMult: 2.8, scoreDelta: -0.03 };
  // Retours/SAV post-Noël (26 déc – 5 jan)
  if ((m === 11 && dom >= 26) || (m === 0 && dom <= 5)) return { volMult: 1.6, scoreDelta: -0.10 };
  // Soldes janvier (2e semaine de jan)
  if (m === 0 && dom >= 8 && dom <= 20) return { volMult: 1.9, scoreDelta: 0.05 };
  // Saint-Valentin
  if (m === 1 && dom >= 10 && dom <= 14) return { volMult: 1.7, scoreDelta: 0.06 };
  // Fête des mères (4e dimanche de mai)
  if (m === 4 && dom >= 22 && dom <= 29 && getDay(date) === 0) return { volMult: 1.8, scoreDelta: 0.04 };

  return { volMult: 1.0, scoreDelta: 0.0 };
}

/* ─── Sélection intelligente du texte ───────────────────── */
function pickVerbatim(
  rng: Rng,
  source: SignalSource,
  theme: ThemeToken,
  sentiment: SignalSentiment,
): string {
  const s = sentiment === "positive" ? "positive" : sentiment === "negative" ? "negative" : "neutral";

  // Textes spécifiques par plateforme
  if (source === "instagram" || source === "tiktok") {
    if (s === "positive" && rng() < 0.65) return pick(rng, SOCIAL_POSITIVE);
    if (s === "negative" && rng() < 0.60) return pick(rng, SOCIAL_NEGATIVE);
  }
  if (source === "linkedin") {
    if (s === "positive") return pick(rng, LINKEDIN_POSITIVE);
    return pick(rng, LINKEDIN_NEUTRAL);
  }
  if (source === "reddit") {
    if (s === "negative" && rng() < 0.70) return pick(rng, REDDIT_NEGATIVE);
    if (s === "neutral") return pick(rng, REDDIT_NEUTRAL);
  }

  // Fallback sur pool thématique
  const pool = POOL[theme]?.[s];
  if (pool && pool.length > 0) return pick(rng, pool);

  // Fallback générique
  const generic = POOL.service[s];
  return pick(rng, generic);
}

/* ─── Génération principale ──────────────────────────────── */
export function shouldUseMockFallback(): boolean {
  return false;
}

export function generateMockSignals(range: DateRange, seed = 1337): SignalRow[] {
  const rng = mulberry32(seed);
  const from = startOfDay(range.from);
  const to = startOfDay(range.to);
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));

  const SOURCES: readonly SignalSource[] = ["google", "tiktok", "instagram", "linkedin", "reddit"];
  // Distribution réaliste : Google et Instagram dominent, LinkedIn peu
  const SOURCE_WEIGHTS = [0.28, 0.22, 0.26, 0.08, 0.16]; // google, tiktok, instagram, linkedin, reddit

  const THEMES: readonly ThemeToken[] = [
    "livraison", "stock", "magasin", "fidélité", "SAV",
    "service", "application", "produits", "conseil", "prix",
  ];
  // Pondération réaliste : produits et service = sujets dominants
  const THEME_WEIGHTS = [0.13, 0.07, 0.12, 0.08, 0.08, 0.10, 0.09, 0.17, 0.09, 0.07];

  function weightedPick<T>(arr: readonly T[], weights: number[]): T {
    const r = rng();
    let cumul = 0;
    for (let i = 0; i < arr.length; i++) {
      cumul += weights[i] ?? 0;
      if (r < cumul) return arr[i]!;
    }
    return arr[arr.length - 1]!;
  }

  const rows: SignalRow[] = [];

  for (let i = 0; i <= days; i++) {
    const day = addDays(from, i);
    const { volMult, scoreDelta } = eventModifier(day);
    const seasonal = seasonalMultiplier(day);

    // Volume de base : 22 signaux/jour × saisonnalité × événements + bruit
    const baseVol = 22 * seasonal * volMult;
    const noise = (rng() - 0.5) * 12;
    const volume = clamp(Math.round(baseVol + noise), 5, 180);

    for (let j = 0; j < volume; j++) {
      // Marque : Sephora ~60%, Nocibé ~40% (variable par source)
      const sephoraBias = 0.60;
      const brand = rng() < sephoraBias ? ("sephora" as const) : ("nocibe" as const);

      const source = weightedPick(SOURCES, SOURCE_WEIGHTS);
      const themePrimary = weightedPick(THEMES, THEME_WEIGHTS);
      const themeSecondary = rng() < 0.30 ? weightedPick(THEMES, THEME_WEIGHTS) : themePrimary;
      const themes: ThemeToken[] =
        themePrimary === themeSecondary ? [themePrimary] : [themePrimary, themeSecondary];

      // Score de base
      // Formule : base = moyenne(source, theme) + delta marque + bruit ±0.12
      const marqueDelta = brand === "sephora" ? 0.05 : -0.01;
      const themeBias = THEME_BIAS[themePrimary] ?? 0.62;
      const sourceBias = SOURCE_BIAS[source] ?? 0.62;
      const base = (sourceBias + themeBias) / 2;

      let score01: number;
      if (source === "google") {
        score01 = googleScoreBias(rng, base + marqueDelta + scoreDelta);
      } else {
        score01 = clamp(
          base + marqueDelta + scoreDelta + (rng() - 0.5) * 0.24,
          0, 1,
        );
      }

      // Nocibé légèrement moins bien sur livraison, moins bien sur appli
      // Nocibé plus faible sur certains axes clés
      if (brand === "nocibe" && themePrimary === "livraison")   score01 = clamp(score01 - 0.08, 0, 1);
      if (brand === "nocibe" && themePrimary === "application") score01 = clamp(score01 - 0.09, 0, 1);
      if (brand === "nocibe" && themePrimary === "conseil")     score01 = clamp(score01 - 0.06, 0, 1);
      if (brand === "nocibe" && themePrimary === "magasin")     score01 = clamp(score01 - 0.05, 0, 1);
      // Sephora légèrement moins bien sur prix (perçu plus cher)
      if (brand === "sephora" && themePrimary === "prix")       score01 = clamp(score01 - 0.03, 0, 1);

      // Crise livraison simulée : semaine ~J-8 semaines avant la fin de la plage
      const weekNum = Math.floor(i / 7);
      const totalWeeks = Math.floor(days / 7);
      if (themePrimary === "livraison" && weekNum === totalWeeks - 8) {
        score01 = clamp(score01 - 0.24 + (rng() - 0.5) * 0.08, 0, 1);
      }

      // Sentiment
      // Seuils : moins de négatifs, zone neutre plus large
      const sentiment: SignalSentiment =
        score01 >= 0.56 ? "positive" : score01 <= 0.33 ? "negative" : "neutral";

      const sentiment_score = Math.round((score01 * 2 - 1) * 1000) / 1000;

      // Note plateforme (biaisée selon la source)
      const ratingNoise = (rng() - 0.5) * 0.5;
      const platform_rating =
        source === "linkedin"
          ? null // LinkedIn n'a pas de note
          : clamp(1 + score01 * 4 + ratingNoise, 1, 5);

      const rawText = pickVerbatim(rng, source, themePrimary, sentiment);
      const is_alert = sentiment_score < -0.6 || (rng() < 0.015 && sentiment === "negative");

      rows.push({
        id: `sig-${seed}-${i}-${j}`,
        source,
        brand,
        date: formatISO(day, { representation: "complete" }),
        raw_text: rawText,
        sentiment,
        sentiment_score,
        themes,
        platform_rating: platform_rating != null ? Math.round(platform_rating * 10) / 10 : null,
        is_alert,
        summary_fr: rawText.length > 120 ? `${rawText.slice(0, 117)}…` : rawText,
        created_at: formatISO(day, { representation: "complete" }),
        resolved: is_alert && rng() < 0.45,
      });
    }
  }

  return rows;
}

/** @deprecated Préférer generateMockSignals + signalToMentionRow dans queries. */
export function generateMockMentions(range: DateRange, seed = 1337) {
  return generateMockSignals(range, seed).map(signalToMentionRow);
}
