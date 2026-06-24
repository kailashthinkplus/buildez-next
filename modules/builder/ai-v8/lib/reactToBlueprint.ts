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
    nodes.push(parseSection(navMatches[0], `${parentId}-nav`, "header"));
    console.log("[ReactParser] ✓ Parsed navigation");
  }

  // Parse header/hero
  const headerMatches = extractTopLevelElement(jsxContent, "header");
  console.log("[ReactParser] Found", headerMatches.length, "header elements");
  if (headerMatches.length > 0) {
    nodes.push(parseSection(headerMatches[0], `${parentId}-hero`, "section"));
    console.log("[ReactParser] ✓ Parsed hero section");
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

  const children = extractElements(html, id);

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

  return {
    id,
    type: nodeType,
    props: {
      className: classNames,
      style: inlineStyles, // ✅ Now preserved!
    },
    children: [
      {
        id: `${id}-container`,
        type: "container",
        props: {
          className: "container mx-auto px-6 max-w-7xl",
        },
        children,
      },
    ],
  };
}

/* ============================================================
   ✅ PARSE REACT STYLE OBJECT (backgroundImage, etc.)
============================================================ */

function parseReactStyleObject(styleString: string): Record<string, any> {
  const styles: Record<string, any> = {};

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

  // Extract headings (h1-h6) with better pattern
  const headingPattern = /<(h[1-6])[^>]*?(?:className=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = headingPattern.exec(html)) !== null) {
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
    });
  }

  // Extract paragraphs
  const pPattern = /<p[^>]*?(?:className=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/p>/gi;
  while ((match = pPattern.exec(html)) !== null) {
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
    });
  }

  // Extract buttons
  const buttonPattern = /<button[^>]*?(?:className=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/button>/gi;
  while ((match = buttonPattern.exec(html)) !== null) {
    const className = match[1] || "";
    let label = match[2];

    label = cleanHTML(label);

    if (!label) continue;

    children.push({
      id: `${parentId}-button-${childIndex++}`,
      type: "button",
      props: {
        label,
        className,
      },
    });
  }

  // ✅ Extract images (with actual URLs from Freepik)
  const imgPattern = /<img[^>]*?src=["']([^"']*)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*?(?:className=["']([^"']*)["'])?[^>]*?\/?>/gi;
  while ((match = imgPattern.exec(html)) !== null) {
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
    });
  }

  console.log(`[ReactParser] Extracted ${children.length} elements from ${parentId}`);
  return children;
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

  // Add Tailwind CDN
  return `<script src="https://cdn.tailwindcss.com"></script>\n${html}`;
}

/* ============================================================
   EXPORT UTILITIES
============================================================ */

export { uid };
