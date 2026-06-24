"use client";

/* ============================================================================
   BUILDEZ BLUEPRINT SUPERSTORE — V3 FINAL (REACTIVE)
   ✔ Immutable
   ✔ DnD-safe
   ✔ Webflow / Elementor-grade
============================================================================ */

import { create } from "zustand";
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { nanoid } from "nanoid";
import { deepClone } from "@/modules/builder/blueprint/utils/deepClone";
import {
  BlueprintNode,
  PageNode,
  NodeType,
} from "@/modules/builder/blueprint/types";
import { createNode } from "@/modules/builder/blueprint/registry";
import { loadBlueprint } from "@/modules/builder/blueprint/loadBlueprint";



/* ============================================================================
   TYPES
============================================================================ */

interface BlueprintIndexEntry {
  id: string;
  parentId: string | null;
  index: number;
}

type BlueprintIndex = Record<string, BlueprintIndexEntry>;

interface TreeState {
  page: PageNode;
  index: BlueprintIndex;
}

interface HistoryState {
  past: TreeState[];
  present: TreeState;
  future: TreeState[];
}

interface PageState {
  shadow: TreeState;
  live: TreeState;
  history: HistoryState;
}

export type DropAction =
  | {
      kind: "INSERT_NEW";
      nodeType: NodeType;
      parentId: string;
      index: number;
      source: "palette";
    }
  | {
      kind: "INSERT_EXISTING";
      nodeId: string;
      parentId: string;
      index: number;
    };

export interface BlueprintStore {
  pages: Record<string, PageState>;
  currentPageId: string | null;
  selectedNodeId: string | null;

  initFromServer: (args: { pageId: string; data: any }) => void;

  createPage: (title?: string) => string;
  deletePage: (id: string) => void;
  switchPage: (id: string) => void;

  findNode: (id: string) => {
    node: BlueprintNode;
    parent: BlueprintNode | null;
    index: number;
  } | null;

  insertNode: (parentId: string, node: BlueprintNode, index: number) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, parentId: string, index: number) => void;

  updateNodeProps: (id: string, props: any) => void;
  replaceNode: (id: string, node: BlueprintNode) => void;

  insertSection: (type: NodeType, index?: number) => void;
  addBlock: (parentId: string, type: NodeType, index?: number) => void;

  duplicateNode: (id: string) => void;
  removeSection: (id: string) => void;
  removeBlock: (id: string) => void;
  

  handleDrop: (action: DropAction) => void;

  commit: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  setSelectedNodeId: (id: string | null) => void;
  /* -------------------------------------------------
   MULTI COLUMN STRUCTURE
------------------------------------------------- */
createColumns: (args: {
  containerId: string;
  preset: {
    columns: number;
    template: string;
  };
}) => void;
}

// Fix the space in the name:
export const useBlueprintStoreShallow = <T>(selector: (state: BlueprintStore) => T) => {
  return useBlueprintStore(selector, shallow);
};

/* ============================================================================
   HELPERS
============================================================================ */

function buildIndex(root: BlueprintNode): BlueprintIndex {
  const index: BlueprintIndex = {};

  function walk(
    node: BlueprintNode,
    parent: BlueprintNode | null,
    position: number
  ) {
    index[node.id] = {
      id: node.id,
      parentId: parent ? parent.id : null,
      index: position,
    };

    node.children?.forEach((child, i) => {
      walk(child, node, i);
    });
  }

  walk(root, null, 0);
  return index;
}

function regenerateIds(node: BlueprintNode) {
  node.id = nanoid();
  node.children?.forEach(regenerateIds);
}

/* ============================================================================
   CANONICAL WRAPPING (ELEMENTOR STYLE)
============================================================================ */

function wrapBlockIntoSection(block: BlueprintNode): BlueprintNode {
  // ✅ GENERIC SECTION (structural only)
const section = createNode(NodeType.SectionFeatures);
  section.id = nanoid();
  section.children = [];

  // ✅ CONTAINER OWNS BLOCKS
  const container = createNode(NodeType.Container);
  container.id = nanoid();
  container.children = [block];

  section.children.push(container);
  return section;
}


/* ============================================================================
   STORE
============================================================================ */

export const useBlueprintStore = create<BlueprintStore>((set, get) => ({
  pages: {},
  currentPageId: null,
  selectedNodeId: null,

  /* -------------------------------------------------------------------------
     INIT
  ------------------------------------------------------------------------- */
  initFromServer: ({ pageId, data }) => {
    console.log("🔵 initFromServer:", { pageId, data });

    // ✅ Use whatever the server sent, even if empty
    const rawPage: PageNode = data.page || {
      id: pageId,
      type: NodeType.Page,
      props: { title: data.page?.title ?? "Untitled Page" },
      children: []  // Truly empty - no default section/container
    };

    const page = loadBlueprint(rawPage);

    const tree: TreeState = {
      page,
      index: buildIndex(page),
    };

    set((s) => ({
      pages: {
        ...s.pages,
        [pageId]: {
          shadow: deepClone(tree),
          live: deepClone(tree),
          history: {
            past: [],
            present: deepClone(tree),
            future: [],
          },
        },
      },
      currentPageId: pageId,
      selectedNodeId: page.id,
    }));
  },

  /* -------------------------------------------------------------------------
     PAGE MGMT
  ------------------------------------------------------------------------- */
  createPage: (title = "New Page") => {
    const id = nanoid();
    const page = createNode(NodeType.Page) as PageNode;
    page.id = id;
    page.props.title = title;
    page.children = [];

    const tree: TreeState = {
      page,
      index: buildIndex(page),
    };

    set((s) => ({
      pages: {
        ...s.pages,
        [id]: {
          shadow: deepClone(tree),
          live: deepClone(tree),
          history: {
            past: [],
            present: deepClone(tree),
            future: [],
          },
        },
      },
      currentPageId: id,
      selectedNodeId: id,
    }));

    return id;
  },

  deletePage: (id) =>
    set((s) => {
      const pages = { ...s.pages };
      delete pages[id];
      const next = Object.keys(pages)[0] ?? null;

      return {
        pages,
        currentPageId: next,
        selectedNodeId: next ? pages[next].live.page.id : null,
      };
    }),

  switchPage: (id) =>
    set((s) =>
      s.pages[id]
        ? {
            currentPageId: id,
            selectedNodeId: s.pages[id].live.page.id,
          }
        : s
    ),

  /* -------------------------------------------------------------------------
     LOOKUP
  ------------------------------------------------------------------------- */
  findNode: (id) => {
    const { currentPageId, pages } = get();
    if (!currentPageId) return null;

    const ps = pages[currentPageId];
    const meta = ps.shadow.index[id];
    if (!meta) return null;

    function walk(
      node: BlueprintNode,
      parent: BlueprintNode | null
    ): { node: BlueprintNode; parent: BlueprintNode | null } | null {
      if (node.id === id) return { node, parent };
      for (const c of node.children ?? []) {
        const hit = walk(c, node);
        if (hit) return hit;
      }
      return null;
    }

    const hit = walk(ps.shadow.page, null);
    if (!hit) return null;

    return { ...hit, index: meta.index };
  },

  /* -------------------------------------------------------------------------
     STRUCTURE (IMMUTABLE)
  ------------------------------------------------------------------------- */
  insertNode: (parentId, node, index) =>
    set((s) => {
      const pid = s.currentPageId!;
      const ps = s.pages[pid];

      function walk(n: BlueprintNode): BlueprintNode {
        if (n.id === parentId) {
          const children = [...(n.children ?? [])];
          children.splice(index, 0, node);
          return { ...n, children };
        }
        return { ...n, children: n.children?.map(walk) };
      }

      const page = walk(ps.shadow.page);
      const tree = { page, index: buildIndex(page) };

      return {
        pages: {
          ...s.pages,
          [pid]: {
            ...ps,
            shadow: tree,
          },
        },
      };
    }),

// -------------------------------------------------------------------------
// DELETE NODE — IMMUTABLE, PERSISTENCE SAFE
// Handles block / container / section
// -------------------------------------------------------------------------
deleteNode: (id) =>
  set((s) => {
    const pid = s.currentPageId;
    if (!pid) return s;

    const ps = s.pages[pid];

    // 🔒 PURE recursive removal — NO mutation
    function remove(node: BlueprintNode): BlueprintNode | null {
      // ❌ Never delete the root Page
      if (node.id === id && node.type === NodeType.Page) {
        console.error("❌ Cannot delete root page node");
        return node;
      }

      // ✅ Match → delete
      if (node.id === id) {
        return null;
      }

      // Leaf node
      if (!node.children || node.children.length === 0) {
        return node;
      }

      // Rebuild children immutably
      const nextChildren = node.children
        .map(remove)
        .filter((c): c is BlueprintNode => c !== null);

      // If nothing changed, reuse node
      if (nextChildren === node.children) {
        return node;
      }

      // Otherwise return new node
      return {
        ...node,
        children: nextChildren,
      };
    }

    const nextPage = remove(ps.shadow.page);

    if (!nextPage) {
      console.error("❌ deleteNode resulted in null page");
      return s;
    }

    return {
      pages: {
        ...s.pages,
        [pid]: {
          ...ps,
          shadow: {
            page: nextPage,
            index: buildIndex(nextPage),
          },
        },
      },
      selectedNodeId:
        s.selectedNodeId === id ? nextPage.id : s.selectedNodeId,
    };
  }),


moveNode: (nodeId: string, targetParentId: string, targetIndex: number) => {
  set((s) => {
    const pid = s.currentPageId;
    if (!pid) return s;

    const ps = s.pages[pid];
    if (!ps) return s;

    // ⛔ Cannot move node into itself
    if (nodeId === targetParentId) return s;

    let movingNode: BlueprintNode | null = null;
    let sourceParentId: string | null = null;
    let sourceIndex = -1;

    /* -------------------------------------------------
       1️⃣ EXTRACT NODE (PURE)
    ------------------------------------------------- */
    function extract(n: BlueprintNode): BlueprintNode {
      if (!n.children) return n;

      const idx = n.children.findIndex((c) => c.id === nodeId);
      if (idx !== -1) {
        movingNode = n.children[idx];
        sourceParentId = n.id;
        sourceIndex = idx;

        return {
          ...n,
          children: [
            ...n.children.slice(0, idx),
            ...n.children.slice(idx + 1),
          ],
        };
      }

      return {
        ...n,
        children: n.children.map(extract),
      };
    }

    let page = extract(ps.shadow.page);

    if (!movingNode || sourceParentId === null) {
      console.error("❌ moveNode: node not found", nodeId);
      return s;
    }

    /* -------------------------------------------------
       2️⃣ SAME-PARENT INDEX FIX (MANDATORY)
    ------------------------------------------------- */
    if (sourceParentId === targetParentId && sourceIndex < targetIndex) {
      targetIndex -= 1;
    }

    /* -------------------------------------------------
       3️⃣ INSERT NODE (PURE, SINGLE TARGET)
    ------------------------------------------------- */
    function insert(n: BlueprintNode): BlueprintNode {
      if (n.id === targetParentId) {
        const children = [...(n.children ?? [])];
        const safeIndex = Math.max(0, Math.min(children.length, targetIndex));
        children.splice(safeIndex, 0, movingNode!);
        return { ...n, children };
      }

      return {
        ...n,
        children: n.children?.map(insert),
      };
    }

    page = insert(page);

    return {
      ...s,
      pages: {
        ...s.pages,
        [pid]: {
          ...ps,
          shadow: {
            page,
            index: buildIndex(page), // must be positional version
          },
        },
      },
      selectedNodeId: movingNode.id,
    };
  });
},


  /* -------------------------------------------------------------------------
     CONTENT
  ------------------------------------------------------------------------- */
  updateNodeProps: (id, props) =>
    set((s) => {
      const pid = s.currentPageId!;
      const ps = s.pages[pid];

      function walk(n: BlueprintNode): BlueprintNode {
        if (n.id === id) {
          return { ...n, props: { ...n.props, ...props } };
        }
        return { ...n, children: n.children?.map(walk) };
      }

      const page = walk(ps.shadow.page);
      const tree = { page, index: buildIndex(page) };

      return {
        pages: {
          ...s.pages,
          [pid]: { ...ps, shadow: tree },
        },
      };
    }),

  replaceNode: (id, node) =>
    set((s) => {
      const pid = s.currentPageId!;
      const ps = s.pages[pid];

      function walk(n: BlueprintNode): BlueprintNode {
        if (n.id === id) return node;
        return { ...n, children: n.children?.map(walk) };
      }

      const page = walk(ps.shadow.page);
      const tree = { page, index: buildIndex(page) };

      return {
        pages: {
          ...s.pages,
          [pid]: { ...ps, shadow: tree },
        },
      };
    }),

  /* -------------------------------------------------------------------------
     HIGH LEVEL
  ------------------------------------------------------------------------- */
  insertSection: (type, index) =>
    set((s) => {
      const pid = s.currentPageId!;
      const ps = s.pages[pid];

      const section = createNode(type);
      section.id = nanoid();
      section.children = [];

      const page = {
        ...ps.shadow.page,
        children: [
          ...ps.shadow.page.children.slice(0, index),
          section,
          ...ps.shadow.page.children.slice(index),
        ],
      };

      return {
        pages: {
          ...s.pages,
          [pid]: {
            ...ps,
            shadow: { page, index: buildIndex(page) },
          },
        },
        selectedNodeId: section.id,
      };
    }),

  addBlock: (parentId, type, index = 0) =>
    get().handleDrop({
      kind: "INSERT_NEW",
      nodeType: type,
      parentId,
      index,
      source: "palette",
    }),

  duplicateNode: (id) => {
    const hit = get().findNode(id);
    if (!hit || !hit.parent) return;

    const clone = deepClone(hit.node);
    regenerateIds(clone);

    get().insertNode(hit.parent.id, clone, hit.index + 1);
    get().setSelectedNodeId(clone.id);
  },

  removeSection: (id) => get().deleteNode(id),
  removeBlock: (id) => get().deleteNode(id),

/* -------------------------------------------------------------------------
   MULTI COLUMN STRUCTURE — CANONICAL
   - Converts container into grid
   - Migrates existing children into first column
   - History-safe
------------------------------------------------------------------------- */
createColumns: ({ containerId, preset }) => {
  set((s) => {
    const pid = s.currentPageId;
    if (!pid) return s;

    const ps = s.pages[pid];

    const createColumn = (): BlueprintNode => ({
      id: nanoid(),
      type: NodeType.Column, // ✅ COLUMN, NOT CONTAINER
      props: {
        spacing: {
          padding: { top: 12, right: 12, bottom: 12, left: 12 }, // ✅ DEFAULT
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        },
        layout: {
          display: "flex",
          direction: "column",
          gap: 12,
        },
        style: {},
        effects: {},
        responsive: {},
      },
      children: [],
    });

    function walk(node: BlueprintNode): BlueprintNode {
      if (node.id === containerId) {
        return {
          ...node,
          props: {
            ...node.props,
            layout: {
              display: "grid",
              gridTemplateColumns: `repeat(${preset.columns}, minmax(0, 1fr))`, // ✅ FIXED
              gap: 24,
            },
            spacing: {
              padding: { top: 12, right: 12, bottom: 12, left: 12 }, // ✅ MIN PADDING
              margin: node.props?.spacing?.margin ?? {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              },
            },
          },
          children: Array.from({ length: preset.columns }, createColumn),
        };
      }

      return {
        ...node,
        children: node.children?.map(walk),
      };
    }

    const page = walk(ps.shadow.page);

    return {
      ...s,
      pages: {
        ...s.pages,
        [pid]: {
          ...ps,
          shadow: {
            page,
            index: buildIndex(page),
          },
        },
      },
      selectedNodeId: containerId,
    };
  });

  get().commit();
},

handleDrop: (action) => {
  console.log("🎯 handleDrop action:", action);
  
  if (action.kind === "INSERT_EXISTING") {
    get().moveNode(action.nodeId, action.parentId, action.index);
    get().commit();
    return;
  }
  
  if (!action.nodeType) {
    console.error("❌ handleDrop called without nodeType", action);
    return;
  }
  
  set((s) => {
    const pid = s.currentPageId;
    if (!pid) {
      console.error("❌ No current page selected");
      return s;
    }
    
    const ps = s.pages[pid];
    if (!ps) {
      console.error("❌ Page not found:", pid);
      return s;
    }
    
    // Create new block
    const block = createNode(action.nodeType);
    block.id = nanoid();
    block.children = [];
    
    // ✅ Search through the tree to find the full parent node
    const findNodeInTree = (nodeId: string, root: BlueprintNode): BlueprintNode | null => {
      if (root.id === nodeId) return root;
      if (!root.children) return null;
      for (const child of root.children) {
        const found = findNodeInTree(nodeId, child);
        if (found) return found;
      }
      return null;
    };
    
    const parentNode = findNodeInTree(action.parentId, ps.shadow.page);
    
    console.log("🔍 action.parentId:", action.parentId);
    console.log("🔍 parentNode found:", parentNode);
    console.log("🔍 parentNode.type:", parentNode?.type);
    console.log("🔍 NodeType.Container:", NodeType.Container);
    console.log("🔍 Is container?", parentNode?.type === NodeType.Container);
    
    const isContainer = parentNode?.type === NodeType.Container;
    const nodeToInsert = isContainer ? block : wrapBlockIntoSection(block);
    
    console.log(
      isContainer
        ? "✅ Adding to existing container"
        : "🎁 Creating new section + container (parent is: " + parentNode?.type + ")"
    );
    
    console.log("🔍 nodeToInsert:", nodeToInsert);
    
    function walk(n: BlueprintNode): BlueprintNode {
      if (n.id === action.parentId) {
        const children = [...(n.children ?? [])];
        children.splice(action.index, 0, nodeToInsert);
        return { ...n, children };
      }
      return {
        ...n,
        children: n.children?.map(walk),
      };
    }
    
    const page = walk(ps.shadow.page);
    const tree = { page, index: buildIndex(page) };
    
    return {
      ...s,
      pages: {
        ...s.pages,
        [pid]: { ...ps, shadow: tree },
      },
      selectedNodeId: block.id,
    };
  });
  
  get().commit();
},

  /* -------------------------------------------------------------------------
     HISTORY
  ------------------------------------------------------------------------- */
  commit: () =>
    set((s) => {
      const pid = s.currentPageId!;
      const ps = s.pages[pid];

      const live: TreeState = {
        page: deepClone(ps.shadow.page),
        index: buildIndex(ps.shadow.page),
      };

      return {
        pages: {
          ...s.pages,
          [pid]: {
            ...ps,
            live,
            history: {
              past: [...ps.history.past, ps.history.present],
              present: live,
              future: [],
            },
          },
        },
      };
    }),

  undo: () =>
    set((s) => {
      const pid = s.currentPageId!;
      const ps = s.pages[pid];
      if (ps.history.past.length === 0) return s;

      const prev = ps.history.past[ps.history.past.length - 1];

      return {
        pages: {
          ...s.pages,
          [pid]: {
            ...ps,
            shadow: deepClone(prev),
            live: prev,
            history: {
              past: ps.history.past.slice(0, -1),
              present: prev,
              future: [ps.history.present, ...ps.history.future],
            },
          },
        },
        selectedNodeId: prev.page.id,
      };
    }),

  redo: () =>
    set((s) => {
      const pid = s.currentPageId!;
      const ps = s.pages[pid];
      if (ps.history.future.length === 0) return s;

      const next = ps.history.future[0];

      return {
        pages: {
          ...s.pages,
          [pid]: {
            ...ps,
            shadow: deepClone(next),
            live: next,
            history: {
              past: [...ps.history.past, ps.history.present],
              present: next,
              future: ps.history.future.slice(1),
            },
          },
        },
        selectedNodeId: next.page.id,
      };
    }),

  canUndo: () => {
    const pid = get().currentPageId;
    return pid ? get().pages[pid].history.past.length > 0 : false;
  },

  canRedo: () => {
    const pid = get().currentPageId;
    return pid ? get().pages[pid].history.future.length > 0 : false;
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));
