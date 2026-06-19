import { describe, it, expect } from "vitest";
import { utcDay, remainingFrom, DAILY_MAX_REQUESTS } from "../src/lib/db/dailyLimit";

const DAY = 86_400_000;

// The atomic increment + cap lives in a single SQL statement (see consumeDaily),
// so these cover the pure pieces: day bucketing and the remaining calculation.
describe("utcDay", () => {
  it("maps a timestamp to its UTC day index and rolls over at midnight", () => {
    expect(utcDay(0)).toBe(0);
    expect(utcDay(DAY - 1)).toBe(0);
    expect(utcDay(DAY)).toBe(1);
  });
});

describe("remainingFrom", () => {
  it("subtracts used from the max", () => {
    expect(remainingFrom(0)).toBe(DAILY_MAX_REQUESTS);
    expect(remainingFrom(1, 25)).toBe(24);
    expect(remainingFrom(25, 25)).toBe(0);
  });

  it("never reports negative remaining", () => {
    expect(remainingFrom(30, 25)).toBe(0);
  });
});
