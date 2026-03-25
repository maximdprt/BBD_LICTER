"use client";

import { format, getISOWeek, parseISO } from "date-fns";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import type { WeeklySentimentPoint } from "@/lib/types";

type Props = Readonly<{
  data: WeeklySentimentPoint[];
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
}>;

function BrandPill(props: { brand: "Sephora" | "Nocibé" }) {
  const isSephora = props.brand === "Sephora";
  const color = isSephora ? "#C4637A" : "#6B8FB5";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "DM Sans", color: "var(--text-primary)" }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color, display: "inline-block" }} />
      <span>{props.brand}</span>
    </span>
  );
}

function SentimentTooltip({
  active,
  payload,
  label,
}: Readonly<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}>) {
  if (!active || !payload?.length) return null;

  const seph = payload.find((p) => p.dataKey === "sephora");
  const noci = payload.find((p) => p.dataKey === "nocibe");

  return (
    <div
      style={{
        minWidth: 240,
        background: "#FFFFFF",
        border: "1px solid #EDE8E6",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        padding: "12px 16px",
        fontFamily: "DM Sans",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--text-primary)" }}>
        {label ? weekLabel(label) : ""}
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {seph ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <BrandPill brand="Sephora" />
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "DM Mono", color: "var(--text-primary)" }}>
              {typeof seph.value === "number" ? seph.value.toFixed(1) : "—"}
              <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text-muted)" }}>/100</span>
            </div>
          </div>
        ) : null}

        {noci ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <BrandPill brand="Nocibé" />
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "DM Mono", color: "var(--text-primary)" }}>
              {typeof noci.value === "number" ? noci.value.toFixed(1) : "—"}
              <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text-muted)" }}>/100</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SentimentLineChart({ data }: Props) {
  const last = [...data].reverse().find((p) => typeof p.sephora === "number" || typeof p.nocibe === "number");
  const deltaPts =
    last && typeof last.sephora === "number" && typeof last.nocibe === "number"
      ? Math.round((last.sephora - last.nocibe) * 10) / 10
      : null;

  const crisisPoint = data.find((p) => typeof p.sephora === "number" && p.sephora < 40);
  const crisisWeek =
    crisisPoint?.weekStart && /^\d{4}-\d{2}-\d{2}$/.test(crisisPoint.weekStart)
      ? getISOWeek(parseISO(crisisPoint.weekStart))
      : 12;

  return (
    <div className="w-full">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSephora" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4637A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#C4637A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNocibe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B8FB5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6B8FB5" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#EDE8E6" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="weekStart"
              tickLine={false}
              axisLine={false}
              tickFormatter={weekLabel}
              tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#A89BA1" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fontFamily: "DM Sans", fill: "#A89BA1" }}
            />

            <Tooltip content={<SentimentTooltip />} />

            <Area
              dataKey="sephora"
              type="monotone"
              stroke="transparent"
              strokeWidth={0}
              fill="url(#gradSephora)"
              dot={false}
              activeDot={false}
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-out"
            />
            <Area
              dataKey="nocibe"
              type="monotone"
              stroke="transparent"
              strokeWidth={0}
              fill="url(#gradNocibe)"
              dot={false}
              activeDot={false}
              isAnimationActive={true}
              animationDuration={1600}
              animationEasing="ease-out"
            />

            <Line
              type="monotone"
              dataKey="sephora"
              name="Sephora"
              stroke="#C4637A"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-out"
              animationBegin={100}
            />
            <Line
              type="monotone"
              dataKey="nocibe"
              name="Nocibé"
              stroke="#6B8FB5"
              strokeWidth={2}
              dot={false}
              strokeDasharray="6 3"
              isAnimationActive={true}
              animationDuration={1600}
              animationEasing="ease-out"
              animationBegin={100}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend custom bas du graphique */}
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            marginTop: 12,
            fontFamily: "DM Sans",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          <span>
            <span style={{ color: "#C4637A" }}>●</span> Sephora
          </span>
          <span>
            <span style={{ color: "#6B8FB5" }}>—— </span>Nocibé
          </span>
        </div>
      </div>

      <div
        className="relative mt-3 overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: 16,
          borderLeft: "6px solid var(--s-rose-deep)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="relative grid size-10 place-items-center overflow-hidden rounded-sm"
            style={{ border: "1px solid rgba(196,99,122,0.18)", background: "rgba(196,99,122,0.06)", color: "var(--s-rose-deep)" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[rgba(196,99,122,0.25)] blur-md opacity-60" />
            <Sparkles className="relative z-10 size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
              IA Insight
            </div>
            <div className="mt-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {`Sephora maintient son leadership (${
                deltaPts == null ? "+8" : `${deltaPts > 0 ? "+" : ""}${deltaPts}`
              }pts) grâce à l'accueil en magasin, malgré une baisse de satisfaction sur les délais de livraison en semaine ${crisisWeek}.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

