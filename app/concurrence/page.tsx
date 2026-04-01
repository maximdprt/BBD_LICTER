"use client";

import { motion } from "framer-motion";
import { ChartCard } from "@/components/charts/ChartCard";
import { CompetitorRadarChart } from "@/components/charts/CompetitorRadarChart";
import { SentimentLineChart } from "@/components/charts/SentimentLineChart";
import { VoiceShareBarChart } from "@/components/charts/VoiceShareBarChart";
import { CompetitorMatrix } from "@/components/sections/CompetitorMatrix";
import { CompetitorTimeline } from "@/components/charts/CompetitorTimeline";
import {
  useAlertWeekMarkers,
  useCompetitorComparison,
  useCompetitorRadarMetrics,
  useDefaultDateRange,
  useSentimentOverTime,
  useTimelinePeaks,
  useVoiceShareByPlatform,
} from "@/hooks/useMetrics";

function buildInsight(params: {
  sephoraSent: number | null;
  nocibeSent: number | null;
  sephoraVol: number;
  nocibeVol: number;
}) {
  const lines: string[] = [];
  if (params.sephoraSent != null && params.nocibeSent != null) {
    if (params.sephoraSent > params.nocibeSent) lines.push("Sephora surperforme Nocibé en sentiment.");
    else if (params.nocibeSent > params.sephoraSent) lines.push("Nocibé surperforme Sephora en sentiment.");
    else lines.push("Sephora et Nocibé sont au coude-à-coude en sentiment.");
  }
  if (params.sephoraVol !== params.nocibeVol) {
    lines.push(params.sephoraVol > params.nocibeVol ? "Sephora domine le volume de signaux." : "Nocibé génère plus de signaux.");
  }
  return lines.length ? lines.join(" ") : "Insight indisponible (données insuffisantes).";
}

export default function ConcurrencePage() {
  const range = useDefaultDateRange();
  const voice = useVoiceShareByPlatform(range);
  const comparison = useCompetitorComparison(range);
  const overTime = useSentimentOverTime(range);
  const radar = useCompetitorRadarMetrics(range);
  const peaks = useTimelinePeaks(range);
  const alertWeeks = useAlertWeekMarkers(range, "Sephora");

  const voiceDomination = (() => {
    const rows = voice.data ?? [];
    let n = 0;
    for (const p of rows) {
      const t = p.sephora + p.nocibe;
      if (t > 0 && p.sephora >= p.nocibe) n += 1;
    }
    return { n, total: rows.length };
  })();

  const insight = buildInsight({
    sephoraSent: comparison.data?.sephora.sentimentIndex ?? null,
    nocibeSent: comparison.data?.nocibe.sentimentIndex ?? null,
    sephoraVol: comparison.data?.sephora.mentionVolume ?? 0,
    nocibeVol: comparison.data?.nocibe.mentionVolume ?? 0,
  });

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4"
      >
        <ChartCard
          title="Part de voix par plateforme"
          subtitle="Comparatif Sephora vs Nocibé"
          isLoading={!voice.data && !voice.error}
        >
          {voiceDomination.total > 0 ? (
            <p className="mb-2 text-center text-sm font-semibold text-[var(--comex-text)]">
              Sephora domine sur {voiceDomination.n}/{voiceDomination.total} plateformes
            </p>
          ) : null}
          <VoiceShareBarChart data={voice.data ?? []} />
        </ChartCard>

        <ChartCard
          title="Radar concurrentiel"
          subtitle="6 axes normalisés 0–100 — impact jury"
          isLoading={!radar.data && !radar.error}
        >
          <CompetitorRadarChart data={radar.data ?? null} isLoading={!radar.data && !radar.error} />
        </ChartCard>

        <ChartCard
          title="Matrice concurrentielle"
          subtitle="Synthèse des KPIs clés"
          isLoading={!comparison.data && !comparison.error}
        >
          <CompetitorMatrix data={comparison.data ?? null} isLoading={!comparison.data && !comparison.error} />
        </ChartCard>

        <ChartCard
          title="Timeline des pics de volume"
          subtitle="6 mois — quand chaque marque a surperformé"
          isLoading={!peaks.data && !peaks.error}
        >
          <CompetitorTimeline peaks={peaks.data ?? []} />
        </ChartCard>

        <ChartCard
          title="Sentiment croisé (6 mois)"
          subtitle="Évolution hebdomadaire"
          isLoading={!overTime.data && !overTime.error}
        >
          <SentimentLineChart data={overTime.data ?? []} alertWeeks={alertWeeks.data ?? []} />
        </ChartCard>

        <div className="rounded-2xl border border-[var(--comex-border)] bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Insight (automatique)</div>
          <div className="mt-2 text-sm leading-relaxed text-gray-700">{insight}</div>
        </div>
      </motion.div>
    </div>
  );
}
