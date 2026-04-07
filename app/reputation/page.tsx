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
  useSentimentBySourceComparison,
  useSentimentIndex,
  useSentimentSparkline30d,
  useSentimentTrend7d,
  useThemeWeekHeatmap,
  useTopNegativeVerbatims,
} from "@/hooks/useMetrics";
import type { MentionRow } from "@/lib/types";
import { subDays } from "date-fns";

export default function ReputationPage() {
  const range = useDefaultDateRange();
  const sentiment = useSentimentIndex("Sephora", range);
  const nocibe = useSentimentIndex("Nocibé", range);
  const sparkline30d = useSentimentSparkline30d("Sephora");
  const trend7d = useSentimentTrend7d("Sephora");
  const heatmap = useThemeWeekHeatmap(range, "Sephora");
  const bySource = useSentimentBySourceComparison(range);
  const [verbatimPeriod, setVerbatimPeriod] = useState<"week" | "month" | "all">("week");
  const [modal, setModal] = useState<MentionRow | null>(null);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const verbatimRange = useMemo(() => {
    const to = new Date();
    if (verbatimPeriod === "week") return { from: subDays(to, 7), to };
    if (verbatimPeriod === "month") return { from: subDays(to, 30), to };
    return range;
  }, [verbatimPeriod, range]);

  const topNeg = useTopNegativeVerbatims(verbatimRange, 47, "Sephora");
  const pagedRows = (topNeg.data ?? []).slice(page * 10, page * 10 + 10);

  const urgency = (score?: number) => {
    if (score == null) return { label: "—", cls: "bg-gray-100 text-gray-600" };
    if (score < -0.5) return { label: "Critique", cls: "bg-red-50 text-red-700 border border-red-200" };
    if (score < -0.3) return { label: "Élevé", cls: "bg-amber-50 text-amber-700 border border-amber-200" };
    return { label: "Modéré", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" };
  };

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
              sparkline={sparkline30d.data ?? undefined}
              trend7d={trend7d.data ?? undefined}
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
          subtitle="Sephora vs Nocibé — indice moyen par plateforme (0–100)"
          isLoading={!bySource.data && !bySource.error}
        >
          <SentimentBySourceBars data={bySource.data ?? []} mode="comparison" />
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
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  verbatimPeriod === p
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p === "week" ? "Cette semaine" : p === "month" ? "Ce mois" : "Tout (6m)"}
              </button>
            ))}
          </div>
          {!topNeg.data?.length ? (
            <p className="text-sm text-gray-500">Pas de verbatims pour cette période.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Source</th>
                    <th className="px-3 py-2.5">Thème</th>
                    <th className="px-3 py-2.5">Urgence</th>
                    <th className="px-3 py-2.5">Score</th>
                    <th className="px-3 py-2.5">Extrait</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-t border-gray-50 transition-colors hover:bg-[#C9A96E]/[0.03]"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">
                        {new Date(r.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-3 py-2.5">{r.source}</td>
                      <td className="px-3 py-2.5 capitalize">{r.theme}</td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${urgency(r.sentiment_score).cls}`}>
                          {urgency(r.sentiment_score).label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-red-600">
                        {r.sentiment_score?.toFixed(2) ?? "—"}
                      </td>
                      <td className="max-w-[320px] px-3 py-2.5 text-gray-600">
                        <button
                          type="button"
                          className="text-left hover:underline"
                          onClick={() => setExpanded((prev) => {
                            const next = new Set(prev);
                            if (next.has(r.id)) next.delete(r.id); else next.add(r.id);
                            return next;
                          })}
                        >
                          {expanded.has(r.id) ? r.texte : `${(r.texte ?? "").slice(0, 120)}...`}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          className="rounded-lg bg-black px-2.5 py-1 text-xs font-semibold text-white transition-all hover:bg-gray-800"
                          onClick={() => setModal(r)}
                        >
                          Détail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              Affichage {Math.min((topNeg.data?.length ?? 0), page * 10 + 1)}-
              {Math.min((topNeg.data?.length ?? 0), (page + 1) * 10)} sur {topNeg.data?.length ?? 0}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs transition-all hover:bg-gray-50 disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={(page + 1) * 10 >= (topNeg.data?.length ?? 0)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs transition-all hover:bg-gray-50 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </ChartCard>
      </motion.div>

      <AnimatePresence>
        {modal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="max-h-[80vh] max-w-lg overflow-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-wrap items-center gap-2">
                <SentimentBadge sentiment={modal.sentiment} />
                <span className="text-xs text-gray-500">{modal.source}</span>
                <span className="font-mono text-xs text-gray-600">{modal.sentiment_score?.toFixed(2)}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-800">{modal.texte}</p>
              <button
                type="button"
                className="mt-6 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800"
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
