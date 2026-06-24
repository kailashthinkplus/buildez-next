// /Users/kailash/buildez/apps/web-app/app/api/api-v7/_lib/freepik.ts

/* ============================================================
   FREEPIK AI CLIENT (SAFE TRANSPORT LAYER)
   - Comprehensive logging for debugging
   - MUST NEVER throw
   - Returns structured response or error
============================================================ */

const FREEPIK_API_BASE = "https://api.freepik.com/v1/ai";

// Startup check
console.log("🔧 [Freepik] Module loaded");
console.log("🔧 [Freepik] API Key exists:", !!process.env.FREEPIK_API_KEY);
console.log("🔧 [Freepik] API Key length:", process.env.FREEPIK_API_KEY?.length ?? 0);
console.log("🔧 [Freepik] API Key prefix:", process.env.FREEPIK_API_KEY?.slice(0, 8) + "...");

if (!process.env.FREEPIK_API_KEY) {
  console.warn(
    "🚨 [Freepik] FREEPIK_API_KEY is NOT set! Image generation will fail."
  );
}

export async function callFreepikAI({
  endpoint,
  body,
  signal,
}: {
  endpoint: string;
  body: any;
  signal?: AbortSignal;
}): Promise<any> {
  const url = `${FREEPIK_API_BASE}${endpoint}`;
  const requestId = Math.random().toString(36).slice(2, 8);
  
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🖼️ [Freepik][${requestId}] NEW REQUEST`);
  console.log(`${"=".repeat(60)}`);
  console.log(`🖼️ [Freepik][${requestId}] URL:`, url);
  console.log(`🖼️ [Freepik][${requestId}] Prompt:`, body.prompt);
  console.log(`🖼️ [Freepik][${requestId}] Full body:`, JSON.stringify(body, null, 2));
  console.log(`🖼️ [Freepik][${requestId}] API Key exists:`, !!process.env.FREEPIK_API_KEY);
  console.log(`🖼️ [Freepik][${requestId}] Timestamp:`, new Date().toISOString());

  if (!process.env.FREEPIK_API_KEY) {
    console.error(`🖼️ [Freepik][${requestId}] ❌ ABORTING: No API key!`);
    return {
      error: true,
      status: 0,
      message: "FREEPIK_API_KEY not configured",
    };
  }

  try {
    console.log(`🖼️ [Freepik][${requestId}] 🚀 Sending request...`);
    
    const startTime = Date.now();
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-freepik-api-key": process.env.FREEPIK_API_KEY,
      },
      body: JSON.stringify(body),
      signal,
    });

    const elapsed = Date.now() - startTime;
    
    console.log(`🖼️ [Freepik][${requestId}] 📡 Response received in ${elapsed}ms`);
    console.log(`🖼️ [Freepik][${requestId}] Status:`, res.status, res.statusText);
    console.log(`🖼️ [Freepik][${requestId}] Headers:`, Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const text = await res.text();
      console.error(`🖼️ [Freepik][${requestId}] ❌ HTTP Error!`);
      console.error(`🖼️ [Freepik][${requestId}] Status:`, res.status);
      console.error(`🖼️ [Freepik][${requestId}] Response body:`, text);

      return {
        error: true,
        status: res.status,
        message: text,
      };
    }

    const json = await res.json();
    
    console.log(`🖼️ [Freepik][${requestId}] ✅ SUCCESS!`);
    console.log(`🖼️ [Freepik][${requestId}] Response JSON:`, JSON.stringify(json, null, 2));
    
    // Log specific fields we care about
    console.log(`🖼️ [Freepik][${requestId}] data:`, json.data);
    console.log(`🖼️ [Freepik][${requestId}] data[0]:`, json.data?.[0]);
    console.log(`🖼️ [Freepik][${requestId}] data[0].url:`, json.data?.[0]?.url);
    console.log(`🖼️ [Freepik][${requestId}] images:`, json.images);
    console.log(`🖼️ [Freepik][${requestId}] images[0]:`, json.images?.[0]);

    return json;
  } catch (err: any) {
    console.error(`🖼️ [Freepik][${requestId}] ❌ EXCEPTION!`);
    console.error(`🖼️ [Freepik][${requestId}] Error name:`, err.name);
    console.error(`🖼️ [Freepik][${requestId}] Error message:`, err.message);
    console.error(`🖼️ [Freepik][${requestId}] Error stack:`, err.stack);

    return {
      error: true,
      status: 0,
      message: err?.message ?? "Unknown error",
    };
  }
}