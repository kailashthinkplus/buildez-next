// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/runAIV7.ts

import type { BlueprintNode } from "@/modules/builder/types";
import type { AIV7BrandContext, SemanticPlan } from "./types";
import { runTextAI } from "./lib/runTextAI";
import { safeParseJSON } from "./lib/safeParseJSON";

// Prompts
import { semanticPlanPrompt } from "./prompt/semanticPlan";
import { contentPrompt } from "./prompt/content";
import { designPrompt } from "./prompt/design";
import { imagePrompt } from "./prompt/images";

// Engine functions
import { compileSemanticPlan, validateSemanticPlan } from "./engine/intentCompiler";
import { materializeBlocks } from "./engine/blockMaterializer";
import { applyContent } from "./engine/contentApplier";
import { applyImages } from "./engine/imageApplier";
import { normalizeBlueprint } from "./engine/blueprintNormalizer";
import { sanitizeBlueprint, validateBlueprint, countNodeTypes } from "./engine/blueprintSanitizer";
import { injectHeaderFooter } from "./engine/chromeInjector";

// ✅ Design style selector
import { selectDesignStyle, DESIGN_STYLES } from "./designStyles";

/* ============================================================
   HELPER: MARK NODES AS AI-GENERATED
============================================================ */

function markAsAIGenerated(node: BlueprintNode): BlueprintNode {
  return {
    ...node,
    props: {
      ...node.props,
      __source: "ai",
    },
    children: node.children?.map(markAsAIGenerated),
  };
}

/* ============================================================
   HELPER: COLLECT CONTENT IDS
============================================================ */

function collectContentIds(blueprint: BlueprintNode): string[] {
  const ids: string[] = [];

  function walk(node: BlueprintNode): void {
    if (node.type === "section" && node.props?.role !== "header" && node.props?.role !== "footer") {
      const sectionId = node.props?.sectionName || node.props?.intent || node.id;
      ids.push(sectionId);
    }

    node.children?.forEach(walk);
  }

  walk(blueprint);
  return ids;
}

/* ============================================================
   HELPER: COLLECT SECTION METADATA (COLUMN COUNTS)
============================================================ */

function collectSectionMetadata(blueprint: BlueprintNode): Record<string, { 
  columnCount: number;
  intent: string;
  layout: string;
}> {
  const metadata: Record<string, { columnCount: number; intent: string; layout: string }> = {};

  function walk(node: BlueprintNode): void {
    if (node.type === "section" && node.props?.role !== "header" && node.props?.role !== "footer") {
      const sectionId = node.props?.sectionName || node.props?.intent || node.id;
      const intent = node.props?.intent || "";
      const layout = node.props?.layout || "";
      
      const container = node.children?.find((c) => c.type === "container");
      const columns = container?.children?.filter((c) => c.type === "column") || [];
      
      metadata[sectionId] = { 
        columnCount: columns.length,
        intent,
        layout
      };
    }

    node.children?.forEach(walk);
  }

  walk(blueprint);
  return metadata;
}

/* ============================================================
   HELPER: COLLECT IMAGE SECTION NAMES
============================================================ */

function collectImageSectionNames(blueprint: BlueprintNode): string[] {
  const names: string[] = [];

  function walk(node: BlueprintNode): void {
    if (node.type === "section" && node.props?.role !== "header" && node.props?.role !== "footer") {
      const sectionName = node.props?.sectionName || node.props?.intent || node.id;
      names.push(sectionName);
    }

    node.children?.forEach(walk);
  }

  walk(blueprint);
  return names;
}

/* ============================================================
   HELPER: APPLY DESIGN TOKENS & NODE STYLES
============================================================ */

function applyDesignSystem(
  blueprint: BlueprintNode,
  designData: any
): BlueprintNode {
  // Apply design tokens to page
  if (designData.designTokens) {
    blueprint.props = blueprint.props || {};
    blueprint.props.designTokens = {
      ...blueprint.props.designTokens,
      ...designData.designTokens,
    };
  }

  // Apply node styles (AI-generated styling)
  if (designData.nodeStyles) {
    function applyNodeStyles(node: BlueprintNode): BlueprintNode {
      const nodeTypeStyles = designData.nodeStyles[node.type];

      if (nodeTypeStyles) {
        node.props = node.props || {};
        node.props.__aiGeneratedStyles = {
          ...nodeTypeStyles,
          ...node.props.__aiGeneratedStyles,
        };

        // Merge into style for renderer
        node.props.style = {
          ...nodeTypeStyles,
          ...node.props.style,
        };
      }

      if (node.children) {
        node.children = node.children.map(applyNodeStyles);
      }

      return node;
    }

    blueprint = applyNodeStyles(blueprint);
  }

  return blueprint;
}

/* ============================================================
   MAIN: RUN AI V7 (LOVABLE-QUALITY GENERATION)
============================================================ */

export async function runAIV7({
  userPrompt,
  brandContext,
  generateImage,
  siteId,
}: {
  userPrompt: string;
  brandContext?: AIV7BrandContext;
  generateImage: (prompt: string, siteId?: string) => Promise<string>;
  siteId?: string;
}): Promise<BlueprintNode> {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 AI V7 WEBSITE GENERATION STARTED (LOVABLE-QUALITY)");
  console.log("=".repeat(70));
  console.log("User Prompt:", userPrompt);
  console.log("Brand Context:", {
    hasLogo: !!brandContext?.logoUrl,
    hasColors: !!brandContext?.designTokens?.colors,
  });
  console.log("Site ID:", siteId || "none");
  console.log("=".repeat(70) + "\n");

  try {
    /* ----------------------------------------------------------
       0️⃣ SELECT DESIGN STYLE (INDUSTRY-SPECIFIC)
    ---------------------------------------------------------- */

    console.log("[AI-V7] 0️⃣ Analyzing prompt and selecting design style...");

    const selectedStyleName = selectDesignStyle(userPrompt);
    const selectedStyle = DESIGN_STYLES[selectedStyleName];

    console.log("[AI-V7] Design style selected:", {
      style: selectedStyleName,
      description: selectedStyle.description,
      headingFont: selectedStyle.typography.headingFont,
      bodyFont: selectedStyle.typography.bodyFont,
      scale: selectedStyle.typography.scale,
      density: selectedStyle.spacing.density,
      shadows: selectedStyle.effects.shadows,
      cardStyle: selectedStyle.effects.cardStyle,
      heroBackground: selectedStyle.colorUsage.hero.background,
    });

    /* ----------------------------------------------------------
       1️⃣ SEMANTIC PLAN (STRUCTURE)
    ---------------------------------------------------------- */

    console.log("[AI-V7] 1️⃣ Generating semantic plan...");

    const semanticPlanRaw = await runTextAI(
      semanticPlanPrompt(userPrompt),
      2000,
      true // JSON mode
    );

    console.log("\n" + "=".repeat(60));
    console.log("📋 SEMANTIC PLAN AI RESPONSE:");
    console.log("=".repeat(60));
    console.log(semanticPlanRaw.substring(0, 1000));
    console.log("=".repeat(60) + "\n");

    let semanticPlan: SemanticPlan;
    try {
      const parsed = safeParseJSON<any>(semanticPlanRaw, "SemanticPlan");
      
      console.log("[AI-V7] Parsed semantic plan structure:", {
        keys: Object.keys(parsed),
        hasSections: !!parsed.sections,
        sectionsType: Array.isArray(parsed.sections) ? "array" : typeof parsed.sections,
        fullStructure: JSON.stringify(parsed, null, 2).substring(0, 500),
      });

      // Handle different response structures
      if (parsed.semanticPlan && parsed.semanticPlan.sections) {
        semanticPlan = parsed.semanticPlan;
      } else if (parsed.sections) {
        semanticPlan = parsed;
      } else if (Array.isArray(parsed)) {
        semanticPlan = { sections: parsed };
      } else {
        console.error("❌ Unexpected semantic plan structure:", parsed);
        throw new Error(
          `Invalid semantic plan structure. Expected { sections: [...] }, got: ${JSON.stringify(Object.keys(parsed))}`
        );
      }

      // Validate sections array
      if (!Array.isArray(semanticPlan.sections)) {
        throw new Error(
          `semanticPlan.sections must be an array, got: ${typeof semanticPlan.sections}`
        );
      }

      if (semanticPlan.sections.length === 0) {
        throw new Error("semanticPlan.sections is empty - AI must generate at least one section");
      }

      console.log("[AI-V7] Semantic plan validated:", {
        sections: semanticPlan.sections.length,
        intents: semanticPlan.sections.map((s) => s.intent),
        layouts: semanticPlan.sections.map((s) => s.layout),
        backgroundVariants: semanticPlan.sections.map((s) => s.backgroundVariant),
      });
    } catch (err: any) {
      console.error("❌ Failed to parse/validate semantic plan");
      console.error("Error:", err.message);
      console.error("Raw response (first 1000 chars):", semanticPlanRaw.substring(0, 1000));
      throw err;
    }

    /* ----------------------------------------------------------
       2️⃣ COMPILE BLUEPRINT (STRUCTURE)
    ---------------------------------------------------------- */

    console.log("[AI-V7] 2️⃣ Compiling blueprint structure...");

    let blueprint: BlueprintNode = {
      id: "page",
      type: "page",
      props: {
        title: "Generated Website",
        designTokens: brandContext?.designTokens || {},
      },
      children: compileSemanticPlan(semanticPlan),
    };

    console.log("[AI-V7] Blueprint compiled:", {
      sections: blueprint.children?.length || 0,
      nodeTypes: countNodeTypes(blueprint),
    });

    /* ----------------------------------------------------------
       3️⃣ MATERIALIZE BLOCKS (CONTENT STRUCTURE)
    ---------------------------------------------------------- */

    console.log("[AI-V7] 3️⃣ Materializing content blocks...");

    blueprint = materializeBlocks(blueprint);

    console.log("[AI-V7] Blocks materialized:", {
      totalNodes: countNodeTypes(blueprint),
    });

    /* ----------------------------------------------------------
       4️⃣ CONTENT (TEXT & BUTTONS) — ✅ LOVABLE-QUALITY FIX
    ---------------------------------------------------------- */

    console.log("[AI-V7] 4️⃣ Generating realistic, industry-specific content...");

    const contentIds = collectContentIds(blueprint);
    console.log("[AI-V7] Content IDs to generate:", contentIds.length, contentIds);

    // ✅ NEW: Collect column counts and metadata for each section
    const sectionMetadata = collectSectionMetadata(blueprint);
    console.log("[AI-V7] Section metadata (columns per section):");
    Object.entries(sectionMetadata).forEach(([id, meta]) => {
      console.log(`  - ${id}: ${meta.columnCount} columns (${meta.intent}/${meta.layout})`);
    });

    const contentRaw = await runTextAI(
      contentPrompt(contentIds, userPrompt, sectionMetadata), // ✅ Pass metadata to ensure unique items
      3000,
      true // JSON mode
    );

    console.log("\n" + "=".repeat(60));
    console.log("📝 CONTENT AI RESPONSE:");
    console.log("=".repeat(60));
    console.log(contentRaw.substring(0, 1500));
    console.log("=".repeat(60) + "\n");

    let contentData: Record<string, any>;
    try {
      contentData = safeParseJSON<Record<string, any>>(contentRaw, "Content");
      console.log("[AI-V7] Content data sections:", Object.keys(contentData));
      
      // ✅ Validate content has correct number of items per section
      Object.entries(sectionMetadata).forEach(([sectionId, meta]) => {
        const section = contentData[sectionId];
        if (section?.features) {
          console.log(`[AI-V7] ${sectionId}: Generated ${section.features.length} features (expected ${meta.columnCount})`);
          if (section.features.length < meta.columnCount) {
            console.warn(`⚠️ ${sectionId}: Only ${section.features.length}/${meta.columnCount} features generated!`);
          }
        }
        if (section?.testimonials) {
          console.log(`[AI-V7] ${sectionId}: Generated ${section.testimonials.length} testimonials (expected ${meta.columnCount})`);
        }
      });
      
      console.log("[AI-V7] Content sample:", JSON.stringify(contentData, null, 2).substring(0, 500));
    } catch (err) {
      console.error("❌ Failed to parse content JSON, using empty content");
      contentData = {};
    }

    blueprint = applyContent(blueprint, contentData);

    console.log("[AI-V7] ✅ Content applied");

    /* ----------------------------------------------------------
       5️⃣ IMAGES (PHOTOREALISTIC GENERATION)
    ---------------------------------------------------------- */

    console.log("[AI-V7] 5️⃣ Generating photorealistic image prompts...");

    const imageSectionNames = collectImageSectionNames(blueprint);
    console.log("[AI-V7] Image sections:", imageSectionNames.length, imageSectionNames);

    const imagePromptsRaw = await runTextAI(
      imagePrompt(imageSectionNames, userPrompt),
      2000,
      false // Plain text mode
    );

    console.log("\n" + "=".repeat(60));
    console.log("🖼️ IMAGE PROMPTS AI RESPONSE:");
    console.log("=".repeat(60));
    console.log(imagePromptsRaw.substring(0, 1000));
    console.log("=".repeat(60) + "\n");

    const imageLines = imagePromptsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log("[AI-V7] Image prompts parsed:", imageLines.length);

    // Apply images with photorealistic enhancement
    blueprint = await applyImages({
      blueprint,
      imageLines,
      generateImage,
      siteId,
    });

    console.log("[AI-V7] ✅ Images applied");

    /* ----------------------------------------------------------
       6️⃣ DESIGN SYSTEM (INDUSTRY-SPECIFIC COLORS)
    ---------------------------------------------------------- */

    console.log("[AI-V7] 6️⃣ Generating industry-specific design system...");

    const designRaw = await runTextAI(
      designPrompt(brandContext, userPrompt),
      4000,
      true // JSON mode
    );

    console.log("\n" + "=".repeat(60));
    console.log("🎨 DESIGN SYSTEM AI RESPONSE:");
    console.log("=".repeat(60));
    console.log(designRaw.substring(0, 1500));
    console.log("=".repeat(60) + "\n");

    let designData: any;
    try {
      designData = safeParseJSON<any>(designRaw, "Design");
      console.log("[AI-V7] Design system received:", {
        hasDesignTokens: !!designData.designTokens,
        hasColors: !!designData.designTokens?.colors,
        primaryColor: designData.designTokens?.colors?.primary,
        accentColor: designData.designTokens?.colors?.accent,
        backgroundColor: designData.designTokens?.colors?.background,
        surfaceColor: designData.designTokens?.colors?.surface,
        hasTypography: !!designData.designTokens?.typography,
        fontFamily: designData.designTokens?.typography?.fontFamily,
        hasSpacing: !!designData.designTokens?.spacing,
        hasShadows: !!designData.designTokens?.shadows,
        hasRadius: !!designData.designTokens?.radius,
        hasNodeStyles: !!designData.nodeStyles,
      });
      
      // Log color palette for debugging
      if (designData.designTokens?.colors) {
        console.log("[AI-V7] Color Palette:");
        console.log("  Primary:", designData.designTokens.colors.primary);
        console.log("  Accent:", designData.designTokens.colors.accent);
        console.log("  Background:", designData.designTokens.colors.background);
        console.log("  Surface:", designData.designTokens.colors.surface);
        console.log("  Text Primary:", designData.designTokens.colors.textPrimary);
      }
    } catch (err) {
      console.error("❌ Failed to parse design JSON");
      designData = { designTokens: {}, nodeStyles: {} };
    }

    blueprint = applyDesignSystem(blueprint, designData);

    console.log("[AI-V7] ✅ Design system applied");

    /* ----------------------------------------------------------
       7️⃣ INJECT HEADER & FOOTER
    ---------------------------------------------------------- */

    console.log("[AI-V7] 7️⃣ Injecting header & footer...");

    blueprint = injectHeaderFooter(blueprint, brandContext);

    console.log("[AI-V7] ✅ Header & footer injected");

    /* ----------------------------------------------------------
       8️⃣ NORMALIZE (FILL DEFAULTS)
    ---------------------------------------------------------- */

    console.log("[AI-V7] 8️⃣ Normalizing blueprint...");

    const beforeNormalize = countNodeTypes(blueprint);
    blueprint = normalizeBlueprint(blueprint);
    const afterNormalize = countNodeTypes(blueprint);

    console.log("[AI-V7] Blueprint normalized:", {
      before: beforeNormalize,
      after: afterNormalize,
    });

    /* ----------------------------------------------------------
       9️⃣ MARK AS AI-GENERATED
    ---------------------------------------------------------- */

    console.log("[AI-V7] 9️⃣ Marking nodes as AI-generated...");

    blueprint = markAsAIGenerated(blueprint);

    console.log("[AI-V7] ✅ Nodes marked as AI-generated");

    /* ----------------------------------------------------------
       🔟 SANITIZE & VALIDATE
    ---------------------------------------------------------- */

    console.log("[AI-V7] 🔟 Sanitizing & validating blueprint...");

    const beforeSanitize = countNodeTypes(blueprint);
    blueprint = sanitizeBlueprint(blueprint);
    const afterSanitize = countNodeTypes(blueprint);

    console.log("[AI-V7] Blueprint sanitized:", {
      before: beforeSanitize,
      after: afterSanitize,
      nodesRemoved: Object.entries(beforeSanitize).reduce((acc, [type, count]) => {
        const after = afterSanitize[type] || 0;
        if (after < count) {
          acc[type] = count - after;
        }
        return acc;
      }, {} as Record<string, number>),
    });

    // Final validation
    const blueprintValidation = validateBlueprint(blueprint);
    if (!blueprintValidation.valid) {
      console.warn("[AI-V7] ⚠️ Blueprint validation warnings:", blueprintValidation.errors);
    } else {
      console.log("[AI-V7] ✅ Blueprint validation passed");
    }

    /* ----------------------------------------------------------
       ✅ GENERATION COMPLETE
    ---------------------------------------------------------- */

    console.log("\n" + "=".repeat(70));
    console.log("✅ AI V7 WEBSITE GENERATION COMPLETED SUCCESSFULLY");
    console.log("=".repeat(70));
    console.log("Final Statistics:", {
      designStyle: selectedStyleName,
      styleDescription: selectedStyle.description,
      totalSections: blueprint.children?.length || 0,
      nodeTypes: countNodeTypes(blueprint),
      hasDesignTokens: !!blueprint.props?.designTokens,
      hasColors: !!blueprint.props?.designTokens?.colors,
      primaryColor: blueprint.props?.designTokens?.colors?.primary,
      accentColor: blueprint.props?.designTokens?.colors?.accent,
      backgroundColor: blueprint.props?.designTokens?.colors?.background,
      fontFamily: blueprint.props?.designTokens?.typography?.fontFamily,
      headingFont: selectedStyle.typography.headingFont,
      shadows: selectedStyle.effects.shadows,
    });
    console.log("=".repeat(70) + "\n");

    return blueprint;
  } catch (error) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ AI V7 WEBSITE GENERATION FAILED");
    console.error("=".repeat(70));
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    console.error("=".repeat(70) + "\n");

    throw error;
  }
}

/* ============================================================
   EXPORT TYPES
============================================================ */

export type { AIV7BrandContext, SemanticPlan } from "./types";
