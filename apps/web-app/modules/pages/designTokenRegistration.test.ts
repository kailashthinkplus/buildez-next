import assert from "node:assert/strict";
import test from "node:test";
import {
  DORMANT_DESIGN_TOKENS_KEY,
  archiveDesignTokens,
  restoreDesignTokens,
} from "./designTokenRegistration";

test("archives and restores the exact design token registration", () => {
  const tokens = {
    colors: { primary: "#102030" },
    typography: { heading: "Inter" },
  };
  const archived = archiveDesignTokens({ locale: "en" }, tokens);

  assert.deepEqual(archived, {
    locale: "en",
    [DORMANT_DESIGN_TOKENS_KEY]: tokens,
  });
  assert.deepEqual(restoreDesignTokens(archived), {
    designTokens: tokens,
    settings: { locale: "en" },
  });
});

test("does not create a dormant registration when no tokens exist", () => {
  const archived = archiveDesignTokens({ locale: "en" }, null);

  assert.deepEqual(archived, { locale: "en" });
  assert.deepEqual(restoreDesignTokens(archived), {
    designTokens: null,
    settings: { locale: "en" },
  });
});

test("removes an empty dormant-only settings record after restoration", () => {
  const tokens = { colors: { primary: "#ffffff" } };

  assert.deepEqual(
    restoreDesignTokens({ [DORMANT_DESIGN_TOKENS_KEY]: tokens }),
    { designTokens: tokens, settings: null },
  );
});
