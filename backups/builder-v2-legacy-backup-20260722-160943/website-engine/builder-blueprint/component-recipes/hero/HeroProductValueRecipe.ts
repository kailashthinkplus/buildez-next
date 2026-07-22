import type { ComponentVariantCompiler } from "../ComponentVariantCompiler";
import { button, column, container, engineIntent, gutter, heading, image, nodeId, sectionSpacing, seed, text } from "./heroRecipePrimitives";

export const HeroProductValueCompiler: ComponentVariantCompiler = Object.freeze({
  variantId: "HeroProductValue01",
  compile(context) {
  const root = nodeId(context, "container");
  const intro = nodeId(context, "container.product-intro");
  const stage = nodeId(context, "container.product-stage");
  const copy = nodeId(context, "column.product-value");
  const media = nodeId(context, "column.product-media");
  const proof = nodeId(context, "container.feature-points");
  const points = [1, 2, 3].map((index) => nodeId(context, `text.feature_point_${index}`));
  const spacing = sectionSpacing(context);
  const intent = engineIntent(context);
  return [
    seed(context, { id: context.sectionNodeId, type: "section", name: "Product value hero", parentId: "page.root", children: [root], props: { role: "hero", semanticRole: "product-value", purpose: context.section.purpose, componentVariant: "HeroProductValue01", ...intent }, style: { paddingTop: { desktop: Math.round(spacing * .82), tablet: Math.round(spacing * .66), mobile: Math.round(spacing * .5) }, paddingBottom: { desktop: spacing, tablet: Math.round(spacing * .72), mobile: Math.round(spacing * .55) }, backgroundColor: context.input.designResult?.colorProfile.background ?? "#ffffff" } }),
    seed(context, { id: root, type: "container", name: "Product value frame", parentId: context.sectionNodeId, children: [intro, stage], props: { semanticRole: "product-frame", mobileOrder: "value-product-proof" }, style: { display: "flex", flexDirection: "column", width: "100%", maxWidth: context.input.designResult?.layoutProfile.maxWidth ?? "1180px", margin: "0 auto", paddingLeft: { desktop: gutter(context), tablet: 20, mobile: 16 }, paddingRight: { desktop: gutter(context), tablet: 20, mobile: 16 }, gap: { desktop: 34, tablet: 28, mobile: 22 } } }),
    container(context, "container.product-intro", root, [nodeId(context, "heading.headline"), nodeId(context, "text.supporting_copy"), nodeId(context, "button.primary_cta")], { display: "grid", gridTemplateColumns: { desktop: "1.2fr 1fr auto", tablet: "1fr 1fr", mobile: "1fr" }, gap: { desktop: 26, tablet: 20, mobile: 16 }, alignItems: "center" }),
    heading(context, intro, "headline", "h1", 54), text(context, intro, "supporting_copy"), button(context, intro, "primary_cta"),
    container(context, "container.product-stage", root, [media, copy], { display: "grid", gridTemplateColumns: { desktop: "1.25fr .75fr", tablet: "1fr 1fr", mobile: "1fr" }, gap: { desktop: 30, tablet: 24, mobile: 18 }, alignItems: "stretch" }),
    column(context, "column.product-value", stage, [proof], { justifyContent: "center", gap: 18 }),
    container(context, "container.feature-points", copy, points, { display: "grid", gridTemplateColumns: { desktop: "repeat(3, 1fr)", tablet: "1fr", mobile: "1fr" }, gap: 12 }),
    ...points.map((_, index) => text(context, proof, `feature_point_${index + 1}`, 14)),
    column(context, "column.product-media", stage, [nodeId(context, "image.product_media")], { padding: { desktop: 28, tablet: 20, mobile: 16 }, backgroundColor: context.input.designResult?.colorProfile.muted ?? "#f3f4f6", borderRadius: context.input.designResult?.themeProfile.radius ?? 18 }),
    image(context, media, "product_media", "16 / 11", "contain"),
  ];
  },
});

export const HeroProductValueRecipe = HeroProductValueCompiler.compile.bind(HeroProductValueCompiler);
