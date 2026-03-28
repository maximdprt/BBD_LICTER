"use client";

import { useEffect } from "react";
import { useSWRConfig } from "swr";
import { getSupabaseClient } from "@/lib/supabase";

export function useRealtimeMentions(params?: { enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("mentions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentions" },
        () => {
          // Révalidation ciblée par préfixes (sans hardcoder des valeurs dans les composants).
          void mutate((key) => {
            if (!Array.isArray(key)) return false;
            const head = key[0];
            return (
              head === "sentimentOverTime" ||
              head === "voiceShareByPlatform" ||
              head === "sentimentIndex" ||
              head === "mentionVolume" ||
              head === "weeklyTrend" ||
              head === "topThemes" ||
              head === "verbatims" ||
              head === "competitorComparison"
            );
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, mutate]);
}

