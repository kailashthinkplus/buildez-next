// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/imageApplier.ts

import type { BlueprintNode } from "@/modules/builder/types";

/* ============================================================
   IMAGE APPLIER — V7 (AUTHORITATIVE, GUARANTEED)
   - Walks tree in document order
   - Resolves EVERY image node
   - Uploads to R2 via generateImage
   - NEVER leaves src empty
   - NEVER throws
   - ✅ Enhances prompts for photorealistic output
============================================================ */

const FALLBACK_IMAGE = "https://placehold.co/800x450/e2e8f0/94a3b8?text=Image";

export async function applyImages({
  blueprint,
  imageLines,
  generateImage,
  siteId,
}: {
  blueprint: BlueprintNode;
  imageLines: string[];
  generateImage: (prompt: string, siteId?: string) => Promise<string>;
  siteId?: string;
}): Promise<BlueprintNode> {
  let imageCursor = 0;
  const totalImages = countImageNodes(blueprint);

  console.log(`[ImageApplier] Starting image application`);
  console.log(`[ImageApplier] Total image nodes: ${totalImages}`);
  console.log(`[ImageApplier] Image prompts available: ${imageLines.length}`);
  console.log(`[ImageApplier] Site ID: ${siteId || "not provided"}`);

  async function walk(node: BlueprintNode): Promise<BlueprintNode> {
    /* ----------------------------------------------------------
       IMAGE NODE — SRC IS OWNED HERE
    ---------------------------------------------------------- */
    if (node.type === "image") {
      // Skip if already has a valid src (not placeholder, not base64)
      const existingSrc = node.props?.src;
      if (existingSrc && isValidImageUrl(existingSrc)) {
        console.log(`[ImageApplier] Skipping node ${node.id} - already has valid src`);
        return node;
      }

      const currentIndex = imageCursor;
      imageCursor++;

      // Get prompt from imageLines or use fallback
      const raw =
        imageLines[currentIndex] ??
        imageLines[imageLines.length - 1] ??
        "Professional website section image, high quality, modern design";

      // Extract prompt (handles "hero: prompt text" format)
      const colonIdx = raw.indexOf(":");
      const basePrompt = colonIdx !== -1 ? raw.slice(colonIdx + 1).trim() : raw.trim();

      // ✅ NEW: Enhance prompt for photorealistic output
      const enhancedPrompt = enhanceImagePrompt(basePrompt);

      console.log(`[ImageApplier] Processing image ${currentIndex + 1}/${totalImages}`);
      console.log(`[ImageApplier] Node ID: ${node.id}`);
      console.log(`[ImageApplier] Original prompt: ${basePrompt.substring(0, 80)}...`);
      console.log(`[ImageApplier] Enhanced prompt: ${enhancedPrompt.substring(0, 120)}...`);

      let generatedSrc: string = FALLBACK_IMAGE;

      try {
        // ✅ Pass enhanced prompt to generateImage
        const result = await generateImage(enhancedPrompt, siteId);
        if (result) {
          generatedSrc = result;
          console.log(`[ImageApplier] ✅ Generated: ${generatedSrc.substring(0, 60)}...`);
        } else {
          console.warn(`[ImageApplier] ⚠️ generateImage returned null, using fallback`);
        }
      } catch (err) {
        // generateImage should never throw, but guard anyway
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`[ImageApplier] ❌ Exception: ${message}`);
      }

      return {
        ...node,
        props: {
          ...node.props,
          src: generatedSrc,
          alt: node.props?.alt || basePrompt || "Website section image",
        },
      };
    }

    /* ----------------------------------------------------------
       NON-IMAGE NODE — DEEP WALK
    ---------------------------------------------------------- */
    if (!node.children || node.children.length === 0) {
      return node;
    }

    const children: BlueprintNode[] = [];
    for (const child of node.children) {
      children.push(await walk(child));
    }

    return {
      ...node,
      children,
    };
  }

  const result = await walk(structuredClone(blueprint));

  console.log(`[ImageApplier] ✅ Completed - processed ${imageCursor} images`);

  return result;
}

/* ============================================================
   ✅ NEW: ENHANCE IMAGE PROMPT FOR PHOTOREALISM
============================================================ */

function enhanceImagePrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Check if prompt already has photorealistic keywords
  const hasPhotorealisticKeywords = 
    lowerPrompt.includes('photorealistic') ||
    lowerPrompt.includes('professional photography') ||
    lowerPrompt.includes('dslr camera');

  // If already enhanced, return as-is
  if (hasPhotorealisticKeywords) {
    console.log(`[ImageApplier] Prompt already has photorealistic keywords`);
    return prompt;
  }

  // Build enhanced prompt with photorealistic keywords
  const enhancedPrompt = [
    'professional photography',
    'photorealistic',
    'DSLR camera',
    'natural lighting',
    'NOT illustration',
    'NOT painting',
    'NOT artistic rendering',
    prompt, // Original prompt
    'balanced colors',
    'natural color grading',
    'sharp focus',
    'high quality',
    '8K resolution'
  ].join(', ');

  console.log(`[ImageApplier] 🎨 Enhanced prompt for photorealism`);
  return enhancedPrompt;
}

/* ============================================================
   HELPER: COUNT IMAGE NODES
============================================================ */

function countImageNodes(node: BlueprintNode): number {
  let count = node.type === "image" ? 1 : 0;

  if (node.children) {
    for (const child of node.children) {
      count += countImageNodes(child);
    }
  }

  return count;
}

/* ============================================================
   HELPER: CHECK IF URL IS VALID (NOT PLACEHOLDER/BASE64)
============================================================ */

function isValidImageUrl(src: string): boolean {
  // Reject empty
  if (!src || src.trim() === "") return false;

  // Reject base64 data URLs (we want real URLs)
  if (src.startsWith("data:")) return false;

  // Reject common placeholder patterns
  if (src.includes("placehold")) return false;
  if (src.includes("placeholder")) return false;
  if (src.includes("fallback")) return false;

  // Must be a proper URL
  if (!src.startsWith("http://") && !src.startsWith("https://")) return false;

  return true;
}
