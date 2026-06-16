import { GeminiClient } from "@/lib/model/client";
import { runGenerate } from "@/lib/pipeline/pipeline";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { transcript } = (await req.json()) as { transcript: string };
  if (!transcript?.trim()) {
    return Response.json({ error: "transcript is required" }, { status: 400 });
  }

  const client = new GeminiClient();
  const { claims, stage } = await runGenerate(client, transcript);
  return Response.json({ claims, generate: stage });
}
