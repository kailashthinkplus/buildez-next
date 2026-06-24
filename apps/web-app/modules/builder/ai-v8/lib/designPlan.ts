import type { AIV8BrandContext } from "../types";

type IndustryCategory =
  | "real-estate"
  | "restaurant"
  | "saas"
  | "ecommerce"
  | "portfolio"
  | "healthcare"
  | "education"
  | "fitness"
  | "travel"
  | "legal"
  | "generic";

type UseCase =
  | "lead-generation"
  | "appointment-booking"
  | "product-sales"
  | "service-showcase"
  | "personal-brand";

interface SectionSpec {
  id: string;
  objective: string;
  requiredElements: string[];
}

interface DesignRecipe {
  key: IndustryCategory;
  label: string;
  keywords: string[];
  defaultUseCase: UseCase;
  styleDirection: string[];
  requiredSections: SectionSpec[];
  componentLibrary: string[];
  copyRules: string[];
}

export interface ResolvedDesignPlan {
  recipe: DesignRecipe;
  useCase: UseCase;
  confidence: number;
  matchedKeywords: string[];
  styleHints: string[];
}

const RECIPES: DesignRecipe[] = [
  {
    key: "real-estate",
    label: "Real Estate Premium",
    keywords: ["real estate", "property", "builder", "construction", "villa", "apartment", "realty"],
    defaultUseCase: "lead-generation",
    styleDirection: ["luxury", "credible", "architectural", "high-contrast"],
    requiredSections: [
      { id: "hero", objective: "Position brand and value", requiredElements: ["headline", "subheadline", "primary CTA", "secondary CTA"] },
      { id: "properties", objective: "Showcase inventory", requiredElements: ["3+ cards", "price", "location", "view details CTA"] },
      { id: "amenities", objective: "Highlight differentiators", requiredElements: ["icon grid", "short benefits"] },
      { id: "location", objective: "Reduce buyer friction", requiredElements: ["connectivity points", "nearby landmarks"] },
      { id: "cta", objective: "Capture intent", requiredElements: ["appointment CTA", "trust statement"] },
      { id: "footer", objective: "Provide confidence and navigation", requiredElements: ["contact", "quick links"] },
    ],
    componentLibrary: ["hero-overlay", "stats-strip", "property-card", "badge", "two-button-cta"],
    copyRules: ["Use premium vocabulary", "Mention trust cues and years of experience"],
  },
  {
    key: "restaurant",
    label: "Restaurant Reservation",
    keywords: ["restaurant", "cafe", "food", "dining", "bistro", "menu"],
    defaultUseCase: "appointment-booking",
    styleDirection: ["warm", "editorial", "sensory", "inviting"],
    requiredSections: [
      { id: "hero", objective: "Create appetite and urgency", requiredElements: ["headline", "reservation CTA", "ambience visual"] },
      { id: "menu", objective: "Show signature dishes", requiredElements: ["6+ dish cards", "price", "short description"] },
      { id: "specials", objective: "Drive high-margin orders", requiredElements: ["featured items", "chef recommendation"] },
      { id: "reservations", objective: "Capture bookings", requiredElements: ["form-like CTA area", "hours", "contact"] },
      { id: "footer", objective: "Provide practical info", requiredElements: ["address", "social", "timings"] },
    ],
    componentLibrary: ["dish-card", "chef-note", "reservation-panel", "testimonial-quote"],
    copyRules: ["Use sensory adjectives", "Keep descriptions concise and premium"],
  },
  {
    key: "saas",
    label: "SaaS Conversion",
    keywords: ["saas", "software", "platform", "automation", "dashboard", "productivity", "app"],
    defaultUseCase: "lead-generation",
    styleDirection: ["clean", "structured", "trustworthy", "modern"],
    requiredSections: [
      { id: "hero", objective: "State product value in one sentence", requiredElements: ["headline", "subheadline", "trial CTA", "demo CTA"] },
      { id: "features", objective: "Explain product capabilities", requiredElements: ["6+ feature items", "icon", "benefit-led copy"] },
      { id: "how", objective: "Reduce complexity", requiredElements: ["3-step flow", "short explanations"] },
      { id: "pricing", objective: "Enable decision", requiredElements: ["3 tiers", "highlighted plan", "CTA buttons"] },
      { id: "testimonials", objective: "Build social proof", requiredElements: ["quotes", "names", "role/company"] },
      { id: "cta", objective: "Final conversion push", requiredElements: ["single value prop", "primary CTA"] },
      { id: "footer", objective: "Support navigation", requiredElements: ["resources", "legal", "contact"] },
    ],
    componentLibrary: ["hero-split", "feature-grid", "pricing-table", "logo-wall", "kpi-card"],
    copyRules: ["Lead with outcomes, not features", "Keep headings short and concrete"],
  },
  {
    key: "ecommerce",
    label: "Ecommerce Product Sales",
    keywords: ["shop", "store", "ecommerce", "products", "retail", "buy", "cart"],
    defaultUseCase: "product-sales",
    styleDirection: ["visual", "conversion-focused", "clean", "energetic"],
    requiredSections: [
      { id: "hero", objective: "Highlight top offer", requiredElements: ["offer headline", "shop now CTA"] },
      { id: "categories", objective: "Speed product discovery", requiredElements: ["category tiles", "quick links"] },
      { id: "products", objective: "Sell core catalog", requiredElements: ["8+ product cards", "price", "rating", "buy CTA"] },
      { id: "benefits", objective: "Remove objections", requiredElements: ["shipping", "returns", "payments"] },
      { id: "cta", objective: "Capture undecided users", requiredElements: ["newsletter or promo", "CTA"] },
      { id: "footer", objective: "Policy and trust", requiredElements: ["support", "policies", "social"] },
    ],
    componentLibrary: ["product-card", "rating-chip", "promo-banner", "category-tile"],
    copyRules: ["Price and benefit must be visible above fold", "Use action-first CTAs"],
  },
  {
    key: "portfolio",
    label: "Portfolio Personal Brand",
    keywords: ["portfolio", "freelance", "designer", "developer", "creative", "personal"],
    defaultUseCase: "personal-brand",
    styleDirection: ["minimal", "editorial", "bold-typography", "showcase"],
    requiredSections: [
      { id: "hero", objective: "Position identity quickly", requiredElements: ["name", "role", "contact CTA"] },
      { id: "about", objective: "Build credibility", requiredElements: ["bio", "skills", "experience highlights"] },
      { id: "projects", objective: "Show outcomes", requiredElements: ["3+ project cards", "problem/solution snapshot"] },
      { id: "services", objective: "Clarify offerings", requiredElements: ["service list", "engagement CTA"] },
      { id: "testimonials", objective: "Validate quality", requiredElements: ["client quotes"] },
      { id: "contact", objective: "Enable outreach", requiredElements: ["email", "social links", "CTA"] },
      { id: "footer", objective: "Close strong", requiredElements: ["copyright", "links"] },
    ],
    componentLibrary: ["project-grid", "timeline", "skill-pill", "testimonial-card"],
    copyRules: ["Use first-person narrative", "Focus on measurable results"],
  },
  {
    key: "healthcare",
    label: "Healthcare Trust",
    keywords: ["hospital", "clinic", "healthcare", "doctor", "medical", "dental"],
    defaultUseCase: "appointment-booking",
    styleDirection: ["calm", "professional", "high-clarity", "credible"],
    requiredSections: [
      { id: "hero", objective: "Establish trust", requiredElements: ["care promise", "appointment CTA", "emergency detail"] },
      { id: "services", objective: "Show core treatments", requiredElements: ["service cards", "short descriptions"] },
      { id: "doctors", objective: "Show qualifications", requiredElements: ["doctor profiles", "credentials"] },
      { id: "appointment", objective: "Enable booking", requiredElements: ["booking CTA", "timings", "contact"] },
      { id: "footer", objective: "Support and compliance", requiredElements: ["contact", "departments", "legal"] },
    ],
    componentLibrary: ["doctor-card", "service-grid", "emergency-banner"],
    copyRules: ["Use reassuring, clear language", "Avoid exaggerated claims"],
  },
  {
    key: "education",
    label: "Education Admissions",
    keywords: ["school", "college", "academy", "education", "university", "course"],
    defaultUseCase: "lead-generation",
    styleDirection: ["academic", "optimistic", "structured", "credible"],
    requiredSections: [
      { id: "hero", objective: "Drive admissions", requiredElements: ["institution headline", "apply CTA"] },
      { id: "programs", objective: "Explain offerings", requiredElements: ["program cards", "duration", "outcome"] },
      { id: "faculty", objective: "Build confidence", requiredElements: ["faculty cards", "qualifications"] },
      { id: "placements", objective: "Show outcomes", requiredElements: ["placement stats", "partner logos"] },
      { id: "admissions", objective: "Guide decision", requiredElements: ["steps", "dates", "fees mention"] },
      { id: "footer", objective: "Support enquiries", requiredElements: ["contact", "campus links"] },
    ],
    componentLibrary: ["program-card", "faculty-card", "stat-band"],
    copyRules: ["Highlight outcomes and support", "Keep process steps explicit"],
  },
  {
    key: "fitness",
    label: "Fitness Membership",
    keywords: ["fitness", "gym", "workout", "trainer", "wellness", "yoga"],
    defaultUseCase: "service-showcase",
    styleDirection: ["bold", "energetic", "high-contrast", "motivational"],
    requiredSections: [
      { id: "hero", objective: "Spark action", requiredElements: ["transformation headline", "join CTA"] },
      { id: "programs", objective: "Package offerings", requiredElements: ["program cards", "difficulty/format"] },
      { id: "trainers", objective: "Show expertise", requiredElements: ["trainer profiles", "specialties"] },
      { id: "pricing", objective: "Enable signup", requiredElements: ["plans", "featured plan", "CTA"] },
      { id: "cta", objective: "Drive immediate action", requiredElements: ["trial CTA", "urgency cue"] },
      { id: "footer", objective: "Support visit/contact", requiredElements: ["location", "hours", "contact"] },
    ],
    componentLibrary: ["program-card", "plan-card", "trainer-card", "stat-badge"],
    copyRules: ["Use action verbs", "Keep copy concise and motivating"],
  },
  {
    key: "travel",
    label: "Travel Enquiry",
    keywords: ["travel", "tour", "holiday", "vacation", "resort", "trip"],
    defaultUseCase: "lead-generation",
    styleDirection: ["aspirational", "vibrant", "image-led", "story-driven"],
    requiredSections: [
      { id: "hero", objective: "Inspire exploration", requiredElements: ["destination headline", "explore CTA"] },
      { id: "destinations", objective: "Show options", requiredElements: ["destination cards", "trip highlights"] },
      { id: "packages", objective: "Structure buying", requiredElements: ["package tiers", "inclusions", "price from"] },
      { id: "reviews", objective: "Add trust", requiredElements: ["traveler testimonials"] },
      { id: "booking", objective: "Capture enquiry", requiredElements: ["enquiry CTA", "contact options"] },
      { id: "footer", objective: "Support planning", requiredElements: ["links", "contact", "social"] },
    ],
    componentLibrary: ["destination-card", "package-card", "review-card"],
    copyRules: ["Paint vivid destination imagery", "Keep logistics clear"],
  },
  {
    key: "legal",
    label: "Legal Consultation",
    keywords: ["legal", "law", "lawyer", "attorney", "firm", "litigation"],
    defaultUseCase: "lead-generation",
    styleDirection: ["authoritative", "minimal", "credible", "formal"],
    requiredSections: [
      { id: "hero", objective: "Build authority", requiredElements: ["firm value prop", "consultation CTA"] },
      { id: "practice", objective: "Clarify expertise", requiredElements: ["practice area cards"] },
      { id: "attorneys", objective: "Establish trust", requiredElements: ["attorney bios", "credentials"] },
      { id: "results", objective: "Show capability", requiredElements: ["case highlights", "outcomes"] },
      { id: "consultation", objective: "Capture leads", requiredElements: ["contact CTA", "availability"] },
      { id: "footer", objective: "Compliance and contact", requiredElements: ["address", "disclaimer", "links"] },
    ],
    componentLibrary: ["practice-card", "attorney-card", "result-card"],
    copyRules: ["Use professional tone", "Avoid sensational claims"],
  },
  {
    key: "generic",
    label: "Generic Business",
    keywords: [],
    defaultUseCase: "service-showcase",
    styleDirection: ["clean", "balanced", "modern", "conversion-first"],
    requiredSections: [
      { id: "hero", objective: "State what the business does", requiredElements: ["headline", "value prop", "primary CTA"] },
      { id: "features", objective: "Explain offer", requiredElements: ["feature cards", "benefits"] },
      { id: "about", objective: "Establish trust", requiredElements: ["company blurb", "proof points"] },
      { id: "cta", objective: "Drive action", requiredElements: ["single clear CTA"] },
      { id: "footer", objective: "Support navigation", requiredElements: ["contact", "links"] },
    ],
    componentLibrary: ["feature-card", "proof-strip", "cta-block"],
    copyRules: ["Keep value proposition concrete", "Use short, scannable sections"],
  },
];

const STYLE_HINTS = [
  "minimal",
  "luxury",
  "bold",
  "playful",
  "corporate",
  "premium",
  "elegant",
  "futuristic",
  "classic",
  "modern",
  "dark",
  "light",
] as const;

const USE_CASE_HINTS: Array<{ useCase: UseCase; keywords: string[] }> = [
  { useCase: "appointment-booking", keywords: ["book", "appointment", "reserve", "consultation", "schedule"] },
  { useCase: "product-sales", keywords: ["sell", "checkout", "cart", "products", "shop", "buy"] },
  { useCase: "lead-generation", keywords: ["leads", "inquiry", "enquiry", "contact us", "demo", "trial"] },
  { useCase: "personal-brand", keywords: ["portfolio", "personal", "about me", "freelance", "creator"] },
  { useCase: "service-showcase", keywords: ["services", "agency", "studio", "company profile"] },
];

export function resolveDesignPlan(userPrompt: string): ResolvedDesignPlan {
  const lower = userPrompt.toLowerCase();

  let best = RECIPES[RECIPES.length - 1];
  let bestScore = 0;
  let bestMatches: string[] = [];

  for (const recipe of RECIPES) {
    if (!recipe.keywords.length) continue;

    const matches = recipe.keywords.filter((keyword) => lower.includes(keyword));
    const score = matches.length;

    if (score > bestScore) {
      best = recipe;
      bestScore = score;
      bestMatches = matches;
    }
  }

  const matchedUseCase = USE_CASE_HINTS.find((item) =>
    item.keywords.some((keyword) => lower.includes(keyword))
  )?.useCase;

  const styleHints = STYLE_HINTS.filter((hint) => lower.includes(hint));

  return {
    recipe: best,
    useCase: matchedUseCase || best.defaultUseCase,
    confidence: bestScore === 0 ? 0.35 : Math.min(0.95, 0.45 + bestScore * 0.12),
    matchedKeywords: bestMatches,
    styleHints,
  };
}

export function buildDesignInstructionBlock(
  plan: ResolvedDesignPlan,
  brandContext: AIV8BrandContext | null
): string {
  const colors = brandContext?.designTokens?.colors;

  const sections = plan.recipe.requiredSections
    .map((section, index) => {
      return `${index + 1}. id="${section.id}" | objective: ${section.objective} | required elements: ${section.requiredElements.join(", ")}`;
    })
    .join("\n");

  const brandLines = colors
    ? [
        `PRIMARY: ${colors.primary || "#2563eb"}`,
        `ACCENT: ${colors.accent || "#8b5cf6"}`,
        `BACKGROUND: ${colors.background || "#ffffff"}`,
        `TEXT PRIMARY: ${colors.textPrimary || "#0f172a"}`,
        `TEXT SECONDARY: ${colors.textSecondary || "#64748b"}`,
      ]
    : ["No brand colors provided. Pick a coherent, professional palette."];

  const styleHints = plan.styleHints.length
    ? `User style hints: ${plan.styleHints.join(", ")}`
    : "User style hints: none explicitly provided";

  return [
    `Selected recipe: ${plan.recipe.label} (${plan.recipe.key})`,
    `Use case: ${plan.useCase}`,
    `Confidence: ${plan.confidence.toFixed(2)}`,
    styleHints,
    "",
    "Required section architecture (must include every id exactly):",
    sections,
    "",
    `Approved component library: ${plan.recipe.componentLibrary.join(", ")}`,
    `Copy rules: ${plan.recipe.copyRules.join(" | ")}`,
    `Style direction: ${plan.recipe.styleDirection.join(", ")}`,
    "",
    "Brand inputs:",
    ...brandLines,
  ].join("\n");
}

export function getRequiredSectionIds(plan: ResolvedDesignPlan): string[] {
  return plan.recipe.requiredSections.map((s) => s.id);
}
