#!/usr/bin/env python3

from pathlib import Path
import shutil
import re
import sys

ROOT = Path("/Users/kailash/buildez")

FILE = ROOT / "apps/web-app/playwright/tests/builder/operations/scroll-targeting.spec.ts"

if not FILE.exists():
    print("File not found:", FILE)
    sys.exit(1)

backup = FILE.with_suffix(FILE.suffix + ".bak")
shutil.copy2(FILE, backup)

text = FILE.read_text()

helper = """
async function openBlocks(page: Parameters<typeof openDisposableBuilder>[0]) {
  await page.getByRole("button", { name: "Blocks" }).click();
  await expect(page.getByTestId("palette-widget-heading")).toBeVisible();
}
"""

# ------------------------------------------------------------------
# insert helper if missing
# ------------------------------------------------------------------

if "async function openBlocks(" not in text:

    marker = "test.afterEach(async () => {"

    idx = text.find(marker)

    if idx == -1:
        print("Couldn't locate insertion point.")
        sys.exit(1)

    end = text.find("});", idx)

    if end == -1:
        print("Couldn't locate end of afterEach.")
        sys.exit(1)

    end += 3

    text = text[:end] + "\n\n" + helper + "\n" + text[end:]

# ------------------------------------------------------------------
# insert openBlocks before first dragPaletteWidgetInside
# ------------------------------------------------------------------

pattern = r"(\s*)await\s+dragPaletteWidgetInside\("

m = re.search(pattern, text)

if not m:
    print("dragPaletteWidgetInside() not found.")
    sys.exit(1)

indent = m.group(1)

insert = f"{indent}await openBlocks(page);\n"

line_start = text.rfind("\n", 0, m.start()) + 1

previous = text[max(0, line_start - 120):line_start]

if "await openBlocks(page);" not in previous:
    text = text[:line_start] + insert + text[line_start:]

FILE.write_text(text)

print()
print("✓ scroll-targeting.spec.ts updated")
print("✓ backup:", backup)
