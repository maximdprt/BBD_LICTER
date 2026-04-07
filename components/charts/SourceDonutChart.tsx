"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import type { VoiceSharePoint } from "@/lib/types";

type Props = Readonly<{
  data: VoiceSharePoint[];
  marque: "Sephora" | "Nocibé";
  onSelectSource?: (source: string) => void;
}>;

const SOURCE_COLORS: Record<string, string> = {
  Google: "#4285F4",
  TikTok: "#1a1a2e",
  Instagram: "#E1306C",
  LinkedIn: "#0A66C2",
  Reddit: "#FF4500",
};

const SOURCE_ICONS: Record<string, string> = {
  Google: "G",
  TikTok: "♪",
  Instagram: "◎",
  LinkedIn: "in",
  Reddit: "r/",
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
        background: "rgba(255,255,255,0.98)",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 14px",
        fontFamily: "DM Sans, sans-serif",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: d.color, display: "inline-block" }} />
        <span style={{ fontWeight: 700, color: "#111827" }}>{d.name}</span>
      </div>
      <div style={{ color: "#6b7280", fontSize: 12 }}>
        {d.value.toLocaleString("fr-FR")} signaux ·{" "}
        <span style={{ fontWeight: 700, color: d.color }}>{d.pct}%</span>
      </div>
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
    .sort((a, b) => b.value - a.value)
    .filter((d) => d.value > 0);

  const total = sorted.reduce((acc, p) => acc + p.value, 0);
  const chartData = sorted.map((p) => ({
    ...p,
    total,
    pct: total ? Math.round((p.value / total) * 100) : 0,
  }));

  const active = chartData.find((d) => d.name === hovered) ?? null;

  return (
    <div className="w-full">
      {/* Total */}
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total signaux</span>
        <span className="font-mono text-sm font-bold text-gray-900">{total.toLocaleString("fr-FR")}</span>
      </div>

      {/* Donut */}
      <div className="relative" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={80}>
          <PieChart>
            <defs>
              {chartData.map((p) => (
                <filter key={`shadow-${p.name}`} id={`shadow-${p.name}`}>
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={p.color} floodOpacity="0.3" />
                </filter>
              ))}
            </defs>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={104}
              paddingAngle={2}
              stroke="none"
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
              onMouseEnter={(p) => setHovered((p as { name: string }).name)}
              onMouseLeave={() => setHovered(null)}
            >
              {chartData.map((p) => (
                <Cell
                  key={p.name}
                  fill={p.color}
                  opacity={hovered && hovered !== p.name ? 0.45 : 1}
                  style={{ transition: "opacity 0.2s, filter 0.2s", filter: hovered === p.name ? `url(#shadow-${p.name})` : "none" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {active ? (
            <div className="text-center">
              <div
                className="mx-auto mb-1 grid size-8 place-items-center rounded-full text-sm font-bold text-white"
                style={{ background: active.color }}
              >
                {SOURCE_ICONS[active.name] ?? active.name[0]}
              </div>
              <div className="text-sm font-bold text-gray-900">{active.pct}%</div>
              <div className="text-[11px] text-gray-500">{active.value.toLocaleString("fr-FR")}</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Sources</div>
              <div className="font-mono text-xl font-bold text-gray-900">{chartData.length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Legend rows */}
      <div className="mt-3 space-y-1">
        {chartData.map((row) => (
          <button
            key={row.name}
            type="button"
            onClick={() => onSelectSource?.(row.name)}
            onMouseEnter={() => setHovered(row.name)}
            onMouseLeave={() => setHovered(null)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-all hover:bg-gray-50"
            style={{ opacity: hovered && hovered !== row.name ? 0.5 : 1 }}
          >
            <span className="inline-flex items-center gap-2.5">
              <span className="inline-block size-2.5 rounded-full" style={{ background: row.color }} />
              <span className="font-medium text-gray-700">{row.name}</span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: row.color + "18", color: row.color }}
              >
                {row.pct}%
              </span>
              <span className="font-mono text-xs text-gray-500">{row.value.toLocaleString("fr-FR")}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
