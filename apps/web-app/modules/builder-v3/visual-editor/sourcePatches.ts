import ts from "typescript";

export type ElementPatch =
  | Readonly<{ operation: "text"; value: string }>
  | Readonly<{ operation: "attribute"; name: "className" | "src" | "alt" | "href" | "id"; value: string }>;

export function patchElementSource(content: string, sourceFile: string, sourceAnchor: string, patch: ElementPatch) {
  const anchor = Number(sourceAnchor);
  if (!Number.isInteger(anchor) || anchor < 0) throw new Error("Invalid source anchor");
  const parsed = ts.createSourceFile(sourceFile, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let matched = false;
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visit = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (patch.operation === "text" && ts.isJsxElement(node) && node.openingElement.getStart(parsed) === anchor) {
        matched = true;
        return ts.factory.updateJsxElement(node, node.openingElement, [ts.factory.createJsxText(patch.value)], node.closingElement);
      }
      if (patch.operation === "attribute" && (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.getStart(parsed) === anchor) {
        matched = true;
        const properties = node.attributes.properties.filter((item) => !(ts.isJsxAttribute(item) && item.name.getText(parsed) === patch.name));
        if (patch.value) properties.push(ts.factory.createJsxAttribute(ts.factory.createIdentifier(patch.name), ts.factory.createStringLiteral(patch.value)));
        const attributes = ts.factory.updateJsxAttributes(node.attributes, properties);
        return ts.isJsxOpeningElement(node)
          ? ts.factory.updateJsxOpeningElement(node, node.tagName, node.typeArguments, attributes)
          : ts.factory.updateJsxSelfClosingElement(node, node.tagName, node.typeArguments, attributes);
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (file) => ts.visitNode(file, visit) as ts.SourceFile;
  };
  const result = ts.transform(parsed, [transformer]);
  try {
    if (!matched) throw new Error("Selected source element is stale or unsupported");
    return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0] as ts.SourceFile);
  } finally { result.dispose(); }
}
