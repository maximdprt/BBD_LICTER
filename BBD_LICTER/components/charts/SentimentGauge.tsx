"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = Readonly<{
  value: number | null; // 0..100
  size?: number;
  className?: string;
}>;

export function SentimentGauge({ value, size = 220, className }: Props) {
  const gaugeValue = value == null ? 0 : Math.max(0, Math.min(100, value));
  const v = value == null ? null : gaugeValue;

  const radius = 86;
  const strokeWidth = 12;
  const center = 100;
  const circumference = 2 * Math.PI * radius;
  const visible = circumference * 0.75; // 270deg
  const dasharray = `${visible} ${circumference - visible}`;
  const dashoffset = visible * (1 - (gaugeValue / 100) || 0);

  const badge =
    v == null
      ? null
      : v < 40
        ? { bg: "var(--negative-bg)", color: "var(--negative)", text: "⚠ Critique" }
        : v <= 60
          ? { bg: "#FFDCC5", color: "#C4637A", text: "→ Moyen" }
          : v <= 80
            ? { bg: "#FFF3D6", color: "var(--s-gold)", text: "↑ Bon" }
            : { bg: "var(--positive-bg)", color: "var(--positive)", text: "✓ Excellent" };

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform: "rotate(135deg)" }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E05C6B" />
            <stop offset="40%" stopColor="#C4637A" />
            <stop offset="70%" stopColor="#C9A96E" />
            <stop offset="100%" stopColor="#3DB87A" />
          </linearGradient>
        </defs>

        {/* Arc de fond (¾ de cercle) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#EDE8E6"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dasharray}
        />

        {/* Arc animé */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dasharray}
          initial={{ strokeDashoffset: visible }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
          style={{ willChange: "stroke-dashoffset" }}
        />
      </svg>

      {/* Centre */}
      <div
        className="pointer-events-none absolute text-center"
        style={{ width: size, top: "50%", transform: "translateY(-56%)" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <AnimatedCounter
            value={v == null ? 0 : Math.round(v)}
            duration={1400}
            decimals={0}
            className="font-mono text-[42px] font-semibold text-[var(--text-primary)]"
          />
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)" }}>
            sur 100
          </div>
        </div>
      </div>

      {/* Badge qualitatif */}
      {badge ? (
        <div
          style={{
            marginTop: 10,
            borderRadius: 999,
            padding: "6px 14px",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 600,
            background: badge.bg,
            color: badge.color,
          }}
        >
          {badge.text}
        </div>
      ) : null}
    </div>
  );
}

