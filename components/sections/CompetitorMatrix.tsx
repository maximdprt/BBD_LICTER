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
  if (state === "win") return { background: "rgba(34,197,94,0.1)", color: "#15803d" };
  if (state === "lose") return { background: "rgba(59,130,246,0.1)", color: "#1d4ed8" };
  return { background: "var(--bg-secondary)", color: "var(--text-muted)" };
}

function formatDelta(a: number | null, b: number | null, unit: string) {
  if (a == null || b == null) return "—";
  const d = a - b;
  if (Math.abs(d) < 0.01) return "Égalité";
  const leader = d > 0 ? "Sephora" : "Nocibé";
  if (unit === "mentions") return `${leader} +${Math.abs(Math.round(d))} signaux`;
  return `${leader} ${d > 0 ? "+" : ""}${Math.round(Math.abs(d) * 10) / 10}${unit}`;
}

export function CompetitorMatrix({ data, isLoading, className }: Props) {
  if (isLoading) return <div className={cn("skeleton h-[320px] rounded-2xl", className)} />;
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

  const rows = [
    {
      label: "Sentiment moyen",
      sephora: s.sentimentIndex == null ? "—" : `${s.sentimentIndex}`,
      nocibe: n.sentimentIndex == null ? "—" : `${n.sentimentIndex}`,
      win: sentimentWin,
      delta: formatDelta(s.sentimentIndex, n.sentimentIndex, " pts"),
    },
    {
      label: "Volume signaux",
      sephora: `${s.mentionVolume}`,
      nocibe: `${n.mentionVolume}`,
      win: volumeWin,
      delta: formatDelta(s.mentionVolume, n.mentionVolume, "mentions"),
    },
    {
      label: "Note moyenne",
      sephora: s.avgNote == null ? "—" : `${s.avgNote}`,
      nocibe: n.avgNote == null ? "—" : `${n.avgNote}`,
      win: noteWin,
      delta: formatDelta(s.avgNote, n.avgNote, ""),
    },
    {
      label: "Sentiment Livraison",
      sephora: s.livraisonSentimentIndex == null ? "—" : `${s.livraisonSentimentIndex}`,
      nocibe: n.livraisonSentimentIndex == null ? "—" : `${n.livraisonSentimentIndex}`,
      win: livWin,
      delta: formatDelta(s.livraisonSentimentIndex, n.livraisonSentimentIndex, " pts"),
    },
    {
      label: "Sentiment SAV",
      sephora: s.savSentimentIndex == null ? "—" : `${s.savSentimentIndex}`,
      nocibe: n.savSentimentIndex == null ? "—" : `${n.savSentimentIndex}`,
      win: savWin,
      delta: formatDelta(s.savSentimentIndex, n.savSentimentIndex, " pts"),
    },
    {
      label: "Top thème négatif",
      sephora: s.topThemeNegatif ?? "—",
      nocibe: n.topThemeNegatif ?? "—",
      win: { a: "neutral", b: "neutral" } as const,
      delta: "—",
    },
  ] as const;

  let sephWins = 0;
  for (const r of rows) {
    if (r.win.a === "win") sephWins += 1;
  }

  return (
    <div>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-[var(--comex-border)] shadow-sm",
          className,
        )}
        style={{ background: "var(--bg-card)" }}
      >
        <div className="grid grid-cols-4 gap-0 bg-gray-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          <div>Critère</div>
          <div>
            <span className="text-[var(--comex-bordeaux)]">●</span> Sephora
          </div>
          <div>
            <span className="text-[var(--comex-blue)]">●</span> Nocibé
          </div>
          <div>Avantage</div>
        </div>

        {rows.map((r, rowIdx) => {
          const advantage =
            r.win.a === "neutral" ? "—" : r.win.a === "win" ? "Sephora" : "Nocibé";
          const isEven = rowIdx % 2 === 0;
          return (
            <div
              key={r.label}
              className="grid grid-cols-4 gap-3 px-4 py-3 text-sm transition-colors hover:bg-pink-50/30"
              style={{ background: isEven ? "#fff" : "#fafaf8" }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{r.label}</div>

              <div
                className="rounded-lg px-3 py-2 font-mono text-sm font-medium"
                style={cellTone(r.win.a)}
              >
                {r.sephora}
              </div>

              <div
                className="rounded-lg px-3 py-2 font-mono text-sm font-medium"
                style={cellTone(r.win.b)}
              >
                {r.nocibe}
              </div>

              <div className="flex flex-col justify-center gap-0.5">
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                  style={{
                    background:
                      advantage === "Sephora"
                        ? "var(--comex-bordeaux)"
                        : advantage === "Nocibé"
                          ? "var(--comex-blue)"
                          : "#9ca3af",
                  }}
                >
                  {advantage}
                </span>
                <span className="text-[10px] text-gray-500">{r.delta}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-medium text-[var(--comex-text)]">
        Score de bataille global — Sephora mène {sephWins}/{rows.length} critères numériques
      </p>
    </div>
  );
}
