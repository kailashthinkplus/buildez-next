import { assertCondition, assertEqual, createRegressionSpec } from "../helpers/testAssertions";
import { ElementMarketplaceRegistry } from "../../marketplace/ElementMarketplaceRegistry";

const catalog = ElementMarketplaceRegistry.getAll();
const byType = new Map(catalog.map((item) => [item.type, item]));

export const marketplaceLaunchGatesSpec = createRegressionSpec({
  id: "widgets/marketplace-launch-gates",
  title: "Marketplace launch claims and insertion gates",
  bugIds: ["BUG-0003", "BUG-0012"],
  level: "L1",
  status: "compile-safe",
  assertions: [
    assertEqual("core and complete premium catalog count remains explicit", catalog.length, 48),
    assertCondition(
      "every catalog item declares launch availability",
      catalog.every((item) => item.launchStatus === "available" || item.launchStatus === "preview")
    ),
    assertCondition("all curated catalog widgets are insertable", catalog.every((item) => item.launchStatus === "available")),
    assertCondition(
      "AI metadata does not imply insertion entitlement",
      catalog.every((item) => typeof item.ai.canGenerate === "boolean" && Boolean(item.launchStatus))
    ),
  ],
});
