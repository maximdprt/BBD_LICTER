"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageSquare, PieChart, Smile, TrendingUp } from "lucide-react";

import { ChartCard } from "@/components/charts/ChartCard";
import { SentimentLineChart } from "@/components/charts/SentimentLineChart";
import { SourceDonutChart } from "@/components/charts/SourceDonutChart";
import { KPICard } from "@/components/ui/KPICard";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { getAlertFlags } from "@/lib/queries";
import { cn } from "@/lib/cn";
import {
  useDefaultDateRange,
  useMentionVolume,
  useSentimentIndex,
  useSentimentOverTime,
  useTopThemesInsight,
  useVoiceShareByPlatform,
  useWeeklyTrend,
  useWeeklyVolume,
} from "@/hooks/useMetrics";
import { WeeklyTrend as WeeklyTrendChart } from "@/components/sections/WeeklyTrend";
import { ThemeAnalysis } from "@/components/sections/ThemeAnalysis";

export default function DashboardPage() {
  const range = useDefaultDateRange();
  const prefersReducedMotion = useReducedMotion();

  const sephoraSent = useSentimentIndex("Sephora", range);
  const sephoraVolume = useMentionVolume("Sephora", range);
  const voice = useVoiceShareByPlatform(range);
  const trend = useWeeklyTrend("Sephora");
  const overTime = useSentimentOverTime(range);
  const weeklyVolumeSephora = useWeeklyVolume("Sephora", range);
  const weeklyVolumeNocibe = useWeeklyVolume("Nocibé", range);
  const themes = useTopThemesInsight("Sephora", range);

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
      : Math.round((voiceTotals.sephora / (voiceTotals.sephora + voiceTotals.nocibe)) * 100);

  const alertFlags = getAlertFlags({
    sentimentScore: sephoraSent.data?.score ?? null,
    volumeDeltaPct: sephoraVolume.data?.deltaPct ?? null,
  });

  const deltaFromSeries = (values: Array<number | null | undefined>) => {
    const cleaned = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    const last = cleaned.at(-1);
    const prev = cleaned.at(-2);
    if (last == null || prev == null) return null;
    if (prev === 0) return null;
    return ((last - prev) / Math.abs(prev)) * 100;
  };

  const sentimentSpark = (overTime.data ?? [])
    .slice(-7)
    .map((p) => ({ value: p.sephora ?? 0 }));
  const sentimentTrendValue = deltaFromSeries((overTime.data ?? []).slice(-7).map((p) => p.sephora));

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

  const trendSpark = (() => {
    const pts = weeklyVolumeSephora.data ?? [];
    const last = pts.slice(-7);
    return last.map((p) => ({ value: p.value }));
  })();

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

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <motion.div variants={itemVariants} style={{ willChange: "transform" }}>
          <KPICard
            title="Indice de Sentiment"
            value={sephoraSent.data?.score ?? null}
            trendValue={sentimentTrendValue}
            icon={<Smile className="size-5" />}
            sparkline={sentimentSpark}
            isLoading={!sephoraSent.data && !sephoraSent.error}
          />
        </motion.div>

        <motion.div variants={itemVariants} style={{ willChange: "transform" }}>
          <KPICard
            title="Volume"
            value={sephoraVolume.data?.total ?? null}
            trendValue={sephoraVolume.data?.deltaPct ?? null}
            icon={<MessageSquare className="size-5" />}
            sparkline={volumeSpark}
            isLoading={!sephoraVolume.data && !sephoraVolume.error}
          />
        </motion.div>

        <motion.div variants={itemVariants} style={{ willChange: "transform" }}>
          <KPICard
            title="Part de voix"
            value={voiceSharePct}
            valueSuffix="%"
            trendValue={voiceShareTrendValue}
            icon={<PieChart className="size-5" />}
            sparkline={voiceShareSpark}
            isLoading={!voice.data && !voice.error}
          />
        </motion.div>

        <motion.div variants={itemVariants} style={{ willChange: "transform" }}>
          <KPICard
            title="Tendance"
            value={trend.data?.deltaPct == null ? null : Math.round(trend.data.deltaPct * 10) / 10}
            valueSuffix="%"
            trend={trend.data?.direction ?? null}
            trendValue={trend.data?.deltaPct ?? null}
            icon={<TrendingUp className="size-5" />}
            sparkline={trendSpark}
            isLoading={!trend.data && !trend.error}
          />
        </motion.div>
      </motion.div>

      <div className="mt-6 space-y-4">
        {alertFlags.sentimentLow ? (
          <AlertBanner
            tone="danger"
            title="Alerte — Sentiment bas"
            description="L’indice de sentiment Sephora est passé sous 40. Vérifier les verbatims négatifs et les thèmes émergents."
          />
        ) : null}
        {alertFlags.volumeSpike ? (
          <AlertBanner
            tone="warning"
            title="Signal — Spike de volume"
            description="Le volume de mentions a fortement augmenté sur la période récente. Contrôler l’origine (plateformes + thèmes)."
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
          <SentimentLineChart data={overTime.data ?? []} />
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

      {(sephoraSent.error || sephoraVolume.error || voice.error || overTime.error) && (
        <div
          className={cn(
            "relative mt-6 overflow-hidden rounded-sm border-[0.5px] border-[#FF00ED]/30 bg-white p-4 text-sm text-black",
          )}
        >
          <div className="absolute inset-x-0 top-0 h-[2px] sephora-stripes" />
          Impossible de charger certaines données depuis Supabase. Vérifie la table `mentions`, les droits RLS, et les variables d’environnement.
        </div>
      )}
    </div>
  );
}

