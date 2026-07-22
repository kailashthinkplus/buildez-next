import Video from "./Video";
import VideoDefaults from "./Video.defaults";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const VideoDefinition: WidgetDefinition = {
  type: "video",
  name: "Video",
  category: "media",
  canHaveChildren: false,
  render: Video,
  aiPrompt: "Use a product or brand video with a concise poster frame.",
  defaultNode: {
    type: "video",
    children: [],
    props: VideoDefaults.props,
    style: VideoDefaults.style,
  },
  properties: [
    {
      id: "src",
      label: "Video URL",
      type: "url",
      target: "props",
      category: "content",
      defaultValue: VideoDefaults.props.src,
    },
    {
      id: "poster",
      label: "Poster URL",
      type: "image",
      target: "props",
      category: "content",
      defaultValue: VideoDefaults.props.poster,
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
