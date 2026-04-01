"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChartCard } from "@/components/charts/ChartCard";
import { SentimentGauge } from "@/components/charts/SentimentGauge";
import { ThemeHeatmap } from "@/components/charts/ThemeHeatmap";
import { SentimentBySourceBars } from "@/components/charts/SentimentBySourceBars";
import { SentimentBadge } from "@/components/ui/SentimentBadge";
import {
  useDefaultDateRange,
  useSentimentBySourceSephora,
  useSentimentIndex,
  useThemeWeekHeatmap,
  useTopNegativeVerbatims,
} from "@/hooks/useMetrics";
import type { MentionRow } from "@/lib/types";
import { subDays } from "date-fns";

export default function ReputationPage() {
  const range = useDefaultDateRange();
  const sentiment = useSentimentIndex("Sephora", range);
  const nocibe = useSentimentIndex("Nocibé", range);
  const heatmap = useThemeWeekHeatmap(range, "Sephora");
  const bySource = useSentimentBySourceSephora(range);
  const [verbatimPeriod, setVerbatimPeriod] = useState<"week" | "month" | "all">("week");
  const [modal, setModal] = useState<MentionRow | null>(null);

  const verbatimRange = useMemo(() => {
    const to = new Date();
    if (verbatimPeriod === "week") return { from: subDays(to, 7), to };
    if (verbatimPeriod === "month") return { from: subDays(to, 30), to };
    return range;
  }, [verbatimPeriod, range]);

  const topNeg = useTopNegativeVerbatims(verbatimRange, 5, "Sephora");

  return (
    <div id="reputation-top" className="mx-auto w-full max-w-[1400px] scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4"
      >
        <ChartCard
          title="Indice de sentiment — Sephora"
          subtitle="Score 0 à 100"
          isLoading={!sentiment.data && !sentiment.error}
        >
          <div className="flex justify-center py-2">
            <SentimentGauge
              value={sentiment.data?.score ?? null}
              competitorValue={nocibe.data?.score ?? null}
              size={280}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Heatmap thèmes × semaines"
          subtitle="Volume relatif — survol pour détail"
          isLoading={!heatmap.data && !heatmap.error}
        >
          <ThemeHeatmap cells={heatmap.data ?? []} />
        </ChartCard>

        <ChartCard
          title="Sentiment par source"
          subtitle="Sephora — indice moyen par plateforme"
          isLoading={!bySource.data && !bySource.error}
        >
          <SentimentBySourceBars data={bySource.data ?? []} />
        </ChartCard>

        <ChartCard
          title="Top verbatims négatifs"
          subtitle="Les plus bas scores — cliquer pour le texte complet"
          isLoading={!topNeg.data && !topNeg.error}
        >
          <div className="mb-3 flex gap-2">
            {(["week", "month", "all"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setVerbatimPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  verbatimPeriod === p ? "bg-[var(--comex-bordeaux)] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {p === "week" ? "Cette semaine" : p === "month" ? "Ce mois" : "Tout (6m)"}
              </button>
            ))}
          </div>
          {!topNeg.data?.length ? (
            <p className="text-sm text-gray-500">Pas de verbatims pour cette période.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--comex-border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Thème</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Extrait</th>
                  </tr>
                </thead>
                <tbody>
                  {topNeg.data.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-t border-gray-100 hover:bg-pink-50/50"
                      onClick={() => setModal(r)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                        {new Date(r.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-3 py-2">{r.source}</td>
                      <td className="px-3 py-2 capitalize">{r.theme}</td>
                      <td className="px-3 py-2 font-mono text-red-600">
                        {r.sentiment_score?.toFixed(2) ?? "—"}
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2 italic text-gray-600">{r.texte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </motion.div>

      <AnimatePresence>
        {modal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="max-h-[80vh] max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-xl"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-wrap items-center gap-2">
                <SentimentBadge sentiment={modal.sentiment} />
                <span className="text-xs text-gray-500">{modal.source}</span>
                <span className="font-mono text-xs text-gray-600">{modal.sentiment_score?.toFixed(2)}</span>
              </div>
              <p className="mt-4 text-sm italic leading-relaxed text-gray-800">{modal.texte}</p>
              <button
                type="button"
                className="mt-6 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                onClick={() => setModal(null)}
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
