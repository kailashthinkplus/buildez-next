export const AI_ATTACHMENT_MAX_FILES = 5;
export const AI_ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024;
export const AI_ATTACHMENT_MAX_TOTAL_BYTES = 50 * 1024 * 1024;
export const AI_ZIP_MAX_BYTES = 1024 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const FILE_EXTENSIONS = new Set([
  "zip",
  "pdf",
  "txt",
  "text",
  "md",
  "markdown",
  "json",
  "html",
  "htm",
  "xml",
  "doc",
  "docx",
  "rtf",
  "odt",
  "ppt",
  "pptx",
  "csv",
  "tsv",
  "xls",
  "xlsx",
  "js",
  "jsx",
  "mjs",
  "ts",
  "tsx",
  "css",
  "py",
  "sql",
  "yaml",
  "yml",
  "toml",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  text: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  json: "application/json",
  html: "text/html",
  htm: "text/html",
  xml: "text/xml",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  rtf: "application/rtf",
  odt: "application/vnd.oasis.opendocument.text",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  tsv: "text/tsv",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  js: "text/javascript",
  jsx: "text/jsx",
  mjs: "text/javascript",
  ts: "text/x-typescript",
  tsx: "text/tsx",
  css: "text/css",
  py: "text/x-python",
  sql: "text/x-sql",
  yaml: "text/x-yaml",
  yml: "text/x-yaml",
  toml: "text/x-toml",
  zip: "application/zip",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export const AI_ATTACHMENT_ACCEPT = [
  "image/png",
  "image/jpeg",
  "image/webp",
  ...[...FILE_EXTENSIONS].map((extension) => `.${extension}`),
].join(",");

type AttachmentLike = Pick<File, "name" | "size" | "type">;

function extensionOf(fileName: string) {
  return fileName.toLowerCase().split(".").pop() || "";
}

export function getAgentAttachmentKind(
  file: AttachmentLike,
): "image" | "file" | null {
  const extension = extensionOf(file.name);
  if (IMAGE_MIME_TYPES.has(file.type) || IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }
  if (FILE_EXTENSIONS.has(extension)) return "file";
  return null;
}

export function getAgentAttachmentMimeType(file: AttachmentLike) {
  return file.type || MIME_TYPES_BY_EXTENSION[extensionOf(file.name)] || "application/octet-stream";
}

export function getAgentAttachmentError(files: readonly AttachmentLike[]) {
  if (files.length > AI_ATTACHMENT_MAX_FILES) {
    return `Attach up to ${AI_ATTACHMENT_MAX_FILES} files at a time.`;
  }

  const unsupported = files.find((file) => !getAgentAttachmentKind(file));
  if (unsupported) {
    return `${unsupported.name} is not a supported image, PDF, document, spreadsheet, text, or code file.`;
  }

  const zipFiles = files.filter((file) => extensionOf(file.name) === "zip");
  if (zipFiles.length > 1 || (zipFiles.length && files.length > 1)) {
    return "Upload one ZIP project at a time. Add design references after the project is imported.";
  }

  const oversized = files.find((file) =>
    file.size > (extensionOf(file.name) === "zip"
      ? AI_ZIP_MAX_BYTES
      : AI_ATTACHMENT_MAX_BYTES)
  );
  if (oversized) {
    return `${oversized.name} exceeds the ${extensionOf(oversized.name) === "zip" ? "1 GB ZIP" : "50 MB"} file limit.`;
  }

  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (!zipFiles.length && totalBytes > AI_ATTACHMENT_MAX_TOTAL_BYTES) {
    return "Attachments must be 50 MB or smaller in total.";
  }

  return null;
}
