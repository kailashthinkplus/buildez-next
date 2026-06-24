"use client";

import { useEffect, useMemo, useState } from "react";

import BuilderProvider from "./BuilderProvider";
import BuilderShell from "./BuilderShell";
import ColumnStructurePicker from "../layout/ColumnStructurePicker";
import { LogoUploadModal } from "@/app/app/(builder)/components/LogoUploadModal";
import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";

import type { BuilderBlueprint } from "../types/blueprint";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function walkLegacy(
  node: any,
  parentId: string | null,
  nodes: Record<string, any>
): string {
  const id = node.id || `n_${uid()}`;
  const rawChildren = Array.isArray(node.children) ? node.children : [];
  const childIds: string[] = [];

  nodes[id] = {
    id,
    type: node.type,
    name: node.name ?? undefined,
    parentId,
    children: childIds,
    props: node.props ?? {},
    style: node.style ?? {},
    locked: !!node.locked,
    hidden: !!node.hidden,
  };

  for (const child of rawChildren) {
    const childId = walkLegacy(child, id, nodes);
    childIds.push(childId);
  }

  return id;
}

function convertToV2Blueprint(root: any, title = "Untitled"): BuilderBlueprint {
  if (!root || root.type !== "page") {
    return {
      metadata: {
        version: 2,
        title: "Untitled",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      theme: {
        id: "default",
        name: "Default",
        preset: "default",
        tokens: {},
      },
      root: "root",
      nodes: {},
    };
  }

  const nodes: Record<string, any> = {};
  const rootId = walkLegacy(root, null, nodes);

  return {
    metadata: {
      version: 2,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    theme: {
      id: "default",
      name: "Default",
      preset: "default",
      tokens: {},
    },
    root: rootId,
    nodes,
  };
}

function isV2Blueprint(value: any): value is BuilderBlueprint {
  return (
    !!value &&
    typeof value === "object" &&
    typeof value.root === "string" &&
    !!value.nodes &&
    typeof value.nodes === "object"
  );
}

interface BuilderRootProps {
  pageId: string;
  siteId: string;
  pageTitle: string;
  initialBlueprint: unknown;
}

export default function BuilderRoot({
  pageId,
  siteId,
  pageTitle,
  initialBlueprint,
}: BuilderRootProps) {

  const setDesignTokens = useCanvasStore((s) => s.setDesignTokens);

  const [logoUploadOpen, setLogoUploadOpen] = useState(false);

  const v2Blueprint = useMemo(() => {
    if (isV2Blueprint(initialBlueprint)) {
      return initialBlueprint;
    }

    const rawBlueprint = initialBlueprint as any;
    let normalized: any;

    if (
      rawBlueprint?.type === "page" &&
      Array.isArray(rawBlueprint.children)
    ) {
      normalized = rawBlueprint;
    } else if (
      rawBlueprint?.page &&
      Array.isArray(rawBlueprint.page.children)
    ) {
      normalized = {
        id: rawBlueprint.page.id || pageId,
        type: "page",
        props: rawBlueprint.page.props ?? {},
        children: rawBlueprint.page.children ?? [],
      };
    } else {
      normalized = {
        id: pageId,
        type: "page",
        props: {},
        children: [],
      };
    }

    return convertToV2Blueprint(normalized, pageTitle || "Untitled");
  }, [initialBlueprint, pageId, pageTitle]);

  useEffect(() => {
    const root = v2Blueprint.nodes[v2Blueprint.root];
    const designTokens = root?.props?.designTokens;

    if (designTokens && typeof designTokens === "object") {
      setDesignTokens(designTokens as any);
    }
  }, [setDesignTokens, v2Blueprint]);

  /* ----------------------------------------------------------
     Listen for requests to open the logo upload modal (from AiPanel)
  ---------------------------------------------------------- */
  useEffect(() => {
    function onOpen() {
      setLogoUploadOpen(true);
    }

    window.addEventListener("ai:open-logo-upload", onOpen);
    return () => window.removeEventListener("ai:open-logo-upload", onOpen);
  }, []);

  return (
    <>
      <BuilderProvider blueprint={v2Blueprint}>
        <BuilderShell pageId={pageId} />
      </BuilderProvider>

      <ColumnStructurePicker
        open={false}
        onClose={() => {}}
        onSelect={() => {}}
      />

      {logoUploadOpen && (
        <LogoUploadModal
          siteId={siteId}
          onComplete={({ logoUrl, palette }) => {
            setLogoUploadOpen(false);
            window.dispatchEvent(
              new CustomEvent("ai:logo-complete", { detail: { logoUrl, palette } })
            );
          }}
          onClose={() => setLogoUploadOpen(false)}
        />
      )}
    </>
  );
}
