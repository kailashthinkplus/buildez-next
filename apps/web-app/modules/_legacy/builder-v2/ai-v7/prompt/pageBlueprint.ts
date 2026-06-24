// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/prompt/pageBlueprint.ts

import type { AIV7Answers } from "../types";

export function pageBlueprintPrompt(
  userPrompt: string,
  plan: string,
  answers: AIV7Answers
) {
  return `
You are planning the VISUAL INTENT of a website page.

You are NOT generating layout nodes or structure.
The system will handle structure automatically.

Your task is to describe HOW each section should feel
and how it should visually differ from others.

# ========================================
# CRITICAL: HONOR USER'S BUSINESS TYPE
# ========================================

⚠️ READ THE USER PROMPT CAREFULLY
⚠️ IDENTIFY THE ACTUAL BUSINESS TYPE
⚠️ DO NOT MAKE ASSUMPTIONS BASED ON COMPANY NAMES
⚠️ ALL VISUAL INTENT MUST MATCH THE BUSINESS TYPE

USER REQUEST:
"${userPrompt}"

EXTRACT THE BUSINESS TYPE:
- Is this real estate, healthcare, SaaS, restaurant, e-commerce, agency, or other?
- Plan visual intent appropriate for THAT business type ONLY
- Do NOT plan for a different industry

EXAMPLES:
- User says "real estate website" → Plan hero with property images, NOT medical facilities
- User says "hospital website" → Plan hero with medical care focus, NOT buildings/properties
- User says "SaaS platform" → Plan hero with software UI, NOT physical products

# ========================================

--------------------------------------------------
CONTEXT
--------------------------------------------------
Site type: ${answers.siteType}
Tone: ${answers.tone}
Primary goal: ${answers.primaryGoal}

--------------------------------------------------
SECTIONS
--------------------------------------------------
${plan}

--------------------------------------------------
VISUAL INTENT GUIDELINES BY BUSINESS TYPE
--------------------------------------------------

REAL ESTATE / CONSTRUCTION:
- Hero: Large property/building images, strong CTAs
- Projects/Gallery: Visual showcase of completed properties
- Services: Clean cards with construction/development offerings
- About: Company history with founder/team imagery
- Testimonials: Client success stories with professional tone

HEALTHCARE / MEDICAL:
- Hero: Caring, professional imagery with patient focus
- Services: Clear medical offerings/departments
- About: Medical team credentials and facility features
- Testimonials: Patient stories with empathetic tone
- Contact: Appointment booking emphasis

SAAS / SOFTWARE:
- Hero: Product screenshots, dashboard UI, or abstract tech
- Features: Grid of capabilities with icons
- Pricing: Tiered plans with feature comparison
- Testimonials: Business results and ROI focus
- CTA: Free trial or demo emphasis

RESTAURANT / FOOD:
- Hero: Stunning food photography or dining ambiance
- Menu: Visual categories or signature dishes
- Gallery: Food close-ups and restaurant atmosphere
- About: Chef story or culinary philosophy
- Contact: Reservations and location priority

E-COMMERCE / RETAIL:
- Hero: Featured products or collections
- Products: Grid of items with prices
- Features: Shipping, returns, guarantees
- Testimonials: Customer reviews with product focus
- CTA: Shop now or special offers

AGENCY / SERVICES:
- Hero: Results-focused messaging with portfolio preview
- Services: Clear offering cards with icons
- Portfolio: Case studies and client work
- About: Team expertise and process
- Testimonials: Client success metrics

--------------------------------------------------
OUTPUT FORMAT (STRICT JSON)
--------------------------------------------------

Return a JSON object where:
- Each key is a section name (EXACTLY as listed above)
- Each value describes visual intent only

Allowed properties per section:
- variant: one of ["hero", "split", "cards", "grid", "content"]
- emphasis: one of ["visual", "text", "balanced"]
- background: one of ["default", "muted", "contrast"]
- cta: boolean

Variant descriptions:
- "hero": Large, attention-grabbing opening section with image + text
- "split": Two-column layout with image on one side, content on other
- "cards": Grid of equal cards/items (features, services, testimonials)
- "grid": Image grid or project showcase
- "content": Text-focused section with paragraphs

Emphasis descriptions:
- "visual": Image-heavy, minimal text (galleries, portfolios)
- "text": Content-focused with detailed copy (about, services)
- "balanced": Equal mix of imagery and text (hero, features)

Background descriptions:
- "default": Standard light background
- "muted": Subtle gray/tinted background for section separation
- "contrast": Dark or bold background for emphasis

DO NOT include:
- layout nodes
- columns
- containers
- block arrays
- HTML
- CSS
- explanations
- content text

--------------------------------------------------
VISUAL RHYTHM RULES
--------------------------------------------------

Create visual variety by:
1. Alternating emphasis: visual → text → balanced → visual
2. Varying backgrounds: default → muted → contrast → default
3. Mixing variants: hero → cards → split → grid → content
4. Strategic CTAs: hero (always), services (optional), final CTA (always)

Never use the same combination twice in a row.

--------------------------------------------------
EXAMPLES BY BUSINESS TYPE
--------------------------------------------------

REAL ESTATE EXAMPLE:
{
  "hero": {
    "variant": "hero",
    "emphasis": "visual",
    "background": "contrast",
    "cta": true
  },
  "featured_projects": {
    "variant": "grid",
    "emphasis": "visual",
    "background": "default",
    "cta": false
  },
  "services": {
    "variant": "cards",
    "emphasis": "balanced",
    "background": "muted",
    "cta": true
  },
  "about": {
    "variant": "split",
    "emphasis": "text",
    "background": "default",
    "cta": false
  },
  "testimonials": {
    "variant": "cards",
    "emphasis": "text",
    "background": "muted",
    "cta": false
  },
  "cta": {
    "variant": "content",
    "emphasis": "text",
    "background": "contrast",
    "cta": true
  }
}

SAAS EXAMPLE:
{
  "hero": {
    "variant": "hero",
    "emphasis": "balanced",
    "background": "contrast",
    "cta": true
  },
  "features": {
    "variant": "cards",
    "emphasis": "balanced",
    "background": "default",
    "cta": false
  },
  "pricing": {
    "variant": "cards",
    "emphasis": "text",
    "background": "muted",
    "cta": true
  },
  "testimonials": {
    "variant": "grid",
    "emphasis": "text",
    "background": "default",
    "cta": false
  },
  "cta": {
    "variant": "content",
    "emphasis": "text",
    "background": "contrast",
    "cta": true
  }
}

RESTAURANT EXAMPLE:
{
  "hero": {
    "variant": "hero",
    "emphasis": "visual",
    "background": "contrast",
    "cta": true
  },
  "menu_highlights": {
    "variant": "cards",
    "emphasis": "visual",
    "background": "default",
    "cta": false
  },
  "about_chef": {
    "variant": "split",
    "emphasis": "text",
    "background": "muted",
    "cta": false
  },
  "gallery": {
    "variant": "grid",
    "emphasis": "visual",
    "background": "default",
    "cta": false
  },
  "reservations": {
    "variant": "content",
    "emphasis": "text",
    "background": "contrast",
    "cta": true
  }
}

--------------------------------------------------
USER INTENT (FINAL CHECK)
--------------------------------------------------

User's original request: "${userPrompt}"

Before generating your response:
1. What business type did the user request?
2. Are your variants appropriate for that business type?
3. Does the visual rhythm create good contrast?
4. Are CTAs placed strategically?

Return ONLY the JSON object matching the sections listed above.
`.trim();
}
