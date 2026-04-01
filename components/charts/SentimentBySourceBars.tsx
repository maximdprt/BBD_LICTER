"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = Readonly<{ source: string; score: number; count: number }>;

type Props = Readonly<{
  data: Row[];
}>;

function barColor(score: number) {
  if (score < 40) return "#ef4444";
  if (score < 60) return "#f59e0b";
  return "#22c55e";
}

export function SentimentBySourceBars({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.score - b.score);
  if (!sorted.length)
    return <div className="py-8 text-center text-sm text-gray-500">Pas de données par source.</div>;

  return (
    <div className="h-[320px] w-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={sorted} margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b7280" }} />
          <YAxis type="category" dataKey="source" width={100} tick={{ fontSize: 11, fill: "#6b7280" }} />
          <Tooltip />
          <Bar dataKey="score" name="Indice" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={600}>
            {sorted.map((e) => (
              <Cell key={e.source} fill={barColor(e.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-gray-500">Sources les plus problématiques en premier (indice 0–100)</p>
    </div>
  );
}
