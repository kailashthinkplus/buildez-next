"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function BuilderRoot() {
  const params = useParams();
  const pageSlugWithId = params?.pageSlugWithId as string;
  const pageId = pageSlugWithId?.split("-").pop() || "";

  const setDesignTokens = useCanvasStore((s) => s.setDesignTokens);

  const [v2Blueprint, setV2Blueprint] = useState<BuilderBlueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);

  useEffect(() => {
    if (!pageId) {
      setError("Missing pageId");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/pages/${pageId}`, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to load page (${res.status})`);
        const json = await res.json();
        const payload = json?.data ?? json;

        const rawBlueprint = payload?.blueprint;

        if (isV2Blueprint(rawBlueprint)) {
          if (cancelled) return;

          setV2Blueprint(rawBlueprint);

          const resolvedSiteId =
            payload?.site?.id || payload?.siteId || payload?.siteId || null;
          if (resolvedSiteId) setSiteId(resolvedSiteId);

          setError(null);
          setLoading(false);
          return;
        }

        let normalized: any;

        if (rawBlueprint && rawBlueprint.type === "page" && Array.isArray(rawBlueprint.children)) {
          normalized = rawBlueprint;
        } else if (rawBlueprint && rawBlueprint.page && Array.isArray(rawBlueprint.page.children)) {
          normalized = {
            id: payload.id || pageId,
            type: "page",
            props: rawBlueprint.page.props ?? {},
            children: rawBlueprint.page.children ?? [],
          };
        } else {
          normalized = { id: payload.id || pageId, type: "page", props: {}, children: [] };
        }

        if (cancelled) return;

        const v2 = convertToV2Blueprint(normalized, payload?.title || "Untitled");
        setV2Blueprint(v2);

        // Resolve siteId for logo uploads / branding
        const resolvedSiteId =
          payload?.site?.id || payload?.siteId || payload?.siteId || null;
        if (resolvedSiteId) setSiteId(resolvedSiteId);

        if (normalized?.props?.designTokens) {
          setDesignTokens(normalized.props.designTokens);
        }

        setError(null);
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        console.error("Failed to load blueprint", err);
        setError(err?.message || "Failed to load page");
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pageId, setDesignTokens]);

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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white bg-[rgba(10,14,25,0.65)]">
        Loading Builder…
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {v2Blueprint && (
        <BuilderProvider blueprint={v2Blueprint}>
          <BuilderShell />
        </BuilderProvider>
      )}

      <ColumnStructurePicker
        open={false}
        onClose={() => {}}
        onSelect={() => {}}
      />

      {logoUploadOpen && siteId && (
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
