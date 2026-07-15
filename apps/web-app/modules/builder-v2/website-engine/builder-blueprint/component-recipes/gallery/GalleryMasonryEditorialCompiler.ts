import type { ComponentVariantCompiler } from "../ComponentVariantCompiler";
import { galleryColumn, galleryContainer, galleryGutter, galleryHeading, galleryId, galleryImage, galleryIntent, gallerySeed, gallerySpacing, galleryText } from "./galleryCompilerPrimitives";

export const GalleryMasonryEditorialCompiler: ComponentVariantCompiler = Object.freeze({
  variantId: "GalleryMasonryEditorial01",
  compile(context) {
    const root = galleryId(context, "container.gallery-editorial");
    const intro = galleryId(context, "column.gallery-intro");
    const canvas = galleryId(context, "column.masonry-canvas");
    const masonry = galleryId(context, "container.masonry");
    const lanes = [1, 2, 3].map((index) => galleryId(context, `column.masonry-lane-${index}`));
    const spacing = gallerySpacing(context);
    const nodes = [
      gallerySeed(context, { id: context.sectionNodeId, type: "section", name: "Editorial masonry gallery", parentId: "page.root", children: [root], props: { role: "gallery", semanticRole: "editorial-masonry", purpose: context.section.purpose, componentVariant: "GalleryMasonryEditorial01", ...galleryIntent(context) }, style: { paddingTop: { desktop: spacing, tablet: Math.round(spacing * .76), mobile: Math.round(spacing * .56) }, paddingBottom: { desktop: spacing, tablet: Math.round(spacing * .76), mobile: Math.round(spacing * .56) }, backgroundColor: context.input.designResult?.colorProfile.background ?? "#ffffff" } }),
      gallerySeed(context, { id: root, type: "container", name: "Editorial gallery frame", parentId: context.sectionNodeId, children: [intro, canvas], props: { semanticRole: "editorial-gallery-frame", mobileOrder: "intro-masonry" }, style: { display: "grid", width: "100%", maxWidth: context.input.designResult?.layoutProfile.maxWidth ?? "1180px", margin: "0 auto", paddingLeft: { desktop: galleryGutter(context), tablet: 20, mobile: 16 }, paddingRight: { desktop: galleryGutter(context), tablet: 20, mobile: 16 }, gridTemplateColumns: { desktop: ".32fr .68fr", tablet: "1fr", mobile: "1fr" }, gap: { desktop: 48, tablet: 32, mobile: 24 }, alignItems: "start" } }),
      galleryColumn(context, "column.gallery-intro", root, [galleryId(context, "heading.headline"), galleryId(context, "text.description")], { gap: 16 }),
      galleryHeading(context, intro), galleryText(context, intro, "description", 17),
      galleryColumn(context, "column.masonry-canvas", root, [masonry]),
      galleryContainer(context, "container.masonry", canvas, lanes, { display: "grid", gridTemplateColumns: { desktop: "repeat(3, minmax(0, 1fr))", tablet: "repeat(2, minmax(0, 1fr))", mobile: "1fr" }, gap: { desktop: 18, tablet: 16, mobile: 14 }, alignItems: "start" }),
    ];
    lanes.forEach((laneId, laneIndex) => {
      const itemIndexes = [laneIndex + 1, laneIndex + 4];
      const cards = itemIndexes.map((index) => galleryId(context, `container.masonry-item-${index}`));
      nodes.push(galleryColumn(context, `column.masonry-lane-${laneIndex + 1}`, masonry, cards, { gap: { desktop: 22, tablet: 18, mobile: 14 }, paddingTop: { desktop: laneIndex * 36, tablet: laneIndex % 2 ? 28 : 0, mobile: 0 } }));
      itemIndexes.forEach((itemIndex, cardIndex) => {
        const role = `item_${itemIndex}`;
        const cardId = cards[cardIndex];
        nodes.push(galleryContainer(context, `container.masonry-item-${itemIndex}`, laneId, [galleryId(context, `image.${role}`), galleryId(context, `text.${role}_caption`)], { display: "flex", flexDirection: "column", gap: 10 }));
        nodes.push(galleryImage(context, cardId, role, itemIndex % 2 ? "4 / 5" : "3 / 2"), galleryText(context, cardId, `${role}_caption`, 14));
      });
    });
    return nodes;
  },
});
