"use client";

import { motion } from "framer-motion";

type RowComparison = Readonly<{
  source: string;
  sephora: number;
  nocibe: number;
  sephoraCount?: number;
  nocibeCount?: number;
}>;

/** Rétrocompat : ancienne interface (Sephora only) */
type RowLegacy = Readonly<{ source: string; score: number; count: number }>;

type Props =
  | Readonly<{ data: RowComparison[]; mode?: "comparison" }>
  | Readonly<{ data: RowLegacy[]; mode: "legacy" }>;

function scoreColor(score: number): string {
  if (score < 40) return "#ef4444";
  if (score < 50) return "#f97316";
  if (score < 60) return "#f59e0b";
  return "#22c55e";
}

function ScoreBar({
  score,
  color,
  brand,
  animate,
}: Readonly<{ score: number; color: string; brand: "sephora" | "nocibe"; animate: boolean }>) {
  const isSeph = brand === "sephora";
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-[52px] shrink-0 text-right font-mono text-[11px] font-semibold"
        style={{ color: isSeph ? "var(--comex-bordeaux)" : "var(--comex-blue)" }}
      >
        {score}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ background: color }}
          initial={animate ? { width: 0 } : { width: `${score}%` }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay: animate ? 0.05 : 0 }}
        />
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: Readonly<{ delta: number }>) {
  if (Math.abs(delta) < 1) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
        Égalité
      </span>
    );
  }
  const winner = delta > 0 ? "Sephora" : "Nocibé";
  const color = delta > 0 ? "var(--comex-bordeaux)" : "var(--comex-blue)";
  const bg = delta > 0 ? "rgba(190,24,93,0.08)" : "rgba(59,130,246,0.1)";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: bg, color }}
    >
      {winner} +{Math.abs(delta)} pts
    </span>
  );
}

export function SentimentBySourceBars(props: Props) {
  // Normalise vers le format comparison
  const rows: RowComparison[] = props.mode === "legacy"
    ? (props.data as RowLegacy[]).map((r) => ({ source: r.source, sephora: r.score, nocibe: 50, sephoraCount: r.count, nocibeCount: 0 }))
    : (props.data as RowComparison[]);

  if (!rows.length) {
    return <div className="py-8 text-center text-sm text-gray-500">Pas de données par source.</div>;
  }

  // Tri par score Sephora le plus bas en premier (sources problématiques en haut)
  const sorted = [...rows].sort((a, b) => Math.min(a.sephora, a.nocibe) - Math.min(b.sephora, b.nocibe));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <span className="w-[80px] shrink-0" />
        <div className="flex flex-1 items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          <span className="w-[52px] shrink-0 text-right" style={{ color: "var(--comex-bordeaux)" }}>Sephora</span>
          <span className="flex-1" />
        </div>
        <div className="flex flex-1 items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          <span className="w-[52px] shrink-0 text-right" style={{ color: "var(--comex-blue)" }}>Nocibé</span>
          <span className="flex-1" />
        </div>
        <span className="w-[80px] shrink-0 text-right text-[10px] uppercase tracking-wider text-gray-400">Avantage</span>
      </div>

      {sorted.map((row, i) => {
        const delta = row.sephora - row.nocibe;
        return (
          <div key={row.source} className="flex items-center gap-2">
            <span className="w-[80px] shrink-0 text-xs font-medium text-gray-700">{row.source}</span>

            <div className="flex-1">
              <ScoreBar score={row.sephora} color={scoreColor(row.sephora)} brand="sephora" animate={i < 8} />
            </div>

            <div className="flex-1">
              <ScoreBar score={row.nocibe} color={scoreColor(row.nocibe)} brand="nocibe" animate={i < 8} />
            </div>

            <div className="w-[80px] shrink-0 text-right">
              <DeltaBadge delta={delta} />
            </div>
          </div>
        );
      })}

      <p className="pt-1 text-right text-[10px] text-gray-400">
        Score 0–100 — rouge &lt;50, vert &gt;60
      </p>
    </div>
  );
}
