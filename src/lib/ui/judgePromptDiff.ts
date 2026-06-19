import { JUDGE_PROMPT, JUDGE_PROMPT_V1 } from "../pipeline/judge";
import { markPhrases, type PromptSegment } from "./promptHighlight";

// The rigid wording in v1 that caused grounded claims to be flagged.
const V1_PROBLEM_PHRASES = ["strict", "exact verbatim quotes"];

// The guidance v2 added to fix it: judge by meaning, and the citation clarifier.
const V2_ADDED_PHRASES = [
  `A claim is "supported" when the transcript states its meaning, even if the claim rewords, paraphrases, or summarizes it, including changes in grammatical person, tense, or phrasing. For example, a first-person commitment in the transcript ("I'll email you a confirmation") supports an action-item claim that restates it ("Email a confirmation to the customer"). Use "partially" when the transcript backs only part of the claim. Use "unsupported" only when no statement in the transcript conveys the claim's meaning. Judge by meaning, not by exact wording. `,
  `, the wording as it appears in the transcript, not the wording of the claim`,
];

// markPhrases throws if a phrase is missing, so these stay locked to the live
// prompt constants — the case study can never show a prompt that isn't real.
export function judgePromptV1Segments(): PromptSegment[] {
  return markPhrases(JUDGE_PROMPT_V1, V1_PROBLEM_PHRASES);
}

export function judgePromptV2Segments(): PromptSegment[] {
  return markPhrases(JUDGE_PROMPT, V2_ADDED_PHRASES);
}
