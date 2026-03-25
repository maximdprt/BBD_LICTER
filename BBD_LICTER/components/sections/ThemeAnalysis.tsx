"use client";

import type { ThemeInsight } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = Readonly<{
  data: ThemeInsight[];
  className?: string;
}>;

function sentimentDot(sentiment: ThemeInsight["dominantSentiment"]) {
  if (sentiment === "positif") return "bg-emerald-500";
  if (sentiment === "négatif") return "bg-rose-500";
  return "bg-slate-400";
}

export function ThemeAnalysis({ data, className }: Props) {
  const top = data.slice(0, 5);
  const max = Math.max(1, ...top.map((t) => t.count));

  return (
    <div className={cn("space-y-2", className)}>
      {top.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-black/60">
          Aucun thème sur la période.
        </div>
      ) : (
        top.map((t) => {
          const pct = Math.round((t.count / max) * 100);
          return (
            <div
              key={t.theme}
              className="rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cn("size-2.5 shrink-0 rounded-full", sentimentDot(t.dominantSentiment))} />
                  <div className="truncate text-sm font-semibold text-slate-900">{t.theme}</div>
                </div>
                <div className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">{t.count}</div>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-900/30" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

