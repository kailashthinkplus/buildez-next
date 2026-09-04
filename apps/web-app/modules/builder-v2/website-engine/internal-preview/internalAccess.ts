export function isInternalPreviewAvailable(environment = process.env.NODE_ENV): boolean {
  return environment !== "production";
}

