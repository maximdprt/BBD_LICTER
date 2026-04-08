"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";
import { CommentScrollPanel } from "@/components/sections/CommentScrollPanel";
import { SephoraLogo } from "@/components/ui/SephoraLogo";
import { useVerbatims } from "@/hooks/useMetrics";

export default function Home() {
  const range = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 14 * 24 * 60 * 60 * 1000);
    return { from, to };
  }, []);

  const verbatims = useVerbatims({ from: range.from, to: range.to }, 0, 30);
  const rows = verbatims.data?.rows ?? [];
  const isLoading = !verbatims.data && !verbatims.error;

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <div className="flex items-center gap-4">
          <SephoraLogo size={44} className="text-black" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Bienvenue sur <span className="gold-shine">SEPHORA Intel</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Intelligence Stratégique — Suivi du sentiment et des mentions Sephora & Nocibé
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#C9A96E]/30 hover:shadow-md"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-black">
              <BarChart3 className="size-5 text-[#C9A96E]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Dashboard</div>
              <div className="text-xs text-gray-500">Vue d&apos;ensemble</div>
            </div>
            <ArrowRight className="ml-auto size-4 text-gray-300 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/next-best-actions"
            className="group flex items-center gap-3 rounded-xl border border-[#C9A96E]/20 bg-[#C9A96E]/[0.03] p-4 shadow-sm transition-all hover:border-[#C9A96E]/40 hover:shadow-md"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-[#C9A96E]">
              <Zap className="size-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Next Best Actions</div>
              <div className="text-xs text-[#C9A96E]">Recommandations IA</div>
            </div>
            <ArrowRight className="ml-auto size-4 text-[#C9A96E]/40 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/alertes"
            className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-red-200 hover:shadow-md"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-red-50">
              <Shield className="size-5 text-red-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Alertes</div>
              <div className="text-xs text-gray-500">Signaux critiques</div>
            </div>
            <ArrowRight className="ml-auto size-4 text-gray-300 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <CommentScrollPanel rows={rows} isLoading={isLoading} maxHeight="min(70vh, 520px)" />
      </motion.section>
    </div>
  );
}
