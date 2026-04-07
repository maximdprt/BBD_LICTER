import {
  defaultDateRangeLast6Months,
  getCompetitorComparison,
  getCriticalAlerts24hSummary,
  getSentimentIndex,
  getSentimentTrend7dPoints,
  getTopThemesInsight,
  getWeakSignalsScatter,
  getMentionVolume,
} from "@/lib/queries";

export const runtime = "nodejs";

export async function GET() {
  const range = defaultDateRangeLast6Months();

  const [
    sephoraSent,
    nocibeSent,
    trend7d,
    comparison,
    themes,
    alerts,
    weak,
    volume,
  ] = await Promise.all([
    getSentimentIndex("Sephora", range),
    getSentimentIndex("Nocibé", range),
    getSentimentTrend7dPoints("Sephora"),
    getCompetitorComparison(range),
    getTopThemesInsight("Sephora", range, 5),
    getCriticalAlerts24hSummary(),
    getWeakSignalsScatter(range),
    getMentionVolume("Sephora", range),
  ]);

  const dataSummary: string[] = [];

  if (sephoraSent.ok && nocibeSent.ok) {
    dataSummary.push(`Sentiment Sephora: ${sephoraSent.data.score}/100, Nocibé: ${nocibeSent.data.score}/100`);
  }
  if (trend7d.ok && trend7d.data.deltaPoints != null) {
    dataSummary.push(`Tendance 7j: ${trend7d.data.deltaPoints > 0 ? "+" : ""}${trend7d.data.deltaPoints} pts (${trend7d.data.direction})`);
  }
  if (comparison.ok) {
    const s = comparison.data.sephora;
    const n = comparison.data.nocibe;
    dataSummary.push(`Volume: Sephora ${s.mentionVolume} vs Nocibé ${n.mentionVolume}`);
    dataSummary.push(`Note moyenne: Sephora ${s.avgNote?.toFixed(1)}/5 vs Nocibé ${n.avgNote?.toFixed(1)}/5`);
    dataSummary.push(`Top négatif Sephora: ${s.topThemeNegatif}, Nocibé: ${n.topThemeNegatif}`);
  }
  if (themes.ok) {
    dataSummary.push(`Top thèmes: ${themes.data.map((t) => `${t.theme}(${t.dominantSentiment})`).join(", ")}`);
  }
  if (alerts.ok && alerts.data) {
    dataSummary.push(`Alertes 24h: ${alerts.data.count} critiques, thème: ${alerts.data.dominantTheme}`);
  }
  if (weak.ok && weak.data.length > 0) {
    dataSummary.push(`Signaux faibles: ${weak.data.map((w) => `${w.theme}(vol+${w.volumeGrowth}%)`).join(", ")}`);
  }
  if (volume.ok) {
    dataSummary.push(`Volume total Sephora: ${volume.data.total}, delta: ${volume.data.deltaPct?.toFixed(1)}%`);
  }

  const key = process.env.MISTRAL_API_KEY;
  if (!key) {
    return Response.json(buildFallbackNBA(sephoraSent, nocibeSent, trend7d, comparison, themes, alerts, weak));
  }

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 25_000);
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Tu es le Chief Intelligence Officer de Sephora France. Analyse les données ci-dessous et génère des "Next Best Actions" stratégiques.

Réponds UNIQUEMENT en JSON valide avec cette structure:
{
  "actions": [
    {
      "id": "string",
      "title": "string (titre court)",
      "description": "string (2-3 phrases max)",
      "priority": "critical" | "high" | "medium" | "low",
      "category": "marketing" | "sav" | "produit" | "communication" | "concurrence" | "crm",
      "impact": "string (impact estimé en 1 phrase)",
      "deadline": "string (délai suggéré)",
      "kpi": "string (KPI à suivre)"
    }
  ]
}

Génère exactement 8 actions, triées par priorité. Base-toi sur les données réelles.`,
          },
          {
            role: "user",
            content: `Données actuelles du dashboard SEPHORA Intel:\n${dataSummary.join("\n")}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!res.ok) {
      return Response.json(buildFallbackNBA(sephoraSent, nocibeSent, trend7d, comparison, themes, alerts, weak));
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(raw) as { actions?: unknown[] };
      if (parsed.actions && Array.isArray(parsed.actions)) {
        return Response.json({ actions: parsed.actions, generatedAt: new Date().toISOString(), source: "mistral" });
      }
    } catch { /* fallback below */ }
    return Response.json(buildFallbackNBA(sephoraSent, nocibeSent, trend7d, comparison, themes, alerts, weak));
  } catch {
    return Response.json(buildFallbackNBA(sephoraSent, nocibeSent, trend7d, comparison, themes, alerts, weak));
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFallbackNBA(..._args: any[]) {
  return {
    actions: [
      {
        id: "nba-1",
        title: "Renforcer le SAV livraison",
        description: "Le thème livraison concentre les mentions les plus négatives. Mettre en place un suivi proactif J+2 avec notification client.",
        priority: "critical",
        category: "sav",
        impact: "Réduction de 20-30% des avis négatifs sur la livraison",
        deadline: "Cette semaine",
        kpi: "Score sentiment livraison",
      },
      {
        id: "nba-2",
        title: "Capitaliser sur l'expérience magasin",
        description: "Les retours sur l'accueil en boutique sont excellents. Amplifier via campagnes UGC et témoignages clients.",
        priority: "high",
        category: "marketing",
        impact: "+15% d'engagement sur les contenus magasin",
        deadline: "2 semaines",
        kpi: "Volume mentions positives magasin",
      },
      {
        id: "nba-3",
        title: "Surveiller la montée de Nocibé",
        description: "Nocibé gagne du terrain sur certaines plateformes. Intensifier la veille concurrentielle et ajuster le positionnement.",
        priority: "high",
        category: "concurrence",
        impact: "Maintien de l'écart de sentiment +5pts",
        deadline: "Continu",
        kpi: "Part de voix vs Nocibé",
      },
      {
        id: "nba-4",
        title: "Programme fidélité : communication ciblée",
        description: "Le thème fidélité génère des mentions mitigées. Clarifier les avantages et simplifier le parcours de points.",
        priority: "medium",
        category: "crm",
        impact: "+10% de satisfaction sur le programme fidélité",
        deadline: "1 mois",
        kpi: "NPS programme fidélité",
      },
      {
        id: "nba-5",
        title: "Optimiser l'application mobile",
        description: "Plusieurs verbatims mentionnent des bugs et une UX perfectible sur l'app. Prioriser les quick wins UX.",
        priority: "medium",
        category: "produit",
        impact: "Réduction des avis négatifs app de 25%",
        deadline: "Sprint prochain",
        kpi: "Note App Store / Play Store",
      },
      {
        id: "nba-6",
        title: "Campagne réponse aux avis négatifs",
        description: "Répondre systématiquement aux avis < 3 étoiles sur Trustpilot et Google dans les 24h.",
        priority: "medium",
        category: "communication",
        impact: "+0.3 pts de note moyenne",
        deadline: "Immédiat",
        kpi: "Taux de réponse aux avis négatifs",
      },
      {
        id: "nba-7",
        title: "Formation équipes conseil produit",
        description: "Le conseil en magasin est un différenciateur clé vs Nocibé. Renforcer la formation sur les nouvelles gammes.",
        priority: "low",
        category: "produit",
        impact: "+5% de satisfaction conseil",
        deadline: "Trimestre",
        kpi: "Score thème conseil",
      },
      {
        id: "nba-8",
        title: "Veille prix et promotions Nocibé",
        description: "Suivre les opérations commerciales de Nocibé pour adapter le calendrier promo Sephora en temps réel.",
        priority: "low",
        category: "concurrence",
        impact: "Réactivité commerciale améliorée",
        deadline: "Continu",
        kpi: "Écart de perception prix",
      },
    ],
    generatedAt: new Date().toISOString(),
    source: "fallback",
  };
}
