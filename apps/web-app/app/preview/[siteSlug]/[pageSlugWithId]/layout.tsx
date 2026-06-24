import { ReactNode } from "react";

export const metadata = {
  robots: "noindex, nofollow",
};

export default function PreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      id="buildez-preview-root"
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#ffffff",
        color: "#000000",

        /* Prevent admin styles from leaking in */
        position: "relative",
        isolation: "isolate",

        /* Safe base font */
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
