import {
  addMonths,
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  AlertItem,
  CompetitorComparison,
  DateRange,
  Marque,
  MentionRow,
  MentionVolume,
  Result,
  Sentiment,
  SentimentIndex,
  Source,
  ThemeCount,
  ThemeInsight,
  VerbatimFilters,
  VoiceSharePoint,
  WeeklySentimentPoint,
  WeeklyPoint,
  WeeklyTrend,
} from "@/lib/types";

const SENTIMENT_WEIGHT: Record<Sentiment, number> = {
  positif: 1,
  neutre: 0.5,
  négatif: 0,
};

export function defaultDateRangeLast6Months(now = new Date()): DateRange {
  const to = endOfDay(now);
  const from = startOfDay(addMonths(now, -6));
  return { from, to };
}

function iso(d: Date): string {
  return d.toISOString();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function weekKey(d: Date): string {
  return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

type MentionWhere = Readonly<{
  marque?: Marque;
  sentiment?: Sentiment;
}>;

async function fetchMentions(
  range: DateRange,
  columns = "id,date,source,texte,note,sentiment,theme,marque,pays,langue",
  where?: MentionWhere,
) {
  const supabase = getSupabaseClient();
  let q = supabase.from("mentions").select(columns).gte("date", iso(range.from)).lte("date", iso(range.to));
  if (where?.marque) q = q.eq("marque", where.marque);
  if (where?.sentiment) q = q.eq("sentiment", where.sentiment);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as MentionRow[];
}

async function countMentions(range: DateRange, where?: MentionWhere) {
  const supabase = getSupabaseClient();
  let q = supabase
    .from("mentions")
    .select("id", { count: "exact", head: true })
    .gte("date", iso(range.from))
    .lte("date", iso(range.to));
  if (where?.marque) q = q.eq("marque", where.marque);
  if (where?.sentiment) q = q.eq("sentiment", where.sentiment);

  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getSentimentOverTime(
  range: DateRange,
): Promise<Result<WeeklySentimentPoint[]>> {
  try {
    const mentions = await fetchMentions(range);
    const byWeek = new Map<
      string,
      { sephoraSum: number; sephoraCount: number; nocibeSum: number; nocibeCount: number }
    >();

    for (const m of mentions) {
      const wk = weekKey(new Date(m.date));
      const agg =
        byWeek.get(wk) ??
        { sephoraSum: 0, sephoraCount: 0, nocibeSum: 0, nocibeCount: 0 };

      const score = SENTIMENT_WEIGHT[m.sentiment] * (clamp(m.note ?? 3, 1, 5) / 5);
      if (m.marque === "Sephora") {
        agg.sephoraSum += score;
        agg.sephoraCount += 1;
      } else {
        agg.nocibeSum += score;
        agg.nocibeCount += 1;
      }
      byWeek.set(wk, agg);
    }

    const points = [...byWeek.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, agg]) => ({
        weekStart,
        sephora: agg.sephoraCount ? Math.round((agg.sephoraSum / agg.sephoraCount) * 100) : null,
        nocibe: agg.nocibeCount ? Math.round((agg.nocibeSum / agg.nocibeCount) * 100) : null,
      }));

    return { ok: true, data: points };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getVoiceShareByPlatform(
  range: DateRange,
): Promise<Result<VoiceSharePoint[]>> {
  try {
    const mentions = await fetchMentions(range, "source,marque,date");
    const sources: Source[] = ["Twitter/X", "Instagram", "TikTok", "LinkedIn"];
    const counts = new Map<string, number>();

    for (const m of mentions) {
      const key = `${m.source}__${m.marque}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const out: VoiceSharePoint[] = sources.map((source) => ({
      source,
      sephora: counts.get(`${source}__Sephora`) ?? 0,
      nocibe: counts.get(`${source}__Nocibé`) ?? 0,
    }));

    return { ok: true, data: out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getSentimentIndex(
  marque: Marque,
  range: DateRange,
): Promise<Result<SentimentIndex>> {
  try {
    const mentions = await fetchMentions(range, "sentiment,note,date,marque", { marque });
    if (!mentions.length) return { ok: true, data: { marque, score: null } };

    let sum = 0;
    for (const m of mentions) {
      sum += SENTIMENT_WEIGHT[m.sentiment] * (clamp(m.note ?? 3, 1, 5) / 5);
    }
    const score = Math.round((sum / mentions.length) * 100);
    return { ok: true, data: { marque, score } };
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
    const mentions = await fetchMentions(
      range,
      "theme,marque,sentiment,date",
      sentiment === "all" ? { marque } : { marque, sentiment },
    );

    const counts = new Map<string, number>();
    for (const m of mentions) {
      const t = (m.theme ?? "").trim();
      if (!t) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }

    const out = [...counts.entries()]
      .map(([theme, count]) => ({ theme, count }))
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
    const mentions = await fetchMentions(range, "theme,sentiment,date,marque", { marque });
    if (!mentions.length) return { ok: true, data: [] };

    const byTheme = new Map<string, { total: number; pos: number; neu: number; neg: number }>();
    for (const m of mentions) {
      const t = (m.theme ?? "").trim();
      if (!t) continue;
      const agg = byTheme.get(t) ?? { total: 0, pos: 0, neu: 0, neg: 0 };
      agg.total += 1;
      if (m.sentiment === "positif") agg.pos += 1;
      else if (m.sentiment === "neutre") agg.neu += 1;
      else agg.neg += 1;
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

export async function getWeeklyVolume(
  marque: Marque,
  range: DateRange,
): Promise<Result<WeeklyPoint[]>> {
  try {
    const mentions = await fetchMentions(range, "date,marque", { marque });

    const byWeek = new Map<string, number>();
    for (const m of mentions) {
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
    const mentions = await fetchMentions(range, "sentiment,marque,date", { marque });
    const out: Record<Sentiment, number> = { positif: 0, neutre: 0, négatif: 0 };
    for (const m of mentions) out[m.sentiment] += 1;
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

    const [negLast, negPrev] = await Promise.all([
      countMentions(last24h, { marque: marquePrimary, sentiment: "négatif" }),
      countMentions(prev24h, { marque: marquePrimary, sentiment: "négatif" }),
    ]);

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

    // Thème émergent (heuristique): top thème 24h > 10% du volume
    const mentions24h = await fetchMentions(last24h, "theme,date,marque", { marque: marquePrimary });
    if (mentions24h.length >= 30) {
      const counts = new Map<string, number>();
      for (const m of mentions24h) {
        const t = (m.theme ?? "").trim();
        if (!t) continue;
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      const top = sorted[0];
      if (top) {
        const share = top[1] / mentions24h.length;
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
      fetchMentions({ from: thisWeekStart, to: thisWeekEnd }, "id,date,marque", { marque }),
      fetchMentions({ from: prevWeekStart, to: prevWeekEnd }, "id,date,marque", { marque }),
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

export async function getMentionVolume(
  marque: Marque,
  range: DateRange,
): Promise<Result<MentionVolume>> {
  try {
    const current = await fetchMentions(range, "id,date,marque", { marque });
    const durationDays = Math.max(
      1,
      Math.round((range.to.getTime() - range.from.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const prevRange: DateRange = {
      from: subDays(range.from, durationDays),
      to: subDays(range.to, durationDays),
    };
    const previous = await fetchMentions(prevRange, "id,date,marque", { marque });

    const prev = previous.length;
    const curr = current.length;
    const deltaPct = prev === 0 ? (curr === 0 ? 0 : null) : ((curr - prev) / prev) * 100;

    return { ok: true, data: { marque, total: curr, deltaPct } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getVerbatims(
  filters: VerbatimFilters,
  page: number,
  pageSize: number,
): Promise<Result<{ rows: MentionRow[]; nextPage: number | null }>> {
  try {
    const supabase = getSupabaseClient();
    let q = supabase
      .from("mentions")
      .select("id,date,source,texte,note,sentiment,theme,marque,pays,langue")
      .order("date", { ascending: false });

    if (filters.marque) q = q.eq("marque", filters.marque);
    if (filters.source) q = q.eq("source", filters.source);
    if (filters.sentiment) q = q.eq("sentiment", filters.sentiment);
    if (filters.theme) q = q.eq("theme", filters.theme);
    if (filters.from) q = q.gte("date", iso(filters.from));
    if (filters.to) q = q.lte("date", iso(filters.to));

    const fromIdx = page * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    const { data, error } = await q.range(fromIdx, toIdx);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as MentionRow[];
    const nextPage = rows.length < pageSize ? null : page + 1;
    return { ok: true, data: { rows, nextPage } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

/** Avis à forte gravité (gravité = 6 - note, donc gravité > 4 ⇒ note === 1). */
export async function getHighSeverityMentions(
  range: DateRange,
  options?: { marque?: Marque; limit?: number },
): Promise<Result<MentionRow[]>> {
  try {
    const supabase = getSupabaseClient();
    const limit = Math.min(50, Math.max(1, options?.limit ?? 20));
    let q = supabase
      .from("mentions")
      .select("id,date,source,texte,note,sentiment,theme,marque,pays,langue")
      .gte("date", iso(range.from))
      .lte("date", iso(range.to))
      .eq("note", 1)
      .order("date", { ascending: false })
      .limit(limit);
    if (options?.marque) q = q.eq("marque", options.marque);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as MentionRow[];
    return { ok: true, data: rows };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function getCompetitorComparison(
  range: DateRange,
): Promise<Result<CompetitorComparison>> {
  try {
    const [sephoraIndex, nocibeIndex] = await Promise.all([
      getSentimentIndex("Sephora", range),
      getSentimentIndex("Nocibé", range),
    ]);
    if (!sephoraIndex.ok) throw new Error(sephoraIndex.error);
    if (!nocibeIndex.ok) throw new Error(nocibeIndex.error);

    const mentions = await fetchMentions(range, "marque,note,theme,sentiment,date");
    const seph = mentions.filter((m) => m.marque === "Sephora");
    const noci = mentions.filter((m) => m.marque === "Nocibé");

    const avgNote = (rows: MentionRow[]) => {
      if (!rows.length) return null;
      const sum = rows.reduce((acc, r) => acc + clamp(r.note ?? 3, 1, 5), 0);
      return Math.round((sum / rows.length) * 100) / 100;
    };

    const topTheme = (rows: MentionRow[], s: Sentiment) => {
      const counts = new Map<string, number>();
      for (const r of rows) {
        if (r.sentiment !== s) continue;
        const t = (r.theme ?? "").trim();
        if (!t) continue;
        counts.set(t, (counts.get(t) ?? 0) + 1);
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
          topThemePositif: topTheme(seph, "positif"),
          topThemeNegatif: topTheme(seph, "négatif"),
        },
        nocibe: {
          sentimentIndex: nocibeIndex.data.score,
          mentionVolume: noci.length,
          avgNote: avgNote(noci),
          topThemePositif: topTheme(noci, "positif"),
          topThemeNegatif: topTheme(noci, "négatif"),
        },
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export function getAlertFlags(params: {
  sentimentScore: number | null;
  volumeDeltaPct: number | null;
}) {
  const sentimentLow = params.sentimentScore !== null && params.sentimentScore < 40;
  const volumeSpike = params.volumeDeltaPct !== null && params.volumeDeltaPct > 50;
  return { sentimentLow, volumeSpike };
}

