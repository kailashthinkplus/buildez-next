// apps/web-app/app/api/ai-v6/image/route.ts

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";

const MAX_PROMPT_LENGTH = 300;

export async function POST(req: Request) {
  const session = await getSession();

  if (!session?.tenantId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { prompt, size = "1024x1024" } = await req.json();

  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: "Invalid prompt length" },
      { status: 400 }
    );
  }

  console.group("🖼️ [AI-V6 IMAGE REQUEST]");
  console.log({ prompt, size });
  console.groupEnd();

  const res = await fetch(
    "https://api.freepik.com/v1/ai/text-to-image",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Freepik-API-Key": process.env.FREEPIK_API_KEY!,
      },
      body: JSON.stringify({
        prompt,
        num_images: 1,
        image_size: size,
      }),
    }
  );

  const json = await res.json();

  console.group("🖼️ [AI-V6 FREEPIK RESPONSE]");
  console.log(json);
  console.groupEnd();

  return NextResponse.json(json);
}
