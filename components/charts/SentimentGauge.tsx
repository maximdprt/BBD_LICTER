"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = Readonly<{
  value: number | null;
  competitorValue?: number | null;
  sparkline?: { value: number }[];
  trend7d?: { deltaPoints: number | null; direction: "up" | "down" | "flat" } | null;
  className?: string;
  size?: number;
  href?: string;
}>;

function zoneLabel(v: number): { label: string; color: string; bg: string } {
  if (v < 40) return { label: "Critique", color: "#E24B4A", bg: "rgba(226,75,74,0.1)" };
  if (v < 70) return { label: "Modéré", color: "#EF9F27", bg: "rgba(239,159,39,0.12)" };
  return { label: "Excellent", color: "#639922", bg: "rgba(99,153,34,0.14)" };
}

function polarToCartesian(center: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
}

function MiniSparkline({ data }: { data: { value: number }[] }) {
  if (!data.length) return null;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const step = w / (vals.length - 1 || 1);
  const points = vals.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  const trend = vals.length > 1 ? vals[vals.length - 1]! - vals[0]! : 0;
  const color = trend > 1 ? "#639922" : trend < -1 ? "#E24B4A" : "#C9A96E";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={vals.length > 1 ? (vals.length - 1) * step : 0} cy={h - ((vals[vals.length - 1]! - min) / range) * h} r="3" fill={color} />
    </svg>
  );
}

function GaugeDial({ value, competitorValue }: Readonly<{ value: number; competitorValue: number | null }>) {
  const size = 320;
  const center = size / 2;
  const radius = 120;
  const start = 135;
  const end = 405;
  const zone = zoneLabel(value);
  const valueAngle = start + (value / 100) * (end - start);
  const nociAngle = competitorValue != null ? start + (competitorValue / 100) * (end - start) : null;

  const drawArc = (a0: number, a1: number, color: string) => {
    const p0 = polarToCartesian(center, radius, a0);
    const p1 = polarToCartesian(center, radius, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return <path d={`M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${large} 1 ${p1.x} ${p1.y}`} stroke={color} strokeWidth="18" fill="none" strokeLinecap="round" />;
  };

  const needle = polarToCartesian(center, radius - 20, valueAngle);
  const nociMarker = nociAngle != null ? polarToCartesian(center, radius, nociAngle) : null;

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
        {drawArc(start, 243, "#E24B4A")}
        {drawArc(243, 324, "#EF9F27")}
        {drawArc(324, end, "#639922")}
        {nociMarker ? (
          <>
            <circle cx={nociMarker.x} cy={nociMarker.y} r="6" fill="#00A651" stroke="white" strokeWidth="2" />
            <text x={nociMarker.x + 12} y={nociMarker.y - 8} fontSize="11" fill="#00A651" fontWeight="700">
              Nocibé {competitorValue}
            </text>
          </>
        ) : null}
        <motion.line
          x1={center}
          y1={center}
          x2={needle.x}
          y2={needle.y}
          stroke="#1f2937"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ rotate: -120 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
        <circle cx={center} cy={center} r="9" fill="#111827" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter
          value={value}
          duration={1200}
          decimals={0}
          className="font-mono text-[64px] font-bold leading-none text-gray-900"
        />
        <span
          className="mt-1 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: zone.bg, color: zone.color }}
        >
          {zone.label}
        </span>
      </div>
    </div>
  );
}

export function SentimentGauge({ value, competitorValue, sparkline, trend7d, className, href = "/reputation" }: Props) {
  const sephScore = value != null ? Math.round(Math.max(0, Math.min(100, value))) : null;
  const nociScore = competitorValue != null ? Math.round(Math.max(0, Math.min(100, competitorValue))) : null;
  const delta = sephScore != null && nociScore != null ? sephScore - nociScore : null;

  const delta7d = trend7d?.deltaPoints ?? null;
  const dir7d = trend7d?.direction ?? "flat";

  const delta30d = (() => {
    if (!sparkline || sparkline.length < 2) return null;
    return Math.round((sparkline[sparkline.length - 1]!.value - sparkline[0]!.value) * 10) / 10;
  })();

  if (sephScore == null) {
    return <div className={cn("text-center text-sm text-gray-500", className)}>Pas de score disponible.</div>;
  }

  const Content = (
    <div className={cn("w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm", className)}>
      <GaugeDial value={sephScore} competitorValue={nociScore} />

      {delta != null ? (
        <div className="mt-2 flex items-center justify-center">
          <div
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={
              delta > 0
                ? { background: "rgba(34,197,94,0.12)", color: "#16a34a" }
                : delta < 0
                  ? { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
                  : { background: "#f3f4f6", color: "#6b7280" }
            }
          >
            {delta > 0 ? <ArrowUpRight className="size-3" /> : delta < 0 ? <ArrowDownRight className="size-3" /> : <Minus className="size-3" />}
            {delta > 0 ? "+" : ""}
            {delta.toFixed(0)} pts vs Nocibé
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">7 jours</span>
          {delta7d != null ? (
            <div className="flex items-center gap-1">
              {dir7d === "up" ? (
                <TrendingUp className="size-3.5 text-green-600" />
              ) : dir7d === "down" ? (
                <TrendingDown className="size-3.5 text-red-500" />
              ) : (
                <Minus className="size-3.5 text-gray-400" />
              )}
              <span
                className="font-mono text-sm font-bold"
                style={{ color: dir7d === "up" ? "#16a34a" : dir7d === "down" ? "#ef4444" : "#6b7280" }}
              >
                {delta7d > 0 ? "+" : ""}{delta7d.toFixed(1)} pts
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">30 jours</span>
          {sparkline && sparkline.length > 1 ? (
            <div className="flex flex-col items-center gap-0.5">
              <MiniSparkline data={sparkline} />
              {delta30d != null && (
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: delta30d > 0 ? "#16a34a" : delta30d < 0 ? "#ef4444" : "#6b7280" }}
                >
                  {delta30d > 0 ? "+" : ""}{delta30d} pts
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Link href={href} className="block transition-transform hover:-translate-y-0.5">
      {Content}
    </Link>
  );
}
