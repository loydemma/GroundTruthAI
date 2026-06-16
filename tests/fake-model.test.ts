import { describe, it, expect } from "vitest";
import { FakeModelClient } from "../src/lib/model/fake";

describe("FakeModelClient", () => {
  it("returns queued responses in order and records prompts", async () => {
    const fake = new FakeModelClient(["first", "second"]);
    const a = await fake.complete("p1");
    const b = await fake.complete("p2");
    expect(a.text).toBe("first");
    expect(b.text).toBe("second");
    expect(fake.prompts).toEqual(["p1", "p2"]);
    expect(a.promptTokens).toBeGreaterThan(0);
  });
});
