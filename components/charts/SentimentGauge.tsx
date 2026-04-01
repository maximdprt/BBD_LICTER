"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = Readonly<{
  value: number | null;
  competitorValue?: number | null;
  /** Sparkline 30j pour Sephora (valeurs 0-100) */
  sparkline?: { value: number }[];
  className?: string;
  /** Ignoré — conservé pour rétrocompat avec les pages existantes */
  size?: number;
}>;

function zoneLabel(v: number): { label: string; color: string; bg: string } {
  if (v < 40) return { label: "Critique", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
  if (v < 60) return { label: "Modéré", color: "#ca8a04", bg: "rgba(234,179,8,0.1)" };
  if (v < 75) return { label: "Bon", color: "#16a34a", bg: "rgba(34,197,94,0.1)" };
  return { label: "Excellent", color: "#15803d", bg: "rgba(34,197,94,0.14)" };
}

function ScoreBlock({
  label,
  value,
  isMain,
  delta,
}: Readonly<{
  label: string;
  value: number | null;
  isMain?: boolean;
  delta?: number | null;
}>) {
  const zone = value != null ? zoneLabel(value) : null;
  const score = value != null ? Math.round(value) : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl px-8 py-6 transition-all",
        isMain ? "flex-1" : "flex-1 opacity-80",
      )}
      style={{
        background: isMain ? "var(--bg-card)" : "#f9fafb",
        border: `1px solid ${isMain ? "var(--comex-border)" : "#e5e7eb"}`,
        boxShadow: isMain ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div
        className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: isMain ? "var(--comex-bordeaux)" : "var(--comex-blue)" }}
      >
        {label}
      </div>

      {score == null ? (
        <div className="font-mono text-5xl font-bold text-gray-300">—</div>
      ) : (
        <AnimatedCounter
          value={score}
          duration={600}
          decimals={0}
          className={cn(
            "font-mono font-bold leading-none tabular-nums",
            isMain ? "text-[56px] text-[var(--comex-text,#111827)]" : "text-5xl text-[var(--comex-text,#111827)]",
          )}
        />
      )}

      <div className="mt-1 text-xs text-gray-400">/ 100</div>

      {zone ? (
        <span
          className="mt-3 rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ background: zone.bg, color: zone.color }}
        >
          {zone.label}
        </span>
      ) : null}

      {/* Barre de progression visuelle */}
      {score != null ? (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isMain
                ? "linear-gradient(90deg, var(--comex-bordeaux,#be185d), #9f1239)"
                : "linear-gradient(90deg, var(--comex-blue,#3b82f6), #1d4ed8)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      ) : null}

      {delta != null ? (
        <div
          className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={
            delta > 0
              ? { background: "rgba(34,197,94,0.12)", color: "#16a34a" }
              : delta < 0
                ? { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
                : { background: "#f3f4f6", color: "#6b7280" }
          }
        >
          {delta > 0 ? <ArrowUpRight className="size-3" /> : delta < 0 ? <ArrowDownRight className="size-3" /> : <Minus className="size-3" />}
          {delta > 0 ? "+" : ""}
          {delta.toFixed(0)} pts vs Nocibé
        </div>
      ) : null}
    </div>
  );
}

export function SentimentGauge({ value, competitorValue, className }: Props) {
  const sephScore = value != null ? Math.round(Math.max(0, Math.min(100, value))) : null;
  const nociScore = competitorValue != null ? Math.round(Math.max(0, Math.min(100, competitorValue))) : null;
  const delta = sephScore != null && nociScore != null ? sephScore - nociScore : null;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ScoreBlock
          label="Sephora"
          value={sephScore}
          isMain
          delta={delta}
        />
        <ScoreBlock
          label="Nocibé"
          value={nociScore}
          isMain={false}
        />
      </div>

      {delta != null && (
        <p className="mt-3 text-center text-xs text-gray-500">
          {delta > 0
            ? `Avantage Sephora : +${delta} pts`
            : delta < 0
              ? `Avantage Nocibé : +${Math.abs(delta)} pts`
              : "Égalité parfaite"}
        </p>
      )}
    </div>
  );
}
