import { markAlertResolved } from "@/lib/queries";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { id?: string };
    if (!body.id) return Response.json({ ok: false, error: "id requis" }, { status: 400 });
    const r = await markAlertResolved(body.id);
    if (!r.ok) return Response.json({ ok: false, error: r.error }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}
