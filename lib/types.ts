/** Sources brutes Supabase (table `signals`). */
export type SignalSource =
  | "trustpilot"
  | "google"
  | "tiktok"
  | "instagram"
  | "linkedin"
  | "reddit";

export type SignalBrand = "sephora" | "nocibe";

/** Sentiments stockés en base (anglais). */
export type SignalSentiment = "positive" | "negative" | "neutral";

export type ThemeToken =
  | "livraison"
  | "stock"
  | "magasin"
  | "fidélité"
  | "SAV"
  | "service"
  | "application"
  | "produits"
  | "conseil"
  | "prix";

/** Ligne canonique alignée sur la table `signals`. */
export type SignalRow = Readonly<{
  id: string;
  source: SignalSource;
  brand: SignalBrand;
  date: string;
  raw_text: string;
  sentiment: SignalSentiment;
  sentiment_score: number;
  themes: ThemeToken[];
  platform_rating: number | null;
  is_alert: boolean;
  summary_fr: string | null;
  created_at: string;
  resolved?: boolean;
}>;

/** Affichage UI marques */
export type Marque = "Sephora" | "Nocibé";

/** Affichage UI sentiment (français, légendes existantes). */
export type Sentiment = "positif" | "neutre" | "négatif";

/**
 * @deprecated Utiliser SignalSource côté données ; ce type sert aux filtres UI historiques.
 * Les libellés affichés dans les graphiques utilisent `displaySignalSource`.
 */
export type Source = string;

export type MentionRow = Readonly<{
  id: string;
  date: string;
  source: string;
  texte: string;
  note: number;
  sentiment: Sentiment;
  theme: string;
  marque: Marque;
  pays: string | null;
  langue: string | null;
  themes?: ThemeToken[];
  sentiment_score?: number;
  is_alert?: boolean;
  summary_fr?: string | null;
  resolved?: boolean;
}>;

export type DateRange = Readonly<{
  from: Date;
  to: Date;
}>;

export type Result<T> =
  | Readonly<{ ok: true; data: T }>
  | Readonly<{ ok: false; error: string }>;

export type WeeklyPoint = Readonly<{
  weekStart: string;
  value: number;
}>;

export type WeeklySentimentPoint = Readonly<{
  weekStart: string;
  sephora: number | null;
  nocibe: number | null;
}>;

export type VoiceSharePoint = Readonly<{
  source: string;
  sephora: number;
  nocibe: number;
}>;

export type SentimentIndex = Readonly<{
  marque: Marque;
  score: number | null;
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
  avgSentimentScore?: number;
}>;

export type ThemeInsight = Readonly<{
  theme: string;
  count: number;
  share: number;
  dominantSentiment: Sentiment;
}>;

export type VerbatimFilters = Readonly<{
  marque?: Marque;
  /** Un seul code source (rétrocompat) */
  source?: string;
  /** Codes sources `SignalSource` multiples */
  sources?: SignalSource[];
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
    savSentimentIndex: number | null;
    livraisonSentimentIndex: number | null;
  }>;
  nocibe: Readonly<{
    sentimentIndex: number | null;
    mentionVolume: number;
    avgNote: number | null;
    topThemePositif: string | null;
    topThemeNegatif: string | null;
    savSentimentIndex: number | null;
    livraisonSentimentIndex: number | null;
  }>;
}>;

export type RadarAxisKey =
  | "sentiment"
  | "volume"
  | "livraison"
  | "sav"
  | "prix"
  | "fidelite";

export type CompetitorRadarPoint = Readonly<Record<RadarAxisKey, number>>;

export type CompetitorRadarMetrics = Readonly<{
  sephora: CompetitorRadarPoint;
  nocibe: CompetitorRadarPoint;
}>;

export type AlertTone = "red" | "orange" | "blue";

export type AlertItem = Readonly<{
  id: string;
  tone: AlertTone;
  title: string;
  description: string;
  createdAt: string;
}>;

/** Alerte opérationnelle (tableau alertes). */
export type AlertTableRow = Readonly<{
  id: string;
  date: string;
  source: string;
  theme: string;
  summary: string;
  score: number;
  status: "active" | "resolved";
  raw_text: string;
}>;

export type HeatmapCellData = Readonly<{
  weekStart: string;
  theme: string;
  count: number;
  avgSentimentScore: number;
  intensity: number;
}>;

export type TimelinePeak = Readonly<{
  weekStart: string;
  brand: Marque;
  volume: number;
  dominantTheme: string | null;
}>;

export type AIInsightPayload = Readonly<{
  insight: string;
  recommendations: [string, string, string];
  updatedAt: string;
}>;

export type WeakSignalPoint = Readonly<{
  theme: string;
  volumeGrowth: number;
  sentimentDelta: number;
}>;
