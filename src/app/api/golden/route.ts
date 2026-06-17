import { GeminiClient } from "@/lib/model/client";
import { judgeClaim } from "@/lib/pipeline/judge";
import { verifyClaim } from "@/lib/pipeline/verify";
import { GOLDEN_SET } from "@/lib/golden/dataset";
import { scoreGolden, type GoldenPrediction } from "@/lib/golden/score";
import { checkRateLimit, tooManyRequests } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const client = new GeminiClient();
  const predictions: GoldenPrediction[] = [];
  for (const item of GOLDEN_SET) {
    const { judged } = await judgeClaim(
      client,
      { text: item.claimText, type: item.type },
      item.transcript
    );
    const verified = verifyClaim(judged, item.transcript);
    const predictedUnsupported = judged.verdict !== "supported" || !verified.verified;
    predictions.push({ trulyUnsupported: item.trulyUnsupported, predictedUnsupported });
  }
  return Response.json({ score: scoreGolden(predictions), n: GOLDEN_SET.length });
}
