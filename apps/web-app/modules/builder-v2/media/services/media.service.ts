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

/* ==========================================================
   MEDIA SERVICE
========================================================== */

class MediaService {
  /* ========================================================
     GET LIBRARY
  ======================================================== */

  async getAssets(
    siteId: string
  ): Promise<MediaAsset[]> {
    const response = await fetch(
      `/api/media?siteId=${siteId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load media library");
    }

    return response.json();
  }

  /* ========================================================
     INITIALIZE R2 UPLOAD
  ======================================================== */

  async initializeUpload(
    file: File,
    siteId: string
  ): Promise<UploadInitResponse> {

    const response = await fetch(
      "/api/uploads/image/init",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          siteId,
          fileName: file.name,
          fileType: file.type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to initialize upload."
      );
    }

    return response.json();
  }

  /* ========================================================
     UPLOAD TO R2
  ======================================================== */

  async uploadImage(
    file: File,
    siteId: string
  ): Promise<string> {

    const {
      uploadUrl,
      publicUrl,
    } = await this.initializeUpload(
      file,
      siteId
    );

    const upload = await fetch(uploadUrl, {
      method: "PUT",

      headers: {
        "Content-Type": file.type,
      },

      body: file,
    });

    if (!upload.ok) {
      throw new Error(
        "Image upload failed."
      );
    }

    return publicUrl;
  }

  /* ========================================================
     GENERATE AI IMAGES
  ======================================================== */

  async generateImages(
    request: GenerateImageRequest
  ) {

    const response = await fetch(
      "/api/ai-v8/generate-images",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          prompts: [request.prompt],

          industry:
            request.industry ??
            "GENERIC",

          size:
            request.size ??
            "landscape",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Image generation failed."
      );
    }

    return response.json();
  }

  /* ========================================================
     DELETE
  ======================================================== */

  async deleteAsset(
    assetId: string
  ) {

    await fetch(
      `/api/media/${assetId}`,
      {
        method: "DELETE",
      }
    );

  }

  /* ========================================================
     SEARCH
  ======================================================== */

  async searchAssets(
    siteId: string,
    query: string
  ) {

    const response = await fetch(

      `/api/media?siteId=${siteId}&q=${encodeURIComponent(query)}`

    );

    if (!response.ok) {
      throw new Error(
        "Search failed."
      );
    }

    return response.json();

  }
}

/* ==========================================================
   SINGLETON
========================================================== */

export const mediaService =
  new MediaService();