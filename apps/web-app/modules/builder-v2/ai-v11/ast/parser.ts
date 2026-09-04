import * as BabelModule from "@babel/standalone";

import type { FidelityDiagnostic } from "../diagnostics/fidelity";

export class V11TsxParseError extends Error {
  readonly code = "V11_TSX_PARSE_FAILED";
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly parserMessage: string;

  constructor(input: {
    file: string;
    line?: number;
    column?: number;
    parserMessage: string;
  }) {
    const line = input.line ?? 1;
    const column = input.column ?? 1;
    super(
      `V11_TSX_PARSE_FAILED: ${input.file}:${line}:${column}: ${input.parserMessage}`,
    );
    this.name = "V11TsxParseError";
    this.file = input.file;
    this.line = line;
    this.column = column;
    this.parserMessage = input.parserMessage;
  }
}

export type ParsedTsx = Readonly<{
  file: string;
  source: string;
  ast: any;
  diagnostics: readonly FidelityDiagnostic[];
}>;

export function parseTsx(source: string, file: string): ParsedTsx {
  if (!source.trim()) throw new Error(`V11_PARSE_EMPTY_SOURCE: ${file}`);
  const Babel = ((BabelModule as any).default ?? BabelModule) as any;
  const parser = Babel.packages?.parser;
  if (!parser?.parse) throw new Error("V11_BABEL_PARSER_UNAVAILABLE");

  try {
    const ast = parser.parse(source, {
      sourceType: "module",
      sourceFilename: file,
      plugins: ["jsx", "typescript"],
      errorRecovery: false,
      ranges: true,
      tokens: false,
    });
    return Object.freeze({ file, source, ast, diagnostics: Object.freeze([]) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`V11_TSX_PARSE_FAILED: ${file}: ${message}`);
  }
}
