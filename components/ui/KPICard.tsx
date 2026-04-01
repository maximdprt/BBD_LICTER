"use client";

import type { ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
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
  /** Libellé trend (remplace le format par défaut). */
  trendLabelOverride?: string | null;
  /** Par défaut % ; `points` pour delta d’indice 0–100. */
  trendUnit?: "percent" | "points";
  icon?: ReactNode;
  sparkline?: SparkPoint[];
  sparkColor?: string;
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
  /** Badge seuils sentiment : &lt;40 rouge, 40–60 orange, &gt;60 vert */
  sentimentHealth?: SentimentHealthZone | null;
}>;

function healthBadge(zone: SentimentHealthZone) {
  const map = {
    critical: { label: "Critique", bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    moderate: { label: "Modéré", bg: "rgba(234,179,8,0.15)", color: "#ca8a04" },
    excellent: { label: "Excellent", bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
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
    const gradientClasses = "text-transparent bg-clip-text bg-gradient-to-r from-[var(--comex-bordeaux,#be185d)] to-[#c9a96e]";
    if (isValidElement(icon)) {
      const iconEl = icon as ReactElement<{ className?: string }>;
      return cloneElement(iconEl, {
        className: cn(iconEl.props.className, gradientClasses),
      });
    }
    return icon;
  })();

  const areaStroke = sparkColor ?? "var(--comex-bordeaux, #be185d)";
  const areaFill = "rgba(190, 24, 93, 0.08)";

  const sentimentProgress =
    title === "Indice de Sentiment" && typeof value === "number"
      ? Math.max(0, Math.min(100, value))
      : null;

  return (
    <motion.div
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -2,
              boxShadow: "0 8px 24px rgba(17,24,39,0.08), 0 2px 8px rgba(190,24,93,0.06)",
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("group transition-shadow duration-200", className)}
      style={{
        willChange: "transform",
        background: "var(--bg-card)",
        border: "1px solid var(--comex-border, #e5e7eb)",
        borderRadius: "16px",
        padding: "24px 24px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 h-[3px] w-14 rounded-br"
        style={{
          background: "linear-gradient(90deg, var(--comex-bordeaux,#be185d), #c9a96e)",
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)", marginBottom: 10 }}
          >
            {title}
          </div>

          {isLoading ? (
            <div>
              <div className="skeleton mb-4 h-3 w-20" />
              <div className="skeleton mb-3 h-12 w-28" />
            </div>
          ) : (
            <>
              <div
                className="flex flex-wrap items-start justify-between gap-3"
                style={{ marginBottom: title === "Indice de Sentiment" ? 8 : 4 }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {value == null ? (
                    <div className="text-[48px] font-bold leading-none text-gray-300">—</div>
                  ) : typeof value === "string" ? (
                    <div className="text-[48px] font-bold leading-none text-[var(--comex-text,#111827)] tabular-nums">
                      {value}
                    </div>
                  ) : (
                    <AnimatedCounter
                      value={value}
                      duration={prefersReducedMotion ? 0 : 500}
                      decimals={0}
                      suffix={valueSuffix}
                      className="font-mono text-[48px] font-bold leading-none text-[var(--comex-text,#111827)] tabular-nums"
                    />
                  )}

                  {sentimentHealth ? (
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        background: healthBadge(sentimentHealth).bg,
                        color: healthBadge(sentimentHealth).color,
                      }}
                    >
                      {healthBadge(sentimentHealth).label}
                    </span>
                  ) : null}
                </div>

                {badge ? (
                  (() => {
                    const tone =
                      normalizedTrend === "flat"
                        ? "neutral"
                        : badge.isPositive
                          ? "positive"
                          : "negative";
                    const wrapStyle =
                      tone === "positive"
                        ? { background: "rgba(34,197,94,0.12)", color: "#16a34a" }
                        : tone === "negative"
                          ? { background: "rgba(239,68,68,0.12)", color: "#ef4444" }
                          : { background: "var(--neutral-bg)", color: "var(--neutral)" };
                    return (
                      <div
                        className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                        style={wrapStyle}
                      >
                        <badge.Icon className="size-3.5" />
                        <span>{badge.label}</span>
                      </div>
                    );
                  })()
                ) : null}
              </div>

              {title === "Indice de Sentiment" && sentimentProgress != null ? (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${sentimentProgress}%`,
                      background: "linear-gradient(90deg, var(--comex-bordeaux,#be185d), #9f1239)",
                    }}
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    animate={{ width: `${sentimentProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>

        {iconElement ? (
          <div className="relative z-10 mt-0.5 flex size-10 items-center justify-center rounded-2xl">{iconElement}</div>
        ) : null}
      </div>

      {children ? <div className="mt-2">{children}</div> : null}

      <div className="mt-3 h-[44px]">
        {isLoading ? (
          <div className="skeleton h-2 w-full rounded" />
        ) : sparkline && sparkline.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={areaStroke}
                fill={areaFill}
                strokeWidth={2}
                dot={false}
                activeDot={false}
                isAnimationActive={!prefersReducedMotion}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-xl bg-gray-50" />
        )}
      </div>
    </motion.div>
  );
}
