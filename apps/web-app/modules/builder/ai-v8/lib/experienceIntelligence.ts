import type { AIV8BrandContext } from "../types";
import type { ResolvedDesignPlan } from "./designPlan";

type BrandContextWithName = AIV8BrandContext & { siteName?: string | null };

export interface ProfessionalBrief {
  businessName: string;
  audience: string;
  primaryOffer: string;
  conversionGoal: string;
  brandPosition: string;
  proofPoints: string[];
  visualDirection: string[];
  contentDepth: string[];
  competitorGapsToBeat: string[];
}

export interface ExperienceStrategy {
  brief: ProfessionalBrief;
  narrativeArc: string[];
  sectionMandates: Array<{
    id: string;
    role: string;
    mustDo: string[];
  }>;
  qualityBars: string[];
}

const GENERIC_PHRASES = [
  "transform your business",
  "unlock your potential",
  "innovative solutions",
  "seamless experience",
  "cutting-edge",
  "next level",
  "best in class",
  "we help businesses",
];

function pickBusinessName(userPrompt: string, brandContext: BrandContextWithName | null) {
  const siteName = brandContext?.siteName?.trim();
  if (siteName) return siteName;

  const quoted = userPrompt.match(/["']([^"']{2,60})["']/);
  if (quoted?.[1]) return quoted[1].trim();

  const named = userPrompt.match(/\b(?:for|called|named)\s+([A-Z][A-Za-z0-9& .-]{2,50})/);
  return named?.[1]?.trim() || "the brand";
}

function inferAudience(plan: ResolvedDesignPlan) {
  const byIndustry: Record<string, string> = {
    "real-estate": "buyers comparing high-trust property options and booking site visits",
    restaurant: "local diners choosing where to book or order today",
    saas: "teams evaluating a business software purchase and looking for proof",
    ecommerce: "shoppers comparing products, value, delivery, and trust signals",
    portfolio: "clients or employers judging taste, credibility, and outcomes",
    healthcare: "patients and families looking for safe, clear care information",
    education: "students and parents comparing programs, outcomes, and admissions",
    fitness: "people seeking a practical transformation plan and membership fit",
    travel: "travelers comparing packages, destinations, and booking confidence",
    legal: "clients seeking credible counsel and low-friction consultation",
    generic: "qualified prospects trying to understand the offer quickly",
  };

  return byIndustry[plan.recipe.key] || byIndustry.generic;
}

function inferConversionGoal(plan: ResolvedDesignPlan) {
  const byUseCase: Record<string, string> = {
    "lead-generation": "capture a qualified enquiry with a high-intent CTA",
    "appointment-booking": "drive appointment or reservation requests",
    "product-sales": "move visitors toward product selection and purchase",
    "service-showcase": "make services easy to compare and request",
    "personal-brand": "earn trust and drive direct outreach",
  };

  return byUseCase[plan.useCase] || byUseCase["lead-generation"];
}

function inferPrimaryOffer(userPrompt: string, plan: ResolvedDesignPlan) {
  const cleanPrompt = userPrompt.trim().replace(/\s+/g, " ");
  if (cleanPrompt.length <= 140) return cleanPrompt;

  const firstSentence = cleanPrompt.match(/^(.{40,180}?[.!?])\s/)?.[1];
  return firstSentence || `${plan.recipe.label} website experience`;
}

function buildProofPoints(plan: ResolvedDesignPlan) {
  const byIndustry: Record<string, string[]> = {
    "real-estate": ["verified inventory", "location advantages", "site visit CTA", "buyer testimonials"],
    restaurant: ["signature items", "hours and location", "reservation friction removed", "reviews"],
    saas: ["measurable outcomes", "workflow screenshots", "security or reliability cues", "customer quotes"],
    ecommerce: ["ratings", "shipping and returns", "price visibility", "secure checkout cue"],
    portfolio: ["selected outcomes", "client names or roles", "process clarity", "contact availability"],
    healthcare: ["doctor credentials", "timings", "emergency or booking details", "clear service scope"],
    education: ["program outcomes", "faculty credibility", "admissions steps", "placement or success stats"],
    fitness: ["trainer credentials", "program formats", "membership pricing", "trial CTA"],
    travel: ["package inclusions", "traveler reviews", "destination details", "booking support"],
    legal: ["practice areas", "attorney credentials", "consultation details", "measured case language"],
    generic: ["specific offer", "benefits", "process", "contact details"],
  };

  return byIndustry[plan.recipe.key] || byIndustry.generic;
}

export function buildExperienceStrategy({
  userPrompt,
  plan,
  brandContext,
}: {
  userPrompt: string;
  plan: ResolvedDesignPlan;
  brandContext: BrandContextWithName | null;
}): ExperienceStrategy {
  const businessName = pickBusinessName(userPrompt, brandContext);
  const proofPoints = buildProofPoints(plan);
  const visualDirection = Array.from(
    new Set([...plan.recipe.styleDirection, ...plan.styleHints])
  );

  const brief: ProfessionalBrief = {
    businessName,
    audience: inferAudience(plan),
    primaryOffer: inferPrimaryOffer(userPrompt, plan),
    conversionGoal: inferConversionGoal(plan),
    brandPosition: `${businessName} should feel ${visualDirection.join(", ")} while staying practical and conversion-led.`,
    proofPoints,
    visualDirection,
    contentDepth: [
      "Use concrete nouns from the user's prompt instead of broad startup language.",
      "Every section must answer one buyer question: what is it, why trust it, how it works, what it costs, or what to do next.",
      "Headlines should be specific enough that the business category is obvious without reading body copy.",
    ],
    competitorGapsToBeat: [
      "Avoid one-shot generic template copy by grounding each section in the inferred audience and offer.",
      "Avoid visual sameness by mixing section rhythms: split layouts, dense comparison areas, proof bands, and focused CTA blocks.",
      "Keep generated output editable in BuildEZ by using semantic sections and stable ids.",
      "Include review-ready basics: contrast, alt text, CTA clarity, responsive navigation, and real proof cues.",
    ],
  };

  return {
    brief,
    narrativeArc: [
      "Lead with a sharp category/value promise.",
      "Show the offer in concrete, inspectable detail.",
      "Build confidence with proof, process, credentials, and practical information.",
      "Close with one obvious next action.",
    ],
    sectionMandates: plan.recipe.requiredSections.map((section) => ({
      id: section.id,
      role: section.objective,
      mustDo: section.requiredElements,
    })),
    qualityBars: [
      "No lorem ipsum, TODO text, placeholders, fake href anchors, or generic hype phrases.",
      "Use responsive Tailwind classes on core layout blocks and navigation.",
      "Use semantic nav, main, section, and footer structure.",
      "Use accessible image alt text and readable contrast.",
      "Include at least two strong CTAs, with one above the fold and one near the end.",
      "Use varied layout density so the page feels designed, not stacked from identical cards.",
    ],
  };
}

export function buildExperienceInstructionBlock(strategy: ExperienceStrategy) {
  const { brief } = strategy;

  const sectionLines = strategy.sectionMandates
    .map((section, index) => {
      return `${index + 1}. id="${section.id}" | role: ${section.role} | must include: ${section.mustDo.join(", ")}`;
    })
    .join("\n");

  return [
    "PROFESSIONAL EXPERIENCE STRATEGY:",
    `Business/brand: ${brief.businessName}`,
    `Audience: ${brief.audience}`,
    `Primary offer: ${brief.primaryOffer}`,
    `Conversion goal: ${brief.conversionGoal}`,
    `Positioning: ${brief.brandPosition}`,
    `Visual direction: ${brief.visualDirection.join(", ") || "modern, credible, polished"}`,
    "",
    "Proof points to weave into the page:",
    brief.proofPoints.map((point) => `- ${point}`).join("\n"),
    "",
    "Narrative arc:",
    strategy.narrativeArc.map((step) => `- ${step}`).join("\n"),
    "",
    "Competitor gaps this output must beat:",
    brief.competitorGapsToBeat.map((gap) => `- ${gap}`).join("\n"),
    "",
    "Section mandates:",
    sectionLines,
    "",
    "Quality bars:",
    strategy.qualityBars.map((bar) => `- ${bar}`).join("\n"),
  ].join("\n");
}

export function scoreGeneratedExperience(
  code: string,
  requiredSectionIds: string[]
) {
  const warnings: string[] = [];
  let score = 100;

  const lower = code.toLowerCase();
  const ctaCount = (code.match(/<button|href=/gi) || []).length;
  const responsiveClassCount = (code.match(/\b(?:sm|md|lg|xl):/g) || []).length;
  const imgCount = (code.match(/<img\b/gi) || []).length;
  const missingSections = requiredSectionIds.filter(
    (id) => !new RegExp(`id=["']${id}["']`).test(code)
  );

  if (!/<nav[\s>]/i.test(code)) {
    warnings.push("Missing semantic nav.");
    score -= 10;
  }

  if (!/<main[\s>]/i.test(code)) {
    warnings.push("Missing semantic main.");
    score -= 10;
  }

  if (!/<footer[\s>]/i.test(code)) {
    warnings.push("Missing semantic footer.");
    score -= 8;
  }

  if (missingSections.length) {
    warnings.push(`Missing required sections: ${missingSections.join(", ")}.`);
    score -= missingSections.length * 12;
  }

  if (ctaCount < 4) {
    warnings.push("CTA density is low for a conversion page.");
    score -= 8;
  }

  if (responsiveClassCount < 10) {
    warnings.push("Responsive Tailwind coverage is thin.");
    score -= 10;
  }

  if (imgCount < 3) {
    warnings.push("Visual asset coverage is thin.");
    score -= 8;
  }

  if (/href=["']#["']/.test(code)) {
    warnings.push("Found non-meaningful href anchors.");
    score -= 8;
  }

  if (/<img(?![^>]*alt=)/i.test(code)) {
    warnings.push("At least one image is missing alt text.");
    score -= 8;
  }

  const genericHits = GENERIC_PHRASES.filter((phrase) => lower.includes(phrase));
  if (genericHits.length) {
    warnings.push(`Generic copy detected: ${genericHits.join(", ")}.`);
    score -= genericHits.length * 4;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    warnings,
  };
}
