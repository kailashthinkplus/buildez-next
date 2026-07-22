import {
  callOpenAIChatCompletion,
  extractAssistantText,
} from "@/app/api/_lib/openai";
import type { BuilderBlueprint } from "../types/blueprint";
import {
  logBlueprintDebug,
  logBuilderDebug,
  summarizeBlueprint,
} from "../debug/blueprintDebug";
import { normalizeV9Blueprint } from "./blueprintFactory";

type GenerateNativeBlueprintInput = {
  prompt: string;
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  siteName?: string | null;
  designTokens?: Record<string, unknown> | null;
  brandContext?: Record<string, unknown> | null;
  brandResolution?: Record<string, unknown> | null;
  research?: Record<string, unknown> | null;
  designBrief?: Record<string, unknown> | null;
  candidateDirective?: Record<string, unknown> | null;
  intent?: {
    industry: string;
    goal: string;
    audience: string;
    imageStyle: string;
  };
};

function stripMarkdownJson(value: string) {
  const block = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (block?.[1] ?? value).trim();
}

function parseJsonObject(value: string): unknown {
  const cleaned = stripMarkdownJson(value);

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("AI v9 did not return valid JSON.");
  }
}

function buildSystemPrompt() {
  return `You are BuildEZ AI v9, a native visual website builder designer.

You MUST output one JSON object only: a BuildEZ BuilderBlueprint.

Non-negotiable architecture:
- Do not output TSX, HTML, Markdown, Tailwind classes, CSS files, or explanations.
- Do not use props.className for design. All presentation belongs in node.style.
- The builder and published page render the same BuilderBlueprint, so every visual decision must be explicit in styles.
- Use only node types: page, section, container, grid, column, heading, text, button, image, video, icon, divider, spacer, hero, leadForm, cardGrid, features, gallery, galleryLightbox, faq, testimonials, pricing, offerGrid, floatingWhatsApp, locationMap, cta.
- The root node must be type "page"; root points to that node id; nodes is an id keyed object.
- Every node must include: id, type, parentId, children, props, style.
- Children arrays contain child node ids only.
- Sections should usually be full width. Inner containers should be boxed with maxWidth.
- Use responsive style objects where needed: { "desktop": 64, "tablet": 52, "mobile": 38 }.
- brandResolution is the highest-priority source of truth.
- If brandResolution conflicts with brandContext or research, trust brandResolution first.
- If a fact is not verified, do not invent it.
- Never invent company history, statistics, awards, project names, addresses, phone numbers, testimonials, years in business, client counts, delivery numbers, or certifications.
- If proof is unavailable, create neutral credibility sections instead of fake proof.
- Avoid generic startup copy. Use concrete services, details, audience needs, verified facts, contact cues, and CTAs.
- Do not use "Welcome to", "Our Services", "Get In Touch", "John Doe", "Jane Smith", "Property Sales", "Investment Advice", or generic testimonial names.
- Do not describe the website itself unless the user is asking for a web design agency. Avoid meta-builder copy like "online experience", "site structure", "page works", "clear positioning", "relevant decision cues", "publish aligned", or "next step clarity".
- Never use placeholder brand names such as "name", "company", "business", "from", "for", "My First Site", or "BuildEZ Site".
- Avoid fake/broken images. Never use example.com, placeholder, dummy, test, invalid URLs, or stock-image URLs.
- Do not invent image src URLs. For images, set props.src to "" and provide props.aiImagePrompt.
- For hero/background images, provide props.backgroundPrompt and use gradient/color styles until the ImageAgent hydrates the asset.
- The first visible heading must be an h1, not h2.
- Do not create generic contact-page filler such as "Get In Touch", "Our Office", "Follow Us", "123 Business Rd", "(123) 456-7890", or "contact@business.com".
- Do not add copyright/footer sections inside the blueprint; the site shell owns header and footer.

Visual quality bar:
- Build a polished modern site, not a wireframe.
- The site must feel custom-designed, not assembled from a fixed template.
- Use large hero typography, asymmetry, layered backgrounds, proof-style sections, editorial sections, varied card groups, process/detail blocks, and strong CTA areas.
- Use the design brief as creative direction. It is the art director. Do not ignore it.
- Use explicit spacing, typography, colors, borders, shadows, image sizing, and responsive grids.
- Use rich but restrained design. Do not rely on global CSS or external classes.
- Avoid BuildEZ default blue/orange unless verified by brand assets.
- Avoid Tailwind-default palettes and token-looking colors such as slate-900, blue-600, sky-500, orange-500, zinc-50, and gray-500 unless verified by brand assets.
- Avoid heavy yellow/orange/blue image color casts and artificial brand color overlays.
- Add motion via props.advanced.motion on sections, important containers, cards, images, and CTA groups.
- Supported motion presets are "fade-in", "slide-up", "scale-in", and "stagger-children".
- Add parallax by setting props.advanced.motion.engine = "parallax" and parallaxSpeed between 0.08 and 0.18 on the hero or one image-led section.
- Motion must be subtle and staggered; do not rely on unsupported CSS class names.
- If brandResolution.logoUrl or brandContext.logoUrl exists, assume the site shell will render the logo. Do not replace it with initials or text-only branding, and do not ask image generation to create a logo.

Return JSON only.`;
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function compactRecord(
  source: Record<string, unknown> | null | undefined,
  keys: string[]
) {
  if (!source) return {};
  return keys.reduce<Record<string, unknown>>((next, key) => {
    const value = source[key];
    if (value === undefined || value === null || value === "") return next;
    if (Array.isArray(value)) {
      next[key] = value.slice(0, 8);
      return next;
    }
    if (typeof value === "object") return next;
    next[key] = value;
    return next;
  }, {});
}

function compactDesignBrief(brief: Record<string, unknown> | null | undefined) {
  if (!brief) return {};
  return {
    industry: brief.industry,
    useCase: brief.useCase,
    audience: brief.audience,
    offer: brief.offer,
    brandIntent: brief.brandIntent,
    concept: brief.concept,
    emotionalTone: brief.emotionalTone,
    designSystem: brief.designSystem,
    typographyDirection: brief.typographyDirection,
    colorStrategy: brief.colorStrategy,
    layoutLanguage: brief.layoutLanguage,
    sectionNarrative: brief.sectionNarrative,
    sections: brief.sections,
    conversionStrategy: brief.conversionStrategy,
    imageDirection: brief.imageDirection,
    antiPatterns: Array.isArray(brief.antiPatterns)
      ? brief.antiPatterns.slice(0, 12)
      : brief.antiPatterns,
  };
}

function compactResearch(research: Record<string, unknown> | null | undefined) {
  if (!research) return {};
  return {
    title: research.title,
    description: research.description,
    h1: research.h1,
    source: research.source,
    url: research.url,
    facts: Array.isArray(research.facts) ? research.facts.slice(0, 10) : undefined,
    images: Array.isArray(research.images) ? research.images.slice(0, 6) : undefined,
    signals: Array.isArray(research.signals) ? research.signals.slice(0, 8) : undefined,
  };
}

function industryKey(input: GenerateNativeBlueprintInput) {
  return [
    textValue(input.brandContext?.industry),
    textValue(input.designBrief?.industry),
    input.intent?.industry || "",
    input.prompt,
  ]
    .join(" ")
    .toLowerCase();
}

function layoutContractFor(input: GenerateNativeBlueprintInput) {
  const text = industryKey(input);
  const useCase = [
    textValue(input.brandContext?.useCase),
    textValue(input.designBrief?.useCase),
    input.intent?.goal || "",
  ]
    .join(" ")
    .toLowerCase();

  if (/\b(?:saas|software|platform|app)\b/.test(text)) {
    return {
      sections: ["Hero", "Workflow", "Features", "Proof", "Integrations", "Pricing or demo path", "FAQ", "Lead form"],
      widgets: ["hero", "cardGrid", "pricing", "faq", "leadForm"],
      layout: "product-led hero, workflow strip, dense feature/proof modules, pricing/demo conversion",
      font: "modern product sans",
    };
  }

  if (/shop|store|ecommerce|retail|product/.test(text) || /sales|online sales|checkout/.test(useCase)) {
    return {
      sections: ["Hero", "Collections", "Offer grid", "Product proof", "Gallery", "Trust", "FAQ", "Purchase CTA"],
      widgets: ["hero", "offerGrid", "galleryLightbox", "faq", "cta"],
      layout: "catalog hero, merchandising grid, lifestyle gallery, purchase-focused trust modules",
      font: "elegant commerce display plus readable body",
    };
  }

  if (/clinic|doctor|medical|health|hospital|dental|care/.test(text)) {
    return {
      sections: ["Hero", "Care pathways", "Services", "Team trust", "Patient confidence", "FAQ", "Appointment form"],
      widgets: ["hero", "cardGrid", "faq", "leadForm", "locationMap"],
      layout: "calm trust-first hero, service pathways, appointment conversion",
      font: "highly readable healthcare sans",
    };
  }

  if (/restaurant|cafe|food|dining|hotel|hospitality/.test(text)) {
    return {
      sections: ["Atmosphere hero", "Signature offers", "Menu/story", "Gallery", "Visit details", "FAQ", "Reservation CTA"],
      widgets: ["hero", "offerGrid", "galleryLightbox", "locationMap", "leadForm"],
      layout: "sensory full-bleed hero, menu-led content, warm reservation path",
      font: "expressive editorial display plus warm body",
    };
  }

  if (/real estate|property|villa|apartment|builder|construction/.test(text)) {
    return {
      sections: ["Hero", "Context", "Showcase", "Materials", "Confidence", "Visit path", "Enquiry"],
      widgets: ["hero", "galleryLightbox", "cardGrid", "faq", "leadForm", "locationMap"],
      layout: "cinematic visual hero, asymmetric showcase, proof ledger, enquiry close",
      font: "editorial display plus refined sans",
    };
  }

  if (/portfolio|creator|artist|designer|photographer|studio/.test(text)) {
    return {
      sections: ["Statement hero", "Selected work", "Case depth", "Process", "Proof", "About", "Collaborate"],
      widgets: ["hero", "galleryLightbox", "cardGrid", "leadForm"],
      layout: "gallery-like hero, case-study rhythm, restrained collaboration CTA",
      font: "large gallery display plus restrained captions",
    };
  }

  return {
    sections: ["Hero", "Offer clarity", "Fit", "Proof", "Process", "FAQ", "Contact"],
    widgets: ["hero", "cardGrid", "faq", "leadForm", "locationMap"],
    layout: "outcome-led hero, service clarity, proof/process, enquiry close",
    font: "professional modern sans with strong headings",
  };
}

function contrastRules() {
  return [
    "Every text node style.color must visibly contrast with its nearest section/container backgroundColor.",
    "If a section uses a background photo, gradient, or dark overlay, force heading/text colors to white or near-white and include a dark overlay intent.",
    "Use dark text (#111827/#17231D/#1F2933) on light backgrounds and white/near-white text (#FFFFFF/#FFF7ED/#F8FAFC) on dark backgrounds.",
    "Do not put muted gray text on medium/dark backgrounds; raise contrast instead.",
    "CTA buttons must have contrast between backgroundColor and text color.",
  ];
}

function buildUserPrompt(input: GenerateNativeBlueprintInput) {
  const uniquenessSeed = [
    input.pageId,
    input.pageSlug,
    input.siteName,
    input.prompt,
    JSON.stringify(input.brandResolution || {}),
    JSON.stringify(input.designBrief || {}),
    new Date().toISOString().slice(0, 10),
  ]
    .join("|")
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261)
    .toString(16);

  const compact = {
    page: {
      title: input.pageTitle,
      slug: input.pageSlug,
      siteName: input.siteName || "BuildEZ Site",
    },
    brandResolution: compactRecord(input.brandResolution, [
      "companyName",
      "industry",
      "location",
      "summary",
      "officialWebsite",
      "logoUrl",
      "confidence",
      "facts",
    ]),
    brandContext: compactRecord(input.brandContext, [
      "companyName",
      "websiteName",
      "industry",
      "useCase",
      "audience",
      "offer",
      "designIntent",
      "referenceImageUrl",
      "referenceImageIntent",
      "websiteUrl",
      "logoUrl",
      "tone",
    ]),
    research: compactResearch(input.research),
    designBrief: compactDesignBrief(input.designBrief),
    candidateDirective: compactRecord(input.candidateDirective, [
      "id",
      "creativeDirection",
      "layoutArchetype",
      "typographySystem",
      "colorPalette",
      "sectionNarrative",
      "requiredSections",
    ]),
    intent: input.intent || {},
    layoutContract: layoutContractFor(input),
    contrastRules: contrastRules(),
    uniquenessSeed,
  };

  return `Create one production-quality native BuildEZ BuilderBlueprint.

COMPACT GENERATION CONTEXT:
${JSON.stringify(compact, null, 2)}

USER REQUEST:
${input.prompt}

Required blueprint rules:
- metadata.version must be 2.
- metadata.aiGenerated must be true.
- metadata.template must be "ai-v9-native-blueprint".
- metadata.sectionContract must list the intended page modules from designBrief.pageSections, designBrief.sections, designBrief.sectionNarrative, or candidateDirective.requiredSections.
- theme.id/name/preset must be prompt-specific and must not be "buildez-default" or "BuildEZ Default" for AI-generated pages.
- theme.tokens should use or extend provided design tokens, but must override default BuildEZ blue/orange if they are present.
- Generate between 8 and 10 sections when the page type supports it. Use at least 7 sections only for extremely simple prompts.
- Typography must use a deliberate non-basic pair. Avoid using Inter for both headingFont and bodyFont unless verified by the brand. Prefer pairings such as "Fraunces + Manrope", "Cormorant Garamond + Instrument Sans", "Bricolage Grotesque + DM Sans", "Space Grotesk + Source Sans 3", or an industry-appropriate pair.
- Keep hero h1 polished rather than oversized: desktop 52-64px, tablet 42-54px, mobile 32-40px. Inner-card headings should be much smaller.
- Follow the candidate creative directive exactly: each candidate must have a distinct layout archetype, typography system, palette strategy, section narrative, and image art direction.
- Use layoutContract.sections as the default module list and layoutContract.widgets when they match the page. Premium widgets are allowed and renderable: hero, leadForm, cardGrid, features, gallery, galleryLightbox, faq, testimonials, pricing, offerGrid, floatingWhatsApp, locationMap, cta.
- Premium widget props must use this shape: props.eyebrow string, props.title string, props.body string, props.primaryCta string, props.secondaryCta string when needed, props.items as an array of short strings or objects with title/label/text. Do not put raw objects in heading/text/button props.
- If a CTA needs href, put it on a child button node or use props.href separately; primaryCta and secondaryCta must remain human-readable labels.
- If candidateDirective.requiredSections exists, implement those sections in order unless it conflicts with verified facts. Do not replace them with generic Services/About/Why Us blocks.
- Treat the page like a composed landing page or composed product page, not one generic blob. Each section in the brief/directive should become a distinct top-level section node. Header/navigation and footer are owned by the site shell, so do not create duplicate nav/footer sections inside the blueprint.
- Use a full-width visual hero with overlay or strong editorial layout.
- The hero must include level: "h1", an eyebrow, persuasive body copy, primary CTA, secondary CTA or proof-style cue, and either props.backgroundPrompt or an image node with props.aiImagePrompt.
- For image-background sections, set readable text colors and add props.overlay = "dark-gradient" or a similar overlay intent. Background photos must support the section subject and should not fight the text placement.
- Any section with props.backgroundPrompt or a photo background must use a dark readable overlay and white/near-white foreground text.
- Include at least one grid of cards with explicit gridTemplateColumns responsive styles.
- Include at least two richer content sections beyond grids, such as an editorial narrative with media, a comparison/decision ledger, a timeline/process, a materials/detail board, an FAQ/objection block, or an enquiry form.
- Include at least one fit-for-purpose premium widget node when useful: leadForm for enquiries/bookings, offerGrid for products/packages/listings, galleryLightbox for visual portfolios/properties/venues/products, pricing for plans/packages, faq for objections, locationMap for physical/service-area businesses.
- Include mobile responsive styles for hero text, section padding, grids, and split layouts.
- If using images, do not use src URLs. Use props.aiImagePrompt and meaningful alt text; ImageAgent will generate the final image.
- If using visual backgrounds, set props.backgroundPrompt; do not put a URL in style.backgroundImage.
- Use href values like "#contact", "#services", "/contact", or "tel:" links; never bare "#".
- Do not create a footer/copyright section because the shell renders the footer.

Truth rules:
- brandResolution is the primary source of truth.
- Use verified facts first.
- If saved brand/company context or research is provided, use it only if it does not conflict with brandResolution.
- Mention the actual company, audience, offer, location, services, and differentiators when verified.
- Never invent company history.
- Never invent statistics.
- Never invent testimonials.
- Never invent project names.
- Never invent awards.
- Never invent addresses.
- Never invent phone numbers.
- Never invent years in business.
- Never invent client counts or delivery numbers.
- If information is unavailable, redesign the section instead of filling it with fake content.

Layout rules:
- Each website MUST have a different visual rhythm.
- Avoid repeating: Hero → Cards → Cards → Testimonials → CTA.
- Avoid generic section ordering.
- Vary layouts such as: Hero, Brand Story, Image Narrative, Timeline, Gallery, Comparison, Interactive Stats, Process, FAQ, CTA, Contact.
- Layout must change by industry, use case, user prompt, and designIntent. SaaS should not look like real estate; healthcare should not look like ecommerce; hospitality should not look like a dashboard.
- Use the visual system in designBrief.designSystem or candidateDirective: palette, typography, spacing, media treatment, borders, density, and interaction style.
- Name each top-level section clearly via node.name and/or props.anchorId based on the brief section names. QA and debugging rely on these section boundaries.
- Do not collapse multiple modules into one long section. Each module should have its own section node with a distinct layout treatment.
- Do not create shallow sections that contain only a heading and one paragraph. Every non-utility section needs a finished composition: at least one meaningful supporting element such as image, card grid, detail list, stats row, process steps, comparison table, CTA group, or enquiry field group.
- At least three sections must be content-dense, with nested card/list/media structure rather than a single two-column text split.
- For showcase/project/listing sections, create 4-6 complete items with image node, title, location/status or category line, two detail fields, and a small CTA. Use verified project names only; otherwise use neutral labels like "Available residence" or "Site-visit option", not "Featured work" or "Project 1".
- For contact/enquiry sections, create form-like editable fields as styled containers/text labels/buttons when form nodes are unavailable. Include name, phone/email, interest/location, message, and submit CTA without inventing real contact data.
- Do not create fake press logos, fake award badges, fake publication mastheads, or fake testimonial portraits. If proof is not verified, use text-led proof/explainer strips.
- No two websites should have identical section ordering.
- Each generation must look like it was designed by a different senior designer.
- Vary hero composition, typography scale, image placement, section order, asymmetry, card layouts, whitespace, color usage, navigation style, and CTA placement.
- Never reuse the previous layout rhythm.

Copy rules:
- Reject generic copy.
- Every heading and card must be relevant to the business/use case, not about website construction or generic page strategy.
- Do not use demo filler, lorem ipsum, "Feature 1", "Service 1", "Project 1", fake addresses, fake phone numbers, fake emails, or generic placeholder company names.
- Do not use generic testimonial people such as John Doe/Jane Smith.
- If no real testimonials are available, use proof-style or trust-explanation sections instead of fake testimonials.
- Use project names, locations, RERA, prices, awards, years, and contact details only when present in brandResolution, research, or saved context. If unavailable, write neutral labels such as "Project enquiry" or "Available residences" rather than inventing facts.
- Never use "Featured work", "A brief description", "Project A", "Project B", "Project C", or "A focused section keeps the page complete".
- Avoid the exact generic heading "Why Choose Us"; use more specific editorial headings such as "Six quiet promises that shape every home" or "What buyers should see before a site visit".
- Never use phrases like:
  - "Discover Luxury Living"
  - "Featured Properties"
  - "Client Testimonials"
  - "Over 500+ satisfied clients"
  - "A satisfied client"
  - "made our dream home a reality"
  - "best choice"
  - "Clear proof cues"
  - "generated from brand context"
  - "from Real Estate website generated"
  - "generic Bangalore luxury real estate"
  - "A sharper online experience"
  - "A modern site structure"
  - "How the page works"
  - "Positioning that lands"
  - "Services with depth"
  - "Next step clarity"

Image rules:
- Every image prompt must contain exact subject, location/context, architecture/environment style, lighting, camera angle, and realism level.
- If research.images contains verified website images, create image/background targets that can be hydrated from those assets. Do not invent external stock image URLs.
- Never use generic prompts such as "Luxury apartment", "Modern office", "Professional doctor", or "Golden hour".
- Never ask for vector, illustration, CGI, 3D render, flat design, cartoon, icons, or abstract shapes unless user explicitly requested it.
- Never create image prompts for logos, publication mastheads, award badges, UI icons, or vector marks. Keep those as text/border treatments, not image generation targets.
- Image prompts must avoid artificial brand color overlays and heavy yellow/orange/blue color casts.
- Prefer real environment, natural daylight, realistic material texture, editorial photography, true-to-life colors.
- Example image prompt quality:
  "Photorealistic exterior of a premium residential tower in East Bangalore with realistic Indian landscaping, natural daylight, premium facade detailing, low-angle architectural photography, 35mm lens, true-to-life colors, no text, no logo, no CGI."

Palette rules:
- Derive a palette from verified brand/logo/site context when available.
- If no brand colors exist, create a balanced non-default palette with 1 primary, 1 accent, 2 neutrals, and 1 soft surface color.
- Avoid default BuildEZ blue/purple/orange.
- Avoid Tailwind defaults such as #2563eb, #3b82f6, #0ea5e9, #f97316, #0f172a, #f8fafc, #64748b, and #e2e8f0 unless they came from verified brand assets.
- Avoid one-note monochrome themes.
- Avoid using bright orange/yellow unless verified by brand assets.
- Enforce contrast rules from COMPACT GENERATION CONTEXT. If unsure, choose higher contrast.

Reference image rules:
- If referenceImageUrl is present in saved context, map its layout, spacing, color relationships, and visual hierarchy into editable builder nodes while replacing any screenshot text with real generated content.

Output the full JSON blueprint now.`;
}

function simpleHash(value: string) {
  return value
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261)
    .toString(16);
}

export async function generateNativeBlueprint(
  input: GenerateNativeBlueprintInput
): Promise<{
  blueprint: BuilderBlueprint;
  metadata: Record<string, unknown>;
}> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input);
  const candidateId =
    typeof input.candidateDirective?.id === "string"
      ? input.candidateDirective.id
      : "single";

  const model = process.env.OPENAI_WEBSITE_MODEL || "gpt-4o";
  const temperature = 0.42;
  const maxCompletionTokens = Number(
    process.env.OPENAI_WEBSITE_MAX_COMPLETION_TOKENS || 12000
  );

  logBuilderDebug("ai-v9:llm-request", {
    model,
    temperature,
    maxCompletionTokens,
    pageId: input.pageId,
    pageTitle: input.pageTitle,
    pageSlug: input.pageSlug,
    siteName: input.siteName,
    prompt: input.prompt,
    userPromptLength: userPrompt.length,
    userPromptHash: simpleHash(userPrompt),
    brandContextKeys: Object.keys(input.brandContext || {}),
    brandResolutionKeys: Object.keys(input.brandResolution || {}),
    researchSource: input.research?.source,
    researchConfidence: input.research?.confidence,
    hasDesignBrief: Boolean(input.designBrief),
    candidateDirective: input.candidateDirective,
    intent: input.intent,
  });

  const completion = await callOpenAIChatCompletion({
    model,
    temperature,
    maxCompletionTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  logBuilderDebug("ai-v9:candidate-llm-complete", {
    candidate: candidateId,
    pageId: input.pageId,
    model: completion.model || model,
    usage: completion.usage,
  });

  const raw = extractAssistantText(completion);

  if (!raw) {
    throw new Error("AI v9 returned an empty response.");
  }

  logBuilderDebug("ai-v9:llm-response", {
    model: completion.model || model,
    rawLength: raw.length,
    rawHash: simpleHash(raw),
    usage: completion.usage,
    startsWith: raw.slice(0, 240),
  });

  let parsed: unknown;

try {
  logBuilderDebug("ai-v9:parse-start", {
    rawLength: raw.length,
    rawEnd: raw.slice(-500),
  });

  parsed = parseJsonObject(raw);

  logBuilderDebug("ai-v9:candidate-parse-complete", {
    candidate: candidateId,
    pageId: input.pageId,
  });

  logBuilderDebug("ai-v9:parse-success", {
    parsedType: typeof parsed,
    parsedKeys:
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? Object.keys(parsed as Record<string, unknown>)
        : [],
  });
} catch (error) {
  logBuilderDebug("ai-v9:parse-failed", {
    message: error instanceof Error ? error.message : "Parse failed",
    rawStart: raw.slice(0, 1000),
    rawEnd: raw.slice(-1000),
  });

  throw error;
}

let blueprint: BuilderBlueprint;

try {
  logBuilderDebug("ai-v9:normalize-start", {
    pageId: input.pageId,
  });

  blueprint = normalizeV9Blueprint(parsed, {
    pageId: input.pageId,
    pageTitle: input.pageTitle,
    siteName: input.siteName,
    designTokens: input.designTokens,
    brandContext: input.brandContext,
    brandResolution: input.brandResolution,
    research: input.research,
    designBrief: input.designBrief,
    candidateDirective: input.candidateDirective,
    intent: input.intent,
  });

  logBuilderDebug("ai-v9:candidate-normalize-complete", {
    candidate: candidateId,
    pageId: input.pageId,
    summary: summarizeBlueprint(blueprint),
  });
  const template = blueprint.metadata?.template;

if (template === "ai-v9-native-fallback") {
  logBuilderDebug("ai-v9:unexpected-fallback-blueprint", {
    reason: "normalizeV9Blueprint returned fallback instead of model blueprint",
    root: blueprint.root,
    nodeCount: Object.keys(blueprint.nodes).length,
    summary: summarizeBlueprint(blueprint),
  });

  throw new Error(
    "AI model blueprint was discarded and fallback blueprint was returned."
  );
}

  logBuilderDebug("ai-v9:normalize-success", {
    summary: summarizeBlueprint(blueprint),
  });
} catch (error) {
  logBuilderDebug("ai-v9:normalize-failed", {
    message: error instanceof Error ? error.message : "Normalize failed",
  });

  throw error;
} 

  logBuilderDebug("ai-v9:normalized-blueprint", {
    summary: summarizeBlueprint(blueprint),
  });

  logBlueprintDebug("ai-v9:normalized-blueprint", blueprint);

  return {
    blueprint,
    metadata: {
      aiMode: "ai-v9-native-blueprint",
      aiModel: completion.model || model,
      generatedAt: new Date().toISOString(),
      nodeCount: Object.keys(blueprint.nodes).length,
      usage: completion.usage,
    },
  };
}
