"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = Readonly<{
  value: number | null; // 0..100
  size?: number;
  className?: string;
}>;

export function SentimentGauge({ value, size = 220, className }: Props) {
  const gaugeValue = value == null ? 0 : Math.max(0, Math.min(100, value));
  const gradientId = useId();
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (gaugeValue / 100) * circumference * 0.75;

  const strokeBase = value == null ? "#0000001f" : gaugeValue < 45 ? "#E05C6B" : "#000000";

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <defs>
          <linearGradient id={`gaugeGradient-${gradientId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#FDC9D3" stopOpacity={1} />
          </linearGradient>
        </defs>

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke={strokeBase}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.35}
        />

        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke={`url(#gaugeGradient-${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
          style={{ willChange: "stroke-dashoffset" }}
        />
      </svg>

      <div className="pointer-events-none absolute text-center">
        <div className="font-display text-xs font-semibold text-text-secondary">Indice</div>
        <div className="mt-1 font-mono text-4xl font-semibold tracking-tight text-foreground">
          {value == null ? "—" : Math.round(gaugeValue)}
        </div>
        <div className="mt-1 text-xs text-text-secondary">sur 100</div>
      </div>
    </div>
  );
}

