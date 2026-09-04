from pathlib import Path
from datetime import datetime
import shutil
import re
import sys

FILES = [
    Path("modules/builder-v2/workspace/BuilderShell.tsx"),
    Path("modules/builder-v2/canvas/BuilderCanvas.tsx"),
]

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
changed = []

for path in FILES:
    if not path.exists():
        print(f"SKIP missing: {path}")
        continue

    source = path.read_text(encoding="utf-8")
    original = source

    backup = path.with_suffix(
        path.suffix + f".deepest-dnd-target-{stamp}.bak"
    )
    shutil.copy2(path, backup)

    # Locate a function that resolves a target using elementsFromPoint().
    function_pattern = re.compile(
        r"""
        (?P<header>
          (?:function|const)\s+
          (?P<name>
            findTargetNodeElement|
            resolveTargetNodeElement|
            findDropTargetElement
          )
          [\s\S]*?
          \{
        )
        (?P<body>
          [\s\S]*?
          document\.elementsFromPoint\([\s\S]*?
        )
        (?P<footer>
          \n\}
        )
        """,
        re.VERBOSE,
    )

    match = function_pattern.search(source)

    if not match:
        print(f"SKIP resolver function not found: {path}")
        continue

    function_text = match.group(0)

    # Find the variable names passed to elementsFromPoint().
    point_match = re.search(
        r"document\.elementsFromPoint\(\s*([^,]+),\s*([^)]+)\)",
        function_text,
    )

    if not point_match:
        print(f"SKIP elementsFromPoint coordinates not found: {path}")
        continue

    x_expr = point_match.group(1).strip()
    y_expr = point_match.group(2).strip()

    # Preserve the function header/signature and replace only its body.
    header_end = function_text.find("{") + 1
    function_header = function_text[:header_end]

    new_function = f"""{function_header}
  const elements = document.elementsFromPoint(
    {x_expr},
    {y_expr}
  );

  /*
   * elementsFromPoint() is ordered by visual stacking, not Builder
   * hierarchy depth. A Section background can therefore appear before
   * its nested Container.
   *
   * Collect every Builder node represented by the hit stack, including
   * the nearest Builder ancestor of child content, then choose the
   * deepest DOM node. This makes nested Containers win over Sections
   * without relying on z-index or paint order.
   */
  const candidates: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();

  for (const element of elements) {{
    const nodeElement =
      element instanceof HTMLElement
        ? element.closest<HTMLElement>("[data-node-id]")
        : null;

    if (!nodeElement || seen.has(nodeElement)) {{
      continue;
    }}

    seen.add(nodeElement);
    candidates.push(nodeElement);
  }}

  if (candidates.length === 0) {{
    return null;
  }}

  const depth = (element: HTMLElement): number => {{
    let current: HTMLElement | null = element;
    let value = 0;

    while (current) {{
      value += 1;
      current = current.parentElement;
    }}

    return value;
  }};

  candidates.sort(
    (left, right) => depth(right) - depth(left)
  );

  return candidates[0] ?? null;
}}"""

    source = source.replace(function_text, new_function, 1)

    if source == original:
        print(f"SKIP no change: {path}")
        continue

    path.write_text(source, encoding="utf-8")
    changed.append(path)

    print(f"✔ Updated: {path}")
    print(f"✔ Backup:  {backup}")

if not changed:
    sys.exit(
        "\nERROR: No resolver function was patched.\n"
        "The function name or structure differs from the expected form."
    )

print("\n✔ Deepest nested Builder node is now preferred for DnD targeting.")
