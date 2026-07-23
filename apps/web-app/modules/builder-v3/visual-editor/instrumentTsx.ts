import { createHash } from "node:crypto";
import ts from "typescript";
function stableId(sourceFile: string, anchor: string) {
  return `be-${createHash("sha256").update(`${sourceFile}:${anchor}`).digest("hex").slice(0, 14)}`;
}
function syntaxPath(node: ts.Node, source: ts.SourceFile) {
  const parts: number[] = [];
  let current: ts.Node | undefined = node;
  while (current?.parent) {
    const siblings = current.parent.getChildren(source);
    parts.push(siblings.indexOf(current));
    current = current.parent;
  }
  return parts.reverse().join(".");
}
function capabilitiesFor(tag: string) {
  const result = ["spacing", "layout", "background", "border", "responsive", "structural"];
  if (/^(h[1-6]|p|span|label|button|a|li|blockquote)$/.test(tag)) result.push("text", "typography");
  if (tag === "img") result.push("image", "accessibility");
  if (tag === "a" || tag === "button") result.push("link", "accessibility");
  return result.join(",");
}
export function instrumentTsxSource(content: string, sourceFile: string, projectRevision: number) {
  const parsed = ts.createSourceFile(sourceFile, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visit = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return ts.visitEachChild(node, visit, context);
      const tag = node.tagName.getText(parsed);
      if (!/^[a-z][a-z0-9-]*$/.test(tag) || node.attributes.properties.some((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(parsed) === "data-buildez-id")) return ts.visitEachChild(node, visit, context);
      const anchor = String(node.getStart(parsed));
      const attrs = [
        ["data-buildez-id", stableId(sourceFile, syntaxPath(node, parsed))], ["data-buildez-kind", tag === "img" ? "image" : "element"],
        ["data-buildez-source-file", sourceFile], ["data-buildez-source-anchor", anchor],
        ["data-buildez-capabilities", capabilitiesFor(tag)], ["data-buildez-revision", String(projectRevision)],
      ].map(([name, value]) => ts.factory.createJsxAttribute(ts.factory.createIdentifier(name), ts.factory.createStringLiteral(value)));
      const attributes = ts.factory.updateJsxAttributes(node.attributes, [...node.attributes.properties, ...attrs]);
      return ts.isJsxOpeningElement(node)
        ? ts.factory.updateJsxOpeningElement(node, node.tagName, node.typeArguments, attributes)
        : ts.factory.updateJsxSelfClosingElement(node, node.tagName, node.typeArguments, attributes);
    };
    return (file) => ts.visitNode(file, visit) as ts.SourceFile;
  };
  const result = ts.transform(parsed, [transformer]);
  try { return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0] as ts.SourceFile); }
  finally { result.dispose(); }
}
