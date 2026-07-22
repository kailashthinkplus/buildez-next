import Link from "next/link";
import { notFound } from "next/navigation";
import {
  V11_ENGINEERING_FIXTURE_IDS,
  V11_COMPLETE_SINGLE_FILE_FIXTURE_IDS,
  V11_PREMIUM_FIXTURE_IDS,
  buildV11VisualFixture,
  isV11VisualPreviewAvailable,
} from "@/modules/builder-v2/ai-v11/benchmarks/visual/visualFixture";

export const dynamic = "force-dynamic";

export default function V11VisualIndex() {
  if (!isV11VisualPreviewAvailable()) notFound();
  return (
    <main
      style={{
        background: "#0b0d12",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
        minHeight: "100vh",
        padding: "64px 24px",
      }}
    >
      <div style={{ margin: "0 auto", maxWidth: 1120 }}>
        <p
          style={{
            color: "#67e8f9",
            letterSpacing: ".14em",
            textTransform: "uppercase",
          }}
        >
          BuildEZ AI V11 · internal only
        </p>
        <h1 style={{ fontSize: 48, marginBottom: 12 }}>
          Visual fixture previews
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: 48 }}>
          Every compiled link parses source text and renders the resulting
          round-tripped Blueprint through PublishedPageRenderer. Source TSX is
          never imported or executed.
        </p>
      <FixtureGroup
        title="Complete single-file V11 website"
        ids={V11_COMPLETE_SINGLE_FILE_FIXTURE_IDS}
      />
      <FixtureGroup
        title="Premium candidate fixtures"
          ids={V11_PREMIUM_FIXTURE_IDS}
        />
        <FixtureGroup
          title="Engineering regression fixtures"
          ids={V11_ENGINEERING_FIXTURE_IDS}
        />
      </div>
    </main>
  );
}

function FixtureGroup({
  title,
  ids,
}: {
  title: string;
  ids: readonly Parameters<typeof buildV11VisualFixture>[0][];
}) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2
        style={{
          borderBottom: "1px solid #334155",
          fontSize: 24,
          paddingBottom: 12,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
        }}
      >
        {ids.map((id) => {
          const fixture = buildV11VisualFixture(id);
          return (
            <Link
              key={id}
              href={`/internal/v11-visual/${id}`}
              style={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: 12,
                color: "inherit",
                padding: 18,
                textDecoration: "none",
              }}
            >
              <strong>{id}</strong>
              <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>
                {Object.keys(fixture.blueprint.nodes).length} nodes ·{" "}
                {fixture.diagnostics.length} diagnostics
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
