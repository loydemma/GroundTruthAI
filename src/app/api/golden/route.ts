import { GeminiClient } from "@/lib/model/client";
import { judgeClaims } from "@/lib/pipeline/judge";
import { GOLDEN_SET } from "@/lib/golden/dataset";
import { evaluateGolden } from "@/lib/golden/evaluate";
import { checkRateLimit, tooManyRequests } from "@/lib/rateLimit";
import { modelErrorResponse } from "@/lib/model/errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  try {
    const client = new GeminiClient();
    // Judge the whole labeled set in one call to stay within the free-tier rate limit.
    const { judged } = await judgeClaims(
      client,
      GOLDEN_SET.map((item) => ({
        claim: { text: item.claimText, type: item.type },
        transcript: item.transcript,
      }))
    );
    return Response.json(evaluateGolden(judged));
  } catch (e) {
    console.error("golden failed", e);
    return modelErrorResponse(e);
  }
}
