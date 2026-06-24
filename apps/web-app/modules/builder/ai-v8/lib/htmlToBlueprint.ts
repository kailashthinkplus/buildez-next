// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v8/lib/htmlToBlueprint.ts

import { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function parseHTMLToBlueprint(html: string): BlueprintNode[] {
  console.log("[HTML-Parser] Starting parse...");
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  const sections: BlueprintNode[] = [];
  const topElements = Array.from(doc.body.children);
  
  console.log("[HTML-Parser] Found", topElements.length, "top-level elements");
  
  topElements.forEach((el) => {
    const node = parseTopLevelElement(el as HTMLElement);
    if (node) {
      sections.push(node);
    }
  });
  
  console.log("[HTML-Parser] ✅ Parsed", sections.length, "sections");
  return sections;
}

function parseTopLevelElement(el: HTMLElement): BlueprintNode | null {
  const tag = el.tagName.toLowerCase();
  
  if (tag === "nav") return parseNav(el);
  if (tag === "header") return parseHero(el);
  if (tag === "section") return parseSection(el);
  if (tag === "footer") return parseFooter(el);
  
  return createFallbackSection(el);
}

// ✅ Extract className helper
function extractClassName(el: HTMLElement): string {
  return el.className || "";
}

function parseNav(nav: HTMLElement): BlueprintNode {
  const children: BlueprintNode[] = [];
  const navContainer = nav.querySelector(".container, [class*='container']") || nav;
  
  const links = Array.from(navContainer.querySelectorAll("a"));
  const logo = links[0];
  const navLinks = links.slice(1, 6);
  
  const columns: BlueprintNode[] = [];
  
  if (logo) {
    const logoImg = logo.querySelector("img");
    columns.push({
      id: uid(),
      type: "column",
      props: { 
        flex: "0 0 auto",
        className: "flex items-center"
      },
      children: logoImg ? [{
        id: uid(),
        type: "image",
        props: {
          src: logoImg.src,
          alt: logoImg.alt || "Logo",
          className: extractClassName(logoImg),
          style: { height: 40, width: "auto" }
        },
        children: []
      }] : [{
        id: uid(),
        type: "heading",
        props: {
          text: logo.textContent?.trim() || "Brand",
          level: "h3",
          className: extractClassName(logo),
          style: { fontSize: 20, fontWeight: 700 }
        },
        children: []
      }]
    });
  }
  
  if (navLinks.length > 0) {
    columns.push({
      id: uid(),
      type: "column",
      props: { 
        flex: "1 1 auto",
        className: "flex justify-end items-center"
      },
      children: [{
        id: uid(),
        type: "container",
        props: {
          layout: "columns",
          direction: "row",
          gap: 24,
          className: "flex gap-6 items-center"
        },
        children: navLinks.map(link => ({
          id: uid(),
          type: "button",
          props: {
            label: link.textContent?.trim() || "Link",
            variant: "ghost",
            href: link.getAttribute("href") || "#",
            className: extractClassName(link)
          },
          children: []
        }))
      }]
    });
  }
  
  if (columns.length > 0) {
    children.push({
      id: uid(),
      type: "container",
      props: {
        layout: "columns",
        direction: "row",
        gap: 24,
        className: extractClassName(navContainer),
      },
      children: columns
    });
  }
  
  return {
    id: uid(),
    type: "header",
    props: {
      className: extractClassName(nav),
      style: extractInlineStyles(nav),
    },
    children,
  };
}

function parseHero(header: HTMLElement): BlueprintNode {
  const containerChildren: BlueprintNode[] = [];
  
  const h1 = header.querySelector("h1");
  if (h1) {
    containerChildren.push({
      id: uid(),
      type: "heading",
      props: {
        text: h1.textContent?.trim() || "Welcome",
        level: "h1",
        className: extractClassName(h1), // ✅ Preserve Tailwind classes
        style: extractInlineStyles(h1)
      },
      children: []
    });
  }
  
  const p = header.querySelector("p");
  if (p) {
    containerChildren.push({
      id: uid(),
      type: "text",
      props: {
        html: p.textContent?.trim() || "",
        className: extractClassName(p), // ✅ Preserve Tailwind classes
        style: extractInlineStyles(p)
      },
      children: []
    });
  }
  
  const buttonContainer = header.querySelector(".flex.gap-4, [class*='flex'][class*='gap']");
  const buttons = Array.from(header.querySelectorAll("button, a.px-8, a.px-6"));
  
  if (buttons.length > 0) {
    const buttonNodes = buttons.slice(0, 2).map(btn => ({
      id: uid(),
      type: "button",
      props: {
        label: btn.textContent?.trim() || "Button",
        variant: btn.classList.contains("border") ? "secondary" : "primary",
        href: btn.getAttribute("href") || "#",
        className: extractClassName(btn as HTMLElement), // ✅ Preserve Tailwind classes
        style: extractInlineStyles(btn as HTMLElement)
      },
      children: []
    }));
    
    containerChildren.push({
      id: uid(),
      type: "container",
      props: {
        layout: "columns",
        direction: "row",
        gap: 16,
        className: "flex gap-4 justify-center",
      },
      children: buttonNodes
    });
  }
  
  return {
    id: uid(),
    type: "section",
    props: {
      className: extractClassName(header), // ✅ Preserve Tailwind classes
      style: extractInlineStyles(header)
    },
    children: [{
      id: uid(),
      type: "container",
      props: {
        maxWidth: 800,
        className: "container mx-auto px-6 text-center",
      },
      children: containerChildren
    }]
  };
}

function parseSection(section: HTMLElement): BlueprintNode {
  const sectionChildren: BlueprintNode[] = [];
  
  const heading = section.querySelector("h2, h3");
  if (heading) {
    sectionChildren.push({
      id: uid(),
      type: "heading",
      props: {
        text: heading.textContent?.trim() || "",
        level: heading.tagName.toLowerCase(),
        className: extractClassName(heading as HTMLElement), // ✅ Preserve Tailwind classes
        style: extractInlineStyles(heading as HTMLElement)
      },
      children: []
    });
  }
  
  const gridOrFlex = section.querySelector(".grid, [class*='grid']");
  
  if (gridOrFlex) {
    const cards = Array.from(gridOrFlex.children).slice(0, 6);
    
    if (cards.length > 0) {
      sectionChildren.push({
        id: uid(),
        type: "container",
        props: {
          layout: "grid",
          columns: Math.min(cards.length, 3),
          gap: 32,
          className: extractClassName(gridOrFlex as HTMLElement), // ✅ Preserve Tailwind classes
        },
        children: cards.map(card => parseCard(card as HTMLElement))
      });
    }
  } else {
    const paragraphs = Array.from(section.querySelectorAll("p")).slice(0, 3);
    if (paragraphs.length > 0) {
      sectionChildren.push({
        id: uid(),
        type: "container",
        props: { 
          maxWidth: 800,
          className: "container mx-auto px-6"
        },
        children: paragraphs.map(p => ({
          id: uid(),
          type: "text",
          props: {
            html: p.innerHTML,
            className: extractClassName(p), // ✅ Preserve Tailwind classes
            style: extractInlineStyles(p)
          },
          children: []
        }))
      });
    }
  }
  
  return {
    id: uid(),
    type: "section",
    props: {
      className: extractClassName(section), // ✅ Preserve Tailwind classes
      style: extractInlineStyles(section)
    },
    children: sectionChildren
  };
}

function parseCard(card: HTMLElement): BlueprintNode {
  const children: BlueprintNode[] = [];
  
  const img = card.querySelector("img");
  if (img) {
    children.push({
      id: uid(),
      type: "image",
      props: {
        src: img.src,
        alt: img.alt || "",
        className: extractClassName(img), // ✅ Preserve Tailwind classes
        style: extractInlineStyles(img)
      },
      children: []
    });
  }
  
  const heading = card.querySelector("h3, h4, h5");
  if (heading) {
    children.push({
      id: uid(),
      type: "heading",
      props: {
        text: heading.textContent?.trim() || "",
        level: "h3",
        className: extractClassName(heading as HTMLElement), // ✅ Preserve Tailwind classes
        style: extractInlineStyles(heading as HTMLElement)
      },
      children: []
    });
  }
  
  const p = card.querySelector("p");
  if (p) {
    children.push({
      id: uid(),
      type: "text",
      props: {
        html: p.textContent?.trim() || "",
        className: extractClassName(p), // ✅ Preserve Tailwind classes
        style: extractInlineStyles(p)
      },
      children: []
    });
  }
  
  const button = card.querySelector("button, a.px-6, a.px-8");
  if (button) {
    children.push({
      id: uid(),
      type: "button",
      props: {
        label: button.textContent?.trim() || "View Details",
        variant: "primary",
        href: button.getAttribute("href") || "#",
        className: extractClassName(button as HTMLElement), // ✅ Preserve Tailwind classes
        style: extractInlineStyles(button as HTMLElement)
      },
      children: []
    });
  }
  
  return {
    id: uid(),
    type: "column",
    props: {
      className: extractClassName(card), // ✅ Preserve Tailwind classes
      style: extractInlineStyles(card)
    },
    children,
  };
}

function parseFooter(footer: HTMLElement): BlueprintNode {
  const children: BlueprintNode[] = [];
  const footerContainer = footer.querySelector(".container, [class*='container']") || footer;
  const grid = footerContainer.querySelector(".grid, [class*='grid']");
  
  if (grid) {
    const columns = Array.from(grid.children).slice(0, 4);
    
    if (columns.length > 1) {
      children.push({
        id: uid(),
        type: "container",
        props: {
          layout: "grid",
          columns: Math.min(columns.length, 4),
          gap: 32,
          className: extractClassName(grid as HTMLElement), // ✅ Preserve Tailwind classes
        },
        children: columns.map(col => ({
          id: uid(),
          type: "column",
          props: {
            className: extractClassName(col as HTMLElement)
          },
          children: [{
            id: uid(),
            type: "text",
            props: {
              html: (col as HTMLElement).innerHTML,
              className: "text-sm"
            },
            children: []
          }]
        }))
      });
    }
  } else {
    children.push({
      id: uid(),
      type: "text",
      props: {
        html: footer.innerHTML,
        className: extractClassName(footer),
      },
      children: []
    });
  }
  
  return {
    id: uid(),
    type: "footer",
    props: {
      className: extractClassName(footer), // ✅ Preserve Tailwind classes
      style: extractInlineStyles(footer)
    },
    children
  };
}

function createFallbackSection(el: HTMLElement): BlueprintNode {
  return {
    id: uid(),
    type: "section",
    props: {
      className: extractClassName(el),
      style: extractInlineStyles(el)
    },
    children: [{
      id: uid(),
      type: "container",
      props: { 
        maxWidth: 1200,
        className: "container mx-auto px-6"
      },
      children: [{
        id: uid(),
        type: "text",
        props: {
          html: el.innerHTML,
        },
        children: []
      }]
    }]
  };
}

function extractInlineStyles(el: HTMLElement): Record<string, any> {
  const styles: Record<string, any> = {};
  const style = el.style;
  
  if (style.backgroundColor && style.backgroundColor !== "rgba(0, 0, 0, 0)") {
    styles.backgroundColor = style.backgroundColor;
  }
  
  if (style.color) {
    styles.color = style.color;
  }
  
  if (style.backgroundImage) {
    styles.backgroundImage = style.backgroundImage;
  }
  
  if (style.background && style.background.includes("gradient")) {
    styles.background = style.background;
  }
  
  return styles;
}
