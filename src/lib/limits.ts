// Cap on pasted transcript length. Guards the paid model routes against someone
// pasting a huge block of text and running up token cost. Enforced in the UI
// (textarea maxLength + counter) and again server-side in the generate route.
export const MAX_TRANSCRIPT_CHARS = 12_000;
