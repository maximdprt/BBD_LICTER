import { buildStaticInsightFallback, getLastSignalsForInsight } from "@/lib/queries";

export const runtime = "nodejs";

/**
 * GET : agrège les 100 derniers verbatims puis appelle OpenAI si OPENAI_API_KEY est défini.
 * Réponse JSON { insight, recommendations[3], updatedAt }
 */
export async function GET() {
  const rowsRes = await getLastSignalsForInsight(100);
  if (!rowsRes.ok) {
    return Response.json({ ...buildStaticInsightFallback(), error: rowsRes.error }, { status: 500 });
  }
  const texts = rowsRes.data.map((r) => r.summary_fr ?? r.raw_text).filter(Boolean);
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return Response.json(buildStaticInsightFallback());
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 25_000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_INSIGHT_MODEL ?? "gpt-4o-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu es Chief Intelligence Officer de Sephora. Réponds uniquement en JSON valide : {\"insight\": string, \"recommendations\": [string, string, string]}. L'insight : 2 phrases max, chiffrée et actionnable. Recommandations : 3 bullets courts.",
          },
          {
            role: "user",
            content: `Analyse ces extraits clients (français) :\n${texts.slice(0, 100).join("\n---\n")}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error", err);
      return Response.json(buildStaticInsightFallback());
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { insight?: string; recommendations?: string[] };
    try {
      parsed = JSON.parse(raw) as { insight?: string; recommendations?: string[] };
    } catch {
      return Response.json(buildStaticInsightFallback());
    }
    const rec = parsed.recommendations ?? [];
    const payload = {
      insight:
        typeof parsed.insight === "string" && parsed.insight.trim()
          ? parsed.insight.trim()
          : buildStaticInsightFallback().insight,
      recommendations: [
        rec[0] ?? buildStaticInsightFallback().recommendations[0],
        rec[1] ?? buildStaticInsightFallback().recommendations[1],
        rec[2] ?? buildStaticInsightFallback().recommendations[2],
      ] as [string, string, string],
      updatedAt: new Date().toISOString(),
    };
    return Response.json(payload);
  } catch {
    return Response.json(buildStaticInsightFallback());
  }
}
