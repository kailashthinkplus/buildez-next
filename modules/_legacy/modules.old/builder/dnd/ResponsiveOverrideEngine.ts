// apps/web-app/modules/builder/dnd/ResponsiveOverrideEngine.ts
"use client";

/**
 * --------------------------------------------------------------
 * ResponsiveOverrideEngine.ts — BuildEZ V3 (Final)
 * --------------------------------------------------------------
 * Features:
 * ✔ device-specific overrides (desktop/tablet/mobile)
 * ✔ deep merge into node.props.responsive
 * ✔ works with inspector + resize + drag engines
 * ✔ auto-create responsive buckets
 */

import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";

class ResponsiveOverrideEngineCore {
  device() {
    return useCanvasStore.getState().device; // desktop | tablet | mobile
  }

  apply(id: string, overrides: any) {
    const bp = useBlueprintStore.getState();

    const tree = bp.tree;
    const node = this.findNode(tree, id);
    if (!node) return;

    if (!node.props) node.props = {};
    if (!node.props.responsive) node.props.responsive = {};
    if (!node.props.responsive[this.device()])
      node.props.responsive[this.device()] = {};

    const bucket = node.props.responsive[this.device()];

    // deep merge
    node.props.responsive[this.device()] = {
      data: { ...(bucket.data || {}), ...(overrides.data || {}) },
      style: { ...(bucket.style || {}), ...(overrides.style || {}) },
      layout: { ...(bucket.layout || {}), ...(overrides.layout || {}) },
      effects: { ...(bucket.effects || {}), ...(overrides.effects || {}) },
    };

    useBlueprintStore.setState({ tree: bp.export() });
  }

  findNode(root: any, id: string): any {
    if (root.id === id) return root;
    for (const c of root.children) {
      const f = this.findNode(c, id);
      if (f) return f;
    }
    return null;
  }
}

export const ResponsiveOverrideEngine = new ResponsiveOverrideEngineCore();
