import { describe, it, expect } from "vitest";
import { siteGateDecision } from "../src/lib/siteGate";

describe("siteGateDecision", () => {
  it("allows everyone when no password is configured (gate dormant)", () => {
    const d = siteGateDecision({
      configuredPassword: undefined,
      cookieValue: undefined,
      queryValue: undefined,
    });
    expect(d.type).toBe("allow");
  });

  it("treats a blank/whitespace password as no password configured", () => {
    const d = siteGateDecision({
      configuredPassword: "   ",
      cookieValue: undefined,
      queryValue: "anything",
    });
    expect(d.type).toBe("allow");
  });

  it("prompts when a password is set but none is supplied", () => {
    const d = siteGateDecision({
      configuredPassword: "swordfish",
      cookieValue: undefined,
      queryValue: undefined,
    });
    expect(d.type).toBe("prompt");
  });

  it("prompts when the supplied credentials are wrong", () => {
    const d = siteGateDecision({
      configuredPassword: "swordfish",
      cookieValue: "nope",
      queryValue: "wrong",
    });
    expect(d.type).toBe("prompt");
  });

  it("allows when the cookie already holds the correct password", () => {
    const d = siteGateDecision({
      configuredPassword: "swordfish",
      cookieValue: "swordfish",
      queryValue: undefined,
    });
    expect(d.type).toBe("allow");
  });

  it("authorizes (sets the cookie) when the correct password arrives via query", () => {
    const d = siteGateDecision({
      configuredPassword: "swordfish",
      cookieValue: undefined,
      queryValue: "swordfish",
    });
    expect(d.type).toBe("authorize");
  });
});
