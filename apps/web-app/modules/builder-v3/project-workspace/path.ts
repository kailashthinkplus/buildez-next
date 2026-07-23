const MAX_PROJECT_PATH_LENGTH = 240;

export function normalizeProjectPath(input: string): string {
  const value = input.trim().replaceAll("\\", "/");
  const normalized = value.replace(/^\.\//, "").replace(/\/{2,}/g, "/");

  if (!normalized || normalized.startsWith("/") || normalized.length > MAX_PROJECT_PATH_LENGTH) {
    throw new Error("Invalid project path");
  }

  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Project path traversal is not allowed");
  }

  if (segments.some((segment) => segment.includes("\0"))) {
    throw new Error("Invalid project path");
  }

  return normalized;
}
