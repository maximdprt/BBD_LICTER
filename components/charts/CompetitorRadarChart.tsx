"use client";

import { useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import type { CompetitorRadarMetrics } from "@/lib/types";

const AXIS_LABELS: Record<string, string> = {
  sentiment: "Sentiment",
  livraison: "Livraison",
  sav: "SAV",
  prix: "Prix",
  fidelite: "Fidélité",
};

/** Volume exclu : spike structurel qui écrase les 5 autres axes (Sephora 2271 vs Nocibé 1328 → distorsion visuelle majeure) */
const EXCLUDED_AXES = new Set(["volume"]);

type Props = Readonly<{
  data: CompetitorRadarMetrics | null;
  isLoading?: boolean;
}>;

export function CompetitorRadarChart({ data, isLoading }: Props) {
  const [hideSephora, setHideSephora] = useState(false);
  const [hideNocibe, setHideNocibe] = useState(false);

  const chartData = useMemo(() => {
    if (!data) return [];
    const keys = Object.keys(data.sephora) as (keyof CompetitorRadarMetrics["sephora"])[];
    return keys
      .filter((k) => !EXCLUDED_AXES.has(k))
      .map((k) => ({
        axis: AXIS_LABELS[k] ?? k,
        key: k,
        Sephora: data.sephora[k],
        Nocibé: data.nocibe[k],
      }));
  }, [data]);

  if (isLoading) return <div className="skeleton mx-auto h-[320px] max-w-lg rounded-2xl" />;
  if (!data || chartData.length === 0)
    return (
      <div className="rounded-2xl border border-[var(--comex-border)] bg-gray-50 p-6 text-sm text-gray-500">
        Pas de données pour le radar concurrentiel.
      </div>
    );

  return (
    <div className="w-full" style={{ minHeight: 360 }}>
      <ResponsiveContainer width="100%" height={360} minWidth={200} minHeight={200}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 12, fontFamily: "DM Sans", fill: "#374151", fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickCount={4}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--comex-border)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontFamily: "DM Sans",
              fontSize: 13,
              padding: "8px 12px",
            }}
          />
          {!hideSephora ? (
            <Radar
              name="Sephora"
              dataKey="Sephora"
              stroke="var(--comex-bordeaux, #be185d)"
              fill="var(--comex-bordeaux, #be185d)"
              fillOpacity={0.25}
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--comex-bordeaux)", stroke: "#fff", strokeWidth: 1.5 }}
            />
          ) : null}
          {!hideNocibe ? (
            <Radar
              name="Nocibé"
              dataKey="Nocibé"
              stroke="var(--comex-blue, #3b82f6)"
              fill="var(--comex-blue, #3b82f6)"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--comex-blue)", stroke: "#fff", strokeWidth: 1.5 }}
            />
          ) : null}
        </RadarChart>
      </ResponsiveContainer>
      <p className="mb-2 text-center text-[11px] text-gray-400">
        5 axes normalisés 0–100 · Volume exclu (outlier structurel)
      </p>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        <button
          type="button"
          className={`rounded-full px-3 py-1 font-medium transition-opacity ${hideSephora ? "bg-gray-100 text-gray-400 opacity-50" : "bg-gray-100 text-black"}`}
          onClick={() => setHideSephora((x) => !x)}
        >
          ● Sephora
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 font-medium transition-opacity ${hideNocibe ? "bg-gray-100 text-gray-400 opacity-50" : "bg-green-50 text-[#00A651]"}`}
          onClick={() => setHideNocibe((x) => !x)}
        >
          ● Nocibé
        </button>
      </div>
    </div>
  );
}
