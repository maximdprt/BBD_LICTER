"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { VoiceSharePoint } from "@/lib/types";

type Props = Readonly<{
  data: VoiceSharePoint[];
  marque: "Sephora" | "Nocibé";
  onSelectSource?: (source: string) => void;
}>;

const SOURCE_COLORS: Record<string, string> = {
  Trustpilot: "#00b67a",
  Google: "#4285F4",
  TikTok: "#2D2D2D",
  Instagram: "#E1306C",
  LinkedIn: "#0A66C2",
  Reddit: "#FF4500",
};

type CustomTooltipProps = Readonly<{
  active?: boolean;
  payload?: { payload?: { name: string; value: number; total: number; color: string; pct: number } }[];
}>;

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--comex-border)",
        borderRadius: 10,
        padding: "8px 12px",
        fontFamily: "DM Sans",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 600, color: "var(--comex-text)" }}>{d.name}</span>
      <span style={{ marginLeft: 8, fontFamily: "DM Mono", color: "var(--text-muted)" }}>
        {d.value} signaux
      </span>
      <span style={{ marginLeft: 8, color: d.color, fontWeight: 600 }}>
        {d.pct}%
      </span>
    </div>
  );
}

export function SourceDonutChart({ data, marque, onSelectSource }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const sorted = [...data]
    .map((d) => ({
      name: d.source,
      value: marque === "Sephora" ? d.sephora : d.nocibe,
      color: SOURCE_COLORS[d.source] ?? "#9ca3af",
    }))
    .sort((a, b) => b.value - a.value);

  const total = sorted.reduce((acc, p) => acc + p.value, 0);
  const chartData = sorted.map((p) => ({ ...p, total, pct: total ? Math.round((p.value / total) * 100) : 0 }));
  const active = chartData.find((d) => d.name === hovered) ?? null;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Total
        </span>
        <span className="font-mono text-sm font-semibold text-(--comex-text)">
          {total.toLocaleString("fr-FR")} signaux
        </span>
      </div>

      <div className="relative h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={108}
              stroke="#fff"
              strokeWidth={2}
              isAnimationActive
              animationDuration={800}
              onMouseEnter={(p) => setHovered((p as { name: string }).name)}
              onMouseLeave={() => setHovered(null)}
            >
              {chartData.map((p) => (
                <Cell key={p.name} fill={p.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {active ? (
            <div className="text-center">
              <div className="text-sm font-semibold">{active.name}</div>
              <div className="text-xs text-gray-500">{active.pct}% • {active.value}</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xs uppercase text-gray-400">Total</div>
              <div className="font-mono text-lg font-bold">{total.toLocaleString("fr-FR")}</div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {chartData.map((row) => (
          <button
            key={row.name}
            type="button"
            onClick={() => onSelectSource?.(row.name)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-sm hover:bg-gray-50"
          >
            <span className="inline-flex items-center gap-2">
              <span className="inline-block size-2.5 rounded-full" style={{ background: row.color }} />
              {row.name}
            </span>
            <span className="font-mono text-xs text-gray-600">{row.pct}% • {row.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
