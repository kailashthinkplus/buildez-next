"use client";

import { BlueprintNode, PageRenderer } from "./PageRenderer";

/* ============================================================
   TYPES
============================================================ */

interface SiteComposerProps {
  header?: BlueprintNode | null;
  page: BlueprintNode;
  footer?: BlueprintNode | null;

  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onUpdateNode?: (id: string, patch: Partial<BlueprintNode>) => void;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
}

/* ============================================================
   SITE COMPOSER — V4
============================================================ */

export default function SiteComposer({
  header,
  page,
  footer,
  ...sharedProps
}: SiteComposerProps) {
  return (
    <>
      {/* ---------------- HEADER ---------------- */}
      {header && (
        <PageRenderer
          blueprint={header}
          {...sharedProps}
        />
      )}

      {/* ---------------- PAGE ---------------- */}
      <PageRenderer
        blueprint={page}
        {...sharedProps}
      />

      {/* ---------------- FOOTER ---------------- */}
      {footer && (
        <PageRenderer
          blueprint={footer}
          {...sharedProps}
        />
      )}
    </>
  );
}
