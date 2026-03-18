export type Source = "Twitter/X" | "Instagram" | "TikTok" | "LinkedIn";
export type Sentiment = "positif" | "négatif" | "neutre";
export type Marque = "Sephora" | "Nocibé";

export type MentionRow = Readonly<{
  id: string;
  date: string; // timestamp ISO string
  source: Source;
  texte: string;
  note: number; // 1..5
  sentiment: Sentiment;
  theme: string;
  marque: Marque;
  pays: string | null;
  langue: string | null;
}>;

export type DateRange = Readonly<{
  from: Date;
  to: Date;
}>;

export type Result<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; error: string }>;

export type WeeklyPoint = Readonly<{
  weekStart: string; // yyyy-MM-dd
  value: number;
}>;

export type WeeklySentimentPoint = Readonly<{
  weekStart: string; // yyyy-MM-dd
  sephora: number | null;
  nocibe: number | null;
}>;

export type VoiceSharePoint = Readonly<{
  source: Source;
  sephora: number;
  nocibe: number;
}>;

export type SentimentIndex = Readonly<{
  marque: Marque;
  score: number | null; // 0..100
}>;

export type MentionVolume = Readonly<{
  marque: Marque;
  total: number;
  deltaPct: number | null;
}>;

export type WeeklyTrend = Readonly<{
  marque: Marque;
  deltaPct: number | null;
  direction: "up" | "down" | "flat";
}>;

export type ThemeCount = Readonly<{
  theme: string;
  count: number;
}>;

export type VerbatimFilters = Readonly<{
  marque?: Marque;
  source?: Source;
  sentiment?: Sentiment;
  theme?: string;
  from?: Date;
  to?: Date;
}>;

export type CompetitorComparison = Readonly<{
  sephora: Readonly<{
    sentimentIndex: number | null;
    mentionVolume: number;
    avgNote: number | null;
    topThemePositif: string | null;
    topThemeNegatif: string | null;
  }>;
  nocibe: Readonly<{
    sentimentIndex: number | null;
    mentionVolume: number;
    avgNote: number | null;
    topThemePositif: string | null;
    topThemeNegatif: string | null;
  }>;
}>;

export type AlertTone = "red" | "orange" | "blue";

export type AlertItem = Readonly<{
  id: string;
  tone: AlertTone;
  title: string;
  description: string;
  createdAt: string; // ISO
}>;

