#!/usr/bin/env python3

from pathlib import Path
import shutil

path = Path(
    "/Users/kailash/buildez/"
    "apps/web-app/playwright/tests/builder/operations/"
    "scroll-targeting.spec.ts"
)

if not path.exists():
    raise SystemExit(f"File not found: {path}")

text = path.read_text(encoding="utf-8")
backup = path.with_suffix(".ts.container-c-target.bak")
shutil.copy2(path, backup)

replacements = {
    # Initial persisted-state inspection.
    "initialBlueprint.nodes[FIXTURE_IDS.scrollTarget].children":
        "initialBlueprint.nodes[FIXTURE_IDS.containerC].children",

    # The special fixture contains both the original nested container
    # and the empty scroll target beneath Container C.
    "expect(initialNestedChildren).toEqual([]);":
        """expect(initialNestedChildren).toEqual([
      FIXTURE_IDS.nested,
      FIXTURE_IDS.scrollTarget,
    ]);""",

    # Actual lower-page production drop surface.
    "const target = builderNode(page, FIXTURE_IDS.scrollTarget);":
        "const target = builderNode(page, FIXTURE_IDS.containerC);",

    # Direct-child DOM queries.
    "${FIXTURE_IDS.scrollTarget}":
        "${FIXTURE_IDS.containerC}",

    # Parent assertions.
    """      FIXTURE_IDS.scrollTarget,
    );""":
        """      FIXTURE_IDS.containerC,
    );""",

    # Persisted child-list assertions.
    "persisted.nodes[FIXTURE_IDS.scrollTarget].children":
        "persisted.nodes[FIXTURE_IDS.containerC].children",

    "reloadedBlueprint.nodes[FIXTURE_IDS.scrollTarget].children":
        "reloadedBlueprint.nodes[FIXTURE_IDS.containerC].children",
}

changed = []

for old, new in replacements.items():
    if old in text:
        count = text.count(old)
        text = text.replace(old, new)
        changed.append((old, count))
    else:
        print(f"NOTE: pattern not found, possibly already updated:\n  {old}")

if "const target = builderNode(page, FIXTURE_IDS.containerC);" not in text:
    raise SystemExit(
        "Container C target was not established. No file was written."
    )

if "initialBlueprint.nodes[FIXTURE_IDS.containerC].children" not in text:
    raise SystemExit(
        "Initial Container C child assertion was not established."
    )

path.write_text(text, encoding="utf-8")

print("✓ Scroll certification now targets lower-page Container C")
print("✓ Dedicated scroll fixture still provides extra lower-page height")
print("✓ Production Builder code was not modified")
print(f"✓ Backup: {backup}")
print()
print("Replacement counts:")
for pattern, count in changed:
    print(f"  {count} × {pattern[:70]}")
