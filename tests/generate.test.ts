import { describe, it, expect } from "vitest";
import { generateClaims, GENERATE_PROMPT } from "../src/lib/pipeline/generate";
import { FakeModelClient } from "../src/lib/model/fake";

describe("generateClaims", () => {
  it("parses claims from the model's JSON and includes the transcript in the prompt", async () => {
    const json = JSON.stringify({
      claims: [
        { text: "Customer will renew next quarter.", type: "commitment" },
        { text: "Rep will send paperwork.", type: "action_item" },
      ],
    });
    const fake = new FakeModelClient([json]);
    const { claims, response } = await generateClaims(fake, "TRANSCRIPT_TEXT");
    expect(claims).toHaveLength(2);
    expect(claims[0].type).toBe("commitment");
    expect(fake.prompts[0]).toContain("TRANSCRIPT_TEXT");
    expect(fake.prompts[0]).toContain(GENERATE_PROMPT.slice(0, 20));
    expect(response.promptTokens).toBeGreaterThan(0);
  });

  it("tolerates JSON wrapped in markdown code fences", async () => {
    const fenced =
      "```json\n" + JSON.stringify({ claims: [{ text: "x", type: "summary" }] }) + "\n```";
    const fake = new FakeModelClient([fenced]);
    const { claims } = await generateClaims(fake, "t");
    expect(claims).toHaveLength(1);
  });
});
