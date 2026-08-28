import ts from "typescript";

export type ElementPatch =
  | Readonly<{ operation: "text"; value: string }>
  | Readonly<{ operation: "html"; value: string }>
  | Readonly<{ operation: "attribute"; name: EditableAttribute; value: string }>
  | Readonly<{ operation: "connection"; source: ConnectedSource; sourceId: string; presentation: ConnectedPresentation; limit: number }>
  | Readonly<{ operation: "field"; field: string }>
  | Readonly<{ operation: "style"; name: StyleProperty; value: string }>
  | Readonly<{ operation: "textStyle"; name: TypographyProperty; value: string; selection: Readonly<{ start: number; end: number; text: string }> }>;

export type ConnectedSource = "none" | "cms" | "blog" | "products";
export type ConnectedPresentation = "list" | "grid" | "carousel" | "slider";
export type EditableAttribute = "className" | "src" | "alt" | "href" | "id"
  | "data-buildez-source" | "data-buildez-source-id" | "data-buildez-presentation"
  | "data-buildez-limit" | "data-buildez-field";

export type StyleProperty = "display" | "position" | "width" | "height" | "minWidth" | "maxWidth" | "minHeight" | "maxHeight"
  | "marginTop" | "marginRight" | "marginBottom" | "marginLeft" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft"
  | "gap" | "flexDirection" | "alignItems" | "justifyContent" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight"
  | "letterSpacing" | "textAlign" | "color" | "backgroundColor" | "borderColor" | "borderWidth" | "borderStyle"
  | "backgroundImage" | "backgroundSize" | "backgroundPosition" | "backgroundRepeat" | "objectFit"
  | "borderRadius" | "boxShadow" | "opacity" | "overflow" | "zIndex" | "flexWrap" | "alignSelf" | "gridTemplateColumns"
  | "fontStyle" | "textDecoration" | "textTransform" | "whiteSpace" | "wordBreak" | "transform" | "filter" | "cursor";

export type TypographyProperty = "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "lineHeight" | "letterSpacing" | "textAlign" | "textDecoration" | "textTransform" | "whiteSpace" | "wordBreak" | "color";

function staticText(children: readonly ts.JsxChild[]): string {
  return children.map((child) => {
    if (ts.isJsxText(child)) return child.text;
    if (ts.isJsxElement(child)) return staticText(child.children);
    if (ts.isJsxFragment(child)) return staticText(child.children);
    if (ts.isJsxExpression(child) && child.expression && (ts.isStringLiteral(child.expression) || ts.isNoSubstitutionTemplateLiteral(child.expression))) return child.expression.text;
    return "";
  }).join("");
}

function textStyleSpan(text: string, name: TypographyProperty, value: string): ts.JsxElement {
  const tag = ts.factory.createIdentifier("span");
  const style = ts.factory.createJsxAttribute(
    ts.factory.createIdentifier("style"),
    ts.factory.createJsxExpression(
      undefined,
      ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment(ts.factory.createIdentifier(name), ts.factory.createStringLiteral(value)),
      ]),
    ),
  );
  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(tag, undefined, ts.factory.createJsxAttributes([style])),
    [ts.factory.createJsxText(text)],
    ts.factory.createJsxClosingElement(tag),
  );
}

function styleStaticTextRange(
  children: readonly ts.JsxChild[],
  start: number,
  end: number,
  name: TypographyProperty,
  value: string,
) {
  let cursor = 0;
  let styled = false;

  const transformChildren = (items: readonly ts.JsxChild[]): ts.JsxChild[] => items.flatMap((child): ts.JsxChild[] => {
    if (ts.isJsxText(child)) {
      const childStart = cursor;
      const childEnd = cursor + child.text.length;
      cursor = childEnd;
      const overlapStart = Math.max(start, childStart);
      const overlapEnd = Math.min(end, childEnd);
      if (overlapStart >= overlapEnd) return [child];
      const localStart = overlapStart - childStart;
      const localEnd = overlapEnd - childStart;
      const result: ts.JsxChild[] = [];
      if (localStart > 0) result.push(ts.factory.createJsxText(child.text.slice(0, localStart)));
      result.push(textStyleSpan(child.text.slice(localStart, localEnd), name, value));
      if (localEnd < child.text.length) result.push(ts.factory.createJsxText(child.text.slice(localEnd)));
      styled = true;
      return result;
    }

    if (ts.isJsxElement(child)) {
      return [ts.factory.updateJsxElement(child, child.openingElement, transformChildren(child.children), child.closingElement)];
    }

    if (ts.isJsxFragment(child)) {
      return [ts.factory.updateJsxFragment(child, child.openingFragment, transformChildren(child.children), child.closingFragment)];
    }

    if (ts.isJsxExpression(child) && child.expression && (ts.isStringLiteral(child.expression) || ts.isNoSubstitutionTemplateLiteral(child.expression))) {
      const childStart = cursor;
      cursor += child.expression.text.length;
      if (start <= childStart && end >= cursor) {
        styled = true;
        return [textStyleSpan(child.expression.text, name, value)];
      }
    }

    return [child];
  });

  const result = transformChildren(children);
  return { children: result, styled };
}

export function patchElementSources(
  content: string,
  sourceFile: string,
  sourceAnchor: string,
  patches: readonly ElementPatch[],
) {
  const anchor = Number(sourceAnchor);

  if (!Number.isInteger(anchor) || anchor < 0) {
    throw new Error("Invalid source anchor");
  }

  if (!patches.length) {
    throw new Error("At least one element patch is required");
  }

  const parsed = ts.createSourceFile(
    sourceFile,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  let matched = false;

  const textPatches =
    patches.filter(
      (
        patch,
      ): patch is Extract<
        ElementPatch,
        { operation: "text" }
      > => patch.operation === "text",
    );

  const htmlPatches =
    patches.filter(
      (
        patch,
      ): patch is Extract<
        ElementPatch,
        { operation: "html" }
      > => patch.operation === "html",
    );

  const textStylePatches = patches.filter(
    (patch): patch is Extract<ElementPatch, { operation: "textStyle" }> => patch.operation === "textStyle",
  );

  if (textStylePatches.length > 1) throw new Error("Multiple selected-text style patches are not supported");

  if (textPatches.length > 1) {
    throw new Error(
      "Multiple text patches for one element are not supported",
    );
  }

  if (htmlPatches.length > 1) {
    throw new Error(
      "Multiple HTML patches for one element are not supported",
    );
  }

  if (textPatches.length && htmlPatches.length) {
    throw new Error(
      "Text and HTML patches cannot be applied together",
    );
  }

  const transformer: ts.TransformerFactory<
    ts.SourceFile
  > = (context) => {
    const visit = (
      node: ts.Node,
    ): ts.VisitResult<ts.Node> => {
      const isOpeningNode =
        ts.isJsxOpeningElement(node) ||
        ts.isJsxSelfClosingElement(node);

      const openingMatches =
        isOpeningNode &&
        node.getStart(parsed) === anchor;

      const elementMatches =
        ts.isJsxElement(node) &&
        node.openingElement.getStart(parsed) === anchor;

      /*
       * Child content is mutated on the JSX element itself.
       * All attribute/style mutations are applied to the opening
       * element during the same AST transformation.
       */
      if (elementMatches) {
        const textStylePatch = textStylePatches[0];

        if (textStylePatch) {
          const text = staticText(node.children);
          let start = textStylePatch.selection.start;
          let end = textStylePatch.selection.end;

          if (text.slice(start, end) !== textStylePatch.selection.text) {
            const first = text.indexOf(textStylePatch.selection.text);
            const second = first < 0 ? -1 : text.indexOf(textStylePatch.selection.text, first + 1);
            if (first < 0 || second >= 0) throw new Error("The highlighted text is stale or cannot be mapped safely");
            start = first;
            end = start + textStylePatch.selection.text.length;
          }

          const result = styleStaticTextRange(node.children, start, end, textStylePatch.name, textStylePatch.value);
          if (!result.styled) throw new Error("The highlighted text cannot be styled safely");
          matched = true;
          return ts.factory.updateJsxElement(node, node.openingElement, result.children, node.closingElement);
        }

        const contentPatch =
          htmlPatches[0] ?? textPatches[0];

        if (contentPatch?.operation === "text") {
          matched = true;

          return ts.factory.updateJsxElement(
            node,
            node.openingElement,
            [
              ts.factory.createJsxText(
                contentPatch.value,
              ),
            ],
            node.closingElement,
          );
        }

        if (contentPatch?.operation === "html") {
          const richSource =
            ts.createSourceFile(
              "rich-content.tsx",
              `const content = <>${contentPatch.value}</>;`,
              ts.ScriptTarget.Latest,
              true,
              ts.ScriptKind.TSX,
            );

          const statement =
            richSource.statements[0];

          const declaration =
            statement &&
            ts.isVariableStatement(statement)
              ? statement.declarationList
                  .declarations[0]
              : undefined;

          const fragment =
            declaration?.initializer;

          if (
            !fragment ||
            !ts.isJsxFragment(fragment)
          ) {
            throw new Error(
              "Rich text contains invalid markup",
            );
          }

          matched = true;

          return ts.factory.updateJsxElement(
            node,
            node.openingElement,
            [...fragment.children],
            node.closingElement,
          );
        }
      }

      if (openingMatches) {
        let properties = [
          ...node.attributes.properties,
        ];

        for (const patch of patches) {
          if (
            patch.operation === "text" ||
            patch.operation === "html" ||
            patch.operation === "textStyle"
          ) {
            continue;
          }

          if (
            patch.operation === "connection" ||
            patch.operation === "field"
          ) {
            const updates: Record<
              string,
              string
            > =
              patch.operation === "field"
                ? {
                    "data-buildez-field":
                      patch.field,
                  }
                : {
                    "data-buildez-source":
                      patch.source === "none"
                        ? ""
                        : patch.source,

                    "data-buildez-source-id":
                      patch.source === "none"
                        ? ""
                        : patch.sourceId,

                    "data-buildez-presentation":
                      patch.source === "none"
                        ? ""
                        : patch.presentation,

                    "data-buildez-limit":
                      patch.source === "none"
                        ? ""
                        : String(
                            Math.max(
                              1,
                              Math.min(
                                100,
                                patch.limit,
                              ),
                            ),
                          ),
                  };

            properties =
              properties.filter(
                (item) =>
                  !(
                    ts.isJsxAttribute(item) &&
                    Object.hasOwn(
                      updates,
                      item.name.getText(parsed),
                    )
                  ),
              );

            for (
              const [name, value]
              of Object.entries(updates)
            ) {
              if (!value) continue;

              properties.push(
                ts.factory.createJsxAttribute(
                  ts.factory.createIdentifier(
                    name,
                  ),
                  ts.factory.createStringLiteral(
                    value,
                  ),
                ),
              );
            }

            matched = true;
            continue;
          }

          if (patch.operation === "attribute") {
            properties =
              properties.filter(
                (item) =>
                  !(
                    ts.isJsxAttribute(item) &&
                    item.name.getText(parsed) ===
                      patch.name
                  ),
              );

            if (patch.value) {
              properties.push(
                ts.factory.createJsxAttribute(
                  ts.factory.createIdentifier(
                    patch.name,
                  ),
                  ts.factory.createStringLiteral(
                    patch.value,
                  ),
                ),
              );
            }

            matched = true;
            continue;
          }

          if (patch.operation === "style") {
            /*
             * Style patches are applied together after this loop.
             *
             * Never synthesize one JSX `style` attribute per
             * property. A selected-element AI request can contain
             * many style mutations and JSX permits only one
             * attribute with a given name.
             */
            continue;
          }
        }

        const stylePatches =
          patches.filter(
            (
              patch,
            ): patch is Extract<
              ElementPatch,
              { operation: "style" }
            > => patch.operation === "style",
          );

        if (stylePatches.length) {
          /*
           * There must be at most one JSX style attribute on an
           * element. Merge every requested property into that one
           * object literal in a single operation.
           */
          const existingStyleAttributes =
            properties.filter(
              (
                item,
              ): item is ts.JsxAttribute =>
                ts.isJsxAttribute(item) &&
                item.name.getText(parsed) === "style",
            );

          if (existingStyleAttributes.length > 1) {
            throw new Error(
              "Selected element contains duplicate style attributes",
            );
          }

          const existingStyleAttribute =
            existingStyleAttributes[0];

          let assignments:
            ts.ObjectLiteralElementLike[] = [];

          if (existingStyleAttribute) {
            const expression =
              existingStyleAttribute.initializer &&
              ts.isJsxExpression(
                existingStyleAttribute.initializer,
              )
                ? existingStyleAttribute.initializer
                    .expression
                : undefined;

            if (
              !expression ||
              !ts.isObjectLiteralExpression(
                expression,
              )
            ) {
              throw new Error(
                "Selected element uses a dynamic style expression",
              );
            }

            assignments = [
              ...expression.properties,
            ];
          }

          /*
           * Last requested value wins for a repeated property.
           * runAgent already deduplicates AI output, but keeping
           * this invariant here makes patchElementSources safe for
           * every caller.
           */
          const requestedStyles =
            new Map<
              StyleProperty,
              string
            >();

          for (const patch of stylePatches) {
            requestedStyles.set(
              patch.name,
              patch.value,
            );
          }

          assignments =
            assignments.filter((item) => {
              if (
                !ts.isPropertyAssignment(item) &&
                !ts.isShorthandPropertyAssignment(
                  item,
                )
              ) {
                return true;
              }

              const propertyName =
                item.name
                  .getText(parsed)
                  .replace(
                    /^["']|["']$/g,
                    "",
                  );

              return !requestedStyles.has(
                propertyName as StyleProperty,
              );
            });

          for (
            const [name, value]
            of requestedStyles
          ) {
            /*
             * Empty value removes the property, matching the
             * existing single-style patch behaviour.
             */
            if (!value) continue;

            assignments.push(
              ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(
                  name,
                ),
                ts.factory.createStringLiteral(
                  value,
                ),
              ),
            );
          }

          /*
           * Remove ALL existing style attributes before emitting
           * the canonical merged one. This also prevents malformed
           * duplicate style attributes from being propagated.
           */
          properties =
            properties.filter(
              (item) =>
                !(
                  ts.isJsxAttribute(item) &&
                  item.name.getText(parsed) ===
                    "style"
                ),
            );

          if (assignments.length) {
            properties.push(
              ts.factory.createJsxAttribute(
                ts.factory.createIdentifier(
                  "style",
                ),
                ts.factory.createJsxExpression(
                  undefined,
                  ts.factory.createObjectLiteralExpression(
                    assignments,
                    false,
                  ),
                ),
              ),
            );
          }

          matched = true;
        }

        if (matched) {
          const attributes =
            ts.factory.updateJsxAttributes(
              node.attributes,
              properties,
            );

          return ts.isJsxOpeningElement(node)
            ? ts.factory.updateJsxOpeningElement(
                node,
                node.tagName,
                node.typeArguments,
                attributes,
              )
            : ts.factory.updateJsxSelfClosingElement(
                node,
                node.tagName,
                node.typeArguments,
                attributes,
              );
        }
      }

      return ts.visitEachChild(
        node,
        visit,
        context,
      );
    };

    return (file) =>
      ts.visitNode(
        file,
        visit,
      ) as ts.SourceFile;
  };

  const result =
    ts.transform(parsed, [transformer]);

  try {
    if (!matched) {
      throw new Error(
        "Selected source element is stale or unsupported",
      );
    }

    return ts
      .createPrinter({
        newLine: ts.NewLineKind.LineFeed,
      })
      .printFile(
        result.transformed[0] as ts.SourceFile,
      );
  } finally {
    result.dispose();
  }
}

/*
 * Backwards-compatible single-patch API used by the
 * Inspector and existing element endpoint.
 */
export function patchElementSource(
  content: string,
  sourceFile: string,
  sourceAnchor: string,
  patch: ElementPatch,
) {
  return patchElementSources(
    content,
    sourceFile,
    sourceAnchor,
    [patch],
  );
}
