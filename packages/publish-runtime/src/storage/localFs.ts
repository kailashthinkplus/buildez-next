import fs from "fs/promises";
import path from "path";
import {
  RuntimeStorageAdapter,
} from "./adapter";
import {
  RuntimeWriteInput,
  RuntimeReadInput,
} from "./types";

const BASE_PATH =
  process.env.BUILDEZ_RUNTIME_PATH ||
  path.join(process.cwd(), ".runtime");

export class LocalFsRuntimeAdapter
  implements RuntimeStorageAdapter
{
  async writeSiteSnapshot(input: RuntimeWriteInput) {
    const baseDir = path.join(
      BASE_PATH,
      "sites",
      input.siteId,
      "snapshots",
      input.snapshotId
    );

    await fs.mkdir(baseDir, { recursive: true });

    await Promise.all(
      input.pages.map(async (page) => {
        const filePath = path.join(
          baseDir,
          `${page.slug || "index"}.html`
        );

        await fs.writeFile(filePath, page.html, "utf8");
      })
    );
  }

  async readPage(input: RuntimeReadInput) {
    const siteDir = path.join(
      BASE_PATH,
      "sites",
      input.siteId,
      "current"
    );

    const filePath = path.join(
      siteDir,
      `${input.slug || "index"}.html`
    );

    try {
      const html = await fs.readFile(filePath, "utf8");

      return {
        html,
        contentHash: "", // optional in FS mode
      };
    } catch {
      return null;
    }
  }
}
