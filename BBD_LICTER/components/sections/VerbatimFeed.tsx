"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { MentionRow } from "@/lib/types";
import { SentimentBadge } from "@/components/ui/SentimentBadge";
import { Instagram, Linkedin, MessageSquare, Sparkles, Timer, Twitter } from "lucide-react";

type Props = Readonly<{
  rows: MentionRow[];
  isLoading?: boolean;
  className?: string;
}>;

function SourceIcon({ source }: Readonly<{ source: MentionRow["source"] }>) {
  const cls = "size-4 text-text-secondary";
  if (source === "Instagram") return <Instagram className={cls} />;
  if (source === "LinkedIn") return <Linkedin className={cls} />;
  if (source === "TikTok") return <Sparkles className={cls} />;
  if (source === "Twitter/X") return <Twitter className={cls} />;
  return <MessageSquare className={cls} />;
}

export function VerbatimFeed({ rows, isLoading, className }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("space-y-3", className)}>
      {isLoading ? (
        <>
          <div className="skeleton h-20 w-full rounded-3xl" />
          <div className="skeleton h-20 w-full rounded-3xl" />
          <div className="skeleton h-20 w-full rounded-3xl" />
        </>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white p-6 text-sm text-text-secondary">
          Aucun verbatim trouvé avec ces filtres.
        </div>
      ) : (
        rows.map((r, i) => {
          const expanded = expandedId === r.id;
          const text = r.texte ?? "";
          const short = text.length > 150 ? `${text.slice(0, 150)}…` : text;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{
                y: -3,
                boxShadow: "0 12px 40px rgba(196, 99, 122, 0.14)",
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              whileTap={{ scale: 0.99 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
                delay: prefersReducedMotion ? 0 : i * 0.06,
                ease: "easeOut",
              }}
              style={{ willChange: "transform" }}
            >
              <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <SentimentBadge sentiment={r.sentiment} />
                      <div className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                        <SourceIcon source={r.source} />
                        <span>{r.source}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                        <Timer className="size-4" />
                        <span>{new Date(r.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="ml-auto text-xs font-semibold text-foreground/70">
                        {r.marque}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-foreground/85">
                      {expanded ? text : short}
                      {text.length > 150 ? (
                        <button
                          type="button"
                          className="ml-2 text-sm font-semibold text-accent hover:underline"
                          onClick={() => setExpandedId(expanded ? null : r.id)}
                        >
                          {expanded ? "Réduire" : "Voir plus"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs text-text-secondary">Note</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-foreground">
                      {Math.round((r.note ?? 0) * 10) / 10}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

