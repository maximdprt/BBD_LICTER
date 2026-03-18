"use client";

import { cn } from "@/lib/cn";

export type HeatmapCell = Readonly<{
  weekStart: string; // yyyy-MM-dd
  theme: string;
  value: number; // 0..1
}>;

type Props = Readonly<{
  data: HeatmapCell[];
  weeks: string[];
  themes: string[];
  className?: string;
}>;

export function ThemeHeatmap({ data, weeks, themes, className }: Props) {
  const map = new Map<string, number>();
  for (const c of data) map.set(`${c.theme}__${c.weekStart}`, c.value);

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="min-w-[720px]">
        <div className="grid" style={{ gridTemplateColumns: `240px repeat(${weeks.length}, minmax(28px, 1fr))` }}>
          <div className="pb-3 text-xs font-semibold text-text-secondary">Thèmes</div>
          {weeks.map((w) => (
            <div key={w} className="pb-3 text-center text-[11px] text-text-secondary">
              {w.slice(5)}
            </div>
          ))}

          {themes.map((t) => (
            <HeatmapRow key={t} theme={t} weeks={weeks} map={map} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatmapRow({
  theme,
  weeks,
  map,
}: Readonly<{ theme: string; weeks: string[]; map: Map<string, number> }>) {
  return (
    <>
      <div className="truncate pr-4 text-xs text-foreground/80">{theme}</div>
      {weeks.map((w) => {
        const v = map.get(`${theme}__${w}`) ?? 0;
        const bg =
          v <= 0.01
            ? "bg-black/3"
            : v < 0.05
              ? "bg-accent/10"
              : v < 0.1
                ? "bg-accent/20"
                : v < 0.2
                  ? "bg-accent/35"
                  : "bg-accent/55";
        return (
          <div key={w} className="flex items-center justify-center py-1">
            <div className={cn("h-5 w-5 rounded-lg ring-1 ring-black/5", bg)} />
          </div>
        );
      })}
      <div className="h-2" />
    </>
  );
}

