export function isSection(type: string) {
  return type.startsWith("section_");
}

export function isBlock(type: string) {
  return !type.startsWith("section_") && type !== "page";
}
