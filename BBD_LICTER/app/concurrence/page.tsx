"use client";

import { motion } from "framer-motion";
import { ChartCard } from "@/components/charts/ChartCard";
import { SentimentLineChart } from "@/components/charts/SentimentLineChart";
import { VoiceShareBarChart } from "@/components/charts/VoiceShareBarChart";
import { CompetitorMatrix } from "@/components/sections/CompetitorMatrix";
import { useCompetitorComparison, useDefaultDateRange, useSentimentOverTime, useVoiceShareByPlatform } from "@/hooks/useMetrics";

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
    lines.push(params.sephoraVol > params.nocibeVol ? "Sephora domine le volume de mentions." : "Nocibé génère plus de mentions.");
  }
  return lines.length ? lines.join(" ") : "Insight indisponible (données insuffisantes).";
}

export default function ConcurrencePage() {
  const range = useDefaultDateRange();
  const voice = useVoiceShareByPlatform(range);
  const comparison = useCompetitorComparison(range);
  const overTime = useSentimentOverTime(range);

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
          <VoiceShareBarChart data={voice.data ?? []} />
        </ChartCard>

        <ChartCard
          title="Matrice concurrentielle"
          subtitle="Synthèse des KPIs clés"
          isLoading={!comparison.data && !comparison.error}
        >
          <CompetitorMatrix data={comparison.data ?? null} isLoading={!comparison.data && !comparison.error} />
        </ChartCard>

        <ChartCard
          title="Sentiment croisé (6 mois)"
          subtitle="Évolution hebdomadaire"
          isLoading={!overTime.data && !overTime.error}
        >
          <SentimentLineChart data={overTime.data ?? []} />
        </ChartCard>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-foreground">Insight (automatique)</div>
          <div className="mt-2 text-sm leading-6 text-foreground/80">{insight}</div>
        </div>
      </motion.div>
    </div>
  );
}

