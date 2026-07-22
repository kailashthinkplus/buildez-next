import assert from "node:assert/strict";
import test from "node:test";
import { normalizeContextForm } from "../../ai-v9/context/brandContext";

test("AI context removes repeated historical directions and stack-trace URLs", () => {
  const context = normalizeContextForm({
    designIntent: "Editorial; Book consultation; Editorial; Cinematic tour; Editorial; Completed projects",
    websiteUrl: "https://AiConversation.run",
  });
  assert.equal(context.designIntent, "Cinematic tour; Editorial; Completed projects");
  assert.equal(context.websiteUrl, undefined);
});
