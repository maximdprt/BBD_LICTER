"use client";

import type { ThemeInsight } from "@/lib/types";
import { cn } from "@/lib/cn";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, LabelList } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";

type Props = Readonly<{
  data: ThemeInsight[];
  className?: string;
}>;

function sentimentColor(s: string): string {
  if (s === "négatif") return "#ef4444";
  if (s === "positif") return "#22c55e";
  return "#f59e0b";
}

function sentimentGradientId(theme: string, s: string): string {
  return `themeGrad-${theme.replace(/\s/g, "-")}-${s}`;
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
        background: "rgba(255,255,255,0.98)",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 14px",
        fontFamily: "DM Sans, sans-serif",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 700, color: "#111827", textTransform: "capitalize" }}>{d.theme}</span>
      <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ color: "#6b7280", fontSize: 12 }}>{d.count} mentions</span>
        <span
          style={{
            borderRadius: 999,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 700,
            background: sentimentColor(d.dominantSentiment) + "20",
            color: sentimentColor(d.dominantSentiment),
            textTransform: "capitalize",
          }}
        >
          {d.dominantSentiment}
        </span>
      </div>
    </div>
  );
}

const SENTIMENT_STOPS: Record<string, [string, string]> = {
  négatif: ["#ef4444", "#fca5a5"],
  positif: ["#22c55e", "#86efac"],
  neutre: ["#f59e0b", "#fcd34d"],
};

export function ThemeAnalysis({ data, className }: Props) {
  const top = data.slice(0, 5);

  if (top.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border bg-[var(--bg-card)] p-4 text-sm text-[var(--text-muted)]")}>
        Aucun thème sur la période.
      </div>
    );
  }

  const chartData = top.map((t) => ({
    theme: t.theme,
    count: t.count,
    dominantSentiment: t.dominantSentiment,
    color: sentimentColor(t.dominantSentiment),
    gradId: sentimentGradientId(t.theme, t.dominantSentiment),
  }));

  const maxCount = Math.max(1, ...chartData.map((d) => d.count));

  return (
    <div className={cn("w-full", className)}>
      {/* Custom bars */}
      <div className="space-y-3 px-1">
        {chartData.map((d, i) => {
          const pct = Math.round((d.count / maxCount) * 100);
          const stops = SENTIMENT_STOPS[d.dominantSentiment] ?? ["#9ca3af", "#d1d5db"];
          return (
            <div key={d.theme} className="flex items-center gap-3">
              <div className="w-[72px] shrink-0 truncate text-right text-xs font-medium capitalize text-gray-700">
                {d.theme}
              </div>
              <div className="relative flex-1 h-7 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${stops[0]}, ${stops[1]})`,
                    opacity: 0.85,
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
              <div className="flex w-[64px] shrink-0 items-center justify-end gap-2">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="font-mono text-xs font-semibold text-gray-600">
                  {d.count.toLocaleString("fr-FR")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center justify-end gap-4 pr-1">
        {[
          { label: "Positif", color: "#22c55e" },
          { label: "Neutre", color: "#f59e0b" },
          { label: "Négatif", color: "#ef4444" },
        ].map(({ label, color }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
