// /Users/kailash/buildez/apps/web-app/modules/builder/ai/prompt/pageContext.ts

/* ============================================================
   LAYER 3 — PAGE CONTEXT (GROUNDING)
   Purpose: Prevent scope drift and anchor AI intent
============================================================ */

export function pageContext(input?: {
  pagePurpose?: string;
  deviceStrategy?: "mobile-first" | "desktop-first";
  existingPageSummary?: string;
}) {
  return `
PAGE CONTEXT:
- Page purpose: ${input?.pagePurpose ?? "marketing website"}
- Page scope: SINGLE PAGE ONLY
- Target device strategy: ${input?.deviceStrategy ?? "mobile-first"}
- Audience intent: conversion-focused
- Content type: static marketing content

STRICT PAGE RULES:
- Do NOT generate dashboards, apps, or tools
- Do NOT include authentication, analytics, or backend logic
- Do NOT reference other pages
- Do NOT assume navigation unless explicitly instructed
- Do NOT modify global headers or footers unless instructed

${input?.existingPageSummary ? `
EXISTING PAGE SUMMARY:
${input.existingPageSummary}
` : ""}
`.trim();
}
