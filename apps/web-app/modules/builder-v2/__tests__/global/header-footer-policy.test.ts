import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import {
  HEADER_FOOTER_EDITABLE_POLICY,
  canEmitGlobalSectionFromAI,
  canUseOpaqueGlobalSection,
  validateGlobalSectionOutput,
} from "../../theme/globalSectionPolicy";

const headerOpaque = validateGlobalSectionOutput("header", { opaqueMarkup: "<header>Opaque</header>" });
const footerOpaque = validateGlobalSectionOutput("footer", { opaqueMarkup: "<footer>Opaque</footer>" });

export const headerFooterPolicySpec = createRegressionSpec({
  id: "global/header-footer-policy",
  title: "Header/footer editable global section policy",
  bugIds: ["BUG-0004"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Connect to global section implementation once native editable header/footer structures exist.",
  assertions: [
    assertEqual("policy includes header and footer", HEADER_FOOTER_EDITABLE_POLICY.length, 2),
    assertCondition("header AI generation is blocked", !canEmitGlobalSectionFromAI("header")),
    assertCondition("footer AI generation is blocked", !canEmitGlobalSectionFromAI("footer")),
    assertCondition("header opaque output is blocked", !canUseOpaqueGlobalSection("header")),
    assertCondition("footer opaque output is blocked", !canUseOpaqueGlobalSection("footer")),
    assertCondition("opaque header validation fails", !headerOpaque.valid),
    assertCondition("opaque footer validation fails", !footerOpaque.valid),
    assertCondition("policies require native builder structures", HEADER_FOOTER_EDITABLE_POLICY.every((policy) => policy.requiredModel === "native-builder-structure")),
  ],
});
