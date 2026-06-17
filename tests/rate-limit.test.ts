import { describe, it, expect } from "vitest";
import { createRateLimiter } from "../src/lib/rateLimit";

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const check = createRateLimiter(3, 1000);
    expect(check("ip", 0).ok).toBe(true);
    expect(check("ip", 0).ok).toBe(true);
    expect(check("ip", 0).ok).toBe(true);
    const blocked = check("ip", 0);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfter).toBe(1);
  });

  it("resets once the window has elapsed", () => {
    const check = createRateLimiter(1, 1000);
    expect(check("ip", 0).ok).toBe(true);
    expect(check("ip", 500).ok).toBe(false);
    expect(check("ip", 1000).ok).toBe(true);
  });

  it("tracks each key independently", () => {
    const check = createRateLimiter(1, 1000);
    expect(check("a", 0).ok).toBe(true);
    expect(check("b", 0).ok).toBe(true);
    expect(check("a", 0).ok).toBe(false);
  });
});
