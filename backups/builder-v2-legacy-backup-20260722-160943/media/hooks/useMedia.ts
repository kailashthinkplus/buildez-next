"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

  const hasLoadedRef = useRef(false);

  /* ========================================================
     LOAD LIBRARY
  ======================================================== */

  const refresh = useCallback(async () => {

    if (!siteId) return;

    try {

      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      setError(null);

      const items =
        await mediaService.getAssets(siteId);

      setAssets(items);
      hasLoadedRef.current = true;

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
    hasLoadedRef.current = false;
    setAssets([]);
    refresh();
  }, [refresh, siteId]);

  /* ========================================================
     UPLOAD IMAGE
  ======================================================== */

  const uploadImage = useCallback(async (file: File) => {

    try {

      setUploading(true);

      const asset = await mediaService.uploadImage(file, siteId);

      await refresh();

      return asset;

    } finally {

      setUploading(false);

    }

  }, [refresh, siteId]);

  const uploadImages = useCallback(async (files: File[]) => {
    try {
      setUploading(true);

      const uploaded = await mediaService.uploadImages(files, siteId);

      await refresh();

      return uploaded;
    } finally {
      setUploading(false);
    }
  }, [refresh, siteId]);

  /* ========================================================
     GENERATE AI
  ======================================================== */

  const generateImages = useCallback(async (
    request: GenerateImageRequest
  ) => {

    try {

      setGenerating(true);

      return await mediaService.generateImages({
        ...request,
        siteId,
      });

    } finally {

      setGenerating(false);

    }

  }, [siteId]);

  /* ========================================================
     DELETE
  ======================================================== */

  const deleteAsset = useCallback(async (
    assetId: string
  ) => {

    await mediaService.deleteAsset(
      assetId
    );

    await refresh();

  }, [refresh]);

  /* ========================================================
     SEARCH
  ======================================================== */

  const search = useCallback(async (
    query: string
  ) => {

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

  }, [refresh, siteId]);

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

    uploadImages,

    generateImages,

    deleteAsset,

  };

}
