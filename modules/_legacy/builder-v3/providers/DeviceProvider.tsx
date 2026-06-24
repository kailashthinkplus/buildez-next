"use client";

import React, { createContext, useContext, useState } from "react";

interface DeviceContextValue {
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
}

const DeviceContext = createContext<DeviceContextValue>({
  device: "desktop",
  setDevice: () => {},
});

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  return (
    <DeviceContext.Provider value={{ device, setDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
