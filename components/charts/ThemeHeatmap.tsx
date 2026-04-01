"use client";

import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/cn";
import type { HeatmapCellData } from "@/lib/types";

type Props = Readonly<{
  cells: HeatmapCellData[];
  className?: string;
}>;

function hexToRgb(hex: string) {
  const v = hex.replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => `${c}${c}`).join("") : v;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (x: number) => x.toString(16).padStart(2, "0");
  return `#${to(Math.round(r))}${to(Math.round(g))}${to(Math.round(b))}`;
}

/** Blanc → bordeaux foncé (spec jury). */
function interpolateBordeaux(intensity: number) {
  const t = Math.max(0, Math.min(1, intensity));
  const a = hexToRgb("#ffffff");
  const b = hexToRgb("#831843");
  return rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

function weekShort(w: string) {
  try {
    return format(parseISO(w), "d MMM", { locale: fr });
  } catch {
    return w.slice(5);
  }
}

export function ThemeHeatmap({ cells, className }: Props) {
  const weeks = [...new Set(cells.map((c) => c.weekStart))].sort();
  const themeVolume = new Map<string, number>();
  for (const c of cells) themeVolume.set(c.theme, (themeVolume.get(c.theme) ?? 0) + c.count);
  const themes = [...new Set(cells.map((c) => c.theme))].sort((a, b) => (themeVolume.get(b) ?? 0) - (themeVolume.get(a) ?? 0));

  const map = new Map<string, HeatmapCellData>();
  for (const c of cells) map.set(`${c.theme}__${c.weekStart}`, c);

  if (!weeks.length || !themes.length)
    return <div className="text-sm text-gray-500">Pas assez de données pour la heatmap.</div>;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span>Faible</span>
        <div className="h-3 flex-1 max-w-xs rounded-full bg-gradient-to-r from-white to-[#831843] ring-1 ring-gray-200" />
        <span>Fort volume</span>
      </div>
      <div className="min-w-[720px]">
        <div className="grid" style={{ gridTemplateColumns: `minmax(140px,1fr) repeat(${weeks.length}, minmax(32px, 1fr))` }}>
          <div className="pb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Thèmes</div>
          {weeks.map((w) => (
            <div key={w} className="pb-3 text-center text-[10px] text-gray-400">
              {weekShort(w)}
            </div>
          ))}

          {themes.map((t) => (
            <div key={t} className="contents">
              <div className="truncate py-1.5 pr-2 text-sm capitalize text-gray-800">{t}</div>
              {weeks.map((w) => {
                const cell = map.get(`${t}__${w}`);
                const intensity = cell?.intensity ?? 0;
                const bg = interpolateBordeaux(intensity);
                const title = cell
                  ? `Semaine du ${weekShort(w)} — ${t} — ${cell.count} mentions — Sentiment moyen : ${cell.avgSentimentScore.toFixed(2)}`
                  : "Aucune mention";
                return (
                  <div key={`${t}-${w}`} className="flex items-center justify-center py-1">
                    <motion.div
                      title={title}
                      className="h-6 w-6 rounded-md ring-1 ring-black/5"
                      style={{ background: cell ? bg : "#f9fafb" }}
                      whileHover={{ scale: 1.08 }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
