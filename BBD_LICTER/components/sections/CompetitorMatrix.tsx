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
  if (state === "win") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (state === "lose") return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-white text-foreground/80 ring-black/5";
}

export function CompetitorMatrix({ data, isLoading, className }: Props) {
  if (isLoading) return <div className={cn("h-[280px] animate-pulse rounded-3xl bg-black/4", className)} />;
  if (!data)
    return (
      <div className={cn("rounded-3xl border border-border bg-white p-6 text-sm text-text-secondary", className)}>
        Pas assez de données pour comparer Sephora et Nocibé.
      </div>
    );

  const s = data.sephora;
  const n = data.nocibe;

  const sentimentWin = winner(s.sentimentIndex, n.sentimentIndex, true);
  const volumeWin = winner(s.mentionVolume, n.mentionVolume, true);
  const noteWin = winner(s.avgNote, n.avgNote, true);

  const rows = [
    {
      label: "Sentiment moyen",
      sephora: s.sentimentIndex == null ? "—" : `${s.sentimentIndex}`,
      nocibe: n.sentimentIndex == null ? "—" : `${n.sentimentIndex}`,
      win: sentimentWin,
    },
    {
      label: "Volume mentions",
      sephora: `${s.mentionVolume}`,
      nocibe: `${n.mentionVolume}`,
      win: volumeWin,
    },
    {
      label: "Note moyenne",
      sephora: s.avgNote == null ? "—" : `${s.avgNote}`,
      nocibe: n.avgNote == null ? "—" : `${n.avgNote}`,
      win: noteWin,
    },
    {
      label: "Top thème positif",
      sephora: s.topThemePositif ?? "—",
      nocibe: n.topThemePositif ?? "—",
      win: { a: "neutral", b: "neutral" } as const,
    },
    {
      label: "Top thème négatif",
      sephora: s.topThemeNegatif ?? "—",
      nocibe: n.topThemeNegatif ?? "—",
      win: { a: "neutral", b: "neutral" } as const,
    },
  ] as const;

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm", className)}>
      <div className="grid grid-cols-4 gap-0 border-b border-gray-100 bg-white/80 px-4 py-3 text-xs font-semibold text-text-secondary">
        <div>Critère</div>
        <div>Sephora</div>
        <div>Nocibé</div>
        <div>Avantage</div>
      </div>

      {rows.map((r) => {
        const advantage =
          r.win.a === "neutral" ? "—" : r.win.a === "win" ? "Sephora" : "Nocibé";
        return (
          <div key={r.label} className="grid grid-cols-4 gap-3 px-4 py-3 text-sm">
            <div className="text-foreground/80">{r.label}</div>
            <div className={cn("rounded-2xl px-3 py-2 text-sm ring-1 ring-inset", cellTone(r.win.a))}>
              {r.sephora}
            </div>
            <div className={cn("rounded-2xl px-3 py-2 text-sm ring-1 ring-inset", cellTone(r.win.b))}>
              {r.nocibe}
            </div>
            <div className="flex items-center text-sm font-semibold text-foreground/80">
              {advantage}
            </div>
          </div>
        );
      })}
    </div>
  );
}

