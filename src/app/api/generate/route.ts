import { GeminiClient } from "@/lib/model/client";
import { runGenerate } from "@/lib/pipeline/pipeline";
import { checkRateLimit, tooManyRequests } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = checkRateLimit(req);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const { transcript } = (await req.json()) as { transcript: string };
  if (!transcript?.trim()) {
    return Response.json({ error: "transcript is required" }, { status: 400 });
  }

  const client = new GeminiClient();
  const { claims, stage } = await runGenerate(client, transcript);
  return Response.json({ claims, generate: stage });
}
