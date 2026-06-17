// Maps a thrown model/API error to a clean JSON Response so routes never return
// an empty-body 500 (which surfaces in the browser as "Unexpected end of JSON input").

function statusOf(e: unknown): number | undefined {
  if (typeof e === "object" && e !== null && "status" in e) {
    const s = (e as { status?: unknown }).status;
    if (typeof s === "number") return s;
  }
  return undefined;
}

export function modelErrorResponse(e: unknown): Response {
  const message = e instanceof Error ? e.message : String(e);
  const isRateLimited = statusOf(e) === 429 || /RESOURCE_EXHAUSTED|\b429\b/.test(message);

  if (isRateLimited) {
    return Response.json(
      {
        error:
          "Gemini's free-tier rate limit was hit (5 requests/minute). Wait about 30 seconds and try again.",
      },
      { status: 429, headers: { "Retry-After": "30" } }
    );
  }

  return Response.json(
    { error: "The model request failed. Please try again." },
    { status: 500 }
  );
}
