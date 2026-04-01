"use client";

import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { TimelinePeak } from "@/lib/types";

type Props = Readonly<{
  peaks: TimelinePeak[];
}>;

function weekLabel(weekStart: string) {
  try {
    return format(parseISO(weekStart), "d MMM", { locale: fr });
  } catch {
    return weekStart;
  }
}

export function CompetitorTimeline({ peaks }: Props) {
  if (!peaks.length)
    return <div className="py-8 text-center text-sm text-gray-500">Pas de données pour la frise.</div>;

  const byWeek = new Map<string, { seph?: TimelinePeak; noci?: TimelinePeak }>();
  for (const p of peaks) {
    const cur = byWeek.get(p.weekStart) ?? {};
    if (p.brand === "Sephora") cur.seph = p;
    else cur.noci = p;
    byWeek.set(p.weekStart, cur);
  }
  const weeks = [...byWeek.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-26);

  const maxV = Math.max(1, ...weeks.flatMap(([, v]) => [v.seph?.volume ?? 0, v.noci?.volume ?? 0]));

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-[720px] gap-1 items-end px-2" style={{ height: 200 }}>
        {weeks.map(([wk, v]) => {
          const hs = v.seph ? Math.round((v.seph.volume / maxV) * 160) : 0;
          const hn = v.noci ? Math.round((v.noci.volume / maxV) * 160) : 0;
          return (
            <div key={wk} className="flex flex-1 flex-col items-center gap-1" title={wk}>
              <div className="flex h-[168px] w-full items-end justify-center gap-0.5">
                <div
                  className="w-1.5 rounded-t bg-[var(--comex-bordeaux)] opacity-90"
                  style={{ height: Math.max(4, hs) }}
                  title={
                    v.seph
                      ? `Pic Sephora ${weekLabel(wk)} — ${v.seph.volume} — ${v.seph.dominantTheme ?? "—"}`
                      : ""
                  }
                />
                <div
                  className="w-1.5 rounded-t bg-[var(--comex-blue)] opacity-90"
                  style={{ height: Math.max(4, hn) }}
                  title={
                    v.noci
                      ? `Pic Nocibé ${weekLabel(wk)} — ${v.noci.volume} — ${v.noci.dominantTheme ?? "—"}`
                      : ""
                  }
                />
              </div>
              <span className="max-w-full truncate text-[9px] text-gray-400">{weekLabel(wk)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-center gap-6 text-xs text-gray-600">
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm bg-[var(--comex-bordeaux)]" /> Sephora
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm bg-[var(--comex-blue)]" /> Nocibé
        </span>
      </div>
    </div>
  );
}
