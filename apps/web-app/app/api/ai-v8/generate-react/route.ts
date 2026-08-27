import { NextRequest, NextResponse } from "next/server";
import { Prisma, prisma } from "@buildez/db";
import {
  callOpenAIChatCompletion,
  extractAssistantText,
} from "@/app/api/_lib/openai";
import {
  buildDesignInstructionBlock,
  getRequiredSectionIds,
  type ResolvedDesignPlan,
} from "@/modules/builder/ai-v8/lib/designPlan";
import {
  buildExperienceInstructionBlock,
  type ExperienceStrategy,
} from "@/modules/builder/ai-v8/lib/experienceIntelligence";
import { runWebsiteGenerationOrchestrator } from "@/modules/builder/ai-v8/orchestrator/runWebsiteGenerationOrchestrator";
import { parseReactToBlueprint } from "@/modules/builder/ai-v8/lib/reactToBlueprint";
import type { AIV8BrandContext } from "@/modules/builder/ai-v8/types";
import { getUser } from "@/lib/auth/getUser";

/* ============================================================
   AI CONFIGURATION
============================================================ */

const AI_CONFIG = {
  model: process.env.OPENAI_WEBSITE_MODEL || "gpt-4o",
  maxCompletionTokens: 16384,
  temperature: 0.45,
  repairTemperature: 0.2,
};

/* ============================================================
   BRAND CONTEXT
============================================================ */

async function getCompleteBrandContext(siteId: string, tenantId: string) {
  try {
    const site = await prisma.site.findFirst({
      where: { id: siteId, tenantId, deletedAt: null },
      select: {
        logoUrl: true,
        designTokens: true,
        name: true,
      },
    });

    if (!site) return null;

    const tokenRecord =
      site.designTokens &&
      typeof site.designTokens === "object" &&
      !Array.isArray(site.designTokens)
        ? (site.designTokens as Record<string, unknown>)
        : null;

    const siteColorsRaw =
      tokenRecord &&
      tokenRecord.colors &&
      typeof tokenRecord.colors === "object" &&
      !Array.isArray(tokenRecord.colors)
        ? tokenRecord.colors
        : {};

    const context: AIV8BrandContext & { siteName: string | null } = {
      siteName: site.name,
      logoUrl: site.logoUrl || undefined,
      designTokens: {
        colors: siteColorsRaw as Record<string, string>,
      },
    };
    return context;
  } catch {
    return null;
  }
}

async function getPageContext(pageId: string | undefined, siteId: string) {
  if (!pageId) return null;

  try {
    const page = await prisma.page.findFirst({
      where: { id: pageId, siteId, deletedAt: null },
      select: {
        title: true,
        slug: true,
      },
    });

    if (!page) return null;

    return {
      title: page.title,
      slug: page.slug,
    };
  } catch {
    return null;
  }
}

function extractContextValue(prompt: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = prompt.match(new RegExp(`^${escaped}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() || "";
}

function normalizeResearchUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function researchPublicContext(userPrompt: string) {
  if (!/Reverse internet research:\s*enabled/i.test(userPrompt)) {
    return "";
  }

  const websiteUrl = normalizeResearchUrl(
    extractContextValue(userPrompt, "Existing website/domain")
  );
  const companyName = extractContextValue(userPrompt, "Company name");
  const industry = extractContextValue(userPrompt, "Industry");
  const researchNotes: string[] = [];

  if (websiteUrl) {
    try {
      const res = await fetch(websiteUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const html = await res.text();
        const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
        const description =
          html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
          html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1];
        const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];

        researchNotes.push(`Website: ${websiteUrl}`);
        if (title) researchNotes.push(`Website title: ${stripHtml(title)}`);
        if (description) researchNotes.push(`Website description: ${stripHtml(description)}`);
        if (h1) researchNotes.push(`Primary headline: ${stripHtml(h1)}`);
      }
    } catch {
      researchNotes.push(`Website research attempted for ${websiteUrl}, but the site could not be fetched.`);
    }
  }

  const braveKey = process.env.BRAVE_SEARCH_API_KEY;
  if (braveKey && (companyName || industry)) {
    try {
      const query = encodeURIComponent([companyName, industry].filter(Boolean).join(" "));
      const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${query}&count=5`, {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": braveKey,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = (await res.json()) as {
          web?: { results?: Array<{ title?: string; description?: string; url?: string }> };
        };
        const results = json.web?.results || [];
        results.slice(0, 3).forEach((item, index) => {
          researchNotes.push(
            `Search result ${index + 1}: ${[item.title, item.description, item.url].filter(Boolean).join(" | ")}`
          );
        });
      }
    } catch {
      researchNotes.push("Search provider research attempted but did not return usable results.");
    }
  }

  if (!researchNotes.length) {
    return "";
  }

  return [
    "PUBLIC RESEARCH CONTEXT:",
    ...researchNotes.map((note) => `- ${note}`),
    "",
  ].join("\n");
}

/* ============================================================
   PROMPT BUILDER
============================================================ */

function buildEnhancedPrompt(
  userPrompt: string,
  plan: ResolvedDesignPlan,
  brandContext: (AIV8BrandContext & { siteName?: string | null }) | null,
  strategy: ExperienceStrategy,
  pageContext?: { title: string; slug: string } | null
) {
  const designPlanBlock = buildDesignInstructionBlock(plan, brandContext);
  const experienceBlock = buildExperienceInstructionBlock(strategy);
  const colors = brandContext?.designTokens?.colors;
  const sectionIds = getRequiredSectionIds(plan);
  const siteName = brandContext?.siteName?.trim() || "the business";

  return `
USER PROMPT:
${userPrompt}

PAGE CONTEXT:
${pageContext ? `Title: ${pageContext.title}\nSlug: /${pageContext.slug}` : "No page context provided"}

SITE NAME:
${siteName}

PREDEFINED DESIGN PLAN:
${designPlanBlock}

${experienceBlock}

MANDATORY OUTPUT CONTRACT:
1. Start with "use client";
2. Export default function Website()
3. Tailwind-only styling (no external CSS files, no style tags)
4. Include ALL required section ids exactly once: ${sectionIds.join(", ")}
5. Include semantic structure: nav, main, section, footer
6. Responsive classes for mobile + desktop
7. Include clear CTA buttons in hero and final CTA section
8. Keep copy aligned to the selected use case
9. Never use placeholder URLs, TODO text, or bg-[url(...)]
10. Return code only (no markdown or explanation)
11. Use meaningful links (do not use href="#")
12. Avoid generic sections. Use visual hierarchy with mixed layout patterns (split hero, card grids, asymmetric rows, stats band, CTA contrast block)
13. Avoid boilerplate/template wording. Use specific company/domain language from the prompt.
14. Use no more than one decorative gradient. Prioritize real content hierarchy, spacing, typography, imagery, and proof.
15. Include real, plausible copy details: numbers, labels, process steps, service names, menu/product/program names, or package details that fit the prompt.
16. The page must feel like a senior designer and conversion strategist worked together, not a default AI landing page.
17. If the prompt/site/page context is generic, invent a specific but plausible business concept and carry it consistently through all copy, CTAs, proof, services, and imagery.
18. If PAGE CONTEXT is About, Contact, Services, Work, Pricing, or similar, generate that page type specifically instead of a generic homepage.
19. Never output giant navigation-like CTA bars inside the page body.
20. Banned generic copy: "Empowering Your Business", "Modern Solutions", "Cutting-edge services", "Elevate your business", "Innovative solutions", "Transform your business", "Seamless experience".

IMAGE RULES:
- Use data-ai-bg for hero/background sections and data-ai-image for content images
- Every image prompt must be descriptive (lighting, mood, composition, quality)
- Avoid generic prompts like "nice image" or "placeholder"
- Ensure every <img> has either data-ai-image or a real production https URL in src; never use example.com, placeholder.com, PLACEHOLDER, dummy, invalid, or test URLs
- Include at least 1 hero background image and 3 content images
- Do not create a second site nav/header inside the page body; the builder app already provides site navigation.

BRAND COLOR GUIDANCE:
${colors?.primary ? `- Primary: ${colors.primary}` : "- Primary: pick one coherent brand primary color"}
${colors?.accent ? `- Accent: ${colors.accent}` : "- Accent: pick one coherent accent color"}
${colors?.background ? `- Background: ${colors.background}` : "- Background: use neutral high-readability background"}
${colors?.textPrimary ? `- Text Primary: ${colors.textPrimary}` : "- Text Primary: ensure readable high contrast"}
`;
}

/* ============================================================
   SYSTEM PROMPT
============================================================ */

function generateSystemPrompt(plan: ResolvedDesignPlan) {
  return `
You are BuildEZ AI React generation engine.
Your job is to generate deterministic, production-ready TSX from a predefined design plan.

PLAN LOCK (do not deviate):
- Category: ${plan.recipe.key}
- Use case: ${plan.useCase}
- Style direction: ${plan.recipe.styleDirection.join(", ")}

HARD RULES:
- Output only TSX code.
- Must compile as a single component.
- Must start with "use client";.
- Must export default function Website().
- Do NOT include any import statements.
- Must use Tailwind CSS classes.
- Must include every required section id from the plan.
- Must keep section order aligned with the plan.
- Must include a mobile-friendly nav.
- Must avoid placeholder values and invalid JSX.
- Must not output a generic wireframe-like design.
- Must pass a professional website review for specificity, visual rhythm, conversion clarity, accessibility, and responsive behavior.
`;
}

/* ============================================================
   CODE CLEANER
============================================================ */

function validateAndCleanCode(raw: string) {
  let code = raw.trim();

  const block = code.match(/```(?:tsx|jsx|typescript|javascript)?\s*([\s\S]*?)\s*```/i);
  if (block) code = block[1].trim();
  code = code.replace(/```[a-zA-Z]*\s*/g, "").trim();
  code = code.replace(/^\s*import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "");
  code = code.replace(/^\s*import\s+["'][^"']+["'];?\s*$/gm, "").trim();

  const idx = code.search(/['"]use client['"]/);
  if (idx > 0) code = code.slice(idx);

  if (!code.startsWith('"use client"') && !code.startsWith("'use client'")) {
    code = `"use client";\n\n${code}`;
  }

  if (!code.includes("export default function")) {
    throw new Error("Missing default export");
  }

  return code;
}

function extractImagePrompts(code: string): Array<{
  type: "bg" | "img";
  prompt: string;
}> {
  const items: Array<{ type: "bg" | "img"; prompt: string }> = [];

  const bgRegex = /data-ai-bg=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = bgRegex.exec(code)) !== null) {
    if (m[1]?.trim()) items.push({ type: "bg", prompt: m[1].trim() });
  }

  const imgRegex = /data-ai-image=["']([^"']+)["']/gi;
  while ((m = imgRegex.exec(code)) !== null) {
    if (m[1]?.trim()) items.push({ type: "img", prompt: m[1].trim() });
  }

  return items;
}

async function hydrateImagePromptsInCode(
  code: string,
  contextPrompt: string
): Promise<string> {
  const prompts = extractImagePrompts(code);
  let nextCode = code;

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const item of prompts) {
    const imageUrl = await generateImageFromFreepik(item.prompt);

    if (item.type === "bg") {
      const bgPattern = new RegExp(
        `data-ai-bg=["']${escapeRegExp(item.prompt)}["']`,
        "i"
      );
      nextCode = nextCode.replace(
        bgPattern,
        `style={{ backgroundImage: "url('${imageUrl}')" }}`
      );
    } else {
      const imgPattern = new RegExp(
        `(<img[^>]*?)data-ai-image=["']${escapeRegExp(item.prompt)}["']([^>]*>)`,
        "i"
      );
      nextCode = nextCode.replace(
        imgPattern,
        `$1src="${imageUrl}" $2`
      );
    }
  }

  return sanitizeResidualPlaceholders(nextCode, contextPrompt);
}

async function sanitizeResidualPlaceholders(
  code: string,
  contextPrompt: string
): Promise<string> {
  let nextCode = code;
  const fallbackPrompt = `${contextPrompt}, professional website photography, high detail, natural lighting`;
  let fallbackUrl: string | null = null;

  async function getFallbackUrl() {
    if (!fallbackUrl) {
      fallbackUrl = await generateImageFromFreepik(fallbackPrompt);
    }
    return fallbackUrl;
  }

  const placeholderSrcPatterns = [
    /src\s*=\s*["'](?:PLACEHOLDER|placeholder|\/placeholder[^"']*|https?:\/\/(?:[^"']*\.)?(?:placeholder|placehold|example|invalid)[^"']*)["']/gi,
    /src\s*=\s*\{\s*["'](?:PLACEHOLDER|placeholder|\/placeholder[^"']*|https?:\/\/(?:[^"']*\.)?(?:placeholder|placehold|example|invalid)[^"']*)["']\s*\}/gi,
    /src\s*=\s*\{\s*`[^`]*(?:PLACEHOLDER|placeholder|placehold|example|invalid)[^`]*`\s*\}/gi,
    /src\s*=\s*\{\s*PLACEHOLDER\s*\}/gi,
  ];

  for (const pattern of placeholderSrcPatterns) {
    const matches = nextCode.match(pattern) || [];
    for (let i = 0; i < matches.length; i++) {
      const url = await getFallbackUrl();
      nextCode = nextCode.replace(pattern, `src="${url}"`);
    }
  }

  const placeholderBackgroundPatterns = [
    /url\((?:["']?)(?:PLACEHOLDER|placeholder|\/placeholder[^"')]*|https?:\/\/(?:[^"')]*\.)?(?:placeholder|placehold)[^"')]*)(?:["']?)\)/gi,
    /backgroundImage\s*:\s*["'`][^"'`]*(?:PLACEHOLDER|placeholder|placehold)[^"'`]*["'`]/gi,
  ];

  for (const pattern of placeholderBackgroundPatterns) {
    const matches = nextCode.match(pattern) || [];
    for (let i = 0; i < matches.length; i++) {
      const url = await getFallbackUrl();
      const replacement = matches[i].startsWith("backgroundImage")
        ? `backgroundImage: "url('${url}')"`
        : `url('${url}')`;
      nextCode = nextCode.replace(pattern, replacement);
    }
  }

  const barePlaceholderUrls =
    nextCode.match(
      /https?:\/\/[^\s"'`)}]*(?:placeholder|placehold|example|invalid)[^\s"'`)}]*/gi
    ) || [];

  for (let i = 0; i < barePlaceholderUrls.length; i++) {
    const url = await getFallbackUrl();
    nextCode = nextCode.replace(
      /https?:\/\/[^\s"'`)}]*(?:placeholder|placehold|example|invalid)[^\s"'`)}]*/i,
      url
    );
  }

  nextCode = nextCode
    .replace(/\bplaceholder image\b/gi, "featured website visual")
    .replace(/\bplaceholder text\b/gi, "polished website copy")
    .replace(/\bplaceholder copy\b/gi, "polished website copy")
    .replace(/\bPLACEHOLDER\b/gi, "featured website visual");

  return nextCode;
}

async function generateImageFromFreepik(prompt: string): Promise<string> {
  const apiKey = process.env.FREEPIK_API_KEY;
  const fallback = getFallbackImageUrl(prompt);

  if (!apiKey) return fallback;

  try {
    const enhancedPrompt = [
      "Photorealistic commercial photography",
      "realistic environment, natural color grading, sharp focus, premium website visual",
      prompt,
      "no text, no watermark, avoid vector art, avoid clipart, avoid heavy yellow or orange color cast",
    ].join(", ");

    const res = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-freepik-api-key": apiKey,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt:
          "illustration, vector art, flat vector, drawing, painting, sketch, cartoon, anime, 3d render, digital art, abstract, artistic, stylized, unrealistic, blurry, low quality, watermark, text, logo, yellow tint, orange tint, mustard background, oversaturated yellow",
        guidance_scale: 6.5,
        num_images: 1,
        image: { size: "landscape_16_9" },
        styling: { style: "photo" },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return fallback;
    }

    const json = (await res.json()) as {
      data?: Array<{ base64?: string; url?: string; image?: { url?: string } }>;
      task_id?: string;
      status?: string;
      image?: string;
      image_url?: string;
    };

    const directUrl =
      json.data?.[0]?.image?.url ||
      json.data?.[0]?.url ||
      json.image_url ||
      null;
    if (directUrl) return directUrl;

    // Some Freepik flows are async and return task_id first
    const taskId = json.task_id || null;
    if (taskId) {
      const polled = await pollFreepikTask(taskId, apiKey);
      if (polled) return polled;
    }

    const base64 = json.data?.[0]?.base64 || json.image || "";
    if (base64) {
      const clean = base64.replace(/^data:image\/\w+;base64,/, "");
      return `data:image/jpeg;base64,${clean}`;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

function getFallbackImageUrl(prompt: string) {
  const normalized = prompt.toLowerCase();
  const pools: Array<{ test: RegExp; urls: string[] }> = [
    {
      test: /clinic|doctor|medical|health|hospital|care|patient|dental/,
      urls: [
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1600&h=1000&fit=crop",
      ],
    },
    {
      test: /restaurant|food|chef|menu|dining|cafe|kitchen/,
      urls: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=1000&fit=crop",
      ],
    },
    {
      test: /software|saas|dashboard|platform|app|analytics|workflow/,
      urls: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&h=1000&fit=crop",
      ],
    },
    {
      test: /property|real estate|building|apartment|villa|architecture|home/,
      urls: [
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=1000&fit=crop",
      ],
    },
    {
      test: /education|school|college|student|campus|classroom|course/,
      urls: [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&h=1000&fit=crop",
      ],
    },
  ];

  const urls =
    pools.find((pool) => pool.test.test(normalized))?.urls ??
    [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1600&h=1000&fit=crop",
    ];

  const hash = Array.from(normalized).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return urls[hash % urls.length];
}

async function pollFreepikTask(
  taskId: string,
  apiKey: string
): Promise<string | null> {
  const endpoint = `https://api.freepik.com/v1/ai/text-to-image/${taskId}`;

  for (let attempt = 0; attempt < 8; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-freepik-api-key": apiKey,
        },
        cache: "no-store",
      });

      if (!res.ok) continue;

      const json = (await res.json()) as {
        status?: string;
        data?: Array<{ base64?: string; url?: string; image?: { url?: string } }>;
        image_url?: string;
        image?: string;
      };

      const done =
        (json.status || "").toUpperCase() === "COMPLETED" ||
        !!json.data?.[0]?.url ||
        !!json.data?.[0]?.image?.url ||
        !!json.data?.[0]?.base64 ||
        !!json.image_url ||
        !!json.image;

      if (!done) continue;

      const directUrl =
        json.data?.[0]?.image?.url ||
        json.data?.[0]?.url ||
        json.image_url ||
        null;
      if (directUrl) return directUrl;

      const base64 = json.data?.[0]?.base64 || json.image || "";
      if (base64) {
        const clean = base64.replace(/^data:image\/\w+;base64,/, "");
        return `data:image/jpeg;base64,${clean}`;
      }
    } catch {
      // Keep retrying
    }
  }

  return null;
}

async function repairCodeAgainstPlan({
  currentCode,
  requiredSectionIds,
  missingSectionIds,
  userPrompt,
  plan,
  strategy,
  qualityWarnings,
}: {
  currentCode: string;
  requiredSectionIds: string[];
  missingSectionIds: string[];
  userPrompt: string;
  plan: ResolvedDesignPlan;
  strategy: ExperienceStrategy;
  qualityWarnings: string[];
}) {
  const repairPrompt = `
You must repair this TSX so it strictly follows the BuildEZ design plan.

Original user prompt:
${userPrompt}

Required section ids:
${requiredSectionIds.join(", ")}

Professional experience strategy:
${buildExperienceInstructionBlock(strategy)}

Missing section ids found by validator:
${missingSectionIds.length ? missingSectionIds.join(", ") : "none"}

Quality warnings found by validator:
${qualityWarnings.length ? qualityWarnings.join("\n") : "none"}

Current code:
\`\`\`tsx
${currentCode}
\`\`\`

Repair requirements:
1. Keep existing structure where possible.
2. Add/fix missing section ids and section blocks.
3. Preserve "use client"; and default export.
4. Remove forbidden patterns such as PLACEHOLDER, TODO, and bg-[url(...)].
5. Raise the page quality by adding specificity, proof, responsive classes, semantic structure, meaningful CTAs, and image coverage.
6. Return full corrected TSX only.
`;

  const completion = await callOpenAIChatCompletion({
    model: AI_CONFIG.model,
    messages: [
      { role: "system", content: generateSystemPrompt(plan) },
      { role: "user", content: repairPrompt },
    ],
    temperature: AI_CONFIG.repairTemperature,
    maxCompletionTokens: AI_CONFIG.maxCompletionTokens,
  });

  const raw = extractAssistantText(completion);
  if (!raw) {
    throw new Error("Empty AI response during repair step");
  }

  return validateAndCleanCode(raw);
}

/* ============================================================
   SAVE
============================================================ */

async function saveReactCode({
  pageId,
  siteId,
  tenantId,
  code,
  industry,
  generationMetadata,
}: {
  pageId: string;
  siteId: string;
  tenantId: string;
  code: string;
  industry: string;
  generationMetadata: Record<string, unknown>;
}) {
  const page = await prisma.page.findFirst({
    where: { id: pageId, siteId, site: { tenantId }, deletedAt: null },
    include: {
      site: {
        select: {
          id: true,
          tenantId: true,
          designTokens: true,
        },
      },
    },
  });

  if (!page?.site) {
    throw new Error("Page not found while saving AI output");
  }

  const parsedNodes = parseReactToBlueprint(code, pageId).map((node) => {
    if (node.type === "header") {
      return {
        ...node,
        type: "section",
        props: { ...(node.props || {}), role: "header" },
      };
    }
    if (node.type === "footer") {
      return {
        ...node,
        type: "section",
        props: { ...(node.props || {}), role: "footer" },
      };
    }
    return node;
  });

  const blueprintData = {
    page: {
      id: `${pageId}-page`,
      type: "page",
      props: {
        designTokens:
          page.site.designTokens && typeof page.site.designTokens === "object"
            ? page.site.designTokens
            : undefined,
      },
      children: parsedNodes,
    },
  };

  await prisma.$transaction(async (tx) => {
    await tx.page.update({
      where: { id: pageId },
      data: {
        reactCode: code,
        renderMode: "BLUEPRINT",
        metadata: {
          industry,
          generatedAt: new Date().toISOString(),
          aiMode: "react-to-blueprint",
          parsedNodeCount: parsedNodes.length,
          ...generationMetadata,
        },
      },
    });

    await tx.blueprint.upsert({
      where: { pageId },
      update: {
        data: blueprintData as unknown as Prisma.InputJsonValue,
        schemaVersion: 1,
      },
      create: {
        pageId,
        siteId: page.site.id,
        tenantId: page.site.tenantId,
        data: blueprintData as unknown as Prisma.InputJsonValue,
        schemaVersion: 1,
      },
    });
  });
}

/* ============================================================
   API HANDLER
============================================================ */

export async function POST(req: NextRequest) {
  try {
    const auth = await getUser();
    if (!auth?.tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userPrompt, siteId, pageId, brandContext: incomingBrand } =
      await req.json();

    if (!userPrompt || !siteId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const authorizedSite = await prisma.site.findFirst({
      where: { id: siteId, tenantId: auth.tenant.id, deletedAt: null },
      select: { id: true },
    });
    if (!authorizedSite) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const dbBrandContext = await getCompleteBrandContext(siteId, auth.tenant.id);
    const brandContext =
      incomingBrand && typeof incomingBrand === "object"
        ? {
            ...(dbBrandContext || {}),
            ...(incomingBrand as AIV8BrandContext),
            designTokens: {
              ...(dbBrandContext?.designTokens || {}),
              ...((incomingBrand as AIV8BrandContext).designTokens || {}),
            },
          }
        : dbBrandContext;

    const pageContext = await getPageContext(pageId, siteId);
    if (pageId && !pageContext) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    const publicResearch = await researchPublicContext(userPrompt);
    const contextualPrompt = pageContext
      ? `${userPrompt}

Page title: ${pageContext.title}
Page slug: /${pageContext.slug}

${publicResearch}`
      : `${userPrompt}

${publicResearch}`;

    const result = await runWebsiteGenerationOrchestrator(
      {
        userPrompt: contextualPrompt,
        siteId,
        pageId,
        brandContext,
      },
      {
        async generateInitialCode({ workflow }) {
          const intent = workflow.intent!;
          const systemPrompt = generateSystemPrompt(intent.plan);
          const userEnhancedPrompt = buildEnhancedPrompt(
            workflow.userPrompt,
            intent.plan,
            workflow.brandContext,
            intent.strategy,
            pageContext
          );

          const completion = await callOpenAIChatCompletion({
            model: AI_CONFIG.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userEnhancedPrompt },
            ],
            temperature: AI_CONFIG.temperature,
            maxCompletionTokens: AI_CONFIG.maxCompletionTokens,
          });

          const raw = extractAssistantText(completion);
          if (!raw) throw new Error("Empty AI response");

          return validateAndCleanCode(raw);
        },

        async repairCode({ workflow, currentCode }) {
          const intent = workflow.intent!;
          const sectionRecipes = workflow.sectionRecipes!;
          const validation = workflow.validation;
          const qa = workflow.qa;

          return repairCodeAgainstPlan({
            currentCode,
            requiredSectionIds: sectionRecipes.requiredSectionIds,
            missingSectionIds: validation?.missingSectionIds || [],
            userPrompt: workflow.userPrompt,
            plan: intent.plan,
            strategy: intent.strategy,
            qualityWarnings: [
              ...(qa?.warnings || []),
              ...(validation?.forbiddenWarnings || []),
            ],
          });
        },

        async hydrateImages({ code, workflow }) {
          return hydrateImagePromptsInCode(
            code,
            workflow.assets?.contextPrompt ||
              `${workflow.userPrompt}, ${workflow.intent!.plan.recipe.label}, ${workflow.intent!.plan.useCase}`
          );
        },

        async saveOutput({ code, workflow }) {
          if (!workflow.pageId) return;

          const intent = workflow.intent!;

          await saveReactCode({
            pageId: workflow.pageId,
            siteId,
            tenantId: auth.tenant.id,
            code,
            industry: intent.plan.recipe.key,
            generationMetadata: {
              aiModel: AI_CONFIG.model,
              aiStrategy: {
                businessName: intent.strategy.brief.businessName,
                audience: intent.strategy.brief.audience,
                conversionGoal: intent.strategy.brief.conversionGoal,
                visualDirection: intent.strategy.brief.visualDirection,
                competitorGapsToBeat:
                  intent.strategy.brief.competitorGapsToBeat,
              },
              quality: workflow.qa,
              agents: workflow.logs,
            },
          });
        },
      }
    );

    return NextResponse.json({
      success: true,
      code: result.code,
      metadata: result.metadata,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
