"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, LabelList, ReferenceLine, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import type { VoiceSharePoint } from "@/lib/types";

type Props = Readonly<{
  data: VoiceSharePoint[];
}>;

type TooltipProps = Readonly<{
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number; fill?: string }[];
}>;

function VoiceTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.98)",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "10px 14px",
      fontFamily: "DM Sans, sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      minWidth: 160,
    }}>
      <div style={{ fontWeight: 700, color: "#374151", fontSize: 13, marginBottom: 8 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: p.fill, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>{p.name}</span>
          </span>
          <span style={{ fontFamily: "DM Mono, monospace", fontWeight: 700, fontSize: 13, color: "#111827" }}>
            {typeof p.value === "number" ? (p.value % 1 === 0 ? p.value.toLocaleString("fr-FR") : `${Math.round(p.value * 10) / 10}%`) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function VoiceShareBarChart({ data }: Props) {
  const [mode, setMode] = useState<"absolute" | "relative">("relative");

  const rows = useMemo(() => {
    return data
      .map((d) => {
        const t = d.sephora + d.nocibe;
        const sephPct = t ? (d.sephora / t) * 100 : 0;
        const nociPct = t ? (d.nocibe / t) * 100 : 0;
        return { ...d, total: t, sephPct, nociPct };
      })
      .sort((a, b) => b.sephPct - a.sephPct);
  }, [data]);

  const modeButtons: { label: string; value: "absolute" | "relative" }[] = [
    { label: "Volume absolu", value: "absolute" },
    { label: "Part relative %", value: "relative" },
  ];

  return (
    <div className="w-full">
      {/* Toggle */}
      <div className="mb-4 flex items-center justify-end gap-2">
        {modeButtons.map((btn) => (
          <button
            key={btn.value}
            type="button"
            onClick={() => setMode(btn.value)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            style={mode === btn.value
              ? { background: "#111827", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }
              : { background: "#f3f4f6", color: "#6b7280" }
            }
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={80}>
          <BarChart data={rows} barCategoryGap="30%" barGap={3} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="vsGradSephora" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#374151" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="vsGradNocibe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00A651" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#4DC47D" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="source"
              tickLine={false}
              axisLine={false}
              tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#b0b8c4" }}
            />
            <YAxis
              domain={mode === "relative" ? [0, 100] : [0, "auto"]}
              tickLine={false}
              axisLine={false}
              tick={{ fontFamily: "DM Sans", fontSize: 11, fill: "#b0b8c4" }}
              width={36}
            />
            {mode === "relative" && (
              <ReferenceLine y={50} stroke="#d1d5db" strokeDasharray="4 3" strokeWidth={1.5} />
            )}
            <Tooltip content={<VoiceTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />

            <Bar
              dataKey={mode === "relative" ? "sephPct" : "sephora"}
              name="Sephora"
              fill="url(#vsGradSephora)"
              radius={[5, 5, 0, 0]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey={mode === "relative" ? "sephPct" : "sephora"}
                position="top"
                style={{ fontFamily: "DM Mono, monospace", fontSize: 10, fill: "#374151", fontWeight: 600 }}
                formatter={(v: unknown) => {
                  const n = typeof v === "number" ? v : Number(v ?? 0);
                  return mode === "relative" ? `${Math.round(n)}%` : `${Math.round(n)}`;
                }}
              />
            </Bar>

            <Bar
              dataKey={mode === "relative" ? "nociPct" : "nocibe"}
              name="Nocibé"
              fill="url(#vsGradNocibe)"
              radius={[5, 5, 0, 0]}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey={mode === "relative" ? "nociPct" : "nocibe"}
                position="top"
                style={{ fontFamily: "DM Mono, monospace", fontSize: 10, fill: "#00A651", fontWeight: 600 }}
                formatter={(v: unknown) => {
                  const n = typeof v === "number" ? v : Number(v ?? 0);
                  return mode === "relative" ? `${Math.round(n)}%` : `${Math.round(n)}`;
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-6 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-3 rounded-sm" style={{ background: "#111827" }} />
          <span className="text-gray-600 font-medium">Sephora</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-3 rounded-sm" style={{ background: "#00A651" }} />
          <span className="text-gray-600 font-medium">Nocibé</span>
        </span>
      </div>
    </div>
  );
}
