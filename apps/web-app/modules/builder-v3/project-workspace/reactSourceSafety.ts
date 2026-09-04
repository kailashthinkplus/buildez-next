import ts from "typescript";

const EFFECT_NAMES = new Set(["useEffect", "useLayoutEffect", "useInsertionEffect"]);

function effectName(expression: ts.Expression) {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) return expression.name.text;
  return "";
}

/**
 * React treats an effect callback's return value as its cleanup function. AI
 * generated concise arrows such as `useEffect(() => scrollTo(0, 0), [])`
 * therefore crash when the expression returns a non-function value. Convert
 * those callbacks to block bodies while preserving intentional cleanup arrows.
 */
export function normalizeGeneratedReactEffects(content: string, filePath = "source.tsx") {
  if (!/\buse(?:Effect|LayoutEffect|InsertionEffect)\b/.test(content)) return content;

  const source = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    /\.tsx$/i.test(filePath) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const replacements: Array<{ start: number; end: number; value: string }> = [];

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && EFFECT_NAMES.has(effectName(node.expression))) {
      const callback = node.arguments[0];
      if (callback && ts.isArrowFunction(callback) && !ts.isBlock(callback.body)) {
        // `useEffect(() => () => unsubscribe(), [])` is an intentional cleanup.
        if (!ts.isArrowFunction(callback.body) && !ts.isFunctionExpression(callback.body)) {
          const bodyText = content.slice(callback.body.getStart(source), callback.body.end);
          replacements.push({
            start: callback.body.getStart(source),
            end: callback.body.end,
            value: `{ ${bodyText}; }`,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (updated, replacement) => `${updated.slice(0, replacement.start)}${replacement.value}${updated.slice(replacement.end)}`,
      content,
    );
}

/**
 * Normalize generated files that are accepted by both preview and publish.
 * AI-authored Vite configs commonly enable `allowImportingTsExtensions`
 * without also setting `noEmit`, which makes `tsc -b` fail before Vite can
 * render anything.
 */
export function normalizeGeneratedProjectFile(content: string, filePath: string) {
  if (/^(?:.*\/)?tsconfig(?:\.[^/]+)?\.json$/i.test(filePath)) {
    try {
      const parsed = JSON.parse(content) as {
        compilerOptions?: Record<string, unknown>;
      };
      const compilerOptions = parsed.compilerOptions;

      if (
        compilerOptions?.allowImportingTsExtensions === true &&
        compilerOptions.noEmit !== true &&
        compilerOptions.emitDeclarationOnly !== true
      ) {
        compilerOptions.noEmit = true;
        return `${JSON.stringify(parsed, null, 2)}\n`;
      }
    } catch {
      // Validation will report malformed JSON; do not rewrite it here.
    }
  }

  return /\.[jt]sx$/i.test(filePath)
    ? normalizeGeneratedReactEffects(content, filePath)
    : content;
}

export function normalizeGeneratedProjectFiles<T extends { path: string; content: string }>(files: readonly T[]) {
  return files.map((file) => ({
    ...file,
    content: normalizeGeneratedProjectFile(file.content, file.path),
  }));
}
