"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Crosshair,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  MessageSquare,
  Music2,
  Shield,
  Smile,
  Zap,
} from "lucide-react";
import { SephoraLogo } from "@/components/ui/SephoraLogo";
import { useDefaultDateRange, useCriticalAlerts24h, useVerbatims } from "@/hooks/useMetrics";

/* ─── helpers ──────────────────────────────────────────── */
const SENTIMENT_CONFIG = {
  positif: { label: "Positif",  bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500" },
  neutre:  { label: "Neutre",   bg: "bg-amber-50",    text: "text-amber-700",    dot: "bg-amber-400"   },
  négatif: { label: "Négatif",  bg: "bg-red-50",      text: "text-red-600",      dot: "bg-red-500"     },
} as const;

const SOURCE_LABELS: Record<string, string> = {
  google: "Google", tiktok: "TikTok", instagram: "Instagram",
  linkedin: "LinkedIn", reddit: "Reddit",
};

function SourceIcon({ source }: { source: string }) {
  const cls = "size-3.5 shrink-0";
  const s = source.toLowerCase();
  if (s === "tiktok")    return <Music2     className={cls} />;
  if (s === "instagram") return <Instagram  className={cls} />;
  if (s === "linkedin")  return <Linkedin   className={cls} />;
  if (s === "reddit")    return <MessageSquare className={cls} />;
  return <Globe className={cls} />;
}

const NAV_LINKS = [
  { href: "/dashboard",          label: "Vue d'ensemble",    sub: "KPIs & tendances",           icon: BarChart3,     color: "#111827" },
  { href: "/reputation",         label: "Réputation",         sub: "Sentiment & score",           icon: Smile,         color: "#C9A96E" },
  { href: "/concurrence",        label: "Concurrence",        sub: "Sephora vs Nocibé",          icon: Crosshair,     color: "#00A651" },
  { href: "/experience",         label: "Expérience Client",  sub: "Verbatims & thèmes",         icon: MessageCircle, color: "#6366f1" },
  { href: "/next-best-actions",  label: "Next Best Actions",  sub: "Recommandations IA",         icon: Zap,           color: "#C9A96E" },
  { href: "/alertes",            label: "Alertes",            sub: "Signaux critiques",           icon: Shield,        color: "#ef4444" },
];

/* ─── page ─────────────────────────────────────────────── */
export default function Home() {
  const range = useDefaultDateRange();
  const alerts = useCriticalAlerts24h();
  const verbatims = useVerbatims({ from: range.from, to: range.to }, 0, 6);
  const rows = verbatims.data?.rows ?? [];
  const isLoading = !verbatims.data && !verbatims.error;

  return (
    <div className="mx-auto w-full max-w-[860px] space-y-8">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-black shadow-md">
              <SephoraLogo size={26} className="text-[#C9A96E]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Bienvenue sur <span className="gold-shine">SEPHORA Intel</span>
              </h1>
              <p className="mt-0.5 text-sm text-gray-400">
                Intelligence Stratégique · Sephora & Nocibé
              </p>
            </div>
          </div>
          {alerts.data && alerts.data.count > 0 && (
            <Link
              href="/alertes"
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <AlertTriangle className="size-4" />
              {alerts.data.count} alerte{alerts.data.count > 1 ? "s" : ""} active{alerts.data.count > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </motion.div>

      {/* ── QUICK ACCESS ── */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35 }}>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">Accès rapide</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NAV_LINKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.045, duration: 0.3 }}
              >
                <Link href={item.href} className="group block">
                  <div
                    className="relative overflow-hidden rounded-2xl bg-white p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg"
                    style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
                  >
                    {/* accent line */}
                    <div
                      className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl transition-opacity opacity-0 group-hover:opacity-100"
                      style={{ background: `linear-gradient(90deg, ${item.color} 0%, transparent 80%)` }}
                    />
                    <div className="flex items-center justify-between">
                      <div
                        className="grid size-9 place-items-center rounded-xl"
                        style={{ background: `${item.color}15` }}
                      >
                        <Icon className="size-4" style={{ color: item.color }} />
                      </div>
                      <ArrowRight className="size-4 text-gray-200 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-400" />
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                      <div className="mt-0.5 text-[12px] text-gray-400">{item.sub}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── RECENT COMMENTS ── */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.35 }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">Commentaires récents</p>
          <Link href="/experience" className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
            Voir tout <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-[72px] rounded-xl" />
              ))
            : rows.slice(0, 6).map((row, i) => {
                const sent = (row.sentiment?.toLowerCase() as keyof typeof SENTIMENT_CONFIG) ?? "neutre";
                const cfg = SENTIMENT_CONFIG[sent] ?? SENTIMENT_CONFIG.neutre;
                const srcLabel = SOURCE_LABELS[row.source?.toLowerCase() ?? ""] ?? row.source ?? "—";
                const theme = row.theme ?? "";

                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28 + i * 0.05, duration: 0.3 }}
                    className="flex items-start gap-3 rounded-xl bg-white px-4 py-3.5 transition-shadow hover:shadow-md"
                    style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
                  >
                    {/* source icon */}
                    <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-gray-50 text-gray-600">
                      <SourceIcon source={row.source ?? ""} />
                    </div>

                    {/* content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600">{srcLabel}</span>
                        {theme && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500">{theme}</span>
                        )}
                        <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600 leading-relaxed">
                        {row.texte ?? "—"}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
        </div>
      </motion.section>

      {/* ── FOOTER NOTE ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }} className="pb-4 text-center text-[11px] text-gray-300">
        <Activity className="mx-auto mb-1 size-3.5" />
        Données en temps réel · Sephora France — CONFIDENTIAL
      </motion.div>

    </div>
  );
}
