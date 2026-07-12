from pathlib import Path
import shutil
import re

FILE = Path("apps/web-app/playwright/tests/builder/operations/scroll-targeting.spec.ts")

text = FILE.read_text()

backup = FILE.with_suffix(FILE.suffix + ".bak2")
shutil.copy2(FILE, backup)

# -------------------------------------------------
# Extract openBlocks helper
# -------------------------------------------------
m = re.search(
    r'async function openBlocks\(.*?\n\}',
    text,
    flags=re.S,
)

if not m:
    raise SystemExit("Could not locate openBlocks()")

helper = m.group(0)

# Remove helper from current location
text = text[:m.start()] + text[m.end():]

# -------------------------------------------------
# Insert helper after imports
# -------------------------------------------------
imports_end = 0
for m2 in re.finditer(r'^import .*?;\n', text, flags=re.M):
    imports_end = m2.end()

text = (
    text[:imports_end]
    + "\n"
    + helper
    + "\n\n"
    + text[imports_end:]
)

# -------------------------------------------------
# Ensure openBlocks is before drag
# -------------------------------------------------
pattern = re.compile(
    r'await dragPaletteWidgetInside\(page,\s*"heading",\s*target\);\s*'
    r'await openBlocks\(page\);',
    flags=re.S,
)

text = pattern.sub(
    'await openBlocks(page);\n\n    await dragPaletteWidgetInside(page, "heading", target);',
    text,
)

# -------------------------------------------------
# Remove accidental duplicate openBlocks
# -------------------------------------------------
text = re.sub(
    r'await openBlocks\(page\);\s*\n\s*await openBlocks\(page\);',
    'await openBlocks(page);',
    text,
)

FILE.write_text(text)

print("✓ scroll-targeting.spec.ts repaired")
print(f"✓ backup created: {backup}")
