import { GroqClient, MODEL_NAME } from "@/lib/model/client";
import { runCheck, combineMetrics } from "@/lib/pipeline/pipeline";
import { getDb } from "@/lib/db/client";
import { transcripts, analyses, claims as claimsTable } from "@/lib/db/schema";
import { checkRateLimit, tooManyRequests } from "@/lib/rateLimit";
import { modelErrorResponse } from "@/lib/model/errors";
import type { GeneratedClaim, StageMetrics } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const { title, transcript, claims, generate } = (await req.json()) as {
    title: string;
    transcript: string;
    claims: GeneratedClaim[];
    generate?: StageMetrics;
  };
  if (!transcript?.trim()) {
    return Response.json({ error: "transcript is required" }, { status: 400 });
  }
  if (!Array.isArray(claims)) {
    return Response.json({ error: "claims are required" }, { status: 400 });
  }

  const genStage = generate ?? { latencyMs: 0, promptTokens: 0, completionTokens: 0 };

  try {
    // The Judge is a separate, independent model (Groq) from the Gemini Summarizer.
    const judge = new GroqClient();
    const { claims: verified, stage: judgeStage } = await runCheck(judge, transcript, claims);
    const metrics = combineMetrics(genStage, judgeStage, verified);

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
        latencyMs: metrics.totalLatencyMs,
        promptTokens: metrics.promptTokens,
        completionTokens: metrics.completionTokens,
      })
      .returning();
    const persistable = verified.filter((c) => !c.simulated);
    if (persistable.length > 0) {
      await db.insert(claimsTable).values(
        persistable.map((c) => ({
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

    return Response.json({ claims: verified, metrics });
  } catch (e) {
    console.error("check failed", e);
    return modelErrorResponse(e);
  }
}
