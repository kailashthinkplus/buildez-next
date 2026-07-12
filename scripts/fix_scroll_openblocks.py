#!/usr/bin/env python3

from pathlib import Path
import shutil
import re
import sys

FILE = Path(
    "/Users/kailash/buildez/apps/web-app/playwright/tests/builder/operations/scroll-targeting.spec.ts"
)

if not FILE.exists():
    print("File not found.")
    sys.exit(1)

backup = FILE.with_suffix(".ts.fix2.bak")
shutil.copy2(FILE, backup)

text = FILE.read_text()

# Remove every previous insertion
text = text.replace("\n    await openBlocks(page);\n", "\n")
text = text.replace("\nawait openBlocks(page);\n", "\n")

marker = "const childrenAfter = await page"

idx = text.find(marker)

if idx == -1:
    print("Couldn't find childrenAfter marker.")
    sys.exit(1)

before = text[:idx]
after = text[idx:]

semicolon = before.rfind(");")

if semicolon == -1:
    print("Couldn't find end of childrenBefore statement.")
    sys.exit(1)

insert_pos = semicolon + 2

before = (
    before[:insert_pos]
    + "\n\n    await openBlocks(page);\n"
    + before[insert_pos:]
)

FILE.write_text(before + after)

print("✓ Fixed scroll-targeting.spec.ts")
print("✓ Backup:", backup)
