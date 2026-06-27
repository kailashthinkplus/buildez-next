"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { registerWidgets } from "@/modules/builder-v2/widgets/registerWidgets";

// Register widgets synchronously before anything else
registerWidgets();

// Lazy-load the Builder v2 root from the modules area
const BuilderV2Root = dynamic(
  () => import("@/modules/builder-v2/workspace/BuilderRoot"),
  { ssr: false }
);

interface BuilderRootProps {
  pageId: string;
  siteId: string;
  pageStatus: "DRAFT" | "PUBLISHED";
  pageTitle: string;
  initialBlueprint: unknown;
  initialDesignTokens?: Record<string, unknown> | null;
  initialSiteLayout?: Record<string, unknown> | null;
}

export default function BuilderRoot(props: BuilderRootProps) {
  return (
    <Suspense>
      <BuilderV2Root {...props} />
    </Suspense>
  );
}
