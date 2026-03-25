"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CommentScrollPanel } from "@/components/sections/CommentScrollPanel";
import { useVerbatims } from "@/hooks/useMetrics";

export default function Home() {
  const range = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 14 * 24 * 60 * 60 * 1000);
    return { from, to };
  }, []);

  const verbatims = useVerbatims(
    { from: range.from, to: range.to },
    0,
    30,
  );
  const rows = verbatims.data?.rows ?? [];
  const isLoading = !verbatims.data && !verbatims.error;

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Bienvenue sur SEPHORA Intel
        </h1>
        <p className="mt-2 text-slate-600">
          Intelligence COMEX — suivi du sentiment et des mentions Sephora & Nocibé.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Voir le dashboard
          <ArrowRight className="size-4" />
        </Link>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <CommentScrollPanel
          rows={rows}
          isLoading={isLoading}
          maxHeight="min(70vh, 520px)"
        />
      </motion.section>
    </div>
  );
}
