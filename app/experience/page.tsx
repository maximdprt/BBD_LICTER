"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import { ChartCard } from "@/components/charts/ChartCard";
import { VerbatimFeed } from "@/components/sections/VerbatimFeed";
import {
  useDefaultDateRange,
  useNegativeWordFrequencies,
  useSentimentDistributionFiltered,
  useTopThemesFiltered,
  useVerbatims,
} from "@/hooks/useMetrics";
import type { Sentiment, SignalSource, ThemeToken, VerbatimFilters } from "@/lib/types";

const SENT_COLORS: Record<Sentiment, string> = {
  positif: "#22c55e",
  neutre: "#9ca3af",
  "négatif": "#ef4444",
};

const PLATFORMS: { slug: SignalSource; label: string }[] = [
  { slug: "trustpilot", label: "Trustpilot" },
  { slug: "google", label: "Google" },
  { slug: "tiktok", label: "TikTok" },
  { slug: "instagram", label: "Instagram" },
  { slug: "linkedin", label: "LinkedIn" },
  { slug: "reddit", label: "Reddit" },
];

const THEME_PRESETS: ThemeToken[] = [
  "livraison", "stock", "magasin", "fidélité", "SAV",
  "service", "application", "produits", "conseil", "prix",
];

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ExperiencePage() {
  const defaultRange = useDefaultDateRange();
  const [sources, setSources] = useState<SignalSource[]>([]);
  const [sentiment, setSentiment] = useState<Sentiment | "all">("all");
  const [theme, setTheme] = useState<string>("");
  const [fromStr, setFromStr] = useState(() => toInputDate(defaultRange.from));
  const [toStr, setToStr] = useState(() => toInputDate(defaultRange.to));
  const [page, setPage] = useState(0);

  const filters: VerbatimFilters = useMemo(() => {
    const from = new Date(fromStr + "T00:00:00");
    const to = new Date(toStr + "T23:59:59");
    return {
      marque: "Sephora",
      sources: sources.length ? sources : undefined,
      sentiment: sentiment === "all" ? undefined : sentiment,
      theme: theme.trim() ? theme.trim() : undefined,
      from,
      to,
    };
  }, [fromStr, toStr, sentiment, sources, theme]);

  const dist = useSentimentDistributionFiltered(filters);
  const themes = useTopThemesFiltered(filters);
  const words = useNegativeWordFrequencies(filters);
  const verbatims = useVerbatims(filters, page, 12);

  const pieData = useMemo(() => {
    const d = dist.data ?? { positif: 0, neutre: 0, "négatif": 0 };
    const rows = (Object.keys(d) as Sentiment[]).map((k) => ({ name: k, value: d[k] }));
    const total = rows.reduce((a, r) => a + r.value, 0);
    return { rows, total };
  }, [dist.data]);

  const dominant = useMemo(() => {
    if (!pieData.total) return null;
    const sorted = [...pieData.rows].sort((a, b) => b.value - a.value);
    const top = sorted[0];
    if (!top || top.value === 0) return null;
    const pct = Math.round((top.value / pieData.total) * 100);
    return { name: top.name, pct };
  }, [pieData]);

  const toggleSource = (slug: SignalSource) => {
    setSources((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    setPage(0);
  };

  const resetFilters = () => {
    setSources([]);
    setSentiment("all");
    setTheme("");
    setFromStr(toInputDate(defaultRange.from));
    setToStr(toInputDate(defaultRange.to));
    setPage(0);
  };

  const maxCount = themes.data?.[0]?.count ?? 1;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4"
      >
        {/* Filters */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm font-semibold text-gray-900">Filtres</div>
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50"
            >
              Reset filtres
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="text-xs text-gray-500">
              Du
              <input
                type="date"
                className="ml-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-[#C9A96E] focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/20"
                value={fromStr}
                onChange={(e) => { setFromStr(e.target.value); setPage(0); }}
              />
            </label>
            <label className="text-xs text-gray-500">
              au
              <input
                type="date"
                className="ml-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-[#C9A96E] focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/20"
                value={toStr}
                onChange={(e) => { setToStr(e.target.value); setPage(0); }}
              />
            </label>
            <select
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none"
              value={sentiment}
              onChange={(e) => { setSentiment(e.target.value as Sentiment | "all"); setPage(0); }}
            >
              <option value="all">Sentiment : tous</option>
              <option value="positif">positif</option>
              <option value="neutre">neutre</option>
              <option value="négatif">négatif</option>
            </select>
            <select
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#C9A96E] focus:outline-none"
              value={theme}
              onChange={(e) => { setTheme(e.target.value); setPage(0); }}
            >
              <option value="">Thème : tous</option>
              {THEME_PRESETS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Plateformes</div>
            <div className="mt-2 flex flex-wrap gap-3">
              {PLATFORMS.map(({ slug, label }) => (
                <label key={slug} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={sources.includes(slug)}
                    onChange={() => toggleSource(slug)}
                    className="rounded border-gray-300 text-black focus:ring-[#C9A96E]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard
            title="Répartition des sentiments"
            subtitle="Sephora — filtres appliqués"
            isLoading={!dist.data && !dist.error}
          >
            {pieData.total === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-gray-500">
                Pas de données pour cette période
              </div>
            ) : (
              <div className="relative h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={80}>
                  <PieChart>
                    <Tooltip />
                    <Pie
                      data={pieData.rows}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={108}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {pieData.rows.map((p) => (
                        <Cell key={p.name} fill={SENT_COLORS[p.name as Sentiment]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {dominant ? (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold tabular-nums text-gray-900">{dominant.pct}%</div>
                    <div className="text-xs font-medium capitalize text-gray-500">{dominant.name}</div>
                  </div>
                ) : null}
              </div>
            )}
            <ul className="mt-4 space-y-1 text-sm text-gray-600">
              {pieData.rows.map((r) => (
                <li key={r.name} className="flex justify-between gap-2">
                  <span className="capitalize">{r.name}</span>
                  <span>{pieData.total ? Math.round((r.value / pieData.total) * 100) : 0}% — {r.value} avis</span>
                </li>
              ))}
            </ul>
          </ChartCard>

          <ChartCard
            title="Top 10 thèmes"
            subtitle="Couleur = sentiment moyen (score −1…1)"
            isLoading={!themes.data && !themes.error}
          >
            {!themes.data?.length ? (
              <div className="rounded-2xl border border-gray-100 p-6 text-sm text-gray-500">
                Pas de données pour cette période
              </div>
            ) : (
              <div className="space-y-2.5">
                {themes.data.map((t) => {
                  const score = t.avgSentimentScore ?? 0;
                  const barColor = score < 0 ? "#ef4444" : score > 0 ? "#22c55e" : "#9ca3af";
                  const warn = score < -0.2;
                  return (
                    <div key={t.theme} className="flex items-center gap-3">
                      <div className="w-36 shrink-0 text-sm capitalize text-gray-800">{t.theme}</div>
                      <div className="h-2.5 flex-1 rounded-full bg-gray-100">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{
                            width: `${Math.max(8, Math.round((t.count / maxCount) * 100))}%`,
                            background: barColor,
                          }}
                        />
                      </div>
                      <div className="w-44 shrink-0 text-right font-mono text-xs text-gray-600">
                        {t.count} mentions | {score.toFixed(2)}
                        {warn ? " ⚠" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>

        <ChartCard
          title="Ce qui frustre les clients de Sephora"
          subtitle="Mots les plus fréquents dans les verbatims négatifs (filtres appliqués)"
          isLoading={!words.data && !words.error}
        >
          {!words.data?.length ? (
            <p className="text-sm text-gray-500">Pas assez de verbatims négatifs sur cette période.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {words.data.map((w) => (
                <span
                  key={w.word}
                  className="rounded-full border border-gray-100 px-3 py-1 font-medium"
                  style={{
                    background: "rgba(0,0,0,0.03)",
                    color: "#0A0A0A",
                    fontSize: `${12 + Math.min(14, w.count)}px`,
                  }}
                >
                  {w.word} ({w.count})
                </span>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Verbatims (live feed)"
          subtitle="Tri du plus négatif au plus positif — pagination"
          isLoading={!verbatims.data && !verbatims.error}
        >
          <VerbatimFeed rows={verbatims.data?.rows ?? []} isLoading={!verbatims.data && !verbatims.error} />
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={verbatims.data?.nextPage == null}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </ChartCard>
      </motion.div>
    </div>
  );
}
