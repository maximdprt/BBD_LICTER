"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = Readonly<{
  value: number | null;
  /** Comparaison Nocibé (indice 0–100). */
  competitorValue?: number | null;
  size?: number;
  className?: string;
}>;

export function SentimentGauge({ value, competitorValue, size = 260, className }: Props) {
  const gaugeValue = value == null ? 0 : Math.max(0, Math.min(100, value));
  const v = value == null ? null : gaugeValue;

  const radius = 86;
  const strokeWidth = 10;
  const center = 100;
  const circumference = 2 * Math.PI * radius;
  const visible = circumference * 0.75;
  const dasharray = `${visible} ${circumference - visible}`;
  const dashoffset = visible * (1 - gaugeValue / 100);

  const zone = (from: number, to: number, color: string) => {
    const len = ((to - from) / 100) * visible;
    const off = visible * (1 - to / 100);
    return (
      <circle
        cx={center}
        cy={center}
        r={radius - 16}
        fill="transparent"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${len} ${circumference - len}`}
        strokeDashoffset={off}
        opacity={0.35}
      />
    );
  };

  const label =
    v == null
      ? null
      : v < 40
        ? "Critique"
        : v < 70
          ? "Modéré"
          : "Excellent";

  const adv =
    v != null && competitorValue != null
      ? v > competitorValue
        ? ("sephora" as const)
        : v < competitorValue
          ? ("nocibe" as const)
          : ("tie" as const)
      : null;

  return (
    <div className={cn("relative flex flex-col items-center", className)} style={{ width: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform: "rotate(135deg)" }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dasharray}
        />
        {zone(0, 40, "#ef4444")}
        {zone(40, 70, "#f59e0b")}
        {zone(70, 100, "#22c55e")}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="var(--comex-bordeaux, #be185d)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dasharray}
          initial={{ strokeDashoffset: visible }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>

      <div
        className="pointer-events-none absolute text-center"
        style={{ width: size, top: "50%", transform: "translateY(-58%)" }}
      >
        <AnimatedCounter
          value={v == null ? 0 : Math.round(v)}
          duration={500}
          decimals={0}
          className="font-mono text-[42px] font-bold text-[var(--comex-text)]"
        />
        <div className="text-xs text-gray-500">sur 100</div>
        {label ? (
          <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Critique | Modéré | Excellent → <span className="text-[var(--comex-bordeaux)]">{label}</span>
          </div>
        ) : null}
      </div>

      {competitorValue != null ? (
        <div className="mt-10 flex items-center gap-2 text-sm text-gray-600">
          <span>
            Nocibé : <span className="font-mono font-semibold">{Math.round(competitorValue)}</span>
          </span>
          {adv === "sephora" ? (
            <span className="inline-flex items-center gap-1 text-green-600">
              <ArrowUpRight className="size-4" /> avantage Sephora
            </span>
          ) : adv === "nocibe" ? (
            <span className="inline-flex items-center gap-1 text-blue-600">
              <ArrowDownRight className="size-4" /> avantage Nocibé
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
