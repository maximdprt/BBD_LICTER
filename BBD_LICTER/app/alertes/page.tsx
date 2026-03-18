"use client";

import { motion } from "framer-motion";
import { BellRing, ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { ChartCard } from "@/components/charts/ChartCard";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { KPICard } from "@/components/ui/KPICard";
import { VerbatimFeed } from "@/components/sections/VerbatimFeed";
import { useAlertsSnapshot, useDefaultDateRange, useMentionVolume, useSentimentIndex, useVerbatims } from "@/hooks/useMetrics";
import { useRealtimeMentions } from "@/hooks/useRealtime";

export default function AlertesPage() {
  useRealtimeMentions({ enabled: true });

  const range = useDefaultDateRange();
  const sephoraSent = useSentimentIndex("Sephora", range);
  const nocibeSent = useSentimentIndex("Nocibé", range);
  const sephoraVolume = useMentionVolume("Sephora", range);
  const alerts = useAlertsSnapshot();

  const feedFilters = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from, to };
  }, []);
  const feed = useVerbatims(feedFilters, 0, 10);

  const competitorOvertake =
    sephoraSent.data?.score != null &&
    nocibeSent.data?.score != null &&
    nocibeSent.data.score > sephoraSent.data.score;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid gap-4"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Sentiment Sephora"
            value={sephoraSent.data?.score ?? null}
            icon={<ShieldAlert className="size-5" />}
            isLoading={!sephoraSent.data && !sephoraSent.error}
          />
          <KPICard
            title="Sentiment Nocibé"
            value={nocibeSent.data?.score ?? null}
            icon={<ShieldAlert className="size-5" />}
            isLoading={!nocibeSent.data && !nocibeSent.error}
          />
          <KPICard
            title="Volume Sephora"
            value={sephoraVolume.data?.total ?? null}
            deltaPct={sephoraVolume.data?.deltaPct ?? null}
            icon={<BellRing className="size-5" />}
            isLoading={!sephoraVolume.data && !sephoraVolume.error}
          />
          <KPICard
            title="Alerte concurrentielle"
            value={competitorOvertake ? 1 : 0}
            valueSuffix={competitorOvertake ? " (ON)" : " (OFF)"}
            icon={<BellRing className="size-5" />}
            isLoading={!sephoraSent.data && !nocibeSent.data}
          />
        </div>

        {competitorOvertake ? (
          <AlertBanner
            tone="warning"
            title="Alerte — Nocibé surperforme en sentiment"
            description="Le score de sentiment Nocibé dépasse Sephora sur la période analysée."
          />
        ) : null}

        <ChartCard
          title="Alertes auto-générées"
          subtitle="Heuristiques temps réel (24h) — rouge/orange/bleu"
          isLoading={!alerts.data && !alerts.error}
        >
          {alerts.data?.length ? (
            <div className="space-y-3">
              {alerts.data.map((a) => (
                <AlertBanner
                  key={a.id}
                  tone={a.tone === "red" ? "danger" : a.tone === "orange" ? "warning" : "info"}
                  title={a.title}
                  description={a.description}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-secondary">
              Aucune alerte détectée sur les dernières 24h.
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Realtime feed (mentions récentes)"
          subtitle="Mis à jour via Supabase Realtime + SWR"
          isLoading={!feed.data && !feed.error}
        >
          <VerbatimFeed rows={feed.data?.rows ?? []} isLoading={!feed.data && !feed.error} />
        </ChartCard>
      </motion.div>
    </div>
  );
}

