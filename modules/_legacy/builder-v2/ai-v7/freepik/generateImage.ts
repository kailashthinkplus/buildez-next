// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/freepik/generateImage.ts

const FALLBACK_IMAGE = "https://placehold.co/800x450/e2e8f0/94a3b8?text=Image";

/**
 * Freepik API Response Structures (they vary by endpoint):
 * 
 * Text-to-Image v1: { data: [{ base64: "...", seed: ... }] }
 * Flux models:      { data: [{ base64: "..." }] }
 * Some endpoints:   { data: { image_url: "..." } }
 * Legacy:           { data: { image: "base64..." } }
 */

export async function generateFreepikImage(prompt: string): Promise<string> {
  console.log("[Freepik] Generating image for prompt:", prompt.substring(0, 100));

  try {
    const apiKey = process.env.FREEPIK_API_KEY;
    
    if (!apiKey) {
      console.error("[Freepik] No API key found in environment");
      return FALLBACK_IMAGE;
    }

    const res = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-freepik-api-key": apiKey, // Correct header for Freepik
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: "blurry, low quality, distorted, watermark, text, logo",
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 1000000),
        num_images: 1,
        image: {
          size: "landscape_16_9", // 16:9 aspect ratio
        },
        styling: {
          style: "photo", // photorealistic style
          color: "vibrant",
          lightning: "studio", // good lighting
          framing: "wide_angle",
        },
      }),
    });

    console.log("[Freepik] Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Freepik] API error:", res.status, errorText);
      return FALLBACK_IMAGE;
    }

    const json = await res.json();
    console.log("[Freepik] Response structure:", JSON.stringify(json, null, 2).substring(0, 500));

    // Try multiple response structures
    let imageData: string | null = null;

    // Structure 1: { data: [{ base64: "..." }] }
    if (Array.isArray(json.data) && json.data[0]?.base64) {
      imageData = json.data[0].base64;
      console.log("[Freepik] Found base64 in data[0].base64");
    }
    // Structure 2: { data: { image_url: "..." } }
    else if (json.data?.image_url) {
      console.log("[Freepik] Found direct URL:", json.data.image_url);
      return json.data.image_url; // Direct URL, no conversion needed
    }
    // Structure 3: { data: [{ url: "..." }] }
    else if (Array.isArray(json.data) && json.data[0]?.url) {
      console.log("[Freepik] Found URL in data[0].url:", json.data[0].url);
      return json.data[0].url; // Direct URL
    }
    // Structure 4: { data: { image: "base64..." } }
    else if (json.data?.image) {
      imageData = json.data.image;
      console.log("[Freepik] Found base64 in data.image");
    }
    // Structure 5: { image: "base64..." }
    else if (json.image) {
      imageData = json.image;
      console.log("[Freepik] Found base64 in root image field");
    }

    if (!imageData) {
      console.error("[Freepik] Could not find image in response. Full response:", JSON.stringify(json));
      return FALLBACK_IMAGE;
    }

    // Convert base64 to data URL
    // Remove any existing data URL prefix if present
    const cleanBase64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    
    // Detect image type from base64 header
    const imageType = detectImageType(cleanBase64);
    const dataUrl = `data:image/${imageType};base64,${cleanBase64}`;
    
    console.log("[Freepik] Successfully generated image, data URL length:", dataUrl.length);
    
    // ⚠️ IMPORTANT: This returns a data URL which works but is not ideal
    // TODO: Upload to your storage (S3/Cloudinary/Supabase) and return the URL
    // return await uploadToStorage(cleanBase64, `ai-${Date.now()}.${imageType}`);
    
    return dataUrl;

  } catch (error) {
    console.error("[Freepik] Exception:", error);
    return FALLBACK_IMAGE;
  }
}

/**
 * Detect image type from base64 header bytes
 */
function detectImageType(base64: string): string {
  const header = base64.substring(0, 20);
  
  // JPEG starts with /9j/
  if (header.startsWith("/9j/")) {
    return "jpeg";
  }
  // PNG starts with iVBOR
  if (header.startsWith("iVBOR")) {
    return "png";
  }
  // WebP starts with UklGR
  if (header.startsWith("UklGR")) {
    return "webp";
  }
  // GIF starts with R0lGOD
  if (header.startsWith("R0lGOD")) {
    return "gif";
  }
  
  // Default to jpeg
  return "jpeg";
}

// ============================================================
// TODO: Implement this function with your storage provider
// ============================================================
// async function uploadToStorage(base64: string, filename: string): Promise<string> {
//   // Example with Supabase Storage:
//   // const { data, error } = await supabase.storage
//   //   .from('images')
//   //   .upload(filename, Buffer.from(base64, 'base64'), {
//   //     contentType: 'image/jpeg',
//   //   });
//   // return supabase.storage.from('images').getPublicUrl(filename).data.publicUrl;
//   
//   // Example with Cloudinary:
//   // const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`);
//   // return result.secure_url;
//   
//   // Example with S3:
//   // await s3.putObject({
//   //   Bucket: 'your-bucket',
//   //   Key: filename,
//   //   Body: Buffer.from(base64, 'base64'),
//   //   ContentType: 'image/jpeg',
//   // });
//   // return `https://your-bucket.s3.amazonaws.com/${filename}`;
// }