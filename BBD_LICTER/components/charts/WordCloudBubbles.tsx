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
    <div className={cn("relative h-[320px] w-full overflow-hidden rounded-2xl", className)} style={{ background: "var(--bg-secondary)" }}>
      {items.slice(0, 18).map((it, idx) => {
        const t = it.value / max;
        const size = Math.round(80 + t * 80); // 80..160
        const x = (idx * 37) % 92;
        const y = (idx * 23) % 78;

        const tone =
          it.tone === "positif"
            ? { bg: "#EAF7F1", color: "#2A9460", border: "#C5E8D8" }
              : it.tone === "negatif"
              ? { bg: "#FDEEF0", color: "#C0392B", border: "#F5C6CB" }
              : { bg: "#F0F2F6", color: "#5A6478", border: "#D8DCE6" };

        const fontSize = Math.max(12, Math.round(size * 0.14));

        return (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03, duration: 0.35, ease: "easeOut" }}
            whileHover={{
              scale: 1.08,
              boxShadow: "0 8px 24px rgba(196,99,122,0.2)",
              transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 0] },
            }}
            style={{
              willChange: "transform",
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              width: size,
              height: size,
              borderRadius: 9999,
              background: tone.bg,
              color: tone.color,
              border: `1px solid ${tone.border}`,
              display: "grid",
              placeItems: "center",
              padding: 8,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize,
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              {it.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

