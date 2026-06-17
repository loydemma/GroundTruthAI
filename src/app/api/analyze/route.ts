import { GeminiClient, MODEL_NAME } from "@/lib/model/client";
import { analyzeTranscript } from "@/lib/pipeline/pipeline";
import { getDb } from "@/lib/db/client";
import { transcripts, analyses, claims as claimsTable } from "@/lib/db/schema";
import { checkRateLimit, tooManyRequests } from "@/lib/rateLimit";
import { modelErrorResponse } from "@/lib/model/errors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const { title, transcript } = (await req.json()) as { title: string; transcript: string };
  if (!transcript?.trim()) {
    return Response.json({ error: "transcript is required" }, { status: 400 });
  }

  try {
    const client = new GeminiClient();
    const result = await analyzeTranscript(client, transcript);

    const db = getDb();
    const [t] = await db
      .insert(transcripts)
      .values({ title: title || "Untitled", rawText: transcript })
      .returning();
    const [a] = await db
      .insert(analyses)
      .values({
        transcriptId: t.id,
        modelName: MODEL_NAME,
        latencyMs: result.metrics.totalLatencyMs,
        promptTokens: result.metrics.promptTokens,
        completionTokens: result.metrics.completionTokens,
      })
      .returning();
    if (result.claims.length > 0) {
      await db.insert(claimsTable).values(
        result.claims.map((c) => ({
          analysisId: a.id,
          text: c.text,
          type: c.type,
          verdict: c.verdict,
          confidence: c.confidence,
          citedSpans: c.citedSpans,
          verified: c.verified,
          flagged: c.flagged,
        }))
      );
    }

    return Response.json(result);
  } catch (e) {
    console.error("analyze failed", e);
    return modelErrorResponse(e);
  }
}
