"use client";

import { motion } from "framer-motion";
import { ChartCard } from "@/components/charts/ChartCard";
import { SentimentGauge } from "@/components/charts/SentimentGauge";
import { ThemeHeatmap, type HeatmapCell } from "@/components/charts/ThemeHeatmap";
import { WordCloudBubbles } from "@/components/charts/WordCloudBubbles";
import { useDefaultDateRange, useSentimentIndex, useSentimentOverTime, useTopThemes } from "@/hooks/useMetrics";

export default function ReputationPage() {
  const range = useDefaultDateRange();
  const sentiment = useSentimentIndex("Sephora", range);
  const overTime = useSentimentOverTime(range);
  const themes = useTopThemes("Sephora", "all", range);

  const weeks = (overTime.data ?? []).map((p) => p.weekStart);
  const themeNames = (themes.data ?? []).map((t) => t.theme);

  // Placeholder heatmap data (valeurs 0) — l'agrégation fine par thème/semaine sera enrichie si besoin.
  const heatmapData: HeatmapCell[] = weeks.length && themeNames.length
    ? themeNames.flatMap((theme) => weeks.map((weekStart) => ({ theme, weekStart, value: 0 })))
    : [];

  const bubbles =
    (themes.data ?? []).map((t) => ({ label: t.theme, value: t.count, tone: "neutre" as const }));

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4"
      >
        <ChartCard
          title="Indice de sentiment — Sephora"
          subtitle="Score 0 à 100 (animé au chargement)"
          isLoading={!sentiment.data && !sentiment.error}
        >
          <div className="flex justify-center py-2">
            <SentimentGauge value={sentiment.data?.score ?? null} size={260} />
          </div>
        </ChartCard>

        <ChartCard
          title="Heatmap thèmes × semaines"
          subtitle="Répartition relative (placeholder si données insuffisantes)"
          isLoading={!themes.data && !themes.error}
        >
          {weeks.length === 0 || themeNames.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-secondary">
              Pas assez de données pour générer la heatmap.
            </div>
          ) : (
            <ThemeHeatmap data={heatmapData} weeks={weeks} themes={themeNames} />
          )}
        </ChartCard>

        <ChartCard
          title="Bulles thématiques"
          subtitle="Taille = volume (top 10)"
          isLoading={!themes.data && !themes.error}
        >
          {bubbles.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-secondary">
              Aucun thème détecté sur la période.
            </div>
          ) : (
            <WordCloudBubbles items={bubbles} />
          )}
        </ChartCard>
      </motion.div>
    </div>
  );
}

