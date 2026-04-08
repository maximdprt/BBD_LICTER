import { generateMockSignals } from "@/lib/mock";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { defaultDateRangeLast6Months } from "@/lib/queries";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({})) as { force?: boolean };
  const force = body?.force === true;

  try {
    const supabase = getSupabaseClient();

    const { count } = await supabase
      .from("signals")
      .select("id", { count: "exact", head: true });

    if (count && count > 100 && !force) {
      return Response.json({
        message: `La table contient déjà ${count} lignes. Utilisez force:true pour re-seeder.`,
        count,
        seeded: false,
      });
    }

    // Purge si force
    if (force && count && count > 0) {
      const { error: delErr } = await supabase
        .from("signals")
        .delete()
        .gte("created_at", "2000-01-01T00:00:00Z"); // supprime tout
      if (delErr) {
        return Response.json({ error: `Erreur suppression : ${delErr.message}` }, { status: 500 });
      }
    }

    const range = defaultDateRangeLast6Months();
    const signals = generateMockSignals(range, 1337);

    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < signals.length; i += batchSize) {
      const batch = signals.slice(i, i + batchSize).map((s) => ({
        source: s.source,
        brand: s.brand,
        date: s.date,
        raw_text: s.raw_text,
        sentiment: s.sentiment,
        sentiment_score: s.sentiment_score,
        themes: s.themes,
        platform_rating: s.platform_rating,
        is_alert: s.is_alert,
        summary_fr: s.summary_fr,
        created_at: s.created_at,
        resolved: s.resolved ?? false,
      }));

      const { error } = await supabase.from("signals").insert(batch);
      if (error) {
        return Response.json(
          { error: `Erreur insertion batch ${i}: ${error.message}`, inserted, total: signals.length },
          { status: 500 },
        );
      }
      inserted += batch.length;
    }

    return Response.json({
      message: `${inserted} signaux insérés avec succès.`,
      inserted,
      total: signals.length,
      seeded: true,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Erreur inconnue" },
      { status: 500 },
    );
  }
}
