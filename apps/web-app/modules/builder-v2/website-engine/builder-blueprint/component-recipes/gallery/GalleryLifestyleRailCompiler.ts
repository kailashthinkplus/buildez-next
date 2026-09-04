import type { ComponentVariantCompiler } from "../ComponentVariantCompiler";
import { galleryColumn, galleryContainer, galleryGutter, galleryHeading, galleryId, galleryImage, galleryIntent, gallerySeed, gallerySpacing, galleryText } from "./galleryCompilerPrimitives";

export const GalleryLifestyleRailCompiler: ComponentVariantCompiler = Object.freeze({
  variantId: "GalleryLifestyleRail01",
  compile(context) {
    const root = galleryId(context, "container.lifestyle-rail");
    const intro = galleryId(context, "column.rail-intro");
    const viewport = galleryId(context, "column.rail-viewport");
    const track = galleryId(context, "container.rail-track");
    const items = [1, 2, 3, 4].map((index) => galleryId(context, `column.rail-item-${index}`));
    const spacing = gallerySpacing(context);
    const nodes = [
      gallerySeed(context, { id: context.sectionNodeId, type: "section", name: "Lifestyle gallery rail", parentId: "page.root", children: [root], props: { role: "gallery", semanticRole: "lifestyle-rail", purpose: context.section.purpose, componentVariant: "GalleryLifestyleRail01", ...galleryIntent(context) }, style: { paddingTop: { desktop: Math.round(spacing * .82), tablet: Math.round(spacing * .68), mobile: Math.round(spacing * .5) }, paddingBottom: { desktop: Math.round(spacing * .82), tablet: Math.round(spacing * .68), mobile: Math.round(spacing * .5) }, backgroundColor: context.input.designResult?.colorProfile.background ?? "#ffffff" } }),
      gallerySeed(context, { id: root, type: "container", name: "Lifestyle rail frame", parentId: context.sectionNodeId, children: [intro, viewport], props: { semanticRole: "rail-frame", mobileInteraction: "horizontal-swipe" }, style: { display: "flex", flexDirection: "column", width: "100%", maxWidth: context.input.designResult?.layoutProfile.maxWidth ?? "1180px", margin: "0 auto", paddingLeft: { desktop: galleryGutter(context), tablet: 20, mobile: 16 }, paddingRight: { desktop: galleryGutter(context), tablet: 20, mobile: 0 }, gap: { desktop: 30, tablet: 24, mobile: 20 }, overflow: "hidden" } }),
      galleryColumn(context, "column.rail-intro", root, [galleryId(context, "heading.headline"), galleryId(context, "text.description")], { display: "grid", gridTemplateColumns: { desktop: "1fr 1fr", tablet: "1fr 1fr", mobile: "1fr" }, gap: 18, alignItems: "end", paddingRight: { mobile: 16 } }),
      galleryHeading(context, intro), galleryText(context, intro, "description", 17),
      galleryColumn(context, "column.rail-viewport", root, [track], { overflow: "auto", paddingBottom: 12 }),
      galleryContainer(context, "container.rail-track", viewport, items, { display: "grid", gridTemplateColumns: { desktop: "repeat(4, minmax(250px, 1fr))", tablet: "repeat(4, minmax(230px, 1fr))", mobile: "repeat(4, 82%)" }, gap: { desktop: 18, tablet: 16, mobile: 12 }, width: { desktop: "100%", tablet: "max-content", mobile: "max-content" }, paddingRight: { mobile: 16 } }),
    ];
    items.forEach((itemId, index) => {
      const role = `item_${index + 1}`;
      nodes.push(galleryColumn(context, `column.rail-item-${index + 1}`, track, [galleryId(context, `image.${role}`), galleryId(context, `text.${role}_caption`)], { gap: 10, minWidth: 0 }));
      nodes.push(galleryImage(context, itemId, role, index % 2 ? "4 / 5" : "3 / 4"), galleryText(context, itemId, `${role}_caption`, 14));
    });
    return nodes;
  },
});
