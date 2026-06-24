// ----------------------------------------------------------------------------------------------------
// PART 1 — Types, Node Factory, Utils, Normalization, History Engine
// ----------------------------------------------------------------------------------------------------

"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

// --------------------------------------------------------------
// CANONICAL RFC-004 NODE MODEL
// --------------------------------------------------------------
export interface BuilderNode {
  id: string;
  type: string;

  props: Record<string, any>;
  style: Record<string, any>;
  layout: Record<string, any>;
  effects: Record<string, any>;

  children: BuilderNode[];
  parentId?: string;
}

// --------------------------------------------------------------
// MINIMAL NODE FACTORY
// --------------------------------------------------------------
export function createNode(type: string): BuilderNode {
  return {
    id: nanoid(),
    type,
    props: {},
    style: {},
    layout: {},
    effects: {},
    children: [],
  };
}

// --------------------------------------------------------------
// DEEP CLONE (IMMUTABLE)
// --------------------------------------------------------------
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// --------------------------------------------------------------
// FIND NODE (DFS)
// --------------------------------------------------------------
export function findNode(root: BuilderNode, id: string | null): BuilderNode | null {
  if (!id) return null;
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

// --------------------------------------------------------------
// FIND PARENT OF NODE
// --------------------------------------------------------------
export function findParent(root: BuilderNode, id: string): BuilderNode | null {
  for (const child of root.children) {
    if (child.id === id) return root;
    const found = findParent(child, id);
    if (found) return found;
  }
  return null;
}

// --------------------------------------------------------------
// REMOVE NODE (returns removed node or null)
// --------------------------------------------------------------
export function removeNode(root: BuilderNode, id: string): BuilderNode | null {
  const index = root.children.findIndex((c) => c.id === id);
  if (index !== -1) {
    const removed = root.children[index];
    root.children.splice(index, 1);
    return removed;
  }
  for (const child of root.children) {
    const removed = removeNode(child, id);
    if (removed) return removed;
  }
  return null;
}

// --------------------------------------------------------------
// NORMALIZE NODE (guarantees props, style, layout, effects, children)
// --------------------------------------------------------------
export function normalizeNode(node: any): BuilderNode {
  return {
    id: node.id || nanoid(),
    type: node.type,

    props: node.props || {},
    style: node.style || {},
    layout: node.layout || {},
    effects: node.effects || {},

    children: Array.isArray(node.children)
      ? node.children.map((child: any) => normalizeNode(child))
      : [],

    parentId: node.parentId,
  };
}

// --------------------------------------------------------------
// ASSIGN PARENT IDs (recursive)
// --------------------------------------------------------------
export function assignParentIds(node: BuilderNode, parentId: string | null) {
  node.parentId = parentId || undefined;
  for (const child of node.children) {
    assignParentIds(child, node.id);
  }
}

// --------------------------------------------------------------
// NORMALIZE TREE (ensures valid structure + parent IDs)
// --------------------------------------------------------------
export function normalizeTree(root: BuilderNode): BuilderNode {
  const normalized = normalizeNode(root);
  assignParentIds(normalized, null);
  return normalized;
}

// --------------------------------------------------------------
// HISTORY ENGINE
// --------------------------------------------------------------
interface HistoryState {
  history: string[];
  historyIndex: number;
}

// Save current snapshot JSON into history
function saveHistory(tree: BuilderNode) {
  const store = useBlueprintStore.getState();

  const snapshot = JSON.stringify(tree);
  const trimmed = store.history.slice(0, store.historyIndex + 1);

  trimmed.push(snapshot);

  useBlueprintStore.setState({
    history: trimmed,
    historyIndex: trimmed.length - 1,
  });
}

// Undo
function applyUndo(): BuilderNode | null {
  const state = useBlueprintStore.getState();
  if (state.historyIndex <= 0) return null;

  const newIndex = state.historyIndex - 1;
  const snapshot = state.history[newIndex];
  const tree = normalizeTree(JSON.parse(snapshot));

  useBlueprintStore.setState({
    historyIndex: newIndex,
  });

  return tree;
}

// Redo
function applyRedo(): BuilderNode | null {
  const state = useBlueprintStore.getState();
  if (state.historyIndex >= state.history.length - 1) return null;

  const newIndex = state.historyIndex + 1;
  const snapshot = state.history[newIndex];
  const tree = normalizeTree(JSON.parse(snapshot));

  useBlueprintStore.setState({
    historyIndex: newIndex,
  });

  return tree;
}

// Allowed children rules — can be extended as needed
const ALLOWED_CHILDREN: Record<string, string[]> = {
  page: ["section"],
  section: ["column", "block", "inner-section"],
  "inner-section": ["column", "block"],
  column: ["block", "inner-section"],
};

// Validate if parent can accept child type
function canParentAccept(parent: BuilderNode, childType: string): boolean {
  const rules = ALLOWED_CHILDREN[parent.type];
  if (!rules) return true; // no rules => allow all
  return rules.includes(childType);
}

// Auto-equalize columns inside a section or inner-section
function equalizeColumns(node: BuilderNode) {
  const columns = node.children.filter((c) => c.type === "column");
  if (columns.length === 0) return;

  const width = 100 / columns.length;
  columns.forEach((col) => {
    col.style.width = `${width}%`;
  });
}

// ----------------------------------------------------------------------------------------
// BLUEPRINT STORE INTERFACE
// ----------------------------------------------------------------------------------------
interface BlueprintState {
  tree: BuilderNode;
  selectedId: string | null;
  hoverId: string | null;

  history: string[];
  historyIndex: number;

  // Selection
  select: (id: string | null) => void;
  hover: (id: string | null) => void;

  // Mutations
  addNode: (parentId: string, node: BuilderNode, index?: number | null) => void;
  insertInside: (parentId: string, node: BuilderNode) => void;
  insertBefore: (targetId: string, node: BuilderNode) => void;
  insertAfter: (targetId: string, node: BuilderNode) => void;

  moveNode: (nodeId: string, newParentId: string, index?: number | null) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;

  updateProps: (id: string, partial: any) => void;
  updateStyle: (id: string, partial: any) => void;
  updateLayout: (id: string, partial: any) => void;
  updateEffects: (id: string, partial: any) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Load / Export
  load: (root: BuilderNode) => void;
  export: () => BuilderNode;
}

/* ========================================================================
   Deep Merge Helper (non-destructive, device-safe)
   ======================================================================== */
function deepMerge(target: any = {}, source: any = {}) {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/* ========================================================================
   Extract device-specific slice: desktop/tablet/mobile
   ======================================================================== */
function getResponsiveOverrides(node: any, device: string) {
  if (!node?.props?.responsive) return {};
  return node.props.responsive[device] || {};
}

/* ========================================================================
   Merge all props for a given node (data + style + layout + effects)
   Including device-level overrides.
   ======================================================================== */
function mergeNodeProps(node: any, device: string) {
  if (!node) {
    return {
      props: {},
      style: {},
      layout: {},
      effects: {},
    };
  }

  const baseData = node.props?.data || {};
  const baseStyle = node.props?.style || {};
  const baseLayout = node.props?.layout || {};
  const baseEffects = node.props?.effects || {};

  const responsiveData =
    node.props?.responsive?.[device]?.data || {};

  const responsiveStyle =
    node.props?.responsive?.[device]?.style || {};

  const responsiveLayout =
    node.props?.responsive?.[device]?.layout || {};

  const responsiveEffects =
    node.props?.responsive?.[device]?.effects || {};

  return {
    props: deepMerge(baseData, responsiveData),
    style: deepMerge(baseStyle, responsiveStyle),
    layout: deepMerge(baseLayout, responsiveLayout),
    effects: deepMerge(baseEffects, responsiveEffects),
  };
}

// ----------------------------------------------------------------------------------------------------
// STORE IMPLEMENTATION
// ----------------------------------------------------------------------------------------------------
export const useBlueprintStore = create<BlueprintState>((set, get) => ({

  // Initial placeholder tree — real root will be loaded via load()
  tree: createNode("page"),

  selectedId: null,
  hoverId: null,

  history: [],
  historyIndex: -1,

  // ---------------------------------------------
  // SELECTION / HOVER
  // ---------------------------------------------
  select: (id) => set({ selectedId: id }),
  hover: (id) => set({ hoverId: id }),

  // ---------------------------------------------
  // ADD NODE
  // ---------------------------------------------
  addNode(parentId, node, index = null) {
    const state = get();
    const tree = deepClone(state.tree);

    const parent = findNode(tree, parentId);
    if (!parent) return;

    // Structural rule enforcement
    if (!canParentAccept(parent, node.type)) return;

    const newNode = normalizeNode(node);

    if (index === null) parent.children.push(newNode);
    else parent.children.splice(index, 0, newNode);

    equalizeColumns(parent);

    const normalized = normalizeTree(tree);
    saveHistory(normalized);

    set({ tree: normalized });
  },

  // ---------------------------------------------
  // INSERT INSIDE
  // ---------------------------------------------
  insertInside(parentId, node) {
    const parent = get().tree;
    get().addNode(parentId, node, null);
  },

  // ---------------------------------------------
  // INSERT BEFORE
  // ---------------------------------------------
  insertBefore(targetId, node) {
    const state = get();
    const tree = deepClone(state.tree);

    const parent = findParent(tree, targetId);
    if (!parent) return;

    if (!canParentAccept(parent, node.type)) return;

    const index = parent.children.findIndex((c) => c.id === targetId);
    if (index === -1) return;

    parent.children.splice(index, 0, normalizeNode(node));
    equalizeColumns(parent);

    const normalized = normalizeTree(tree);
    saveHistory(normalized);

    set({ tree: normalized });
  },

  // ---------------------------------------------
  // INSERT AFTER
  // ---------------------------------------------
  insertAfter(targetId, node) {
    const state = get();
    const tree = deepClone(state.tree);

    const parent = findParent(tree, targetId);
    if (!parent) return;

    if (!canParentAccept(parent, node.type)) return;

    const index = parent.children.findIndex((c) => c.id === targetId);
    if (index === -1) return;

    parent.children.splice(index + 1, 0, normalizeNode(node));
    equalizeColumns(parent);

    const normalized = normalizeTree(tree);
    saveHistory(normalized);

    set({ tree: normalized });
  },

  // ---------------------------------------------
  // MOVE NODE
  // ---------------------------------------------
  moveNode(nodeId, newParentId, index = null) {
    const state = get();
    const tree = deepClone(state.tree);

    const removed = removeNode(tree, nodeId);
    if (!removed) return;

    const newParent = findNode(tree, newParentId);
    if (!newParent) return;

    if (!canParentAccept(newParent, removed.type)) return;

    if (index === null) newParent.children.push(removed);
    else newParent.children.splice(index, 0, removed);

    equalizeColumns(newParent);

    const normalized = normalizeTree(tree);
    saveHistory(normalized);

    set({ tree: normalized });
  },

  // ---------------------------------------------
  // DELETE NODE
  // ---------------------------------------------
  deleteNode(id) {
    const state = get();
    const tree = deepClone(state.tree);

    // Cannot delete root page
    if (tree.id === id) return;

    const parent = findParent(tree, id);
    if (!parent) return;

    removeNode(tree, id);
    equalizeColumns(parent);

    const normalized = normalizeTree(tree);
    saveHistory(normalized);

    set({
      tree: normalized,
      selectedId: null,
    });
  },

  // ---------------------------------------------
  // DUPLICATE NODE
  // ---------------------------------------------
  duplicateNode(id) {
    const state = get();
    const tree = deepClone(state.tree);

    const node = findNode(tree, id);
    const parent = findParent(tree, id);
    if (!node || !parent) return;

    const clone = deepClone(node);
    clone.id = nanoid();
    assignParentIds(clone, parent.id);

    const index = parent.children.findIndex((c) => c.id === id);
    parent.children.splice(index + 1, 0, clone);

    equalizeColumns(parent);

    const normalized = normalizeTree(tree);
    saveHistory(normalized);

    set({ tree: normalized });
  },

  // ---------------------------------------------
// UPDATE PROPS (nested, responsive, safe)
// ---------------------------------------------
updateProps(id, partial, device = "desktop") {
  const state = get();
  const tree = deepClone(state.tree);

  const node = findNode(tree, id);
  if (!node) return;

  // Ensure base props object exists
  if (!node.props) node.props = {};

  // (A) If desktop → write to base node.props (nested merge)
  if (device === "desktop") {
    node.props = deepMergeSafe(node.props, partial);
  }

  // (B) If tablet/mobile → write inside responsive slice
  if (device === "tablet" || device === "mobile") {
    ensureResponsivePaths(node);

    const slice =
      device === "tablet"
        ? node.responsive.tablet.props
        : node.responsive.mobile.props;

    const updatedProps = deepMergeSafe(slice, partial);

    if (device === "tablet") {
      node.responsive.tablet.props = updatedProps;
    } else {
      node.responsive.mobile.props = updatedProps;
    }
  }

  // Normalize & save to history
  const normalized = normalizeTree(tree);
  saveHistory(normalized);
  set({ tree: normalized });
},

  // ---------------------------------------------
  // UPDATE STYLE
  // ---------------------------------------------
  updateStyle(id, partial) {
    const state = get();
    const tree = deepClone(state.tree);

    const node = findNode(tree, id);
    if (!node) return;

    node.style = { ...node.style, ...partial };

    const normalized = normalizeTree(tree);
    saveHistory(normalized);
    set({ tree: normalized });
  },

  // ---------------------------------------------
  // UPDATE LAYOUT
  // ---------------------------------------------
  updateLayout(id, partial) {
    const state = get();
    const tree = deepClone(state.tree);

    const node = findNode(tree, id);
    if (!node) return;

    node.layout = { ...node.layout, ...partial };

    const normalized = normalizeTree(tree);
    saveHistory(normalized);
    set({ tree: normalized });
  },

  // ---------------------------------------------
  // UPDATE EFFECTS
  // ---------------------------------------------
  updateEffects(id, partial) {
    const state = get();
    const tree = deepClone(state.tree);

    const node = findNode(tree, id);
    if (!node) return;

    node.effects = { ...node.effects, ...partial };

    const normalized = normalizeTree(tree);
    saveHistory(normalized);
    set({ tree: normalized });
  },

  // ---------------------------------------------
  // HISTORY — UNDO
  // ---------------------------------------------
  undo() {
    const tree = applyUndo();
    if (tree) set({ tree });
  },

  // ---------------------------------------------
  // HISTORY — REDO
  // ---------------------------------------------
  redo() {
    const tree = applyRedo();
    if (tree) set({ tree });
  },

  // ---------------------------------------------
  // LOAD ROOT BLUEPRINT
  // ---------------------------------------------
  load(root) {
    const normalized = normalizeTree(root);
    saveHistory(normalized);

    set({
      tree: normalized,
      selectedId: null,
      hoverId: null,
    });
  },

  // ---------------------------------------------
  // EXPORT BLUEPRINT
  // ---------------------------------------------
  export() {
    return deepClone(get().tree);
  },
}));
