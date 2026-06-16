export interface SampleTranscript {
  title: string;
  text: string;
}

export const SAMPLE_TRANSCRIPTS: SampleTranscript[] = [
  {
    title: "Sales call — renewal",
    text: `Rep: Thanks for hopping on. How has the rollout gone?
Customer: Honestly pretty well. The team adopted it faster than expected.
Rep: Glad to hear it. Are you thinking about the annual plan?
Customer: We're leaning that way. We'll renew next quarter once budget opens up.
Rep: Perfect — I'll send the renewal paperwork so it's ready.`,
  },
  {
    title: "Support call — billing issue",
    text: `Customer: I was double-charged this month.
Agent: I'm sorry about that. I can see two charges on the 3rd. I'll refund one today.
Customer: Thank you. How long does it take?
Agent: Three to five business days. I'll email you a confirmation.`,
  },
  {
    title: "Sales call — ambiguous (hallucination bait)",
    text: `Rep: Did you get a chance to look at the enterprise tier?
Customer: I skimmed it. The SSO feature is interesting.
Rep: Should I put together a quote?
Customer: Maybe later. I can't commit to anything right now — I need to talk to my manager.
Rep: Understood, no pressure.`,
  },
];
