import { apiHandler } from "@/lib/api/apiHandler";
import { normalizeProjectPath, readProjectFile, writeProjectFile } from "@/modules/builder-v3/project-workspace";

type WriteFileRequest = {
  path?: unknown;
  content?: unknown;
  expectedRevision?: unknown;
};

function requestedPath(req: Request) {
  const path = new URL(req.url).searchParams.get("path");
  if (!path) throw new Error("Missing project file path");
  return normalizeProjectPath(path);
}

export const GET = apiHandler(
  async ({ auth, params, req }) => {
    const siteId = params?.siteId;
    if (!siteId) throw new Error("Missing siteId");

    const file = await readProjectFile(siteId, auth.tenant.id, requestedPath(req));
    return {
      version: 1,
      siteId,
      file: {
        path: file.path,
        content: file.content,
        contentHash: file.contentHash,
        revision: file.revision,
        updatedAt: file.updatedAt.toISOString(),
      },
    };
  },
  { requireTenant: true }
);

export const PUT = apiHandler(
  async ({ auth, params, req }) => {
    const siteId = params?.siteId;
    if (!siteId) throw new Error("Missing siteId");

    const body = (await req.json()) as WriteFileRequest;
    if (typeof body.path !== "string") throw new Error("Invalid project file path");
    if (typeof body.content !== "string") throw new Error("Invalid project file content");
    if (body.content.length > 2_000_000) throw new Error("Project file exceeds the 2 MB limit");

    const result = await writeProjectFile({
      siteId,
      tenantId: auth.tenant.id,
      userId: auth.user.id,
      path: normalizeProjectPath(body.path),
      content: body.content,
      expectedRevision:
        typeof body.expectedRevision === "number" ? body.expectedRevision : undefined,
    });

    return {
      version: 1,
      siteId,
      changed: result.changed,
      revision: result.revision,
      file: {
        path: result.file.path,
        contentHash: result.file.contentHash,
        revision: result.file.revision,
        updatedAt: result.file.updatedAt.toISOString(),
      },
    };
  },
  { requireTenant: true }
);
