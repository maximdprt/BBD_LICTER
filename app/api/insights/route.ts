import { buildStaticInsightFallback, getLastSignalsForInsight } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET() {
  const rowsRes = await getLastSignalsForInsight(100);
  const texts = rowsRes.ok
    ? rowsRes.data.map((r) => r.summary_fr ?? r.raw_text).filter(Boolean)
    : [];

  if (texts.length === 0) {
    return Response.json({
      ...buildStaticInsightFallback(),
      warning: rowsRes.ok ? "Aucun signal trouvé" : rowsRes.error,
    });
  }

  const mistralKey = process.env.MISTRAL_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (mistralKey) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 25_000);
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mistralKey}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          temperature: 0.35,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                'Tu es Chief Intelligence Officer de Sephora. Réponds uniquement en JSON valide : {"insight": string, "recommendations": [string, string, string]}. L\'insight : 2 phrases max, chiffrée et actionnable. Recommandations : 3 bullets courts.',
            },
            {
              role: "user",
              content: `Analyse ces extraits clients Sephora (français) :\n${texts.slice(0, 100).join("\n---\n")}`,
            },
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (res.ok) {
        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const raw = json.choices?.[0]?.message?.content ?? "{}";
        try {
          const parsed = JSON.parse(raw) as { insight?: string; recommendations?: string[] };
          const rec = parsed.recommendations ?? [];
          const fb = buildStaticInsightFallback();
          return Response.json({
            insight: typeof parsed.insight === "string" && parsed.insight.trim() ? parsed.insight.trim() : fb.insight,
            recommendations: [rec[0] ?? fb.recommendations[0], rec[1] ?? fb.recommendations[1], rec[2] ?? fb.recommendations[2]] as [string, string, string],
            updatedAt: new Date().toISOString(),
            model: "Mistral AI",
          });
        } catch { /* fall through */ }
      }
    } catch { /* fall through to OpenAI or fallback */ }
  }

  if (openaiKey) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 25_000);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_INSIGHT_MODEL ?? "gpt-4o-mini",
          temperature: 0.35,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                'Tu es Chief Intelligence Officer de Sephora. Réponds uniquement en JSON valide : {"insight": string, "recommendations": [string, string, string]}. L\'insight : 2 phrases max, chiffrée et actionnable. Recommandations : 3 bullets courts.',
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
      if (res.ok) {
        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const raw = json.choices?.[0]?.message?.content ?? "{}";
        try {
          const parsed = JSON.parse(raw) as { insight?: string; recommendations?: string[] };
          const rec = parsed.recommendations ?? [];
          const fb = buildStaticInsightFallback();
          return Response.json({
            insight: typeof parsed.insight === "string" && parsed.insight.trim() ? parsed.insight.trim() : fb.insight,
            recommendations: [rec[0] ?? fb.recommendations[0], rec[1] ?? fb.recommendations[1], rec[2] ?? fb.recommendations[2]] as [string, string, string],
            updatedAt: new Date().toISOString(),
            model: "GPT-4",
          });
        } catch { /* fall through */ }
      }
    } catch { /* fallback */ }
  }

  return Response.json(buildStaticInsightFallback());
}
