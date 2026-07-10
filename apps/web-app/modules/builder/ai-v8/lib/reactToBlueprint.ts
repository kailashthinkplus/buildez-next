// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v8/lib/reactToBlueprint.ts

import { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ============================================================
   MAIN PARSER - TSX CODE → BLUEPRINT NODES
============================================================ */

export function parseReactToBlueprint(
  tsxCode: string,
  parentId: string
): BlueprintNode[] {
  console.log("[ReactParser] Starting parse...", {
    codeLength: tsxCode.length,
    parentId,
  });

  // Clean the code
  let cleanCode = tsxCode.trim();
  
  // Remove "use client" directive
  cleanCode = cleanCode.replace(/^["']use client["'];?\s*/gi, "");

  // Extract JSX from return statement
  let jsxContent = extractJSXFromReturn(cleanCode);
  
  if (!jsxContent) {
    console.error("[ReactParser] Could not extract JSX from return statement");
    console.log("[ReactParser] Code preview:", cleanCode.substring(0, 500));
    
    // Try to find any JSX-like content
    const jsxMatch = cleanCode.match(/<div[^>]*>[\s\S]*<\/div>/);
    if (jsxMatch) {
      jsxContent = jsxMatch[0];
      console.log("[ReactParser] Found JSX via fallback regex");
    } else {
      console.error("[ReactParser] No JSX found, creating fallback");
      return createFallbackSection(cleanCode, parentId);
    }
  }

  console.log("[ReactParser] ✅ Extracted JSX content length:", jsxContent.length);

  return parseJSXContent(jsxContent, parentId);
}

/* ============================================================
   ✅ EXTRACT JSX FROM RETURN STATEMENT (FIXED - BALANCED PARENS)
============================================================ */

function extractJSXFromReturn(code: string): string | null {
  // Find the return statement
  const returnIndex = code.indexOf('return');
  if (returnIndex === -1) {
    console.error("[extractJSXFromReturn] No 'return' keyword found");
    return null;
  }

  let startIndex = code.indexOf('(', returnIndex);
  
  if (startIndex === -1) {
    // No opening paren - check for return <jsx>
    console.log("[extractJSXFromReturn] No opening paren, looking for direct JSX");
    const match = code.match(/return\s*(<[\s\S]+)/);
    if (match) {
      // Find the end (before the closing } of function)
      const jsx = match[1];
      const lastBrace = jsx.lastIndexOf('}');
      if (lastBrace !== -1) {
        return jsx.substring(0, lastBrace).trim();
      }
      return jsx.trim();
    }
    return null;
  }

  // Handle balanced parentheses
  startIndex++; // Move past the opening (
  let depth = 1;
  let endIndex = startIndex;

  console.log("[extractJSXFromReturn] Parsing balanced parentheses from index", startIndex);

  while (depth > 0 && endIndex < code.length) {
    const char = code[endIndex];
    
    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
    }
    
    endIndex++;
  }

  if (depth === 0) {
    const extracted = code.substring(startIndex, endIndex - 1).trim();
    console.log("[extractJSXFromReturn] ✅ Successfully extracted JSX, length:", extracted.length);
    return extracted;
  }

  console.error("[extractJSXFromReturn] Could not find matching closing paren, depth:", depth);
  return null;
}

/* ============================================================
   PARSE JSX CONTENT
============================================================ */

function parseJSXContent(jsxContent: string, parentId: string): BlueprintNode[] {
  const nodes: BlueprintNode[] = [];

  // Remove outer wrapper divs (only the outermost one)
  jsxContent = unwrapOuterDiv(jsxContent);

  console.log("[ReactParser] After unwrapping (first 300 chars):", jsxContent.substring(0, 300));

  // Parse navigation
  const navMatches = extractTopLevelElement(jsxContent, "nav");
  console.log("[ReactParser] Found", navMatches.length, "nav elements");
  if (navMatches.length > 0) {
    console.log("[ReactParser] Skipping standalone navigation; app shell owns site nav");
  }

  // Parse header/hero
  const headerMatches = extractTopLevelElement(jsxContent, "header");
  console.log("[ReactParser] Found", headerMatches.length, "header elements");
  if (headerMatches.length > 0 && /id=["']hero["']/i.test(headerMatches[0])) {
    nodes.push(parseSection(headerMatches[0], `${parentId}-hero`, "section"));
    console.log("[ReactParser] ✓ Parsed hero header section");
  } else if (headerMatches.length > 0) {
    console.log("[ReactParser] Skipping site header/navigation header");
  }

  // Parse sections
  const sectionMatches = extractTopLevelElement(jsxContent, "section");
  console.log("[ReactParser] Found", sectionMatches.length, "section elements");
  sectionMatches.forEach((sectionHTML, index) => {
    nodes.push(parseSection(sectionHTML, `${parentId}-section-${index}`, "section"));
  });
  console.log("[ReactParser] ✓ Parsed", sectionMatches.length, "sections");

  // Parse footer
  const footerMatches = extractTopLevelElement(jsxContent, "footer");
  console.log("[ReactParser] Found", footerMatches.length, "footer elements");
  if (footerMatches.length > 0) {
    nodes.push(parseSection(footerMatches[0], `${parentId}-footer`, "footer"));
    console.log("[ReactParser] ✓ Parsed footer");
  }

  if (nodes.length === 0) {
    console.warn("[ReactParser] ⚠️ NO SECTIONS FOUND!");
    console.log("[ReactParser] Full JSX content:", jsxContent.substring(0, 1000));
    
    // Create a single section with all content
    return [
      {
        id: `${parentId}-section-0`,
        type: "section",
        props: {
          className: "py-16",
        },
        children: [
          {
            id: `${parentId}-container`,
            type: "container",
            props: {
              className: "container mx-auto px-6",
            },
            children: extractElements(jsxContent, parentId),
          },
        ],
      },
    ];
  }

  console.log("[ReactParser] ✅ Total nodes created:", nodes.length);
  return nodes;
}

/* ============================================================
   UNWRAP OUTER DIV
============================================================ */

function unwrapOuterDiv(jsx: string): string {
  jsx = jsx.trim();
  
  // Remove Fragment tags
  jsx = jsx.replace(/^<>\s*/i, "").replace(/\s*<\/>$/i, "");
  
  // Check if wrapped in a single div
  const divMatch = jsx.match(/^<div[^>]*>([\s\S]*)<\/div>$/i);
  if (divMatch) {
    console.log("[unwrapOuterDiv] Removed outer wrapper div");
    return divMatch[1].trim();
  }
  
  return jsx;
}

/* ============================================================
   EXTRACT TOP-LEVEL ELEMENTS (NON-NESTED)
============================================================ */

function extractTopLevelElement(jsx: string, tagName: string): string[] {
  const results: string[] = [];
  const regex = new RegExp(`<${tagName}[^>]*>`, "gi");
  
  let match;
  while ((match = regex.exec(jsx)) !== null) {
    const startPos = match.index;
    const closeTag = `</${tagName}>`;
    
    // Find matching closing tag
    let depth = 1;
    let pos = startPos + match[0].length;
    
    while (depth > 0 && pos < jsx.length) {
      const nextOpen = jsx.indexOf(`<${tagName}`, pos);
      const nextClose = jsx.indexOf(closeTag, pos);
      
      if (nextClose === -1) break;
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + tagName.length + 1;
      } else {
        depth--;
        pos = nextClose + closeTag.length;
      }
    }
    
    if (depth === 0) {
      results.push(jsx.substring(startPos, pos));
    }
  }
  
  return results;
}

function stripElements(html: string, tagName: string): string {
  const elements = extractTopLevelElement(html, tagName);
  return elements.reduce((nextHtml, element) => nextHtml.replace(element, ""), html);
}

/* ============================================================
   ✅ PARSE SECTION (HEADER/SECTION/FOOTER) - WITH STYLES
============================================================ */

function parseSection(
  html: string,
  id: string,
  nodeType: "header" | "section" | "footer"
): BlueprintNode {
  // Extract className
  const classMatch = html.match(/className=["']([^"']*)["']/);
  const classNames = classMatch?.[1] || "";

  // ✅ Extract inline styles (React style object)
  const styleMatch = html.match(/style=\{\{([^}]*)\}\}/);
  const inlineStyles = styleMatch ? parseReactStyleObject(styleMatch[1]) : {};
  
  // ✅ Extract background image from data-ai-bg
  const bgMatch = html.match(/data-ai-bg="[^"]*"/);
  if (bgMatch) {
    console.log(`[parseSection] Found background image marker in ${id}`);
  }

  console.log(`[parseSection] ${id} - className: "${classNames}", hasStyles: ${Object.keys(inlineStyles).length > 0}`);

  const children = extractStructuredChildren(html, id);

  // If no children found, extract at least the text content
  if (children.length === 0) {
    const textContent = html.replace(/<[^>]*>/g, " ").trim();
    if (textContent && textContent.length > 10) {
      children.push({
        id: `${id}-text-0`,
        type: "text",
        props: {
          text: textContent.substring(0, 200),
          className: "",
        },
      });
    }
  }

  const sectionChildren =
    children.length === 1 && children[0]?.type === "container"
      ? children
      : [
          {
            id: `${id}-container`,
            type: "container",
            props: {
              className: "container mx-auto px-6 max-w-7xl",
            },
            children,
          },
        ];

  return {
    id,
    type: nodeType,
    props: {
      className: classNames,
    },
    style: inlineStyles,
    children: sectionChildren,
  };
}

/* ============================================================
   ✅ PARSE REACT STYLE OBJECT (backgroundImage, etc.)
============================================================ */

function parseReactStyleObject(styleString: string): Record<string, string> {
  const styles: Record<string, string> = {};

  console.log("[parseReactStyleObject] Raw style string:", styleString);

  // Split by comma (but not inside quotes or url())
  const props = styleString.split(/,(?![^(]*\))/);

  for (const prop of props) {
    const colonIndex = prop.indexOf(':');
    if (colonIndex === -1) continue;

    let key = prop.substring(0, colonIndex).trim();
    let value = prop.substring(colonIndex + 1).trim();

    // Remove quotes
    key = key.replace(/['"]/g, '');
    value = value.replace(/^['"]|['"]$/g, '');

    if (key && value) {
      // Keep camelCase for React (backgroundImage, not background-image)
      styles[key] = value;
      console.log(`[parseReactStyleObject] Extracted: ${key} = ${value}`);
    }
  }

  return styles;
}

/* ============================================================
   ✅ EXTRACT CHILD ELEMENTS (HEADINGS, TEXT, BUTTONS, IMAGES)
============================================================ */

function extractElements(html: string, parentId: string): BlueprintNode[] {
  const children: BlueprintNode[] = [];
  let childIndex = 0;
  const contentHtml = stripElements(html, "nav");

  // Extract headings (h1-h6) with better pattern
  const headingPattern = /<(h[1-6])[^>]*?(?:className=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = headingPattern.exec(contentHtml)) !== null) {
    const level = match[1].toLowerCase();
    const className = match[2] || "";
    let text = match[3];

    // Clean nested HTML
    text = cleanHTML(text);

    if (!text || text.length < 2) continue;

    children.push({
      id: `${parentId}-heading-${childIndex++}`,
      type: "heading",
      props: {
        level,
        text,
        className,
      },
      style:
        level === "h1"
          ? { fontSize: 64, lineHeight: 1.05, fontWeight: 800, maxWidth: "980px" }
          : { fontWeight: 700, maxWidth: "820px" },
    });
  }

  // Extract paragraphs
  const pPattern = /<p[^>]*?(?:className=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/p>/gi;
  while ((match = pPattern.exec(contentHtml)) !== null) {
    const className = match[1] || "";
    let text = match[2];

    text = cleanHTML(text);

    if (!text || text.length < 3) continue;

    children.push({
      id: `${parentId}-text-${childIndex++}`,
      type: "text",
      props: {
        text,
        className,
      },
      style: { maxWidth: "760px" },
    });
  }

  // Extract buttons
  const buttonPattern = /<button[^>]*?(?:className=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/button>/gi;
  while ((match = buttonPattern.exec(contentHtml)) !== null) {
    const className = match[1] || "";
    let label = match[2];

    label = cleanHTML(label);

    if (!label) continue;

    children.push({
      id: `${parentId}-button-${childIndex++}`,
      type: "button",
      props: {
        label,
        text: label,
        href: "#",
        className,
      },
      style: { width: "fit-content", alignSelf: "flex-start" },
    });
  }

  // Extract anchor buttons/links
  const anchorPattern =
    /<a[^>]*?href=["']([^"']*)["'][^>]*?(?:className=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/a>/gi;
  while ((match = anchorPattern.exec(contentHtml)) !== null) {
    const href = match[1] || "#";
    const className = match[2] || "";
    let label = match[3];

    label = cleanHTML(label);
    if (!label) continue;
    if (/^(home|about|features|services|work|contact|pricing|blog|menu)$/i.test(label)) {
      continue;
    }

    children.push({
      id: `${parentId}-button-${childIndex++}`,
      type: "button",
      props: {
        label,
        text: label,
        href,
        className,
      },
      style: { width: "fit-content", alignSelf: "flex-start" },
    });
  }

  // ✅ Extract images (with actual URLs from Freepik)
  const imgPattern = /<img[^>]*?src=["']([^"']*)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*?(?:className=["']([^"']*)["'])?[^>]*?\/?>/gi;
  while ((match = imgPattern.exec(contentHtml)) !== null) {
    const src = match[1];
    const alt = match[2] || "Image";
    const className = match[3] || "";

    // ✅ Skip only PLACEHOLDER, but keep real URLs
    if (src === "PLACEHOLDER") {
      console.log("[extractElements] Skipping PLACEHOLDER image (not yet replaced)");
      continue;
    }

    // Skip data URIs and generic placeholders
    if (
      src.startsWith("data:") ||
      src.includes("placehold.co")
    ) {
      continue;
    }

    console.log("[extractElements] Found image:", src.substring(0, 60) + "...");

    children.push({
      id: `${parentId}-image-${childIndex++}`,
      type: "image",
      props: {
        src,
        alt,
        className,
      },
      style: {
        width: "100%",
        maxWidth: "720px",
        borderRadius: 24,
        minHeight: 320,
      },
    });
  }

  console.log(`[ReactParser] Extracted ${children.length} elements from ${parentId}`);
  return children;
}

/* ============================================================
   STRUCTURED JSX PARSER
   Keeps generated grids/cards/split layouts instead of flattening
   every heading, paragraph, image, and CTA into one stack.
============================================================ */

type ParsedElement = {
  tag: string;
  openTag: string;
  inner: string;
  selfClosing: boolean;
};

const VOID_TAGS = new Set(["img", "input", "br", "hr", "meta", "link"]);

function extractStructuredChildren(html: string, parentId: string): BlueprintNode[] {
  const inner = getElementInner(html);
  const directChildren = extractDirectChildElements(inner);

  if (!directChildren.length) {
    return extractElements(html, parentId);
  }

  const structured = directChildren
    .map((child, index) => parseStructuredElement(child, `${parentId}-${index}`))
    .flat()
    .filter(Boolean) as BlueprintNode[];

  return structured.length ? structured : extractElements(html, parentId);
}

function parseStructuredElement(html: string, id: string): BlueprintNode[] {
  const element = parseElementShell(html);
  if (!element) return [];

  const { tag, openTag, inner } = element;
  if (["nav", "script", "style"].includes(tag)) return [];

  const className = extractAttr(openTag, "className") || extractAttr(openTag, "class") || "";
  const style = parseStyleAttribute(openTag);
  const childElements = extractDirectChildElements(inner);
  const children = childElements
    .map((child, index) => parseStructuredElement(child, `${id}-${index}`))
    .flat()
    .filter(Boolean) as BlueprintNode[];

  if (/^h[1-6]$/.test(tag)) {
    const text = cleanHTML(inner);
    if (!text) return [];
    return [{
      id,
      type: "heading",
      props: {
        level: tag,
        text,
        className,
      },
      style,
    }];
  }

  if (["p", "span", "li"].includes(tag)) {
    const text = cleanHTML(inner);
    if (!text || text.length < 2) return [];
    return [{
      id,
      type: "text",
      props: {
        text,
        className,
      },
      style: { maxWidth: "760px", ...style },
    }];
  }

  if (tag === "img") {
    const src = extractAttr(openTag, "src");
    if (!src || src === "PLACEHOLDER" || src.startsWith("data:") || src.includes("placehold.co")) {
      return [];
    }

    return [{
      id,
      type: "image",
      props: {
        src,
        alt: extractAttr(openTag, "alt") || "Website visual",
        className,
        radius: className.includes("rounded") ? 18 : undefined,
        aspectRatio: inferAspectRatio(className),
      },
      style: {
        width: "100%",
        minHeight: className.includes("h-") ? undefined : 280,
        objectFit: "cover",
        ...style,
      },
    }];
  }

  if (tag === "a" || tag === "button") {
    const label = cleanHTML(inner);
    if (!label) return [];
    if (/^(home|about|features|services|work|contact|pricing|blog|menu)$/i.test(label)) {
      return [];
    }

    return [{
      id,
      type: "button",
      props: {
        label,
        text: label,
        href: tag === "a" ? extractAttr(openTag, "href") || `#${slugifyLabel(label)}` : "#contact",
        variant: inferButtonVariant(className),
        className,
      },
      style: { width: "fit-content", ...style },
    }];
  }

  if (tag === "section" || tag === "header" || tag === "footer") {
    const nodeType = tag === "header" ? "section" : tag as "section" | "footer";
    return [parseSection(html, id, nodeType)];
  }

  if (["div", "main", "ul", "ol", "article", "aside"].includes(tag)) {
    const fallbackChildren = children.length ? children : extractElements(html, id);
    if (!fallbackChildren.length) return [];

    const layout = inferContainerLayout(className);
    const isCard = isCardLike(className, tag);

    return [{
      id,
      type: layout === "item" ? "column" : "container",
      props: {
        className,
        ...(layout === "grid" ? { layout: "grid", columns: inferGridColumns(className), gap: inferGap(className) } : {}),
        ...(layout === "columns" ? { layout: "columns", direction: "row", gap: inferGap(className) } : {}),
        ...(isCard ? { visual: className.includes("glass") || className.includes("backdrop") ? "glass" : "card" } : {}),
      },
      style,
      children: fallbackChildren,
    }];
  }

  return children;
}

function parseElementShell(html: string): ParsedElement | null {
  const openMatch = html.match(/^<([a-zA-Z][\w:-]*)([^>]*)>/);
  if (!openMatch) return null;

  const tag = openMatch[1].toLowerCase();
  const openTag = openMatch[0];
  const selfClosing = /\/>$/.test(openTag) || VOID_TAGS.has(tag);
  const inner = selfClosing ? "" : getElementInner(html);

  return { tag, openTag, inner, selfClosing };
}

function getElementInner(html: string) {
  const openEnd = html.indexOf(">");
  if (openEnd === -1) return "";

  const closeMatch = html.match(/<\/([a-zA-Z][\w:-]*)>\s*$/);
  if (!closeMatch) return "";

  return html.slice(openEnd + 1, closeMatch.index).trim();
}

function extractDirectChildElements(html: string): string[] {
  const children: string[] = [];
  let index = 0;

  while (index < html.length) {
    const openIndex = html.indexOf("<", index);
    if (openIndex === -1) break;
    if (html[openIndex + 1] === "/") {
      index = openIndex + 2;
      continue;
    }

    const openMatch = html.slice(openIndex).match(/^<([a-zA-Z][\w:-]*)([^>]*)>/);
    if (!openMatch) {
      index = openIndex + 1;
      continue;
    }

    const tag = openMatch[1].toLowerCase();
    const openTag = openMatch[0];
    const openEnd = openIndex + openTag.length;

    if (/\/>$/.test(openTag) || VOID_TAGS.has(tag)) {
      children.push(html.slice(openIndex, openEnd));
      index = openEnd;
      continue;
    }

    const closeTag = `</${tag}>`;
    let depth = 1;
    let cursor = openEnd;

    while (depth > 0 && cursor < html.length) {
      const nextOpen = html.indexOf(`<${tag}`, cursor);
      const nextClose = html.indexOf(closeTag, cursor);
      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        cursor = nextOpen + tag.length + 1;
      } else {
        depth--;
        cursor = nextClose + closeTag.length;
      }
    }

    if (depth === 0) {
      children.push(html.slice(openIndex, cursor));
      index = cursor;
    } else {
      index = openEnd;
    }
  }

  return children;
}

function extractAttr(tag: string, attr: string) {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const quoted = tag.match(new RegExp(`${escaped}\\s*=\\s*["']([^"']*)["']`, "i"));
  if (quoted?.[1]) return quoted[1].trim();

  const expression = tag.match(new RegExp(`${escaped}\\s*=\\s*\\{\\s*["']([^"']*)["']\\s*\\}`, "i"));
  return expression?.[1]?.trim() || "";
}

function parseStyleAttribute(tag: string): Record<string, string | number> {
  const reactStyle = tag.match(/style=\{\{([^}]*)\}\}/);
  if (reactStyle?.[1]) return parseReactStyleObject(reactStyle[1]);

  const htmlStyle = extractAttr(tag, "style");
  if (!htmlStyle) return {};

  return htmlStyle.split(";").reduce<Record<string, string>>((acc, item) => {
    const [rawKey, ...valueParts] = item.split(":");
    const value = valueParts.join(":").trim();
    if (!rawKey || !value) return acc;
    const key = rawKey.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[key] = value;
    return acc;
  }, {});
}

function inferContainerLayout(className: string): "grid" | "columns" | "stack" | "item" {
  if (/\bgrid\b/.test(className)) return "grid";
  if (/\bflex\b/.test(className) && /(?:flex-row|md:flex-row|lg:flex-row|items-|justify-|gap-)/.test(className)) {
    return "columns";
  }
  if (/rounded|shadow|border|bg-|p-\d|px-\d|py-\d/.test(className)) return "item";
  return "stack";
}

function inferGridColumns(className: string) {
  const explicit = className.match(/(?:lg:|xl:)?grid-cols-(\d+)/);
  return explicit ? Number(explicit[1]) : 3;
}

function inferGap(className: string) {
  const gap = className.match(/(?:lg:|md:)?gap-(\d+)/);
  return gap ? Number(gap[1]) * 4 : 24;
}

function isCardLike(className: string, tag: string) {
  return tag === "article" || /rounded|shadow|border|bg-white|bg-slate|bg-gray|backdrop|p-\d/.test(className);
}

function inferButtonVariant(className: string) {
  if (/border|outline|ring/.test(className)) return "secondary";
  if (/gradient/.test(className)) return "gradient";
  if (/ghost|transparent/.test(className)) return "ghost";
  return "primary";
}

function inferAspectRatio(className: string) {
  if (/aspect-square/.test(className)) return "1 / 1";
  if (/aspect-video/.test(className)) return "16 / 9";
  return undefined;
}

function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "contact";
}

/* ============================================================
   CLEAN HTML (REMOVE TAGS, DECODE ENTITIES)
============================================================ */

function cleanHTML(text: string): string {
  // Remove JSX expressions
  text = text.replace(/\{[^}]*\}/g, "");
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, " ");
  
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();
  
  return text;
}

/* ============================================================
   FALLBACK SECTION (WHEN PARSING FAILS)
============================================================ */

function createFallbackSection(
  content: string,
  parentId: string
): BlueprintNode[] {
  console.warn("[ReactParser] Creating fallback HTML block");

  // Try to extract at least some text
  const text = content.replace(/<[^>]*>/g, " ").replace(/\{[^}]*\}/g, "").trim();
  
  if (text && text.length > 20) {
    return [
      {
        id: `${parentId}-section-0`,
        type: "section",
        props: {
          className: "py-16",
        },
        children: [
          {
            id: `${parentId}-container`,
            type: "container",
            props: {},
            children: [
              {
                id: `${parentId}-text-0`,
                type: "text",
                props: {
                  text: text.substring(0, 500),
                },
              },
            ],
          },
        ],
      },
    ];
  }

  // Last resort: HTML block
  return [
    {
      id: `${parentId}-fallback`,
      type: "html-block",
      props: {
        html: convertJSXToHTML(content),
      },
      children: [],
    },
  ];
}

/* ============================================================
   CONVERT JSX TO HTML (FALLBACK)
============================================================ */

function convertJSXToHTML(jsx: string): string {
  let html = jsx;

  // Convert className to class
  html = html.replace(/className=/g, "class=");

  // Convert inline styles
  html = html.replace(/style=\{\{([^}]*)\}\}/g, (match, styles) => {
    const cssStyles = styles
      .split(",")
      .map((s: string) => {
        const [key, value] = s.split(":").map((x: string) => x.trim());
        if (!key || !value) return "";
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssKey}: ${value.replace(/['"]/g, "")}`;
      })
      .filter(Boolean)
      .join("; ");
    return `style="${cssStyles}"`;
  });

  // Remove {/* comments */}
  html = html.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  // Convert {variable} to empty (can't resolve without execution)
  html = html.replace(/\{[^}]*\}/g, "");

  return html;
}

/* ============================================================
   EXPORT UTILITIES
============================================================ */

export { uid };
