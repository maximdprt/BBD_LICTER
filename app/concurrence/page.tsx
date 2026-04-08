"use client";

import { motion } from "framer-motion";
import { ChartCard } from "@/components/charts/ChartCard";
import { CompetitorRadarChart } from "@/components/charts/CompetitorRadarChart";
import { VoiceShareBarChart } from "@/components/charts/VoiceShareBarChart";
import { CompetitorMatrix } from "@/components/sections/CompetitorMatrix";
import { CompetitorTimeline } from "@/components/charts/CompetitorTimeline";
import Image from "next/image";
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
        {/* Brand comparison header */}
        <div className="flex items-center justify-center gap-8 rounded-2xl border border-gray-100 bg-white py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/Couleur-logo-Sephora.jpg"
              alt="Sephora"
              width={160}
              height={52}
              priority
              style={{ height: 26, width: "auto" }}
            />
            <span className="text-lg font-bold text-black">SEPHORA</span>
          </div>
          <div className="text-xl font-bold text-gray-300">VS</div>
          <div className="flex items-center gap-3">
            <div className="grid size-7 place-items-center rounded-full" style={{ background: "#00A651" }}>
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="text-lg font-bold" style={{ color: "#00A651" }}>NOCIBÉ</span>
          </div>
        </div>

        <ChartCard
          title="Matrice concurrentielle"
          subtitle="Synthèse des KPIs clés — Sephora vs Nocibé"
          isLoading={!comparison.data && !comparison.error}
        >
          <CompetitorMatrix data={comparison.data ?? null} isLoading={!comparison.data && !comparison.error} />
        </ChartCard>

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
              <div className="mb-3 flex items-center justify-center gap-2">
                <div className="size-2 rounded-full bg-black" />
                <p className="text-center text-sm font-semibold text-gray-900">
                  Sephora domine sur {voiceDomination.n}/{voiceDomination.total} plateformes
                </p>
              </div>
            ) : null}
            <VoiceShareBarChart data={voice.data ?? []} />
          </ChartCard>
        </div>

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
