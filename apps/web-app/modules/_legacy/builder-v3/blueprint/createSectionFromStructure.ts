"use client";

import { nanoid } from "nanoid";
import {
  BlueprintNode,
  NodeType,
} from "@/modules/builder/blueprint/types";
import type { SectionStructure } from "@/app/app/(builder)/[siteSlug]/[pageSlugWithId]/canvas/SectionStructurePicker";

/* ============================================================
   COLUMN WIDTH PRESETS
============================================================ */

function resolveColumnWidths(
  structure: SectionStructure
): number[] {
  if (structure.columns === 1) return [100];

  if (structure.columns === 2) {
    if (structure.preset === "left-heavy") return [66, 34];
    if (structure.preset === "right-heavy") return [34, 66];
    return [50, 50];
  }

  if (structure.columns === 3) return [33, 34, 33];

  if (structure.columns === 4) return [25, 25, 25, 25];

  return [100];
}

/* ============================================================
   FACTORY HELPERS
============================================================ */

function createContainer(
  props?: Partial<BlueprintNode["props"]>
): BlueprintNode {
  return {
    id: nanoid(),
    type: NodeType.Container,
    props: {
      layout: {
        display: "flex",
        direction: "column",
        gap: 12,
      },
      ...props,
    },
    children: [],
  };
}

/* ============================================================
   MAIN FACTORY
============================================================ */

export function createSectionFromStructure(
  structure: SectionStructure
): BlueprintNode {
  /* ----------------------------------------------------------
     SECTION
  ---------------------------------------------------------- */
  const section: BlueprintNode = {
    id: nanoid(),
    type: NodeType.SectionHero, // default section type
    props: {
      spacing: {
        padding: {
          top: 48,
          right: 24,
          bottom: 48,
          left: 24,
        },
      },
    },
    children: [],
  };

  /* ----------------------------------------------------------
     ROW CONTAINER (holds columns)
  ---------------------------------------------------------- */
  const rowContainer = createContainer({
    layout: {
      display: "flex",
      direction: "row",
      gap: 24,
    },
  });

  /* ----------------------------------------------------------
     COLUMN CONTAINERS
  ---------------------------------------------------------- */
  const widths = resolveColumnWidths(structure);

  widths.forEach((width) => {
    const column = createContainer({
      layout: {
        display: "flex",
        direction: "column",
      },
      style: {
        // 🔑 Elementor-style width control
        // runtime maps this to flex-basis
      },
    });

    // Attach width at layout level
    column.props.layout = {
      ...column.props.layout,
      width: `${width}%`,
    };

    rowContainer.children.push(column);
  });

  /* ----------------------------------------------------------
     ASSEMBLE TREE
  ---------------------------------------------------------- */
  section.children.push(rowContainer);

  return section;
}
