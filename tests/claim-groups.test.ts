import { describe, it, expect } from "vitest";
import { groupClaims } from "../src/lib/ui/claimGroups";

describe("groupClaims", () => {
  it("orders groups summary → decision → commitment → action_item regardless of input order", () => {
    const claims = [
      { type: "action_item", text: "a" },
      { type: "commitment", text: "c" },
      { type: "summary", text: "s" },
      { type: "decision", text: "d" },
    ];
    expect(groupClaims(claims).map((g) => g.type)).toEqual([
      "summary",
      "decision",
      "commitment",
      "action_item",
    ]);
  });

  it("omits categories that have no claims", () => {
    const claims = [
      { type: "summary", text: "s" },
      { type: "decision", text: "d" },
    ];
    expect(groupClaims(claims).map((g) => g.type)).toEqual(["summary", "decision"]);
  });

  it("keeps claims of the same type in input order within their group", () => {
    const claims = [
      { type: "summary", text: "first" },
      { type: "summary", text: "second" },
    ];
    expect(groupClaims(claims)[0].claims.map((c) => c.text)).toEqual(["first", "second"]);
  });

  it("appends unknown types last instead of dropping them", () => {
    const claims = [
      { type: "mystery", text: "x" },
      { type: "summary", text: "s" },
    ];
    expect(groupClaims(claims).map((g) => g.type)).toEqual(["summary", "mystery"]);
  });

  it("returns an empty array for no claims", () => {
    expect(groupClaims([])).toEqual([]);
  });
});
