import type { BuilderBlueprintInput } from "../builder-blueprint/builderBlueprint";
import type { ArtDirectionBrief, ArtDirectionCompositionStyle } from "./ArtDirectionBrief";

export type CompositionStyle = ArtDirectionCompositionStyle;
export type CreativeScoreDimensions = Readonly<{ originality: number; emotionalImpact: number; visualStorytelling: number; brandDifferentiation: number; conversionConfidence: number }>;
export type CreativeWarning = Readonly<{ code: string; severity: "low" | "medium" | "high"; message: string; affectedSections: readonly string[] }>;
export type CreativeSectionStrategy = Readonly<{
  maximumRecommendedSectionCount: number;
  sectionHierarchy: readonly string[];
  narrativeFlow: readonly string[];
  trustSectionIds: readonly string[];
  conversionSectionIds: readonly string[];
  imageryDominantSectionIds: readonly string[];
}>;
export type CreativeDirectionPlan = Readonly<{
  visualPersonality: string;
  compositionStyle: CompositionStyle;
  sectionStrategy: CreativeSectionStrategy;
  antiTemplateRules: readonly CreativeWarning[];
  visualRhythmPlan: Readonly<{ sectionVariationScore: number; largeImageMoments: readonly string[]; densityPattern: readonly ("open" | "balanced" | "dense")[]; contrastChanges: number; intentionalWhitespace: boolean; variedComposition: boolean }>;
  creativeScore: number;
  scoreDimensions: CreativeScoreDimensions;
  creativeWarnings: readonly CreativeWarning[];
  artDirectionBrief: ArtDirectionBrief;
  executable: true;
  /** @deprecated The plan is executable from v1 onward. */
  metadataOnly: false;
  deterministic: true;
}>;

type Section = Readonly<{ id: string; componentId?: string; category?: string; purpose?: string }>;

function sections(input: BuilderBlueprintInput): Section[] {
  if (input.compositionResult?.orderedSectionSequence.length) return input.compositionResult.orderedSectionSequence.map((section) => ({ id: section.id, componentId: section.componentId, category: section.category, purpose: section.purpose }));
  return input.websiteSpec?.sections?.map((section) => ({ id: String(section.id), componentId: section.componentVariantRef, category: section.type, purpose: section.purpose })) ?? [];
}

function corpus(section: Section) { return `${section.id} ${section.componentId ?? ""} ${section.category ?? ""} ${section.purpose ?? ""}`.toLowerCase(); }
function isGrid(section: Section) { return /card|grid|matrix|catalogue|pricing|menu|feature/.test(corpus(section)); }
function isSplit(section: Section) { return /split|two.column/.test(corpus(section)); }
function isTrust(section: Section) { return /trust|proof|review|testimonial|credential|case.study|outcome/.test(corpus(section)); }
function isConversion(section: Section) { return /cta|conversion|contact|booking|appointment|reservation|enquiry|demo/.test(corpus(section)); }
function isImagery(section: Section) { return /gallery|media|showcase|portfolio|story|project|lifestyle|product|process/.test(corpus(section)); }

function identity(input: BuilderBlueprintInput) {
  return { family: String(input.websiteSpec?.business.family ?? "unknown").toLowerCase(), archetype: String(input.websiteSpec?.archetype ?? "").toLowerCase(), premium: /luxury|premium|fine.dining|enterprise|specialist/.test(`${input.websiteSpec?.archetype ?? ""} ${(input.designResult?.designIntent as { mood?: readonly string[] } | undefined)?.mood?.join(" ") ?? ""}`.toLowerCase()) };
}

function directionFor(family: string, archetype: string, premium: boolean): { personality: string; style: CompositionStyle } {
  if (family === "real_estate") {
    if (/affordable|community/.test(archetype)) return { personality: "community living with accessible residential confidence", style: "warm" };
    if (/investment|commercial/.test(archetype)) return { personality: "investment confidence with architectural authority", style: "premium" };
    return { personality: "luxury architectural editorial and premium developer showcase", style: "luxury" };
  }
  if (family === "automotive") return /service|repair/.test(archetype) ? { personality: "technical excellence with dependable ownership care", style: "technical" } : { personality: "performance engineering and luxury ownership", style: "bold" };
  if (family === "healthcare") return /specialist|clinic|doctor/.test(archetype) ? { personality: "specialist authority with human reassurance", style: "premium" } : { personality: "clinical trust and human wellness", style: "minimal" };
  if (family === "food_and_beverage" || family === "hospitality") return /fine|chef/.test(archetype) ? { personality: "culinary editorial and chef-led hospitality storytelling", style: "cinematic" } : { personality: "warm hospitality experience and approachable culinary discovery", style: "warm" };
  if (family === "technology_saas") return /enterprise|security|developer/.test(archetype) ? { personality: "technical clarity with enterprise product authority", style: "technical" } : { personality: "product authority and focused growth narrative", style: "bold" };
  return premium ? { personality: "premium editorial authority with differentiated storytelling", style: "premium" } : { personality: "clear editorial storytelling with confident conversion", style: "editorial" };
}

function warning(code: string, severity: CreativeWarning["severity"], message: string, affectedSections: readonly string[]): CreativeWarning { return Object.freeze({ code, severity, message, affectedSections: Object.freeze([...affectedSections]) }); }

function antiTemplateWarnings(items: readonly Section[], input: BuilderBlueprintInput): CreativeWarning[] {
  const warnings: CreativeWarning[] = [];
  for (let index = 2; index < items.length; index += 1) if (items.slice(index - 2, index + 1).every(isGrid)) warnings.push(warning("creative.card-fatigue", "high", "More than two consecutive card-grid sections create template fatigue.", items.slice(index - 2, index + 1).map((item) => item.id)));
  const split = items.filter(isSplit); if (split.length > 2) warnings.push(warning("creative.repeated-splits", "medium", "Repeated split layouts make the page composition predictable.", split.map((item) => item.id)));
  const grids = items.filter(isGrid); if (items.length >= 5 && grids.length / items.length >= .7) warnings.push(warning("creative.uniform-section-shell", "high", "Most sections repeat a heading, paragraph, and card-grid shell.", grids.map((item) => item.id)));
  const conversions = items.filter(isConversion); if (conversions.length > 2) warnings.push(warning("creative.cta-overload", "high", "Repeated standalone conversion blocks weaken conversion confidence.", conversions.map((item) => item.id)));
  const weights = input.compositionResult?.sectionWeights ?? []; const commonWeights = new Map<string, number>(); for (const item of weights) commonWeights.set(item.weight, (commonWeights.get(item.weight) ?? 0) + 1);
  if (weights.length > 4 && Math.max(...commonWeights.values()) / weights.length >= .8) warnings.push(warning("creative.identical-spacing-rhythm", "medium", "Equal section weight creates an undifferentiated spacing rhythm.", weights.map((item) => item.sectionId)));
  const standalone = items.filter((item) => /faq|feature|service|amenit|comparison|information|catalogue/.test(corpus(item))); if (standalone.length > 5) warnings.push(warning("creative.information-fragmentation", "medium", "Too many standalone information sections interrupt the experience.", standalone.map((item) => item.id)));
  const imagery = items.filter(isImagery); if (imagery.length < Math.min(2, Math.ceil(items.length / 5))) warnings.push(warning("creative.weak-storytelling", "high", "The composition has insufficient visual storytelling.", imagery.map((item) => item.id)));
  const colors = input.designResult?.colorProfile; if (items.length > 5 && colors && /#(?:f[0-9a-f]){3,6}|beige|cream|neutral/i.test(`${colors.background} ${colors.muted} ${colors.paletteName}`) && !items.some((item) => /contrast|dark|accent/.test(corpus(item)))) warnings.push(warning("creative.excessive-neutrality", "low", "Neutral surfaces lack an intentional contrast moment.", items.map((item) => item.id)));
  return [...new Map(warnings.map((item) => [`${item.code}:${item.affectedSections.join(",")}`, item])).values()];
}

function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

function artDirectionBrief(input: BuilderBlueprintInput, direction: { personality: string; style: CompositionStyle }, items: readonly Section[], warnings: readonly CreativeWarning[], densityPattern: readonly ("open" | "balanced" | "dense")[]): ArtDirectionBrief {
  const family = identity(input).family;
  const expressive = ["luxury", "cinematic", "bold"].includes(direction.style);
  const technical = direction.style === "technical";
  const warm = direction.style === "warm";
  const imagery = items.filter(isImagery).length;
  const preferredTags = direction.style === "cinematic" ? ["editorial", "gallery", "lifestyle"] : direction.style === "luxury" ? ["premium", "editorial", "gallery"] : technical ? ["product", "service"] : warm ? ["story", "lifestyle"] : [direction.style];
  return Object.freeze({
    version: "1", id: `art-direction.${family}.${direction.style}`, visualPersonality: direction.personality, compositionStyle: direction.style,
    componentStrategy: Object.freeze({ preferredTags: Object.freeze(preferredTags), preferredFamilies: Object.freeze(expressive ? ["hero", "gallery", "proof"] : technical ? ["hero", "service", "proof"] : ["hero", "content", "conversion"]), discouragedPatterns: Object.freeze(warnings.map((item) => item.code)) }),
    compositionStrategy: Object.freeze({ rhythm: direction.style === "technical" ? "direct" : direction.style === "minimal" ? "trust-first" : direction.style === "cinematic" || direction.style === "luxury" || direction.style === "premium" ? "editorial" : family === "ecommerce_d2c" ? "commerce" : "guided", breathing: expressive ? "airy" : technical ? "compact" : "balanced", mediaRhythm: expressive || imagery >= 2 ? "alternating" : "content-led", densityPattern: Object.freeze([...densityPattern]), maximumSectionCount: expressive ? 9 : 8, emphasizeImagery: expressive || direction.style === "editorial", varySectionWeight: direction.style !== "technical" }),
    blueprintStrategy: Object.freeze({ containerMode: direction.style === "cinematic" ? "wide" : direction.style === "luxury" || direction.style === "premium" ? "framed" : "contained", headingScale: expressive ? "dramatic" : direction.style === "editorial" || direction.style === "bold" ? "expressive" : "restrained", sectionContrast: direction.style === "bold" || technical ? "strong" : expressive ? "alternating" : "subtle", mediaTreatment: direction.style === "cinematic" ? "immersive" : expressive || direction.style === "editorial" ? "editorial" : "controlled", cornerTreatment: technical ? "square" : warm ? "rounded" : "soft" }),
    antiTemplateRules: Object.freeze(warnings.map((item) => item.code)), deterministic: true,
  });
}

export function compileCreativeDirection(input: BuilderBlueprintInput): CreativeDirectionPlan {
  const items = sections(input); const profile = identity(input); const direction = directionFor(profile.family, profile.archetype, profile.premium); const warnings = antiTemplateWarnings(items, input);
  const trust = items.filter(isTrust); const conversion = items.filter(isConversion); const imagery = items.filter(isImagery); const patterns = new Set(items.map((item) => isGrid(item) ? "grid" : isSplit(item) ? "split" : isTrust(item) ? "proof" : isConversion(item) ? "conversion" : isImagery(item) ? "media" : "narrative"));
  const weights = input.compositionResult?.sectionWeights ?? []; const weightKinds = new Set(weights.map((item) => item.weight)); const densityPattern = items.map((item, index) => isGrid(item) ? "dense" as const : isImagery(item) || index === 0 ? "open" as const : "balanced" as const);
  const variation = clamp(55 + patterns.size * 7 + Math.min(12, imagery.length * 4) + (weightKinds.size > 1 ? 8 : 0) - warnings.reduce((sum, item) => sum + (item.severity === "high" ? 12 : item.severity === "medium" ? 7 : 3), 0));
  const penalty = warnings.reduce((sum, item) => sum + (item.severity === "high" ? 14 : item.severity === "medium" ? 8 : 3), 0);
  const dimensions: CreativeScoreDimensions = Object.freeze({
    originality: clamp(82 + patterns.size * 3 - penalty), emotionalImpact: clamp(80 + imagery.length * 5 + (profile.premium ? 5 : 0) - penalty),
    visualStorytelling: clamp(78 + imagery.length * 7 + (items.some((item) => /story/.test(corpus(item))) ? 5 : 0) - penalty), brandDifferentiation: clamp(82 + (profile.family !== "unknown" ? 8 : 0) + (profile.premium ? 4 : 0) - penalty),
    conversionConfidence: clamp(82 + (trust.length ? 7 : -12) + (conversion.length === 1 || conversion.length === 2 ? 7 : -10) - Math.max(0, penalty - 10)),
  });
  const creativeScore = clamp(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / 5);
  const narrativeFlow = items.map((item, index) => index === 0 ? "establish desire and point of view" : isImagery(item) ? "immerse through visual storytelling" : isTrust(item) ? "integrate proof into the experience" : isConversion(item) ? "resolve into a focused next step" : isGrid(item) ? "support structured exploration" : "advance the narrative");
  const brief = artDirectionBrief(input, direction, items, warnings, densityPattern);
  return Object.freeze({ visualPersonality: direction.personality, compositionStyle: direction.style, sectionStrategy: Object.freeze({ maximumRecommendedSectionCount: profile.premium ? 9 : 8, sectionHierarchy: Object.freeze(items.map((item) => item.id)), narrativeFlow: Object.freeze(narrativeFlow), trustSectionIds: Object.freeze(trust.map((item) => item.id)), conversionSectionIds: Object.freeze(conversion.map((item) => item.id)), imageryDominantSectionIds: Object.freeze(imagery.map((item) => item.id)) }), antiTemplateRules: Object.freeze(warnings), visualRhythmPlan: Object.freeze({ sectionVariationScore: variation, largeImageMoments: Object.freeze(imagery.map((item) => item.id)), densityPattern: Object.freeze(densityPattern), contrastChanges: Math.max(1, Math.min(3, patterns.size - 1)), intentionalWhitespace: input.compositionResult?.visualBreathing?.level === "airy" || densityPattern.includes("open"), variedComposition: patterns.size >= 4 }), creativeScore, scoreDimensions: dimensions, creativeWarnings: Object.freeze(warnings), artDirectionBrief: brief, executable: true, metadataOnly: false, deterministic: true });
}

export const CreativeDirectorCompiler = Object.freeze({ compile: compileCreativeDirection });
