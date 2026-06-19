import { GeminiClient } from "@/lib/model/client";
import { runGenerate } from "@/lib/pipeline/pipeline";
import { checkRateLimit, tooManyRequests, clientIp } from "@/lib/rateLimit";
import { consumeDaily, peekDaily, dailyLimitReached } from "@/lib/db/dailyLimit";
import { modelErrorResponse } from "@/lib/model/errors";
import { MAX_TRANSCRIPT_CHARS } from "@/lib/limits";

export const dynamic = "force-dynamic";

// Lets the UI show remaining tries on load without spending one.
export async function GET(req: Request) {
  return Response.json(await peekDaily(clientIp(req)));
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const daily = await consumeDaily(clientIp(req));
  if (!daily.ok) return dailyLimitReached();

  const { transcript } = (await req.json()) as { transcript: string };
  if (!transcript?.trim()) {
    return Response.json({ error: "transcript is required" }, { status: 400 });
  }
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    return Response.json(
      { error: `Transcript is too long (max ${MAX_TRANSCRIPT_CHARS.toLocaleString()} characters).` },
      { status: 413 },
    );
  }

  try {
    const client = new GeminiClient();
    const { claims, stage } = await runGenerate(client, transcript);
    return Response.json({ claims, generate: stage, remaining: daily.remaining });
  } catch (e) {
    console.error("generate failed", e);
    return modelErrorResponse(e);
  }
}
