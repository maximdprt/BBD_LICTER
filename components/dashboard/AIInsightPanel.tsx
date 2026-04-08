"use client";

import Link from "next/link";
import useSWR from "swr";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";

type Payload = Readonly<{
  insight: string;
  recommendations: [string, string, string];
  updatedAt: string;
  model?: string;
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
      className="relative mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{
        borderColor: "var(--border)",
        borderLeftWidth: 4,
        borderLeftColor: "#C9A96E",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px gold-accent" />

      <div className="flex flex-wrap items-start gap-4 p-6">
        <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-black">
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ background: "rgba(201,169,110,0.15)" }}
            animate={prefersReducedMotion ? undefined : { opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <Image
            src="/Couleur-logo-Sephora.jpg"
            alt="Sephora"
            width={90}
            height={30}
            priority
            className="relative z-10"
            style={{ height: 18, width: "auto", filter: "invert(1)" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              IA Insight
            </span>
            <Sparkles className="size-3 text-[#C9A96E]" />
          </div>
          {isLoading ? (
            <div className="mt-3 space-y-2">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />
            </div>
          ) : error ? (
            <p className="mt-2 text-sm text-red-600">Impossible de charger l&apos;insight.</p>
          ) : (
            <>
              <p className="mt-2 text-base font-medium leading-relaxed text-gray-900">{data?.insight}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {(data?.recommendations ?? []).map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 text-[#C9A96E]">▶</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/reputation#reputation-top"
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-800"
            >
              Voir l&apos;analyse complète
            </Link>
            <Link
              href="/next-best-actions"
              className="rounded-xl border border-[#C9A96E]/30 bg-[#C9A96E]/5 px-4 py-2 text-sm font-semibold text-[#C9A96E] transition-all hover:bg-[#C9A96E]/10"
            >
              Next Best Actions
            </Link>
            <span className="text-xs text-gray-400">
              {data?.model ?? "IA"}
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
