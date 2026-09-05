import { constants } from "node:fs";
import { access, chmod, copyFile } from "node:fs/promises";
import path from "node:path";

/** Installed dependencies can be root-owned and non-executable when install scripts are disabled. */
export async function executableBinary(source: string, privateWorkDir: string): Promise<string> {
  try {
    await access(source, constants.X_OK);
    return source;
  } catch {
    // Use the extraction's private temp directory; never chmod root-owned packages
    // or share a writable executable between concurrent tenants.
    const target = path.join(privateWorkDir, path.basename(source));
    await copyFile(source, target, constants.COPYFILE_EXCL);
    await chmod(target, 0o700);
    return target;
  }
}
