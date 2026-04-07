"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import useSWR from "swr";
import {
  Zap,
  Target,
  ShieldAlert,
  Megaphone,
  Package,
  Users,
  Swords,
  Clock,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type NBAAction = {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "marketing" | "sav" | "produit" | "communication" | "concurrence" | "crm";
  impact: string;
  deadline: string;
  kpi: string;
};

type NBAPayload = {
  actions: NBAAction[];
  generatedAt: string;
  source: string;
};

const PRIORITY_CONFIG = {
  critical: { label: "Critique", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-800", dot: "bg-red-500", ring: "ring-red-500" },
  high: { label: "Haute", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500", ring: "ring-amber-500" },
  medium: { label: "Moyenne", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500", ring: "ring-blue-500" },
  low: { label: "Basse", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", badge: "bg-gray-100 text-gray-700", dot: "bg-gray-400", ring: "ring-gray-400" },
};

const CATEGORY_CONFIG: Record<NBAAction["category"], { label: string; icon: typeof Zap; color: string }> = {
  marketing: { label: "Marketing", icon: Megaphone, color: "#C9A96E" },
  sav: { label: "SAV", icon: ShieldAlert, color: "#ef4444" },
  produit: { label: "Produit", icon: Package, color: "#8B72C8" },
  communication: { label: "Communication", icon: Megaphone, color: "#3b82f6" },
  concurrence: { label: "Concurrence", icon: Swords, color: "#00A651" },
  crm: { label: "CRM", icon: Users, color: "#E8A0B4" },
};

async function fetchNBA(): Promise<NBAPayload> {
  const r = await fetch("/api/nba", { cache: "no-store" });
  if (!r.ok) throw new Error("NBA indisponible");
  return r.json() as Promise<NBAPayload>;
}

export default function NextBestActionsPage() {
  const prefersReducedMotion = useReducedMotion();
  const { data, error, isLoading, mutate } = useSWR(["nba"], fetchNBA, {
    refreshInterval: 300_000,
  });
  const [filter, setFilter] = useState<NBAAction["priority"] | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const actions = data?.actions ?? [];
  const filtered = filter === "all" ? actions : actions.filter((a) => a.priority === filter);

  const counts = {
    critical: actions.filter((a) => a.priority === "critical").length,
    high: actions.filter((a) => a.priority === "high").length,
    medium: actions.filter((a) => a.priority === "medium").length,
    low: actions.filter((a) => a.priority === "low").length,
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900">
              <div className="grid size-10 place-items-center rounded-xl bg-black">
                <Zap className="size-5 text-[#C9A96E]" />
              </div>
              Next Best Actions
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Actions stratégiques générées à partir de l'analyse en temps réel de vos données.
              {data?.source === "mistral" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#C9A96E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#C9A96E]">
                  <Sparkles className="size-3" /> Généré par Mistral AI
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void mutate()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {/* Summary strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(["critical", "high", "medium", "low"] as const).map((p) => {
            const cfg = PRIORITY_CONFIG[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setFilter(filter === p ? "all" : p)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  filter === p ? `${cfg.bg} ${cfg.border} ${cfg.ring} ring-2 ring-offset-1` : "border-gray-100 bg-white hover:bg-gray-50"
                }`}
              >
                <span className={`size-3 rounded-full ${cfg.dot}`} />
                <div>
                  <div className="text-xs font-medium text-gray-500">{cfg.label}</div>
                  <div className="text-lg font-bold text-gray-900">{counts[p]}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-32 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Impossible de charger les actions. Réessayez.
          </div>
        )}

        {/* Actions list */}
        {!isLoading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center text-sm text-gray-500">
                Aucune action pour ce filtre.
              </div>
            )}
            {filtered.map((action, idx) => {
              const pCfg = PRIORITY_CONFIG[action.priority];
              const cCfg = CATEGORY_CONFIG[action.category] ?? CATEGORY_CONFIG.marketing;
              const CatIcon = cCfg.icon;
              const expanded = expandedId === action.id;

              return (
                <motion.div
                  key={action.id}
                  variants={itemVariants}
                  className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${pCfg.border}`}
                >
                  <div className="absolute left-0 top-0 h-full w-1" style={{ background: cCfg.color }} />

                  <button
                    type="button"
                    className="w-full px-6 py-5 text-left"
                    onClick={() => setExpandedId(expanded ? null : action.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl"
                          style={{ background: `${cCfg.color}15` }}
                        >
                          <CatIcon className="size-5" style={{ color: cCfg.color }} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-400">#{idx + 1}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${pCfg.badge}`}>
                              {pCfg.label}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                              {cCfg.label}
                            </span>
                          </div>
                          <h3 className="mt-1.5 text-base font-semibold text-gray-900">{action.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-gray-600">{action.description}</p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`mt-2 size-5 shrink-0 text-gray-300 transition-transform ${expanded ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>

                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 px-6 py-4"
                    >
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="mt-0.5 size-4 shrink-0 text-green-500" />
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Impact estimé</div>
                            <div className="mt-0.5 text-sm text-gray-800">{action.impact}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 size-4 shrink-0 text-blue-500" />
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Deadline</div>
                            <div className="mt-0.5 text-sm text-gray-800">{action.deadline}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Target className="mt-0.5 size-4 shrink-0 text-purple-500" />
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">KPI à suivre</div>
                            <div className="mt-0.5 text-sm text-gray-800">{action.kpi}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Footer */}
        {data && (
          <div className="mt-6 text-center text-xs text-gray-400">
            Généré le{" "}
            {new Date(data.generatedAt).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            {data.source === "mistral" ? " — Mistral AI" : " — Analyse statique"}
          </div>
        )}
      </motion.div>
    </div>
  );
}
