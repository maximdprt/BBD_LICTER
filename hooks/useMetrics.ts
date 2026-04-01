import { useMemo } from "react";
import useSWR from "swr";
import type {
  AlertItem,
  AlertTableRow,
  CompetitorComparison,
  CompetitorRadarMetrics,
  DateRange,
  HeatmapCellData,
  Marque,
  MentionRow,
  MentionVolume,
  Result,
  Sentiment,
  SentimentIndex,
  ThemeCount,
  ThemeInsight,
  TimelinePeak,
  VerbatimFilters,
  VoiceSharePoint,
  WeakSignalPoint,
  WeeklySentimentPoint,
  WeeklyPoint,
  WeeklyTrend,
} from "@/lib/types";
import {
  defaultDateRangeLast6Months,
  getActiveAlertsCount24h,
  getAlertTableRows,
  getAlertVelocityWeekly,
  getAlertWeekMarkers,
  getAlertsSnapshot,
  getCompetitorComparison,
  getCompetitorRadarMetrics,
  getCriticalAlerts24hSummary,
  getHighSeverityMentions,
  getMentionVolume,
  getNegativeWordFrequencies,
  getSentimentBySourceBoth,
  getSentimentBySourceSephora,
  getSentimentDistribution,
  getSentimentDistributionFiltered,
  getSentimentIndex,
  getSentimentOverTime,
  getSentimentSparkline30d,
  getSentimentTrend7dPoints,
  getThemeWeekHeatmap,
  getTimelinePeaks,
  getTopNegativeVerbatims,
  getTopThemes,
  getTopThemesFiltered,
  getTopThemesInsight,
  getVerbatims,
  getVoiceShareByPlatform,
  getWeakSignalsScatter,
  getWeeklyVolume,
  getWeeklyTrend,
} from "@/lib/queries";

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(r.error);
  return r.data;
}

export function useDefaultDateRange(): DateRange {
  // Une seule plage par montée du composant : évite des clés SWR / re-fetch en boucle.
  return useMemo(() => defaultDateRangeLast6Months(), []);
}

const refresh60s = { refreshInterval: 60_000 };

export function useSentimentOverTime(range: DateRange) {
  return useSWR<WeeklySentimentPoint[]>(
    ["sentimentOverTime", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getSentimentOverTime(range)),
    refresh60s,
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
      (filters.sources ?? []).join(","),
      filters.sentiment ?? null,
      filters.theme ?? null,
      filters.from?.toISOString() ?? null,
      filters.to?.toISOString() ?? null,
      page,
      pageSize,
    ],
    async () => unwrap(await getVerbatims(filters, page, pageSize)),
    refresh60s,
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
    refresh60s,
  );
}

export function useSentimentSparkline30d(marque: Marque) {
  return useSWR<{ value: number }[]>(
    ["sentimentSparkline30d", marque],
    async () => unwrap(await getSentimentSparkline30d(marque)),
    refresh60s,
  );
}

export function useSentimentTrend7d(marque: Marque) {
  return useSWR<{ deltaPoints: number | null; direction: "up" | "down" | "flat" }>(
    ["sentimentTrend7d", marque],
    async () => unwrap(await getSentimentTrend7dPoints(marque)),
    refresh60s,
  );
}

export function useCriticalAlerts24h() {
  return useSWR<{ count: number; dominantTheme: string; dominantSource: string } | null>(
    ["criticalAlerts24h"],
    async () => unwrap(await getCriticalAlerts24hSummary()),
    refresh60s,
  );
}

export function useAlertWeekMarkers(range: DateRange, marque: Marque) {
  return useSWR<string[]>(
    ["alertWeekMarkers", range.from.toISOString(), range.to.toISOString(), marque],
    async () => unwrap(await getAlertWeekMarkers(range, marque)),
  );
}

export function useThemeWeekHeatmap(range: DateRange, marque: Marque) {
  return useSWR<HeatmapCellData[]>(
    ["themeHeatmap", range.from.toISOString(), range.to.toISOString(), marque],
    async () => unwrap(await getThemeWeekHeatmap(range, marque)),
  );
}

export function useSentimentBySourceSephora(range: DateRange) {
  return useSWR<{ source: string; score: number; count: number }[]>(
    ["sentimentBySource", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getSentimentBySourceSephora(range)),
  );
}

export function useSentimentBySourceComparison(range: DateRange) {
  return useSWR<{ source: string; sephora: number; nocibe: number; sephoraCount: number; nocibeCount: number }[]>(
    ["sentimentBySourceBoth", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getSentimentBySourceBoth(range)),
  );
}

export function useTopNegativeVerbatims(range: DateRange, limit: number, marque: Marque) {
  return useSWR<MentionRow[]>(
    ["topNegativeVerbatims", range.from.toISOString(), range.to.toISOString(), limit, marque],
    async () => unwrap(await getTopNegativeVerbatims(range, limit, marque)),
  );
}

export function useCompetitorRadarMetrics(range: DateRange) {
  return useSWR<CompetitorRadarMetrics>(
    ["competitorRadar", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getCompetitorRadarMetrics(range)),
  );
}

export function useAlertVelocityWeekly(range: DateRange) {
  return useSWR<{ weekStart: string; count: number }[]>(
    ["alertVelocity", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getAlertVelocityWeekly(range)),
  );
}

export function useWeakSignalsScatter(range: DateRange) {
  return useSWR<WeakSignalPoint[]>(
    ["weakSignals", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getWeakSignalsScatter(range)),
  );
}

export function useAlertTableRows(range: DateRange) {
  return useSWR<AlertTableRow[]>(
    ["alertTableRows", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getAlertTableRows(range)),
    refresh60s,
  );
}

export function useActiveAlertsCount24h() {
  return useSWR<number>(
    ["activeAlertsCount24h"],
    async () => unwrap(await getActiveAlertsCount24h()),
    refresh60s,
  );
}

export function useTimelinePeaks(range: DateRange) {
  return useSWR<TimelinePeak[]>(
    ["timelinePeaks", range.from.toISOString(), range.to.toISOString()],
    async () => unwrap(await getTimelinePeaks(range)),
  );
}

function experienceFilterKey(f: VerbatimFilters) {
  return [
    f.marque ?? null,
    f.source ?? null,
    (f.sources ?? []).join(","),
    f.sentiment ?? null,
    f.theme ?? null,
    f.from?.toISOString() ?? null,
    f.to?.toISOString() ?? null,
  ] as const;
}

export function useSentimentDistributionFiltered(filters: VerbatimFilters) {
  return useSWR<Record<Sentiment, number>>(
    ["sentimentDistributionFiltered", ...experienceFilterKey(filters)],
    async () => unwrap(await getSentimentDistributionFiltered(filters)),
    refresh60s,
  );
}

export function useTopThemesFiltered(filters: VerbatimFilters) {
  return useSWR<ThemeCount[]>(
    ["topThemesFiltered", ...experienceFilterKey(filters)],
    async () => unwrap(await getTopThemesFiltered(filters, 10)),
    refresh60s,
  );
}

export function useNegativeWordFrequencies(filters: VerbatimFilters) {
  return useSWR<{ word: string; count: number }[]>(
    ["negativeWordFreq", ...experienceFilterKey(filters)],
    async () => unwrap(await getNegativeWordFrequencies(filters, 40)),
    refresh60s,
  );
}

