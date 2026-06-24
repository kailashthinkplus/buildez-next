import { headers } from "next/headers";

/* ============================================================
   PREVIEW PAGE — APP ROUTER SAFE
   ------------------------------------------------------------
   • NO <html>, <head>, <body>
   • Renders INSIDE PreviewLayout
   • Prevents zero-height flex collapse
============================================================ */

export default async function PreviewPage({
  params,
}: {
  params: { pageSlugWithId: string };
}) {
  const { pageSlugWithId } = params;
  const pageId = pageSlugWithId.split("-").pop();

  if (!pageId) return null;

  const h = headers();
  const host = h.get("host");
  if (!host) return null;

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/preview/${pageId}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const data: {
    html?: string;
    css?: string;
  } = await res.json();

  if (!data?.html) return null;

  return (
    <div
      id="buildez-preview-root"
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#ffffff",
        color: "#000000",
        position: "relative",
        isolation: "isolate",
      }}
    >
      {/* --------------------------------------------
          BASE RESET (REQUIRED)
      -------------------------------------------- */}
      <style>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        .be-section,
        .be-container,
        .be-column {
          width: 100%;
        }

        /* 🔥 CRITICAL: prevent zero-height columns */
        .be-column {
          min-height: 1px;
        }
      `}</style>

      {/* --------------------------------------------
          GENERATED RUNTIME CSS
      -------------------------------------------- */}
      {data.css && (
        <style
          dangerouslySetInnerHTML={{
            __html: data.css,
          }}
        />
      )}

      {/* --------------------------------------------
          GENERATED RUNTIME HTML
      -------------------------------------------- */}
      <div
        dangerouslySetInnerHTML={{
          __html: data.html,
        }}
      />
    </div>
  );
}
