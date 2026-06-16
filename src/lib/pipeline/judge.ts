import type { ModelClient, ModelResponse } from "../model/client";
import type { GeneratedClaim, JudgedClaim, Verdict } from "../types";
import { extractJson } from "./generate";

export const JUDGE_PROMPT = `You are a strict faithfulness judge. Given a transcript and a single CLAIM about it, decide whether the transcript supports the claim. Respond ONLY as JSON: { "verdict": "supported" | "partially" | "unsupported", "confidence": number between 0 and 1, "citedSpans": string[] }. citedSpans MUST be exact verbatim quotes copied from the transcript that justify the claim. If nothing supports it, use an empty array and verdict "unsupported".`;

export async function judgeClaim(
  client: ModelClient,
  claim: GeneratedClaim,
  transcript: string
): Promise<{ judged: JudgedClaim; response: ModelResponse }> {
  const prompt = `${JUDGE_PROMPT}\n\nTRANSCRIPT:\n${transcript}\n\nCLAIM:\n${claim.text}`;
  const response = await client.complete(prompt, { temperature: 0 });
  const parsed = JSON.parse(extractJson(response.text)) as {
    verdict: Verdict;
    confidence: number;
    citedSpans?: string[];
  };
  return {
    judged: {
      ...claim,
      verdict: parsed.verdict,
      confidence: parsed.confidence,
      citedSpans: parsed.citedSpans ?? [],
    },
    response,
  };
}
