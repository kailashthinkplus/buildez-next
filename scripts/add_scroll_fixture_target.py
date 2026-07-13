#!/usr/bin/env python3

from pathlib import Path
import shutil

root = Path("/Users/kailash/buildez")

fixture_file = root / (
    "apps/web-app/playwright/helpers/builderFixture.ts"
)
spec_file = root / (
    "apps/web-app/playwright/tests/builder/operations/"
    "scroll-targeting.spec.ts"
)

for path in (fixture_file, spec_file):
    if not path.exists():
        raise SystemExit(f"File not found: {path}")

shutil.copy2(
    fixture_file,
    fixture_file.with_suffix(".ts.scroll-fixture.bak"),
)
shutil.copy2(
    spec_file,
    spec_file.with_suffix(".ts.scroll-fixture.bak"),
)

fixture = fixture_file.read_text(encoding="utf-8")
spec = spec_file.read_text(encoding="utf-8")

# ------------------------------------------------------------
# 1. Add a dedicated scroll-target ID.
# ------------------------------------------------------------

id_marker = '''  textC: "rc-t3b-text-c",
} as const;'''

id_replacement = '''  textC: "rc-t3b-text-c",
  scrollTarget: "rc-t3b-scroll-target",
} as const;'''

if id_marker in fixture:
    fixture = fixture.replace(
        id_marker,
        id_replacement,
        1,
    )
elif 'scrollTarget: "rc-t3b-scroll-target"' not in fixture:
    raise SystemExit(
        "Could not add FIXTURE_IDS.scrollTarget."
    )

# ------------------------------------------------------------
# 2. Add a dedicated scroll fixture factory.
# ------------------------------------------------------------

factory_marker = (
    "export async function createDisposableBuilderPage"
)

scroll_factory = r'''
export function createScrollOperationFixtureBlueprint() {
  const blueprint: any = createOperationFixtureBlueprint();

  blueprint.nodes[FIXTURE_IDS.scrollTarget] = {
    id: FIXTURE_IDS.scrollTarget,
    type: "container",
    parentId: FIXTURE_IDS.containerC,
    children: [],
    props: {
      layout: "flex",
      direction: "column",
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      minHeight: 260,
      padding: 48,
      marginTop: 40,
    },
    locked: false,
    hidden: false,
  };

  blueprint.nodes[FIXTURE_IDS.containerC].children = [
    ...blueprint.nodes[FIXTURE_IDS.containerC].children,
    FIXTURE_IDS.scrollTarget,
  ];

  return blueprint;
}

export async function resetDisposableBuilderPageWithBlueprint(
  request: APIRequestContext,
  pageId: string,
  blueprint: unknown,
) {
  const response = await request.post(
    `/api/builder-v2/blueprints/${pageId}`,
    {
      data: { blueprint },
    },
  );

  expect(
    response.ok(),
    await response.text(),
  ).toBeTruthy();
}

'''

if "createScrollOperationFixtureBlueprint" not in fixture:
    index = fixture.find(factory_marker)

    if index == -1:
        raise SystemExit(
            "Could not locate fixture factory insertion point."
        )

    fixture = (
        fixture[:index]
        + scroll_factory
        + fixture[index:]
    )

# ------------------------------------------------------------
# 3. Update scroll-spec imports.
# ------------------------------------------------------------

old_import_segment = '''  createDisposableBuilderPage,
  deleteDisposableBuilderPage,
  openDisposableBuilder,
  readDisposableBlueprint,
} from "../../../helpers/builderFixture";'''

new_import_segment = '''  createDisposableBuilderPage,
  createScrollOperationFixtureBlueprint,
  deleteDisposableBuilderPage,
  openDisposableBuilder,
  readDisposableBlueprint,
  resetDisposableBuilderPageWithBlueprint,
} from "../../../helpers/builderFixture";'''

if old_import_segment in spec:
    spec = spec.replace(
        old_import_segment,
        new_import_segment,
        1,
    )
elif "createScrollOperationFixtureBlueprint" not in spec:
    raise SystemExit(
        "Could not update scroll fixture imports."
    )

# ------------------------------------------------------------
# 4. Reset the disposable page with the special scroll fixture.
# ------------------------------------------------------------

create_marker = '''    const fixture = await createDisposableBuilderPage(page.request);
    disposablePageId = fixture.id;

    const initialBlueprint = await readDisposableBlueprint('''

create_replacement = '''    const fixture = await createDisposableBuilderPage(page.request);
    disposablePageId = fixture.id;

    await resetDisposableBuilderPageWithBlueprint(
      page.request,
      fixture.id,
      createScrollOperationFixtureBlueprint(),
    );

    const initialBlueprint = await readDisposableBlueprint('''

if create_marker in spec:
    spec = spec.replace(
        create_marker,
        create_replacement,
        1,
    )
elif "createScrollOperationFixtureBlueprint()" not in spec:
    raise SystemExit(
        "Could not insert scroll fixture reset."
    )

# ------------------------------------------------------------
# 5. Replace nested-target references in this test only.
# ------------------------------------------------------------

spec = spec.replace(
    "initialBlueprint.nodes[FIXTURE_IDS.nested].children",
    "initialBlueprint.nodes[FIXTURE_IDS.scrollTarget].children",
)

spec = spec.replace(
    '''expect(initialNestedChildren).toEqual([
      FIXTURE_IDS.textC,
    ]);''',
    "expect(initialNestedChildren).toEqual([]);",
)

spec = spec.replace(
    "const target = builderNode(page, FIXTURE_IDS.nested);",
    "const target = builderNode(page, FIXTURE_IDS.scrollTarget);",
)

spec = spec.replace(
    "${FIXTURE_IDS.nested}",
    "${FIXTURE_IDS.scrollTarget}",
)

spec = spec.replace(
    "FIXTURE_IDS.nested,",
    "FIXTURE_IDS.scrollTarget,",
)

spec = spec.replace(
    "persisted.nodes[FIXTURE_IDS.nested].children",
    "persisted.nodes[FIXTURE_IDS.scrollTarget].children",
)

spec = spec.replace(
    "reloadedBlueprint.nodes[FIXTURE_IDS.nested].children",
    "reloadedBlueprint.nodes[FIXTURE_IDS.scrollTarget].children",
)

fixture_file.write_text(fixture, encoding="utf-8")
spec_file.write_text(spec, encoding="utf-8")

print("✓ Added dedicated empty scroll-target Container")
print("✓ Scroll fixture remains isolated from normal RC fixtures")
print("✓ Updated scroll test to target the exposed Container")
print("✓ No production Builder code was modified")
