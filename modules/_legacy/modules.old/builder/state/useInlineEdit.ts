"use client";

import { useState, useRef, useEffect } from "react";
import { useBlueprintStore } from "./useBlueprintStore";

export function useInlineEdit(section: any, field: string) {
  const { selectedId, updateProps, blueprint } = useBlueprintStore();
  const page = blueprint.currentPage;

  const isActive = selectedId === section.id;
  const value = section.props?.[field] || "";

  const ref = useRef<HTMLDivElement | null>(null);
  const [localValue, setLocalValue] = useState(value);

  // Sync inspector → inline
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const onInput = (e: any) => {
    const text = e.target.innerText;
    setLocalValue(text);
  };

  const onBlur = () => {
    updateProps(page, section.id, { [field]: localValue });
  };

  return {
    ref,
    isActive,
    localValue,
    onInput,
    onBlur,
  };
}
