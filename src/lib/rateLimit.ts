// Per-IP fixed-window rate limiter guarding the paid Gemini routes from being
// fired continuously (spam-clicks, held Enter, scripted curl loops).
//
// State is an in-memory Map, so it's per-process: fine for local dev and a single
// instance, but best-effort on serverless (each instance counts independently and
// state resets on cold start). For a hard global limit, back this with Redis/Upstash.

const MAX_REQUESTS = 10;
const WINDOW_MS = 30_000;

type Outcome = { ok: true } | { ok: false; retryAfter: number };

// Core limiter: own Map, explicit `now` for deterministic testing.
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return function check(key: string, now: number = Date.now()): Outcome {
    const hit = hits.get(key);
    if (!hit || now >= hit.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true };
    }
    if (hit.count >= maxRequests) {
      return { ok: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
    }
    hit.count += 1;
    return { ok: true };
  };
}

const limiter = createRateLimiter(MAX_REQUESTS, WINDOW_MS);

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "local";
}

// Route-facing wrapper: keys off the client IP.
export function checkRateLimit(req: Request): Outcome {
  return limiter(clientIp(req));
}

// Standard 429 response for a blocked request.
export function tooManyRequests(retryAfter: number): Response {
  return Response.json(
    { error: "Too many requests. Slow down and try again in a moment." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
