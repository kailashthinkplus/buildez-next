const IMAGE_REQUEST = /\b(generate|create|make|design|replace)\b.{0,40}\b(image|photo|illustration|graphic|banner|background|icon)\b/i;
const DETAIL_SIGNAL = /\b(hero|product|portrait|landscape|wide|square|vertical|photoreal|illustration|minimal|luxury|modern|background|transparent|showing|with|of)\b/i;
export function imageRequestNeedsClarification(prompt: string) {
  const normalized = prompt.trim();
  return IMAGE_REQUEST.test(normalized) && (!DETAIL_SIGNAL.test(normalized) || normalized.split(/\s+/).length < 6);
}
export const IMAGE_CLARIFICATION_MESSAGE = "What kind of image should I create? Choose a hero banner, product photo, background, illustration, icon, or lifestyle photo, then describe the subject and preferred visual style.";
