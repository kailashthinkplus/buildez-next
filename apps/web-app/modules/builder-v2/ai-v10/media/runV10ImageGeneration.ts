import { uploadToR2 } from "@/lib/storage/uploadToR2";
import type { BuilderBlueprint } from "../../types/blueprint";
import { assignNativeWidgetMedia, discoverNativeWidgetMediaSlots } from "./nativeWidgetMediaSlots";

type ImageTarget = { nodeId: string; prompt: string; slotPath?: string };

export function targetsFor(blueprint: BuilderBlueprint): ImageTarget[] {
  const primitive = Object.values(blueprint.nodes)
    .filter((node) => node.type === "image" && !node.props?.src && typeof node.props?.aiImagePrompt === "string")
    .map((node) => ({ nodeId: node.id, prompt: String(node.props.aiImagePrompt) }));
  const native = discoverNativeWidgetMediaSlots(blueprint).filter((slot)=>slot.assignmentStatus === "pending").map((slot)=>({nodeId:slot.widgetId,prompt:slot.prompt,slotPath:slot.slotPath}));
  return [...primitive,...native]
    .slice(0, Math.max(0, Math.min(10, Number(process.env.AI_V10_IMAGE_COUNT || 8))));
}

async function generateImage(target: ImageTarget, siteId: string, index: number) {
  const debugLabel = `v10-image-generation-${index + 1}`;
  const model = process.env.OPENAI_V10_IMAGE_MODEL || "gpt-image-2";
  const startedAt = Date.now();
  console.log("[OPENAI IMAGE REQUEST]", { debugLabel, model, nodeId: target.nodeId, promptCharacters: target.prompt.length });
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model,
        prompt: `${target.prompt}. High-end editorial website photography, no text, no watermark, no logo.`,
        size: "1536x1024",
        n: 1,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(Number(process.env.OPENAI_V10_IMAGE_TIMEOUT_MS || 180000)),
    });
  } catch (error) {
    console.error("[OPENAI IMAGE REQUEST ERROR]", { debugLabel, model, nodeId: target.nodeId, durationMs: Date.now() - startedAt, error: error instanceof Error ? `${error.name}: ${error.message}` : "unknown network error" });
    throw error;
  }
  if (!response.ok) {
    const rawError = await response.text();
    console.error("[OPENAI IMAGE RESPONSE ERROR]", { debugLabel, model, nodeId: target.nodeId, status: response.status, durationMs: Date.now() - startedAt, errorCharacters: rawError.length });
    throw new Error(`OpenAI image API error ${response.status}: ${rawError}`);
  }
  console.log("[OPENAI IMAGE RESPONSE]", { debugLabel, model, nodeId: target.nodeId, status: response.status, durationMs: Date.now() - startedAt });
  let payload: any;
  try {
    payload = await response.json();
  } catch (error) {
    console.error("[OPENAI IMAGE RESPONSE PARSE ERROR]", { debugLabel, model, nodeId: target.nodeId, durationMs: Date.now() - startedAt, error: error instanceof Error ? `${error.name}: ${error.message}` : "unknown response parse error" });
    throw error;
  }
  const item = payload?.data?.[0];
  if (typeof item?.url === "string") return item.url;
  const base64 = item?.b64_json;
  if (typeof base64 !== "string") {
    console.error("[OPENAI IMAGE RESPONSE ERROR]", { debugLabel, model, nodeId: target.nodeId, durationMs: Date.now() - startedAt, error: "no image data" });
    throw new Error("OpenAI image API returned no image data.");
  }
  return uploadToR2({
    buffer: Buffer.from(base64, "base64"),
    key: `ai-v10/${siteId}/${Date.now()}-${crypto.randomUUID()}.png`,
    contentType: "image/png",
  });
}

export async function runV10ImageGeneration(
  blueprint: BuilderBlueprint,
  siteId = "unknown-site",
  onProgress?: (completed: number, total: number) => void
): Promise<{ blueprint: BuilderBlueprint; applied: number; warnings: string[] }> {
  const targets = targetsFor(blueprint);
  let completed = 0;
  const results = await Promise.all(targets.map(async (target, index) => {
    try {
      return { target, url: await generateImage(target, siteId, index) };
    } catch (error) {
      return { target, error: error instanceof Error ? error.message : "Image generation failed." };
    } finally {
      completed += 1;
      onProgress?.(completed, targets.length);
    }
  }));
  const nodes = { ...blueprint.nodes };
  const nestedAssignments: Array<{widgetId:string;slotPath:string;url:string}> = [];
  const warnings: string[] = [];
  let applied = 0;
  for (const result of results) {
    if (!("url" in result) || !result.url) {
      warnings.push(`${result.target.nodeId}: ${"error" in result ? result.error : "Image generation failed."}`);
      continue;
    }
    if (result.target.slotPath) nestedAssignments.push({widgetId:result.target.nodeId,slotPath:result.target.slotPath,url:result.url});
    else { const node = nodes[result.target.nodeId]; nodes[result.target.nodeId] = { ...node, props: { ...(node.props || {}), src: result.url } }; }
    applied += 1;
  }
  const nested = assignNativeWidgetMedia({ ...blueprint, nodes }, nestedAssignments);
  nested.rejected.forEach((warning)=>warnings.push(warning));
  return { blueprint: nested.blueprint, applied:applied-nested.rejected.length, warnings };
}

export { discoverNativeWidgetMediaSlots, assignNativeWidgetMedia } from "./nativeWidgetMediaSlots";
