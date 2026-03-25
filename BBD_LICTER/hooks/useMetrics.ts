import useSWR from "swr";
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
  ThemeCount,
  ThemeInsight,
  VerbatimFilters,
  VoiceSharePoint,
  WeeklySentimentPoint,
  WeeklyPoint,
  WeeklyTrend,
} from "@/lib/types";
import {
  defaultDateRangeLast6Months,
  getAlertsSnapshot,
  getCompetitorComparison,
  getMentionVolume,
  getSentimentIndex,
  getSentimentDistribution,
  getSentimentOverTime,
  getTopThemes,
  getTopThemesInsight,
  getVerbatims,
  getVoiceShareByPlatform,
  getWeeklyVolume,
  getWeeklyTrend,
  getHighSeverityMentions,
} from "@/lib/queries";

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(r.error);
  return r.data;
}

export function useDefaultDateRange() {
  // Stable for the session; pages can later add a proper date picker.
  return defaultDateRangeLast6Months();
}

export function useSentimentOverTime(range: DateRange) {
  return useSWR<WeeklySentimentPoint[]>(
    ["sentimentOverTime", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getSentimentOverTime(range)),
  );
}

export function useVoiceShareByPlatform(range: DateRange) {
  return useSWR<VoiceSharePoint[]>(
    ["voiceShareByPlatform", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getVoiceShareByPlatform(range)),
  );
}

export function useSentimentIndex(marque: Marque, range: DateRange) {
  return useSWR<SentimentIndex>(
    ["sentimentIndex", marque, range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getSentimentIndex(marque, range)),
  );
}

export function useMentionVolume(marque: Marque, range: DateRange) {
  return useSWR<MentionVolume>(
    ["mentionVolume", marque, range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getMentionVolume(marque, range)),
  );
}

export function useWeeklyTrend(marque: Marque) {
  return useSWR<WeeklyTrend>(["weeklyTrend", marque], async () =>
    unwrap(await getWeeklyTrend(marque)),
  );
}

export function useTopThemes(
  marque: Marque,
  sentiment: Sentiment | "all",
  range: DateRange,
) {
  return useSWR<ThemeCount[]>(
    ["topThemes", marque, sentiment, range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getTopThemes(marque, sentiment, range)),
  );
}

export function useTopThemesInsight(marque: Marque, range: DateRange) {
  return useSWR<ThemeInsight[]>(
    ["topThemesInsight", marque, range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getTopThemesInsight(marque, range, 5)),
  );
}

export function useWeeklyVolume(marque: Marque, range: DateRange) {
  return useSWR<WeeklyPoint[]>(
    ["weeklyVolume", marque, range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getWeeklyVolume(marque, range)),
  );
}

export function useSentimentDistribution(marque: Marque, range: DateRange) {
  return useSWR<Record<Sentiment, number>>(
    ["sentimentDistribution", marque, range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getSentimentDistribution(marque, range)),
  );
}

export function useAlertsSnapshot() {
  return useSWR<AlertItem[]>(["alertsSnapshot"], async () =>
    unwrap(await getAlertsSnapshot()),
  );
}

export function useVerbatims(filters: VerbatimFilters, page: number, pageSize: number) {
  return useSWR<{ rows: MentionRow[]; nextPage: number | null }>(
    [
      "verbatims",
      filters.marque ?? null,
      filters.source ?? null,
      filters.sentiment ?? null,
      filters.theme ?? null,
      filters.from?.toISOString() ?? null,
      filters.to?.toISOString() ?? null,
      page,
      pageSize,
    ],
    async () => unwrap(await getVerbatims(filters, page, pageSize)),
  );
}

export function useLiveAlerts(range: DateRange, options?: { marque?: Marque; limit?: number }) {
  return useSWR<MentionRow[]>(
    ["liveAlerts", range.from.toISOString(), range.to.toISOString(), options?.marque ?? null, options?.limit ?? 20],
    async () => unwrap(await getHighSeverityMentions(range, options)),
  );
}

export function useCompetitorComparison(range: DateRange) {
  return useSWR<CompetitorComparison>(
    ["competitorComparison", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getCompetitorComparison(range)),
  );
}

