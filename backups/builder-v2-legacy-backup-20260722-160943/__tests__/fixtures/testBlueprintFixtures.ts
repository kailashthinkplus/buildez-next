import type { BuilderBlueprint, BuilderNode, NodeType } from "../../types/blueprint";

const NOW = "2026-07-08T00:00:00.000Z";

export const TEST_NODE_IDS = {
  root: "test-page",
  section: "test-section",
  container: "test-container",
  columnA: "test-column-a",
  columnB: "test-column-b",
  heading: "test-heading",
  text: "test-text",
  button: "test-button",
  image: "test-image",
} as const;

export function createTestNode(
  id: string,
  type: NodeType,
  parentId: string | null,
  overrides: Partial<BuilderNode> = {}
): BuilderNode {
  return {
    id,
    type,
    parentId,
    children: [],
    props: {},
    style: {},
    ...overrides,
  };
}

export function createPrimitiveBlueprint(): BuilderBlueprint {
  const nodes: Record<string, BuilderNode> = {
    [TEST_NODE_IDS.root]: createTestNode(TEST_NODE_IDS.root, "page", null, {
      name: "Test Page",
      children: [TEST_NODE_IDS.section],
      props: { widthMode: "full" },
      style: { minHeight: "100vh", backgroundColor: "#ffffff" },
    }),
    [TEST_NODE_IDS.section]: createTestNode(TEST_NODE_IDS.section, "section", TEST_NODE_IDS.root, {
      name: "Hero Section",
      children: [TEST_NODE_IDS.container],
      props: { widthMode: "boxed", maxWidth: "1200px" },
      style: { paddingTop: 64, paddingBottom: 64 },
    }),
    [TEST_NODE_IDS.container]: createTestNode(TEST_NODE_IDS.container, "container", TEST_NODE_IDS.section, {
      children: [TEST_NODE_IDS.columnA, TEST_NODE_IDS.columnB],
      props: { layout: "flex", direction: "row", gap: 24 },
      style: { display: "flex", flexDirection: "row", gap: 24 },
    }),
    [TEST_NODE_IDS.columnA]: createTestNode(TEST_NODE_IDS.columnA, "column", TEST_NODE_IDS.container, {
      children: [TEST_NODE_IDS.heading, TEST_NODE_IDS.text, TEST_NODE_IDS.button],
      props: { layout: "vertical" },
      style: { width: "50%", flex: "0 0 50%" },
    }),
    [TEST_NODE_IDS.columnB]: createTestNode(TEST_NODE_IDS.columnB, "column", TEST_NODE_IDS.container, {
      children: [TEST_NODE_IDS.image],
      props: { layout: "vertical" },
      style: { width: "50%", flex: "0 0 50%" },
    }),
    [TEST_NODE_IDS.heading]: createTestNode(TEST_NODE_IDS.heading, "heading", TEST_NODE_IDS.columnA, {
      props: { text: "Build faster", level: "h1" },
      style: {
        fontSize: { desktop: 56, tablet: 44, mobile: 34 },
        color: "text.primary",
      },
    }),
    [TEST_NODE_IDS.text]: createTestNode(TEST_NODE_IDS.text, "text", TEST_NODE_IDS.columnA, {
      props: { text: "A regression fixture for native Builder nodes.", html: "<p>A regression fixture for native Builder nodes.</p>" },
      style: { fontSize: { desktop: 18, mobile: 16 } },
    }),
    [TEST_NODE_IDS.button]: createTestNode(TEST_NODE_IDS.button, "button", TEST_NODE_IDS.columnA, {
      props: {
        label: "Start",
        text: "Start",
        href: "#start",
        url: "#start",
        advanced: {
          accessibility: {
            ariaLabel: "Start action",
          },
        },
      },
      style: { backgroundColor: "primary.500", color: "white", borderRadius: 12 },
    }),
    [TEST_NODE_IDS.image]: createTestNode(TEST_NODE_IDS.image, "image", TEST_NODE_IDS.columnB, {
      props: { src: "https://example.com/image.jpg", alt: "Example" },
      style: { width: "100%", aspectRatio: "16 / 9", objectFit: "cover" },
    }),
  };

  return {
    metadata: {
      version: 2,
      title: "Primitive Builder Fixture",
      createdAt: NOW,
      updatedAt: NOW,
    },
    theme: {
      id: "test-theme",
      name: "Test Theme",
      preset: "test",
      tokens: {
        colors: {
          primary: "#2563eb",
          text: "#0f172a",
          background: "#ffffff",
        },
      },
    },
    root: TEST_NODE_IDS.root,
    nodes,
  };
}

export function createInvalidMissingRootBlueprint(): unknown {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    root: "missing-root",
  };
}

export function createInvalidParentLinkBlueprint(): BuilderBlueprint {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      [TEST_NODE_IDS.heading]: {
        ...blueprint.nodes[TEST_NODE_IDS.heading],
        parentId: "missing-parent",
      },
    },
  };
}

export function createDuplicateNodeIdBlueprint(): BuilderBlueprint {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      "duplicate-heading-key": {
        ...blueprint.nodes[TEST_NODE_IDS.heading],
      },
    },
  };
}

export function createOrphanNodeBlueprint(): BuilderBlueprint {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      "orphan-text": createTestNode("orphan-text", "text", null, {
        props: { html: "<p>Orphan</p>" },
      }),
    },
  };
}

export function createCycleBlueprint(): BuilderBlueprint {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      [TEST_NODE_IDS.section]: {
        ...blueprint.nodes[TEST_NODE_IDS.section],
        children: [TEST_NODE_IDS.container, TEST_NODE_IDS.root],
      },
      [TEST_NODE_IDS.root]: {
        ...blueprint.nodes[TEST_NODE_IDS.root],
        parentId: TEST_NODE_IDS.section,
      },
    },
  };
}

export function createInvalidChildRelationshipBlueprint(): BuilderBlueprint {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      [TEST_NODE_IDS.root]: {
        ...blueprint.nodes[TEST_NODE_IDS.root],
        children: [TEST_NODE_IDS.text],
      },
      [TEST_NODE_IDS.text]: {
        ...blueprint.nodes[TEST_NODE_IDS.text],
        parentId: TEST_NODE_IDS.root,
      },
    },
  };
}

export function createMissingChildReferenceBlueprint(): BuilderBlueprint {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      [TEST_NODE_IDS.columnA]: {
        ...blueprint.nodes[TEST_NODE_IDS.columnA],
        children: [...blueprint.nodes[TEST_NODE_IDS.columnA].children, "missing-child"],
      },
    },
  };
}

export function createMissingDefaultsBlueprint(): BuilderBlueprint {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      [TEST_NODE_IDS.text]: {
        ...blueprint.nodes[TEST_NODE_IDS.text],
        props: undefined as unknown as BuilderNode["props"],
        style: undefined as unknown as BuilderNode["style"],
      },
    },
  };
}

export function createResponsiveBlueprint(): BuilderBlueprint {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      [TEST_NODE_IDS.container]: {
        ...blueprint.nodes[TEST_NODE_IDS.container],
        style: {
          ...blueprint.nodes[TEST_NODE_IDS.container].style,
          width: {
            desktop: "100%",
            tablet: "92%",
            mobile: "100%",
          },
          gap: {
            desktop: 32,
            tablet: 24,
            mobile: 16,
          },
        },
      },
    },
  };
}

export const BUILDER_REGRESSION_FIXTURES = {
  primitive: createPrimitiveBlueprint,
  invalidMissingRoot: createInvalidMissingRootBlueprint,
  invalidParentLink: createInvalidParentLinkBlueprint,
  duplicateNodeId: createDuplicateNodeIdBlueprint,
  orphanNode: createOrphanNodeBlueprint,
  cycle: createCycleBlueprint,
  invalidChildRelationship: createInvalidChildRelationshipBlueprint,
  missingChildReference: createMissingChildReferenceBlueprint,
  missingDefaults: createMissingDefaultsBlueprint,
  responsive: createResponsiveBlueprint,
};
