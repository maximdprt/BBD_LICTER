"use client";

import { cn } from "@/lib/cn";
import type { CompetitorComparison } from "@/lib/types";

type Props = Readonly<{
  data: CompetitorComparison | null;
  isLoading?: boolean;
  className?: string;
}>;

function winner(a: number | null, b: number | null, higherIsBetter = true) {
  if (a == null || b == null) return { a: "neutral", b: "neutral" } as const;
  if (Math.abs(a - b) < 0.001) return { a: "neutral", b: "neutral" } as const;
  const aWins = higherIsBetter ? a > b : a < b;
  return { a: aWins ? "win" : "lose", b: aWins ? "lose" : "win" } as const;
}

function cellTone(state: "win" | "lose" | "neutral") {
  if (state === "win") return { text: "#15803d", bar: "#22c55e" };
  if (state === "lose") return { text: "#1d4ed8", bar: "#3b82f6" };
  return { text: "#6b7280", bar: "#d1d5db" };
}

function formatDelta(a: number | null, b: number | null, unit: string) {
  if (a == null || b == null) return "—";
  const d = a - b;
  if (Math.abs(d) < 0.01) return "Égalité";
  const leader = d > 0 ? "Sephora" : "Nocibé";
  if (unit === "mentions") return `${leader} +${Math.abs(Math.round(d))}`;
  return `${leader} ${d > 0 ? "+" : ""}${Math.round(Math.abs(d) * 10) / 10}${unit}`;
}

/** Barre de progression proportionnelle à la valeur max entre les deux */
function ProgressBar({
  value,
  max,
  color,
  isWinner,
}: Readonly<{ value: number; max: number; color: string; isWinner: boolean }>) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: color,
          opacity: isWinner ? 0.9 : 0.45,
        }}
      />
    </div>
  );
}

export function CompetitorMatrix({ data, isLoading, className }: Props) {
  if (isLoading) return <div className={cn("skeleton h-[340px] rounded-2xl", className)} />;
  if (!data)
    return (
      <div className={cn("rounded-2xl border border-[var(--comex-border)] bg-white p-6 text-sm text-gray-500", className)}>
        Pas assez de données pour comparer Sephora et Nocibé.
      </div>
    );

  const s = data.sephora;
  const n = data.nocibe;

  const sentimentWin = winner(s.sentimentIndex, n.sentimentIndex, true);
  const volumeWin = winner(s.mentionVolume, n.mentionVolume, true);
  const noteWin = winner(s.avgNote, n.avgNote, true);
  const savWin = winner(s.savSentimentIndex, n.savSentimentIndex, true);
  const livWin = winner(s.livraisonSentimentIndex, n.livraisonSentimentIndex, true);

  type NumericRow = Readonly<{
    label: string;
    sephora: number | null;
    nocibe: number | null;
    win: { a: "win" | "lose" | "neutral"; b: "win" | "lose" | "neutral" };
    delta: string;
    unit: string;
  }>;

  const numericRows: NumericRow[] = [
    {
      label: "Sentiment moyen",
      sephora: s.sentimentIndex,
      nocibe: n.sentimentIndex,
      win: sentimentWin,
      delta: formatDelta(s.sentimentIndex, n.sentimentIndex, " pts"),
      unit: "/100",
    },
    {
      label: "Volume signaux",
      sephora: s.mentionVolume,
      nocibe: n.mentionVolume,
      win: volumeWin,
      delta: formatDelta(s.mentionVolume, n.mentionVolume, "mentions"),
      unit: "",
    },
    {
      label: "Note moyenne",
      sephora: s.avgNote,
      nocibe: n.avgNote,
      win: noteWin,
      delta: formatDelta(s.avgNote, n.avgNote, ""),
      unit: "/5",
    },
    {
      label: "Sentiment Livraison",
      sephora: s.livraisonSentimentIndex,
      nocibe: n.livraisonSentimentIndex,
      win: livWin,
      delta: formatDelta(s.livraisonSentimentIndex, n.livraisonSentimentIndex, " pts"),
      unit: "/100",
    },
    {
      label: "Sentiment SAV",
      sephora: s.savSentimentIndex,
      nocibe: n.savSentimentIndex,
      win: savWin,
      delta: formatDelta(s.savSentimentIndex, n.savSentimentIndex, " pts"),
      unit: "/100",
    },
  ];

  let sephWins = 0;
  for (const r of numericRows) {
    if (r.win.a === "win") sephWins += 1;
  }

  return (
    <div>
      <div
        className={cn("overflow-hidden rounded-2xl border border-[var(--comex-border)] shadow-sm", className)}
        style={{ background: "var(--bg-card)" }}
      >
        {/* Header */}
        <div className="grid grid-cols-[2fr_2fr_2fr_1.5fr] gap-0 border-b border-[var(--comex-border)] bg-gray-50 px-5 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Critère</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--comex-bordeaux)" }}>
            ● Sephora
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--comex-blue)" }}>
            ● Nocibé
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Avantage</div>
        </div>

        {/* Numeric rows */}
        {numericRows.map((r, rowIdx) => {
          const isEven = rowIdx % 2 === 0;
          const sephVal = r.sephora;
          const nociVal = r.nocibe;
          const maxVal = Math.max(sephVal ?? 0, nociVal ?? 0);
          const sephTone = cellTone(r.win.a);
          const nociTone = cellTone(r.win.b);
          const advantage = r.win.a === "neutral" ? "—" : r.win.a === "win" ? "Sephora" : "Nocibé";

          return (
            <div
              key={r.label}
              className="grid grid-cols-[2fr_2fr_2fr_1.5fr] gap-0 px-5 py-3 transition-colors hover:bg-pink-50/20"
              style={{ background: isEven ? "#fff" : "#fafaf8" }}
            >
              <div className="flex flex-col justify-center">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{r.label}</span>
              </div>

              {/* Sephora cell */}
              <div className="pr-4">
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-mono text-lg font-bold"
                    style={{ color: sephTone.text }}
                  >
                    {sephVal == null ? "—" : sephVal}
                  </span>
                  {r.unit && sephVal != null ? (
                    <span className="text-[10px] text-gray-400">{r.unit}</span>
                  ) : null}
                </div>
                {sephVal != null && maxVal > 0 ? (
                  <ProgressBar value={sephVal} max={maxVal} color={sephTone.bar} isWinner={r.win.a === "win"} />
                ) : null}
              </div>

              {/* Nocibé cell */}
              <div className="pr-4">
                <div className="flex items-baseline gap-1">
                  <span
                    className="font-mono text-lg font-bold"
                    style={{ color: nociTone.text }}
                  >
                    {nociVal == null ? "—" : nociVal}
                  </span>
                  {r.unit && nociVal != null ? (
                    <span className="text-[10px] text-gray-400">{r.unit}</span>
                  ) : null}
                </div>
                {nociVal != null && maxVal > 0 ? (
                  <ProgressBar value={nociVal} max={maxVal} color={nociTone.bar} isWinner={r.win.b === "win"} />
                ) : null}
              </div>

              {/* Avantage */}
              <div className="flex flex-col justify-center gap-0.5">
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                  style={{
                    background:
                      advantage === "Sephora"
                        ? "var(--comex-bordeaux)"
                        : advantage === "Nocibé"
                          ? "var(--comex-blue)"
                          : "#d1d5db",
                    color: advantage === "—" ? "#6b7280" : "#fff",
                  }}
                >
                  {advantage}
                </span>
                <span className="text-[10px] text-gray-500">{r.delta}</span>
              </div>
            </div>
          );
        })}

        {/* Top thème négatif */}
        <div
          className="grid grid-cols-[2fr_2fr_2fr_1.5fr] gap-0 border-t border-[var(--comex-border)] px-5 py-3"
          style={{ background: "#f9faf8" }}
        >
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Top thème négatif</span>
          </div>
          <div className="flex items-center">
            <span className="rounded-md bg-red-50 px-2 py-0.5 font-mono text-sm font-medium text-red-700">
              {s.topThemeNegatif ?? "—"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="rounded-md bg-red-50 px-2 py-0.5 font-mono text-sm font-medium text-red-700">
              {n.topThemeNegatif ?? "—"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
              Informatif
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-sm font-medium" style={{ color: "var(--comex-text)" }}>
        Score de bataille global —{" "}
        <span style={{ color: "var(--comex-bordeaux)" }}>Sephora mène {sephWins}/{numericRows.length} critères</span>
      </p>
    </div>
  );
}
