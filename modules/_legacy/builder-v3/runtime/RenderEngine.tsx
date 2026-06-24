"use client";

import React from "react";
import { useBlueprintStore } from "../state/useBlueprintStore";
import PageRenderer from "../renderers/PageRenderer";

export default function RenderEngine() {
  const exportCurrentPage = useBlueprintStore((s) => s.exportCurrentPage);
  const page = exportCurrentPage();

  return <PageRenderer node={page} />;
}
