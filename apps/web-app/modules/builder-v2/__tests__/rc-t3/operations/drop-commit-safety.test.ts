import { canCommitDrop, type DropCommitCandidate } from "../../../core/dnd/dropCommitSafety";
import { assertCondition, createRegressionSpec } from "../../helpers/testAssertions";

const valid: DropCommitCandidate = {
  activeId: "button-a",
  payloadId: "button-a",
  cancelled: false,
  committed: false,
  overChrome: false,
  overDraggedSubtree: false,
  pendingOverId: "container-b",
  currentOverId: "container-b",
  pendingIntent: "inside",
  currentIntent: "inside",
  pendingParentId: "container-b",
  currentParentId: "container-b",
};

export const dropCommitSafetySpec = createRegressionSpec({
  id: "rc-t3/operations/drop-commit-safety",
  title: "Native DnD commits only one current validated target",
  bugIds: ["BRC-0018"],
  level: "L1",
  status: "compile-safe",
  runnerRequirement: "Node",
  assertions: [
    assertCondition("current valid drop commits", canCommitDrop(valid)),
    assertCondition("cancelled drop cannot commit", !canCommitDrop({ ...valid, cancelled: true })),
    assertCondition("consumed token cannot commit twice", !canCommitDrop({ ...valid, committed: true })),
    assertCondition("inactive drag cannot commit", !canCommitDrop({ ...valid, activeId: null })),
    assertCondition("stale over target cannot commit", !canCommitDrop({ ...valid, currentOverId: "section-a" })),
    assertCondition("stale intent cannot commit", !canCommitDrop({ ...valid, currentIntent: "after" })),
    assertCondition("payload mismatch cannot commit", !canCommitDrop({ ...valid, payloadId: "other" })),
    assertCondition("Builder chrome cannot commit", !canCommitDrop({ ...valid, overChrome: true })),
    assertCondition("self or descendant pointer cannot commit", !canCommitDrop({ ...valid, overDraggedSubtree: true })),
  ],
});
