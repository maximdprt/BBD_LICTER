"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  Area,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  Dot,
} from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import type { WeeklySentimentPoint } from "@/lib/types";

type Props = Readonly<{
  data: WeeklySentimentPoint[];
  alertWeeks?: string[];
}>;

function weekLabel(weekStart: string) {
  try {
    return format(parseISO(weekStart), "dd MMM", { locale: fr });
  } catch {
    return weekStart;
  }
}

function monthLabel(weekStart: string) {
  try {
    return format(parseISO(weekStart), "MMM", { locale: fr });
  } catch {
    return weekStart;
  }
}

type TooltipPayloadItem = Readonly<{
  dataKey?: string;
  value?: number | null;
  payload?: { weekStart?: string };
}>;

function SentimentTooltip({ active, payload }: Readonly<{ active?: boolean; payload?: TooltipPayloadItem[] }>) {
  if (!active || !payload?.length) return null;
  const seph = payload.find((p) => p.dataKey === "sephora");
  const noci = payload.find((p) => p.dataKey === "nocibe");
  const week = (payload[0]?.payload as { weekStart?: string } | undefined)?.weekStart;
  const diff =
    typeof seph?.value === "number" && typeof noci?.value === "number"
      ? seph.value - noci.value
      : null;

  return (
    <div
      style={{
        minWidth: 200,
        background: "rgba(255,255,255,0.98)",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        boxShadow: "0 12px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        padding: "12px 16px",
        fontFamily: "DM Sans, sans-serif",
        backdropFilter: "blur(8px)",
      }}
    >
      {week && (
        <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "#9ca3af" }}>
          {weekLabel(week)}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {seph && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 9999, background: "var(--comex-bordeaux)", display: "inline-block", boxShadow: "0 0 0 2px rgba(0,0,0,0.12)" }} />
              <span style={{ fontSize: 13, color: "#374151" }}>Sephora</span>
            </span>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 14, fontWeight: 700, color: "#111827" }}>
              {typeof seph.value === "number" ? seph.value.toFixed(1) : "—"}
              <span style={{ fontSize: 11, fontWeight: 400, color: "#9ca3af", marginLeft: 3 }}>/100</span>
            </span>
          </div>
        )}
        {noci && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 9999, background: "var(--comex-blue)", display: "inline-block", boxShadow: "0 0 0 2px rgba(0,166,81,0.2)" }} />
              <span style={{ fontSize: 13, color: "#374151" }}>Nocibé</span>
            </span>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 14, fontWeight: 700, color: "#111827" }}>
              {typeof noci.value === "number" ? noci.value.toFixed(1) : "—"}
              <span style={{ fontSize: 11, fontWeight: 400, color: "#9ca3af", marginLeft: 3 }}>/100</span>
            </span>
          </div>
        )}
        {diff !== null && (
          <div style={{ marginTop: 4, paddingTop: 8, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>Écart</span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: diff >= 0 ? "var(--comex-bordeaux)" : "var(--comex-blue)",
              background: diff >= 0 ? "rgba(0,0,0,0.05)" : "rgba(0,166,81,0.08)",
              borderRadius: 6, padding: "2px 8px"
            }}>
              {diff >= 0 ? "+" : ""}{diff.toFixed(1)} pts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SentimentLineChart({ data, alertWeeks = [] }: Props) {
  const [hideSephora, setHideSephora] = useState(false);
  const [hideNocibe, setHideNocibe] = useState(false);
  const [windowMonths, setWindowMonths] = useState<1 | 3 | 6>(6);

  const alertSet = useMemo(() => new Set(alertWeeks), [alertWeeks]);
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const points = [...data].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    const keep = windowMonths * 5;
    return points.slice(-keep);
  }, [data, windowMonths]);

  const yDomain: [number, number] = useMemo(() => {
    const allValues = filteredData.flatMap((p) => [p.sephora, p.nocibe]).filter((v): v is number => typeof v === "number");
    if (allValues.length === 0) return [40, 80];
    const min = Math.floor(Math.min(...allValues)) - 6;
    const max = Math.ceil(Math.max(...allValues)) + 6;
    return [Math.max(0, min), Math.min(100, max)];
  }, [filteredData]);

  return (
    <div className="w-full">
      {/* Selector */}
      <div className="mb-4 flex items-center gap-2 justify-end">
        {([1, 3, 6] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setWindowMonths(m)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            style={windowMonths === m
              ? { background: "#111827", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }
              : { background: "#f3f4f6", color: "#6b7280" }
            }
          >
            {m}M
          </button>
        ))}
      </div>

      <div style={{ height: 320, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={120}>
          <ComposedChart data={filteredData} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="gradSephora" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--comex-bordeaux)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="var(--comex-bordeaux)" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradNocibe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--comex-blue)" stopOpacity={0.14} />
                <stop offset="95%" stopColor="var(--comex-blue)" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" vertical={false} />

            <XAxis
              dataKey="weekStart"
              tickLine={false}
              axisLine={false}
              tickFormatter={monthLabel}
              tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#b0b8c4" }}
              interval="equidistantPreserveStart"
            />
            <YAxis
              domain={yDomain}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#b0b8c4" }}
              tickCount={5}
              width={32}
            />

            <Tooltip content={<SentimentTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1.5, strokeDasharray: "4 3" }} />

            {/* Alert markers */}
            {filteredData.map((p) =>
              alertSet.has(p.weekStart) ? (
                <ReferenceLine
                  key={`al-${p.weekStart}`}
                  x={p.weekStart}
                  stroke="#ef4444"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: "⚠", position: "insideTopRight", fill: "#ef4444", fontSize: 11 }}
                />
              ) : null,
            )}

            {/* Gradient areas */}
            {!hideSephora && (
              <Area
                type="monotone"
                dataKey="sephora"
                stroke="none"
                fill="url(#gradSephora)"
                isAnimationActive
                animationDuration={800}
              />
            )}
            {!hideNocibe && (
              <Area
                type="monotone"
                dataKey="nocibe"
                stroke="none"
                fill="url(#gradNocibe)"
                isAnimationActive
                animationDuration={800}
              />
            )}

            {!hideSephora && (
              <Line
                type="monotone"
                dataKey="sephora"
                name="Sephora"
                stroke="var(--comex-bordeaux)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2.5, stroke: "#fff", fill: "var(--comex-bordeaux)" }}
                isAnimationActive
                animationDuration={600}
              />
            )}
            {!hideNocibe && (
              <Line
                type="monotone"
                dataKey="nocibe"
                name="Nocibé"
                stroke="var(--comex-blue)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="7 3"
                activeDot={{ r: 5, strokeWidth: 2.5, stroke: "#fff", fill: "var(--comex-blue)" }}
                isAnimationActive
                animationDuration={600}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setHideSephora((x) => !x)}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all"
          style={{
            background: hideSephora ? "#f3f4f6" : "rgba(0,0,0,0.06)",
            color: hideSephora ? "#9ca3af" : "#111827",
            opacity: hideSephora ? 0.5 : 1,
          }}
        >
          <span className="inline-block h-2.5 w-5 rounded-full" style={{ background: "var(--comex-bordeaux)" }} />
          Sephora
        </button>
        <button
          type="button"
          onClick={() => setHideNocibe((x) => !x)}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all"
          style={{
            background: hideNocibe ? "#f3f4f6" : "rgba(0,166,81,0.08)",
            color: hideNocibe ? "#9ca3af" : "#00A651",
            opacity: hideNocibe ? 0.5 : 1,
          }}
        >
          <span className="inline-block h-[2px] w-5 rounded" style={{ background: "var(--comex-blue)", borderTop: "2px dashed var(--comex-blue)" }} />
          Nocibé
        </button>
      </div>
    </div>
  );
}
