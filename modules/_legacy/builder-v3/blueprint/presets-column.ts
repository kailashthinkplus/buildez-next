import { NodeType, BlueprintPreset } from "./types";
import { nanoid } from "nanoid";

export const ColumnPreset: BlueprintPreset = {
  type: NodeType.Column,

  create: () => ({
    id: nanoid(),
    type: NodeType.Column,
    props: {
      layout: {
        display: "flex",
        direction: "column",
        gap: 16,
      },
      spacing: {
        padding: {
          top: 12,
          right: 12,
          bottom: 12,
          left: 12,
        },
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};
