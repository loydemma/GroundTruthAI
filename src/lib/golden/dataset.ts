import type { ClaimType } from "../types";

export interface GoldenItem {
  transcript: string;
  claimText: string;
  type: ClaimType;
  trulyUnsupported: boolean; // hand-labeled ground truth (true = fabricated/unsupported)
}

const RENEWAL =
  "Customer: We will renew the contract next quarter. Rep: Great, I'll send the paperwork by Friday.";

const BILLING =
  "Customer: I was double-charged this month. Agent: I'm sorry about that. I can see two charges on the 3rd. I'll refund one today. Customer: Thank you. How long does it take? Agent: Three to five business days.";

const ENTERPRISE =
  "Rep: Did you get a chance to look at the enterprise tier? Customer: I skimmed it. The SSO feature is interesting. Rep: Should I put together a quote? Customer: Maybe later. I can't commit to anything right now — I need to talk to my manager. Rep: Understood, no pressure.";

// Hand-labeled golden set. Positive class = trulyUnsupported (a hallucination to catch).
export const GOLDEN_SET: GoldenItem[] = [
  // --- Renewal call ---
  { transcript: RENEWAL, claimText: "The customer committed to renewing next quarter.", type: "commitment", trulyUnsupported: false },
  { transcript: RENEWAL, claimText: "The rep will send the paperwork by Friday.", type: "action_item", trulyUnsupported: false },
  { transcript: RENEWAL, claimText: "The customer requested a 20% discount.", type: "summary", trulyUnsupported: true },
  { transcript: RENEWAL, claimText: "The customer cancelled the contract.", type: "decision", trulyUnsupported: true },

  // --- Billing/support call ---
  { transcript: BILLING, claimText: "The customer was double-charged this month.", type: "summary", trulyUnsupported: false },
  { transcript: BILLING, claimText: "There were two charges on the 3rd.", type: "summary", trulyUnsupported: false },
  { transcript: BILLING, claimText: "The agent will issue a refund today.", type: "action_item", trulyUnsupported: false },
  { transcript: BILLING, claimText: "The refund takes three to five business days.", type: "summary", trulyUnsupported: false },
  { transcript: BILLING, claimText: "The agent offered a discount on the next invoice.", type: "commitment", trulyUnsupported: true },
  { transcript: BILLING, claimText: "The customer threatened to cancel their account.", type: "summary", trulyUnsupported: true },

  // --- Enterprise (ambiguous) call ---
  { transcript: ENTERPRISE, claimText: "The customer is interested in the SSO feature.", type: "summary", trulyUnsupported: false },
  { transcript: ENTERPRISE, claimText: "The customer needs to talk to their manager before committing.", type: "summary", trulyUnsupported: false },
  { transcript: ENTERPRISE, claimText: "The customer has not made a purchasing decision yet.", type: "decision", trulyUnsupported: false },
  { transcript: ENTERPRISE, claimText: "The customer agreed to purchase the enterprise tier.", type: "commitment", trulyUnsupported: true },
  { transcript: ENTERPRISE, claimText: "The customer asked the rep to send over a quote.", type: "action_item", trulyUnsupported: true },
  { transcript: ENTERPRISE, claimText: "The rep will follow up next week.", type: "action_item", trulyUnsupported: true },
];
