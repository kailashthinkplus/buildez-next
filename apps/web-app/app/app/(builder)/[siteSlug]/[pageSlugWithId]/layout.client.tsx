"use client";

import { useEffect } from "react";

export default function BuilderLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    /* -----------------------------------------
       MARK BODY AS BUILDER MODE
    ----------------------------------------- */
    document.body.setAttribute("data-builder", "true");
    document.body.classList.add("builder-mode");

    /* -----------------------------------------
       LOAD FONTS (IDEMPOTENT)
    ----------------------------------------- */
    const headingFont = "Poppins";
    const bodyFont = "Inter";
    const accentFont = "DM Sans";

    const families = [headingFont, bodyFont, accentFont]
      .map((f) => `family=${encodeURIComponent(f)}:wght@100..900`)
      .join("&");

    const fontLinkId = "buildez-builder-fonts";

    let link = document.getElementById(fontLinkId) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      document.head.appendChild(link);
    }

    /* -----------------------------------------
       CSS VARIABLES (SAFE GLOBAL CONTRACT)
    ----------------------------------------- */
    document.documentElement.style.setProperty(
      "--font-heading",
      headingFont
    );
    document.documentElement.style.setProperty(
      "--font-body",
      bodyFont
    );
    document.documentElement.style.setProperty(
      "--font-accent",
      accentFont
    );

    /* -----------------------------------------
       CLEANUP ON UNMOUNT
    ----------------------------------------- */
    return () => {
      document.body.removeAttribute("data-builder");
      document.body.classList.remove("builder-mode");

      // Fonts intentionally NOT removed
      // Prevents layout shift on route transitions
    };
  }, []);

  return <>{children}</>;
}
