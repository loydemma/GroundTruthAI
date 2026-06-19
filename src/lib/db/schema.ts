import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  rawText: text("raw_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  transcriptId: integer("transcript_id")
    .references(() => transcripts.id)
    .notNull(),
  modelName: text("model_name").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  promptTokens: integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id")
    .references(() => analyses.id)
    .notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(),
  verdict: text("verdict").notNull(),
  confidence: real("confidence").notNull(),
  citedSpans: jsonb("cited_spans").notNull(),
  verified: boolean("verified").notNull(),
  flagged: boolean("flagged").notNull(),
});

// Durable per-IP daily quota for the paid Gemini route. Keyed by (ip, UTC day) so
// the count survives reloads, cold starts, and multiple serverless instances —
// unlike the in-memory anti-spam limiter, which is per-process and best-effort.
export const dailyUsage = pgTable(
  "daily_usage",
  {
    ip: text("ip").notNull(),
    day: integer("day").notNull(), // UTC day index: floor(epochMs / 86_400_000)
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.ip, t.day] })],
);
