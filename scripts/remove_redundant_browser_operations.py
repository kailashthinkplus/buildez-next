#!/usr/bin/env python3

from pathlib import Path
import shutil

path = Path("/Users/kailash/buildez/scripts/builder_rc.py")
backup = path.with_suffix(".py.before-remove-browser-operations.bak")

if not path.exists():
    raise SystemExit(f"Missing file: {path}")

text = path.read_text(encoding="utf-8")
shutil.copy2(path, backup)

old = '''            "copy-paste", "journeys", "browser-operations",
            "full-builder", "cleanup", "scoped-diff-check",
'''

new = '''            "copy-paste", "journeys",
            "full-builder", "cleanup", "scoped-diff-check",
'''

if old not in text:
    raise SystemExit(
        "Could not find the full-rc-t3 browser-operations sequence. "
        "No changes were made."
    )

text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")

print(f"✓ Updated: {path}")
print(f"✓ Backup:  {backup}")
print("✓ Removed redundant browser-operations rerun from full-rc-t3")
