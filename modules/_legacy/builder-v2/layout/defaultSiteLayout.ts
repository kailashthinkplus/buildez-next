import { BlueprintNode } from "../renderer/PageRenderer";

export const defaultHeaderBlueprint: BlueprintNode = {
  id: "site-header",
  type: "section",
  props: { role: "header" },
  children: [
    {
      id: "header-container",
      type: "container",
      children: [
        {
          id: "logo",
          type: "heading",
          props: { text: "Your Brand", level: "h3" },
        },
        {
          id: "nav",
          type: "text",
          props: { text: "Home  About  Contact" },
        },
      ],
    },
  ],
};

export const defaultFooterBlueprint: BlueprintNode = {
  id: "site-footer",
  type: "section",
  props: { role: "footer" },
  children: [
    {
      id: "footer-text",
      type: "text",
      props: { text: "© Your Company. All rights reserved." },
    },
  ],
};
