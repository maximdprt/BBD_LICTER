"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LabelList } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import { cn } from "@/lib/cn";
import type { WeeklyPoint } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type Props = Readonly<{
  data: WeeklyPoint[];
  className?: string;
}>;

function shortWeek(w: string) {
  try {
    return format(parseISO(w), "d MMM", { locale: fr });
  } catch {
    return w.slice(5);
  }
}

type TooltipProps = Readonly<{
  active?: boolean;
  payload?: { value?: number; payload?: WeeklyPoint }[];
  label?: string;
}>;

function WeekTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
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
        minWidth: 130,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: 6 }}>
        {d.payload ? shortWeek(d.payload.weekStart) : ""}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 22, fontWeight: 700, color: "#111827" }}>
          {d.value?.toLocaleString("fr-FR") ?? "—"}
        </span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>mentions</span>
      </div>
    </div>
  );
}

export function WeeklyTrend({ data, className }: Props) {
  const maxVal = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);
  const lastIdx = Math.max(0, data.length - 1);

  return (
    <div className={cn("w-full", className)} style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={100}>
        <BarChart data={data} barCategoryGap="28%" margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
          <defs>
            {data.map((p, idx) => {
              const intensity = p.value / maxVal;
              const isLast = idx === lastIdx;
              return (
                <linearGradient key={p.weekStart} id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isLast ? "#111827" : "#C9A96E"} stopOpacity={isLast ? 0.95 : 0.7 + intensity * 0.3} />
                  <stop offset="100%" stopColor={isLast ? "#374151" : "#D4B87A"} stopOpacity={isLast ? 0.6 : 0.3 + intensity * 0.3} />
                </linearGradient>
              );
            })}
          </defs>

          <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="weekStart"
            tickLine={false}
            axisLine={false}
            tickFormatter={shortWeek}
            tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#b0b8c4" }}
            interval="equidistantPreserveStart"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#b0b8c4" }}
            width={36}
          />
          <Tooltip content={<WeekTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)", radius: 4 }} />
          <Bar
            dataKey="value"
            name="Volume"
            radius={[5, 5, 0, 0]}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          >
            {data.map((p, idx) => (
              <Cell key={p.weekStart} fill={`url(#barGrad-${idx})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
