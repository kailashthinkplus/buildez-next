import type { ComponentVariantCompiler } from "../ComponentVariantCompiler";
import { button, column, container, engineIntent, gutter, heading, nodeId, sectionSpacing, seed, text } from "./heroRecipePrimitives";

export const HeroBookingFocusedCompiler: ComponentVariantCompiler = Object.freeze({
  variantId: "HeroBookingFocused01",
  compile(context) {
  const root = nodeId(context, "container");
  const intro = nodeId(context, "column.booking-intro");
  const action = nodeId(context, "column.booking-action");
  const trust = nodeId(context, "container.reassurance");
  const spacing = sectionSpacing(context);
  const intent = engineIntent(context);
  return [
    seed(context, { id: context.sectionNodeId, type: "section", name: "Booking focused hero", parentId: "page.root", children: [root], props: { role: "hero", semanticRole: "booking-action", purpose: context.section.purpose, componentVariant: "HeroBookingFocused01", ...intent }, style: { paddingTop: { desktop: Math.round(spacing * .72), tablet: Math.round(spacing * .58), mobile: Math.round(spacing * .45) }, paddingBottom: { desktop: Math.round(spacing * .72), tablet: Math.round(spacing * .58), mobile: Math.round(spacing * .45) }, backgroundColor: context.input.designResult?.colorProfile.background ?? "#ffffff" } }),
    seed(context, { id: root, type: "container", name: "Booking action frame", parentId: context.sectionNodeId, children: [intro, action, trust], props: { semanticRole: "booking-frame", mobileOrder: "intro-action-reassurance" }, style: { display: "grid", width: "100%", maxWidth: context.input.designResult?.layoutProfile.maxWidth ?? "1180px", margin: "0 auto", paddingLeft: { desktop: gutter(context), tablet: 20, mobile: 16 }, paddingRight: { desktop: gutter(context), tablet: 20, mobile: 16 }, gridTemplateColumns: { desktop: "1.2fr .8fr", tablet: "1fr 1fr", mobile: "1fr" }, gap: { desktop: 28, tablet: 22, mobile: 18 }, alignItems: "center" } }),
    column(context, "column.booking-intro", root, [nodeId(context, "heading.headline"), nodeId(context, "text.supporting_copy")], { gap: 18 }),
    heading(context, intro, "headline", "h1", 52), text(context, intro, "supporting_copy"),
    column(context, "column.booking-action", root, [nodeId(context, "button.booking_cta"), nodeId(context, "text.availability_caution")], { gap: 12, padding: { desktop: 30, tablet: 24, mobile: 20 }, backgroundColor: context.input.designResult?.colorProfile.muted ?? "#f3f4f6", borderRadius: context.input.designResult?.themeProfile.radius ?? 16 }),
    button(context, action, "booking_cta"), text(context, action, "availability_caution", 14),
    container(context, "container.reassurance", root, [nodeId(context, "text.reassurance_1"), nodeId(context, "text.reassurance_2")], { display: "flex", flexDirection: "row", gap: 20, gridColumn: { desktop: "1 / -1", tablet: "1 / -1", mobile: "auto" }, border: `1px solid ${context.input.designResult?.colorProfile.muted ?? "#e5e7eb"}`, padding: { desktop: 18, tablet: 16, mobile: 14 } }),
    text(context, trust, "reassurance_1", 14), text(context, trust, "reassurance_2", 14),
  ];
  },
});

export const HeroBookingFocusedRecipe = HeroBookingFocusedCompiler.compile.bind(HeroBookingFocusedCompiler);
