"use client";

import { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";
import { shouldUseMockFallback } from "@/lib/mock";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export function useRealtimeMentions(params?: { enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  const { mutate } = useSWRConfig();
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  useEffect(() => {
    if (!enabled) return;
    if (shouldUseMockFallback() || !isSupabaseConfigured()) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("signals-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "signals" },
        () => {
          // Révalidation ciblée par préfixes (sans hardcoder des valeurs dans les composants).
          void mutateRef.current((key) => {
            if (!Array.isArray(key)) return false;
            const head = key[0];
            return (
              head === "sentimentOverTime" ||
              head === "voiceShareByPlatform" ||
              head === "sentimentIndex" ||
              head === "mentionVolume" ||
              head === "weeklyTrend" ||
              head === "sentimentTrend7d" ||
              head === "sentimentSparkline30d" ||
              head === "topThemes" ||
              head === "topThemesInsight" ||
              head === "verbatims" ||
              head === "competitorComparison" ||
              head === "competitorRadar" ||
              head === "themeHeatmap" ||
              head === "sentimentBySource" ||
              head === "criticalAlerts24h" ||
              head === "alertVelocity" ||
              head === "weakSignals" ||
              head === "alertTableRows" ||
              head === "activeAlertsCount24h" ||
              head === "timelinePeaks" ||
              head === "aiInsight" ||
              head === "alertWeekMarkers" ||
              head === "sentimentDistributionFiltered" ||
              head === "topThemesFiltered" ||
              head === "negativeWordFreq"
            );
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled]);
}

