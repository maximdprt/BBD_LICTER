"use client";

import type { ThemeInsight } from "@/lib/types";
import { cn } from "@/lib/cn";
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from "recharts";

type Props = Readonly<{
  data: ThemeInsight[];
  className?: string;
}>;

function sentimentColor(s: string): string {
  if (s === "négatif") return "#ef4444";
  if (s === "positif") return "#22c55e";
  return "#f59e0b"; // neutre → ambre
}

function sentimentLabel(s: string): string {
  if (s === "négatif") return "négatif";
  if (s === "positif") return "positif";
  return "neutre";
}

type TooltipProps = Readonly<{
  active?: boolean;
  payload?: { payload?: { theme: string; count: number; dominantSentiment: string; color: string } }[];
}>;

function ThemeTooltip({ active, payload }: TooltipProps) {
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
      <span style={{ fontWeight: 600, color: "var(--comex-text)", textTransform: "capitalize" }}>
        {d.theme}
      </span>
      <div style={{ marginTop: 4, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ color: "#6b7280" }}>{d.count} mentions</span>
        <span
          style={{
            borderRadius: 999,
            padding: "1px 8px",
            fontSize: 11,
            fontWeight: 600,
            background: sentimentColor(d.dominantSentiment) + "22",
            color: sentimentColor(d.dominantSentiment),
          }}
        >
          {sentimentLabel(d.dominantSentiment)}
        </span>
      </div>
    </div>
  );
}

export function ThemeAnalysis({ data, className }: Props) {
  const top = data.slice(0, 5);

  if (top.length === 0) {
    return (
      <div
        className={cn("rounded-2xl border border-border bg-[var(--bg-card)] p-4 text-sm")}
        style={{ color: "var(--text-muted)" }}
      >
        Aucun thème sur la période.
      </div>
    );
  }

  const chartData = top.map((t) => ({
    theme: t.theme,
    count: t.count,
    dominantSentiment: t.dominantSentiment,
    color: sentimentColor(t.dominantSentiment),
  }));

  return (
    <div className={cn("h-[280px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="theme"
            width={76}
            tickLine={false}
            axisLine={false}
            tick={{ fontFamily: "DM Sans", fontSize: 12, fill: "#374151", fontWeight: 500 }}
          />

          <Tooltip content={<ThemeTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />

          <Bar
            dataKey="count"
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
            radius={[0, 6, 6, 0]}
          >
            {chartData.map((d) => (
              <Cell key={d.theme} fill={d.color} fillOpacity={0.8} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              offset={8}
              style={{ fontFamily: "DM Mono", fontSize: 11, fill: "#6b7280", fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Légende sentiment */}
      <div className="mt-1 flex items-center justify-end gap-4 pr-1">
        {[
          { label: "Positif", color: "#22c55e" },
          { label: "Neutre", color: "#f59e0b" },
          { label: "Négatif", color: "#ef4444" },
        ].map(({ label, color }) => (
          <span key={label} className="inline-flex items-center gap-1 text-[10px] text-gray-500">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: color, opacity: 0.8 }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
