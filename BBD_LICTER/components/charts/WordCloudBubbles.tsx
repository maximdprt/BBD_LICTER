"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type BubbleItem = Readonly<{
  label: string;
  value: number;
  tone: "positif" | "negatif" | "neutre";
}>;

type Props = Readonly<{
  items: BubbleItem[];
  className?: string;
}>;

export function WordCloudBubbles({ items, className }: Props) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className={cn("relative h-[320px] w-full overflow-hidden rounded-2xl bg-black/2", className)}>
      {items.slice(0, 18).map((it, idx) => {
        const s = 0.55 + (it.value / max) * 0.9;
        const x = (idx * 37) % 92;
        const y = (idx * 23) % 78;
        const tone =
          it.tone === "positif"
            ? "from-emerald-400/25 to-emerald-500/10 ring-emerald-400/25"
            : it.tone === "negatif"
              ? "from-rose-400/25 to-rose-500/10 ring-rose-400/25"
              : "from-sky-400/20 to-sky-500/10 ring-sky-400/20";

        return (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03, duration: 0.35, ease: "easeOut" }}
            className={cn(
              "absolute rounded-full bg-linear-to-br ring-1 backdrop-blur-sm",
              tone,
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              width: `${Math.round(80 * s)}px`,
              height: `${Math.round(80 * s)}px`,
            }}
          >
            <motion.div
              className="grid size-full place-items-center px-4 text-center"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 6 + idx * 0.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-sm font-semibold text-foreground/85">{it.label}</div>
              <div className="mt-1 font-mono text-xs text-text-secondary">{it.value}</div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

