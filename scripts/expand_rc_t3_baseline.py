#!/usr/bin/env python3

from pathlib import Path
import shutil

path = Path("/Users/kailash/buildez/scripts/builder_rc.py")

if not path.exists():
    raise SystemExit(f"Missing file: {path}")

text = path.read_text(encoding="utf-8")
backup = path.with_suffix(".py.before-expanded-baseline.bak")

if not backup.exists():
    shutil.copy2(path, backup)

old = '''        commands=(
            "cleanup", "typecheck", "rc-t3-node", "operations-node",
            "invalid-dnd", "dnd", "palette", "reorder", "keyboard",
            "scoped-diff-check",
        ),'''

new = '''        commands=(
            "cleanup", "typecheck", "rc-t3-node", "operations-node",
            "invalid-dnd", "dnd", "palette", "reorder", "keyboard",
            "scroll", "zoom", "responsive", "persistence",
            "scoped-diff-check",
        ),'''

if old not in text:
    if new in text:
        print("✓ Baseline already includes the expanded RC-T3 gates")
        raise SystemExit(0)

    raise SystemExit(
        "Expected baseline command block was not found. No file changed."
    )

path.write_text(text.replace(old, new, 1), encoding="utf-8")

print("✓ Expanded baseline with:")
print("  - scroll")
print("  - zoom")
print("  - responsive")
print("  - persistence")
print(f"✓ Backup: {backup}")
