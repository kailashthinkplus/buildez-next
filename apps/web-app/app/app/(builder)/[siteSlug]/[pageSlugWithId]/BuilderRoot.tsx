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

export default function Page() {
  return (
    <Suspense>
      <BuilderV2Root />
    </Suspense>
  );
}
