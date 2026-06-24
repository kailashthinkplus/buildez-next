"use client";

import React, { createContext, useContext } from "react";
import { Blueprint } from "@/modules/builder/blueprint/types";

interface BuilderContextValue {
  blueprint: Blueprint | null;
}

const BuilderContext = createContext<BuilderContextValue>({
  blueprint: null,
});

export function BuilderProvider({
  children,
  blueprint,
}: {
  children: React.ReactNode;
  blueprint: Blueprint;
}) {
  return (
    <BuilderContext.Provider value={{ blueprint }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilderContext() {
  return useContext(BuilderContext);
}
