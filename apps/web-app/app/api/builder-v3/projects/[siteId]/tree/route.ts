import { apiHandler } from "@/lib/api/apiHandler";
import { getOrCreateProject, listProjectFiles } from "@/modules/builder-v3/project-workspace";

export const GET = apiHandler(
  async ({ auth, params }) => {
    const siteId = params?.siteId;
    if (!siteId) throw new Error("Missing siteId");

    const project = await getOrCreateProject(siteId, auth.tenant.id);
    const files = await listProjectFiles(siteId, auth.tenant.id);

    return {
      version: 1,
      siteId,
      projectId: project.id,
      revision: project.currentRevision,
      files: files.map((file) => ({
        path: file.path,
        contentHash: file.contentHash,
        revision: file.revision,
        updatedAt: file.updatedAt.toISOString(),
      })),
    };
  },
  { requireTenant: true }
);
