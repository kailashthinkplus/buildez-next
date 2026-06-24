// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/prompt/design.ts

import type { AIV7BrandContext } from "../types";

export function designPrompt(brandContext?: AIV7BrandContext, userPrompt?: string): string {
  const hasBrandColors = !!brandContext?.designTokens?.colors;
  const brandColors = brandContext?.designTokens?.colors;

  return `
You are an ELITE design system architect creating industry-specific color palettes.

USER REQUEST: "${userPrompt || ''}"

CRITICAL TASK:
1. Analyze user prompt to identify EXACT business type/industry
2. Generate a professional color palette appropriate for that industry
3. DEFAULT to LIGHT theme (white backgrounds) unless user explicitly requests "dark theme"
4. Colors must be sophisticated and conversion-focused

═══════════════════════════════════════════════════════════
THEME DETECTION (MANDATORY)
═══════════════════════════════════════════════════════════

From user prompt, determine:

**THEME:**
- Default: LIGHT (white/off-white backgrounds)
- Dark: ONLY if prompt contains "dark", "dark mode", "dark theme", "black background"

**INDUSTRY:** Extract from keywords
- Real estate: "real estate", "property", "construction", "builder"
- SaaS: "SaaS", "software", "platform", "app", "tool"
- Restaurant: "restaurant", "cafe", "food", "dining"
- Healthcare: "clinic", "hospital", "medical", "doctor"
- E-commerce: "store", "shop", "e-commerce", "products"
- Consulting: "consulting", "agency", "services"
- Finance: "finance", "bank", "insurance", "investment"
- Education: "school", "education", "courses", "learning"
- Fitness: "gym", "fitness", "yoga", "wellness"
- Luxury: "luxury", "premium", "high-end", "exclusive"

${
  hasBrandColors
    ? `
═══════════════════════════════════════════════════════════
BRAND COLORS PROVIDED (USE THESE!)
═══════════════════════════════════════════════════════════

${JSON.stringify(brandColors, null, 2)}

**CRITICAL:**
- Primary: ${brandColors?.primary || "Not provided"} (MUST USE)
- Accent: ${brandColors?.accent || "Derive from primary"}
- Generate hover states, light variants
- Ensure proper contrast ratios
`
    : ''
}

═══════════════════════════════════════════════════════════
INDUSTRY-SPECIFIC COLOR RULES
═══════════════════════════════════════════════════════════

🏢 REAL ESTATE / CONSTRUCTION:
Primary: Deep navy (#0f172a, #1e293b) or dark slate
Accent: Warm gold (#d4af37, #b8922a) or copper
Background: Pure white (#ffffff)
Surface: Off-white (#fafafa, #f8fafc)
Rationale: Navy = trust, stability. Gold = luxury, premium quality

💼 CONSULTING / B2B / CORPORATE:
Primary: Professional blue (#1e40af, #2563eb)
Accent: Teal (#0d9488) or forest green (#047857)
Background: White (#ffffff)
Surface: Light gray (#f9fafb, #f3f4f6)
Rationale: Blue = professionalism, reliability

💻 SAAS / SOFTWARE / TECH:
Primary: Modern blue (#2563eb, #3b82f6)
Accent: Vibrant purple (#7c3aed, #a855f7)
Background: White (#ffffff)
Surface: Light blue-gray (#f8fafc, #f0f9ff)
Rationale: Blue = innovation. Purple = creativity

🏥 HEALTHCARE / MEDICAL:
Primary: Medical blue (#2563eb, #0284c7)
Accent: Calming teal (#0d9488, #14b8a6)
Background: Clean white (#ffffff)
Surface: Very light blue (#f0f9ff, #e0f2fe)
Rationale: Blue/teal = cleanliness, trust, health

🍕 RESTAURANT / FOOD:
Primary: Rich burgundy (#991b1b, #7f1d1d)
Accent: Warm orange (#ea580c, #f97316)
Background: Warm white (#fffbf5, #fef3c7)
Surface: Cream (#fef3c7, #fef5e7)
Rationale: Red/burgundy = appetite. Orange = warmth, energy

💍 LUXURY / PREMIUM:
Primary: Elegant black (#0f172a, #1e293b)
Accent: Royal gold (#d4af37, #c29d2e)
Background: Pure white (#ffffff) or champagne (#faf8f3)
Surface: Light beige (#fafaf9, #f5f5f4)
Rationale: Black = sophistication. Gold = exclusivity

🛍️ E-COMMERCE / RETAIL:
Primary: Trustworthy blue (#2563eb, #1d4ed8)
Accent: Action orange (#f97316, #ea580c)
Background: White (#ffffff)
Surface: Light gray (#f9fafb, #f3f4f6)
Rationale: Blue = trust. Orange = urgency, CTA

💰 FINANCE / BANKING:
Primary: Corporate navy (#1e40af, #1e3a8a)
Accent: Success green (#047857, #059669)
Background: White (#ffffff)
Surface: Light blue-gray (#f8fafc, #f1f5f9)
Rationale: Navy = security. Green = growth, prosperity

📚 EDUCATION / LEARNING:
Primary: Academic blue (#2563eb, #1d4ed8)
Accent: Knowledge orange (#f97316, #ea580c)
Background: White (#ffffff)
Surface: Very light yellow (#fffbeb, #fef3c7)
Rationale: Blue = knowledge. Orange = energy, engagement

🏋️ FITNESS / GYM / WELLNESS:
Primary: Energetic red (#dc2626, #b91c1c)
Accent: Vitality green (#10b981, #059669)
Background: White (#ffffff)
Surface: Light gray (#f9fafb, #f3f4f6)
Rationale: Red = energy, power. Green = health, vitality

═══════════════════════════════════════════════════════════
REQUIRED JSON STRUCTURE (EXACT FORMAT)
═══════════════════════════════════════════════════════════

Return ONLY this JSON structure. No markdown, no explanations.

{
  "designTokens": {
    "colors": {
      // LIGHT THEME (DEFAULT) - Clean backgrounds
      "background": "#ffffff",
      "surface": "#f8fafc",
      "muted": "#f1f5f9",
      
      // Text hierarchy (dark text on light backgrounds)
      "textPrimary": "#0f172a",
      "textSecondary": "#475569",
      "textTertiary": "#94a3b8",
      "onBackground": "#0f172a",
      
      // Borders (subtle, not harsh)
      "border": "#e2e8f0",
      "borderHover": "#cbd5e1",
      
      // PRIMARY brand color (industry-specific)
      "primary": "#2563eb",
      "primaryHover": "#1d4ed8",
      "primaryLight": "#dbeafe",
      "onPrimary": "#ffffff",
      
      // ACCENT color (complementary to primary)
      "accent": "#6366f1",
      "accentHover": "#4f46e5",
      "onAccent": "#ffffff",
      
      // Semantic (status colors)
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "info": "#3b82f6"
    },
    
    "typography": {
      "fontFamily": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      "fontSize": {
        "xs": 12,
        "sm": 14,
        "base": 16,
        "lg": 18,
        "xl": 20,
        "2xl": 24,
        "3xl": 30,
        "4xl": 36,
        "5xl": 48,
        "6xl": 60,
        "7xl": 72,
        "8xl": 96
      },
      "fontWeight": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700,
        "extrabold": 800,
        "black": 900
      },
      "lineHeight": {
        "none": 1,
        "tight": 1.25,
        "snug": 1.375,
        "normal": 1.5,
        "relaxed": 1.625,
        "loose": 2
      },
      "letterSpacing": {
        "tighter": "-0.05em",
        "tight": "-0.025em",
        "normal": "0em",
        "wide": "0.025em",
        "wider": "0.05em"
      }
    },
    
    "spacing": {
      "0": 0,
      "1": 4,
      "2": 8,
      "3": 12,
      "4": 16,
      "5": 20,
      "6": 24,
      "8": 32,
      "10": 40,
      "12": 48,
      "16": 64,
      "20": 80,
      "24": 96,
      "32": 128,
      "40": 160,
      "48": 192,
      "64": 256
    },
    
    "shadows": {
      "xs": "0 1px 2px rgba(0, 0, 0, 0.05)",
      "sm": "0 1px 3px rgba(0, 0, 0, 0.08)",
      "md": "0 4px 6px rgba(0, 0, 0, 0.07)",
      "lg": "0 10px 15px rgba(0, 0, 0, 0.08)",
      "xl": "0 20px 25px rgba(0, 0, 0, 0.10)",
      "2xl": "0 25px 50px rgba(0, 0, 0, 0.15)",
      "card": "0 2px 8px rgba(0, 0, 0, 0.06)",
      "elevated": "0 8px 16px rgba(0, 0, 0, 0.08)",
      "hover": "0 12px 24px rgba(0, 0, 0, 0.10)",
      "none": "none"
    },
    
    "radius": {
      "none": 0,
      "sm": 8,
      "md": 12,
      "lg": 16,
      "xl": 20,
      "2xl": 24,
      "3xl": 32,
      "full": 9999
    },
    
    "transitions": {
      "fast": "150ms cubic-bezier(0.4, 0, 0.2, 1)",
      "base": "200ms cubic-bezier(0.4, 0, 0.2, 1)",
      "slow": "300ms cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}

═══════════════════════════════════════════════════════════
COLOR SYSTEM REQUIREMENTS
═══════════════════════════════════════════════════════════

1. **BACKGROUNDS (LIGHT THEME DEFAULT):**
   - background: Pure white (#ffffff) or off-white (#fafafa, #f8fafc)
   - surface: Very light gray (#f8fafc, #f9fafb, #f3f4f6)
   - muted: Slightly darker than surface (#f1f5f9, #e5e7eb)

2. **TEXT (DARK ON LIGHT):**
   - textPrimary: Very dark gray/slate (#0f172a, #1e293b, #111827)
   - textSecondary: Medium gray (#475569, #6b7280, #64748b)
   - textTertiary: Light gray (#94a3b8, #9ca3af, #cbd5e1)

3. **PRIMARY (INDUSTRY-SPECIFIC):**
   - Choose from industry rules above
   - primaryHover: 10-15% darker than primary
   - primaryLight: Primary at 5-10% opacity for backgrounds

4. **ACCENT (COMPLEMENTARY):**
   - 30-60° color wheel shift from primary
   - OR use secondary industry color (e.g., gold with navy)
   - Must contrast well with primary

5. **CONTRAST RATIOS (WCAG AA):**
   - textPrimary on background: Minimum 7:1 (AAA)
   - textSecondary on background: Minimum 4.5:1 (AA)
   - primary on background: Minimum 3:1 (for large text/UI)

6. **SHADOWS (SUBTLE, NOT HEAVY):**
   - Use low opacity (5-10% black)
   - Soft blur (8-24px)
   - Not too dark or dramatic

═══════════════════════════════════════════════════════════
EXAMPLES BY INDUSTRY
═══════════════════════════════════════════════════════════

**REAL ESTATE (Navy + Gold):**
{
  "colors": {
    "background": "#ffffff",
    "surface": "#fafafa",
    "muted": "#f5f5f4",
    "textPrimary": "#0f172a",
    "textSecondary": "#475569",
    "textTertiary": "#94a3b8",
    "onBackground": "#0f172a",
    "border": "#e5e7eb",
    "borderHover": "#d1d5db",
    "primary": "#0f172a",
    "primaryHover": "#1e293b",
    "primaryLight": "#f1f5f9",
    "onPrimary": "#ffffff",
    "accent": "#d4af37",
    "accentHover": "#b8922a",
    "onAccent": "#0f172a"
  }
}

**SAAS (Blue + Purple):**
{
  "colors": {
    "background": "#ffffff",
    "surface": "#f8fafc",
    "muted": "#f1f5f9",
    "textPrimary": "#0f172a",
    "textSecondary": "#475569",
    "textTertiary": "#94a3b8",
    "onBackground": "#0f172a",
    "border": "#e2e8f0",
    "borderHover": "#cbd5e1",
    "primary": "#2563eb",
    "primaryHover": "#1d4ed8",
    "primaryLight": "#dbeafe",
    "onPrimary": "#ffffff",
    "accent": "#7c3aed",
    "accentHover": "#6d28d9",
    "onAccent": "#ffffff"
  }
}

**RESTAURANT (Burgundy + Orange):**
{
  "colors": {
    "background": "#fffbf5",
    "surface": "#fef5e7",
    "muted": "#fef3c7",
    "textPrimary": "#1c1917",
    "textSecondary": "#57534e",
    "textTertiary": "#78716c",
    "onBackground": "#1c1917",
    "border": "#e7e5e4",
    "borderHover": "#d6d3d1",
    "primary": "#991b1b",
    "primaryHover": "#7f1d1d",
    "primaryLight": "#fee2e2",
    "onPrimary": "#ffffff",
    "accent": "#ea580c",
    "accentHover": "#c2410c",
    "onAccent": "#ffffff"
  }
}

═══════════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════

Before returning, verify:

✅ Theme is LIGHT (white/off-white backgrounds) unless user requested dark
✅ Primary color matches identified industry
✅ Accent color complements primary
✅ Text colors have 4.5:1+ contrast on backgrounds
✅ Borders are subtle (light grays, not harsh)
✅ Shadows are soft (5-10% opacity)
✅ All numeric values are numbers (not strings)
✅ Spacing follows 4px/8px grid
✅ Font family is modern and web-safe
✅ Brand colors used if provided

═══════════════════════════════════════════════════════════
GENERATE DESIGN SYSTEM NOW
═══════════════════════════════════════════════════════════

Analyze user prompt: "${userPrompt || ''}"

1. Identify industry
2. Determine theme (default: light)
3. Select appropriate colors
4. Generate complete design tokens

Return ONLY the JSON object. No markdown. No explanations.
`.trim();
}
