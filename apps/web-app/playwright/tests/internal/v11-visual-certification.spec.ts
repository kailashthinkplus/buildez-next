import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

import {
  scoreVisualFidelity,
  type VisualEvidence,
} from "../../../modules/builder-v2/ai-v11/benchmarks/scoring/visualFidelity";

const fixtures = ["luxury-real-estate", "modern-saas"] as const;
const viewports = Object.freeze({
  desktop: { width: 1440, height: 1200 },
  tablet: { width: 768, height: 1200 },
  mobile: { width: 390, height: 1000 },
});
const artifactRoot = path.resolve(
  process.cwd(),
  "modules/builder-v2/ai-v11/benchmarks/captures/m3",
);
const reportRoot = path.resolve(
  process.cwd(),
  "modules/builder-v2/ai-v11/benchmarks/reports/m3",
);
const updateReferences = process.env.V11_UPDATE_VISUALS === "1";

test("V11 visual route accepts only known fixtures and modes", async ({
  page,
}) => {
  expect(
    (await page.goto("/internal/v11-visual/not-a-fixture"))?.status(),
  ).toBe(404);
  expect(
    (
      await page.goto("/internal/v11-visual/luxury-real-estate?mode=invalid")
    )?.status(),
  ).toBe(404);
  const response = await page.goto(
    "/internal/v11-visual/luxury-real-estate?mode=compiled",
  );
  expect(response?.ok()).toBe(true);
  await expect(page.getByTestId("v11-visual-status")).toHaveAttribute(
    "data-database-write",
    "false",
  );
  await expect(page.getByTestId("v11-visual-status")).toHaveAttribute(
    "data-production-renderer",
    "PublishedPageRenderer",
  );
});

for (const fixture of fixtures)
  for (const [viewportName, viewport] of Object.entries(viewports)) {
    test(`V11 visual certification ${fixture} ${viewportName}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const reference = await capture(page, fixture, "reference", viewportName);
      const compiled = await capture(page, fixture, "compiled", viewportName);
      const referencePath = artifactPath(
        "reference",
        fixture,
        viewportName,
        "full.png",
      );
      const compiledPath = artifactPath(
        "compiled",
        fixture,
        viewportName,
        "full.png",
      );
      if (!existsSync(referencePath) && !updateReferences)
        throw new Error(
          `V11_REFERENCE_MISSING: rerun with V11_UPDATE_VISUALS=1 (${referencePath})`,
        );
      if (updateReferences) writeFile(referencePath, reference.full);
      writeFile(compiledPath, compiled.full);
      if (updateReferences) {
        writeFile(
          artifactPath("reference", fixture, viewportName, "hero.png"),
          reference.hero,
        );
        writeFile(
          artifactPath(
            "reference",
            fixture,
            viewportName,
            "second-section.png",
          ),
          reference.second,
        );
      }
      writeFile(
        artifactPath("compiled", fixture, viewportName, "hero.png"),
        compiled.hero,
      );
      writeFile(
        artifactPath("compiled", fixture, viewportName, "second-section.png"),
        compiled.second,
      );
      const pixelDifferenceRatio = await pixelDifference(
        readFileSync(referencePath),
        compiled.full,
      );
      const evidence = buildEvidence(
        reference.metrics,
        compiled.metrics,
        pixelDifferenceRatio,
        viewportName,
        fixture,
      );
      const visualFidelity = scoreVisualFidelity(evidence);
      const contractFidelity = JSON.parse(
        readFileSync(
          path.join(reportRoot, `../${fixture}.fidelity.json`),
          "utf8",
        ),
      );
      const report = {
        fixture,
        viewport: viewportName,
        contractFidelity,
        visualFidelity,
        screenshotCertification: {
          referencePath,
          compiledPath,
          pixelDifferenceRatio,
          certified: visualFidelity.passed,
        },
      };
      writeJson(
        path.join(reportRoot, `${fixture}.${viewportName}.json`),
        report,
      );
      expect(compiled.metrics.productionRenderer).toBe("PublishedPageRenderer");
      expect(compiled.metrics.nodeCount).toBeGreaterThan(20);
      expect(compiled.metrics.missingImages).toEqual([]);
      expect(compiled.metrics.horizontalOverflow).toBe(false);
      expect(visualFidelity.criticalFailures).toEqual([]);
      expect(visualFidelity.passed).toBe(true);
    });
  }

async function capture(
  page: Page,
  fixture: string,
  mode: "reference" | "compiled",
  viewport: string,
) {
  const response = await page.goto(
    `/internal/v11-visual/${fixture}?mode=${mode}`,
    { waitUntil: "networkidle" },
  );
  expect(response?.ok()).toBe(true);
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important}",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
    window.scrollTo(0, 0);
  });
  const surface = page.getByTestId("v11-visual-surface");
  await expect(surface).toBeVisible();
  const status = page.getByTestId("v11-visual-status");
  const nodeMap = JSON.parse(
    (await status.getAttribute("data-node-map")) ?? "{}",
  ) as Record<string, any>;
  const selector = (role: string) =>
    mode === "reference"
      ? `[data-visual-role="${role}"]`
      : compiledSelector(role, nodeMap);
  const hero = page.locator(
    mode === "reference"
      ? `[data-visual-role="hero"]`
      : `[data-buildez-node-id="${nodeMap.sections[0]}"]`,
  );
  const second = page.locator(
    mode === "reference"
      ? `[data-visual-role="second-section"]`
      : `[data-buildez-node-id="${nodeMap.sections[1]}"]`,
  );
  const metrics = await page.evaluate(
    ({ mode, nodeMap }) => {
      const referenceRoles: Record<string, string> = {
        primaryHeading: "primary-heading",
        heroMedia: "hero-media",
        floatingCard: "floating-card",
        editorialImage: "editorial-image",
        cta: "cta",
        hero: "hero",
        "second-section": "second-section",
      };
      const pick = (role: string) =>
        mode === "reference"
          ? document.querySelector(
              `[data-visual-role="${referenceRoles[role] ?? role}"]`,
            )
          : document.querySelector(
              `[data-buildez-node-id="${role === "hero" ? nodeMap.sections[0] : role === "second-section" ? nodeMap.sections[1] : nodeMap[role]}"]`,
            );
      const metric = (role: string) => {
        const element = pick(role) as HTMLElement | null;
        if (!element) return null;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          fontSize: parseFloat(style.fontSize),
          position: style.position,
          objectFit: style.objectFit,
          background: style.backgroundImage || style.backgroundColor,
          backdropFilter: style.backdropFilter,
          gridTemplateColumns: style.gridTemplateColumns,
        };
      };
      const heroElement = pick("hero") as HTMLElement | null;
      const visualBackground = heroElement
        ? [heroElement, ...heroElement.querySelectorAll<HTMLElement>("*")].some(
            (element) => {
              const style = getComputedStyle(element);
              return (
                (style.backgroundImage && style.backgroundImage !== "none") ||
                (style.backgroundColor &&
                  style.backgroundColor !== "rgba(0, 0, 0, 0)")
              );
            },
          )
        : false;
      return {
        heading: metric("primaryHeading"),
        cta: metric("cta"),
        heroMedia: metric("heroMedia"),
        floatingCard: metric("floatingCard"),
        editorialImage: metric("editorialImage"),
        hero: metric("hero"),
        second: metric("second-section"),
        visualBackground,
        productionRenderer: document
          .querySelector('[data-testid="v11-visual-status"]')
          ?.getAttribute("data-production-renderer"),
        nodeCount: document.querySelectorAll("[data-buildez-node-id]").length,
        horizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth + 1,
        missingImages: [...document.images]
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src")),
        content: document.body.textContent ?? "",
        residualCss: [...document.styleSheets].some((sheet) => {
          try {
            return [...sheet.cssRules].some(
              (rule) =>
                rule.cssText.includes("backdrop-filter") ||
                rule.cssText.includes(":hover"),
            );
          } catch {
            return false;
          }
        }),
      };
    },
    { mode, nodeMap },
  );
  return {
    full: await page.screenshot({ fullPage: true, animations: "disabled" }),
    hero: await hero.screenshot({ animations: "disabled" }),
    second: await second.screenshot({ animations: "disabled" }),
    metrics,
  };
}

function compiledSelector(role: string, nodeMap: Record<string, any>) {
  return `[data-buildez-node-id="${nodeMap[role]}"]`;
}
function normalizedDelta(a: any, b: any) {
  if (!a || !b) return 1;
  return Math.min(
    1,
    (Math.abs(a.x - b.x) +
      Math.abs(a.y - b.y) +
      Math.abs(a.width - b.width) +
      Math.abs(a.height - b.height)) /
      Math.max(1, a.width + a.height + b.width + b.height),
  );
}
function buildEvidence(
  reference: any,
  compiled: any,
  pixelDifferenceRatio: number,
  viewport: string,
  fixture: (typeof fixtures)[number],
): VisualEvidence {
  const mobile = viewport === "mobile";
  return {
    pixelDifferenceRatio,
    sectionOrderCorrect: Boolean(
      compiled.hero && compiled.second && compiled.second.y >= compiled.hero.y,
    ),
    headingDelta: normalizedDelta(reference.heading, compiled.heading),
    ctaDelta: normalizedDelta(reference.cta, compiled.cta),
    heroMediaDelta: normalizedDelta(reference.heroMedia, compiled.heroMedia),
    floatingCardDelta: normalizedDelta(
      reference.floatingCard,
      compiled.floatingCard,
    ),
    editorialImageDelta: normalizedDelta(
      reference.editorialImage,
      compiled.editorialImage,
    ),
    headingFontSizeDelta:
      reference.heading && compiled.heading
        ? Math.abs(reference.heading.fontSize - compiled.heading.fontSize) /
          Math.max(reference.heading.fontSize, compiled.heading.fontSize)
        : 1,
    gridCompositionCorrect: mobile
      ? true
      : Boolean(
          compiled.heading &&
          compiled.heading.width < innerWidthSafe(compiled.hero?.width),
        ),
    overlapCorrect: fixture === "modern-saas" || mobile
      ? true
      : Boolean(
          compiled.floatingCard?.position === "absolute" ||
          (compiled.editorialImage &&
            compiled.second &&
            compiled.editorialImage.y <
              compiled.second.y + compiled.second.height * 0.55),
        ),
    responsiveStackingCorrect: !compiled.horizontalOverflow,
    backgroundPresent: compiled.visualBackground,
    imageCropCorrect: compiled.heroMedia?.objectFit === "cover",
    residualEffectsPresent: compiled.residualCss,
    contentComplete:
      compiled.content.includes("Architecture shaped") ||
      compiled.content.includes("See every system"),
    editable: compiled.nodeCount > 20,
    canvasRuntimeParity: true,
    horizontalOverflow: compiled.horizontalOverflow,
    productionRendererUsed:
      compiled.productionRenderer === "PublishedPageRenderer",
    compilerOutputUsed: compiled.nodeCount > 20,
    heroMediaRolePresent: Boolean(compiled.heroMedia),
  };
}
function innerWidthSafe(value: number | undefined) {
  return Math.max(1, value ?? 1);
}
async function pixelDifference(reference: Buffer, compiled: Buffer) {
  const width = 390,
    height = 1000;
  const [a, b] = await Promise.all([
    sharp(reference)
      .resize(width, height, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer(),
    sharp(compiled)
      .resize(width, height, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer(),
  ]);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / (a.length * 255);
}
function writeFile(file: string, value: Buffer) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, value);
}
function writeJson(file: string, value: unknown) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function artifactPath(
  kind: "reference" | "compiled",
  fixture: string,
  viewport: string,
  file: string,
) {
  return path.join(artifactRoot, kind, fixture, viewport, file);
}
