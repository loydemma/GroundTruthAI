import { and, eq, sql } from "drizzle-orm";
import { getDb } from "./client";
import { dailyUsage } from "./schema";

// Per-IP daily quota for the paid model route, backed by Postgres so it persists
// across reloads, cold starts, and serverless instances. Resets at midnight UTC.
export const DAILY_MAX_REQUESTS = 25;

// UTC day index. Pure, so the rollover logic is unit-testable without a clock.
export function utcDay(now: number = Date.now()): number {
  return Math.floor(now / 86_400_000);
}

export function remainingFrom(count: number, max: number = DAILY_MAX_REQUESTS): number {
  return Math.max(0, max - count);
}

// Counts one use against the quota and returns whether it was allowed. The whole
// decision is a single atomic statement: insert the first use, otherwise increment
// only while still under the cap. An over-cap conflict updates no row, so RETURNING
// comes back empty and we know the caller is blocked. Fails open on DB error — the
// in-memory anti-spam limiter still guards burst cost, and a DB blip shouldn't kill
// the demo.
export async function consumeDaily(
  ip: string,
  now: number = Date.now(),
  max: number = DAILY_MAX_REQUESTS,
): Promise<{ ok: boolean; remaining: number }> {
  const day = utcDay(now);
  try {
    const rows = await getDb()
      .insert(dailyUsage)
      .values({ ip, day, count: 1 })
      .onConflictDoUpdate({
        target: [dailyUsage.ip, dailyUsage.day],
        set: { count: sql`${dailyUsage.count} + 1` },
        setWhere: sql`${dailyUsage.count} < ${max}`,
      })
      .returning({ count: dailyUsage.count });

    if (rows.length === 0) return { ok: false, remaining: 0 };
    return { ok: true, remaining: remainingFrom(rows[0].count, max) };
  } catch (e) {
    console.error("daily limit consume failed, allowing request", e);
    return { ok: true, remaining: max };
  }
}

export async function peekDaily(
  ip: string,
  now: number = Date.now(),
  max: number = DAILY_MAX_REQUESTS,
): Promise<{ remaining: number }> {
  const day = utcDay(now);
  try {
    const rows = await getDb()
      .select({ count: dailyUsage.count })
      .from(dailyUsage)
      .where(and(eq(dailyUsage.ip, ip), eq(dailyUsage.day, day)));
    return { remaining: remainingFrom(rows[0]?.count ?? 0, max) };
  } catch (e) {
    console.error("daily limit peek failed", e);
    return { remaining: max };
  }
}

export function dailyLimitReached(): Response {
  return Response.json(
    { error: "Daily demo limit reached, resets at midnight UTC.", remaining: 0 },
    { status: 429 },
  );
}
