import DOMPurify from "isomorphic-dompurify";

/**
 * Rich-text HTML stored on a page node (`props.html`) is tenant-authored —
 * including via the AI generator and raw ZIP/project imports — and gets
 * rendered with dangerouslySetInnerHTML both on the tenant's own published
 * site and, via /preview, on the platform's own authenticated origin. It
 * must be sanitized at every render sink regardless of what ends up stored,
 * since the storage boundary (blueprint save APIs) accepts arbitrary JSON
 * and can't be trusted to have cleaned it first.
 */
export function sanitizeRichTextHtml(html: unknown): string {
  if (typeof html !== "string" || !html) return "";
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target"],
    // Inline `style` attributes are kept (rich-text editors rely on them
    // for color/alignment); only tags with no legitimate rich-text use are
    // stripped.
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
  });
}
