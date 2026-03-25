"use client";

import { cn } from "@/lib/cn";
import type { MentionRow } from "@/lib/types";
import { Globe, Music2, ShieldCheck, Star } from "lucide-react";

type CommentSource = "Google" | "TikTok" | "Trustpilot";

const FAKE_COMMENTS: ReadonlyArray<{
  id: string;
  source: CommentSource;
  userName: string;
  text: string;
  sentiment: "positif" | "neutre";
  stars: number; // 1..5
}> = [
  {
    id: "c1",
    source: "Google",
    userName: "Camille D.",
    text: "L'accueil à Lyon était parfait ! Les conseils produits étaient ultra précis.",
    sentiment: "positif",
    stars: 5,
  },
  {
    id: "c2",
    source: "TikTok",
    userName: "Nora S.",
    text: "Livraison ultra rapide, l'emballage était impeccable. Franchement au top.",
    sentiment: "positif",
    stars: 5,
  },
  {
    id: "c3",
    source: "Trustpilot",
    userName: "Sofia M.",
    text: "IA Insight : Satisfaction en hausse sur le maquillage, surtout pour les teintes.",
    sentiment: "positif",
    stars: 4,
  },
  {
    id: "c4",
    source: "Google",
    userName: "Lucas R.",
    text: "Expérience très correcte en boutique, mais quelques retards sur la disponibilité des produits.",
    sentiment: "neutre",
    stars: 3,
  },
  {
    id: "c5",
    source: "TikTok",
    userName: "Aya K.",
    text: "Les recommandations personnalisées m'ont vraiment aidé à trouver mon hydratant.",
    sentiment: "positif",
    stars: 4,
  },
  {
    id: "c6",
    source: "Trustpilot",
    userName: "Inès P.",
    text: "Service client réactif et réponses claires. Bon suivi jusqu'à la confirmation.",
    sentiment: "positif",
    stars: 5,
  },
];

function SourceIcon({ source }: { source: CommentSource }) {
  const cls = "size-4 text-black";
  switch (source) {
    case "TikTok":
      return <Music2 className={cls} />;
    case "Trustpilot":
      return <ShieldCheck className={cls} />;
    case "Google":
    default:
      return <Globe className={cls} />;
  }
}

function Stars({ count, tone }: { count: number; tone: "rose" | "noir" }) {
  const fill = tone === "rose" ? "#FDC9D3" : "#000000";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} étoiles`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < count;
        return (
          <Star
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={cn("size-4", filled ? "" : "text-black/20")}
            strokeWidth={filled ? 2 : 1.5}
            fill={filled ? fill : "none"}
          />
        );
      })}
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
  // La consigne demande des données placeholder réalistes.
  // `rows/isLoading` restent dans la signature pour compatibilité, mais on ne les utilise pas pour l'instant.
  const items = FAKE_COMMENTS;
  const duplicated = [...items, ...items];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-[#00000010] bg-white shadow-sm",
        className,
      )}
    >
      <div className="relative px-5 py-4">
        {/* Fond flouté rose clair/blanc derrière la banderole */}
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#FDC9D3]/55 via-white/60 to-[#FDC9D3]/40 blur-2xl opacity-90"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <h2 className="text-sm font-semibold text-black">Commentaires des utilisateurs</h2>

          <div className="comment-marquee group relative mt-3">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent" />

            <div className="comment-marquee__viewport overflow-hidden">
              <ul className="comment-marquee__track flex gap-3 pr-5">
                {duplicated.map((c, idx) => {
                  const isPositive = c.sentiment === "positif";
                  const badgeBg = isPositive ? "bg-[#FDC9D3]/34" : "bg-black/5";
                  const badgeText = isPositive ? "text-[#C94A7A]" : "text-black/60";
                  return (
                    <li
                      key={`${c.id}-${idx}`}
                      className="comment-marquee__card w-[320px] shrink-0 rounded-2xl border border-[#00000010] bg-white px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 grid size-9 place-items-center rounded-2xl border border-[#00000010] bg-white">
                          <SourceIcon source={c.source} />
                      </div>

                      <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badgeBg, badgeText)}>
                              {isPositive ? "Positif" : "Neutre"}
                            </span>
                            <Stars count={c.stars} tone={isPositive ? "rose" : "noir"} />
                        </div>

                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="truncate text-[11px] font-medium text-black/70">{c.userName}</span>
                            <span className="truncate text-[11px] font-medium text-black/40">{c.source}</span>
                          </div>

                          <p
                            className={cn(
                              "mt-2 text-sm text-black/80 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden"
                            )}
                          >
                            {c.text}
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
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .comment-marquee__track {
            animation: commentScroll 20s linear infinite;
            will-change: transform;
          }

          .comment-marquee:hover .comment-marquee__track {
            animation-play-state: paused;
          }

          .comment-marquee__viewport {
            /* force la création du contexte de rendu pour smoother la perf */
            contain: layout paint;
          }
        `}</style>
      </div>
    </div>
  );
}
