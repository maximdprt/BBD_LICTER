import { addDays, formatISO, startOfDay } from "date-fns";
import { signalToMentionRow } from "@/lib/metrics";
import type { DateRange, SignalRow, SignalSentiment, SignalSource, ThemeToken } from "@/lib/types";

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

const SOURCES: readonly SignalSource[] = ["google", "tiktok", "instagram", "linkedin", "reddit"];

const THEMES: readonly ThemeToken[] = [
  "livraison",
  "stock",
  "magasin",
  "fidélité",
  "SAV",
  "service",
  "application",
  "produits",
  "conseil",
  "prix",
];

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

function sentimentFromScore01(score01: number): SignalSentiment {
  if (score01 >= 0.58) return "positive";
  if (score01 <= 0.38) return "negative";
  return "neutral";
}

function score01ToSentimentScore(score01: number): number {
  return Math.round((score01 * 2 - 1) * 1000) / 1000;
}

function templateFor(sentiment: SignalSentiment, rng: Rng) {
  if (sentiment === "positive") return pick(rng, POSITIVE_TEMPLATES);
  if (sentiment === "negative") return pick(rng, NEGATIVE_TEMPLATES);
  return pick(rng, NEUTRAL_TEMPLATES);
}

export function shouldUseMockFallback(): boolean {
  return false;
}

/**
 * Génère des signaux factices alignés sur le schéma `signals` (6 mois).
 */
export function generateMockSignals(range: DateRange, seed = 1337): SignalRow[] {
  const rng = mulberry32(seed);
  const from = startOfDay(range.from);
  const to = startOfDay(range.to);

  const days = Math.max(
    1,
    Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)),
  );

  const rows: SignalRow[] = [];

  for (let i = 0; i <= days; i++) {
    const day = addDays(from, i);
    const base = 14 + Math.round(10 * Math.sin(i / 5) + 8 * Math.sin(i / 12));
    const spike = rng() < 0.04 ? 40 + Math.round(rng() * 60) : 0;
    const volume = clamp(base + spike, 6, 140);

    for (let j = 0; j < volume; j++) {
      const brand = rng() < 0.62 ? ("sephora" as const) : ("nocibe" as const);
      const source = pick(rng, SOURCES);
      const themePrimary = pick(rng, THEMES);
      const themeSecondary = rng() < 0.35 ? pick(rng, THEMES) : themePrimary;
      const themes: ThemeToken[] =
        themePrimary === themeSecondary ? [themePrimary] : [themePrimary, themeSecondary];

      const marqueBias = brand === "sephora" ? 0.56 : 0.5;
      const sourceBias =
        source === "tiktok"
          ? 0.52
          : source === "reddit"
            ? 0.48
            : source === "instagram"
              ? 0.55
              : 0.52;
      const themeBias = themePrimary === "prix" ? 0.4 : themePrimary === "livraison" ? 0.45 : 0.54;

      let score01 = clamp(
        (marqueBias + sourceBias + themeBias) / 3 + (rng() - 0.5) * 0.32,
        0,
        1,
      );
      // Semaine ~39 : crise livraison simulée pour démo jury
      const weekNum = Math.floor(i / 7);
      if (themePrimary === "livraison" && weekNum === Math.floor(days / 7) - 8) {
        score01 = clamp(score01 - 0.22 + (rng() - 0.5) * 0.1, 0, 1);
      }

      const sentiment = sentimentFromScore01(score01);
      const sentiment_score = score01ToSentimentScore(score01);
      const platform_rating = clamp(1 + score01 * 4 + (rng() - 0.5) * 0.6, 1, 5);
      const is_alert = sentiment_score < -0.6 || (rng() < 0.02 && sentiment === "negative");
      const raw = `${templateFor(sentiment, rng)} (${themes.join(", ")})`;

      rows.push({
        id: `sig-${seed}-${i}-${j}`,
        source,
        brand,
        date: formatISO(day, { representation: "complete" }),
        raw_text: raw,
        sentiment,
        sentiment_score,
        themes,
        platform_rating: Math.round(platform_rating * 10) / 10,
        is_alert,
        summary_fr: raw.length > 120 ? `${raw.slice(0, 117)}…` : raw,
        created_at: formatISO(day, { representation: "complete" }),
        resolved: false,
      });
    }
  }

  return rows;
}

/** @deprecated Préférer generateMockSignals + signalToMentionRow dans queries. */
export function generateMockMentions(range: DateRange, seed = 1337) {
  return generateMockSignals(range, seed).map(signalToMentionRow);
}
