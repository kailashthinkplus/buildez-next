import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";

export type ColumnStructurePreset = Readonly<{
  id: string;
  label: string;
  columns: number[];
}>;

export const COLUMN_STRUCTURE_PRESETS: readonly ColumnStructurePreset[] = [
  { id: "1-column", label: "1 column", columns: [100] },
  { id: "2-equal", label: "2 equal", columns: [50, 50] },
  { id: "3-equal", label: "3 equal", columns: [33.333, 33.333, 33.333] },
  { id: "4-equal", label: "4 equal", columns: [25, 25, 25, 25] },
  { id: "30-70", label: "30 / 70", columns: [30, 70] },
  { id: "70-30", label: "70 / 30", columns: [70, 30] },
  { id: "25-75", label: "25 / 75", columns: [25, 75] },
  { id: "75-25", label: "75 / 25", columns: [75, 25] },
  { id: "25-50-25", label: "25 / 50 / 25", columns: [25, 50, 25] },
  { id: "20-60-20", label: "20 / 60 / 20", columns: [20, 60, 20] },
  { id: "sidebar-content", label: "Sidebar / content", columns: [30, 70] },
  { id: "content-sidebar", label: "Content / sidebar", columns: [70, 30] },
] as const;

export function getColumnStructurePreset(id: string): ColumnStructurePreset | undefined {
  return COLUMN_STRUCTURE_PRESETS.find((preset) => preset.id === id);
}

export function normalizeColumnWidths(widths: readonly number[] | number): number[] {
  if (typeof widths === "number") {
    const count = Math.max(1, Math.floor(widths));
    const width = Math.round((100 / count) * 1000) / 1000;
    return Array.from({ length: count }, () => width);
  }

  return widths
    .filter((width) => Number.isFinite(width) && width > 0)
    .map((width) => Math.round(width * 1000) / 1000);
}

export function applyColumnStructureToBlueprint(
  currentBlueprint: BuilderBlueprint,
  targetId: string,
  widthsInput: readonly number[] | number,
  createColumn: (parentId: string) => BuilderNode
): BuilderBlueprint {
  const widths = normalizeColumnWidths(widthsInput);
  const target = currentBlueprint.nodes[targetId];

  if (!target || widths.length === 0 || !["page", "section", "container", "column"].includes(target.type)) {
    return currentBlueprint;
  }

  const nodes = { ...currentBlueprint.nodes };
  const existingChildren = [...target.children];
  const contentChildren: string[] = [];

  for (const childId of existingChildren) {
    const child = nodes[childId];
    if (!child) continue;

    if (child.type === "column") {
      contentChildren.push(...child.children);
      delete nodes[childId];
    } else {
      contentChildren.push(childId);
    }
  }

  const columnIds = widths.map((width) => {
    const column = createColumn(targetId);
    const widthValue = `${Math.round(width * 1000) / 1000}%`;

    nodes[column.id] = {
      ...column,
      parentId: targetId,
      props: {
        ...column.props,
        layout: "vertical",
      },
      style: {
        ...column.style,
        width: widthValue,
        // Ratios are represented as flex-grow weights so gaps do not push a
        // nominal 100% row beyond the canvas or published viewport.
        flex: `${width} 1 0px`,
        maxWidth: undefined,
        minHeight: column.style?.minHeight ?? 120,
        minWidth: 0,
      },
    };

    return column.id;
  });

  const firstColumn = nodes[columnIds[0]];
  if (firstColumn) {
    nodes[firstColumn.id] = {
      ...firstColumn,
      children: contentChildren,
    };

    for (const childId of contentChildren) {
      const child = nodes[childId];
      if (child) {
        nodes[childId] = {
          ...child,
          parentId: firstColumn.id,
        };
      }
    }
  }

  nodes[target.id] = {
    ...target,
    children: columnIds,
    props: {
      ...target.props,
      layout: "flex",
      direction: "row",
    },
    style: {
      ...target.style,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: target.style?.alignItems ?? "flex-start",
      gap: target.style?.gap ?? 16,
    },
  };

  return {
    ...currentBlueprint,
    metadata: {
      ...currentBlueprint.metadata,
      updatedAt: new Date().toISOString(),
    },
    nodes,
  };
}
