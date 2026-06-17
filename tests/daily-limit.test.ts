import { describe, it, expect } from "vitest";
import { createDailyLimiter } from "../src/lib/rateLimit";

const DAY = 86_400_000;

describe("createDailyLimiter", () => {
  it("consumes down to the limit then blocks, reporting remaining", () => {
    const l = createDailyLimiter(2);
    expect(l.consume("ip", 0)).toEqual({ ok: true, remaining: 1 });
    expect(l.consume("ip", 0)).toEqual({ ok: true, remaining: 0 });
    expect(l.consume("ip", 0)).toEqual({ ok: false, remaining: 0 });
  });

  it("peek does not consume", () => {
    const l = createDailyLimiter(2);
    expect(l.peek("ip", 0)).toEqual({ remaining: 2 });
    l.consume("ip", 0);
    expect(l.peek("ip", 0)).toEqual({ remaining: 1 });
  });

  it("resets at the next UTC day", () => {
    const l = createDailyLimiter(1);
    expect(l.consume("ip", 0).ok).toBe(true);
    expect(l.consume("ip", DAY - 1).ok).toBe(false);
    expect(l.consume("ip", DAY).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const l = createDailyLimiter(1);
    expect(l.consume("a", 0).ok).toBe(true);
    expect(l.consume("b", 0).ok).toBe(true);
    expect(l.consume("a", 0).ok).toBe(false);
  });
});
