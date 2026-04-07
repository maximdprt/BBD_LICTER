import type {
  Marque,
  MentionRow,
  Sentiment,
  SignalBrand,
  SignalRow,
  SignalSentiment,
  SignalSource,
  ThemeToken,
} from "@/lib/types";

/** Indice 0–100 à partir de sentiment_score ∈ [-1, 1]. */
export function sentimentScoreToIndex(score: number): number {
  const s = Math.max(-1, Math.min(1, score));
  return Math.round(((s + 1) / 2) * 100);
}

export function marqueToBrand(m: Marque): SignalBrand {
  return m === "Sephora" ? "sephora" : "nocibe";
}

export function brandToMarque(b: SignalBrand): Marque {
  return b === "sephora" ? "Sephora" : "Nocibé";
}

export function sentimentUiToDb(s: Sentiment): SignalSentiment {
  if (s === "positif") return "positive";
  if (s === "négatif") return "negative";
  return "neutral";
}

export function sentimentDbToUi(s: SignalSentiment): Sentiment {
  if (s === "positive") return "positif";
  if (s === "negative") return "négatif";
  return "neutre";
}

const SOURCE_LABELS: Record<SignalSource, string> = {
  google: "Google",
  tiktok: "TikTok",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  reddit: "Reddit",
};

export function displaySignalSource(src: SignalSource): string {
  return SOURCE_LABELS[src] ?? src;
}

/** Note affichée 1–5 si `platform_rating` absent. */
export function scoreToNote(score: number): number {
  const s = Math.max(-1, Math.min(1, score));
  return Math.round((1 + ((s + 1) / 2) * 4) * 10) / 10;
}

export function isAlertSignal(row: SignalRow): boolean {
  return row.is_alert === true || row.sentiment_score < -0.6;
}

export function signalMatchesTheme(row: SignalRow, theme: string): boolean {
  const t = theme.trim().toLowerCase();
  if (!t) return false;
  return row.themes.some((th) => th.toLowerCase() === t);
}

export function explodeThemes(rows: SignalRow[]): Array<SignalRow & { theme: ThemeToken }> {
  const out: Array<SignalRow & { theme: ThemeToken }> = [];
  for (const r of rows) {
    const ts = r.themes.length ? r.themes : (["service"] as ThemeToken[]);
    for (const theme of ts) {
      out.push({ ...r, theme });
    }
  }
  return out;
}

export function signalToMentionRow(s: SignalRow): MentionRow {
  const themes = s.themes.length ? s.themes : (["service"] as ThemeToken[]);
  return {
    id: s.id,
    date: s.date,
    source: displaySignalSource(s.source),
    texte: s.raw_text,
    note: s.platform_rating ?? scoreToNote(s.sentiment_score),
    sentiment: sentimentDbToUi(s.sentiment),
    theme: themes[0] ?? "service",
    themes,
    marque: brandToMarque(s.brand),
    pays: "France",
    langue: "fr",
    sentiment_score: s.sentiment_score,
    is_alert: s.is_alert,
    summary_fr: s.summary_fr,
    resolved: s.resolved,
  };
}
