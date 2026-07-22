import postcss, { type Root } from "postcss";

export type ParsedResidualCss = Readonly<{ root: Root; source: string }>;

export function parseResidualCss(source: string): ParsedResidualCss {
  if (Buffer.byteLength(source, "utf8") > 4096) throw new Error("V11_CSS_BYTE_BUDGET");
  try {
    return Object.freeze({ root: postcss.parse(source, { from: undefined }), source });
  } catch (error) {
    throw new Error(`V11_CSS_PARSE_FAILED: ${error instanceof Error ? error.message : String(error)}`);
  }
}
