"use client";

import { useMemo, useState } from "react";
import { format, getISOWeek, parseISO } from "date-fns";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklySentimentPoint } from "@/lib/types";

type Props = Readonly<{
  data: WeeklySentimentPoint[];
  /** Semaines (yyyy-MM-dd) avec alerte — marqueurs verticaux */
  alertWeeks?: string[];
}>;

function weekLabel(weekStart: string) {
  try {
    const d = parseISO(weekStart);
    return format(d, "dd/MM");
  } catch {
    return weekStart;
  }
}

type TooltipPayloadItem = Readonly<{
  dataKey?: string;
  name?: string;
  value?: number | null;
  color?: string;
  payload?: { weekStart?: string };
}>;

function BrandPill(props: { brand: "Sephora" | "Nocibé" }) {
  const isSephora = props.brand === "Sephora";
  const color = isSephora ? "var(--comex-bordeaux)" : "var(--comex-blue)";
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "DM Sans", color: "var(--text-primary)" }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color, display: "inline-block" }} />
      <span>{props.brand}</span>
    </span>
  );
}

function SentimentTooltip({
  active,
  payload,
}: Readonly<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
}>) {
  if (!active || !payload?.length) return null;

  const seph = payload.find((p) => p.dataKey === "sephora");
  const noci = payload.find((p) => p.dataKey === "nocibe");

  return (
    <div
      style={{
        minWidth: 240,
        background: "#FFFFFF",
        border: "1px solid var(--comex-border)",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        padding: "12px 16px",
        fontFamily: "DM Sans",
      }}
    >
      <div className="text-xs font-bold uppercase tracking-widest text-gray-800">
        {(() => {
          const pl = payload[0]?.payload as { weekStart?: string } | undefined;
          return pl?.weekStart ? weekLabel(pl.weekStart) : "";
        })()}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {seph ? (
          <div className="flex items-center justify-between gap-3">
            <BrandPill brand="Sephora" />
            <div className="font-mono text-sm font-semibold">
              {typeof seph.value === "number" ? seph.value.toFixed(1) : "—"}
              <span className="ml-1 text-xs text-gray-400">/100</span>
            </div>
          </div>
        ) : null}
        {noci ? (
          <div className="flex items-center justify-between gap-3">
            <BrandPill brand="Nocibé" />
            <div className="font-mono text-sm font-semibold">
              {typeof noci.value === "number" ? noci.value.toFixed(1) : "—"}
              <span className="ml-1 text-xs text-gray-400">/100</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SentimentLineChart({ data, alertWeeks = [] }: Props) {
  const [hideSephora, setHideSephora] = useState(false);
  const [hideNocibe, setHideNocibe] = useState(false);

  const crisis = useMemo(() => {
    const p = data.find((x) => typeof x.sephora === "number" && (x.sephora as number) < 40);
    if (!p?.weekStart) return null;
    try {
      return getISOWeek(parseISO(p.weekStart));
    } catch {
      return null;
    }
  }, [data]);

  const alertSet = useMemo(() => new Set(alertWeeks), [alertWeeks]);

  return (
    <div className="w-full">
      <div className="h-[300px] w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSephora" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--comex-bordeaux)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--comex-bordeaux)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNocibe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--comex-blue)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--comex-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <ReferenceArea y1={0} y2={40} fill="#ef4444" fillOpacity={0.06} />
            <ReferenceArea y1={40} y2={60} fill="#f59e0b" fillOpacity={0.05} />
            <ReferenceArea y1={60} y2={100} fill="#22c55e" fillOpacity={0.05} />

            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="weekStart"
              tickLine={false}
              axisLine={false}
              tickFormatter={weekLabel}
              tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#9ca3af" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#9ca3af" }}
            />

            <Tooltip content={<SentimentTooltip />} />

            {data.map((p) =>
              alertSet.has(p.weekStart) ? (
                <ReferenceLine
                  key={`al-${p.weekStart}`}
                  x={p.weekStart}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{ value: "⚠", position: "top", fill: "#ef4444", fontSize: 10 }}
                />
              ) : null,
            )}

            {!hideSephora ? (
              <Area
                dataKey="sephora"
                type="monotone"
                stroke="transparent"
                fill="url(#gradSephora)"
                dot={false}
                isAnimationActive
                animationDuration={500}
              />
            ) : null}
            {!hideNocibe ? (
              <Area
                dataKey="nocibe"
                type="monotone"
                stroke="transparent"
                fill="url(#gradNocibe)"
                dot={false}
                isAnimationActive
                animationDuration={500}
              />
            ) : null}

            {!hideSephora ? (
              <Line
                type="monotone"
                dataKey="sephora"
                name="Sephora"
                stroke="var(--comex-bordeaux)"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive
                animationDuration={500}
              />
            ) : null}
            {!hideNocibe ? (
              <Line
                type="monotone"
                dataKey="nocibe"
                name="Nocibé"
                stroke="var(--comex-blue)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 3"
                isAnimationActive
                animationDuration={500}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
        <button
          type="button"
          className={hideSephora ? "opacity-40 line-through" : ""}
          onClick={() => setHideSephora((x) => !x)}
        >
          <span style={{ color: "var(--comex-bordeaux)" }}>●</span> Sephora
        </button>
        <button
          type="button"
          className={hideNocibe ? "opacity-40 line-through" : ""}
          onClick={() => setHideNocibe((x) => !x)}
        >
          <span style={{ color: "var(--comex-blue)" }}>——</span> Nocibé
        </button>
      </div>

      {crisis ? (
        <p className="mt-2 text-center text-xs text-gray-500">
          Événement noté : période de tension sentiment (&lt;40) — semaine ISO {crisis}
        </p>
      ) : null}
    </div>
  );
}
