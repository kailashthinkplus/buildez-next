import {
  callOpenAIChatCompletion,
  extractAssistantText,
} from "@/app/api/_lib/openai";
import type { V9Workflow } from "./types";

function stripMarkdownJson(value: string) {
  const block = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (block?.[1] ?? value).trim();
}

function parseJson(value: string): Record<string, unknown> {
  const cleaned = stripMarkdownJson(value);

  try {
    const parsed = JSON.parse(cleaned);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");

    if (first >= 0 && last > first) {
      const parsed = JSON.parse(cleaned.slice(first, last + 1));

      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    }

    return {};
  }
}

function isUsableDesignBrief(value: Record<string, unknown>) {
  if (!Object.keys(value).length) return false;
  if (value.website && !value.concept && !value.designSystem && !value.sectionNarrative) {
    return false;
  }
  return Boolean(
    value.concept ||
      value.designSystem ||
      value.typographyDirection ||
      value.colorStrategy ||
      value.layoutLanguage ||
      value.sectionNarrative ||
      value.sections
  );
}

function asText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function workflowSignalText(workflow: V9Workflow) {
  return [
    workflow.prompt,
    workflow.pageTitle,
    workflow.siteName,
    workflow.brandContext?.industry,
    workflow.brandContext?.useCase,
    workflow.brandContext?.audience,
    workflow.brandContext?.offer,
    workflow.brandContext?.referenceImageIntent,
    workflow.brandContext?.designIntent,
    workflow.brandResolution?.industry,
    workflow.research?.title,
    workflow.research?.description,
    workflow.intent?.industry,
    workflow.intent?.goal,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferredIndustry(workflow: V9Workflow) {
  const explicit =
    asText(workflow.brandContext?.industry) ||
    asText(workflow.brandResolution?.industry) ||
    asText(workflow.intent?.industry);
  const text = workflowSignalText(workflow);

  if (explicit) return explicit;
  if (/saas|software|platform|app|dashboard|automation/.test(text)) return "saas";
  if (/shop|store|ecommerce|retail|product|checkout/.test(text)) return "ecommerce";
  if (/clinic|doctor|medical|health|hospital|dental|care/.test(text)) return "healthcare";
  if (/restaurant|cafe|food|dining|chef|hotel|hospitality/.test(text)) return "hospitality";
  if (/school|college|academy|course|education|learning/.test(text)) return "education";
  if (/real estate|property|villa|apartment|builder|construction/.test(text)) return "real-estate";
  if (/portfolio|creator|artist|designer|photographer|studio/.test(text)) return "portfolio";
  if (/law|legal|finance|accounting|consulting|agency|services/.test(text)) {
    return "professional-services";
  }
  return "service-business";
}

function profileForIndustry(industry: string) {
  const key = industry.toLowerCase();

  if (/saas|software|platform|app/.test(key)) {
    return {
      personality: ["precise", "product-led", "confident", "efficient"],
      tone: "clarity, momentum, and low-friction trust",
      colors: {
        backgroundPrimary: "#F7F9FC",
        backgroundSecondary: "#E8EEF7",
        textPrimary: "#111827",
        textSecondary: "#4B5563",
        accentPrimary: "#2563EB",
        accentSecondary: "#14B8A6",
        border: "#D9E2EF",
      },
      typography: "Modern product sans with strong numeric hierarchy and compact UI labels.",
      layout: "Product-led hero, dense proof strips, feature comparison, workflow diagrams, pricing/demo decision flow.",
      references: ["Linear-style clarity", "Stripe-style trust rhythm", "Notion-like product storytelling"],
      sections: ["outcome", "workflow", "features", "proof", "integrations", "pricing path", "demo"],
      conversion: "Lead visitors toward demo, trial, or sales conversation with repeated low-friction CTAs.",
      images: "Photorealistic product/workspace photography plus interface-led compositions, clean daylight, no fake UI text.",
    };
  }

  if (/ecommerce|retail|shop|product/.test(key)) {
    return {
      personality: ["tactile", "desirable", "clear", "trustworthy"],
      tone: "desire, confidence, and purchase readiness",
      colors: {
        backgroundPrimary: "#FBFAF7",
        backgroundSecondary: "#EFECE5",
        textPrimary: "#1F2933",
        textSecondary: "#5B6472",
        accentPrimary: "#B45309",
        accentSecondary: "#0F766E",
        border: "#DDD6C8",
      },
      typography: "Elegant commerce display headings with crisp readable product copy.",
      layout: "Image-led merchandising, collection rails, product proof, comparison, shipping/returns trust, purchase CTA.",
      references: ["premium product editorial", "boutique retail merchandising", "clean catalog systems"],
      sections: ["desire", "collections", "best sellers", "materials", "social proof", "trust", "purchase"],
      conversion: "Move from browsing to product selection, cart, enquiry, or order CTA.",
      images: "Photorealistic product and lifestyle photography, studio-quality lighting, real materials, no mockup text.",
    };
  }

  if (/health|clinic|medical|dental|care/.test(key)) {
    return {
      personality: ["calm", "expert", "human", "reassuring"],
      tone: "safety, trust, and simple access to care",
      colors: {
        backgroundPrimary: "#F7FBFA",
        backgroundSecondary: "#E8F3F0",
        textPrimary: "#102027",
        textSecondary: "#52676F",
        accentPrimary: "#0E7490",
        accentSecondary: "#2F855A",
        border: "#CFE0DD",
      },
      typography: "Highly readable healthcare sans with gentle heading scale and clear labels.",
      layout: "Trust-first hero, care pathways, service grid, doctor/team credibility, appointment flow, FAQ.",
      references: ["calm clinical editorial", "modern care navigation", "patient-first service pages"],
      sections: ["reassurance", "services", "care path", "team", "patient confidence", "answers", "appointment"],
      conversion: "Make appointment booking, calling, or consultation request feel simple and safe.",
      images: "Photorealistic clinic/team/patient-care photography, clean daylight, warm human expression, no staged stock exaggeration.",
    };
  }

  if (/restaurant|hospitality|cafe|hotel|dining/.test(key)) {
    return {
      personality: ["sensory", "welcoming", "crafted", "memorable"],
      tone: "appetite, atmosphere, and reservation confidence",
      colors: {
        backgroundPrimary: "#171412",
        backgroundSecondary: "#2A211C",
        textPrimary: "#FFF7ED",
        textSecondary: "#D6C5B8",
        accentPrimary: "#D97706",
        accentSecondary: "#A7F3D0",
        border: "#4A372D",
      },
      typography: "Expressive editorial headings with warm, legible hospitality body copy.",
      layout: "Atmospheric hero, menu/story pairings, signature items, ambience gallery, reservation/contact path.",
      references: ["restaurant editorial photography", "boutique hospitality pacing", "menu-led storytelling"],
      sections: ["arrival", "signature", "menu", "ambience", "story", "reviews/proof", "reservation"],
      conversion: "Guide to reservation, order, call, or visit with sensory but practical CTAs.",
      images: "Photorealistic food, dining room, hospitality details, warm ambient lighting, real plating, no fake menu text.",
    };
  }

  if (/education|school|academy|course|learning/.test(key)) {
    return {
      personality: ["clear", "encouraging", "credible", "outcome-focused"],
      tone: "progress, trust, and confident enrollment",
      colors: {
        backgroundPrimary: "#F7F8FB",
        backgroundSecondary: "#E9EEF8",
        textPrimary: "#1E293B",
        textSecondary: "#536175",
        accentPrimary: "#4F46E5",
        accentSecondary: "#F59E0B",
        border: "#D7DEEA",
      },
      typography: "Friendly institutional sans with clear information hierarchy.",
      layout: "Outcome hero, program pathways, curriculum proof, instructor/mentor credibility, enrollment steps.",
      references: ["modern learning platforms", "university editorial systems", "clear course catalogs"],
      sections: ["promise", "programs", "outcomes", "curriculum", "mentors", "student confidence", "enroll"],
      conversion: "Help students or parents compare fit and move toward enquiry or enrollment.",
      images: "Photorealistic learning environments, engaged students, bright natural light, credible academic context.",
    };
  }

  if (/real|property|construction|builder/.test(key)) {
    return {
      personality: ["architectural", "grounded", "premium", "trustworthy"],
      tone: "calm confidence and high-consideration purchase clarity",
      colors: {
        backgroundPrimary: "#FAFAF8",
        backgroundSecondary: "#F4F1ED",
        textPrimary: "#2C3523",
        textSecondary: "#5C6651",
        accentPrimary: "#C05A3A",
        accentSecondary: "#2C221B",
        border: "#D1CEC7",
      },
      typography: "Architectural editorial display headings paired with compact refined sans body/UI. Avoid default Inter-only typography.",
      layout: "Cinematic hero, location/context, project or offer showcase, buyer confidence, parallax image narrative, enquiry path.",
      references: ["luxury architecture editorial", "material-led property storytelling", "calm buyer journeys"],
      sections: ["arrival", "context", "showcase", "materials", "confidence", "visit path", "enquiry"],
      conversion: "Use enquiry, callback, brochure, or site-visit CTA only when appropriate to the prompt.",
      images: "Photorealistic architecture/interior/site photography, natural daylight, true-to-life materials, no CGI.",
    };
  }

  if (/portfolio|creator|artist|studio|photographer|designer/.test(key)) {
    return {
      personality: ["selective", "expressive", "precise", "memorable"],
      tone: "creative credibility and invitation to collaborate",
      colors: {
        backgroundPrimary: "#FAFAFA",
        backgroundSecondary: "#EDEDED",
        textPrimary: "#111111",
        textSecondary: "#525252",
        accentPrimary: "#BE185D",
        accentSecondary: "#0F766E",
        border: "#D4D4D4",
      },
      typography: "Large gallery-style display type with restrained captions and project metadata.",
      layout: "Statement hero, selected work, case-study rhythm, process, recognition/proof, collaboration CTA.",
      references: ["gallery portfolio systems", "editorial case studies", "studio archive layouts"],
      sections: ["statement", "selected work", "case depth", "process", "proof", "about", "collaborate"],
      conversion: "Invite project enquiries, bookings, commissions, or portfolio review conversations.",
      images: "Photorealistic studio/work/project imagery, strong composition, honest materials, no generic stock feel.",
    };
  }

  return {
    personality: ["credible", "specific", "approachable", "conversion-aware"],
    tone: "trust, clarity, and a confident next step",
    colors: {
      backgroundPrimary: "#F7F7F4",
      backgroundSecondary: "#E9ECE6",
      textPrimary: "#17231D",
      textSecondary: "#53635A",
      accentPrimary: "#0F766E",
      accentSecondary: "#8B5E34",
      border: "#D4DDD2",
    },
    typography: "Professional modern sans with strong headings and compact decision labels.",
    layout: "Outcome-led hero, service/offer clarity, proof, process, comparison or FAQ, contact/enquiry close.",
    references: ["premium service websites", "consulting editorial pages", "clear conversion systems"],
    sections: ["promise", "offer", "fit", "proof", "process", "answers", "contact"],
    conversion: "Turn an interested visitor into a consultation, quote request, call, or enquiry.",
    images: "Photorealistic business/service photography, real people or environments, natural light, no illustrations unless requested.",
  };
}

function fallbackBrief(workflow: V9Workflow) {
  const industry = inferredIndustry(workflow);
  const profile = profileForIndustry(industry);
  const brandName =
    asText(workflow.brandResolution?.companyName) ||
    asText(workflow.brandContext?.companyName) ||
    asText(workflow.siteName) ||
    "the brand";
  const useCase = asText(workflow.brandContext?.useCase) || workflow.intent?.goal || "website";
  const audience = asText(workflow.brandContext?.audience) || workflow.intent?.audience || "qualified visitors";
  const offer = asText(workflow.brandContext?.offer) || "the primary offer";
  const referenceIntent = asText(workflow.brandContext?.referenceImageIntent);
  const designIntent = asText(workflow.brandContext?.designIntent);

  return {
    industry,
    useCase,
    audience,
    offer,
    brandIntent: {
      companyName: brandName,
      referenceImageUrl: asText(workflow.brandContext?.referenceImageUrl),
      referenceImageIntent: referenceIntent,
      designIntent,
      tone: asText(workflow.brandContext?.tone),
      selectedOffer: offer,
      selectedAudience: audience,
    },
    brandPersonality: profile.personality,
    emotionalTone: profile.tone,
    designSystem: {
      colors: profile.colors,
      typography: profile.typography,
      layout: profile.layout,
    },
    visualReferences: profile.references,
    typographyDirection: profile.typography,
    colorStrategy:
      `Use verified logo/site colors when available; otherwise use the industry profile colors above. Tune saturation and contrast for design intent "${designIntent || "default"}". Avoid BuildEZ blue/orange unless verified by brand assets.`,
    imageArtDirection: workflow.intent?.imageStyle || profile.images,
    layoutLanguage: profile.layout,
    spacingRhythm:
      `Vary density by use case and design intent "${designIntent || "default"}": open hero, focused ${profile.sections[1]} section, denser proof/process modules, and a clear conversion close.`,
    sectionNarrative: profile.sections,
    conversionStrategy: profile.conversion,
    forbiddenPatterns: [
      "three equal cards immediately after hero",
      "Project Name 1",
      "Why Choose Us",
      "default blue/orange BuildEZ palette",
      "fake testimonials",
      "repeated card grids",
      "real-estate language unless the industry is real estate",
      "generic SaaS dashboard language unless the industry is SaaS",
    ],
    concept:
      `${brandName} ${useCase} experience for ${audience}, shaped around ${offer} and the user's brand intent selections.`,
    visualDirection:
      referenceIntent
        ? `Modern, premium, image-led, and aligned to the uploaded/reference visual intent: ${referenceIntent}.`
        : `Modern, premium, image-led, with strong hierarchy, varied rhythm, no BuildEZ default styling, and a ${designIntent || "brand-appropriate"} visual direction.`,
    palette:
      "Create a non-default palette from verified brand/logo/site context. Avoid BuildEZ blue/orange unless verified by brand assets.",
    typography: profile.typography,
    layoutSystem: profile.layout,
    sections: profile.sections.map((section, index) =>
      `${index + 1}. ${section}: design a prompt-specific module for ${brandName}, ${audience}, and ${offer}.`
    ),
    factPolicy: {
      useOnlyVerifiedFacts: true,
      doNotInvent: [
        "statistics",
        "client counts",
        "years in business",
        "awards",
        "project names",
        "addresses",
        "phone numbers",
        "testimonials",
        "reviews",
      ],
    },
    copyRules: [
      "No demo names, fake testimonials, fake addresses, fake numbers, or generic service-card filler.",
      "Use actual brand/context when available.",
      "If proof is unavailable, write neutral credibility cues without inventing people or statistics.",
      "Never output internal BuildEZ phrases.",
    ],
    imageDirection:
      workflow.intent?.imageStyle || profile.images,
    antiPatterns: [
      "BuildEZ Default theme",
      "blue/orange default palette",
      "Welcome to",
      "Our Services",
      "Get In Touch",
      "Discover Luxury Living",
      "Featured Properties",
      "Client Testimonials",
      "Over 500+ satisfied clients",
      "A satisfied client",
      "made our dream home a reality",
      "best choice",
      "Clear proof cues",
      "generated from brand context",
      "generic industry clichés",
      "golden hour luxury apartment",
      "John Doe/Jane Smith",
      "same hero + cards + CTA template",
    ],
  };
}

export async function runV9DesignBriefAgent(workflow: V9Workflow) {
  const fallback = fallbackBrief(workflow);
  const compactContext = {
    prompt: workflow.prompt,
    page: {
      title: workflow.pageTitle,
      slug: workflow.pageSlug,
      siteName: workflow.siteName,
    },
    brandContext: {
      companyName: workflow.brandContext?.companyName,
      industry: workflow.brandContext?.industry,
      useCase: workflow.brandContext?.useCase,
      audience: workflow.brandContext?.audience,
      offer: workflow.brandContext?.offer,
      designIntent: workflow.brandContext?.designIntent,
      referenceImageIntent: workflow.brandContext?.referenceImageIntent,
      websiteUrl: workflow.brandContext?.websiteUrl,
      logoUrl: workflow.brandContext?.logoUrl,
    },
    brandResolution: {
      companyName: workflow.brandResolution?.companyName,
      industry: workflow.brandResolution?.industry,
      location: workflow.brandResolution?.location,
      summary: workflow.brandResolution?.summary,
      confidence: workflow.brandResolution?.confidence,
      facts: Array.isArray(workflow.brandResolution?.facts)
        ? workflow.brandResolution.facts.slice(0, 8)
        : undefined,
    },
    research: {
      title: workflow.research?.title,
      description: workflow.research?.description,
      source: workflow.research?.source,
      signals: Array.isArray(workflow.research?.signals)
        ? workflow.research.signals.slice(0, 8)
        : undefined,
      imageCount: Array.isArray(workflow.research?.images)
        ? workflow.research.images.length
        : 0,
    },
    intent: workflow.intent || {},
  };

  try {
    const completion = await callOpenAIChatCompletion({
      model: process.env.OPENAI_WEBSITE_MODEL || "gpt-4o",
      temperature: 0.45,
      maxCompletionTokens: 1600,
      messages: [
        {
          role: "system",
          content:
            "You are a senior web design director for a Framer/Lovable-quality AI website builder. Return JSON only. Do not generate a blueprint. Use verified brandResolution/research facts as source of truth. If facts are missing, create structure and positioning but never invent statistics, testimonials, awards, years, project names, addresses, phone numbers, or claims.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              ...compactContext,
              requiredOutput: {
                concept: "brand/prompt-specific visual concept",
                designSystem: "colors, typography, spacing/layout, buttons, media, inputs",
                sectionNarrative: "7-10 industry/use-case-specific narrative beats",
                sections: "7-10 sections with purpose + visual treatment",
                conversionStrategy: "CTA tone, placement, decision flow",
                imageDirection: "photorealistic subject/style/lighting rules",
                antiPatterns: "reject wrong-industry terms, fake proof, defaults, low contrast",
              },
              hardRules: [
                "The design brief must explicitly use brandContext.industry, brandContext.useCase, brandContext.audience, brandContext.offer, brandContext.designIntent, brandContext.referenceImageIntent, intent, and the user prompt when available.",
                "Vary palette, typography, layout rhythm, media treatment, section narrative, CTA strategy, and density by industry and use case.",
                "Do not reuse real-estate terms like projects, site visits, property, luxury living, residences, or buyer journey unless the prompt/context is actually real estate or construction.",
                "Do not reuse SaaS terms like dashboard, integrations, demo, or platform unless the prompt/context is actually SaaS/software.",
                "Do not invent client counts, years, awards, project names, testimonials, addresses, phone numbers, or statistics.",
                "Do not use placeholder testimonials.",
                "Do not use internal phrases like generated from brand context or Clear proof cues.",
                "Do not use Discover Luxury Living unless it is explicitly verified brand copy.",
                "Do not use generic section titles if a more specific title can be created from verified context.",
                "Do not use BuildEZ blue/orange defaults unless verified by brand assets.",
                "Avoid Tailwind default colors and Inter-only typography unless verified by the brand.",
                "Specify subtle motion, parallax, hover transitions, and staggered reveal behavior in the design direction.",
                "Demand enough sections and content density to feel like a complete premium page, not a short template.",
                "Do not request vector/illustration/CGI images unless user explicitly asked.",
              ],
            },
            null,
            2
          ),
        },
      ],
    });

    const raw = extractAssistantText(completion);
    const parsed = raw ? parseJson(raw) : {};

    const usable = isUsableDesignBrief(parsed);

    return {
      ok: usable,
      brief: usable ? parsed : fallback,
      warnings:
        usable
          ? []
          : ["Design brief model returned unusable website JSON; using deterministic art-direction brief."],
    };
  } catch (error) {
    return {
      ok: false,
      brief: fallback,
      warnings: [
        error instanceof Error
          ? error.message
          : "Design brief generation failed.",
      ],
    };
  }
}
