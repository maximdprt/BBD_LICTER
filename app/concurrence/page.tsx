"use client";

import { motion } from "framer-motion";
import { ChartCard } from "@/components/charts/ChartCard";
import { CompetitorRadarChart } from "@/components/charts/CompetitorRadarChart";
import { VoiceShareBarChart } from "@/components/charts/VoiceShareBarChart";
import { CompetitorMatrix } from "@/components/sections/CompetitorMatrix";
import { CompetitorTimeline } from "@/components/charts/CompetitorTimeline";
import {
  useCompetitorComparison,
  useCompetitorRadarMetrics,
  useDefaultDateRange,
  useTimelinePeaks,
  useVoiceShareByPlatform,
} from "@/hooks/useMetrics";

export default function ConcurrencePage() {
  const range = useDefaultDateRange();
  const voice = useVoiceShareByPlatform(range);
  const comparison = useCompetitorComparison(range);
  const radar = useCompetitorRadarMetrics(range);
  const peaks = useTimelinePeaks(range);

  const voiceDomination = (() => {
    const rows = voice.data ?? [];
    let n = 0;
    for (const p of rows) {
      const t = p.sephora + p.nocibe;
      if (t > 0 && p.sephora >= p.nocibe) n += 1;
    }
    return { n, total: rows.length };
  })();

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4"
      >
        {/* Matrice en premier — composant le plus décisionnel */}
        <ChartCard
          title="Matrice concurrentielle"
          subtitle="Synthèse des KPIs clés — Sephora vs Nocibé"
          isLoading={!comparison.data && !comparison.error}
        >
          <CompetitorMatrix data={comparison.data ?? null} isLoading={!comparison.data && !comparison.error} />
        </ChartCard>

        {/* Radar + Part de voix côte à côte */}
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard
            title="Radar concurrentiel"
            subtitle="5 axes normalisés 0–100 (volume exclu)"
            isLoading={!radar.data && !radar.error}
          >
            <CompetitorRadarChart data={radar.data ?? null} isLoading={!radar.data && !radar.error} />
          </ChartCard>

          <ChartCard
            title="Part de voix par plateforme"
            subtitle="Comparatif Sephora vs Nocibé"
            isLoading={!voice.data && !voice.error}
          >
            {voiceDomination.total > 0 ? (
              <p className="mb-2 text-center text-sm font-semibold" style={{ color: "var(--comex-text)" }}>
                Sephora domine sur {voiceDomination.n}/{voiceDomination.total} plateformes
              </p>
            ) : null}
            <VoiceShareBarChart data={voice.data ?? []} />
          </ChartCard>
        </div>

        {/* Timeline des pics */}
        <ChartCard
          title="Timeline des pics de volume"
          subtitle="6 mois — quand chaque marque a surperformé"
          isLoading={!peaks.data && !peaks.error}
        >
          <CompetitorTimeline peaks={peaks.data ?? []} />
        </ChartCard>
      </motion.div>
    </div>
  );
}
