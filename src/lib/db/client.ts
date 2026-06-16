import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

type Db = ReturnType<typeof drizzle>;
let cached: Db | null = null;

// Lazy so `neon()` is only called at request time, not at build/import time
// (the connection string is absent during `next build`).
export function getDb(): Db {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    cached = drizzle(neon(url));
  }
  return cached;
}
