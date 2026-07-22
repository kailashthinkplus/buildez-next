import type { BuilderBlueprintInput } from "../builder-blueprint/builderBlueprint";

export type CompositionStyle = "editorial" | "cinematic" | "minimal" | "luxury" | "bold" | "technical" | "warm" | "premium";
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
  metadataOnly: true;
  deterministic: true;
}>;

type Section = Readonly<{ id: string; componentId?: string; category?: string; purpose?: string }>;

function sections(input: BuilderBlueprintInput): Section[] {
  if (input.compositionResult?.orderedSectionSequence.length) return input.compositionResult.orderedSectionSequence.map((section) => ({ id: section.id, componentId: section.componentId, category: section.category, purpose: section.purpose }));
  return input.websiteSpec?.sections.map((section) => ({ id: String(section.id), componentId: section.componentVariantRef, category: section.type, purpose: section.purpose })) ?? [];
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
  return Object.freeze({ visualPersonality: direction.personality, compositionStyle: direction.style, sectionStrategy: Object.freeze({ maximumRecommendedSectionCount: profile.premium ? 9 : 8, sectionHierarchy: Object.freeze(items.map((item) => item.id)), narrativeFlow: Object.freeze(narrativeFlow), trustSectionIds: Object.freeze(trust.map((item) => item.id)), conversionSectionIds: Object.freeze(conversion.map((item) => item.id)), imageryDominantSectionIds: Object.freeze(imagery.map((item) => item.id)) }), antiTemplateRules: Object.freeze(warnings), visualRhythmPlan: Object.freeze({ sectionVariationScore: variation, largeImageMoments: Object.freeze(imagery.map((item) => item.id)), densityPattern: Object.freeze(densityPattern), contrastChanges: Math.max(1, Math.min(3, patterns.size - 1)), intentionalWhitespace: input.compositionResult?.visualBreathing?.level === "airy" || densityPattern.includes("open"), variedComposition: patterns.size >= 4 }), creativeScore, scoreDimensions: dimensions, creativeWarnings: Object.freeze(warnings), metadataOnly: true, deterministic: true });
}

export const CreativeDirectorCompiler = Object.freeze({ compile: compileCreativeDirection });
