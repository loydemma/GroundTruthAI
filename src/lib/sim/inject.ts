import type { GeneratedClaim } from "../types";

// A plausible-but-unsupported commitment used when no sample-specific claim exists.
export const GENERIC_SIMULATED_CLAIM = "The customer agreed to sign a one-year contract.";

// Appends one clearly-labeled false claim so the checker can be shown catching a
// known defect. The judge is never told which claim is simulated.
export function injectSimulatedClaim(
  claims: GeneratedClaim[],
  sampleClaimText?: string,
): GeneratedClaim[] {
  return [
    ...claims,
    { text: sampleClaimText || GENERIC_SIMULATED_CLAIM, type: "commitment", simulated: true },
  ];
}
