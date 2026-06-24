"use client";

import type { ReactNode } from "react";

interface FieldGroupProps {
  label: string;
  children: ReactNode;
}

export default function FieldGroup({
  label,
  children,
}: FieldGroupProps) {
  return (
    <section className="space-y-2">
      <div className="text-xs font-medium text-white/60">
        {label}
      </div>

      {children}
    </section>
  );
}