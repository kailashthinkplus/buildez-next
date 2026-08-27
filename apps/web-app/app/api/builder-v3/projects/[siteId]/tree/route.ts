import { apiHandler } from "@/lib/api/apiHandler";
import {
  getOrCreateProject,
  listProjectFiles,
  readProjectFile,
} from "@/modules/builder-v3/project-workspace";

export const GET = apiHandler(
  async ({ auth, params }) => {
    const siteId = params?.siteId;
    if (!siteId) throw new Error("Missing siteId");

    const project = await getOrCreateProject(siteId, auth.tenant.id);
    const files = await listProjectFiles(siteId, auth.tenant.id);

    let pageManifest: unknown = null;

    if (files.some((file) => file.path === "src/buildez.pages.json")) {
      try {
        const manifestFile = await readProjectFile(
          siteId,
          auth.tenant.id,
          "src/buildez.pages.json"
        );

        pageManifest = JSON.parse(manifestFile.content);
      } catch {
        pageManifest = null;
      }
    }

    return {
      version: 1,
      siteId,
      projectId: project.id,
      revision: project.currentRevision,
      pageManifest,
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
