"use client";

import { cn } from "@/lib/cn";
import type { MentionRow } from "@/lib/types";
import { Globe, Linkedin, Music2, Instagram, MessageSquare } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  tiktok: "TikTok",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  reddit: "Reddit",
};

function SourceIcon({ source }: { source: string }) {
  const cls = "size-4 text-black";
  const s = source.toLowerCase();
  if (s === "tiktok") return <Music2 className={cls} />;
  if (s === "instagram") return <Instagram className={cls} />;
  if (s === "linkedin") return <Linkedin className={cls} />;
  if (s === "reddit") return <MessageSquare className={cls} />;
  return <Globe className={cls} />;
}

function Stars({ count, tone }: { count: number; tone: "rose" | "noir" }) {
  const fill = tone === "rose" ? "#FDC9D3" : "#C9A96E";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} étoiles`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="size-3.5" viewBox="0 0 16 16" fill={i < count ? fill : "none"} stroke={i < count ? fill : "#00000020"} strokeWidth="1.5">
          <path d="M8 1.5l1.85 3.75 4.14.6-3 2.92.71 4.13L8 10.77l-3.7 1.93.71-4.13-3-2.92 4.14-.6z" />
        </svg>
      ))}
    </div>
  );
}

type Props = Readonly<{
  rows: MentionRow[];
  isLoading?: boolean;
  className?: string;
  maxHeight?: string;
}>;

export function CommentScrollPanel({ rows, isLoading, className, maxHeight = "420px" }: Props) {
  const FALLBACK = [
    { id: "f1", source: "google", marque: "Sephora", texte: "L'accueil en magasin était excellent, conseils ultra précis.", sentiment: "positif" as const, note: 5, theme: "conseil", date: new Date().toISOString() },
    { id: "f2", source: "google", marque: "Sephora", texte: "Livraison rapide et emballage impeccable. Très satisfaite.", sentiment: "positif" as const, note: 5, theme: "livraison", date: new Date().toISOString() },
    { id: "f3", source: "instagram", marque: "Sephora", texte: "Les recommandations personnalisées m'ont aidé à trouver mon fond de teint.", sentiment: "positif" as const, note: 4, theme: "conseil", date: new Date().toISOString() },
    { id: "f4", source: "google", marque: "Sephora", texte: "Expérience correcte, quelques retards sur la disponibilité produits.", sentiment: "neutre" as const, note: 3, theme: "stock", date: new Date().toISOString() },
    { id: "f5", source: "tiktok", marque: "Sephora", texte: "Application fluide, parcours d'achat agréable et intuitif.", sentiment: "positif" as const, note: 4, theme: "application", date: new Date().toISOString() },
    { id: "f6", source: "linkedin", marque: "Sephora", texte: "Service client réactif. Problème résolu en moins de 24h.", sentiment: "positif" as const, note: 5, theme: "SAV", date: new Date().toISOString() },
  ];

  const items: { id: string; source: string; marque: string; texte: string; sentiment: string; note: number | null; theme?: string }[] =
    rows.length > 0
      ? rows.map((r) => ({ id: r.id ?? Math.random().toString(), source: r.source, marque: r.marque, texte: r.texte, sentiment: r.sentiment, note: r.note ?? null, theme: r.theme }))
      : FALLBACK;

  const capped = items.slice(0, 12);
  const duplicated = [...capped, ...capped];

  if (isLoading) {
    return (
      <div className={cn("relative w-full overflow-hidden rounded-2xl border border-[#00000010] bg-white shadow-sm", className)} style={{ maxHeight }}>
        <div className="px-5 py-4">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          <div className="mt-3 flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 w-72 shrink-0 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-2xl border border-[#00000010] bg-white shadow-sm", className)}
      style={{ maxHeight }}
    >
      <div className="relative px-5 py-4">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#FDC9D3]/55 via-white/60 to-[#FDC9D3]/40 blur-2xl opacity-90"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-black">Commentaires récents</h2>
            <span className="text-xs text-gray-400">{rows.length > 0 ? `${rows.length} avis (14j)` : "Données de démo"}</span>
          </div>

          <div className="comment-marquee group relative mt-3">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

            <div className="comment-marquee__viewport overflow-hidden">
              <ul className="comment-marquee__track flex gap-3 pr-5">
                {duplicated.map((c, idx) => {
                  const isPositive = c.sentiment === "positif" || c.sentiment === "positive";
                  const isNegative = c.sentiment === "négatif" || c.sentiment === "negative";
                  const badgeBg = isPositive ? "bg-[#FDC9D3]/34" : isNegative ? "bg-red-50" : "bg-black/5";
                  const badgeText = isPositive ? "text-[#C94A7A]" : isNegative ? "text-red-600" : "text-black/60";
                  const badgeLabel = isPositive ? "Positif" : isNegative ? "Négatif" : "Neutre";
                  const stars = c.note ? Math.round(Math.max(1, Math.min(5, c.note))) : 3;

                  return (
                    <li
                      key={`${c.id}-${idx}`}
                      className="comment-marquee__card w-[300px] shrink-0 rounded-2xl border border-[#00000010] bg-white px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-2xl border border-[#00000010] bg-white">
                          <SourceIcon source={c.source} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badgeBg, badgeText)}>
                              {badgeLabel}
                            </span>
                            <Stars count={stars} tone={isPositive ? "rose" : "noir"} />
                          </div>
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <span className="truncate text-[11px] font-medium text-black/50">{SOURCE_LABELS[c.source] ?? c.source}</span>
                            {c.theme && <span className="truncate rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400">{c.theme}</span>}
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-snug text-black/80">
                            {c.texte}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes commentScroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .comment-marquee__track {
            animation: commentScroll 28s linear infinite;
            will-change: transform;
          }
          .comment-marquee:hover .comment-marquee__track {
            animation-play-state: paused;
          }
          .comment-marquee__viewport {
            contain: layout paint;
          }
        `}</style>
      </div>
    </div>
  );
}
