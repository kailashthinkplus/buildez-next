import type { ComponentVariantCompiler } from "../ComponentVariantCompiler";
import { button, column, container, engineIntent, gutter, heading, image, nodeId, sectionSpacing, seed, text } from "./heroRecipePrimitives";

export const HeroEditorialSplitCompiler: ComponentVariantCompiler = Object.freeze({
  variantId: "HeroEditorialSplit01",
  compile(context) {
  const root = nodeId(context, "container");
  const copy = nodeId(context, "column.editorial-copy");
  const media = nodeId(context, "column.editorial-media");
  const actions = nodeId(context, "container.actions");
  const spacing = sectionSpacing(context);
  const intent = engineIntent(context);
  return [
    seed(context, { id: context.sectionNodeId, type: "section", name: "Editorial split hero", parentId: "page.root", children: [root], props: { role: "hero", semanticRole: "editorial-split", purpose: context.section.purpose, componentVariant: "HeroEditorialSplit01", ...intent }, style: { paddingTop: { desktop: spacing, tablet: Math.round(spacing * .78), mobile: Math.round(spacing * .58) }, paddingBottom: { desktop: spacing, tablet: Math.round(spacing * .78), mobile: Math.round(spacing * .58) }, backgroundColor: context.input.designResult?.colorProfile.background ?? "#ffffff" } }),
    seed(context, { id: root, type: "container", name: "Editorial asymmetric frame", parentId: context.sectionNodeId, children: [copy, media], props: { semanticRole: "editorial-frame", mobileOrder: "copy-media" }, style: { display: "grid", width: "100%", maxWidth: context.input.designResult?.layoutProfile.maxWidth ?? "1180px", margin: "0 auto", paddingLeft: { desktop: gutter(context), tablet: 20, mobile: 16 }, paddingRight: { desktop: gutter(context), tablet: 20, mobile: 16 }, gridTemplateColumns: { desktop: "1.05fr .95fr", tablet: "1fr 1fr", mobile: "1fr" }, gap: { desktop: 72, tablet: 40, mobile: 30 }, alignItems: "center" } }),
    column(context, "column.editorial-copy", root, [nodeId(context, "text.eyebrow"), nodeId(context, "heading.headline"), nodeId(context, "text.supporting_copy"), actions], { gap: { desktop: 22, tablet: 18, mobile: 16 } }),
    text(context, copy, "eyebrow", 14), heading(context, copy), text(context, copy, "supporting_copy", 19),
    container(context, "container.actions", copy, [nodeId(context, "button.primary_cta"), nodeId(context, "button.secondary_cta")], { display: "flex", flexDirection: "row", gap: 12 }),
    button(context, actions, "primary_cta"), button(context, actions, "secondary_cta", true),
    column(context, "column.editorial-media", root, [nodeId(context, "image.editorial_image")]),
    image(context, media, "editorial_image", "4 / 5"),
  ];
  },
});

export const HeroEditorialSplitRecipe = HeroEditorialSplitCompiler.compile.bind(HeroEditorialSplitCompiler);
