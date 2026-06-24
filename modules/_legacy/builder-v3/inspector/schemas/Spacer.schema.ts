import { InspectorSchema } from "../types";
import * as F from "../fields";

const SpacerSchema: InspectorSchema = {
  content: [],

  style: [],

  layout: [
    {
      title: "Height",
      fields: [
        {
          name: "props.layout.height",
          label: "Height",
          type: "number",
          component: F.NumberField,
          min: 0,
          max: 2000,
        },
      ],
    },
  ],

  effects: [],
};

export default SpacerSchema;
