"use client";

import { useEffect, useRef } from "react";

import type { BuilderBlueprint } from "../types/blueprint";
import { useBuilderStore } from "../store/useBuilderStore";

interface BuilderProviderProps {
  blueprint: BuilderBlueprint;
  children: React.ReactNode;
}

export default function BuilderProvider({
  blueprint,
  children,
}: BuilderProviderProps) {
  const initialized = useRef(false);

  const initialize = useBuilderStore((s) => s.initialize);

  useEffect(() => {
    if (!initialized.current) {
      initialize(blueprint);
      initialized.current = true;
    }
  }, [blueprint, initialize]);

  return <>{children}</>;
}