type Context = Record<string, unknown>;

function value(context: Context, key: string) {
  return typeof context[key] === "string" ? String(context[key]).trim() : "";
}

function meaningful(valueToCheck: string) {
  const normalized = valueToCheck.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return valueToCheck && !["my webpage", "my website", "untitled", "this brand", "the business", "website"].includes(normalized);
}

function option(id: string, label: string, description: string, promptAddition: string, contextPatch?: Record<string, unknown>) {
  return { id, label, description, promptAddition, ...(contextPatch ? { contextPatch } : {}) };
}

function inferUseCase(prompt: string, context: Context, reference: string) {
  const haystack = `${value(context, "industry")} ${value(context, "useCase")} ${value(context, "offer")} ${prompt} ${reference}`.toLowerCase();
  if (/e-?commerce|storefront|shop|product grid|product card|catalog|skincare|beauty|fashion/.test(haystack)) return "commerce" as const;
  if (/clinic|hospital|doctor|dental|health|appointment|therapy/.test(haystack)) return "healthcare" as const;
  if (/property|properties|real estate|developer|apartment|villa|site visit/.test(haystack)) return "real-estate" as const;
  if (/restaurant|cafe|food|menu|reservation/.test(haystack)) return "hospitality" as const;
  if (/saas|software|platform|app|technology|ai /.test(haystack)) return "software" as const;
  return "general" as const;
}

function journeyQuestion(useCase: ReturnType<typeof inferUseCase>, business: string, offer: string) {
  if (useCase === "commerce") return {
    id: "page-concept", label: "Choose the storefront journey", whyItMatters: "This changes the hero, product order, merchandising sections, and path to purchase.", options: [
      option("commerce-discovery", "Discovery-led catalog", "Open with the collection, then new arrivals, categories, best sellers, reviews, journal, and newsletter.", "Use a discovery-led ecommerce journey with collection browsing and layered merchandising."),
      option("commerce-bestsellers", "Bestseller conversion", "Lead with the strongest products and benefits, then reassurance, reviews, offers, and a direct purchase path.", "Use a conversion-led storefront centered on best sellers, benefits, reassurance, and purchase actions."),
      option("commerce-brand-story", "Brand story with shopping", "Build desire through the brand philosophy and ingredients, then transition naturally into products and collections.", "Use an editorial brand-story storefront that moves from philosophy and ingredients into shopping."),
    ],
  };
  if (useCase === "healthcare") return {
    id: "page-concept", label: "Choose the patient journey", whyItMatters: "This determines what patients see before services, clinical proof, and appointment booking.", options: [
      option("health-booking", "Appointment-first care", "Start with the patient need and booking, followed by services, doctor credibility, process, and reassurance.", "Use an appointment-first healthcare journey with immediate access to booking and supporting trust."),
      option("health-services", "Services made simple", "Help patients identify the right treatment before showing expertise, process, frequently asked questions, and booking.", "Use a service-discovery healthcare journey with clear treatment comparison before booking."),
      option("health-trust", "Doctor and clinic trust", "Lead with clinical expertise, facilities, patient care principles, evidence, and a calm appointment invitation.", "Use a trust-led healthcare journey centered on expertise, environment, evidence, and reassurance."),
    ],
  };
  if (useCase === "real-estate") return {
    id: "page-concept", label: "Choose the buyer journey", whyItMatters: "This determines whether projects, lifestyle, or developer evidence leads the page.", options: [
      option("property-explore", "Explore and compare projects", "Lead with available projects, locations, status, amenities, and useful comparison before enquiry.", "Use a project-discovery journey with real inventory, comparison, and enquiry."),
      option("property-visit", "Inspire a site visit", "Build desire with location and lifestyle, then property detail, proof, and an effortless visit request.", "Use a lifestyle-led property journey that culminates in booking a site visit."),
      option("property-trust", "Developer credibility first", "Lead with completed work, delivery evidence, design principles, and buyer reassurance before current projects.", "Use a developer-trust journey with verified delivery evidence before project promotion."),
    ],
  };
  const directLabel = meaningful(offer) ? offer : "Focused conversion page";
  return {
    id: "page-concept", label: "Choose the page structure", whyItMatters: "Each option creates a different section order, reading experience, and primary action.", options: [
      option("general-focused", directLabel, `Build a concise journey around ${meaningful(offer) ? offer : "one primary action"}, with only the proof needed to act.`, `Create a focused conversion page around ${meaningful(offer) ? offer : "one clear primary action"}.`),
      option("general-editorial", "Editorial brand homepage", `Introduce ${business} through a strong point of view, visual storytelling, selected capabilities, proof, and a confident close.`, "Create an editorial brand homepage with varied pacing, visual storytelling, capabilities, proof, and a focused close."),
      option("general-detailed", "Detailed service guide", "Explain services, fit, process, outcomes, objections, and next steps for visitors who need clarity before acting.", "Create a detailed service-led page with comparison, process, evidence, objection handling, and next steps."),
    ],
  };
}

export function prepareV11Direction(input: { prompt: string; context?: Context | null }) {
  const context = input.context || {};
  const rawBusiness = value(context, "companyName") || value(context, "websiteName");
  const business = meaningful(rawBusiness) ? rawBusiness : "this website";
  const offer = value(context, "offer") || value(context, "useCase");
  const reference = value(context, "referenceAnalysis");
  const useCase = inferUseCase(input.prompt, context, reference);
  const hasReference = Boolean(reference);
  const journey = journeyQuestion(useCase, business, offer);
  const visualQuestion = hasReference ? {
    id: "visual-language", label: "How closely should we reconstruct the upload?", whyItMatters: "This decides whether layout fidelity or a new brand interpretation has priority.", options: [
      option("visual-reference-close", "Pixel-close reconstruction", "Match section order, proportions, spacing, typography relationships, palette, imagery roles, header, and footer as closely as possible.", "Reconstruct the uploaded reference with maximum visual and structural fidelity.", { designIntent: "Pixel-close reference reconstruction" }),
      option("visual-reference-adapt", "Same layout, new brand", "Keep the reference composition and rhythm while replacing its identity, copy, colors, and media with the current brand.", "Preserve the reference layout system while adapting brand identity and content.", { designIntent: "Brand-adapted reference reconstruction" }),
      option("visual-reference-inspired", "New design from its ideas", "Keep only its strongest visual principles and create an original composition for the current use case.", "Use the reference as art-direction inspiration, not a literal layout.", { designIntent: "Reference-inspired original design" }),
    ],
  } : {
    id: "visual-language", label: "Choose the visual character", whyItMatters: "This controls typography, image scale, density, contrast, spacing, and section rhythm.", options: [
      option("visual-editorial", "Editorial and image-led", "Large imagery, expressive type, asymmetric compositions, generous whitespace, and varied pacing.", "Use an editorial image-led visual system with expressive typography and asymmetric pacing.", { designIntent: "Editorial image-led" }),
      option("visual-refined", "Refined and understated", "Quiet typography, precise spacing, restrained color, tactile details, and confident simplicity.", "Use a refined understated visual system with precise spacing and restrained color.", { designIntent: "Refined understated" }),
      option("visual-bold", "Bold and high-energy", "Strong contrast, oversized type, dynamic crops, denser rhythm, and decisive calls to action.", "Use a bold high-energy visual system with strong contrast and dynamic composition.", { designIntent: "Bold high-energy" }),
    ],
  };

  return {
    summary: hasReference
      ? `We found a ${useCase === "commerce" ? "storefront" : useCase} reference. Choose the reconstruction approach, content authority, and visual fidelity before generation.`
      : `Choose one concrete page journey and visual character for ${meaningful(rawBusiness) ? rawBusiness : "the current brief"}.`,
    interpretedUseCase: `${useCase} ${hasReference ? "reference reconstruction" : "website"}`,
    engineeredPrompt: `Create a production-quality ${useCase} website for ${business}. Apply the selected page journey, evidence source, and visual direction as binding decisions. Use the current prompt, saved context, and uploaded reference only; never carry assumptions from another site.`,
    questions: [journey, {
      id: "content-source", label: "What content may the page use?", whyItMatters: "This keeps the design specific without inventing claims, testimonials, prices, credentials, or project details.", options: [
        option("content-reference", "Use the uploaded content", "Retain legible headings, labels, product or service structure, and factual details visible in the reference.", "Use legible reference content where appropriate and do not invent missing facts.", { researchEnabled: false }),
        option("content-brand", "Use my saved brand details", "Replace reference-specific copy with the current company, offer, audience, products, and supplied evidence.", "Use saved brand context as the factual source and preserve only the reference structure.", { researchEnabled: false }),
        option("content-research", "Research the real business", "Use the official website and credible sources to replace generic copy with verified business information.", "Research the business and use only verified facts in the page.", { researchEnabled: true }),
      ],
    }, visualQuestion],
    agentTrace: [],
    timing: { durationMs: 0, model: "context-derived direction engine", tokenBudget: 0, fallbackUsed: false },
    providerStatus: { ok: true, category: "success" },
  };
}
