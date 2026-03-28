"use client";

import type { ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { useId } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export type SparkPoint = Readonly<{
  value: number;
}>;

type Props = Readonly<{
  title: string;
  value: number | string | null;
  valueSuffix?: string;
  trend?: "up" | "down" | "flat" | null;
  trendValue?: number | null;
  icon?: ReactNode;
  sparkline?: SparkPoint[];
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
}>;

export function KPICard({
  title,
  value,
  valueSuffix,
  trend,
  trendValue,
  icon,
  sparkline,
  children,
  isLoading,
  className,
}: Props) {
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
          label: `${trendValue > 0 ? "+" : ""}${Math.round(trendValue * 10) / 10}%`,
          isPositive: trendValue > 0,
          Icon: normalizedTrend === "up" ? ArrowUpRight : normalizedTrend === "down" ? ArrowDownRight : Minus,
        };

  // Icône : dégradé rose -> or (Lucide utilise `currentColor`).
  const iconElement = (() => {
    if (!icon) return null;
    const gradientClasses = "text-transparent bg-clip-text bg-gradient-to-r from-[#C4637A] to-[#C9A96E]";
    if (isValidElement(icon)) {
      const iconEl = icon as ReactElement<{ className?: string }>;
      return cloneElement(iconEl, {
        className: cn(iconEl.props.className, gradientClasses),
      });
    }
    return icon;
  })();

  useId(); // keep useId call to avoid unused hook churn during refactors

  // Mini-sparkline : Sephora rose en trait + remplissage très léger.
  const area = badge
    ? { stroke: "#C4637A", fill: "rgba(196, 99, 122, 0.08)" }
    : { stroke: "#C4637A", fill: "rgba(196, 99, 122, 0.08)" };

  const sentimentProgress =
    title === "Indice de Sentiment" && typeof value === "number"
      ? Math.max(0, Math.min(100, value))
      : null;

  return (
    <motion.div
      whileHover={{
        y: -3,
        boxShadow: "0 12px 40px rgba(196, 99, 122, 0.14)",
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("group transition-all duration-200", className)}
      style={{
        willChange: "transform",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "28px 28px 24px",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 h-[3px] w-12"
        style={{
          background: "linear-gradient(90deg, var(--s-rose-deep), var(--s-gold))",
          borderRadius: "0 0 4px 0",
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--text-muted)", marginBottom: 12 }}
          >
            {title}
          </div>

          {isLoading ? (
            <div>
              <div className="skeleton h-3 w-20 mb-4" />
              <div className="skeleton h-12 w-28 mb-3" />
            </div>
          ) : (
            <>
              <div
                className="flex items-start justify-between gap-4"
                style={{ marginBottom: title === "Indice de Sentiment" ? 10 : 6 }}
              >
                <div>
                  {value == null ? (
                    <div className="text-[52px] font-semibold leading-none text-[rgba(20,7,16,0.3)]">—</div>
                  ) : typeof value === "string" ? (
                    <div className="text-[52px] font-semibold leading-none text-[var(--text-primary)] tabular-nums">
                      {value}
                    </div>
                  ) : (
                    <AnimatedCounter
                      value={value}
                      duration={1600}
                      decimals={0}
                      suffix={valueSuffix}
                      className="font-mono text-[52px] font-medium leading-none text-[var(--text-primary)] tabular-nums"
                    />
                  )}

                  {title === "Indice de Sentiment" ? (
                    <div className="mt-3">
                      {isLoading || sentimentProgress == null ? (
                        <div className="skeleton h-[3px] w-full rounded-full" />
                      ) : (
                        <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(20,7,16,0.04)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${sentimentProgress}%`,
                              background: "linear-gradient(90deg, var(--s-rose-deep), var(--s-gold))",
                            }}
                          />
                        </div>
                      )}
                    </div>
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
                        ? { background: "var(--positive-bg)", color: "var(--positive)" }
                        : tone === "negative"
                          ? { background: "var(--negative-bg)", color: "var(--negative)" }
                          : { background: "var(--neutral-bg)", color: "var(--neutral)" };
                    return (
                      <div
                        className="inline-flex items-center gap-3 rounded-full px-[10px] py-[3px] text-[12px] font-semibold"
                        style={wrapStyle}
                      >
                        <badge.Icon className="size-3.5" />
                        <span>{badge.label}</span>
                      </div>
                    );
                  })()
                ) : null}
              </div>
            </>
          )}
        </div>

        {iconElement ? (
          <div className="relative z-10 mt-1 flex size-10 items-center justify-center rounded-2xl">
            {iconElement}
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}

      <div className="mt-4 h-[48px]">
        {isLoading ? (
          <div className="skeleton h-2 w-full" />
        ) : sparkline && sparkline.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={area.stroke}
                fill={area.fill}
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-2xl" style={{ background: "var(--bg-secondary)" }} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-white to-transparent" />
    </motion.div>
  );
}

