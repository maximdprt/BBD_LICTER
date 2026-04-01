"use client";

import { useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CompetitorRadarMetrics } from "@/lib/types";

const AXIS_LABELS: Record<string, string> = {
  sentiment: "Sentiment",
  volume: "Volume",
  livraison: "Livraison",
  sav: "SAV",
  prix: "Prix",
  fidelite: "Fidélité",
};

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
    return keys.map((k) => ({
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
      <ResponsiveContainer width="100%" height={360}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "#6b7280" }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--comex-border)",
              fontSize: 13,
            }}
          />
          {!hideSephora ? (
            <Radar
              name="Sephora"
              dataKey="Sephora"
              stroke="var(--comex-bordeaux, #be185d)"
              fill="var(--comex-bordeaux, #be185d)"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          ) : null}
          {!hideNocibe ? (
            <Radar
              name="Nocibé"
              dataKey="Nocibé"
              stroke="var(--comex-blue, #3b82f6)"
              fill="var(--comex-blue, #3b82f6)"
              fillOpacity={0.22}
              strokeWidth={2}
            />
          ) : null}
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
        <button
          type="button"
          className={`rounded-full px-3 py-1 font-medium ${hideSephora ? "bg-gray-200 text-gray-500 line-through" : "bg-pink-50 text-[var(--comex-bordeaux)]"}`}
          onClick={() => setHideSephora((x) => !x)}
        >
          Sephora
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 font-medium ${hideNocibe ? "bg-gray-200 text-gray-500 line-through" : "bg-blue-50 text-[var(--comex-blue)]"}`}
          onClick={() => setHideNocibe((x) => !x)}
        >
          Nocibé
        </button>
      </div>
    </div>
  );
}
