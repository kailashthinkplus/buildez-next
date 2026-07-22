import Page from "./Page";
import PageDefaults from "./Page.defaults";
import PageAIPrompt from "./Page.ai";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const PageDefinition: WidgetDefinition = {
  type: "page",

  name: "Page",

  category: "layout",

  canHaveChildren: true,

  render: Page,

  aiPrompt: PageAIPrompt,

  defaultNode: {
    type: "page",

    children: [],

    props: PageDefaults.props,

    style: PageDefaults.style,
  },

  properties: [],
};