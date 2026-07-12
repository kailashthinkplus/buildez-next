#!/usr/bin/env python3

from pathlib import Path
import shutil
import sys

path = Path(
    "/Users/kailash/buildez/"
    "apps/web-app/playwright/tests/builder/operations/"
    "scroll-targeting.spec.ts"
)

if not path.exists():
    raise SystemExit(f"File not found: {path}")

text = path.read_text(encoding="utf-8")
backup = path.with_suffix(".ts.open-order.bak")
shutil.copy2(path, backup)

# Remove every existing invocation, but preserve the helper definition.
invocation = "    await openBlocks(page);\n"
count = text.count(invocation)

if count == 0:
    raise SystemExit(
        "No indented await openBlocks(page) invocation found. "
        "No changes made."
    )

text = text.replace(invocation, "")

marker = "    await openDisposableBuilder(page, fixture);\n"

if text.count(marker) != 1:
    raise SystemExit(
        f"Expected exactly one openDisposableBuilder marker, "
        f"found {text.count(marker)}. No changes made."
    )

replacement = (
    "    await openDisposableBuilder(page, fixture);\n"
    "    await openBlocks(page);\n"
)

text = text.replace(marker, replacement, 1)

path.write_text(text, encoding="utf-8")

print("✓ Moved openBlocks before canvas measurement and scrolling")
print(f"✓ Removed {count} old invocation(s)")
print(f"✓ Backup: {backup}")
