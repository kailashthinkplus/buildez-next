"use client";

import { useEffect } from "react";

interface GoogleFontLoaderProps {
  family?: string;
  weights?: string[];
}

export function GoogleFontLoader({
  family,
  weights = ["400", "500", "600", "700"],
}: GoogleFontLoaderProps) {
  useEffect(() => {
    if (!family) return;

    const id = `google-font-${family.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(
      /\s+/g,
      "+"
    )}:wght@${weights.join(";")}&display=swap`;

    document.head.appendChild(link);
  }, [family, weights]);

  return null;
}
