import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parseTsx } from "../../ast/parser";
import { normalizeTsx } from "../../ast/normalize";
import { buildDesignGraph } from "../../design-graph/builder";
import { validateDesignGraph } from "../../design-graph/validator";
import { compileDesignGraphToBlueprint } from "../../compiler/blueprintCompiler";
import { validateBlueprint } from "../../../core/validation";
import {
  deserializeBlueprint,
  serializeBlueprint,
} from "../../../core/serialization";
import { validateFullPageCompleteness } from "../../validator/fullPageCompleteness";

export const V11_ENGINEERING_FIXTURE_IDS = [
  "luxury-real-estate",
  "modern-saas",
  "editorial-architecture",
  "luxury-product-launch",
  "coastal-resort",
  "minimal-advisory",
  "bento-software",
  "creative-agency",
] as const;
export const V11_PREMIUM_FIXTURE_IDS = [
  "solstice-residences",
  "field-form-studio",
  "lattice-ai",
  "meridian-capital",
  "isla-noma",
  "arc-one",
  "nocturne-edition",
  "counterform",
  "atelier-health",
  "aurelia-one",
] as const;
export const V11_COMPLETE_SINGLE_FILE_FIXTURE_IDS = [
  "full-page-engineering-company",
  "aznac-parity-single-file",
  "sanjeevini-premium-parity",
] as const;
export const V11_VISUAL_FIXTURE_IDS = [
  ...V11_ENGINEERING_FIXTURE_IDS,
  ...V11_PREMIUM_FIXTURE_IDS,
  ...V11_COMPLETE_SINGLE_FILE_FIXTURE_IDS,
] as const;
export type V11VisualFixtureId = (typeof V11_VISUAL_FIXTURE_IDS)[number];
export type V11PremiumFixtureId = (typeof V11_PREMIUM_FIXTURE_IDS)[number];

export function isV11PremiumFixtureId(
  value: string,
): value is V11PremiumFixtureId {
  return (V11_PREMIUM_FIXTURE_IDS as readonly string[]).includes(value);
}

export function isV11VisualFixtureId(
  value: string,
): value is V11VisualFixtureId {
  return (V11_VISUAL_FIXTURE_IDS as readonly string[]).includes(value);
}

export function isV11VisualPreviewAvailable(
  environment = process.env.NODE_ENV,
): boolean {
  return environment === "development" || environment === "test";
}

export function buildV11VisualFixture(id: V11VisualFixtureId) {
  const current = dirname(fileURLToPath(import.meta.url));
  const sourceFile = resolve(
    current,
    "../../fixtures",
    isV11PremiumFixtureId(id) ? "premium" : "",
    `${id}.tsx`,
  );
  const source = readFileSync(sourceFile, "utf8");
  const parsed = parseTsx(source, sourceFile);
  const normalized = normalizeTsx(parsed);
  const graph = buildDesignGraph(normalized);
  const graphValidation = validateDesignGraph(graph);
  if (!graphValidation.valid)
    throw new Error(
      `V11_VISUAL_GRAPH_INVALID: ${graphValidation.issues.join(",")}`,
    );
  const compilation = compileDesignGraphToBlueprint(graph);
  const validation = validateBlueprint(compilation.blueprint);
  if (!validation.valid)
    throw new Error(
      `V11_VISUAL_BLUEPRINT_INVALID: ${validation.issues.map((issue) => issue.code).join(",")}`,
    );
  const serialized = serializeBlueprint(compilation.blueprint);
  if (!serialized.ok) throw new Error("V11_VISUAL_SERIALIZATION_FAILED");
  const roundTrip = deserializeBlueprint(serialized.value);
  if (!roundTrip.ok) throw new Error("V11_VISUAL_ROUND_TRIP_FAILED");
  const completeness = (
    V11_COMPLETE_SINGLE_FILE_FIXTURE_IDS as readonly string[]
  ).includes(id)
    ? validateFullPageCompleteness({
        source,
        ast: parsed.ast,
        graph,
        blueprint: roundTrip.value,
        diagnostics: compilation.diagnostics,
      })
    : undefined;
  if (completeness && !completeness.valid)
    throw new Error(
      `V11_FULL_PAGE_INCOMPLETE: ${completeness.issues.join(" ")}`,
    );
  const byRole = (role: string) =>
    Object.values(graph.nodes).find(
      (node) => node.semanticRole === role || node.media?.role === role,
    )?.id;
  const floatingMedia = Object.values(graph.nodes).find(
    (node) => node.media?.role === "floating-card-image",
  );
  const heroForeground = Object.values(graph.nodes).find(
    (node) => node.media?.role === "hero-foreground",
  );
  const sections = Object.values(graph.nodes)
    .filter((node) => node.type === "section")
    .map((node) => node.id);
  return Object.freeze({
    id,
    classification: isV11PremiumFixtureId(id)
      ? ("premium-candidate" as const)
      : (V11_COMPLETE_SINGLE_FILE_FIXTURE_IDS as readonly string[]).includes(id)
        ? ("complete-single-file" as const)
        : ("engineering-regression" as const),
    sourceFile,
    graph,
    blueprint: roundTrip.value,
    diagnostics: compilation.diagnostics,
    completeness,
    nodeMap: Object.freeze({
      sections,
      primaryHeading: byRole("primary-heading"),
      cta: byRole("call-to-action"),
      heroMedia: byRole(
        id === "luxury-real-estate" || id === "coastal-resort"
          ? "hero-background"
          : "hero-foreground",
      ),
      floatingCard: floatingMedia?.parentId ?? heroForeground?.parentId,
      floatingCardMedia: floatingMedia?.id,
      editorialImage: byRole("editorial-image"),
    }),
  });
}
