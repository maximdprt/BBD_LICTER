"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { MessageSquare, PieChart, Smile, TrendingUp } from "lucide-react";
import { AIInsightPanel } from "@/components/dashboard/AIInsightPanel";

import { ChartCard } from "@/components/charts/ChartCard";
import { SentimentLineChart } from "@/components/charts/SentimentLineChart";
import { SourceDonutChart } from "@/components/charts/SourceDonutChart";
import { VoiceShareHalfGauge } from "@/components/charts/VoiceShareHalfGauge";
import { KPICard, type SentimentHealthZone } from "@/components/ui/KPICard";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { getAlertFlags } from "@/lib/queries";
import { cn } from "@/lib/cn";
import {
  useAlertWeekMarkers,
  useCriticalAlerts24h,
  useDefaultDateRange,
  useMentionVolume,
  useSentimentIndex,
  useSentimentOverTime,
  useSentimentSparkline30d,
  useSentimentTrend7d,
  useTopThemesInsight,
  useVoiceShareByPlatform,
  useWeeklyVolume,
} from "@/hooks/useMetrics";
import { useRealtimeMentions } from "@/hooks/useRealtime";
import { WeeklyTrend as WeeklyTrendChart } from "@/components/sections/WeeklyTrend";
import { ThemeAnalysis } from "@/components/sections/ThemeAnalysis";

function sentimentHealthFromScore(score: number | null): SentimentHealthZone | null {
  if (score == null) return null;
  if (score < 40) return "critical";
  if (score < 60) return "moderate";
  return "excellent";
}

export default function DashboardPage() {
  useRealtimeMentions({ enabled: true });
  const range = useDefaultDateRange();
  const prefersReducedMotion = useReducedMotion();

  const sephoraSent = useSentimentIndex("Sephora", range);
  const sephoraVolume = useMentionVolume("Sephora", range);
  const voice = useVoiceShareByPlatform(range);
  const sentimentTrend7d = useSentimentTrend7d("Sephora");
  const spark30 = useSentimentSparkline30d("Sephora");
  const overTime = useSentimentOverTime(range);
  const weeklyVolumeSephora = useWeeklyVolume("Sephora", range);
  const weeklyVolumeNocibe = useWeeklyVolume("Nocibé", range);
  const themes = useTopThemesInsight("Sephora", range);
  const critical24 = useCriticalAlerts24h();
  const alertWeeks = useAlertWeekMarkers(range, "Sephora");

  const voiceTotals = (voice.data ?? []).reduce(
    (acc, p) => ({
      sephora: acc.sephora + p.sephora,
      nocibe: acc.nocibe + p.nocibe,
    }),
    { sephora: 0, nocibe: 0 },
  );
  const voiceSharePct =
    voiceTotals.sephora + voiceTotals.nocibe === 0
      ? null
      : Math.round((voiceTotals.sephora / (voiceTotals.sephora + voiceTotals.nocibe)) * 1000) / 10;

  const alertFlags = getAlertFlags({
    sentimentScore: sephoraSent.data?.score ?? null,
    volumeDeltaPct: sephoraVolume.data?.deltaPct ?? null,
  });

  const volumeSpark = (weeklyVolumeSephora.data ?? []).slice(-7).map((p) => ({ value: p.value }));

  const voiceShareSpark = (() => {
    const a = weeklyVolumeSephora.data ?? [];
    const b = weeklyVolumeNocibe.data ?? [];
    const byWeek = new Map<string, { seph?: number; noci?: number }>();
    for (const p of a) byWeek.set(p.weekStart, { ...(byWeek.get(p.weekStart) ?? {}), seph: p.value });
    for (const p of b) byWeek.set(p.weekStart, { ...(byWeek.get(p.weekStart) ?? {}), noci: p.value });
    return [...byWeek.entries()]
      .sort(([wa], [wb]) => wa.localeCompare(wb))
      .slice(-7)
      .map(([, v]) => {
        const seph = v.seph ?? 0;
        const noci = v.noci ?? 0;
        const denom = seph + noci;
        return { value: denom === 0 ? 0 : (seph / denom) * 100 };
      });
  })();
  const voiceShareTrendValue =
    voiceShareSpark.length >= 2 ? voiceShareSpark.at(-1)!.value - voiceShareSpark.at(-2)!.value : null;

  const trendSentimentSpark = (overTime.data ?? [])
    .slice(-7)
    .map((p) => ({ value: p.sephora ?? 0 }));

  const d7 = sentimentTrend7d.data?.deltaPoints;

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.09,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const crit = critical24.data;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {crit && crit.count > 0 ? (
        <Link
          href="/alertes"
          className={cn(
            "mb-4 block rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900 transition-colors hover:bg-red-100",
            "animate-pulse",
          )}
        >
          <span className="mr-1">⚠</span> ALERTE ACTIVE — {crit.count} signaux critiques détectés. Thème :{" "}
          <span className="font-semibold">{crit.dominantTheme}</span>. Source :{" "}
          <span className="font-semibold">{crit.dominantSource}</span>. → Voir les alertes
        </Link>
      ) : null}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {/* KPI 1 — Indice de sentiment */}
        <motion.div variants={itemVariants} style={{ willChange: "transform" }} className="h-full">
          <KPICard
            title="Indice de Sentiment"
            value={sephoraSent.data?.score != null ? Math.round(sephoraSent.data.score * 10) / 10 : null}
            decimals={1}
            trendValue={d7 != null ? Math.round(d7 * 10) / 10 : null}
            trendUnit="points"
            trend={sentimentTrend7d.data?.direction ?? null}
            periodLabel="6 derniers mois · Sephora"
            icon={<Smile className="size-5" />}
            sparkline={spark30.data ?? []}
            sentimentHealth={sentimentHealthFromScore(sephoraSent.data?.score ?? null)}
            isLoading={
              (!sephoraSent.data && !sephoraSent.error) ||
              (!spark30.data && !spark30.error) ||
              (!sentimentTrend7d.data && !sentimentTrend7d.error)
            }
            className="h-full"
          />
        </motion.div>

        {/* KPI 2 — Volume de signaux */}
        <motion.div variants={itemVariants} style={{ willChange: "transform" }} className="h-full">
          <KPICard
            title="Volume de signaux"
            value={sephoraVolume.data?.total ?? null}
            decimals={0}
            trendValue={
              sephoraVolume.data?.deltaPct != null
                ? Math.round(sephoraVolume.data.deltaPct * 10) / 10
                : null
            }
            trendUnit="percent"
            trendLabelOverride={
              sephoraVolume.data?.deltaPct != null && Math.abs(sephoraVolume.data.deltaPct) < 0.5
                ? "Stable vs période préc."
                : undefined
            }
            periodLabel="6 derniers mois · Sephora"
            icon={<MessageSquare className="size-5" />}
            sparkline={volumeSpark}
            sparkColor="#6366f1"
            isLoading={!sephoraVolume.data && !sephoraVolume.error}
            className="h-full"
          />
        </motion.div>

        {/* KPI 3 — Part de voix */}
        <motion.div variants={itemVariants} style={{ willChange: "transform" }} className="h-full">
          <KPICard
            title="Part de voix vs Nocibé"
            value={voiceSharePct}
            decimals={1}
            valueSuffix="%"
            trendValue={voiceShareTrendValue != null ? Math.round(voiceShareTrendValue * 10) / 10 : null}
            trendUnit="points"
            trendLabelOverride={
              voiceShareTrendValue != null && Math.abs(voiceShareTrendValue) < 0.5
                ? "Stable"
                : undefined
            }
            periodLabel="6 derniers mois · vs Nocibé"
            icon={<PieChart className="size-5" />}
            sparkline={voiceShareSpark}
            sparkColor="#C9A96E"
            isLoading={!voice.data && !voice.error}
            className="h-full"
          >
            <VoiceShareHalfGauge value={voiceSharePct} />
          </KPICard>
        </motion.div>

        {/* KPI 4 — Tendance 7j */}
        <motion.div variants={itemVariants} style={{ willChange: "transform" }} className="h-full">
          <KPICard
            title="Tendance sentiment (7j)"
            value={d7 != null ? Math.round(d7 * 10) / 10 : null}
            decimals={1}
            valueSuffix=" pts"
            trend={sentimentTrend7d.data?.direction ?? null}
            trendValue={d7 != null ? Math.round(d7 * 10) / 10 : null}
            trendUnit="points"
            trendLabelOverride={
              d7 == null ? null
              : Math.abs(d7) < 0.5 ? "Stable — sans variation significative"
              : d7 > 0 ? `Hausse · +${(Math.round(d7 * 10) / 10).toFixed(1)} pts`
              : `Baisse · ${(Math.round(d7 * 10) / 10).toFixed(1)} pts`
            }
            periodLabel="Glissement 7 jours · Sephora"
            icon={<TrendingUp className="size-5" />}
            sparkline={trendSentimentSpark}
            sparkColor={
              (sentimentTrend7d.data?.direction ?? "flat") === "up"
                ? "#22c55e"
                : (sentimentTrend7d.data?.direction ?? "flat") === "down"
                ? "#ef4444"
                : "#9ca3af"
            }
            isLoading={!sentimentTrend7d.data && !sentimentTrend7d.error}
            className="h-full"
          />
        </motion.div>
      </motion.div>

      <div className="mt-6 space-y-4">
        {alertFlags.sentimentLow ? (
          <AlertBanner
            tone="danger"
            title="Alerte — Sentiment bas"
            description="L'indice de sentiment Sephora est passé sous 40. Vérifier les verbatims négatifs et les thèmes émergents."
          />
        ) : null}
        {alertFlags.volumeSpike ? (
          <AlertBanner
            tone="warning"
            title="Signal — Spike de volume"
            description="Le volume de signaux a fortement augmenté sur la période récente. Contrôler l'origine (plateformes + thèmes)."
          />
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-3"
          title="Évolution du sentiment (6 mois)"
          subtitle="Sephora vs Nocibé — score 0 à 100"
          isLoading={!overTime.data && !overTime.error}
        >
          <SentimentLineChart data={overTime.data ?? []} alertWeeks={alertWeeks.data ?? []} />
        </ChartCard>

        <ChartCard
          className="xl:col-span-1"
          title="Répartition par plateforme"
          subtitle="Sephora — part relative"
          isLoading={!voice.data && !voice.error}
        >
          <SourceDonutChart data={voice.data ?? []} marque="Sephora" />
        </ChartCard>

        <ChartCard
          className="xl:col-span-1"
          title="Analyse Thématique"
          subtitle="Top 5 thèmes — volume & sentiment dominant"
          isLoading={!themes.data && !themes.error}
        >
          <ThemeAnalysis data={themes.data ?? []} />
        </ChartCard>

        <ChartCard
          className="xl:col-span-1"
          title="Tendance semaine par semaine"
          subtitle="Volume Sephora — agrégé par semaine"
          isLoading={!weeklyVolumeSephora.data && !weeklyVolumeSephora.error}
        >
          <WeeklyTrendChart data={weeklyVolumeSephora.data ?? []} />
        </ChartCard>
      </div>

      <AIInsightPanel />

      {(sephoraSent.error || sephoraVolume.error || voice.error || overTime.error) && (
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="absolute inset-x-0 top-0 h-0.5 gold-accent" />
          Impossible de charger certaines données depuis Supabase. Vérifie la table `signals`, les droits RLS, et les
          variables d&apos;environnement.
        </div>
      )}
    </div>
  );
}
