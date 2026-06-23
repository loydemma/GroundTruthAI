// Password gate for the public demo. A low-stakes obscurity gate (it hides the
// portfolio demo until interview time — it is NOT real authentication and guards
// no sensitive data). Toggled entirely by the SITE_PASSWORD env/secret:
//
//   - SITE_PASSWORD unset/blank  → gate is DORMANT, the site is fully public.
//   - SITE_PASSWORD set          → visitors must supply it (via `?key=` once,
//                                   then a cookie remembers them).
//
// The request wrapper lives in `src/proxy.ts`. This file is the pure, testable core.

// Cookie that remembers an authorized visitor; query param that lets one in.
export const GATE_COOKIE = "gt_gate";
export const GATE_QUERY_PARAM = "key";

export type GateDecision =
  | { type: "allow" } // let the request through untouched
  | { type: "authorize" } // correct password via query → set cookie, then allow
  | { type: "prompt" }; // missing/wrong credentials → show the password page

export function siteGateDecision(params: {
  configuredPassword: string | undefined;
  cookieValue: string | undefined;
  queryValue: string | undefined;
}): GateDecision {
  const password = params.configuredPassword?.trim();
  if (!password) return { type: "allow" }; // gate dormant
  if (params.cookieValue === password) return { type: "allow" };
  if (params.queryValue === password) return { type: "authorize" };
  return { type: "prompt" };
}
