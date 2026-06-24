import Image from "./Image";
import ImageDefaults from "./Image.defaults";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const ImageDefinition: WidgetDefinition = {
  type: "image",
  name: "Image",
  category: "media",
  canHaveChildren: false,
  render: Image,
  aiPrompt: "Use an image to reinforce section messaging.",
  defaultNode: {
    type: "image",
    children: [],
    props: ImageDefaults.props,
    style: ImageDefaults.style,
  },
  properties: [
    {
      id: "src",
      label: "Image URL",
      type: "image",
      target: "props",
      category: "content",
      aiEditable: true,
      defaultValue: ImageDefaults.props.src,
    },
    {
      id: "alt",
      label: "Alt Text",
      type: "text",
      target: "props",
      category: "content",
      defaultValue: ImageDefaults.props.alt,
    },
    {
      id: "borderRadius",
      label: "Radius",
      type: "slider",
      target: "style",
      category: "style",
      defaultValue: 12,
      min: 0,
      max: 64,
    },
  ],
};
