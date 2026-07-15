import type { ComponentVariantCompiler } from "../ComponentVariantCompiler";
import { button, column, container, engineIntent, gutter, heading, nodeId, sectionSpacing, seed, text } from "./heroRecipePrimitives";

export const HeroAppointmentFocusedCompiler: ComponentVariantCompiler = Object.freeze({
  variantId: "HeroAppointmentFocused01",
  compile(context) {
  const root = nodeId(context, "container");
  const content = nodeId(context, "column.appointment-content");
  const help = nodeId(context, "container.appointment-help");
  const process = nodeId(context, "column.process-help");
  const trust = nodeId(context, "column.trust-note");
  const spacing = sectionSpacing(context);
  const intent = engineIntent(context);
  return [
    seed(context, { id: context.sectionNodeId, type: "section", name: "Appointment focused hero", parentId: "page.root", children: [root], props: { role: "hero", semanticRole: "appointment-guidance", purpose: context.section.purpose, componentVariant: "HeroAppointmentFocused01", ...intent }, style: { paddingTop: { desktop: spacing, tablet: Math.round(spacing * .8), mobile: Math.round(spacing * .6) }, paddingBottom: { desktop: spacing, tablet: Math.round(spacing * .8), mobile: Math.round(spacing * .6) }, backgroundColor: context.input.designResult?.colorProfile.background ?? "#ffffff" } }),
    seed(context, { id: root, type: "container", name: "Appointment guidance frame", parentId: context.sectionNodeId, children: [content, help], props: { semanticRole: "appointment-frame", mobileOrder: "content-process-trust" }, style: { display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: context.input.designResult?.layoutProfile.maxWidth ?? "1180px", margin: "0 auto", paddingLeft: { desktop: gutter(context), tablet: 20, mobile: 16 }, paddingRight: { desktop: gutter(context), tablet: 20, mobile: 16 }, gap: { desktop: 38, tablet: 30, mobile: 24 }, textAlign: "center" } }),
    column(context, "column.appointment-content", root, [nodeId(context, "text.eyebrow"), nodeId(context, "heading.headline"), nodeId(context, "text.supporting_copy"), nodeId(context, "button.appointment_cta")], { alignItems: "center", gap: 17, maxWidth: 780 }),
    text(context, content, "eyebrow", 14), heading(context, content, "headline", "h1", 50), text(context, content, "supporting_copy"), button(context, content, "appointment_cta"),
    container(context, "container.appointment-help", root, [process, trust], { display: "grid", gridTemplateColumns: { desktop: "1fr 1fr", tablet: "1fr 1fr", mobile: "1fr" }, gap: 18, width: "100%", maxWidth: 880 }),
    column(context, "column.process-help", help, [nodeId(context, "heading.process_title"), nodeId(context, "text.process_help")], { gap: 10, padding: { desktop: 24, tablet: 20, mobile: 18 }, border: `1px solid ${context.input.designResult?.colorProfile.muted ?? "#e5e7eb"}` }),
    heading(context, process, "process_title", "h2", 24), text(context, process, "process_help", 15),
    column(context, "column.trust-note", help, [nodeId(context, "heading.trust_title"), nodeId(context, "text.trust_note")], { gap: 10, padding: { desktop: 24, tablet: 20, mobile: 18 }, backgroundColor: context.input.designResult?.colorProfile.muted ?? "#f3f4f6" }),
    heading(context, trust, "trust_title", "h2", 24), text(context, trust, "trust_note", 15),
  ];
  },
});

export const HeroAppointmentFocusedRecipe = HeroAppointmentFocusedCompiler.compile.bind(HeroAppointmentFocusedCompiler);
