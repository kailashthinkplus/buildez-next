import { apiHandler } from "@/lib/api/apiHandler";
import { startPreviewSession, stopPreviewSession } from "@/modules/builder-v3/preview";

export const POST = apiHandler(async ({ auth, req }) => {
  const body = (await req.json()) as Record<string, unknown>;
  if (typeof body.siteId !== "string") throw new Error("Missing siteId");
  const session = await startPreviewSession({ siteId: body.siteId, tenantId: auth.tenant.id, restart: body.restart === true });
  return { version: 1, sessionId: session.id, siteId: session.siteId, url: session.url };
}, { requireTenant: true });

export const DELETE = apiHandler(async ({ auth, req }) => {
  const body = (await req.json()) as Record<string, unknown>;
  if (typeof body.sessionId !== "string") throw new Error("Missing preview sessionId");
  return { version: 1, ...stopPreviewSession(body.sessionId, auth.tenant.id) };
}, { requireTenant: true });
