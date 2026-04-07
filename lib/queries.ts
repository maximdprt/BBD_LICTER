import {
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import { getSupabaseClient } from "@/lib/supabase";
import {
  brandToMarque,
  displaySignalSource,
  explodeThemes,
  isAlertSignal,
  marqueToBrand,
  sentimentDbToUi,
  sentimentScoreToIndex,
  sentimentUiToDb,
  signalMatchesTheme,
  signalToMentionRow,
} from "@/lib/metrics";
import type {
  AIInsightPayload,
  AlertItem,
  AlertTableRow,
  CompetitorComparison,
  CompetitorRadarMetrics,
  DateRange,
  HeatmapCellData,
  Marque,
  MentionRow,
  MentionVolume,
  RadarAxisKey,
  Result,
  Sentiment,
  SignalBrand,
  SignalRow,
  SignalSentiment,
  SignalSource,
  ThemeCount,
  ThemeInsight,
  ThemeToken,
  TimelinePeak,
  VerbatimFilters,
  VoiceSharePoint,
  WeakSignalPoint,
  WeeklyPoint,
  WeeklySentimentPoint,
  WeeklyTrend,
} from "@/lib/types";

/*
 * Index SQL recommandés (à appliquer sur Supabase quand la table `signals` est en prod) :
 * create index if not exists signals_date_idx on public.signals (date);
 * create index if not exists signals_brand_idx on public.signals (brand);
 * create index if not exists signals_source_idx on public.signals (source);
 * create index if not exists signals_sentiment_idx on public.signals (sentiment);
 * create index if not exists signals_themes_gin on public.signals using gin (themes);
 */

export function defaultDateRangeLast6Months(now = new Date()): DateRange {
  const to = endOfDay(now);
  const from = startOfDay(subDays(now, 180));
  return { from, to };
}

function iso(d: Date): string {
  return d.toISOString();
}

function weekKey(d: Date): string {
  return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

function dayKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

type SignalWhere = {
  brand?: SignalBrand;
  sentiment?: SignalSentiment;
  sources?: SignalSource[];
};

function normalizeSignalRow(raw: Record<string, unknown>): SignalRow {
  const themesRaw = raw.themes;
  const themes = Array.isArray(themesRaw)
    ? (themesRaw as string[]).filter(Boolean)
    : typeof themesRaw === "string"
      ? [themesRaw]
      : [];
  return {
    id: String(raw.id),
    source: raw.source as SignalSource,
    brand: raw.brand as SignalBrand,
    date: String(raw.date),
    raw_text: String(raw.raw_text ?? raw.texte ?? ""),
    sentiment: raw.sentiment as SignalSentiment,
    sentiment_score: Number(raw.sentiment_score ?? 0),
    themes: themes.length ? (themes as SignalRow["themes"]) : ["service"],
    platform_rating: raw.platform_rating != null ? Number(raw.platform_rating) : null,
    is_alert: Boolean(raw.is_alert),
    summary_fr: raw.summary_fr != null ? String(raw.summary_fr) : null,
    created_at: String(raw.created_at ?? raw.date),
    resolved: raw.resolved != null ? Boolean(raw.resolved) : false,
  };
}

/**
 * Requête Supabase cible :
 * supabase.from('signals').select('id,source,brand,date,raw_text,sentiment,sentiment_score,themes,platform_rating,is_alert,summary_fr,created_at,resolved')
 *   .gte('date', from).lte('date', to) + filtres .eq/.in
 */
async function fetchSignals(range: DateRange, where?: SignalWhere): Promise<SignalRow[]> {
  const supabase = getSupabaseClient();
  let q = supabase
    .from("signals")
    .select(
      "id,source,brand,date,raw_text,sentiment,sentiment_score,themes,platform_rating,is_alert,summary_fr,created_at,resolved",
    )
    .gte("date", iso(range.from))
    .lte("date", iso(range.to))
    .neq("source", "trustpilot")
    .limit(100_000); // dépasse la limite Supabase par défaut de 1 000 lignes
  if (where?.brand) q = q.eq("brand", where.brand);
  if (where?.sentiment) q = q.eq("sentiment", where.sentiment);
  if (where?.sources?.length) q = q.in("source", where.sources);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => normalizeSignalRow(r as Record<string, unknown>));
}

/**
 * Requête : agrégation hebdo — select * puis groupement client (ou RPC SQL group by week, brand).
 */
export async function getSentimentOverTime(range: DateRange): Promise<Result<WeeklySentimentPoint[]>> {
  try {
    const mentions = await fetchSignals(range);
    const byWeek = new Map<
      string,
      { sephoraSum: number; sephoraCount: number; nocibeSum: number; nocibeCount: number }
    >();

    for (const m of mentions) {
      const wk = weekKey(new Date(m.date));
      const agg =
        byWeek.get(wk) ??
        { sephoraSum: 0, sephoraCount: 0, nocibeSum: 0, nocibeCount: 0 };
      const idx = sentimentScoreToIndex(m.sentiment_score);
      if (m.brand === "sephora") {
        agg.sephoraSum += idx;
        agg.sephoraCount += 1;
      } else {
        agg.nocibeSum += idx;
        agg.nocibeCount += 1;
      }
      byWeek.set(wk, agg);
    }

    const points = [...byWeek.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, agg]) => ({
        weekStart,
        sephora: agg.sephoraCount ? Math.round(agg.sephoraSum / agg.sephoraCount) : null,
        nocibe: agg.nocibeCount ? Math.round(agg.nocibeSum / agg.nocibeCount) : null,
      }));

    return { ok: true, data: points };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/** Dates de semaines où une alerte est présente (pour marqueurs graphique). */
export async function getAlertWeekMarkers(
  range: DateRange,
  brand: Marque = "Sephora",
): Promise<Result<string[]>> {
  try {
    const rows = await fetchSignals(range, { brand: marqueToBrand(brand) });
    const weeks = new Set<string>();
    for (const r of rows) {
      if (isAlertSignal(r)) weeks.add(weekKey(new Date(r.date)));
    }
    return { ok: true, data: [...weeks].sort() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/**
 * Requête : from signals, filtre date + brand sephora, bucket journalier, avg(sentiment_score) → indice.
 */
export async function getSentimentSparkline30d(marque: Marque): Promise<Result<{ value: number }[]>> {
  try {
    const to = new Date();
    const from = subDays(to, 30);
    const rows = await fetchSignals({ from, to }, { brand: marqueToBrand(marque) });
    const byDay = new Map<string, { sum: number; n: number }>();
    for (const r of rows) {
      const dk = dayKey(new Date(r.date));
      const a = byDay.get(dk) ?? { sum: 0, n: 0 };
      a.sum += sentimentScoreToIndex(r.sentiment_score);
      a.n += 1;
      byDay.set(dk, a);
    }
    const sorted = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
    const out = sorted.map(([, v]) => ({ value: v.n ? Math.round(v.sum / v.n) : 0 }));
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/**
 * Requête : count group by source, brand — pivot Sephora/Nocibé.
 */
export async function getVoiceShareByPlatform(range: DateRange): Promise<Result<VoiceSharePoint[]>> {
  try {
    const mentions = await fetchSignals(range);
    const sources: SignalSource[] = ["google", "tiktok", "instagram", "linkedin", "reddit"];
    const counts = new Map<string, number>();

    for (const m of mentions) {
      const key = `${m.source}__${m.brand}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const out: VoiceSharePoint[] = sources.map((source) => ({
      source: displaySignalSource(source),
      sephora: counts.get(`${source}__sephora`) ?? 0,
      nocibe: counts.get(`${source}__nocibe`) ?? 0,
    }));

    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/**
 * Requête : avg(sentiment_score) filtré brand sur plage → indice 0–100.
 */
export async function getSentimentIndex(marque: Marque, range: DateRange): Promise<Result<{ marque: Marque; score: number | null }>> {
  try {
    const rows = await fetchSignals(range, { brand: marqueToBrand(marque) });
    if (!rows.length) return { ok: true, data: { marque, score: null } };

    let sum = 0;
    for (const m of rows) {
      sum += sentimentScoreToIndex(m.sentiment_score);
    }
    const score = Math.round(sum / rows.length);
    return { ok: true, data: { marque, score } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/**
 * Tendance : moyenne indice 0–100 sur 7 derniers jours vs 7 jours précédents (différence en points d’indice).
 */
export async function getSentimentTrend7dPoints(marque: Marque): Promise<Result<{ deltaPoints: number | null; direction: "up" | "down" | "flat" }>> {
  try {
    const now = new Date();
    const last7 = { from: subDays(now, 7), to: now };
    const prev7 = { from: subDays(now, 14), to: subDays(now, 7) };
    const [a, b] = await Promise.all([
      fetchSignals(last7, { brand: marqueToBrand(marque) }),
      fetchSignals(prev7, { brand: marqueToBrand(marque) }),
    ]);
    const avg = (rows: SignalRow[]) =>
      rows.length ? rows.reduce((s, r) => s + sentimentScoreToIndex(r.sentiment_score), 0) / rows.length : null;
    const m1 = avg(a);
    const m0 = avg(b);
    if (m1 == null || m0 == null) return { ok: true, data: { deltaPoints: null, direction: "flat" } };
    const deltaPoints = Math.round((m1 - m0) * 10) / 10;
    const direction = Math.abs(deltaPoints) < 0.5 ? "flat" : deltaPoints > 0 ? "up" : "down";
    return { ok: true, data: { deltaPoints, direction } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getTopThemes(
  marque: Marque,
  sentiment: Sentiment | "all",
  range: DateRange,
): Promise<Result<ThemeCount[]>> {
  try {
    const base = await fetchSignals(range, { brand: marqueToBrand(marque) });
    const rows =
      sentiment === "all" ? base : base.filter((m) => m.sentiment === sentimentUiToDb(sentiment));

    const counts = new Map<string, { count: number; sumScore: number }>();
    for (const m of explodeThemes(rows)) {
      const t = m.theme;
      const agg = counts.get(t) ?? { count: 0, sumScore: 0 };
      agg.count += 1;
      agg.sumScore += m.sentiment_score;
      counts.set(t, agg);
    }

    const out: ThemeCount[] = [...counts.entries()]
      .map(([theme, v]) => ({
        theme,
        count: v.count,
        avgSentimentScore: Math.round((v.sumScore / v.count) * 1000) / 1000,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getTopThemesInsight(
  marque: Marque,
  range: DateRange,
  limit = 5,
): Promise<Result<ThemeInsight[]>> {
  try {
    const rows = await fetchSignals(range, { brand: marqueToBrand(marque) });
    if (!rows.length) return { ok: true, data: [] };

    const byTheme = new Map<string, { total: number; pos: number; neu: number; neg: number }>();
    for (const m of explodeThemes(rows)) {
      const t = m.theme;
      const agg = byTheme.get(t) ?? { total: 0, pos: 0, neu: 0, neg: 0 };
      agg.total += 1;
      if (m.sentiment === "positive") agg.pos += 1;
      else if (m.sentiment === "negative") agg.neg += 1;
      else agg.neu += 1;
      byTheme.set(t, agg);
    }

    const totalAll = [...byTheme.values()].reduce((acc, v) => acc + v.total, 0);
    const out: ThemeInsight[] = [...byTheme.entries()]
      .map(([theme, v]) => {
        const dominant: Sentiment =
          v.pos >= v.neu && v.pos >= v.neg ? "positif" : v.neg >= v.neu && v.neg >= v.pos ? "négatif" : "neutre";
        return {
          theme,
          count: v.total,
          share: totalAll === 0 ? 0 : v.total / totalAll,
          dominantSentiment: dominant,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, Math.max(1, limit));

    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getWeeklyVolume(marque: Marque, range: DateRange): Promise<Result<WeeklyPoint[]>> {
  try {
    const rows = await fetchSignals(range, { brand: marqueToBrand(marque) });

    const byWeek = new Map<string, number>();
    for (const m of rows) {
      const wk = weekKey(new Date(m.date));
      byWeek.set(wk, (byWeek.get(wk) ?? 0) + 1);
    }

    const out = [...byWeek.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, value]) => ({ weekStart, value }));

    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getSentimentDistribution(
  marque: Marque,
  range: DateRange,
): Promise<Result<Record<Sentiment, number>>> {
  try {
    const rows = await fetchSignals(range, { brand: marqueToBrand(marque) });
    const out: Record<Sentiment, number> = { positif: 0, neutre: 0, négatif: 0 };
    for (const m of rows) out[sentimentDbToUi(m.sentiment)] += 1;
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getAlertsSnapshot(params?: {
  marquePrimary?: Marque;
  marqueCompetitor?: Marque;
}): Promise<Result<AlertItem[]>> {
  const marquePrimary = params?.marquePrimary ?? "Sephora";
  const marqueCompetitor = params?.marqueCompetitor ?? "Nocibé";

  try {
    const now = new Date();
    const last24h: DateRange = { from: subDays(now, 1), to: now };
    const prev24h: DateRange = { from: subDays(now, 2), to: subDays(now, 1) };

    const [rowsLast, rowsPrev] = await Promise.all([
      fetchSignals(last24h, { brand: marqueToBrand(marquePrimary) }),
      fetchSignals(prev24h, { brand: marqueToBrand(marquePrimary) }),
    ]);
    const negLast = rowsLast.filter((r) => r.sentiment === "negative").length;
    const negPrev = rowsPrev.filter((r) => r.sentiment === "negative").length;

    const alerts: AlertItem[] = [];

    if (negPrev > 0) {
      const delta = ((negLast - negPrev) / negPrev) * 100;
      if (delta > 30) {
        alerts.push({
          id: "neg-spike-24h",
          tone: "red",
          title: "Spike de mentions négatives (24h)",
          description: `Les mentions négatives ont augmenté de ${Math.round(delta)}% en 24h.`,
          createdAt: now.toISOString(),
        });
      }
    }

    const range6m = defaultDateRangeLast6Months(now);
    const [primarySent, compSent] = await Promise.all([
      getSentimentIndex(marquePrimary, range6m),
      getSentimentIndex(marqueCompetitor, range6m),
    ]);
    if (primarySent.ok && compSent.ok) {
      const a = primarySent.data.score;
      const b = compSent.data.score;
      if (a != null && b != null && b > a) {
        alerts.push({
          id: "competitor-sentiment-overtake",
          tone: "orange",
          title: `${marqueCompetitor} dépasse ${marquePrimary} en sentiment`,
          description: `Indice ${marqueCompetitor}: ${b} vs ${marquePrimary}: ${a}.`,
          createdAt: now.toISOString(),
        });
      }
    }

    if (rowsLast.length >= 30) {
      const counts = new Map<string, number>();
      for (const m of explodeThemes(rowsLast)) {
        counts.set(m.theme, (counts.get(m.theme) ?? 0) + 1);
      }
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      const top = sorted[0];
      if (top) {
        const share = top[1] / rowsLast.length;
        if (share > 0.1) {
          alerts.push({
            id: "emerging-theme",
            tone: "blue",
            title: "Nouveau thème émergent",
            description: `Le thème “${top[0]}” représente ${(share * 100).toFixed(0)}% du volume sur 24h.`,
            createdAt: now.toISOString(),
          });
        }
      }
    }

    return { ok: true, data: alerts };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getWeeklyTrend(marque: Marque): Promise<Result<WeeklyTrend>> {
  try {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const prevWeekStart = subDays(thisWeekStart, 7);
    const prevWeekEnd = subDays(thisWeekEnd, 7);

    const [thisWeek, prevWeek] = await Promise.all([
      fetchSignals({ from: thisWeekStart, to: thisWeekEnd }, { brand: marqueToBrand(marque) }),
      fetchSignals({ from: prevWeekStart, to: prevWeekEnd }, { brand: marqueToBrand(marque) }),
    ]);

    const prev = prevWeek.length;
    const curr = thisWeek.length;
    if (prev === 0) {
      return {
        ok: true,
        data: { marque, deltaPct: curr === 0 ? 0 : null, direction: curr === 0 ? "flat" : "up" },
      };
    }
    const deltaPct = ((curr - prev) / prev) * 100;
    const direction = Math.abs(deltaPct) < 0.5 ? "flat" : deltaPct > 0 ? "up" : "down";
    return { ok: true, data: { marque, deltaPct, direction } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getMentionVolume(marque: Marque, range: DateRange): Promise<Result<MentionVolume>> {
  try {
    const supabase = getSupabaseClient();
    const brand = marqueToBrand(marque);
    const durationDays = Math.max(
      1,
      Math.round((range.to.getTime() - range.from.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const prevFrom = subDays(range.from, durationDays);
    const prevTo = subDays(range.to, durationDays);

    const [{ count: curr, error: e1 }, { count: prev, error: e2 }] = await Promise.all([
      supabase
        .from("signals")
        .select("id", { count: "exact", head: true })
        .gte("date", iso(range.from))
        .lte("date", iso(range.to))
        .eq("brand", brand)
        .neq("source", "trustpilot"),
      supabase
        .from("signals")
        .select("id", { count: "exact", head: true })
        .gte("date", iso(prevFrom))
        .lte("date", iso(prevTo))
        .eq("brand", brand)
        .neq("source", "trustpilot"),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);

    const total = curr ?? 0;
    const prevTotal = prev ?? 0;
    const deltaPct =
      prevTotal === 0
        ? total === 0 ? 0 : null
        : Math.round(((total - prevTotal) / prevTotal) * 1000) / 10;

    return { ok: true, data: { marque, total, deltaPct } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

const SIGNAL_SOURCES_LIST: SignalSource[] = ["google", "tiktok", "instagram", "linkedin", "reddit"];

/**
 * Requête paginée :
 * supabase.from('signals').select(...).order('date',{ascending:false}).range(from,to)
 * avec .eq sur brand, sentiment, source / .in sources, .contains('themes',[theme])
 */
export async function getVerbatims(
  filters: VerbatimFilters,
  page: number,
  pageSize: number,
): Promise<Result<{ rows: MentionRow[]; nextPage: number | null }>> {
  try {
    const supabase = getSupabaseClient();
    let q = supabase
      .from("signals")
      .select(
        "id,source,brand,date,raw_text,sentiment,sentiment_score,themes,platform_rating,is_alert,summary_fr,created_at,resolved",
      )
      .order("sentiment_score", { ascending: true })
      .order("date", { ascending: false })
      .neq("source", "trustpilot");

    if (filters.marque) q = q.eq("brand", marqueToBrand(filters.marque));
    if (filters.sentiment) q = q.eq("sentiment", sentimentUiToDb(filters.sentiment));
    if (filters.sources?.length) q = q.in("source", filters.sources);
    else if (filters.source) {
      const slug = REVERSE_SOURCE.get(filters.source);
      if (slug) q = q.eq("source", slug);
    }
    if (filters.theme) q = q.contains("themes", [filters.theme.trim().toLowerCase()]);
    if (filters.from) q = q.gte("date", iso(filters.from));
    if (filters.to) q = q.lte("date", iso(filters.to));

    const fromIdx = page * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    const { data, error } = await q.range(fromIdx, toIdx);
    if (error) throw new Error(error.message);

    const rawRows = (data ?? []).map((r) => normalizeSignalRow(r as Record<string, unknown>));
    const rows = rawRows.map(signalToMentionRow);
    const nextPage = rows.length < pageSize ? null : page + 1;
    return { ok: true, data: { rows, nextPage } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

const REVERSE_SOURCE = new Map(
  SIGNAL_SOURCES_LIST.map((s) => [displaySignalSource(s), s] as const),
);

export async function getHighSeverityMentions(
  range: DateRange,
  options?: { marque?: Marque; limit?: number },
): Promise<Result<MentionRow[]>> {
  try {
    const where: SignalWhere = {};
    if (options?.marque) where.brand = marqueToBrand(options.marque);
    const rows = await fetchSignals(range, where);
    const limit = Math.min(50, Math.max(1, options?.limit ?? 20));
    const filtered = rows
      .filter((m) => m.sentiment_score < -0.5 || m.sentiment === "negative")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
    return { ok: true, data: filtered.map(signalToMentionRow) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

function themeSentimentSubset(rows: SignalRow[], theme: ThemeToken): number | null {
  const sub = rows.filter((r) => r.themes.includes(theme));
  if (!sub.length) return null;
  const sum = sub.reduce((a, r) => a + sentimentScoreToIndex(r.sentiment_score), 0);
  return Math.round(sum / sub.length);
}

export async function getCompetitorComparison(range: DateRange): Promise<Result<CompetitorComparison>> {
  try {
    const [sephoraIndex, nocibeIndex] = await Promise.all([
      getSentimentIndex("Sephora", range),
      getSentimentIndex("Nocibé", range),
    ]);
    if (!sephoraIndex.ok) throw new Error(sephoraIndex.error);
    if (!nocibeIndex.ok) throw new Error(nocibeIndex.error);

    const mentions = await fetchSignals(range);
    const seph = mentions.filter((m) => m.brand === "sephora");
    const noci = mentions.filter((m) => m.brand === "nocibe");

    const avgNote = (rows: SignalRow[]) => {
      if (!rows.length) return null;
      const sum = rows.reduce((acc, r) => acc + (r.platform_rating ?? (1 + ((r.sentiment_score + 1) / 2) * 4)), 0);
      return Math.round((sum / rows.length) * 100) / 100;
    };

    const topTheme = (rows: SignalRow[], s: SignalSentiment) => {
      const filtered = explodeThemes(rows.filter((r) => r.sentiment === s));
      const counts = new Map<string, number>();
      for (const r of filtered) {
        counts.set(r.theme, (counts.get(r.theme) ?? 0) + 1);
      }
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] ?? null;
    };

    return {
      ok: true,
      data: {
        sephora: {
          sentimentIndex: sephoraIndex.data.score,
          mentionVolume: seph.length,
          avgNote: avgNote(seph),
          topThemePositif: topTheme(seph, "positive"),
          topThemeNegatif: topTheme(seph, "negative"),
          savSentimentIndex: themeSentimentSubset(seph, "SAV"),
          livraisonSentimentIndex: themeSentimentSubset(seph, "livraison"),
        },
        nocibe: {
          sentimentIndex: nocibeIndex.data.score,
          mentionVolume: noci.length,
          avgNote: avgNote(noci),
          topThemePositif: topTheme(noci, "positive"),
          topThemeNegatif: topTheme(noci, "negative"),
          savSentimentIndex: themeSentimentSubset(noci, "SAV"),
          livraisonSentimentIndex: themeSentimentSubset(noci, "livraison"),
        },
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export function getAlertFlags(params: { sentimentScore: number | null; volumeDeltaPct: number | null }) {
  const sentimentLow = params.sentimentScore !== null && params.sentimentScore < 40;
  const volumeSpike = params.volumeDeltaPct !== null && params.volumeDeltaPct > 50;
  return { sentimentLow, volumeSpike };
}

/** Bandeau : signaux critiques 24h (is_alert ou score < -0.6). */
export async function getCriticalAlerts24hSummary(): Promise<
  Result<{ count: number; dominantTheme: string; dominantSource: string } | null>
> {
  try {
    const now = new Date();
    const range: DateRange = { from: subDays(now, 1), to: now };
    const rows = await fetchSignals(range);
    const crit = rows.filter((r) => isAlertSignal(r));
    if (!crit.length) return { ok: true, data: null };
    const themeCounts = new Map<string, number>();
    const sourceCounts = new Map<string, number>();
    for (const r of explodeThemes(crit)) {
      themeCounts.set(r.theme, (themeCounts.get(r.theme) ?? 0) + 1);
      sourceCounts.set(r.source, (sourceCounts.get(r.source) ?? 0) + 1);
    }
    const domTheme = [...themeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const domSourceKey = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const domSource = domSourceKey ? displaySignalSource(domSourceKey as SignalSource) : "—";
    return { ok: true, data: { count: crit.length, dominantTheme: domTheme, dominantSource: domSource } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/**
 * Requête : avg(sentiment_score)→indice par source, brand sephora, tri asc.
 */
export async function getSentimentBySourceSephora(range: DateRange): Promise<
  Result<{ source: string; score: number; count: number }[]>
> {
  try {
    const rows = await fetchSignals(range, { brand: "sephora" });
    const bySrc = new Map<SignalSource, { sum: number; n: number }>();
    for (const r of rows) {
      const a = bySrc.get(r.source) ?? { sum: 0, n: 0 };
      a.sum += sentimentScoreToIndex(r.sentiment_score);
      a.n += 1;
      bySrc.set(r.source, a);
    }
    const out = [...bySrc.entries()]
      .map(([src, v]) => ({
        source: displaySignalSource(src),
        score: v.n ? Math.round(v.sum / v.n) : 0,
        count: v.n,
      }))
      .sort((a, b) => a.score - b.score);
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/**
 * Avg sentiment index par source pour les deux marques — pour comparaison directe.
 */
export async function getSentimentBySourceBoth(range: DateRange): Promise<
  Result<{ source: string; sephora: number; nocibe: number; sephoraCount: number; nocibeCount: number }[]>
> {
  try {
    const [sephRows, nociRows] = await Promise.all([
      fetchSignals(range, { brand: "sephora" }),
      fetchSignals(range, { brand: "nocibe" }),
    ]);

    const bySrc = new Map<string, { sephSum: number; sephN: number; nociSum: number; nociN: number }>();
    const ensure = (src: string) => {
      if (!bySrc.has(src)) bySrc.set(src, { sephSum: 0, sephN: 0, nociSum: 0, nociN: 0 });
      return bySrc.get(src)!;
    };

    for (const r of sephRows) {
      const a = ensure(displaySignalSource(r.source));
      a.sephSum += sentimentScoreToIndex(r.sentiment_score);
      a.sephN += 1;
    }
    for (const r of nociRows) {
      const a = ensure(displaySignalSource(r.source));
      a.nociSum += sentimentScoreToIndex(r.sentiment_score);
      a.nociN += 1;
    }

    const out = [...bySrc.entries()]
      .map(([source, v]) => ({
        source,
        sephora: v.sephN ? Math.round(v.sephSum / v.sephN) : 0,
        nocibe: v.nociN ? Math.round(v.nociSum / v.nociN) : 0,
        sephoraCount: v.sephN,
        nocibeCount: v.nociN,
      }))
      .sort((a, b) => Math.min(a.sephora, a.nocibe) - Math.min(b.sephora, b.nocibe));

    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getTopNegativeVerbatims(
  range: DateRange,
  limit: number,
  marque: Marque = "Sephora",
): Promise<Result<MentionRow[]>> {
  try {
    const rows = await fetchSignals(range, { brand: marqueToBrand(marque) });
    const neg = rows
      .filter((r) => r.sentiment === "negative" || r.sentiment_score < 0)
      .sort((a, b) => a.sentiment_score - b.sentiment_score)
      .slice(0, limit);
    return { ok: true, data: neg.map(signalToMentionRow) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

function normalizeAxis(value: number | null, min: number, max: number): number {
  if (value == null || max <= min) return 50;
  return Math.round(Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)));
}

/**
 * Agrégation multi-métriques puis normalisation 0–100 pour radar (calcul client ; RPC possible côté SQL).
 */
export async function getCompetitorRadarMetrics(range: DateRange): Promise<Result<CompetitorRadarMetrics>> {
  try {
    const comp = await getCompetitorComparison(range);
    if (!comp.ok) throw new Error(comp.error);
    const { sephora: s, nocibe: n } = comp.data;
    const rows = await fetchSignals(range);
    const volSep = s.mentionVolume;
    const volNoc = n.mentionVolume;
    const maxVol = Math.max(volSep, volNoc, 1);

    const avgThemeScore = (brand: SignalBrand, theme: ThemeToken) => {
      const sub = rows.filter((r) => r.brand === brand && r.themes.includes(theme));
      if (!sub.length) return null;
      return sub.reduce((a, r) => a + sentimentScoreToIndex(r.sentiment_score), 0) / sub.length;
    };

    const prixS = avgThemeScore("sephora", "prix");
    const prixN = avgThemeScore("nocibe", "prix");
    const fidS = avgThemeScore("sephora", "fidélité");
    const fidN = avgThemeScore("nocibe", "fidélité");

    const axes: RadarAxisKey[] = ["sentiment", "volume", "livraison", "sav", "prix", "fidelite"];
    const rawSep: Record<RadarAxisKey, number | null> = {
      sentiment: s.sentimentIndex,
      volume: (volSep / maxVol) * 100,
      livraison: s.livraisonSentimentIndex,
      sav: s.savSentimentIndex,
      prix: prixS,
      fidelite: fidS,
    };
    const rawNoc: Record<RadarAxisKey, number | null> = {
      sentiment: n.sentimentIndex,
      volume: (volNoc / maxVol) * 100,
      livraison: n.livraisonSentimentIndex,
      sav: n.savSentimentIndex,
      prix: prixN,
      fidelite: fidN,
    };

    const mins = Object.fromEntries(axes.map((k) => [k, 0])) as Record<RadarAxisKey, number>;
    const maxs = Object.fromEntries(axes.map((k) => [k, 100])) as Record<RadarAxisKey, number>;

    const sephora = Object.fromEntries(
      axes.map((k) => [k, normalizeAxis(rawSep[k], mins[k], maxs[k])]),
    ) as CompetitorRadarMetrics["sephora"];
    const nocibe = Object.fromEntries(
      axes.map((k) => [k, normalizeAxis(rawNoc[k], mins[k], maxs[k])]),
    ) as CompetitorRadarMetrics["nocibe"];

    return { ok: true, data: { sephora, nocibe } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/**
 * Heatmap : volume par thème × semaine + sentiment moyen (explosion themes).
 */
export async function getThemeWeekHeatmap(range: DateRange, marque: Marque): Promise<Result<HeatmapCellData[]>> {
  try {
    const rows = await fetchSignals(range, { brand: marqueToBrand(marque) });
    const exploded = explodeThemes(rows);
    const key = (theme: string, week: string) => `${theme}__${week}`;
    const agg = new Map<string, { count: number; sumScore: number }>();
    for (const r of exploded) {
      const wk = weekKey(new Date(r.date));
      const k = key(r.theme, wk);
      const a = agg.get(k) ?? { count: 0, sumScore: 0 };
      a.count += 1;
      a.sumScore += r.sentiment_score;
      agg.set(k, a);
    }
    let maxCount = 1;
    for (const v of agg.values()) maxCount = Math.max(maxCount, v.count);
    const out: HeatmapCellData[] = [...agg.entries()].map(([k, v]) => {
      const [theme, weekStart] = k.split("__") as [string, string];
      return {
        weekStart,
        theme,
        count: v.count,
        avgSentimentScore: Math.round((v.sumScore / v.count) * 1000) / 1000,
        intensity: v.count / maxCount,
      };
    });
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getAlertVelocityWeekly(
  range: DateRange,
): Promise<Result<{ weekStart: string; count: number }[]>> {
  try {
    const rows = await fetchSignals(range);
    const alerts = rows.filter((r) => isAlertSignal(r));
    const byWeek = new Map<string, number>();
    for (const r of alerts) {
      const wk = weekKey(new Date(r.date));
      byWeek.set(wk, (byWeek.get(wk) ?? 0) + 1);
    }
    const out = [...byWeek.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, count]) => ({ weekStart, count }));
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getWeakSignalsScatter(range: DateRange): Promise<Result<WeakSignalPoint[]>> {
  try {
    const rows = await fetchSignals(range, { brand: "sephora" });
    const exploded = explodeThemes(rows);
    const byThemeWeek = new Map<string, { count: number; sumScore: number }>();
    for (const r of exploded) {
      const wk = weekKey(new Date(r.date));
      const k = `${r.theme}__${wk}`;
      const a = byThemeWeek.get(k) ?? { count: 0, sumScore: 0 };
      a.count += 1;
      a.sumScore += r.sentiment_score;
      byThemeWeek.set(k, a);
    }

    const weeks = [...new Set([...byThemeWeek.keys()].map((k) => k.split("__")[1]))].sort();
    if (weeks.length < 3) return { ok: true, data: [] };

    const wLast = weeks[weeks.length - 1]!;
    const wPrev = weeks[weeks.length - 2]!;
    const wPrev2 = weeks[weeks.length - 3]!;

    const themeSet = new Set(exploded.map((r) => r.theme));
    const out: WeakSignalPoint[] = [];

    for (const theme of themeSet) {
      const getVol = (w: string) => byThemeWeek.get(`${theme}__${w}`)?.count ?? 0;
      const getAvg = (w: string) => {
        const a = byThemeWeek.get(`${theme}__${w}`);
        return a && a.count ? a.sumScore / a.count : 0;
      };

      const v1 = getVol(wLast);
      const v0 = getVol(wPrev);
      const vPrev2 = getVol(wPrev2);
      const volGrowth =
        vPrev2 > 0 ? ((v0 + v1) / 2 / vPrev2 - 1) * 100 : v1 + v0 > 0 ? 50 : 0;
      const sentDelta = getAvg(wLast) - getAvg(wPrev2);
      if (volGrowth > 20 && sentDelta < -0.15) {
        out.push({ theme, volumeGrowth: Math.round(volGrowth * 10) / 10, sentimentDelta: Math.round(sentDelta * 1000) / 1000 });
      }
    }

    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getAlertTableRows(range: DateRange): Promise<Result<AlertTableRow[]>> {
  try {
    const rows = await fetchSignals(range);
    const alerts = rows
      .filter((r) => isAlertSignal(r))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((r) => {
        const theme = r.themes[0] ?? "—";
        return {
          id: r.id,
          date: r.date,
          source: displaySignalSource(r.source),
          theme,
          summary: r.summary_fr ?? r.raw_text.slice(0, 140),
          score: r.sentiment_score,
          status: (r.resolved ? "resolved" : "active") as "active" | "resolved",
          raw_text: r.raw_text,
        } satisfies AlertTableRow;
      });
    return { ok: true, data: alerts };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getActiveAlertsCount24h(): Promise<Result<number>> {
  try {
    const now = new Date();
    const range: DateRange = { from: subDays(now, 1), to: now };
    const rows = await fetchSignals(range);
    return { ok: true, data: rows.filter((r) => isAlertSignal(r) && !r.resolved).length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getTimelinePeaks(range: DateRange): Promise<Result<TimelinePeak[]>> {
  try {
    const rows = await fetchSignals(range);
    const byWeekBrand = new Map<string, { n: number; themes: string[] }>();
    for (const r of rows) {
      const wk = weekKey(new Date(r.date));
      const k = `${wk}__${r.brand}`;
      const a = byWeekBrand.get(k) ?? { n: 0, themes: [] as string[] };
      a.n += 1;
      a.themes.push(...r.themes);
      byWeekBrand.set(k, a);
    }
    const peaks: TimelinePeak[] = [];
    for (const [key, v] of byWeekBrand.entries()) {
      const [weekStart, brand] = key.split("__") as [string, SignalBrand];
      const counts = new Map<string, number>();
      for (const t of v.themes) counts.set(t, (counts.get(t) ?? 0) + 1);
      const dom = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      peaks.push({
        weekStart,
        brand: brandToMarque(brand),
        volume: v.n,
        dominantTheme: dom,
      });
    }
    peaks.sort((a, b) => b.volume - a.volume);
    return { ok: true, data: peaks.slice(0, 40) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getNegativeVerbatimTexts(range: DateRange, marque: Marque): Promise<Result<string[]>> {
  try {
    const rows = await fetchSignals(range, { brand: marqueToBrand(marque) });
    const texts = rows.filter((r) => r.sentiment === "negative").map((r) => r.raw_text);
    return { ok: true, data: texts };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getLastSignalsForInsight(limit: number): Promise<Result<SignalRow[]>> {
  try {
    const range = defaultDateRangeLast6Months();
    const rows = await fetchSignals(range, { brand: "sephora" });
    const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
    return { ok: true, data: sorted };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function markAlertResolved(id: string): Promise<Result<boolean>> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("signals").update({ resolved: true }).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true, data: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/**
 * Requête : même filtre que les verbatims — agrégations cohérentes sur toute la page Expérience.
 * Supabase cible : mêmes clauses .eq / .in / .contains / plage date que getVerbatims, sans pagination.
 */
export async function fetchFilteredSignalsForExperience(filters: VerbatimFilters): Promise<SignalRow[]> {
  const base = defaultDateRangeLast6Months();
  const range: DateRange = {
    from: startOfDay(filters.from ?? base.from),
    to: endOfDay(filters.to ?? base.to),
  };
  let rows = await fetchSignals(range, {
    brand: marqueToBrand(filters.marque ?? "Sephora"),
    sentiment: filters.sentiment ? sentimentUiToDb(filters.sentiment) : undefined,
    sources: filters.sources?.length ? filters.sources : undefined,
  });
  if (filters.source) {
    const slug = REVERSE_SOURCE.get(filters.source);
    if (slug) rows = rows.filter((m) => m.source === slug);
  }
  if (filters.theme?.trim()) {
    const th = filters.theme.trim();
    rows = rows.filter((m) => signalMatchesTheme(m, th));
  }
  return rows;
}

export async function getSentimentDistributionFiltered(
  filters: VerbatimFilters,
): Promise<Result<Record<Sentiment, number>>> {
  try {
    const rows = await fetchFilteredSignalsForExperience(filters);
    const out: Record<Sentiment, number> = { positif: 0, neutre: 0, négatif: 0 };
    for (const m of rows) out[sentimentDbToUi(m.sentiment)] += 1;
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getTopThemesFiltered(filters: VerbatimFilters, limit = 10): Promise<Result<ThemeCount[]>> {
  try {
    const rows = await fetchFilteredSignalsForExperience(filters);
    const counts = new Map<string, { count: number; sumScore: number }>();
    for (const m of explodeThemes(rows)) {
      const t = m.theme;
      const agg = counts.get(t) ?? { count: 0, sumScore: 0 };
      agg.count += 1;
      agg.sumScore += m.sentiment_score;
      counts.set(t, agg);
    }
    const out: ThemeCount[] = [...counts.entries()]
      .map(([theme, v]) => ({
        theme,
        count: v.count,
        avgSentimentScore: Math.round((v.sumScore / v.count) * 1000) / 1000,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getNegativeWordFrequencies(
  filters: VerbatimFilters,
  topN = 40,
): Promise<Result<{ word: string; count: number }[]>> {
  try {
    const rows = await fetchFilteredSignalsForExperience(filters);
    const STOP = new Set([
      "les",
      "des",
      "une",
      "pour",
      "dans",
      "est",
      "pas",
      "que",
      "plus",
      "sur",
      "avec",
      "très",
      "mais",
      "du",
      "de",
      "la",
      "le",
      "un",
      "et",
      "à",
      "au",
      "en",
      "ce",
      "se",
      "qui",
      "par",
      "son",
      "sa",
      "mes",
      "mon",
    ]);
    const freq = new Map<string, number>();
    for (const r of rows) {
      if (r.sentiment !== "negative") continue;
      const words = r.raw_text
        .toLowerCase()
        .replace(/[^a-zàâäéèêëïîôùûç'\s]/gi, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP.has(w));
      for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
    }
    const out = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, count]) => ({ word, count }));
    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export function buildStaticInsightFallback(): AIInsightPayload {
  return {
    insight:
      "Sephora maintient son leadership sur le sentiment grâce à l’accueil en magasin ; surveiller les pics négatifs sur la livraison lors des semaines à forte charge.",
    recommendations: [
      "Renforcer la communication proactive sur les délais dès J+2.",
      "Prioriser le SAV sur les thèmes livraison et stock.",
      "Capitaliser sur les retours positifs magasin dans les campagnes CRM.",
    ],
    updatedAt: new Date().toISOString(),
  };
}
