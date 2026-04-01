"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { MentionRow } from "@/lib/types";
import { SentimentBadge } from "@/components/ui/SentimentBadge";
import { Instagram, Linkedin, MessageSquare, Sparkles, Twitter } from "lucide-react";

type Props = Readonly<{
  rows: MentionRow[];
  isLoading?: boolean;
  className?: string;
}>;

function SourceIcon({ source }: Readonly<{ source: string }>) {
  const s = source.toLowerCase();
  const color =
    s.includes("instagram")
      ? "#E1306C"
      : s.includes("linkedin")
        ? "#0A66C2"
        : s.includes("tiktok")
          ? "#2D2D2D"
          : s.includes("twitter") || s === "x"
            ? "#000000"
            : s.includes("google")
              ? "#4285F4"
              : s.includes("reddit")
                ? "#FF4500"
                : s.includes("trust")
                  ? "#00b67a"
                  : "var(--text-secondary)";

  const common = { className: "size-4", style: { color } } as const;
  if (s.includes("instagram")) return <Instagram {...common} />;
  if (s.includes("linkedin")) return <Linkedin {...common} />;
  if (s.includes("tiktok")) return <Sparkles {...common} />;
  if (s.includes("twitter") || s === "x") return <Twitter {...common} />;
  return <MessageSquare {...common} />;
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
          Pas de données pour cette période.
        </div>
      ) : (
        rows.map((r, i) => {
          const expanded = expandedId === r.id;
          const text = r.texte ?? "";
          const short = text.length > 150 ? `${text.slice(0, 150)}…` : text;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{
                y: -1,
                boxShadow: "0 10px 40px rgba(196,99,122,0.14), 0 2px 8px rgba(0,0,0,0.06)",
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              whileTap={{ scale: 0.99 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.28,
                delay: prefersReducedMotion ? 0 : i * 0.055,
                ease: "easeOut",
              }}
              style={{ willChange: "transform" }}
            >
              <div
                className="rounded-[var(--radius-sm)] border bg-white"
                style={{
                  borderColor: "var(--border)",
                  borderLeft: `3px solid ${
                    r.sentiment === "positif"
                      ? "var(--positive)"
                      : r.sentiment === "négatif"
                        ? "var(--negative)"
                        : "var(--neutral)"
                  }`,
                  padding: "16px 20px 14px",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <SentimentBadge sentiment={r.sentiment} />
                      {r.theme ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-700">
                          {r.theme}
                        </span>
                      ) : null}
                      {typeof r.sentiment_score === "number" ? (
                        <span className="font-mono text-[12px] text-gray-500">
                          {r.sentiment_score > 0 ? "+" : ""}
                          {r.sentiment_score.toFixed(2)}
                        </span>
                      ) : null}
                      <div
                        className="inline-flex items-center gap-2 text-[13px]"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                      >
                        <SourceIcon source={r.source} />
                        <span>{new Date(r.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div
                        className="ml-auto text-[13px] font-semibold"
                        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                      >
                        {r.marque}
                      </div>
                    </div>
                    <div
                      className="mt-[10px] text-[14px] italic"
                      style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
                    >
                      {expanded ? text : short}
                      {text.length > 150 ? (
                        <button
                          type="button"
                          className="ml-2 text-sm font-semibold not-italic hover:underline"
                          style={{ color: "var(--comex-bordeaux)" }}
                          onClick={() => setExpandedId(expanded ? null : r.id)}
                        >
                          {expanded ? "Réduire" : "Voir plus"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>
                      Note
                    </div>
                    <div
                      className="mt-1 font-mono"
                      style={{ fontSize: 20, fontWeight: 500, color: "var(--text-primary)" }}
                    >
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
