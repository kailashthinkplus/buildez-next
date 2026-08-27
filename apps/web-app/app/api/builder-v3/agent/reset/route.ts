import { NextRequest } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { resetAgentConversation } from "@/modules/ai-v12";

export async function DELETE(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const siteId = typeof body.siteId === "string" ? body.siteId : "";
  if (!siteId) {
    return Response.json({ error: "Missing site." }, { status: 400 });
  }
  const result = await resetAgentConversation({
    tenantId: auth.tenant.id,
    siteId,
  });
  return Response.json({ data: result });
}
