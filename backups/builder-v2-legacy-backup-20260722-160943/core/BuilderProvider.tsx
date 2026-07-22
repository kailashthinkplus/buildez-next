"use client";

import { ReactNode } from "react";

export default function BuilderProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}