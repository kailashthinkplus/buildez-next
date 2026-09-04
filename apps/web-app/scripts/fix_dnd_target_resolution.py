from pathlib import Path
from datetime import datetime
import shutil
import sys

FILES = [
    Path("modules/builder-v2/workspace/BuilderShell.tsx"),
    Path("modules/builder-v2/canvas/BuilderCanvas.tsx"),
]

OLD = """        const nodeEl = hit.closest("[data-node-id]") as HTMLElement | null;
        if (!nodeEl) continue;
"""

NEW = """        const nodeEl =
          hit.hasAttribute("data-node-id")
            ? hit
            : null;

        if (!nodeEl) {
          continue;
        }
"""

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")

patched = []

for path in FILES:
    if not path.exists():
        print(f"Missing: {path}")
        continue

    source = path.read_text(encoding="utf-8")

    if NEW in source:
        print(f"Already patched: {path}")
        continue

    if OLD not in source:
        print(f"Pattern not found: {path}")
        continue

    backup = path.with_suffix(path.suffix + f".dnd-target-{stamp}.bak")
    shutil.copy2(path, backup)

    updated = source.replace(OLD, NEW, 1)
    path.write_text(updated, encoding="utf-8")

    patched.append((path, backup))

if not patched:
    sys.exit("Nothing patched.")

print()
for path, backup in patched:
    print("✔ Updated :", path)
    print("✔ Backup  :", backup)
