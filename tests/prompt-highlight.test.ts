import { describe, it, expect } from "vitest";
import { markPhrases } from "../src/lib/ui/promptHighlight";
import { judgePromptV1Segments, judgePromptV2Segments } from "../src/lib/ui/judgePromptDiff";
import { JUDGE_PROMPT, JUDGE_PROMPT_V1 } from "../src/lib/pipeline/judge";

describe("markPhrases", () => {
  it("tags each phrase with its group kind and leaves the rest plain", () => {
    const segs = markPhrases("a big red dog", [{ phrases: ["big", "dog"], kind: "added" }]);
    expect(segs).toEqual([
      { text: "a ", kind: null },
      { text: "big", kind: "added" },
      { text: " red ", kind: null },
      { text: "dog", kind: "added" },
    ]);
  });

  it("colors different groups with different kinds", () => {
    const segs = markPhrases("safe danger", [
      { phrases: ["safe"], kind: "added" },
      { phrases: ["danger"], kind: "security" },
    ]);
    expect(segs.map((s) => s.kind)).toEqual(["added", null, "security"]);
  });

  it("always concatenates back to the original text", () => {
    const text = "the quick brown fox";
    const joined = markPhrases(text, [{ phrases: ["quick", "fox"], kind: "added" }])
      .map((s) => s.text)
      .join("");
    expect(joined).toBe(text);
  });

  it("throws when a phrase is absent so the display cannot drift", () => {
    expect(() => markPhrases("hello world", [{ phrases: ["missing"], kind: "added" }])).toThrow(
      /phrase not found/,
    );
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
    expect(judgePromptV1Segments().some((s) => s.kind === "problem")).toBe(true);
    expect(judgePromptV2Segments().some((s) => s.kind === "added")).toBe(true);
  });

  it("highlights the security hardening as its own kind in v2", () => {
    expect(judgePromptV2Segments().some((s) => s.kind === "security")).toBe(true);
  });
});
