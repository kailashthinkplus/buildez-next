"use client";

import { useEffect, useMemo, useState } from "react";

import BuilderProvider from "./BuilderProvider";
import BuilderShell from "./BuilderShell";
import ColumnStructurePicker from "../layout/ColumnStructurePicker";
import { LogoUploadModal } from "@/app/app/(builder)/components/LogoUploadModal";
import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";

import type { BuilderBlueprint } from "../types/blueprint";
import { defaultThemeTokens } from "../theme/defaultTheme";
import {
  createDefaultSiteThemeLayout,
  normalizeSiteThemeLayout,
} from "../theme/siteLayout";
import type { BuilderThemeTokens } from "../theme/theme.types";

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
  pageStatus: "DRAFT" | "PUBLISHED";
  pageTitle: string;
  initialBlueprint: unknown;
  initialDesignTokens?: Record<string, unknown> | null;
  initialSiteLayout?: Record<string, unknown> | null;
}

export default function BuilderRoot({
  pageId,
  siteId,
  pageStatus,
  pageTitle,
  initialBlueprint,
  initialDesignTokens,
  initialSiteLayout,
}: BuilderRootProps) {

  const setDesignTokens = useCanvasStore((s) => s.setDesignTokens);

  const [logoUploadOpen, setLogoUploadOpen] = useState(false);

  const v2Blueprint = useMemo(() => {
    let blueprint: BuilderBlueprint;

    if (isV2Blueprint(initialBlueprint)) {
      blueprint = initialBlueprint;
    } else {
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

      blueprint = convertToV2Blueprint(normalized, pageTitle || "Untitled");
    }

    if (!initialDesignTokens) {
      return blueprint;
    }

    return {
      ...blueprint,
      theme: {
        ...blueprint.theme,
        id:
          typeof initialDesignTokens.themePresetId === "string"
            ? initialDesignTokens.themePresetId
            : blueprint.theme.id,
        name:
          typeof initialDesignTokens.themeName === "string"
            ? initialDesignTokens.themeName
            : blueprint.theme.name,
        preset:
          typeof initialDesignTokens.themePresetId === "string"
            ? initialDesignTokens.themePresetId
            : blueprint.theme.preset,
        tokens: initialDesignTokens,
      },
    };
  }, [initialBlueprint, initialDesignTokens, pageId, pageTitle]);
  const siteLayout = useMemo(() => {
    const tokens =
      v2Blueprint.theme?.tokens &&
      typeof v2Blueprint.theme.tokens === "object" &&
      !Array.isArray(v2Blueprint.theme.tokens)
        ? (v2Blueprint.theme.tokens as unknown as BuilderThemeTokens)
        : defaultThemeTokens;

    return normalizeSiteThemeLayout(
      initialSiteLayout,
      createDefaultSiteThemeLayout({
        siteName: pageTitle || "BuildEZ Site",
        tokens,
        presetId: v2Blueprint.theme?.preset ?? "buildez-default",
      })
    );
  }, [initialSiteLayout, pageTitle, v2Blueprint]);

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
        <BuilderShell
          pageId={pageId}
          pageStatus={pageStatus}
          pageTitle={pageTitle}
          siteId={siteId}
          siteLayout={siteLayout}
        />
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
