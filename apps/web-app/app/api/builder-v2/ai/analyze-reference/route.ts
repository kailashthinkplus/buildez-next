import { prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { uploadToR2 } from "@/lib/storage/uploadToR2";

export const maxDuration = 180;
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function responseText(payload: unknown): string {
  const root = object(payload);
  if (typeof root.output_text === "string") return root.output_text.trim();
  return (Array.isArray(root.output) ? root.output : [])
    .flatMap((item) => {
      const content = object(item).content;
      return Array.isArray(content) ? content : [];
    })
    .map((item) => typeof object(item).text === "string" ? String(object(item).text) : "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getUser();
    if (!auth?.user || !auth.tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const pageId = String(form.get("pageId") || "").trim();
    if (!(file instanceof File) || !pageId) {
      return NextResponse.json({ error: "A reference file and page are required." }, { status: 400 });
    }
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf && !IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Use a PNG, JPG, WebP, AVIF, or PDF reference." }, { status: 415 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Reference files must be 20 MB or smaller." }, { status: 413 });
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, site: { tenantId: auth.tenant.id } },
      select: { id: true, siteId: true },
    });
    if (!page) return NextResponse.json({ error: "Page not found." }, { status: 404 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64 = fileBuffer.toString("base64");
    const dataUrl = `data:${isPdf ? "application/pdf" : file.type};base64,${base64}`;
    const mediaInput = isPdf
      ? { type: "input_file", filename: file.name, file_data: dataUrl, detail: "high" }
      : { type: "input_image", image_url: dataUrl, detail: "high" };

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_REFERENCE_MODEL || process.env.OPENAI_V11_MODEL || "gpt-5.6-sol",
        reasoning: { effort: "none" },
        input: [{
          role: "user",
          content: [
            mediaInput,
            {
              type: "input_text",
              text: `Analyze this ${isPdf ? "PDF" : "UI image"} as a senior product designer preparing a high-fidelity TSX reconstruction. Return a compact JSON implementation specification, not prose and not markdown. Use this shape: {"pageType":"","visualSummary":"","sourceViewport":{"width":null,"height":null},"palette":[{"hex":"","role":""}],"typography":{"display":"","heading":"","body":""},"globalGeometry":{"contentWidth":"","horizontalPadding":"","sectionSpacing":""},"sections":[{"index":1,"id":"","role":"","observedHeight":"","layout":"","columns":"","alignment":"","background":"","spacing":"","typography":"","media":[{"role":"","position":"","aspectRatio":"","description":""}],"visibleCopy":[],"requiredElements":[]}],"responsiveAdaptations":[],"fidelityRequirements":[]}. Capture every section from top to bottom, including announcement bars, header/navigation, product or content grids, forms, calls to action, and the complete footer. Record observed geometry, colors, font scale/weight, spacing, borders, radii, shadows, imagery and icons. Extract visible copy only when legible. Put inference only in responsiveAdaptations; do not mix it with observed facts.`,
            },
          ],
        }],
        max_output_tokens: 4000,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(150000),
    });
    const raw = await openAiResponse.text();
    let payload: unknown = null;
    try { payload = JSON.parse(raw); } catch { /* handled below */ }
    if (!openAiResponse.ok) {
      const apiError = object(object(payload).error).message;
      throw new Error(typeof apiError === "string" ? apiError : `Reference analysis failed (${openAiResponse.status}).`);
    }
    const analysis = responseText(payload);
    if (!analysis) throw new Error("AI returned an empty reference analysis.");

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || (isPdf ? "reference.pdf" : "reference-image");
    const referenceFileUrl = await uploadToR2({
      buffer: fileBuffer,
      key: `sites/${page.siteId}/ai-references/${crypto.randomUUID()}-${safeName}`,
      contentType: isPdf ? "application/pdf" : file.type,
    });

    return NextResponse.json({ analysis, fileName: file.name, kind: isPdf ? "pdf" : "image", referenceFileUrl });
  } catch (error) {
    console.error("[builder-v2/reference-analysis]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reference analysis failed." },
      { status: 500 }
    );
  }
}
