// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v8/lib/reactGenerator.ts

import OpenAI from "openai";
import type { AIV8BrandContext } from "../types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/* ============================================================
   MAIN GENERATOR - INITIAL CREATION
============================================================ */

export async function generateReactComponent({
  userPrompt,
  brandContext,
  generateImage,
}: {
  userPrompt: string;
  brandContext?: AIV8BrandContext;
  generateImage: (prompt: string) => Promise<string>;
}): Promise<string> {
  console.log("[React-Gen] 🚀 Starting generation...");
  console.log("[React-Gen] User prompt:", userPrompt);
  console.log("[React-Gen] Brand context:", {
    hasLogo: !!brandContext?.logoUrl,
    hasColors: !!brandContext?.designTokens?.colors,
    colors: brandContext?.designTokens?.colors,
  });

  const industry = detectIndustry(userPrompt);
  console.log("[React-Gen] 🏭 Detected industry:", industry);

  const systemPrompt = buildReactSystemPrompt(industry, brandContext);
  const userMessage = buildReactUserPrompt(userPrompt, industry, brandContext);

  console.log("[React-Gen] 📤 Calling OpenAI GPT-4o...");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    temperature: 1.0,
    max_tokens: 16000,
  });

  let code = completion.choices[0]?.message?.content?.trim() || "";
  
  console.log("[React-Gen] ✅ Generated code length:", code.length);

  code = cleanCode(code);

  // Generate images
  const imagePlaceholders = extractImagePlaceholders(code);
  console.log("[React-Gen] 🖼️ Found", imagePlaceholders.length, "image placeholders");

  if (imagePlaceholders.length > 0) {
    console.log("[React-Gen] 📸 Generating images via Freepik...");
    
    const imageUrls = await Promise.all(
      imagePlaceholders.map(async (placeholder, index) => {
        try {
          console.log(`[React-Gen] 🎨 Generating ${placeholder.type.toUpperCase()} ${index + 1}/${imagePlaceholders.length}`);
          console.log(`[React-Gen]   Prompt: "${placeholder.prompt}"`);
          
          const url = await generateImage(placeholder.prompt);
          
          console.log(`[React-Gen] ✅ ${placeholder.type.toUpperCase()} ${index + 1} generated:`, url);
          return { id: placeholder.id, url, type: placeholder.type };
        } catch (err: any) {
          console.error(`[React-Gen] ❌ ${placeholder.type.toUpperCase()} ${index + 1} failed:`, err.message);
          return { 
            id: placeholder.id, 
            url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop",
            type: placeholder.type,
          };
        }
      })
    );

    console.log("[React-Gen] 🔄 Replacing image placeholders in code...");
    code = replaceImagePlaceholders(code, imageUrls);
    console.log("[React-Gen] ✅ All images inserted");
  }

  console.log("[React-Gen] 🎉 Component generation complete!");
  return code;
}

/* ============================================================
   ✨ NEW: ITERATIVE REFINEMENT - LOVABLE STYLE
============================================================ */

export async function refineReactComponent({
  currentCode,
  userRequest,
  targetSection,
  brandContext,
  generateImage,
}: {
  currentCode: string;
  userRequest: string;
  targetSection?: string;
  brandContext?: AIV8BrandContext;
  generateImage: (prompt: string) => Promise<string>;
}): Promise<string> {
  console.log("[React-Refine] 🔄 Starting refinement...");
  console.log("[React-Refine] Request:", userRequest);
  console.log("[React-Refine] Target section:", targetSection || "entire page");

  const colors = brandContext?.designTokens?.colors;
  
  let colorContext = '';
  if (colors) {
    colorContext = `
**BRAND COLORS (MUST MAINTAIN):**
Primary: ${colors.primary}
Accent: ${colors.accent}
Use these colors consistently in the update.
`;
  }

  const systemPrompt = `You are an expert React developer making surgical updates to existing code.

⚠️ **CRITICAL RULES:**
1. ✅ Output ONLY the full updated TSX code (no explanations, no markdown)
2. ✅ Maintain ALL existing functionality that isn't being changed
3. ✅ Keep the same component structure and imports
4. ✅ Preserve existing images unless specifically asked to change them
5. ✅ Use Tailwind CSS for any new styling
6. ✅ Keep responsive design intact (sm:, md:, lg:)
7. ✅ If adding new images, use data-ai-image or data-ai-bg attributes
8. ✅ Start with "use client"; and export default function

${colorContext}

**REFINEMENT APPROACH:**
${targetSection 
  ? `- ONLY modify the ${targetSection} section
     - Leave all other sections EXACTLY as they are
     - Match the existing design language`
  : `- Make minimal changes to implement the request
     - Preserve the overall structure and flow
     - Maintain consistency with existing design`
}

**OUTPUT FORMAT:**
- Complete, working TSX code
- Start with "use client";
- Export default function Website()
- NO explanations or comments`;

  const userMessage = `
**CURRENT CODE:**
\`\`\`tsx
${currentCode}
\`\`\`

**USER REQUEST:**
${userRequest}

${targetSection ? `**TARGET SECTION:** ${targetSection} (modify only this section)` : ''}

**INSTRUCTIONS:**
Update the code to implement the user's request while maintaining all other functionality.
${targetSection ? `Focus only on the ${targetSection} section.` : 'Make minimal, targeted changes.'}

Output the complete updated code.`;

  console.log("[React-Refine] 📤 Calling OpenAI GPT-4o...");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    temperature: 0.3, // Lower temperature for precision
    max_tokens: 16000,
  });

  let code = completion.choices[0]?.message?.content?.trim() || "";
  console.log("[React-Refine] ✅ Refined code length:", code.length);

  code = cleanCode(code);

  // Check for new images
  const newImagePlaceholders = extractImagePlaceholders(code);
  const existingImages = extractImagePlaceholders(currentCode);
  
  const addedImages = newImagePlaceholders.filter(
    newImg => !existingImages.some(existing => existing.prompt === newImg.prompt)
  );

  if (addedImages.length > 0) {
    console.log("[React-Refine] 🖼️ Found", addedImages.length, "new image placeholders");
    
    const imageUrls = await Promise.all(
      addedImages.map(async (placeholder, index) => {
        try {
          console.log(`[React-Refine] 🎨 Generating new image ${index + 1}/${addedImages.length}`);
          const url = await generateImage(placeholder.prompt);
          return { id: placeholder.id, url, type: placeholder.type };
        } catch (err: any) {
          return { 
            id: placeholder.id, 
            url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop",
            type: placeholder.type,
          };
        }
      })
    );

    code = replaceImagePlaceholders(code, imageUrls);
  }

  console.log("[React-Refine] 🎉 Refinement complete!");
  return code;
}

/* ============================================================
   ✨ NEW: SECTION PARSER
============================================================ */

export function parseCodeSections(code: string): {
  sections: Array<{ name: string; start: number; end: number; content: string }>;
  hasSection: (name: string) => boolean;
} {
  const sections: Array<{ name: string; start: number; end: number; content: string }> = [];

  // Parse navigation
  const navMatch = code.match(/<nav[\s\S]*?<\/nav>/i);
  if (navMatch) {
    sections.push({
      name: 'navigation',
      start: navMatch.index!,
      end: navMatch.index! + navMatch[0].length,
      content: navMatch[0],
    });
  }

  // Parse hero/header
  const heroMatch = code.match(/<header[\s\S]*?<\/header>/i);
  if (heroMatch) {
    sections.push({
      name: 'hero',
      start: heroMatch.index!,
      end: heroMatch.index! + heroMatch[0].length,
      content: heroMatch[0],
    });
  }

  // Parse sections by id
  const sectionRegex = /<section[^>]*id="([^"]*)"[\s\S]*?<\/section>/gi;
  let match;
  
  while ((match = sectionRegex.exec(code)) !== null) {
    sections.push({
      name: match[1],
      start: match.index,
      end: match.index + match[0].length,
      content: match[0],
    });
  }

  // Parse footer
  const footerMatch = code.match(/<footer[\s\S]*?<\/footer>/i);
  if (footerMatch) {
    sections.push({
      name: 'footer',
      start: footerMatch.index!,
      end: footerMatch.index! + footerMatch[0].length,
      content: footerMatch[0],
    });
  }

  return {
    sections,
    hasSection: (name: string) => sections.some(s => s.name === name),
  };
}

/* ============================================================
   SYSTEM PROMPT - LOVABLE QUALITY
============================================================ */

function buildReactSystemPrompt(industry: string, brandContext?: AIV8BrandContext): string {
  const colors = brandContext?.designTokens?.colors;

  let colorStyles = '';
  if (colors) {
    colorStyles = `
🎨 **BRAND COLORS (MANDATORY - USE THESE EXACT COLORS):**

Primary: ${colors.primary || '#2563eb'}
Accent: ${colors.accent || '#f59e0b'}
Background: ${colors.background || '#ffffff'}
Text Primary: ${colors.textPrimary || '#0f172a'}
Text Secondary: ${colors.textSecondary || '#64748b'}

**Example usage:**
- Hero gradient: className="bg-gradient-to-br from-[${colors.primary}] via-[${colors.accent}] to-[${colors.primary}]"
- Buttons: className="bg-gradient-to-r from-[${colors.primary}] to-[${colors.accent}] text-white"
- Accents: className="text-[${colors.primary}] border-[${colors.accent}]"
- Hover effects: hover:from-[${colors.accent}] hover:to-[${colors.primary}]

⚠️ **CRITICAL: Use these exact colors in ALL gradients, buttons, and accents. DO NOT use default Tailwind colors.**
`;
  }

  return `You are an elite React/Next.js developer specializing in creating stunning, production-ready websites that match Lovable.dev quality standards.

⚠️ **ABSOLUTE REQUIREMENTS - NO EXCEPTIONS:**

1. ✅ Output ONLY valid TSX code (NO explanations, NO markdown blocks, NO comments)
2. ✅ Start with: "use client";
3. ✅ Import: import React, { useState } from 'react';
4. ✅ Export: export default function Website()
5. ✅ Use ONLY Tailwind CSS (NO inline styles except for backgroundImage, NO <style> tags)
6. ✅ Fully responsive (mobile-first: sm:, md:, lg:, xl:, 2xl:)
7. ✅ Include working mobile menu with hamburger icon using useState
8. ✅ Use semantic HTML5: <nav>, <header>, <main>, <section>, <footer>
9. ✅ Add id attributes to all major sections for easy targeting (id="features", id="pricing", etc.)
10. ✅ Add hover effects and smooth transitions on ALL interactive elements
11. ✅ Generate 4-8 high-quality images using data-ai-image AND data-ai-bg attributes

${colorStyles}

🎨 **DESIGN EXCELLENCE - LOVABLE STANDARDS:**

**SPACING (MANDATORY):**
- Section padding: py-20 md:py-28 lg:py-36
- Container: container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl
- Grid gaps: gap-6 md:gap-8 lg:gap-12
- Card padding: p-6 md:p-8 lg:p-10
- Element margins: mb-4, mb-6, mb-8, mb-12, mb-16

**TYPOGRAPHY (MANDATORY):**
- Hero H1: text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight
- Section H2: text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight
- Section H3: text-2xl md:text-3xl lg:text-4xl font-semibold mb-3 md:mb-4
- Body text: text-base md:text-lg lg:text-xl leading-relaxed
- Small text: text-sm md:text-base text-gray-600 dark:text-gray-400

**COLORS & GRADIENTS:**
${colors?.primary ? `
- Primary buttons: bg-gradient-to-r from-[${colors.primary}] to-[${colors.accent}] hover:from-[${colors.accent}] hover:to-[${colors.primary}]
- Hero overlays: bg-gradient-to-br from-[${colors.primary}]/90 via-[${colors.accent}]/80 to-[${colors.primary}]/90
- Section backgrounds: bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800
- Accent colors: text-[${colors.primary}], border-[${colors.accent}]
- Hover states: hover:text-[${colors.accent}], hover:border-[${colors.primary}]
` : `
- Primary buttons: bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600
- Hero overlays: bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-blue-900/90
- Section backgrounds: bg-gradient-to-b from-slate-50 to-white
`}

**SHADOWS & DEPTH:**
- Cards: shadow-lg hover:shadow-2xl transition-shadow duration-500
- Buttons: shadow-lg hover:shadow-2xl transition-shadow duration-300
- Navigation: shadow-md backdrop-blur-lg
- Floating elements: shadow-2xl
- Inset shadows: shadow-inner for depth

**ROUNDED CORNERS:**
- Buttons: rounded-xl (primary), rounded-full (pills)
- Cards: rounded-2xl md:rounded-3xl
- Images: rounded-xl md:rounded-2xl
- Small elements: rounded-lg
- Hero sections: rounded-3xl (for floating cards)

**ANIMATIONS (EVERY INTERACTIVE ELEMENT):**
- Fade in: opacity-0 animate-fadeIn
- Stagger children: delay-[100ms], delay-[200ms], delay-[300ms]
- Hover scale: hover:scale-105 transition-transform duration-300
- Card hover: hover:-translate-y-2 transition-all duration-500 ease-out
- Button hover: hover:shadow-2xl hover:scale-105 transition-all duration-300
- Image zoom: group-hover:scale-110 transition-transform duration-700 ease-out
- Background shift: bg-gradient-to-r hover:bg-gradient-to-l transition-all duration-500
- Smooth scroll: scroll-smooth
- Entrance animations: animate-slideInUp, animate-slideInLeft, animate-slideInRight

**GLASSMORPHISM (USE IN HERO & NAV):**
- Navigation: backdrop-blur-lg bg-white/90 md:bg-white/95 border-b shadow-sm dark:bg-slate-900/90
- Hero cards: backdrop-blur-md bg-white/10 border border-white/20 shadow-xl
- Floating elements: backdrop-blur-sm bg-white/5 border border-white/10
- Overlays: backdrop-blur-xl bg-black/50

🖼️ **IMAGE GENERATION (CRITICAL - MUST USE BOTH TYPES):**

**1. Background Images (data-ai-bg) - USE FOR HERO AND LARGE SECTIONS:**
\`\`\`tsx
<header 
  data-ai-bg="luxury modern real estate building exterior at sunset, glass facade, golden hour lighting, architectural photography, professional, 8k, ultra wide angle, cinematic"
  className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
>
  <div className="absolute inset-0 bg-gradient-to-br from-[PRIMARY]/90 via-[ACCENT]/80 to-[PRIMARY]/90"></div>
  <div className="relative z-10 container mx-auto px-6 text-center text-white">
    <h1 className="text-7xl font-black">Hero Content</h1>
  </div>
</header>
\`\`\`

**2. Content Images (data-ai-image) - USE FOR CARDS, GALLERIES:**
\`\`\`tsx
<img 
  data-ai-image="luxury modern apartment interior with spacious living room, floor-to-ceiling windows, natural daylight, minimalist furniture, professional real estate photography, 8k, high detail"
  src="PLACEHOLDER" 
  alt="Property Interior" 
  className="w-full h-72 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700"
/>
\`\`\`

**IMAGE PROMPT BEST PRACTICES (MANDATORY):**

**Hero Backgrounds (data-ai-bg) - Minimum 15 words:**
✓ "luxury modern penthouse interior with floor-to-ceiling windows overlooking city skyline at golden hour sunset, architectural photography, professional, 8k, ultra wide angle, cinematic lighting"
✓ "elegant fine dining restaurant interior with warm ambient lighting, wooden tables, marble bar counter, soft glow, professional photography, wide angle, atmospheric"
✓ "modern minimalist office workspace with natural daylight, glass walls, indoor plants, clean desk setup, professional photography, 8k, bright and airy"
✗ "nice building" (too vague, too short)
✗ "house interior" (not descriptive enough)

**Content Images (data-ai-image) - Minimum 12 words:**
✓ "smiling professional businesswoman in navy blue suit standing in modern office with natural light, confident pose, portrait photography, professional headshot, high quality"
✓ "gourmet wagyu beef steak dish with herb garnish on elegant white plate, overhead view, food photography, professional, restaurant quality, high detail"
✓ "modern luxury gym interior with state-of-the-art exercise equipment, floor mirrors, natural daylight from large windows, professional photography, clean and spacious"
✗ "person working" (too generic)
✗ "food on plate" (not descriptive)

**Mandatory Keywords in EVERY Image Prompt:**
- Lighting: "golden hour", "natural light", "warm ambient", "sunset", "daylight", "soft glow"
- Quality: "professional photography", "8k", "high detail", "ultra sharp", "high quality"
- Style: "architectural photography", "portrait photography", "food photography", "real estate photography"
- Mood: "luxury", "modern", "elegant", "premium", "sophisticated", "clean", "atmospheric"
- Technical: "wide angle", "overhead view", "cinematic", "well-lit", "sharp focus"

**CRITICAL:** Every image prompt MUST be at least 12-15 words and include lighting, quality, style, and mood keywords.

📱 **MOBILE RESPONSIVENESS - PERFECT ON ALL DEVICES:**

**Navigation with Working Mobile Menu:**
\`\`\`tsx
const [isMenuOpen, setIsMenuOpen] = useState(false);

<nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/95 border-b shadow-sm">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center max-w-7xl">
    <div className="text-2xl md:text-3xl font-bold text-gray-900">
      ${brandContext?.logoUrl 
        ? `<img src="${brandContext.logoUrl}" alt="Logo" className="h-8 md:h-10" />`
        : 'Brand Name'
      }
    </div>
    
    {/* Desktop Menu */}
    <div className="hidden md:flex items-center gap-6 lg:gap-8">
      <a href="#features" className="text-gray-700 hover:text-[PRIMARY] font-medium transition-colors duration-300">Features</a>
      <a href="#about" className="text-gray-700 hover:text-[PRIMARY] font-medium transition-colors duration-300">About</a>
      <a href="#contact" className="text-gray-700 hover:text-[PRIMARY] font-medium transition-colors duration-300">Contact</a>
    </div>
    
    {/* Mobile Toggle */}
    <button 
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className="md:hidden text-3xl text-gray-900 hover:text-[PRIMARY] transition-colors"
      aria-label="Toggle menu"
    >
      {isMenuOpen ? '✕' : '☰'}
    </button>
    
    {/* Desktop CTA */}
    <button className="hidden md:flex px-6 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-[PRIMARY] to-[ACCENT] text-white rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300">
      Get Started
    </button>
  </div>
  
  {/* Mobile Menu */}
  <div className={\`md:hidden overflow-hidden transition-all duration-300 \${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}\`}>
    <div className="bg-white border-t px-4 py-4 space-y-3">
      <a href="#features" className="block py-2 text-gray-700 hover:text-[PRIMARY] transition-colors">Features</a>
      <a href="#about" className="block py-2 text-gray-700 hover:text-[PRIMARY] transition-colors">About</a>
      <a href="#contact" className="block py-2 text-gray-700 hover:text-[PRIMARY] transition-colors">Contact</a>
      <button className="w-full mt-3 px-6 py-3 bg-gradient-to-r from-[PRIMARY] to-[ACCENT] text-white rounded-full font-semibold">
        Get Started
      </button>
    </div>
  </div>
</nav>
\`\`\`

**Responsive Grids:**
- 1 column mobile, 2 tablet, 3+ desktop: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Consistent gaps: gap-6 md:gap-8 lg:gap-12
- Responsive padding: px-4 sm:px-6 lg:px-8

🏗️ **INDUSTRY-SPECIFIC STRUCTURE FOR ${industry.toUpperCase()}:**

${getIndustryTemplate(industry, colors)}

✅ **FINAL CHECKLIST BEFORE OUTPUT:**
- [ ] Code starts with "use client";
- [ ] useState imported for mobile menu
- [ ] All sections have id attributes
- [ ] 4-8 images with detailed prompts (12-15 words each)
- [ ] Brand colors used consistently
- [ ] Mobile menu works with useState
- [ ] All interactive elements have hover effects
- [ ] Responsive breakpoints on all sections
- [ ] Semantic HTML throughout
- [ ] Clean, production-ready code with no errors`;
}

/* ============================================================
   INDUSTRY TEMPLATES - COMPREHENSIVE
============================================================ */

function getIndustryTemplate(industry: string, colors?: any): string {
  const primary = colors?.primary || '#2563eb';
  const accent = colors?.accent || '#f59e0b';

  const templates: Record<string, string> = {
    "real-estate": `
**REAL ESTATE WEBSITE - PREMIUM STRUCTURE:**

✅ **Required Sections (in order):**
1. **Hero** (id="hero"): 
   - Full-screen background image with glass overlay
   - Headline: "[Company Name] - Building Dreams, Creating Landmarks"
   - Subheadline: Luxury living description
   - 2 CTAs: "Explore Properties" (primary), "Schedule Visit" (secondary)
   - Trust badge: "Trusted Since [Year]"

2. **Featured Properties** (id="properties"):
   - Section title: "Featured Projects"
   - 3-column grid (1 col mobile, 2 tablet, 3 desktop)
   - Each card: Image, "Featured" badge, location tag, title, description, price with "₹" symbol, "View Details" CTA
   - Hover: Card lifts up, image zooms

3. **Stats** (id="stats"):
   - 4-column grid: Properties Sold, Happy Families, Years Experience, Awards Won
   - Large numbers with gradient text
   - Animated counters feel

4. **Amenities** (id="amenities"):
   - Gradient background (primary to accent)
   - Title: "World-Class Amenities"
   - Icon grid: 8 amenities (🏊 Pool, 🏋️ Gym, 🌳 Gardens, 🔒 Security, 🚗 Parking, 👶 Kids Play, 🎾 Sports, 🏢 Clubhouse)
   - Glass morphism cards

5. **Location** (id="location"):
   - Title: "Prime Location Benefits"
   - 3-column grid: Connectivity, Schools/Hospitals, Lifestyle
   - Icons with descriptions

6. **CTA Section** (id="cta"):
   - Full-width gradient background
   - Centered content: "Ready to Find Your Dream Home?"
   - Primary CTA: "Schedule a Site Visit"
   - Secondary: "Download Brochure"

7. **Footer** (id="footer"):
   - 4-column grid: About, Quick Links, Contact, Social
   - Copyright notice

✅ **Design Specifics:**
- Property prices: Use ₹ symbol (Indian Rupees)
- Luxury language: "Premium", "Exclusive", "World-class"
- Call-outs: "RERA Approved", "Vastu Compliant"
- Image types: Building exteriors, luxury interiors, amenities`,

    "restaurant": `
**RESTAURANT WEBSITE - ELEGANT STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Restaurant ambiance, tagline, "Reserve Table" CTA
2. **Menu Highlights** (id="menu"): 6 signature dishes with images, prices
3. **Chef's Story** (id="about"): Chef photo, credentials, philosophy
4. **Gallery** (id="gallery"): 6-8 food photography images in masonry grid
5. **Reservations** (id="reservations"): Booking form, hours, contact
6. **Location** (id="location"): Map, address, parking info
7. **Footer**: Contact, social, hours

✅ **Design Specifics:**
- Warm colors: Browns, golds, burgundy
- Serif fonts for elegance
- Food photography focus
- Menu items with pricing
- Testimonials with star ratings`,

    "saas": `
**SAAS WEBSITE - MODERN STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Value prop, "Start Free Trial" + "Watch Demo"
2. **Features** (id="features"): 6 key features with icons
3. **How It Works** (id="how"): 3-step process
4. **Benefits** (id="benefits"): ROI, efficiency, automation
5. **Pricing** (id="pricing"): 3-tier table (Basic, Pro, Enterprise)
6. **Testimonials** (id="testimonials"): Customer reviews with logos
7. **Integrations** (id="integrations"): Logo wall of integrations
8. **CTA** (id="cta"): Final conversion push
9. **Footer**: Links, resources, legal

✅ **Design Specifics:**
- Clean, minimal, modern
- Dashboard screenshots
- Feature icons
- Pricing comparison
- Social proof (customer logos)
- Security badges`,

    "ecommerce": `
**ECOMMERCE WEBSITE - CONVERSION STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Best sellers showcase, sale banner
2. **Categories** (id="categories"): Quick navigation tiles
3. **Featured Products** (id="products"): 8-12 products in grid
4. **Benefits** (id="benefits"): Free shipping, returns, secure checkout
5. **Trending** (id="trending"): Carousel of trending items
6. **Newsletter** (id="newsletter"): Email signup
7. **Footer**: Categories, help, policies

✅ **Design Specifics:**
- Product cards: Image, title, price, rating, "Add to Cart"
- Discount badges
- Star ratings
- Quick view on hover
- Trust badges`,

    "portfolio": `
**PORTFOLIO WEBSITE - CREATIVE STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Name, title, photo, scroll indicator
2. **About** (id="about"): Bio, skills, experience timeline
3. **Projects** (id="projects"): Grid of case studies with hover
4. **Services** (id="services"): What you offer
5. **Testimonials** (id="testimonials"): Client feedback
6. **Contact** (id="contact"): Form, email, social
7. **Footer**: Minimal with copyright

✅ **Design Specifics:**
- Minimalist, elegant
- Large typography
- Project hover overlays
- Skills as tags
- Personal branding`,

    "healthcare": `
**HEALTHCARE WEBSITE - TRUST STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Trust message, "Book Appointment" CTA
2. **Services** (id="services"): Medical services offered
3. **Doctors** (id="doctors"): Team with credentials
4. **Facilities** (id="facilities"): Hospital images, equipment
5. **Specialties** (id="specialties"): Medical departments
6. **Appointment** (id="appointment"): Booking form
7. **Insurance** (id="insurance"): Accepted providers
8. **Footer**: Departments, contact, emergency

✅ **Design Specifics:**
- Professional, calming
- Blue/green colors
- Doctor credentials prominent
- Certifications visible
- Emergency contact highlighted`,

    "education": `
**EDUCATION WEBSITE - ACADEMIC STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Institution name, "Apply Now" CTA
2. **Programs** (id="programs"): Courses with duration, fees
3. **Faculty** (id="faculty"): Teacher profiles with qualifications
4. **Facilities** (id="facilities"): Campus, labs, library
5. **Placements** (id="placements"): Company logos, stats
6. **Admissions** (id="admissions"): Process, dates, fees
7. **Testimonials** (id="testimonials"): Student success stories
8. **Footer**: Departments, admissions, contact

✅ **Design Specifics:**
- Academic, professional
- Stats: Placement %, students placed
- Faculty credentials
- Campus imagery
- Accreditations`,

    "fitness": `
**FITNESS WEBSITE - ENERGETIC STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Transformation image, "Start Free Trial"
2. **Programs** (id="programs"): Workout plans
3. **Trainers** (id="trainers"): Coach profiles
4. **Transformations** (id="transformations"): Before/after gallery
5. **Pricing** (id="pricing"): Membership tiers
6. **Schedule** (id="schedule"): Class timings
7. **Testimonials** (id="testimonials"): Member reviews
8. **CTA** (id="cta"): Join today offer
9. **Footer**: Contact, locations, social

✅ **Design Specifics:**
- Bold, energetic
- Red/orange/yellow colors
- Action photos
- Transformation stories
- Pricing tables`,

    "travel": `
**TRAVEL WEBSITE - ADVENTURE STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Destination hero, "Explore Packages"
2. **Destinations** (id="destinations"): Popular locations grid
3. **Packages** (id="packages"): Tour options with pricing
4. **Gallery** (id="gallery"): Travel photos masonry
5. **Why Us** (id="why"): Expert guides, safety, value
6. **Reviews** (id="reviews"): Customer testimonials
7. **Booking** (id="booking"): Inquiry form
8. **Footer**: Destinations, about, contact

✅ **Design Specifics:**
- Vibrant, adventurous
- Destination cards
- Package comparison
- Trust badges
- Review ratings`,

    "legal": `
**LEGAL WEBSITE - AUTHORITATIVE STRUCTURE:**

✅ **Required Sections:**
1. **Hero** (id="hero"): Firm name, expertise, "Free Consultation"
2. **Practice Areas** (id="practice"): Legal services
3. **Attorneys** (id="attorneys"): Lawyer profiles with credentials
4. **Case Results** (id="results"): Success stories
5. **Process** (id="process"): How we work
6. **Testimonials** (id="testimonials"): Client feedback
7. **Consultation** (id="consultation"): Contact form
8. **Footer**: Practice areas, contact, credentials

✅ **Design Specifics:**
- Professional, authoritative
- Navy/gray colors
- Attorney credentials prominent
- Bar association logos
- Trust indicators`,
  };

  return templates[industry] || templates["real-estate"];
}

/* ============================================================
   USER PROMPT BUILDER
============================================================ */

function buildReactUserPrompt(
  userPrompt: string,
  industry: string,
  brandContext?: AIV8BrandContext
): string {
  let prompt = `Create a stunning, production-ready, Lovable.dev-quality React website for:\n\n${userPrompt}\n\n`;

  if (brandContext?.logoUrl) {
    prompt += `📌 **LOGO URL (USE IN NAVIGATION):** ${brandContext.logoUrl}\n`;
    prompt += `Implementation: <img src="${brandContext.logoUrl}" alt="Logo" className="h-8 md:h-10" />\n\n`;
  }

  const colors = brandContext?.designTokens?.colors;
  if (colors) {
    prompt += `🎨 **BRAND COLORS (USE EVERYWHERE - MANDATORY):**\n`;
    if (colors.primary) prompt += `PRIMARY: ${colors.primary} - Use in buttons, gradients, accents\n`;
    if (colors.accent) prompt += `ACCENT: ${colors.accent} - Use in hover states, highlights\n`;
    prompt += `\n⚠️ CRITICAL: Use these exact hex colors in ALL gradients, buttons, text accents, and hover states.\n`;
    prompt += `Replace [PRIMARY] with ${colors.primary} and [ACCENT] with ${colors.accent} throughout.\n\n`;
  }

  prompt += `📋 **MANDATORY REQUIREMENTS:**\n`;
  prompt += `✓ Follow the ${industry} template structure EXACTLY (all required sections)\n`;
  prompt += `✓ Adapt content specifically to: "${userPrompt}" (company name, services, etc.)\n`;
  prompt += `✓ Add id attributes to ALL major sections (id="hero", id="features", etc.)\n`;
  prompt += `✓ Use data-ai-bg for 1 hero background (detailed 15+ word prompt)\n`;
  prompt += `✓ Use data-ai-image for 4-8 content images (detailed 12+ word prompts each)\n`;
  prompt += `✓ Include ALL hover effects: scale-105, -translate-y-2, shadow-2xl\n`;
  prompt += `✓ Add responsive mobile menu with useState and hamburger icon\n`;
  prompt += `✓ Use semantic HTML: <nav>, <header>, <main>, <section id="...">, <footer>\n`;
  prompt += `✓ Make it visually stunning with gradients, glass morphism, animations\n`;
  prompt += `✓ Include specific details from prompt (company name appears 3+ times)\n`;
  prompt += `✓ All image prompts must be 12-15+ words with lighting, style, mood keywords\n\n`;

  prompt += `🎯 **IMAGE PROMPT REQUIREMENTS:**\n`;
  prompt += `Every image prompt MUST include:\n`;
  prompt += `- Specific subject (what's in the image)\n`;
  prompt += `- Lighting (golden hour, natural light, sunset, etc.)\n`;
  prompt += `- Style (professional photography, architectural, etc.)\n`;
  prompt += `- Mood (luxury, modern, elegant, etc.)\n`;
  prompt += `- Technical (8k, high detail, ultra sharp, etc.)\n`;
  prompt += `Minimum 12 words per prompt!\n\n`;

  prompt += `⚠️ **OUTPUT FORMAT:** Pure TSX code only.\n`;
  prompt += `- Start with "use client";\n`;
  prompt += `- Import React and useState\n`;
  prompt += `- Export default function Website()\n`;
  prompt += `- NO explanations, NO markdown blocks, NO comments\n`;
  prompt += `- Production-ready, error-free code\n`;

  return prompt;
}

/* ============================================================
   HELPERS
============================================================ */

function detectIndustry(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  if (/real estate|property|builder|construction|apartment|villa|residential|commercial property|realty/i.test(promptLower)) {
    return "real-estate";
  }
  if (/restaurant|cafe|food|dining|bistro|eatery|bar|pub|kitchen/i.test(promptLower)) {
    return "restaurant";
  }
  if (/saas|software|app|platform|tool|service|subscription|cloud/i.test(promptLower)) {
    return "saas";
  }
  if (/ecommerce|shop|store|products|retail|marketplace|online store/i.test(promptLower)) {
    return "ecommerce";
  }
  if (/portfolio|personal|freelance|designer|developer|creative/i.test(promptLower)) {
    return "portfolio";
  }
  if (/health|medical|hospital|clinic|doctor|dental|pharmacy|healthcare/i.test(promptLower)) {
    return "healthcare";
  }
  if (/education|school|university|college|academy|institute|learning|training/i.test(promptLower)) {
    return "education";
  }
  if (/fitness|gym|workout|training|yoga|sports|wellness/i.test(promptLower)) {
    return "fitness";
  }
  if (/travel|tour|vacation|holiday|hotel|resort|tourism/i.test(promptLower)) {
    return "travel";
  }
  if (/legal|lawyer|law firm|attorney|advocate|solicitor/i.test(promptLower)) {
    return "legal";
  }
  
  return "real-estate";
}

function cleanCode(code: string): string {
  // Remove markdown wrappers
  code = code.replace(/^```(?:tsx|jsx|typescript|javascript)\s*/gi, '');
  code = code.replace(/^```\s*/g, '');
  code = code.replace(/\s*```$/g, '');
  return code.trim();
}

function extractImagePlaceholders(code: string) {
  const placeholders: Array<{ 
    id: string; 
    prompt: string; 
    type: 'img' | 'bg';
  }> = [];
  
  let index = 0;

  // Extract <img> tags
  const imgRegex = /data-ai-image="([^"]*)"/g;
  let match;

  while ((match = imgRegex.exec(code)) !== null) {
    placeholders.push({ 
      id: `img-${index++}`, 
      prompt: match,[1]
      type: 'img',
    });
  }

  // Extract backgrounds
  const bgRegex = /data-ai-bg="([^"]*)"/g;
  
  while ((match = bgRegex.exec(code)) !== null) {
    placeholders.push({ 
      id: `bg-${index++}`, 
      prompt: match,[1]
      type: 'bg',
    });
  }

  return placeholders;
}

function replaceImagePlaceholders(
  code: string,
  imageUrls: Array<{ id: string; url: string; type: 'img' | 'bg' }>
): string {
  let result = code;

  imageUrls.forEach((imageData) => {
    if (imageData.type === 'bg') {
      // Replace background
      const bgRegex = /data-ai-bg="[^"]*"/;
      result = result.replace(bgRegex, 
        `style={{ backgroundImage: "url('${imageData.url}')" }}`
      );
    } else {
      // Replace img src
      result = result.replace(/src="PLACEHOLDER"/, `src="${imageData.url}"`);
    }
  });

  return result;
}
