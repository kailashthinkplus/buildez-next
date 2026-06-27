"use client";

import type {
  GenerateImageRequest,
  MediaAsset,
} from "../types";

/* ==========================================================
   TYPES
========================================================== */

interface MediaListResponse {
  ok: boolean;
  assets?: MediaAsset[];
}

interface MediaUploadResponse {
  ok: boolean;
  asset?: MediaAsset;
  duplicate?: boolean;
  error?: string;
}

/* ==========================================================
   MEDIA SERVICE
========================================================== */

class MediaService {
  /* ========================================================
     GET LIBRARY
  ======================================================== */

  async getAssets(siteId: string): Promise<MediaAsset[]> {
    const response = await fetch(`/api/builder-v2/assets?siteId=${siteId}`);

    if (!response.ok) {
      throw new Error("Failed to load media library");
    }

    const json = (await response.json()) as MediaListResponse;

    return json.assets ?? [];
  }

  /* ========================================================
     INITIALIZE R2 UPLOAD
  ======================================================== */

  async uploadImage(file: File, siteId: string): Promise<MediaAsset> {
    const formData = new FormData();
    formData.append("siteId", siteId);
    formData.append("file", file);

    const response = await fetch("/api/builder-v2/assets/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const json = (await response.json().catch(() => ({}))) as MediaUploadResponse;

    if (!response.ok || !json.asset) {
      throw new Error(json.error || "Image upload failed.");
    }

    return json.asset;
  }

  async uploadImages(files: File[], siteId: string): Promise<MediaAsset[]> {
    const assets: MediaAsset[] = [];

    for (const file of files) {
      assets.push(await this.uploadImage(file, siteId));
    }

    return assets;
  }

  /* ========================================================
     GENERATE AI IMAGES
  ======================================================== */

  async generateImages(request: GenerateImageRequest) {
    const response = await fetch("/api/ai-v8/generate-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompts: [request.prompt],
        industry: request.industry ?? "GENERIC",
        size: request.size ?? "landscape",
      }),
    });

    if (!response.ok) {
      throw new Error("Image generation failed.");
    }

    return response.json();
  }

  /* ========================================================
     DELETE
  ======================================================== */

  async deleteAsset(assetId: string) {
    const response = await fetch(`/api/builder-v2/assets/${assetId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete failed.");
    }
  }

  /* ========================================================
     SEARCH
  ======================================================== */

  async searchAssets(siteId: string, query: string): Promise<MediaAsset[]> {
    const response = await fetch(
      `/api/builder-v2/assets?siteId=${siteId}&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Search failed.");
    }

    const json = (await response.json()) as MediaListResponse;

    return json.assets ?? [];
  }
}

/* ==========================================================
   SINGLETON
========================================================== */

export const mediaService = new MediaService();
