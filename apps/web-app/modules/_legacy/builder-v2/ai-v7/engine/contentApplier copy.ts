// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/contentApplier.ts

import type { BlueprintNode } from "@/modules/builder/types";

/* ============================================================
   CONTENT APPLIER — V7 (ENHANCED)
   - Fills headings, text, AND buttons
   - Supports multiple content blocks per section
   - Format: "Heading || Paragraph || Button1 | Button2"
============================================================ */

interface ParsedContent {
  heading?: string;
  subheading?: string;
  text?: string;
  buttons?: string[];
}

/**
 * Parse section content from AI
 * Expected formats:
 *   "Headline || Supporting paragraph"
 *   "Headline || Subheadline || Paragraph || Button1 | Button2"
 */
function parseSectionContent(value: string): ParsedContent {
  if (!value) return {};

  const parts = value.split("||").map(v => v.trim());
  
  const result: ParsedContent = {};

  if (parts.length >= 1) {
    result.heading = parts[0];
  }

  if (parts.length >= 2) {
    // Check if second part looks like buttons (contains |)
    if (parts[1].includes("|") && parts.length === 2) {
      result.buttons = parts[1].split("|").map(b => b.trim()).filter(Boolean);
    } else {
      result.text = parts[1];
    }
  }

  if (parts.length >= 3) {
    // Third part could be more text or buttons
    if (parts[2].includes("|")) {
      result.buttons = parts[2].split("|").map(b => b.trim()).filter(Boolean);
    } else {
      // If we already have text, this becomes subheading situation
      result.subheading = result.text;
      result.text = parts[2];
    }
  }

  if (parts.length >= 4) {
    result.buttons = parts[3].split("|").map(b => b.trim()).filter(Boolean);
  }

  return result;
}

/**
 * Generate contextual button labels based on section intent
 */
function getDefaultButtonLabels(intent?: string): string[] {
  const labels: Record<string, string[]> = {
    hero: ["Get Started", "Learn More"],
    cta: ["Contact Us", "Schedule a Call"],
    pricing: ["View Plans", "Start Free Trial"],
    features: ["Explore Features", "See Demo"],
    services: ["Our Services", "Get Quote"],
    contact: ["Send Message", "Call Now"],
    about: ["Our Story", "Meet the Team"],
    gallery: ["View Gallery", "See Projects"],
    testimonials: ["Read Reviews", "Our Clients"],
  };

  return labels[intent ?? ""] ?? ["Learn More", "Contact Us"];
}

export function applyContent(
  page: BlueprintNode,
  contentMap: Record<string, string>
): BlueprintNode {

  function walk(
    node: BlueprintNode,
    ctx: {
      sectionId?: string;
      sectionIntent?: string;
      headingIndex: number;
      textIndex: number;
      buttonIndex: number;
      parsedContent?: ParsedContent;
    }
  ): BlueprintNode {
    let nextCtx = { ...ctx };

    /* ----------------------------------------------------------
       SECTION — RESET CONTEXT
    ---------------------------------------------------------- */
    if (node.type === "section" && node.props?.role !== "header" && node.props?.role !== "footer") {
      const sectionId = node.props?.sectionName || node.id;
      const raw = contentMap[sectionId];
      
      nextCtx = {
        sectionId,
        sectionIntent: node.props?.intent,
        headingIndex: 0,
        textIndex: 0,
        buttonIndex: 0,
        parsedContent: parseSectionContent(raw ?? ""),
      };
    }

    /* ----------------------------------------------------------
       HEADING
    ---------------------------------------------------------- */
    if (
      node.type === "heading" &&
      nextCtx.sectionId &&
      !node.props?.text
    ) {
      const content = nextCtx.parsedContent;
      let newText: string | undefined;

      if (nextCtx.headingIndex === 0 && content?.heading) {
        newText = content.heading;
      } else if (nextCtx.headingIndex === 1 && content?.subheading) {
        newText = content.subheading;
      }

      nextCtx.headingIndex++;

      if (newText) {
        return {
          ...node,
          props: {
            ...node.props,
            text: newText,
          },
        };
      }
    }

    /* ----------------------------------------------------------
       TEXT / PARAGRAPH
    ---------------------------------------------------------- */
    if (
      node.type === "text" &&
      nextCtx.sectionId &&
      !node.props?.text &&
      !node.props?.html
    ) {
      const content = nextCtx.parsedContent;

      if (nextCtx.textIndex === 0 && content?.text) {
        nextCtx.textIndex++;
        return {
          ...node,
          props: {
            ...node.props,
            text: content.text,
          },
        };
      }

      nextCtx.textIndex++;
    }

    /* ----------------------------------------------------------
       BUTTON — CONTEXTUAL LABELS
    ---------------------------------------------------------- */
    if (
      node.type === "button" &&
      nextCtx.sectionId &&
      (!node.props?.label || node.props?.label === "Button")
    ) {
      const content = nextCtx.parsedContent;
      const defaultLabels = getDefaultButtonLabels(nextCtx.sectionIntent);
      
      // Use AI-provided buttons or fall back to contextual defaults
      const availableLabels = content?.buttons?.length 
        ? content.buttons 
        : defaultLabels;

      const label = availableLabels[nextCtx.buttonIndex] ?? availableLabels[0] ?? "Learn More";
      
      nextCtx.buttonIndex++;

      return {
        ...node,
        props: {
          ...node.props,
          label,
        },
      };
    }

    /* ----------------------------------------------------------
       RECURSE
    ---------------------------------------------------------- */
    if (!node.children?.length) return node;

    return {
      ...node,
      children: node.children.map(child => walk(child, nextCtx)),
    };
  }

  return walk(structuredClone(page), {
    headingIndex: 0,
    textIndex: 0,
    buttonIndex: 0,
  });
}