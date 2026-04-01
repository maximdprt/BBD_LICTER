"use client";

import Link from "next/link";
import useSWR from "swr";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

type Payload = Readonly<{
  insight: string;
  recommendations: [string, string, string];
  updatedAt: string;
}>;

async function fetchInsight(): Promise<Payload> {
  const r = await fetch("/api/insights", { cache: "no-store" });
  if (!r.ok) throw new Error("Insight indisponible");
  return r.json() as Promise<Payload>;
}

export function AIInsightPanel() {
  const prefersReducedMotion = useReducedMotion();
  const { data, error, isLoading } = useSWR(["aiInsight"], fetchInsight, { refreshInterval: 120_000 });

  return (
    <motion.section
      id="ai-insight-block"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative mt-6 overflow-hidden rounded-2xl border border-[var(--comex-border)] bg-white p-6 shadow-sm"
      style={{ borderLeftWidth: 4, borderLeftColor: "var(--comex-bordeaux)" }}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-pink-50 text-[var(--comex-bordeaux)]">
          <motion.div
            className="absolute inset-0 rounded-xl bg-pink-200/40"
            animate={prefersReducedMotion ? undefined : { opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <Sparkles className="relative z-10 size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">IA Insight</div>
          {isLoading ? (
            <div className="mt-3 space-y-2">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />
            </div>
          ) : error ? (
            <p className="mt-2 text-sm text-red-600">Impossible de charger l’insight.</p>
          ) : (
            <>
              <p className="mt-2 text-base font-medium leading-relaxed text-[var(--comex-text)]">{data?.insight}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {(data?.recommendations ?? []).map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 text-[var(--comex-bordeaux)]">▶</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/reputation#reputation-top"
              className="rounded-xl bg-[var(--comex-bordeaux)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Voir l’analyse complète
            </Link>
            <span className="text-xs text-gray-400">
              Généré par GPT-4
              {data?.updatedAt
                ? ` — ${new Date(data.updatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`
                : ""}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
