"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklySentimentPoint } from "@/lib/types";

type Props = Readonly<{
  data: WeeklySentimentPoint[];
  alertWeeks?: string[];
}>;

function weekLabel(weekStart: string) {
  try {
    return format(parseISO(weekStart), "dd/MM");
  } catch {
    return weekStart;
  }
}

type TooltipPayloadItem = Readonly<{
  dataKey?: string;
  value?: number | null;
  payload?: { weekStart?: string };
}>;

function BrandPill({ brand }: Readonly<{ brand: "Sephora" | "Nocibé" }>) {
  const color = brand === "Sephora" ? "var(--comex-bordeaux)" : "var(--comex-blue)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "DM Sans" }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: "inline-block" }} />
      <span style={{ color: "var(--text-primary)" }}>{brand}</span>
    </span>
  );
}

function SentimentTooltip({ active, payload }: Readonly<{ active?: boolean; payload?: TooltipPayloadItem[] }>) {
  if (!active || !payload?.length) return null;
  const seph = payload.find((p) => p.dataKey === "sephora");
  const noci = payload.find((p) => p.dataKey === "nocibe");
  const week = (payload[0]?.payload as { weekStart?: string } | undefined)?.weekStart;

  return (
    <div
      style={{
        minWidth: 200,
        background: "#fff",
        border: "1px solid var(--comex-border)",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        padding: "10px 14px",
        fontFamily: "DM Sans",
      }}
    >
      {week ? (
        <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
          {weekLabel(week)}
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        {seph && (
          <div className="flex items-center justify-between gap-4">
            <BrandPill brand="Sephora" />
            <span className="font-mono text-sm font-semibold">
              {typeof seph.value === "number" ? seph.value.toFixed(1) : "—"}
              <span className="ml-1 text-xs text-gray-400">/100</span>
            </span>
          </div>
        )}
        {noci && (
          <div className="flex items-center justify-between gap-4">
            <BrandPill brand="Nocibé" />
            <span className="font-mono text-sm font-semibold">
              {typeof noci.value === "number" ? noci.value.toFixed(1) : "—"}
              <span className="ml-1 text-xs text-gray-400">/100</span>
            </span>
          </div>
        )}
        {seph && noci && typeof seph.value === "number" && typeof noci.value === "number" ? (
          <div
            className="mt-1 border-t pt-1 text-xs"
            style={{ borderColor: "var(--comex-border)", color: "var(--text-muted)" }}
          >
            Écart :{" "}
            <span
              className="font-semibold"
              style={{ color: seph.value >= noci.value ? "var(--comex-bordeaux)" : "var(--comex-blue)" }}
            >
              {seph.value >= noci.value ? "+" : ""}
              {(seph.value - noci.value).toFixed(1)} pts
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Trouve les N points les plus extrêmes (min / max) pour annoter */
function findAnnotations(data: WeeklySentimentPoint[]) {
  const annotations: { weekStart: string; label: string; brand: "sephora" | "nocibe" }[] = [];
  if (data.length < 4) return annotations;

  // Peak Sephora
  const sephPoints = data.filter((p) => typeof p.sephora === "number");
  if (sephPoints.length) {
    const maxS = sephPoints.reduce((a, b) => ((a.sephora ?? 0) > (b.sephora ?? 0) ? a : b));
    const minS = sephPoints.reduce((a, b) => ((a.sephora ?? 100) < (b.sephora ?? 100) ? a : b));
    // N'annoter que si l'écart est significatif (>3pts par rapport à la médiane)
    const vals = sephPoints.map((p) => p.sephora as number).sort((a, b) => a - b);
    const median = vals[Math.floor(vals.length / 2)] ?? 50;
    if ((maxS.sephora ?? 0) - median > 3) annotations.push({ weekStart: maxS.weekStart, label: "↑", brand: "sephora" });
    if (median - (minS.sephora ?? 100) > 3) annotations.push({ weekStart: minS.weekStart, label: "↓", brand: "sephora" });
  }

  return annotations;
}

export function SentimentLineChart({ data, alertWeeks = [] }: Props) {
  const [hideSephora, setHideSephora] = useState(false);
  const [hideNocibe, setHideNocibe] = useState(false);

  const alertSet = useMemo(() => new Set(alertWeeks), [alertWeeks]);

  // Calcul domaine Y dynamique — serré sur les données réelles
  const yDomain = useMemo((): [number, number] => {
    if (!data.length) return [35, 75];
    const allVals: number[] = [];
    for (const p of data) {
      if (typeof p.sephora === "number") allVals.push(p.sephora);
      if (typeof p.nocibe === "number") allVals.push(p.nocibe);
    }
    if (!allVals.length) return [35, 75];
    const min = Math.floor(Math.min(...allVals) - 4);
    const max = Math.ceil(Math.max(...allVals) + 4);
    return [Math.max(0, min), Math.min(100, max)];
  }, [data]);

  const annotations = useMemo(() => findAnnotations(data), [data]);

  return (
    <div className="w-full">
      <div className="h-[300px] w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="weekStart"
              tickLine={false}
              axisLine={false}
              tickFormatter={weekLabel}
              tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#9ca3af" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#9ca3af" }}
              tickCount={5}
            />

            <Tooltip content={<SentimentTooltip />} />

            {/* Alertes */}
            {data.map((p) =>
              alertSet.has(p.weekStart) ? (
                <ReferenceLine
                  key={`al-${p.weekStart}`}
                  x={p.weekStart}
                  stroke="#ef4444"
                  strokeDasharray="4 3"
                  strokeWidth={1}
                  label={{ value: "⚠", position: "top", fill: "#ef4444", fontSize: 10 }}
                />
              ) : null,
            )}

            {/* Annotations extremes */}
            {annotations.map((a) => (
              <ReferenceLine
                key={`ann-${a.weekStart}-${a.brand}`}
                x={a.weekStart}
                stroke={a.brand === "sephora" ? "var(--comex-bordeaux)" : "var(--comex-blue)"}
                strokeDasharray="2 4"
                strokeWidth={1}
                opacity={0.5}
                label={{ value: a.label, position: "top", fill: a.brand === "sephora" ? "var(--comex-bordeaux)" : "var(--comex-blue)", fontSize: 12 }}
              />
            ))}

            {!hideSephora && (
              <Line
                type="monotone"
                dataKey="sephora"
                name="Sephora"
                stroke="var(--comex-bordeaux)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: "var(--comex-bordeaux)" }}
                isAnimationActive
                animationDuration={500}
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
                strokeDasharray="6 3"
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: "var(--comex-blue)" }}
                isAnimationActive
                animationDuration={500}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-600">
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 transition-opacity ${hideSephora ? "opacity-35" : ""}`}
          onClick={() => setHideSephora((x) => !x)}
        >
          <span
            className="inline-block h-2 w-4 rounded-full"
            style={{ background: "var(--comex-bordeaux)" }}
          />
          Sephora
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 transition-opacity ${hideNocibe ? "opacity-35" : ""}`}
          onClick={() => setHideNocibe((x) => !x)}
        >
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{
              background: "var(--comex-blue)",
              borderTop: "2px dashed var(--comex-blue)",
              height: 0,
              display: "inline-block",
              width: 16,
            }}
          />
          Nocibé
        </button>
      </div>
    </div>
  );
}
