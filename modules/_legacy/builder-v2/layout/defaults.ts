import { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

/* ============================================================
   DEFAULT HEADER
============================================================ */

export const DEFAULT_HEADER: BlueprintNode = {
  id: "site-header",
  type: "section",
  props: {
    style: {
      padding: "16px 24px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
  },
  children: [
    {
      id: "header-container",
      type: "container",
      children: [
        {
          id: "header-title",
          type: "heading",
          props: {
            level: "h4",
            text: "Site Name",
          },
        },
      ],
    },
  ],
};

/* ============================================================
   DEFAULT FOOTER
============================================================ */

export const DEFAULT_FOOTER: BlueprintNode = {
  id: "site-footer",
  type: "section",
  props: {
    style: {
      padding: "24px",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    },
  },
  children: [
    {
      id: "footer-text",
      type: "text",
      props: {
        text: "© Your Company. All rights reserved.",
      },
    },
  ],
};
