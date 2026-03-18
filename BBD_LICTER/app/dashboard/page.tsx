"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Gauge, MessageSquareText, PieChart } from "lucide-react";

import { ChartCard } from "@/components/charts/ChartCard";
import { SentimentGauge } from "@/components/charts/SentimentGauge";
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
  useVoiceShareByPlatform,
  useWeeklyTrend,
  useWeeklyVolume,
} from "@/hooks/useMetrics";
import { WeeklyTrend as WeeklyTrendChart } from "@/components/sections/WeeklyTrend";

export default function DashboardPage() {
  const range = useDefaultDateRange();

  const sephoraSent = useSentimentIndex("Sephora", range);
  const sephoraVolume = useMentionVolume("Sephora", range);
  const voice = useVoiceShareByPlatform(range);
  const trend = useWeeklyTrend("Sephora");
  const overTime = useSentimentOverTime(range);
  const weeklyVolume = useWeeklyVolume("Sephora", range);

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

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <KPICard
          title="Indice de Sentiment — Sephora"
          value={sephoraSent.data?.score ?? null}
          icon={<Gauge className="size-5" />}
          isLoading={!sephoraSent.data && !sephoraSent.error}
        >
          <div className="flex items-center justify-center">
            <SentimentGauge value={sephoraSent.data?.score ?? null} size={170} />
          </div>
        </KPICard>

        <KPICard
          title="Volume de mentions (6 mois)"
          value={sephoraVolume.data?.total ?? null}
          deltaPct={sephoraVolume.data?.deltaPct ?? null}
          icon={<MessageSquareText className="size-5" />}
          isLoading={!sephoraVolume.data && !sephoraVolume.error}
        />

        <KPICard
          title="Part de voix (Sephora vs Nocibé)"
          value={voiceSharePct}
          valueSuffix="%"
          icon={<PieChart className="size-5" />}
          isLoading={!voice.data && !voice.error}
        />

        <KPICard
          title="Tendance semaine vs semaine"
          value={trend.data?.deltaPct == null ? null : Math.round(trend.data.deltaPct * 10) / 10}
          valueSuffix="%"
          icon={
            trend.data?.direction === "down" ? (
              <ArrowDownRight className="size-5" />
            ) : (
              <ArrowUpRight className="size-5" />
            )
          }
          isLoading={!trend.data && !trend.error}
        />
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
          className="xl:col-span-2"
          title="Tendance semaine par semaine"
          subtitle="Volume Sephora — agrégé par semaine"
          isLoading={!weeklyVolume.data && !weeklyVolume.error}
        >
          <WeeklyTrendChart data={weeklyVolume.data ?? []} />
        </ChartCard>
      </div>

      {(sephoraSent.error || sephoraVolume.error || voice.error || overTime.error) && (
        <div className={cn("mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900")}>
          Impossible de charger certaines données depuis Supabase. Vérifie la table `mentions`, les droits RLS, et les variables d’environnement.
        </div>
      )}
    </div>
  );
}

