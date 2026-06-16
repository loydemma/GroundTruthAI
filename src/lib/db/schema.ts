import { pgTable, serial, text, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

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
