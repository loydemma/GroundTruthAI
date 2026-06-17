export interface SampleTranscript {
  title: string;
  text: string;
  simulatedClaim?: string; // plausible-but-false claim to plant in demo mode
}

export const SAMPLE_TRANSCRIPTS: SampleTranscript[] = [
  {
    title: "Sample support call",
    simulatedClaim: "The agent agreed to waive next month's bill.",
    text: `Customer: I was double-charged this month.
Agent: I'm sorry about that. I can see two charges on the 3rd. I'll refund one today.
Customer: Thank you. How long does it take?
Agent: Three to five business days. I'll email you a confirmation.`,
  },
];
