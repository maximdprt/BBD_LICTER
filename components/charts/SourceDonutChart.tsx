"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VoiceSharePoint } from "@/lib/types";

type Props = Readonly<{
  data: VoiceSharePoint[];
  marque: "Sephora" | "Nocibé";
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
  payload?: { payload?: { name: string; value: number; total: number; color: string } }[];
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
        {d.total ? `${Math.round((d.value / d.total) * 100)}%` : ""}
      </span>
    </div>
  );
}

export function SourceDonutChart({ data, marque }: Props) {
  const sorted = [...data]
    .map((d) => ({
      name: d.source,
      value: marque === "Sephora" ? d.sephora : d.nocibe,
      color: SOURCE_COLORS[d.source] ?? "#9ca3af",
    }))
    .sort((a, b) => b.value - a.value);

  const total = sorted.reduce((acc, p) => acc + p.value, 0);
  const chartData = sorted.map((p) => ({ ...p, total }));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Total
        </span>
        <span className="font-mono text-sm font-semibold text-[var(--comex-text)]">
          {total.toLocaleString("fr-FR")} signaux
        </span>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 4, right: 56, left: 8, bottom: 4 }}
            barCategoryGap="20%"
          >
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="name"
              width={76}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontFamily: "DM Sans", fill: "#374151", fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              isAnimationActive
              animationDuration={600}
              animationEasing="ease-out"
            >
              {chartData.map((p) => (
                <Cell key={p.name} fill={p.color} fillOpacity={0.85} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                formatter={(v: unknown) => {
                  const num = typeof v === "number" ? v : 0;
                  return total ? `${Math.round((num / total) * 100)}%` : "";
                }}
                style={{ fontSize: 11, fontFamily: "DM Mono", fill: "#6b7280", fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
