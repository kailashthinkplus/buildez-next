"use client";

import type {
  GenerateImageRequest,
  MediaAsset,
} from "../types";

/* ==========================================================
   TYPES
========================================================== */

interface UploadInitResponse {
  uploadUrl: string;
  publicUrl: string;
}

interface MediaListResponse {
  ok: boolean;
  assets?: MediaAsset[];
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

  async initializeUpload(
    file: File,
    siteId: string
  ): Promise<UploadInitResponse> {
    const response = await fetch("/api/uploads/image/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        siteId,
        fileName: file.name,
        fileType: file.type,
      }),
    });

    if (!response.ok) {
      throw new Error("Unable to initialize upload.");
    }

    return response.json();
  }

  /* ========================================================
     UPLOAD TO R2
  ======================================================== */

  async uploadImage(file: File, siteId: string): Promise<string> {
    const { uploadUrl, publicUrl } = await this.initializeUpload(file, siteId);

    const upload = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!upload.ok) {
      throw new Error("Image upload failed.");
    }

    return publicUrl;
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