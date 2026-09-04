import type { BuilderSelection } from "./contracts";

const TAG_LABELS: Readonly<Record<string, string>> = {
  h1: "Page heading",
  h2: "Section heading",
  h3: "Heading",
  h4: "Heading",
  h5: "Heading",
  h6: "Heading",
  p: "Paragraph",
  a: "Link",
  button: "Button",
  img: "Image",
  picture: "Image",
  video: "Video",
  nav: "Navigation",
  header: "Site header",
  footer: "Site footer",
  main: "Page content",
  section: "Section",
  article: "Article",
  form: "Form",
  input: "Form field",
  textarea: "Text field",
  select: "Select field",
  label: "Field label",
  ul: "List",
  ol: "List",
  li: "List item",
  table: "Table",
  svg: "Icon or graphic",
};

const CLASS_LABELS: readonly (readonly [RegExp, string])[] = [
  [/\bhero\b/i, "Hero section"],
  [/\b(?:site-?)?header\b/i, "Site header"],
  [/\bnav(?:igation)?\b/i, "Navigation"],
  [/\bfooter\b/i, "Site footer"],
  [/\b(?:logo|brand)\b/i, "Brand mark"],
  [/\b(?:cta|call-to-action)\b/i, "Call to action"],
  [/\btestimonial\b/i, "Testimonial"],
  [/\bpricing\b/i, "Pricing section"],
  [/\bfaq\b/i, "FAQ section"],
  [/\b(?:metric|stat)\b/i, "Metric"],
  [/\bcard\b/i, "Card"],
  [/\b(?:gallery|carousel|slider)\b/i, "Media gallery"],
  [/\b(?:visual|artwork|media)\b/i, "Visual"],
  [/\b(?:grid|list|group)\b/i, "Content group"],
  [/\b(?:container|wrapper|inner)\b/i, "Layout container"],
];

function compact(value: string | undefined, maximum = 58) {
  const normalized = (value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return normalized;
  return `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

export function describeBuilderSelection(selection: BuilderSelection) {
  const tagName = selection.tagName.toLowerCase();
  const className = selection.className || "";
  const classLabel = CLASS_LABELS.find(([pattern]) => pattern.test(className))?.[1];
  const type = selection.kind === "image"
    ? "Image"
    : ["div", "span", "section", "article"].includes(tagName)
      ? classLabel || TAG_LABELS[tagName] || "Content block"
      : TAG_LABELS[tagName] || classLabel || "Content block";
  const preferredContent = selection.kind === "image"
    ? selection.attributes?.alt
    : selection.textContent;
  const content = compact(preferredContent)
    || (tagName === "a" ? compact(selection.attributes?.href) : "");
  return {
    title: content ? `“${content}”` : type,
    type,
  } as const;
}
