"use client";

import type { ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export type SparkPoint = Readonly<{ value: number }>;
export type SentimentHealthZone = "critical" | "moderate" | "excellent";

type Props = Readonly<{
  title: string;
  value: number | string | null;
  valueSuffix?: string;
  decimals?: number;
  trend?: "up" | "down" | "flat" | null;
  trendValue?: number | null;
  trendLabelOverride?: string | null;
  trendUnit?: "percent" | "points";
  periodLabel?: string;
  icon?: ReactNode;
  sparkline?: SparkPoint[];
  sparkColor?: string;
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
  sentimentHealth?: SentimentHealthZone | null;
}>;

const HEALTH = {
  critical: { label: "Critique",  bg: "rgba(239,68,68,0.10)",   color: "#ef4444", bar: "#ef4444" },
  moderate: { label: "Modéré",    bg: "rgba(234,179,8,0.12)",   color: "#ca8a04", bar: "#f59e0b" },
  excellent:{ label: "Excellent", bg: "rgba(34,197,94,0.10)",   color: "#22c55e", bar: "#22c55e" },
} as const;

function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-100">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}

export function KPICard({
  title,
  value,
  valueSuffix = "",
  decimals = 0,
  trend,
  trendValue,
  trendLabelOverride,
  trendUnit = "percent",
  periodLabel,
  icon,
  sparkline,
  sparkColor,
  children,
  isLoading,
  className,
  sentimentHealth,
}: Props) {
  const reduce = useReducedMotion();

  const normalizedTrend: "up" | "down" | "flat" | null =
    trend ??
    (trendValue == null ? null : Math.abs(trendValue) < 0.5 ? "flat" : trendValue > 0 ? "up" : "down");

  const trendLabel = (() => {
    if (trendLabelOverride) return trendLabelOverride;
    if (trendValue == null) return null;
    const sign = trendValue > 0 ? "+" : "";
    const rounded = Math.round(Math.abs(trendValue) * 10) / 10;
    return trendUnit === "points" ? `${sign}${rounded} pts` : `${sign}${rounded}%`;
  })();

  const trendStyle = normalizedTrend === "up"
    ? { bg: "rgba(34,197,94,0.10)", color: "#16a34a" }
    : normalizedTrend === "down"
    ? { bg: "rgba(239,68,68,0.10)", color: "#ef4444" }
    : { bg: "rgba(156,163,175,0.10)", color: "#9ca3af" };

  const TrendIcon = normalizedTrend === "up" ? ArrowUpRight : normalizedTrend === "down" ? ArrowDownRight : Minus;

  const iconEl = (() => {
    if (!icon || !isValidElement(icon)) return icon;
    const el = icon as ReactElement<{ className?: string }>;
    return cloneElement(el, { className: cn(el.props.className, "text-[#C9A96E]") });
  })();

  const areaStroke = sparkColor ?? "#C9A96E";
  const sentimentPct = sentimentHealth && typeof value === "number" ? Math.max(0, Math.min(100, value)) : null;

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -3, boxShadow: "0 16px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(201,169,110,0.08)" }}
      whileTap={reduce ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn("flex flex-col overflow-hidden", className)}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "22px 22px 18px",
        boxShadow: "var(--shadow-card)",
        position: "relative",
        willChange: "transform",
      }}
    >
      {/* Top accent */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-[20px]"
        style={{ background: "linear-gradient(90deg, #C9A96E 0%, #D4B87A 45%, transparent 100%)" }}
      />

      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full opacity-[0.04]"
        style={{ background: "#C9A96E", filter: "blur(28px)" }}
      />

      {/* Header row */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{title}</div>
          {periodLabel && (
            <div className="mt-0.5 text-[11px] text-gray-400">{periodLabel}</div>
          )}
        </div>
        {iconEl && (
          <div
            className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl"
            style={{ background: "rgba(201,169,110,0.10)", border: "1px solid rgba(201,169,110,0.18)" }}
          >
            {iconEl}
          </div>
        )}
      </div>

      {/* Value block */}
      <div className="relative mt-4">
        {isLoading ? (
          <div>
            <div className="skeleton mb-2 h-3 w-16 rounded" />
            <div className="skeleton h-12 w-32 rounded" />
          </div>
        ) : (
          <>
            {/* Main value */}
            <div className="flex flex-wrap items-baseline gap-2">
              {value == null ? (
                <span className="font-mono text-[42px] font-bold leading-none text-gray-200">—</span>
              ) : typeof value === "string" ? (
                <span className="font-mono text-[42px] font-bold leading-none text-gray-900">{value}</span>
              ) : (
                <AnimatedCounter
                  value={value}
                  duration={reduce ? 0 : 700}
                  decimals={decimals}
                  suffix={valueSuffix}
                  className="font-mono text-[42px] font-bold leading-none text-gray-900 tabular-nums"
                />
              )}
              {sentimentHealth && (
                <span
                  className="mb-0.5 self-end rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{ background: HEALTH[sentimentHealth].bg, color: HEALTH[sentimentHealth].color }}
                >
                  {HEALTH[sentimentHealth].label}
                </span>
              )}
            </div>

            {/* Sentiment progress bar */}
            {sentimentPct != null && (
              <MiniBar value={sentimentPct} color={HEALTH[sentimentHealth!].bar} />
            )}

            {/* Trend badge */}
            {(trendLabel || trendLabelOverride) && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: trendStyle.bg, color: trendStyle.color }}>
                <TrendIcon className="size-3" />
                <span>{trendLabel}</span>
                {trendUnit === "points" && !trendLabelOverride && (
                  <span className="opacity-60">/ 7j</span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Children (ex: gauge) */}
      {children && (
        <div className="mt-4 flex-1">{children}</div>
      )}

      {/* Sparkline */}
      <div className="mt-4" style={{ height: 52 }}>
        {isLoading ? (
          <div className="skeleton h-2 w-full rounded" />
        ) : sparkline && sparkline.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={30}>
            <AreaChart data={sparkline} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id={`spark-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={areaStroke} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={areaStroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={areaStroke}
                fill={`url(#spark-${title.replace(/\s/g, "")})`}
                strokeWidth={2}
                dot={false}
                activeDot={false}
                isAnimationActive={!reduce}
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }} />
        )}
      </div>
    </motion.div>
  );
}
