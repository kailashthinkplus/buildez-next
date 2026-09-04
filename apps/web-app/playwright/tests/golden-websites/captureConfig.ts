export const GOLDEN_CAPTURE_VIEWPORTS = Object.freeze({
  desktop: Object.freeze({ width: 1440, height: 1000 }),
  tablet: Object.freeze({ width: 1024, height: 900 }),
  mobile: Object.freeze({ width: 390, height: 844 }),
});

export function goldenCaptureUrl(baseUrl: string, fixtureId: string): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}case=${encodeURIComponent(fixtureId)}`;
}
