// /apps/web-app/modules/builder/ai-v7/prompt/images.ts

export function imagePrompt(sectionIds: string[], userPrompt?: string) {
  const contextHint = userPrompt ? `
USER CONTEXT:
"${userPrompt}"

Analyze the business type and generate images appropriate for that industry.
` : '';

  return `
You are generating image prompts for a professional website.

${contextHint}

---
CRITICAL STYLE REQUIREMENTS
---

ALL images MUST be:
✅ Photorealistic (professional photography, not illustrations)
✅ Natural colors (balanced saturation, not oversaturated)
✅ Proper exposure (not washed out, not too dark)
✅ High quality (sharp, clear, professional)
✅ Modern aesthetic (clean, contemporary, 2024+ style)

NEVER generate:
❌ Oil painting style
❌ Watercolor or artistic rendering
❌ Illustrations or drawings
❌ Cartoon or anime style
❌ High contrast/oversaturated colors
❌ Vintage or retro filters
❌ HDR overdone effects

---
PHOTOGRAPHY KEYWORDS (ALWAYS INCLUDE)
---

Start EVERY prompt with these keywords:
"professional photography, photorealistic, DSLR camera, natural lighting"

Additional quality keywords to use:
- High resolution
- 8K quality
- Professional commercial photography
- Natural color grading
- Soft natural light
- Balanced exposure
- Sharp focus
- Clean composition
- Modern aesthetic
- Editorial photography

---
LIGHTING GUIDELINES
---

Good lighting terms:
- Natural daylight
- Soft window light
- Golden hour lighting
- Diffused natural light
- Bright and airy
- Well-lit studio setup

Avoid:
- Dramatic lighting (unless for luxury brands)
- Heavy shadows
- Harsh contrast
- Artificial neon lighting

---
INDUSTRY-SPECIFIC IMAGE STYLES
---

REAL ESTATE / CONSTRUCTION:
- Architectural photography
- Wide-angle interior shots
- Exterior building photography
- Clean modern spaces
- Professional real estate photography
Example: "professional real estate photography, photorealistic, DSLR, wide-angle shot of luxury apartment interior with natural daylight, modern furniture, clean lines, balanced colors, 8K quality"

SAAS / TECH:
- Clean workspace photography
- Modern office environments
- Tech product photography
- Collaborative team shots
Example: "professional photography, photorealistic, modern tech office with developers working on MacBooks, natural window light, clean minimal aesthetic, balanced colors, DSLR camera, 8K quality"

RESTAURANT / FOOD:
- Food photography
- Restaurant ambiance shots
- Chef preparation shots
- Plated dishes close-ups
Example: "professional food photography, photorealistic, beautifully plated gourmet dish on white ceramic, natural daylight, shallow depth of field, DSLR macro lens, appetizing colors, 8K quality"

E-COMMERCE / RETAIL:
- Product photography
- Lifestyle product shots
- Studio product photography
- Usage context shots
Example: "professional product photography, photorealistic, premium product on clean white background, soft studio lighting, DSLR camera, sharp focus, natural colors, commercial photography, 8K quality"

HEALTHCARE / MEDICAL:
- Medical facility photography
- Professional healthcare shots
- Clean clinical environments
- Patient care moments
Example: "professional medical photography, photorealistic, modern hospital interior with medical equipment, bright clean lighting, DSLR camera, clinical aesthetic, natural colors, 8K quality"

AGENCY / CREATIVE:
- Creative workspace shots
- Team collaboration photography
- Design process shots
- Modern office environments
Example: "professional office photography, photorealistic, creative agency workspace with designers collaborating, natural window light, modern minimalist interior, DSLR camera, balanced colors, 8K quality"

---
COMPOSITION GUIDELINES
---

Hero sections:
- Wide-angle shots
- Establishing scenes
- Aspirational imagery
- Spacious compositions
Format: "professional photography, photorealistic, wide-angle [subject], natural lighting, DSLR camera, modern aesthetic, balanced colors, 8K quality"

Feature sections:
- Detail shots
- Close-ups highlighting specific elements
- Product in use
- Focused compositions
Format: "professional photography, photorealistic, close-up of [subject], soft natural light, DSLR macro lens, sharp focus, natural color grading, 8K quality"

About/Team sections:
- People photography
- Authentic moments
- Professional portraits
- Workplace candids
Format: "professional portrait photography, photorealistic, [people description], natural window light, shallow depth of field, DSLR camera, authentic moment, balanced colors, 8K quality"

Gallery/Portfolio sections:
- Portfolio-quality shots
- Showcase photography
- High-end commercial photography
- Editorial style
Format: "professional commercial photography, photorealistic, [subject], editorial style, natural lighting, DSLR camera, sharp focus, modern aesthetic, 8K quality"

---
OUTPUT FORMAT (STRICT)
---

Return plain text only.
One line per section.
Each line format: SectionID: image prompt

EXACT section IDs to use:
${sectionIds.join("\n")}

---
EXAMPLES OF CORRECT PROMPTS
---

GOOD (Photorealistic Real Estate):
hero: professional real estate photography, photorealistic, wide-angle interior shot of luxury 3BHK apartment with floor-to-ceiling windows, natural daylight flooding modern living room, clean contemporary furniture, neutral color palette, DSLR camera, 8K quality, balanced exposure

projects_gallery: professional architectural photography, photorealistic, exterior view of modern residential building at golden hour, clean lines, glass facades, landscaped gardens, natural warm lighting, DSLR camera, sharp focus, editorial quality, 8K resolution

about: professional corporate photography, photorealistic, construction team reviewing blueprints at building site, natural daylight, authentic moment, DSLR camera, balanced colors, professional composition, 8K quality

GOOD (Photorealistic SaaS):
hero: professional technology photography, photorealistic, modern tech office with developers collaborating around large monitor displaying dashboard, natural window light, clean minimal workspace, DSLR camera, balanced colors, 8K quality

features: professional product photography, photorealistic, close-up of hands typing on MacBook showing software interface, soft natural light, shallow depth of field, DSLR macro lens, modern aesthetic, 8K quality

testimonials: professional portrait photography, photorealistic, diverse business team smiling in modern office, natural window light, authentic expressions, DSLR camera, balanced skin tones, editorial quality, 8K resolution

GOOD (Photorealistic Restaurant):
hero: professional food photography, photorealistic, beautifully plated gourmet dish with vibrant fresh ingredients, soft natural daylight, white ceramic plate, DSLR macro lens, appetizing natural colors, shallow depth of field, 8K quality

about: professional restaurant photography, photorealistic, chef preparing food in modern commercial kitchen, natural daylight from large windows, authentic cooking moment, DSLR camera, balanced warm tones, editorial style, 8K quality

BAD (Will generate paintings):
hero: cinematic view of interior with warm light ❌
features: modern design with clean lines ❌
about: team working together ❌

BAD (Will be oversaturated):
hero: vibrant colorful modern office ❌
features: bold dramatic lighting ❌
about: high contrast team photo ❌

---
ANTI-PAINTING KEYWORDS
---

Include these to prevent artistic rendering:
- NOT illustration
- NOT painting
- NOT artistic rendering
- photorealistic only
- real photography
- actual photograph

Example enhanced prompt:
"professional photography, photorealistic, NOT illustration, NOT painting, real photograph, DSLR camera, [subject description], natural lighting, balanced colors, 8K quality"

---
COLOR GRADING KEYWORDS
---

For natural, balanced colors:
- Natural color grading
- Balanced saturation
- True-to-life colors
- Neutral color palette
- Soft muted tones (for elegant/luxury)
- Vibrant but natural (for food/retail, if needed)
- Professional color correction
- Cinematic color grading (subtle, not overdone)

---
GENERATE IMAGE PROMPTS NOW
---

For each section ID listed above, generate ONE photorealistic image prompt following ALL guidelines.

Start every prompt with:
"professional photography, photorealistic, DSLR camera, natural lighting, NOT illustration, NOT painting, [your description], balanced colors, 8K quality"

Return plain text, one section per line.
`.trim();
}
