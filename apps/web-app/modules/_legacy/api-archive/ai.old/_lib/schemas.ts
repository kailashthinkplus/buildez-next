// /app/api/ai/_lib/schemas.ts
import { z } from "zod";

// ============================================================
// GENERIC AI INPUT SCHEMAS (SAFE, NON-PATCH)
// ============================================================

export const sectionSchema = z.object({
  sectionType: z.string(),
  prompt: z.string(),
});

export const rewriteSectionSchema = z.object({
  sectionId: z.string(),
  content: z.string(),
  instructions: z.string(),
});

export const pageSchema = z.object({
  prompt: z.string(),
  tone: z.string().optional(),
});

export const rewritePageSchema = z.object({
  pageId: z.string(),
  content: z.string(),
  instructions: z.string(),
});

export const outlineSchema = z.object({
  topic: z.string(),
});

export const themeSchema = z.object({
  brandName: z.string(),
  description: z.string(),
});

// ============================================================
// BlueprintNode Schema (V4 — FULL TREE VALIDATION)
// ============================================================

export const blueprintNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum([
      "page",
      "section",
      "container",
      "column",
      "text",
      "heading",
      "button",
      "image",
      "spacer",
    ]),
    props: z.record(z.any()).default({}),
    children: z.array(blueprintNodeSchema).default([]),
  })
);

export const blueprintPageSchema = blueprintNodeSchema.refine(
  (node) => node.type === "page",
  { message: "Root blueprint node must be of type 'page'" }
);
