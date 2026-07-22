import Section from "./Section";
import SectionDefaults from "./Section.defaults";
import SectionAIPrompt from "./Section.ai";

import { WidgetDefinition } from "../../core/registry/WidgetRegistry";

export const SectionDefinition: WidgetDefinition = {

  type: "section",

  name: "Section",

  category: "layout",

  canHaveChildren: true,

  render: Section,

  aiPrompt: SectionAIPrompt,

  defaultNode: {
    type: "section",

    children: [],

    props: SectionDefaults.props,

    style: SectionDefaults.style,
  },

  properties: [],

};