import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { hydrateBlueprintImages } from "@/modules/builder/ai/blueprint/blueprintPostProcess";
import { prisma } from "@buildez/db";

export async function POST(req: Request) {
  const session = await getSession();

  if (!session?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId, blueprint } = await req.json();

  if (!pageId || !blueprint) {
    return NextResponse.json(
      { error: "pageId and blueprint required" },
      { status: 400 }
    );
  }

  const updatedBlueprint = await hydrateBlueprintImages(blueprint);

  await prisma.aIBlueprintSnapshot.create({
    data: {
      tenantId: session.tenantId,
      siteId: blueprint.siteId,
      pageId,
      blueprint: updatedBlueprint,
    },
  });

  return NextResponse.json({
    blueprint: updatedBlueprint,
  });
}
