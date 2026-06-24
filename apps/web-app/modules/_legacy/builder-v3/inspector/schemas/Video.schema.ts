import { InspectorSchema } from "../types";
import * as F from "../fields";

const VideoSchema: InspectorSchema = {
  content: [
    {
      title: "Video",
      fields: [
        {
          name: "props.content.src",
          label: "Video Source",
          type: "text",
          component: F.TextField,
        },
        {
          name: "props.content.autoplay",
          label: "Autoplay",
          type: "switch",
          component: F.SwitchField,
        },
        {
          name: "props.content.controls",
          label: "Show Controls",
          type: "switch",
          component: F.SwitchField,
        },
      ],
    },
  ],

  style: [],

  layout: [
    {
      title: "Size",
      fields: [
        {
          name: "props.layout.height",
          label: "Height",
          type: "number",
          component: F.NumberField,
        },
      ],
    },
  ],

  effects: [],
};

export default VideoSchema;
