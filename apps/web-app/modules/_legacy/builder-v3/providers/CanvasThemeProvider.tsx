"use client";

import React, { createContext, useContext, useState } from "react";

interface CanvasThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const CanvasThemeContext = createContext<CanvasThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

export function CanvasThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <CanvasThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </CanvasThemeContext.Provider>
  );
}

export function useCanvasTheme() {
  return useContext(CanvasThemeContext);
}
