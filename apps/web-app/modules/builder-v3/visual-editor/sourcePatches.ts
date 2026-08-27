import ts from "typescript";

export type ElementPatch =
  | Readonly<{ operation: "text"; value: string }>
  | Readonly<{ operation: "html"; value: string }>
  | Readonly<{ operation: "attribute"; name: EditableAttribute; value: string }>
  | Readonly<{ operation: "connection"; source: ConnectedSource; sourceId: string; presentation: ConnectedPresentation; limit: number }>
  | Readonly<{ operation: "field"; field: string }>
  | Readonly<{ operation: "style"; name: StyleProperty; value: string }>;

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
  | "borderRadius" | "boxShadow" | "opacity" | "overflow" | "zIndex";

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
            patch.operation === "html"
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
