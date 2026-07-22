import type { BuilderNode } from "../../types/blueprint";

export function normalizeSemanticText(value: unknown): string {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function semanticPurposeClass(value: unknown): string {
  const text = normalizeSemanticText(value);
  if (/proof|trust|credential|metric|closure/.test(text)) return "proof-trust";
  if (/convert|contact|lead|cta|consult|action/.test(text)) return "conversion";
  if (/gallery|project|portfolio|explor|lifestyle/.test(text)) return "discovery-gallery";
  if (/hero|orient|promise/.test(text)) return "orientation";
  if (/faq|objection/.test(text)) return "objection";
  if (/local|location|map/.test(text)) return "locality";
  return text;
}

export function duplicateFingerprint(input: {
  purpose?: unknown; headlineIntent?: unknown; ctaIntent?: unknown; contentRoles?: unknown[];
  componentCategory?: unknown; archetype?: unknown; sourcePattern?: unknown; conversionPurpose?: unknown;
}): string {
  return [
    semanticPurposeClass(input.purpose), semanticPurposeClass(input.headlineIntent),
    semanticPurposeClass(input.ctaIntent), (input.contentRoles ?? []).map(semanticPurposeClass).sort().join("+"),
    normalizeSemanticText(input.componentCategory), normalizeSemanticText(input.archetype),
    semanticPurposeClass(input.sourcePattern), semanticPurposeClass(input.conversionPurpose),
  ].join("|");
}

export function classifyOverflow(observation: {
  id?: string | null; width: number; height: number; scrollWidth: number; scrollHeight: number;
  overflowX?: string; overflowY?: string;
}) {
  const horizontalDelta = observation.scrollWidth - observation.width;
  const verticalDelta = observation.scrollHeight - observation.height;
  if (/rail|carousel|marquee/.test(observation.id ?? "") && ["auto", "scroll"].includes(observation.overflowX ?? "")) return "intentional-media-overflow";
  if (horizontalDelta <= 1 && verticalDelta > 0 && verticalDelta <= 3) return "measurement-rounding";
  if (observation.width < 220 && horizontalDelta > 1) return "narrow-track-text-wrapping";
  if (horizontalDelta > 1) return "true-horizontal-overflow";
  if (verticalDelta > 3) return "vertical-content-overflow";
  return "not-overflowing";
}

export function compilerForNode(node: BuilderNode | undefined, archetype: string | undefined) {
  const functions: Record<string, string> = {
    floatingProofSection: "compileFloatingProof", editorialSplitHero: "compileEditorialSplit",
    architecturalProjectShowcase: "compileArchitectural", galleryJourney: "compileGalleryJourney",
    imageStoryNarrative: "compileImageStory", framedCTA: "compileFramedCTA",
  };
  if (archetype && functions[archetype]) return { compilerFile: "website-engine/layout-archetypes/archetypeCompilers.ts", compilerFunction: functions[archetype] };
  return { compilerFile: "website-engine/builder-blueprint/recipes or component-recipes", compilerFunction: node?.type === "section" ? "compileSemanticBlueprint" : "recipe compiler" };
}
