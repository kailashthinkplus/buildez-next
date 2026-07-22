import { createInvalidParentLinkBlueprint, createPrimitiveBlueprint } from "../fixtures/testBlueprintFixtures";
import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import {
  roundTripBlueprintForSpec,
  validateBlueprintShapeForSpec,
} from "../helpers/testSerializationHarness";
import { deserializeBlueprint, serializeBlueprint } from "../../core/serialization";

const original = createPrimitiveBlueprint();
const serialized = serializeBlueprint(original);
const reloaded = roundTripBlueprintForSpec(original);
const validation = validateBlueprintShapeForSpec(reloaded);
const invalidSerialized = serializeBlueprint(createInvalidParentLinkBlueprint());
const invalidDeserialize = deserializeBlueprint(JSON.stringify(createInvalidParentLinkBlueprint()));

export const saveReloadRoundtripSpec = createRegressionSpec({
  id: "serialization/save-reload-roundtrip",
  title: "Save and reload round-trip contract",
  bugIds: ["BUG-0025", "BUG-0037"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Replace JSON round-trip with API-backed save/reload integration once a runner exists.",
  assertions: [
    assertCondition("valid blueprint serializes", serialized.ok),
    assertCondition("invalid blueprint serialization is rejected", !invalidSerialized.ok),
    assertCondition("invalid blueprint deserialization is rejected", !invalidDeserialize.ok),
    assertCondition("round-tripped blueprint remains valid", validation.valid),
    assertEqual("root id survives round trip", reloaded.root, original.root),
    assertEqual(
      "node count survives round trip",
      Object.keys(reloaded.nodes).length,
      Object.keys(original.nodes).length
    ),
  ],
});
