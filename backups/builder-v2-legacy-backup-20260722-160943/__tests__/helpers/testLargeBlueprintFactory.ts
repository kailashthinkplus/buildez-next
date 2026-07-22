import type { BuilderBlueprint, BuilderNode, NodeType } from "../../types/blueprint";

const BASE_DATE = "2026-07-08T00:00:00.000Z";

type LargeBlueprintOptions = {
  targetNodeCount: number;
  sectionCount?: number;
  imageEvery?: number;
  responsive?: boolean;
  title?: string;
};

type NodeInput = {
  id: string;
  type: NodeType;
  parentId: string | null;
  children?: string[];
  props?: Record<string, unknown>;
  style?: BuilderNode["style"];
  name?: string;
};

export function createLargeBlueprint(options: LargeBlueprintOptions): BuilderBlueprint {
  const nodes: Record<string, BuilderNode> = {};
  const rootId = "stress-page";
  nodes[rootId] = node({
    id: rootId,
    type: "page",
    parentId: null,
    children: [],
    name: "Stress Page",
    style: { minHeight: "100vh" },
  });

  const sectionCount = options.sectionCount ?? Math.max(1, Math.ceil(options.targetNodeCount / 10));
  let created = 1;

  for (let sectionIndex = 0; sectionIndex < sectionCount && created < options.targetNodeCount; sectionIndex += 1) {
    const sectionId = `stress-section-${sectionIndex}`;
    append(nodes, rootId, node({
      id: sectionId,
      type: "section",
      parentId: rootId,
      name: `Stress Section ${sectionIndex}`,
      style: {
        paddingTop: options.responsive ? { desktop: 64, tablet: 48, mobile: 32 } : 48,
        paddingBottom: options.responsive ? { desktop: 64, tablet: 48, mobile: 32 } : 48,
      },
    }));
    created += 1;

    const containerId = `${sectionId}-container`;
    if (created >= options.targetNodeCount) break;
    append(nodes, sectionId, node({
      id: containerId,
      type: "container",
      parentId: sectionId,
      props: { layout: "flex", direction: "row" },
      style: {
        display: "flex",
        gap: options.responsive ? { desktop: 32, tablet: 24, mobile: 16 } : 24,
        width: "100%",
      },
    }));
    created += 1;

    while (created < options.targetNodeCount && nodes[containerId].children.length < 8) {
      const localIndex = nodes[containerId].children.length;
      const type = options.imageEvery && created % options.imageEvery === 0 ? "image" : localIndex % 3 === 0 ? "heading" : localIndex % 3 === 1 ? "text" : "button";
      append(nodes, containerId, createContentNode(type, `${containerId}-${type}-${localIndex}`, containerId, created));
      created += 1;
    }
  }

  return blueprint(nodes, rootId, options.title ?? `Stress ${options.targetNodeCount}`);
}

export function createExactNodeCountBlueprint(targetNodeCount: number): BuilderBlueprint {
  return createLargeBlueprint({
    targetNodeCount,
    sectionCount: Math.max(1, Math.ceil((targetNodeCount - 1) / 10)),
    responsive: true,
    title: `Exact ${targetNodeCount} Node Stress Blueprint`,
  });
}

export function createHundredSectionBlueprint(): BuilderBlueprint {
  return createLargeBlueprint({
    targetNodeCount: 301,
    sectionCount: 100,
    responsive: true,
    title: "100 Section Stress Blueprint",
  });
}

export function createDeepNestingBlueprint(depth: number): BuilderBlueprint {
  const nodes: Record<string, BuilderNode> = {};
  const rootId = "deep-page";
  nodes[rootId] = node({ id: rootId, type: "page", parentId: null, children: [] });

  let parentId = rootId;
  for (let level = 1; level <= depth; level += 1) {
    const id = `deep-container-${level}`;
    append(nodes, parentId, node({
      id,
      type: level === 1 ? "section" : "container",
      parentId,
      props: { layout: "flex", direction: "column" },
      style: { padding: 8, gap: 8 },
    }));
    parentId = id;
  }

  append(nodes, parentId, createContentNode("text", "deep-leaf-text", parentId, depth + 1));
  return blueprint(nodes, rootId, `Deep Nesting ${depth}`);
}

export function createImageHeavyBlueprint(imageCount: number): BuilderBlueprint {
  const targetNodeCount = imageCount * 3 + 2;
  return createLargeBlueprint({
    targetNodeCount,
    sectionCount: Math.max(1, Math.ceil(imageCount / 4)),
    imageEvery: 2,
    responsive: true,
    title: `${imageCount} Image Stress Blueprint`,
  });
}

export function createDuplicatedSectionBlueprint(duplicateCount: number): BuilderBlueprint {
  const nodes: Record<string, BuilderNode> = {};
  const rootId = "duplicate-page";
  nodes[rootId] = node({ id: rootId, type: "page", parentId: null, children: [] });

  for (let index = 0; index < duplicateCount; index += 1) {
    const sectionId = `duplicate-section-${index}`;
    const containerId = `${sectionId}-container`;
    append(nodes, rootId, node({ id: sectionId, type: "section", parentId: rootId, style: { padding: 48 } }));
    append(nodes, sectionId, node({ id: containerId, type: "container", parentId: sectionId, props: { layout: "flex" }, style: { gap: 16 } }));
    append(nodes, containerId, createContentNode("heading", `${containerId}-heading`, containerId, index));
    append(nodes, containerId, createContentNode("text", `${containerId}-text`, containerId, index));
    append(nodes, containerId, createContentNode("button", `${containerId}-button`, containerId, index));
  }

  return blueprint(nodes, rootId, `${duplicateCount} Duplicated Sections`);
}

export function createAiGeneratedPageShape(sectionCount = 24): BuilderBlueprint {
  const nodes: Record<string, BuilderNode> = {};
  const rootId = "ai-shape-page";
  nodes[rootId] = node({
    id: rootId,
    type: "page",
    parentId: null,
    children: [],
    props: { generatedBy: "stress-fixture" },
  });

  for (let index = 0; index < sectionCount; index += 1) {
    const sectionId = `ai-section-${index}`;
    const containerId = `${sectionId}-container`;
    append(nodes, rootId, node({
      id: sectionId,
      type: "section",
      parentId: rootId,
      props: { aiRole: index === 0 ? "hero" : "content-section", regenerationId: `regen-${index}` },
      style: {
        paddingTop: { desktop: 72, tablet: 56, mobile: 36 },
        paddingBottom: { desktop: 72, tablet: 56, mobile: 36 },
      },
    }));
    append(nodes, sectionId, node({
      id: containerId,
      type: "container",
      parentId: sectionId,
      props: { layout: "flex", direction: index % 2 === 0 ? "row" : "column" },
      style: { gap: { desktop: 32, tablet: 24, mobile: 16 } },
    }));
    append(nodes, containerId, createContentNode("heading", `${containerId}-heading`, containerId, index));
    append(nodes, containerId, createContentNode("text", `${containerId}-text`, containerId, index));
    append(nodes, containerId, createContentNode(index % 4 === 0 ? "image" : "button", `${containerId}-action`, containerId, index));
  }

  return blueprint(nodes, rootId, "AI Generated Page Shape Stress Blueprint");
}

function blueprint(nodes: Record<string, BuilderNode>, root: string, title: string): BuilderBlueprint {
  return {
    metadata: {
      version: 2,
      title,
      createdAt: BASE_DATE,
      updatedAt: BASE_DATE,
      aiGenerated: title.includes("AI"),
    },
    theme: {
      id: "stress-theme",
      name: "Stress Theme",
      preset: "stress",
      tokens: {
        colors: { primary: "#2563eb", text: "#0f172a", background: "#ffffff" },
        spacing: { section: 72 },
      },
    },
    root,
    nodes,
  };
}

function node(input: NodeInput): BuilderNode {
  return {
    id: input.id,
    type: input.type,
    name: input.name,
    parentId: input.parentId,
    children: input.children ?? [],
    props: input.props ?? {},
    style: input.style ?? {},
  };
}

function append(nodes: Record<string, BuilderNode>, parentId: string, child: BuilderNode): void {
  nodes[child.id] = child;
  nodes[parentId] = {
    ...nodes[parentId],
    children: [...nodes[parentId].children, child.id],
  };
}

function createContentNode(type: NodeType, id: string, parentId: string, seed: number): BuilderNode {
  if (type === "image") {
    return node({
      id,
      type: "image",
      parentId,
      props: { src: `https://example.com/stress-${seed}.jpg`, alt: `Stress image ${seed}` },
      style: { width: "100%", aspectRatio: "16 / 9", objectFit: "cover" },
    });
  }

  if (type === "button") {
    return node({
      id,
      type: "button",
      parentId,
      props: { label: `Action ${seed}`, text: `Action ${seed}`, href: "#", url: "#" },
      style: { backgroundColor: "primary.500", color: "white", padding: "12px 18px" },
    });
  }

  if (type === "heading") {
    return node({
      id,
      type: "heading",
      parentId,
      props: { text: `Stress heading ${seed}`, level: seed % 5 === 0 ? "h2" : "h3" },
      style: { fontSize: { desktop: 36, tablet: 30, mobile: 24 }, color: "text.primary" },
    });
  }

  return node({
    id,
    type: "text",
    parentId,
    props: { text: `Stress paragraph ${seed}`, html: `<p>Stress paragraph ${seed}</p>` },
    style: { fontSize: { desktop: 18, mobile: 16 } },
  });
}
