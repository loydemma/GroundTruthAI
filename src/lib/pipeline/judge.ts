import type { ModelClient, ModelResponse } from "../model/client";
import type { GeneratedClaim, JudgedClaim, Verdict } from "../types";
import { extractJson } from "./generate";

export interface JudgeItem {
  claim: GeneratedClaim;
  transcript: string;
}

// The original prompt. Kept for the home-page case study that shows why it caused
// false positives. NOT used to judge — superseded by JUDGE_PROMPT below.
export const JUDGE_PROMPT_V1 = `You are a strict faithfulness judge. You are given a numbered list of ITEMS, each with its own TRANSCRIPT and a CLAIM about it. For each item, decide whether that item's transcript supports that item's claim. Respond ONLY as JSON: { "results": [ { "verdict": "supported" | "partially" | "unsupported", "confidence": number between 0 and 1, "citedSpans": string[] } ] } with exactly one entry per item, in the same order as the items. citedSpans MUST be exact verbatim quotes copied from that item's transcript. If nothing supports the claim, use an empty array and verdict "unsupported".`;

// Live prompt. v1 conflated "judging support" with "citing exact quotes", so a
// reworded-but-true claim ("Refund one charge today" for "I'll refund one today")
// read as a mismatch and was wrongly flagged. v2 separates the two: support is
// judged by meaning, only citedSpans must be verbatim.
export const JUDGE_PROMPT = `You are a faithfulness judge. You are given a numbered list of ITEMS, each with its own TRANSCRIPT and a CLAIM about it. For each item, decide whether that item's transcript supports that item's claim. A claim is "supported" when the transcript states its meaning, even if the claim rewords, paraphrases, or summarizes it, including changes in grammatical person, tense, or phrasing. For example, a first-person commitment in the transcript ("I'll email you a confirmation") supports an action-item claim that restates it ("Email a confirmation to the customer"). Use "partially" when the transcript backs only part of the claim. Use "unsupported" only when no statement in the transcript conveys the claim's meaning. Judge by meaning, not by exact wording. Respond ONLY as JSON: { "results": [ { "verdict": "supported" | "partially" | "unsupported", "confidence": number between 0 and 1, "citedSpans": string[] } ] } with exactly one entry per item, in the same order as the items. citedSpans MUST be exact verbatim quotes copied from that item's transcript, the wording as it appears in the transcript, not the wording of the claim. If nothing supports the claim, use an empty array and verdict "unsupported".`;

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
