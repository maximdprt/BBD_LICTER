"use client";

import { cn } from "@/lib/cn";
import type { MentionRow } from "@/lib/types";
import { SentimentBadge } from "@/components/ui/SentimentBadge";
import { Instagram, Linkedin, MessageSquare, Music2, Timer, Twitter } from "lucide-react";

const PREVIEW_LEN = 120;

function SourceIcon({ source }: { source: MentionRow["source"] }) {
  const cls = "size-4 text-slate-500";
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
      return <MessageSquare className={cls} />;
  }
}

type Props = Readonly<{
  rows: MentionRow[];
  isLoading?: boolean;
  className?: string;
  maxHeight?: string;
}>;

export function CommentScrollPanel({ rows, isLoading, className, maxHeight = "420px" }: Props) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-sm backdrop-blur",
        className,
      )}
    >
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Commentaires des utilisateurs</h2>
        <p className="mt-0.5 text-xs text-slate-500">Dernières mentions — défilez pour voir plus</p>
      </div>
      <div
        className="overflow-y-auto overscroll-contain py-2"
        style={{ maxHeight }}
      >
        {isLoading ? (
          <div className="space-y-3 px-4 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Aucun commentaire récent.
          </div>
        ) : (
          <ul className="space-y-2 px-3 pb-2">
            {rows.map((r) => {
              const text = (r.texte ?? "").trim();
              const preview = text.length <= PREVIEW_LEN ? text : `${text.slice(0, PREVIEW_LEN)}…`;
              return (
                <li
                  key={r.id}
                  className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                      <SourceIcon source={r.source} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800">{preview || "—"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <SentimentBadge sentiment={r.sentiment} />
                        <span className="text-xs text-slate-500">{r.source}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(r.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {r.theme ? (
                          <span className="text-xs text-slate-500">· {r.theme}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-slate-400">Note</div>
                      <div className="font-mono text-sm font-semibold text-slate-700">
                        {typeof r.note === "number" ? r.note.toFixed(1) : "—"}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
