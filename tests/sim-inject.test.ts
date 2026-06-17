import { describe, it, expect } from "vitest";
import { injectSimulatedClaim, GENERIC_SIMULATED_CLAIM } from "../src/lib/sim/inject";
import type { GeneratedClaim } from "../src/lib/types";

const base: GeneratedClaim[] = [{ text: "Customer asked about pricing.", type: "summary" }];

describe("injectSimulatedClaim", () => {
  it("appends exactly one claim flagged simulated", () => {
    const out = injectSimulatedClaim(base);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual(base[0]);
    expect(out[1].simulated).toBe(true);
    expect(out[1].type).toBe("commitment");
  });

  it("uses the tailored sample text when given", () => {
    const out = injectSimulatedClaim(base, "The customer agreed to sign by Friday.");
    expect(out[1].text).toBe("The customer agreed to sign by Friday.");
  });

  it("falls back to the generic claim when no sample text is given", () => {
    const out = injectSimulatedClaim(base);
    expect(out[1].text).toBe(GENERIC_SIMULATED_CLAIM);
  });

  it("does not mutate the input array", () => {
    injectSimulatedClaim(base);
    expect(base).toHaveLength(1);
  });
});
