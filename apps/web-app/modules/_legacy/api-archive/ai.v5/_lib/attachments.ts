// /app/api/ai/_lib/attachments.ts

/* ============================================================
   ATTACHMENT SUMMARIZER (V4)
   Converts uploaded files & links into AI-safe design context
   - Non-blocking
   - Token-conscious
   - Prompt-injection resistant
============================================================ */

export interface AIAttachmentInput {
  name: string;
  type: "image" | "document" | "figma" | "other";
  textContent?: string; // extracted text (docx / txt / pdf)
  url?: string; // figma / external reference
}

export interface AIAttachmentSummary {
  summaryText: string;
}

/* ------------------------------------------------------------
   LIMITS (PROMPT SAFETY)
------------------------------------------------------------ */
const MAX_ATTACHMENTS = 5;
const MAX_TEXT_PER_DOC = 500;
const MAX_TOTAL_CHARS = 1500;

/**
 * Summarize attachments into compact, AI-safe design guidance.
 * This output is injected into the AI system prompt.
 */
export function summarizeAttachments(
  attachments?: AIAttachmentInput[]
): AIAttachmentSummary | null {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return null;
  }

  const lines: string[] = [];
  let totalChars = 0;

  for (const file of attachments.slice(0, MAX_ATTACHMENTS)) {
    let line = "";

    // ---------------------------------------------------------
    // FIGMA
    // ---------------------------------------------------------
    if (file.type === "figma") {
      line = `Figma reference provided (${file.name}). Use layout structure, spacing, and component hierarchy as inspiration.`;
    }

    // ---------------------------------------------------------
    // IMAGES / SCREENSHOTS
    // ---------------------------------------------------------
    else if (file.type === "image") {
      line = `Image or screenshot reference (${file.name}). Match visual style, composition, color tone, and spacing.`;
    }

    // ---------------------------------------------------------
    // DOCUMENTS (Brand Guidelines, Copy Docs)
    // ---------------------------------------------------------
    else if (file.type === "document") {
      if (file.textContent && file.textContent.trim().length > 0) {
        const truncated = truncate(
          sanitizeText(file.textContent),
          MAX_TEXT_PER_DOC
        );

        line = `Brand or reference document (${file.name}) highlights:\n${truncated}`;
      } else {
        line = `Brand or reference document (${file.name}) provided. Follow branding, tone, and messaging guidelines.`;
      }
    }

    // ---------------------------------------------------------
    // FALLBACK
    // ---------------------------------------------------------
    else {
      line = `Reference material provided (${file.name}). Use as contextual inspiration only.`;
    }

    totalChars += line.length;

    // Stop if prompt budget is exceeded
    if (totalChars > MAX_TOTAL_CHARS) {
      lines.push("Additional reference materials omitted to preserve prompt clarity.");
      break;
    }

    lines.push(line);
  }

  if (lines.length === 0) return null;

  return {
    summaryText: lines.join("\n\n"),
  };
}

/* ============================================================
   HELPERS
============================================================ */

/**
 * Truncate text to a safe length
 */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

/**
 * Remove prompt-injection style instructions and excess noise
 */
function sanitizeText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/(ignore previous instructions|system prompt|you are chatgpt)/gi, "")
    .trim();
}
