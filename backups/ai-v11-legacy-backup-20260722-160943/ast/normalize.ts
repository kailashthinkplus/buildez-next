import type { ParsedTsx } from "./parser";

export type NormalizedTsx = Readonly<{
  file: string;
  source: string;
  ast: any;
  root: any;
  componentName: string;
  localStatements: readonly any[];
}>;

function jsxFromFunction(node: any): any | undefined {
  if (!node) return undefined;
  if (node.body?.type === "JSXElement" || node.body?.type === "JSXFragment") return node.body;
  if (node.body?.type !== "BlockStatement") return undefined;
  return node.body.body.find((statement: any) => statement.type === "ReturnStatement")?.argument;
}

export function normalizeTsx(parsed: ParsedTsx): NormalizedTsx {
  const body = parsed.ast?.program?.body ?? [];
  const exportDefault = body.find((statement: any) => statement.type === "ExportDefaultDeclaration");
  const declaration = exportDefault?.declaration;
  let component = declaration;
  let componentName = declaration?.id?.name ?? "DefaultComponent";

  if (declaration?.type === "Identifier") {
    componentName = declaration.name;
    component = body
      .map((statement: any) => statement.declaration ?? statement)
      .find((statement: any) => statement?.id?.name === declaration.name);
  }

  const root = jsxFromFunction(component);
  if (!root || !["JSXElement", "JSXFragment"].includes(root.type)) {
    throw new Error(`V11_STATIC_ROOT_NOT_FOUND: ${parsed.file}`);
  }

  return Object.freeze({
    file: parsed.file,
    source: parsed.source,
    ast: parsed.ast,
    root,
    componentName,
    localStatements: Object.freeze(component?.body?.type === "BlockStatement" ? [...component.body.body] : []),
  });
}
