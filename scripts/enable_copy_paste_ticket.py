#!/usr/bin/env python3

import json
from pathlib import Path

ROOT = Path("/Users/kailash/buildez")
PACKAGE = ROOT / "apps/web-app/package.json"
SPEC = (
    ROOT
    / "apps/web-app/playwright/tests/builder/operations/persistence-matrix.spec.ts"
)

# Add the dedicated package script.
package = json.loads(PACKAGE.read_text(encoding="utf-8"))
scripts = package.setdefault("scripts", {})

scripts["test:builder:browser:operations:copy-paste"] = (
    "playwright test --project=builder-chromium --grep @copy-paste"
)

PACKAGE.write_text(
    json.dumps(package, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
)

# Make the existing same-parent clipboard test part of both matrices.
text = SPEC.read_text(encoding="utf-8")

old = (
    '"@operations @persistence copy paste creates one independent '
    'node and survives reload"'
)
new = (
    '"@operations @persistence @copy-paste copy paste creates one '
    'independent node and survives reload"'
)

if old in text:
    text = text.replace(old, new, 1)
elif new not in text:
    raise SystemExit("Could not find the copy/paste test title.")

SPEC.write_text(text, encoding="utf-8")

print("✓ Added copy-paste package script")
print("✓ Tagged existing same-parent copy/paste browser test")
