export type Device = "desktop" | "tablet" | "mobile";

export interface PreviewState {
  device: Device;
  zoom: number;
  isPreviewMode: boolean;
}
