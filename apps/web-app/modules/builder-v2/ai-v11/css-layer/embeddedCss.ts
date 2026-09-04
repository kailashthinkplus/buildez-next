import postcss, { type AtRule, type Rule } from "postcss";
import { CSS_POLICY } from "./policy";
import { validateLocalSelector } from "./scoper";

export type EmbeddedCssFinding = Readonly<{
  code:
    | "UNSAFE_CSS_SELECTOR"
    | "UNSAFE_CSS_AT_RULE"
    | "UNSAFE_CSS_PROPERTY";
  message: string;
  feature: string;
  offset: number;
}>;

export type EmbeddedCssIndex = Readonly<{
  byClass: ReadonlyMap<string, string>;
  byTag: ReadonlyMap<string, string>;
  classes: ReadonlySet<string>;
  ruleCount: number;
  keyframeCount: number;
  rootCss?: string;
  universalCss?: string;
  pageCss?: string;
  findings: readonly EmbeddedCssFinding[];
}>;
export function extractEmbeddedCss(source: string): EmbeddedCssIndex {
  const blocks = [
    ...source.matchAll(
      /<style>\s*\{\s*(?:`([\s\S]*?)`|'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")\s*\}\s*<\/style>/g,
    ),
  ].map((match) => ({
    css: match[1] ?? match[2] ?? match[3] ?? "",
    offset: match.index ?? 0,
  }));
  const byClass = new Map<string, string[]>();
  const byTag = new Map<string, string[]>();
  const rootDeclarations: string[] = [];
  const universalDeclarations: string[] = [];
  const pageRules: string[] = [];
  const findings: EmbeddedCssFinding[] = [];
  let ruleCount = 0,
    keyframeCount = 0;
  for (const block of blocks) {
    const root = postcss.parse(block.css, { from: undefined });
    const keyframes = root.nodes.filter(
      (node): node is AtRule =>
        node.type === "atrule" && node.name === "keyframes",
    );
    keyframeCount += keyframes.length;
    const addRule = (rule: Rule, wrapper?: AtRule) => {
      ruleCount += 1;
      for (const selector of rule.selectors) {
        if (selector.trim() === "*") {
          for (const child of rule.nodes) {
            if (child.type !== "decl") continue;
            if (
              child.prop.toLowerCase() === "box-sizing" &&
              /^(?:border-box|content-box)$/.test(child.value.trim())
            ) {
              universalDeclarations.push(child.toString());
              continue;
            }
            findings.push({
              code: "UNSAFE_CSS_PROPERTY",
              message: `Property '${child.prop}' is not supported in a universal reset.`,
              feature: child.prop,
              offset: block.offset,
            });
          }
          continue;
        }
        if (selector.trim() === ":root") {
          for (const child of rule.nodes) {
            if (child.type !== "decl") continue;
            if (child.prop.startsWith("--")) {
              rootDeclarations.push(child.toString());
              continue;
            }
            findings.push({
              code: "UNSAFE_CSS_PROPERTY",
              message: `Property '${child.prop}' is not a root custom property.`,
              feature: child.prop,
              offset: block.offset,
            });
          }
          continue;
        }
        const tagMatch = selector.trim().match(/^([a-zA-Z][\w-]*)(.*)$/);
        if (tagMatch) {
          const tag = tagMatch[1].toLowerCase();
          const scoped = rule.clone({ selector: `selector${tagMatch[2]}` });
          if (tag === "html" || tag === "body") {
            scoped.walkDecls((declaration) => {
              const property = declaration.prop.toLowerCase();
              const value = declaration.value.trim().toLowerCase();
              const concealsDocument =
                (property === "display" && value === "none") ||
                (property === "visibility" && value === "hidden") ||
                (property === "opacity" && /^0(?:\.0+)?$/.test(value)) ||
                (property === "pointer-events" && value === "none");
              if (!concealsDocument) return;
              findings.push({
                code: "UNSAFE_CSS_PROPERTY",
                message: `Property '${declaration.prop}: ${declaration.value}' would disable the generated document.`,
                feature: declaration.prop,
                offset: block.offset,
              });
              declaration.remove();
            });
          }
          if (!validateLocalSelector(scoped.selector)) {
            findings.push({
              code: "UNSAFE_CSS_SELECTOR",
              message: `Selector '${selector}' cannot be scoped to a Builder node.`,
              feature: selector,
              offset: block.offset,
            });
            continue;
          }
          if (!scoped.nodes.some((node) => node.type === "decl")) continue;
          const css = wrapper
            ? wrapper.clone({ nodes: [scoped] }).toString()
            : scoped.toString();
          byTag.set(tag, [...(byTag.get(tag) ?? []), css]);
          continue;
        }
        const match = selector.trim().match(/^\.([a-zA-Z_][\w-]*)(.*)$/);
        if (!match) {
          const scoped = rule.clone({ selector: `selector ${selector.trim()}` });
          if (validateLocalSelector(scoped.selector)) {
            pageRules.push(
              wrapper
                ? wrapper.clone({ nodes: [scoped] }).toString()
                : scoped.toString(),
            );
          } else {
            findings.push({
              code: "UNSAFE_CSS_SELECTOR",
              message: `Selector '${selector}' cannot be safely scoped to the generated page.`,
              feature: selector,
              offset: block.offset,
            });
          }
          continue;
        }
        const scoped = rule.clone({ selector: `selector${match[2]}` });
        if (!validateLocalSelector(scoped.selector)) {
          findings.push({
            code: "UNSAFE_CSS_SELECTOR",
            message: `Selector '${selector}' is not node-local.`,
            feature: selector,
            offset: block.offset,
          });
          continue;
        }
        const css = wrapper
          ? wrapper.clone({ nodes: [scoped] }).toString()
          : scoped.toString();
        byClass.set(match[1], [...(byClass.get(match[1]) ?? []), css]);
      }
    };
    for (const node of root.nodes) {
      if (node.type === "rule") addRule(node);
      if (node.type === "atrule") {
        if (!CSS_POLICY.allowedAtRules.has(node.name)) {
          findings.push({
            code: "UNSAFE_CSS_AT_RULE",
            message: `At-rule '@${node.name}' is forbidden.`,
            feature: node.name,
            offset: block.offset,
          });
          continue;
        }
        if (node.name === "media")
          for (const child of node.nodes ?? [])
            if (child.type === "rule") addRule(child, node);
      }
    }
    const keyframeCss = keyframes.map((item) => item.toString()).join("\n");
    if (keyframeCss)
      for (const [name, rules] of byClass)
        if (rules.some((rule) => /animation\s*:/.test(rule)))
          byClass.set(name, [...rules, keyframeCss]);
  }
  return Object.freeze({
    byClass: new Map(
      [...byClass].map(([name, rules]) => [name, rules.join("\n")]),
    ),
    byTag: new Map(
      [...byTag].map(([name, rules]) => [name, rules.join("\n")]),
    ),
    classes: new Set(byClass.keys()),
    ruleCount,
    keyframeCount,
    rootCss: rootDeclarations.length
      ? `selector {\n${rootDeclarations.map((item) => `  ${item}`).join("\n")}\n}`
      : undefined,
    universalCss: universalDeclarations.length
      ? `selector {\n${universalDeclarations.map((item) => `  ${item}`).join("\n")}\n}`
      : undefined,
    pageCss: pageRules.length ? pageRules.join("\n") : undefined,
    findings: Object.freeze(findings),
  });
}
