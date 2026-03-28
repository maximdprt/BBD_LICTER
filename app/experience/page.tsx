"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "@/components/charts/ChartCard";
import { VerbatimFeed } from "@/components/sections/VerbatimFeed";
import { useDefaultDateRange, useSentimentDistribution, useTopThemes, useVerbatims } from "@/hooks/useMetrics";
import type { Sentiment, Source } from "@/lib/types";

const SENT_COLORS: Record<Sentiment, string> = {
  positif: "#10B981",
  neutre: "#94A3B8",
  "négatif": "#F43F5E",
};

const SOURCES: Source[] = ["Twitter/X", "Instagram", "TikTok", "LinkedIn"];

export default function ExperiencePage() {
  const range = useDefaultDateRange();
  const [source, setSource] = useState<Source | "all">("all");
  const [sentiment, setSentiment] = useState<Sentiment | "all">("all");
  const [theme, setTheme] = useState<string>("");

  const dist = useSentimentDistribution("Sephora", range);
  const themes = useTopThemes("Sephora", "all", range);

  const filters = useMemo(
    () => ({
      marque: "Sephora" as const,
      source: source === "all" ? undefined : source,
      sentiment: sentiment === "all" ? undefined : sentiment,
      theme: theme.trim() ? theme.trim() : undefined,
      from: range.from,
      to: range.to,
    }),
    [range.from, range.to, sentiment, source, theme],
  );

  const verbatims = useVerbatims(filters, 0, 12);

  const pieData = useMemo(() => {
    const d = dist.data ?? { positif: 0, neutre: 0, "négatif": 0 };
    return (Object.keys(d) as Sentiment[]).map((k) => ({ name: k, value: d[k] }));
  }, [dist.data]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4"
      >
        <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-foreground">Filtres</div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              className="rounded-2xl border border-border bg-white px-3 py-2 text-sm"
              value={source}
              onChange={(e) => setSource(e.target.value as Source | "all")}
            >
              <option value="all">Plateforme: toutes</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-border bg-white px-3 py-2 text-sm"
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value as Sentiment | "all")}
            >
              <option value="all">Sentiment: tous</option>
              <option value="positif">positif</option>
              <option value="neutre">neutre</option>
              <option value="négatif">négatif</option>
            </select>
            <input
              className="w-56 rounded-2xl border border-border bg-white px-3 py-2 text-sm"
              placeholder="Thème (ex: livraison)"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard
            title="Répartition des sentiments"
            subtitle="Sephora — 6 derniers mois"
            isLoading={!dist.data && !dist.error}
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid rgba(229,231,235,1)",
                      boxShadow: "0 8px 20px rgba(15,15,26,0.06)",
                    }}
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    stroke="rgba(255,255,255,1)"
                    strokeWidth={2}
                  >
                    {pieData.map((p) => (
                      <Cell key={p.name} fill={SENT_COLORS[p.name as Sentiment]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Top 10 thèmes"
            subtitle="Triés par volume"
            isLoading={!themes.data && !themes.error}
          >
            {themes.data?.length ? (
              <div className="space-y-2">
                {themes.data.map((t) => (
                  <div key={t.theme} className="flex items-center gap-3">
                    <div className="w-40 truncate text-sm text-foreground/80">{t.theme}</div>
                    <div className="h-2 flex-1 rounded-full bg-black/4">
                      <div
                        className="h-2 rounded-full bg-linear-to-r from-accent to-cyan"
                        style={{
                          width: `${Math.max(
                            6,
                            Math.round((t.count / (themes.data?.[0]?.count ?? 1)) * 100),
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="w-12 text-right font-mono text-sm text-foreground">{t.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-secondary">
                Aucun thème détecté sur la période.
              </div>
            )}
          </ChartCard>
        </div>

        <ChartCard
          title="Verbatims (live feed)"
          subtitle="Avis récents — paginé (page 1)"
          isLoading={!verbatims.data && !verbatims.error}
        >
          <VerbatimFeed rows={verbatims.data?.rows ?? []} isLoading={!verbatims.data && !verbatims.error} />
        </ChartCard>
      </motion.div>
    </div>
  );
}

