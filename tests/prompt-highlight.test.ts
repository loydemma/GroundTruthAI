import { describe, it, expect } from "vitest";
import { markPhrases } from "../src/lib/ui/promptHighlight";
import { judgePromptV1Segments, judgePromptV2Segments } from "../src/lib/ui/judgePromptDiff";
import { JUDGE_PROMPT, JUDGE_PROMPT_V1 } from "../src/lib/pipeline/judge";

describe("markPhrases", () => {
  it("marks each phrase and leaves the rest plain", () => {
    const segs = markPhrases("a big red dog", ["big", "dog"]);
    expect(segs).toEqual([
      { text: "a ", highlight: false },
      { text: "big", highlight: true },
      { text: " red ", highlight: false },
      { text: "dog", highlight: true },
    ]);
  });

  it("always concatenates back to the original text", () => {
    const text = "the quick brown fox";
    const joined = markPhrases(text, ["quick", "fox"])
      .map((s) => s.text)
      .join("");
    expect(joined).toBe(text);
  });

  it("throws when a phrase is absent so the display cannot drift", () => {
    expect(() => markPhrases("hello world", ["missing"])).toThrow(/phrase not found/);
  });
});

describe("judge prompt diff segments", () => {
  it("v1 segments reconcile exactly to the live JUDGE_PROMPT_V1", () => {
    expect(
      judgePromptV1Segments()
        .map((s) => s.text)
        .join(""),
    ).toBe(JUDGE_PROMPT_V1);
  });

  it("v2 segments reconcile exactly to the live JUDGE_PROMPT", () => {
    expect(
      judgePromptV2Segments()
        .map((s) => s.text)
        .join(""),
    ).toBe(JUDGE_PROMPT);
  });

  it("highlights the rigid wording in v1 and the new guidance in v2", () => {
    expect(judgePromptV1Segments().some((s) => s.highlight)).toBe(true);
    expect(judgePromptV2Segments().some((s) => s.highlight)).toBe(true);
  });
});
