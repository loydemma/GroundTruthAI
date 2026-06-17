import { describe, it, expect } from "vitest";
import { modelErrorResponse } from "../src/lib/model/errors";

describe("modelErrorResponse", () => {
  it("returns 429 with a friendly message when the error carries status 429", async () => {
    const res = modelErrorResponse({ status: 429, message: "RESOURCE_EXHAUSTED" });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/rate limit/i);
  });

  it("detects a quota error from the message even without a status field", async () => {
    const res = modelErrorResponse(new Error("got 429 RESOURCE_EXHAUSTED from Gemini"));
    expect(res.status).toBe(429);
  });

  it("returns 500 for any other error", async () => {
    const res = modelErrorResponse(new Error("boom"));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error.length).toBeGreaterThan(0);
  });
});
