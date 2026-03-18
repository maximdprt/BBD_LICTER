"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = Readonly<{
  value: number | null; // 0..100
  size?: number;
  className?: string;
}>;

export function SentimentGauge({ value, size = 220, className }: Props) {
  const v = value == null ? 0 : Math.max(0, Math.min(100, value));
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = (v / 100) * c;

  const tone =
    value == null
      ? "stroke-gray-200"
      : v >= 65
        ? "stroke-emerald-500"
        : v >= 45
          ? "stroke-amber-500"
          : "stroke-rose-500";

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          stroke="rgba(15,15,26,0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          className={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      <div className="pointer-events-none absolute text-center">
        <div className="font-display text-xs font-semibold text-text-secondary">Indice</div>
        <div className="mt-1 font-mono text-4xl font-semibold tracking-tight text-foreground">
          {value == null ? "—" : v}
        </div>
        <div className="mt-1 text-xs text-text-secondary">sur 100</div>
      </div>
    </div>
  );
}

