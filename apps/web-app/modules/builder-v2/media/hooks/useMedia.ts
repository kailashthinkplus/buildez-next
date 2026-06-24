"use client";

import { useCallback, useEffect, useState } from "react";

import { mediaService } from "../services/media.service";
import type {
  GenerateImageRequest,
  MediaAsset,
} from "../types";

/* ==========================================================
   Hook
========================================================== */

export function useMedia(
  siteId: string
) {

  const [assets, setAssets] = useState<MediaAsset[]>([]);

  const [loading, setLoading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* ========================================================
     LOAD LIBRARY
  ======================================================== */

  const refresh = useCallback(async () => {

    if (!siteId) return;

    try {

      setLoading(true);

      setError(null);

      const items =
        await mediaService.getAssets(siteId);

      setAssets(items);

    } catch (err: any) {

      setError(
        err.message ??
          "Unable to load media library."
      );

    } finally {

      setLoading(false);

    }

  }, [siteId]);

  /* ========================================================
     INITIAL LOAD
  ======================================================== */

  useEffect(() => {

    refresh();

  }, [refresh]);

  /* ========================================================
     UPLOAD IMAGE
  ======================================================== */

  async function uploadImage(
    file: File
  ) {

    try {

      setUploading(true);

      const url =
        await mediaService.uploadImage(
          file,
          siteId
        );

      await refresh();

      return url;

    } finally {

      setUploading(false);

    }

  }

  /* ========================================================
     GENERATE AI
  ======================================================== */

  async function generateImages(
    request: GenerateImageRequest
  ) {

    try {

      setGenerating(true);

      return await mediaService.generateImages({
        ...request,
        siteId,
      });

    } finally {

      setGenerating(false);

    }

  }

  /* ========================================================
     DELETE
  ======================================================== */

  async function deleteAsset(
    assetId: string
  ) {

    await mediaService.deleteAsset(
      assetId
    );

    await refresh();

  }

  /* ========================================================
     SEARCH
  ======================================================== */

  async function search(
    query: string
  ) {

    if (!query.trim()) {

      await refresh();

      return;

    }

    const results =
      await mediaService.searchAssets(
        siteId,
        query
      );

    setAssets(results);

  }

  /* ========================================================
     RETURN
  ======================================================== */

  return {

    assets,

    loading,

    uploading,

    generating,

    error,

    refresh,

    search,

    uploadImage,

    generateImages,

    deleteAsset,

  };

}