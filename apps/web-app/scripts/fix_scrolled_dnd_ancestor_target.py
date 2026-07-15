from datetime import datetime
from pathlib import Path
import shutil
import sys

path = Path("modules/builder-v2/workspace/BuilderShell.tsx")
source = path.read_text(encoding="utf-8")

timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = path.with_suffix(
    path.suffix + f".scroll-dnd-target-{timestamp}.bak"
)
shutil.copy2(path, backup)

old = '''        const nodeId = nodeEl.getAttribute("data-node-id");
        if (!nodeId) continue;
        if (dragId && nodeId === dragId) continue;
        if (draggedEl?.contains(nodeEl)) continue;
        return nodeEl;
'''

new = '''        const nodeId = nodeEl.getAttribute("data-node-id");
        if (!nodeId) continue;
        if (dragId && nodeId === dragId) continue;
        if (draggedEl?.contains(nodeEl)) continue;

        const nodeType =
          nodeEl.getAttribute("data-node-type");

        /*
         * During native drag autoscroll, elementsFromPoint can briefly
         * report a Section/Page ancestor even though the pointer remains
         * inside its rendered Container. Prefer the deepest compatible
         * layout descendant containing the pointer.
         */
        if (
          nodeType === "section" ||
          nodeType === "page"
        ) {
          const descendants = Array.from(
            nodeEl.querySelectorAll<HTMLElement>(
              "[data-node-id][data-node-type='container'], " +
                "[data-node-id][data-node-type='column']"
            )
          )
            .filter((candidate) => {
              const candidateId =
                candidate.getAttribute("data-node-id");

              if (!candidateId) return false;
              if (dragId && candidateId === dragId) {
                return false;
              }
              if (draggedEl?.contains(candidate)) {
                return false;
              }

              const rect =
                candidate.getBoundingClientRect();

              return (
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom
              );
            })
            .sort((left, right) => {
              const leftRect =
                left.getBoundingClientRect();
              const rightRect =
                right.getBoundingClientRect();

              /*
               * Smaller containing rectangles are normally deeper,
               * more specific drop targets.
               */
              return (
                leftRect.width * leftRect.height -
                rightRect.width * rightRect.height
              );
            });

          const preferred = descendants[0];

          if (preferred) {
            return preferred;
          }
        }

        return nodeEl;
'''

count = source.count(old)

if count != 1:
    sys.exit(
        "ERROR: Expected target-resolution block exactly once, "
        f"but found {count}.\\nBackup: {backup}"
    )

updated = source.replace(old, new, 1)
path.write_text(updated, encoding="utf-8")

print("✔ Added ancestor-to-container DnD target refinement")
print("✔ Native drag autoscroll can no longer prefer Section over its visible Container")
print(f"✔ Backup: {backup}")
print(f"✔ Updated: {path}")
