"use client";

import type { ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export type SparkPoint = Readonly<{
  value: number;
}>;

export type SentimentHealthZone = "critical" | "moderate" | "excellent";

type Props = Readonly<{
  title: string;
  value: number | string | null;
  valueSuffix?: string;
  trend?: "up" | "down" | "flat" | null;
  trendValue?: number | null;
  trendLabelOverride?: string | null;
  trendUnit?: "percent" | "points";
  icon?: ReactNode;
  sparkline?: SparkPoint[];
  sparkColor?: string;
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
  sentimentHealth?: SentimentHealthZone | null;
}>;

function healthBadge(zone: SentimentHealthZone) {
  const map = {
    critical: { label: "Critique", bg: "rgba(239,68,68,0.10)", color: "#ef4444" },
    moderate: { label: "Modéré", bg: "rgba(234,179,8,0.12)", color: "#ca8a04" },
    excellent: { label: "Excellent", bg: "rgba(34,197,94,0.10)", color: "#22c55e" },
  } as const;
  return map[zone];
}

export function KPICard({
  title,
  value,
  valueSuffix,
  trend,
  trendValue,
  trendLabelOverride,
  trendUnit = "percent",
  icon,
  sparkline,
  sparkColor,
  children,
  isLoading,
  className,
  sentimentHealth,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const normalizedTrend: "up" | "down" | "flat" | null =
    trend ??
    (trendValue == null
      ? null
      : Math.abs(trendValue) < 0.5
        ? "flat"
        : trendValue > 0
          ? "up"
          : "down");

  const badge =
    trendValue == null || normalizedTrend == null
      ? null
      : {
          label:
            trendLabelOverride ??
            (trendUnit === "points"
              ? `${trendValue > 0 ? "+" : ""}${Math.round(trendValue * 10) / 10} pts (7j)`
              : `${trendValue > 0 ? "+" : ""}${Math.round(trendValue * 10) / 10}%`),
          isPositive: trendValue > 0,
          Icon: normalizedTrend === "up" ? ArrowUpRight : normalizedTrend === "down" ? ArrowDownRight : Minus,
        };

  const iconElement = (() => {
    if (!icon) return null;
    if (isValidElement(icon)) {
      const iconEl = icon as ReactElement<{ className?: string }>;
      return cloneElement(iconEl, {
        className: cn(iconEl.props.className, "text-[#C9A96E]"),
      });
    }
    return icon;
  })();

  const areaStroke = sparkColor ?? "#C9A96E";
  const areaFill = sparkColor ? `${sparkColor}18` : "rgba(201,169,110,0.10)";

  const sentimentProgress =
    title === "Indice de Sentiment" && typeof value === "number"
      ? Math.max(0, Math.min(100, value))
      : null;

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -3, boxShadow: "0 12px 36px rgba(0,0,0,0.09), 0 2px 8px rgba(201,169,110,0.10)" }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("group flex h-full flex-col transition-shadow duration-200", className)}
      style={{
        willChange: "transform",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "24px 24px 20px",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Gold top accent bar */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, #C9A96E 0%, #D4B87A 50%, transparent 100%)" }}
      />

      {/* Subtle glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full opacity-[0.05]"
        style={{ background: "#C9A96E", filter: "blur(32px)" }}
      />

      <div className="relative flex items-start justify-between gap-4" style={{ minHeight: 80 }}>
        <div className="min-w-0">
          <div
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-muted)", marginBottom: 10 }}
          >
            {title}
          </div>

          {isLoading ? (
            <div>
              <div className="skeleton mb-4 h-3 w-20 rounded" />
              <div className="skeleton mb-3 h-10 w-28 rounded" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start gap-3" style={{ marginBottom: sentimentProgress != null ? 8 : 4 }}>
                <div className="flex flex-wrap items-center gap-2">
                  {value == null ? (
                    <div className="text-[44px] font-bold leading-none text-gray-200">—</div>
                  ) : typeof value === "string" ? (
                    <div className="text-[44px] font-bold leading-none text-gray-900 tabular-nums">{value}</div>
                  ) : (
                    <AnimatedCounter
                      value={value}
                      duration={prefersReducedMotion ? 0 : 600}
                      decimals={0}
                      suffix={valueSuffix}
                      className="font-mono text-[44px] font-bold leading-none text-gray-900 tabular-nums"
                    />
                  )}

                  {sentimentHealth && (
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        background: healthBadge(sentimentHealth).bg,
                        color: healthBadge(sentimentHealth).color,
                      }}
                    >
                      {healthBadge(sentimentHealth).label}
                    </span>
                  )}
                </div>

                {badge && (() => {
                  const tone = normalizedTrend === "flat" ? "neutral" : badge.isPositive ? "positive" : "negative";
                  const wrapStyle =
                    tone === "positive" ? { background: "rgba(34,197,94,0.10)", color: "#16a34a" }
                    : tone === "negative" ? { background: "rgba(239,68,68,0.10)", color: "#ef4444" }
                    : { background: "rgba(156,163,175,0.12)", color: "#9ca3af" };
                  return (
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                      style={wrapStyle}
                    >
                      <badge.Icon className="size-3.5" />
                      <span>{badge.label}</span>
                    </div>
                  );
                })()}
              </div>

              {sentimentProgress != null && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ width: `${sentimentProgress}%`, background: "linear-gradient(90deg, #C9A96E, #D4B87A)" }}
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    animate={{ width: `${sentimentProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {iconElement && (
          <div className="relative z-10 mt-0.5 grid size-11 shrink-0 place-items-center rounded-xl"
            style={{ background: "rgba(201,169,110,0.10)", border: "1px solid rgba(201,169,110,0.20)" }}
          >
            {iconElement}
          </div>
        )}
      </div>

      <div className="mt-2 flex-1" style={{ minHeight: 100 }}>
        {children ? <div className="h-full">{children}</div> : <div className="h-full" />}
      </div>

      {/* Sparkline */}
      <div className="mt-3" style={{ height: 48 }}>
        {isLoading ? (
          <div className="skeleton h-2 w-full rounded" />
        ) : sparkline && sparkline.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={30}>
            <AreaChart data={sparkline} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id="kpiSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaStroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={areaStroke} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={areaStroke}
                fill="url(#kpiSparkGrad)"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }} />
        )}
      </div>
    </motion.div>
  );
}
