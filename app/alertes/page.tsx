"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSWRConfig } from "swr";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ChartCard } from "@/components/charts/ChartCard";
import { VerbatimFeed } from "@/components/sections/VerbatimFeed";
import {
  useActiveAlertsCount24h,
  useAlertTableRows,
  useDefaultDateRange,
  useMentionVolume,
  useSentimentIndex,
  useVerbatims,
  useWeakSignalsScatter,
} from "@/hooks/useMetrics";
import { useRealtimeMentions } from "@/hooks/useRealtime";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function AlertesPage() {
  useRealtimeMentions({ enabled: true });
  const { mutate } = useSWRConfig();
  const range = useDefaultDateRange();
  const sephoraSent = useSentimentIndex("Sephora", range);
  const nocibeSent = useSentimentIndex("Nocibé", range);
  const sephoraVolume = useMentionVolume("Sephora", range);
  const activeCount = useActiveAlertsCount24h();
  const rows = useAlertTableRows(range);
  const weak = useWeakSignalsScatter(range);
  const [checked, setChecked] = useState(() => new Date().toISOString());
  const [resolvedLocally, setResolvedLocally] = useState<Set<string>>(() => new Set());

  const feedFilters = useMemo(() => {
    const to = new Date();
    const from = subDays(to, 7);
    return { from, to };
  }, []);
  const feed = useVerbatims(feedFilters, 0, 10);

  const competitorOvertake =
    sephoraSent.data?.score != null &&
    nocibeSent.data?.score != null &&
    nocibeSent.data.score > sephoraSent.data.score;

  const resolve = async (id: string) => {
    await fetch("/api/alerts/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setResolvedLocally((prev) => new Set(prev).add(id));
    void mutate((k) => Array.isArray(k) && k[0] === "alertTableRows");
    void mutate((k) => Array.isArray(k) && k[0] === "activeAlertsCount24h");
  };

  const displayRows = useMemo(() => {
    const base = rows.data ?? [];
    return base.map((r) =>
      resolvedLocally.has(r.id) ? { ...r, status: "resolved" as const } : r,
    );
  }, [rows.data, resolvedLocally]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--comex-border)] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${(activeCount.data ?? 0) > 0 ? "animate-pulse bg-red-100 text-red-700" : "bg-green-100 text-green-800"}`}
            >
              {(activeCount.data ?? 0) > 0
                ? `${activeCount.data} alertes actives`
                : "0 alerte active"}
            </span>
            <span className="text-xs text-gray-500">
              Dernière vérification : {new Date(checked).toLocaleString("fr-FR")}
            </span>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-[var(--comex-bordeaux)] hover:underline"
            onClick={() => setChecked(new Date().toISOString())}
          >
            Actualiser
          </button>
        </div>

        <ChartCard title="Tableau des alertes" subtitle="Tri par date — plus récent en premier" isLoading={!rows.data && !rows.error}>
          {!displayRows.length ? (
            <p className="text-sm text-gray-500">Aucune alerte sur la période.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b text-[11px] uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="py-2 pr-2">Date</th>
                    <th className="py-2 pr-2">Source</th>
                    <th className="py-2 pr-2">Thème</th>
                    <th className="py-2 pr-2">Résumé</th>
                    <th className="py-2 pr-2">Score</th>
                    <th className="py-2 pr-2">Statut</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...displayRows]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((r) => {
                      const critical = r.score < -0.7;
                      const vigil = r.score >= -0.7 && r.score < -0.5;
                      return (
                        <tr
                          key={r.id}
                          className={`border-t ${critical ? "bg-red-50/80" : vigil ? "bg-amber-50/60" : ""}`}
                        >
                          <td className="py-2 pr-2 whitespace-nowrap text-gray-600">
                            {format(new Date(r.date), "d MMM yyyy", { locale: fr })}
                          </td>
                          <td className="py-2 pr-2">{r.source}</td>
                          <td className="py-2 pr-2 capitalize">{r.theme}</td>
                          <td className="max-w-[220px] truncate py-2 pr-2">{r.summary}</td>
                          <td className="py-2 pr-2 font-mono">{r.score.toFixed(2)}</td>
                          <td className="py-2 pr-2">{r.status === "resolved" ? "Traité" : "Actif"}</td>
                          <td className="py-2">
                            {r.status === "resolved" ? null : (
                              <button
                                type="button"
                                className="rounded-lg bg-gray-900 px-2 py-1 text-xs font-medium text-white"
                                onClick={() => void resolve(r.id)}
                              >
                                Marquer traité
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Carte des signaux faibles" subtitle="Volume ↑ et sentiment ↓ (danger en bas à droite)" isLoading={!weak.data && !weak.error}>
          {!weak.data?.length ? (
            <p className="text-sm text-gray-500">Aucun signal faible détecté sur les règles définies.</p>
          ) : (
            <div className="h-[300px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="volumeGrowth" name="Croissance volume %" tick={{ fontSize: 10 }} />
                  <YAxis type="number" dataKey="sentimentDelta" name="Δ sentiment" tick={{ fontSize: 10 }} />
                  <ZAxis range={[80, 80]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter name="Thèmes" data={weak.data} fill="var(--comex-bordeaux)">
                    {/* labels via custom shape would be heavy; list below */}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <ul className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                {weak.data.map((p) => (
                  <li key={p.theme} className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">
                    {p.theme}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>

        {competitorOvertake ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Alerte — Nocibé surperforme en sentiment sur la période analysée.
          </div>
        ) : null}

        <ChartCard
          title="Realtime feed"
          subtitle="Signaux récents — 7 derniers jours"
          isLoading={!feed.data && !feed.error}
        >
          <VerbatimFeed rows={feed.data?.rows ?? []} isLoading={!feed.data && !feed.error} />
        </ChartCard>
      </motion.div>
    </div>
  );
}
