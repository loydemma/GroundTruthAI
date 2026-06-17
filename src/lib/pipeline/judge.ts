import type { ModelClient, ModelResponse } from "../model/client";
import type { GeneratedClaim, JudgedClaim, Verdict } from "../types";
import { extractJson } from "./generate";

export interface JudgeItem {
  claim: GeneratedClaim;
  transcript: string;
}

export const JUDGE_PROMPT = `You are a strict faithfulness judge. You are given a numbered list of ITEMS, each with its own TRANSCRIPT and a CLAIM about it. For each item, decide whether that item's transcript supports that item's claim. Respond ONLY as JSON: { "results": [ { "verdict": "supported" | "partially" | "unsupported", "confidence": number between 0 and 1, "citedSpans": string[] } ] } with exactly one entry per item, in the same order as the items. citedSpans MUST be exact verbatim quotes copied from that item's transcript. If nothing supports the claim, use an empty array and verdict "unsupported".`;

function renderItem(item: JudgeItem, i: number): string {
  return `ITEM ${i + 1}\nTRANSCRIPT:\n${item.transcript}\n\nCLAIM:\n${item.claim.text}`;
}

// Judges every claim in a single model call (one request, not one-per-claim) so
// the pipeline stays well under the free-tier rate limit.
export async function judgeClaims(
  client: ModelClient,
  items: JudgeItem[]
): Promise<{ judged: JudgedClaim[]; response: ModelResponse }> {
  const prompt = `${JUDGE_PROMPT}\n\n${items.map(renderItem).join("\n\n---\n\n")}`;
  const response = await client.complete(prompt, { temperature: 0 });
  const parsed = JSON.parse(extractJson(response.text)) as {
    results?: { verdict: Verdict; confidence: number; citedSpans?: string[] }[];
  };
  const results = parsed.results ?? [];

  const judged: JudgedClaim[] = items.map((item, i) => {
    const r = results[i];
    return {
      ...item.claim,
      verdict: r?.verdict ?? "unsupported",
      confidence: r?.confidence ?? 0,
      citedSpans: r?.citedSpans ?? [],
    };
  });

  return { judged, response };
}
