"use client";

import { motion } from "framer-motion";
import { Globe, Instagram, Linkedin, Music2, Twitter } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MentionRow } from "@/lib/types";

const PREVIEW_LENGTH = 80;

function SourceIcon({ source }: { source: MentionRow["source"] }) {
  const cls = "size-5 shrink-0 text-slate-500";
  switch (source) {
    case "Twitter/X":
      return <Twitter className={cls} />;
    case "Instagram":
      return <Instagram className={cls} />;
    case "TikTok":
      return <Music2 className={cls} />;
    case "LinkedIn":
      return <Linkedin className={cls} />;
    default:
      return <Globe className={cls} />;
  }
}

type Props = Readonly<{
  rows: MentionRow[];
  isLoading?: boolean;
  className?: string;
}>;

export function LiveAlertsList({ rows, isLoading, className }: Props) {
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-black/10 bg-white/70 py-8 text-center text-sm text-black/60",
          className,
        )}
      >
        Aucune alerte (gravité &gt; 4) sur la période.
      </div>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {rows.map((r, idx) => {
        const text = (r.texte ?? "").trim();
        const preview = text.length <= PREVIEW_LENGTH ? text : `${text.slice(0, PREVIEW_LENGTH)}…`;
        return (
          <motion.li
            key={r.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: idx * 0.03 }}
            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-sm backdrop-blur"
          >
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
              <SourceIcon source={r.source} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-800">{preview || "—"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">{r.source}</span>
                <span
                  className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800"
                >
                  À traiter
                </span>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
