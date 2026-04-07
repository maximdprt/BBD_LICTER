import { getLastSignalsForInsight } from "@/lib/queries";
import {
  getSentimentIndex,
  getCompetitorComparison,
  getTopThemesInsight,
  getCriticalAlerts24hSummary,
  defaultDateRangeLast6Months,
} from "@/lib/queries";

export const runtime = "nodejs";

function normalizePlainAnswer(input: string): string {
  const cleaned = input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s{0,3}[-*•]\s+/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const sentenceParts = cleaned.match(/[^.!?]+[.!?]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  if (sentenceParts.length <= 3) return cleaned;
  return sentenceParts.slice(0, 3).join(" ").trim();
}

export async function POST(req: Request) {
  let body: { message?: string; history?: { role: string; content: string }[] };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) return Response.json({ error: "Message vide" }, { status: 400 });

  const key = process.env.MISTRAL_API_KEY;
  if (!key) {
    return Response.json({ error: "Clé Mistral non configurée" }, { status: 500 });
  }

  const range = defaultDateRangeLast6Months();
  const [signalsRes, sephoraSent, nocibeSent, comparison, themes, alerts] = await Promise.all([
    getLastSignalsForInsight(60),
    getSentimentIndex("Sephora", range),
    getSentimentIndex("Nocibé", range),
    getCompetitorComparison(range),
    getTopThemesInsight("Sephora", range, 5),
    getCriticalAlerts24hSummary(),
  ]);

  const contextParts: string[] = [];

  if (sephoraSent.ok && nocibeSent.ok) {
    contextParts.push(
      `Indice de sentiment actuel — Sephora: ${sephoraSent.data.score ?? "N/A"}/100, Nocibé: ${nocibeSent.data.score ?? "N/A"}/100`,
    );
  }
  if (comparison.ok) {
    const s = comparison.data.sephora;
    const n = comparison.data.nocibe;
    contextParts.push(
      `Volume mentions — Sephora: ${s.mentionVolume}, Nocibé: ${n.mentionVolume}`,
      `Note moyenne — Sephora: ${s.avgNote?.toFixed(1) ?? "N/A"}/5, Nocibé: ${n.avgNote?.toFixed(1) ?? "N/A"}/5`,
      `Top thème positif Sephora: ${s.topThemePositif ?? "N/A"}, négatif: ${s.topThemeNegatif ?? "N/A"}`,
    );
  }
  if (themes.ok && themes.data.length > 0) {
    contextParts.push(
      `Top thèmes Sephora: ${themes.data.map((t) => `${t.theme} (${t.count} mentions, ${t.dominantSentiment})`).join(", ")}`,
    );
  }
  if (alerts.ok && alerts.data) {
    contextParts.push(
      `Alertes 24h: ${alerts.data.count} signaux critiques, thème dominant: ${alerts.data.dominantTheme}, source: ${alerts.data.dominantSource}`,
    );
  }
  if (signalsRes.ok) {
    const sample = signalsRes.data
      .slice(0, 20)
      .map((r) => `[${r.brand}/${r.source}] ${r.sentiment} (${r.sentiment_score.toFixed(2)}) — ${(r.summary_fr ?? r.raw_text).slice(0, 120)}`)
      .join("\n");
    contextParts.push(`\nÉchantillon des 20 derniers verbatims:\n${sample}`);
  }

  const systemPrompt = `Tu es l'Assistant IA de SEPHORA Intel, la plateforme d'intelligence stratégique de Sephora France. Tu analyses les données de sentiment client, les mentions sur les réseaux sociaux et plateformes d'avis, et les tendances du marché cosmétique.

DONNÉES ACTUELLES DU DASHBOARD:
${contextParts.join("\n")}

RÈGLES:
- Réponds TOUJOURS en français, de manière professionnelle et concise
- Appuie-toi sur les données réelles ci-dessus quand c'est pertinent
- Donne des recommandations actionnables et chiffrées
- Compare Sephora et Nocibé quand c'est utile
- Sois factuel, précis et stratégique
- Réponds en texte brut simple: un seul petit paragraphe de 2 à 3 phrases
- N'utilise jamais de markdown (pas de titres, puces, gras, séparateurs, emojis)
- Si on te demande des données que tu n'as pas, dis-le honnêtement
- Tu peux suggérer des actions marketing, CRM, SAV, produit, communication`;

  const history = (body.history ?? []).slice(-10);
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        temperature: 0.4,
        max_tokens: 1500,
        messages,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      console.error("Mistral API error:", err);
      return Response.json({ error: "Erreur de l'API Mistral" }, { status: 502 });
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const rawContent = json.choices?.[0]?.message?.content ?? "Je n'ai pas pu générer de réponse.";
    const content = normalizePlainAnswer(rawContent);
    return Response.json({ content });
  } catch {
    clearTimeout(timeout);
    return Response.json({ error: "Timeout ou erreur réseau" }, { status: 504 });
  }
}
