import { buildInlineTextProps } from "../../../canvas/inlineTextUpdate";
import { createTestBuilderNode } from "../../helpers/testNodeFactory";
import { assertCondition, createRegressionSpec } from "../../helpers/testAssertions";

const button = createTestBuilderNode("button", "container", {
  props: { label: "Keep me", text: "Keep me", href: "#keep" },
});
const heading = createTestBuilderNode("heading", "container", {
  props: { text: "Same heading", level: "h2" },
});
const changedButton = buildInlineTextProps(button, "Changed") as Record<string, unknown> | null;

export const inlineTextNoopSpec = createRegressionSpec({
  id: "rc-t3/operations/inline-text-noop",
  title: "Inline blur does not create phantom Builder mutations",
  bugIds: ["BRC-0018"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Node",
  assertions: [
    assertCondition("unchanged button text produces no patch", buildInlineTextProps(button, "Keep me") === null),
    assertCondition("unchanged heading text produces no patch", buildInlineTextProps(heading, "Same heading") === null),
    assertCondition("changed button updates label and text", changedButton?.label === "Changed" && changedButton?.text === "Changed"),
    assertCondition("changed button preserves sibling props", changedButton?.href === "#keep"),
  ],
});
