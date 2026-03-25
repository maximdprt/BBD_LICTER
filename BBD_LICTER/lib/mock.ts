import { addDays, formatISO, startOfDay } from "date-fns";
import type { DateRange, MentionRow, Sentiment, Source } from "@/lib/types";

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

const SOURCES: readonly Source[] = ["Twitter/X", "Instagram", "TikTok", "LinkedIn"];
const THEMES = [
  "livraison",
  "prix",
  "service",
  "produits",
  "fidélité",
  "application",
  "stock",
  "conseil",
  "SAV",
  "magasin",
] as const;

const POSITIVE_TEMPLATES = [
  "Très satisfait(e) : service au top et rapide.",
  "Excellente expérience, je recommande.",
  "Commande reçue vite, packaging parfait.",
  "Conseils en magasin super utiles.",
  "Application fluide, parcours d’achat agréable.",
] as const;

const NEGATIVE_TEMPLATES = [
  "Déçu(e) : livraison en retard et support difficile à joindre.",
  "Problème de stock et communication insuffisante.",
  "Prix trop élevés par rapport aux concurrents.",
  "SAV lent, résolution compliquée.",
  "Application instable, bug lors du paiement.",
] as const;

const NEUTRAL_TEMPLATES = [
  "Expérience correcte, rien à signaler.",
  "Globalement ok, quelques points à améliorer.",
  "Commande reçue, conforme.",
  "Magasin bien tenu, affluence moyenne.",
  "Service standard.",
] as const;

function sentimentFromScore(score01: number): Sentiment {
  if (score01 >= 0.66) return "positif";
  if (score01 <= 0.33) return "négatif";
  return "neutre";
}

function templateFor(sentiment: Sentiment, rng: Rng) {
  if (sentiment === "positif") return pick(rng, POSITIVE_TEMPLATES);
  if (sentiment === "négatif") return pick(rng, NEGATIVE_TEMPLATES);
  return pick(rng, NEUTRAL_TEMPLATES);
}

export function shouldUseMockFallback(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK_DATA;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function generateMockMentions(range: DateRange, seed = 1337): MentionRow[] {
  const rng = mulberry32(seed);
  const from = startOfDay(range.from);
  const to = startOfDay(range.to);

  const days = Math.max(
    1,
    Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)),
  );

  const rows: MentionRow[] = [];

  for (let i = 0; i <= days; i++) {
    const day = addDays(from, i);
    const base = 14 + Math.round(10 * Math.sin(i / 5) + 8 * Math.sin(i / 12));
    const spike = rng() < 0.04 ? 40 + Math.round(rng() * 60) : 0;
    const volume = clamp(base + spike, 6, 140);

    for (let j = 0; j < volume; j++) {
      const marque = rng() < 0.62 ? ("Sephora" as const) : ("Nocibé" as const);
      const source = pick(rng, SOURCES);
      const theme = pick(rng, THEMES);

      // Différences de "positionnement" simulées
      const marqueBias = marque === "Sephora" ? 0.58 : 0.52;
      const sourceBias =
        source === "TikTok"
          ? 0.54
          : source === "Twitter/X"
            ? 0.49
            : source === "Instagram"
              ? 0.56
              : 0.53;
      const themeBias = theme === "prix" ? 0.42 : theme === "service" ? 0.55 : 0.53;

      const score01 = clamp(
        (marqueBias + sourceBias + themeBias) / 3 + (rng() - 0.5) * 0.28,
        0,
        1,
      );
      const sentiment = sentimentFromScore(score01);
      const note = clamp(1 + score01 * 4 + (rng() - 0.5) * 0.7, 1, 5);

      rows.push({
        id: `mock-${seed}-${i}-${j}`,
        date: formatISO(day, { representation: "complete" }),
        source,
        texte: `${templateFor(sentiment, rng)} (${theme})`,
        note: Math.round(note * 10) / 10,
        sentiment,
        theme,
        marque,
        pays: rng() < 0.88 ? "France" : "Belgique",
        langue: "fr",
      });
    }
  }

  return rows;
}

