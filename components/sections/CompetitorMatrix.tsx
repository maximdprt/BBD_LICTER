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
  if (state === "win") return { background: "#EAF7F1", color: "#2A9460" };
  if (state === "lose") return { background: "#EFF3FA", color: "#3A6491" };
  return { background: "var(--bg-secondary)", color: "var(--text-muted)" };
}

export function CompetitorMatrix({ data, isLoading, className }: Props) {
  if (isLoading) return <div className={cn("skeleton h-[280px] rounded-3xl", className)} />;
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
    <div
      className={cn("overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] shadow-sm", className)}
      style={{ background: "var(--bg-card)" }}
    >
      <div
        className="grid grid-cols-4 gap-0 px-4 py-3 text-xs font-semibold"
        style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
      >
        <div style={{ fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Critère</div>
        <div style={{ fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <span style={{ color: "#C4637A", marginRight: 6 }}>●</span>Sephora
        </div>
        <div style={{ fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <span style={{ color: "#6B8FB5", marginRight: 6 }}>●</span>Nocibé
        </div>
        <div style={{ fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Avantage</div>
      </div>

      {rows.map((r, rowIdx) => {
        const advantage =
          r.win.a === "neutral" ? "—" : r.win.a === "win" ? "Sephora" : "Nocibé";
        const isEven = rowIdx % 2 === 0;
        return (
          <div
            key={r.label}
            className="grid grid-cols-4 gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-[var(--s-blush)]"
            style={{ background: isEven ? "#FFFFFF" : "var(--bg-secondary)" }}
          >
            <div style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 10 }}>
              {r.label}
            </div>

            <div
              style={{
                borderRadius: 8,
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                ...cellTone(r.win.a),
              }}
            >
              {r.sephora}
            </div>

            <div
              style={{
                borderRadius: 8,
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                ...cellTone(r.win.b),
              }}
            >
              {r.nocibe}
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                padding: "3px 12px",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: 12,
                color:
                  advantage === "Sephora"
                    ? "#FFFFFF"
                    : advantage === "Nocibé"
                      ? "#FFFFFF"
                      : "var(--text-muted)",
                background:
                  advantage === "Sephora"
                    ? "#C4637A"
                    : advantage === "Nocibé"
                      ? "#6B8FB5"
                      : "var(--bg-secondary)",
              }}
            >
              {advantage}
            </div>
          </div>
        );
      })}
    </div>
  );
}

