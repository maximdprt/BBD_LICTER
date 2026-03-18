"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = Readonly<{
  title: string;
  value: number | null;
  valueSuffix?: string;
  deltaPct?: number | null;
  icon?: ReactNode;
  children?: ReactNode;
  isLoading?: boolean;
  className?: string;
}>;

export function KPICard({
  title,
  value,
  valueSuffix,
  deltaPct,
  icon,
  children,
  isLoading,
  className,
}: Props) {
  const delta =
    deltaPct == null
      ? null
      : {
          sign: deltaPct > 0 ? "+" : "",
          label: `${deltaPct > 0 ? "+" : ""}${Math.round(deltaPct * 10) / 10}%`,
          tone:
            Math.abs(deltaPct) < 0.5
              ? "text-text-secondary"
              : deltaPct > 0
                ? "text-emerald-600"
                : "text-rose-600",
        };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wide text-text-secondary">
            {title}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded-xl bg-black/6" />
            ) : value == null ? (
              <div className="font-mono text-2xl font-semibold text-text-secondary">
                —
              </div>
            ) : (
              <AnimatedCounter
                value={value}
                durationMs={2000}
                decimals={0}
                suffix={valueSuffix}
                className="font-mono text-3xl font-semibold tracking-tight text-foreground"
              />
            )}

            {delta && !isLoading ? (
              <span className={cn("text-xs font-semibold", delta.tone)}>
                {delta.label}
              </span>
            ) : null}
          </div>
        </div>

        {icon ? (
          <div className="grid size-10 place-items-center rounded-2xl bg-black/3 text-accent">
            {icon}
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-white to-transparent" />
    </motion.div>
  );
}

