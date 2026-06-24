export interface DeviceFrame {
  width: number;
  height: number;
}

export const DeviceFrames: Record<string, DeviceFrame> = {
  desktop: { width: 1200, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};
