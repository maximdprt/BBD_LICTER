"use client";

import { motion } from "framer-motion";
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
          <div className="pb-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Thèmes
          </div>
          {weeks.map((w) => (
            <div
              key={w}
              className="pb-3 text-center text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
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

function interpolateColor(intensity: number) {
  const t = Math.max(0, Math.min(1, intensity));
  const stops = [
    { at: 0.0, color: "#FEF0F3" },
    { at: 0.3, color: "#F2C4CE" },
    { at: 0.6, color: "#E0899A" },
    { at: 1.0, color: "#C4637A" },
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.at && t <= b.at) {
      const localT = (t - a.at) / Math.max(1e-6, b.at - a.at);
      const ra = hexToRgb(a.color);
      const rb = hexToRgb(b.color);
      const r = ra.r + (rb.r - ra.r) * localT;
      const g = ra.g + (rb.g - ra.g) * localT;
      const bl = ra.b + (rb.b - ra.b) * localT;
      return rgbToHex(r, g, bl);
    }
  }

  return stops[stops.length - 1]!.color;
}

function HeatmapRow({
  theme,
  weeks,
  map,
}: Readonly<{ theme: string; weeks: string[]; map: Map<string, number> }>) {
  return (
    <>
      <div className="truncate pr-4 text-xs" style={{ color: "var(--text-secondary)" }}>
        {theme}
      </div>
      {weeks.map((w) => {
        const v = map.get(`${theme}__${w}`) ?? 0;
        const bg = interpolateColor(v);
        return (
          <div key={w} className="flex items-center justify-center py-1">
            <motion.div
              className={cn("h-5 w-5 rounded-[6px]")}
              style={{
                background: bg,
                transition: "transform 150ms, box-shadow 150ms",
              }}
              whileHover={{
                scale: 1.1,
                boxShadow: "0 4px 12px rgba(196,99,122,0.25)",
              }}
              transition={{ duration: 0.15 }}
            />
          </div>
        );
      })}
      <div className="h-2" />
    </>
  );
}

