export function validateLocalSelector(selector: string): boolean {
  const normalized = selector.trim();
  if (!/^selector(?=$|[\s>+~.#[:])/.test(normalized)) return false;
  if (/[{},]|\/\*|\*\/|:global\b/i.test(normalized)) return false;
  if (/\b(?:html|body)\b|:root\b/.test(normalized)) return false;
  return !/(^|[\s>+~])\*(?=$|[\s>+~.#[:])/.test(normalized);
}

export function scopeSelector(selector: string): string {
  if (!validateLocalSelector(selector)) throw new Error(`V11_CSS_SELECTOR_REJECTED: ${selector}`);
  return selector;
}
