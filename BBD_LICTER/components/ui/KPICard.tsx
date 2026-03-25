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

  // Icône : dégradé discret noir -> rose clair (Lucide utilise `currentColor`).
  const iconElement = (() => {
    if (!icon) return null;
    const gradientClasses = "text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#FDC9D3]";
    if (isValidElement(icon)) {
      return cloneElement(icon as ReactElement, {
        className: cn((icon as ReactElement).props.className, gradientClasses),
      });
    }
    return icon;
  })();

  const gradientId = useId();
  const fillId = `kpiFill-${gradientId}`;
  const area = badge
    ? {
        stroke: badge.isPositive ? "#000000" : "#000000",
        fill: `url(#${fillId})`,
      }
    : { stroke: "#000000", fill: `url(#${fillId})` };

  const sentimentProgress =
    title === "Indice de Sentiment" && typeof value === "number"
      ? Math.max(0, Math.min(100, value))
      : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-[0.5px] border-[#E6E6E6] bg-white p-5 transition-all duration-300 hover:border-[#FDC9D3]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] sephora-stripes" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-black">{title}</div>
          <div className="mt-2">
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded-xl bg-black/6" />
            ) : value == null ? (
              <div className="text-2xl font-semibold text-black/30">—</div>
            ) : typeof value === "string" ? (
              <div className="text-3xl font-semibold tracking-tight text-black tabular-nums">{value}</div>
            ) : (
              <AnimatedCounter
                value={value}
                durationMs={2000}
                decimals={0}
                suffix={valueSuffix}
                className="text-3xl font-semibold tracking-tight text-black tabular-nums"
              />
            )}

            {title === "Indice de Sentiment" ? (
              <div className="mt-2">
                {isLoading || sentimentProgress == null ? (
                  <div className="h-[3px] w-full animate-pulse rounded-full bg-black/10" />
                ) : (
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#000000] to-[#FDC9D3]"
                      style={{ width: `${sentimentProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : null}

            {badge && !isLoading ? (
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#FDC9D3]/20 px-2 py-1 text-xs font-semibold">
                <badge.Icon
                  className={cn(
                    "size-3.5",
                    badge.isPositive ? "text-[#C94A7A]" : "text-black/70",
                  )}
                />
                <span className={badge.isPositive ? "text-[#C94A7A]" : "text-black/70"}>{badge.label}</span>
              </div>
            ) : null}
          </div>
        </div>

        {iconElement ? (
          <div className="relative grid size-10 place-items-center rounded-2xl border border-black/10 bg-white text-black transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(253,201,211,0.55)]">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[#FDC9D3]/30 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">{iconElement}</div>
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}

      <div className="mt-4 h-14">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-2xl bg-black/6" />
        ) : sparkline && sparkline.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000000" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={1} />
                </linearGradient>
              </defs>
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
          <div className="h-full w-full rounded-2xl bg-black/5" />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-white to-transparent" />
    </motion.div>
  );
}

