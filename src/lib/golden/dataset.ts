import type { ClaimType } from "../types";

export interface GoldenItem {
  scenario: string; // short label, groups rows in the UI table
  transcript: string;
  claimText: string;
  type: ClaimType;
  whyTrap: string; // plain-language reason this case is easy to get wrong
  trulyUnsupported: boolean; // ground truth (true = fabricated/unsupported)
}

const DOUBLE_CHARGE =
  `Customer: Hi, I think I got billed twice for my subscription this month.
Agent: Let me take a look. I see two charges dated the 3rd, both for $29. You're right, that's a duplicate.
Customer: Can you fix it?
Agent: I've refunded one of them just now. It should land back on your card in three to five business days.
Customer: Okay. And can you make sure it doesn't happen again next month?
Agent: I've added a note to your account and flagged it for our billing team to review before the next cycle.
Customer: Great, thanks.`;

const LOGIN =
  `Customer: I can't log in. It keeps saying my password is wrong.
Agent: Let's get you back in. I'll send a reset link to the email on file. Can you confirm it's jordan@example.com?
Customer: Yes that's it.
Agent: Sent. Click the link, choose a new password, and you should be set. If it doesn't arrive in a few minutes, check your spam folder.
Customer: Got it, resetting now. Okay, I'm in. Thank you.
Agent: Glad that worked. Anything else?
Customer: No, that's all.`;

const CANCELLATION =
  `Customer: I want to cancel my plan. It's gotten too expensive.
Agent: I'm sorry to hear that. Before you go, can I ask what would make it work for you?
Customer: Honestly I just don't use it enough to justify the price.
Agent: That's fair. We do have a cheaper tier with the core features. Would you like me to send the details so you can compare?
Customer: Sure, you can send them. But I'm not promising anything.
Agent: Understood, no pressure. I'll email the comparison today.`;

// Golden set. Positive class = trulyUnsupported (a fabrication the judge should catch).
// The two "real" claims are paraphrased/implied on purpose, so a naive checker is
// tempted to wrongly flag them. The three "fabricated" claims sound plausible, so a
// model is tempted to wrongly accept them.
export const GOLDEN_SET: GoldenItem[] = [
  {
    scenario: "Double charge",
    transcript: DOUBLE_CHARGE,
    claimText: "The customer was charged twice for the same subscription.",
    type: "summary",
    whyTrap:
      "The call never says 'twice for the same subscription' word for word. It says two charges of $29 on the 3rd. A checker that only matches exact wording might flag this, but it is clearly supported.",
    trulyUnsupported: false,
  },
  {
    scenario: "Double charge",
    transcript: DOUBLE_CHARGE,
    claimText: "The agent promised the customer a discount on next month's bill.",
    type: "commitment",
    whyTrap:
      "A refund and a billing note are discussed, which sounds like making things right, so a model may invent a discount. No discount was ever offered.",
    trulyUnsupported: true,
  },
  {
    scenario: "Login help",
    transcript: LOGIN,
    claimText: "The customer was able to log in after resetting their password.",
    type: "summary",
    whyTrap:
      "The customer says 'I'm in' rather than 'I logged in successfully,' so the outcome is implied, not stated in those exact words. It is supported.",
    trulyUnsupported: false,
  },
  {
    scenario: "Login help",
    transcript: LOGIN,
    claimText: "The agent escalated the issue to the technical team.",
    type: "action_item",
    whyTrap:
      "Login problems often get escalated, so it sounds like a routine next step, but the agent fixed it with a reset link and escalated nothing.",
    trulyUnsupported: true,
  },
  {
    scenario: "Cancellation",
    transcript: CANCELLATION,
    claimText: "The customer agreed to switch to the cheaper plan.",
    type: "decision",
    whyTrap:
      "The customer agreed to receive the details and said they were not promising anything. A model can mistake openness to information for a decision. They did not agree to switch.",
    trulyUnsupported: true,
  },
];
