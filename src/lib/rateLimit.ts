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

function clientIp(req: Request): string {
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
    { error: "Too many requests — slow down and try again in a moment." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

// Per-IP daily quota for the paid model routes, so a demo can't run up cost.
// In-memory and per-process, same caveat as the anti-spam limiter above.
export const DAILY_MAX_REQUESTS = 25;

export function createDailyLimiter(maxRequests: number) {
  const hits = new Map<string, { count: number; day: number }>();
  const dayOf = (now: number) => Math.floor(now / 86_400_000); // UTC day index

  function current(key: string, now: number) {
    const hit = hits.get(key);
    const day = dayOf(now);
    return hit && hit.day === day ? hit : { count: 0, day };
  }

  return {
    consume(key: string, now: number = Date.now()): { ok: boolean; remaining: number } {
      const c = current(key, now);
      if (c.count >= maxRequests) return { ok: false, remaining: 0 };
      const next = { count: c.count + 1, day: c.day };
      hits.set(key, next);
      return { ok: true, remaining: maxRequests - next.count };
    },
    peek(key: string, now: number = Date.now()): { remaining: number } {
      const c = current(key, now);
      return { remaining: Math.max(0, maxRequests - c.count) };
    },
  };
}

const dailyLimiter = createDailyLimiter(DAILY_MAX_REQUESTS);

export function checkDailyLimit(req: Request): { ok: boolean; remaining: number } {
  return dailyLimiter.consume(clientIp(req));
}

export function peekDailyLimit(req: Request): { remaining: number } {
  return dailyLimiter.peek(clientIp(req));
}

export function dailyLimitReached(): Response {
  return Response.json(
    { error: "Daily demo limit reached, resets at midnight UTC.", remaining: 0 },
    { status: 429 },
  );
}
